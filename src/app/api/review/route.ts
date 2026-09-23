import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MASTER_PROMPT } from '@/lib/coachPrompt';
import { decideSupervisorAction } from '@/lib/fitkSupervisor';
import OpenAI from 'openai';

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY!,
});

const REVIEW_INTERVAL_DAYS = 28; // ~4 semanas entre revisiones

// GET → ¿toca revisión? + fecha de la última
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ due: false });

    const [{ data: lastReview }, { data: onboarding }] = await Promise.all([
      supabase.from('user_reviews').select('created_at').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1),
      supabase.from('user_onboarding').select('created_at').eq('user_id', user.id).single(),
    ]);

    if (!onboarding) return NextResponse.json({ due: false });

    const reference = lastReview?.[0]?.created_at ?? onboarding.created_at;
    const daysSince = (Date.now() - new Date(reference).getTime()) / 86400000;

    return NextResponse.json({
      due: daysSince >= REVIEW_INTERVAL_DAYS,
      lastReviewAt: lastReview?.[0]?.created_at ?? null,
    });
  } catch (err) {
    console.error('[review GET]', err);
    return NextResponse.json({ due: false });
  }
}

interface ReviewAnswers {
  goal: 'same' | 'change';
  newGoal?: string;
  weight?: number;
  measurements?: { waist?: number; chest?: number; arms?: number; thighs?: number; calves?: number };
  strength: string;
  energy: string;
  recovery: string;
  sleep: string;
  stress: string;
  motivation: string;
  availability: 'same' | 'change';
  newDaysPerWeek?: number;
  discomfort?: string;
}

// POST → guarda la revisión, ejecuta el Motor y devuelve decisión + evolución
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const answers = await req.json() as ReviewAnswers;

    // ── Contexto que la app SÍ conoce ────────────────────────────────
    const [{ data: profile }, { data: onboarding }, { data: sessions }, { data: history }, { data: prevReview }, { data: lastMeasurements }, safetyEventsResult] = await Promise.all([
      supabase.from('user_profiles').select('name, weight').eq('id', user.id).single(),
      supabase.from('user_onboarding').select('*').eq('user_id', user.id).single(),
      supabase.from('weekly_sessions').select('status').eq('user_id', user.id),
      supabase.from('weekly_history').select('week_number, sessions').eq('user_id', user.id),
      supabase.from('user_reviews').select('weight, created_at').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1),
      supabase.from('body_measurements').select('weight, recorded_at').eq('user_id', user.id)
        .order('recorded_at', { ascending: false }).limit(1),
      // Best-effort: la tabla safety_events puede no existir aún (falta
      // scripts/setup-safety-events.sql) — si falla (error), se trata como "sin eventos".
      supabase.from('safety_events').select('id').eq('user_id', user.id).is('reviewed_at', null),
    ]);
    const pendingSafetyEvents = safetyEventsResult.error ? 0 : (safetyEventsResult.data?.length ?? 0);

    // Estadísticas de asistencia (historial archivado + semana en curso)
    let planned = sessions?.length ?? 0;
    let completed = sessions?.filter(s => s.status === 'completed').length ?? 0;
    for (const w of history ?? []) {
      const ss = (w.sessions as { status?: string }[] | null) ?? [];
      planned += ss.length;
      completed += ss.filter(s => s.status === 'completed').length;
    }
    const attendancePct = planned > 0 ? Math.round((completed / planned) * 100) : 0;

    const prevWeight = prevReview?.[0]?.weight
      ?? lastMeasurements?.[0]?.weight
      ?? profile?.weight
      ?? null;

    // ── Supervisor Fit-K: decisión DETERMINISTA (fitkSupervisor.ts) ──
    // ARCH-COACH-001 / GUARD-ARCH-001 🔒 — el Motor decide, el Coach solo
    // acompaña. Groq ya NO elige la acción: solo redacta el mensaje a
    // partir de la acción y los motivos que decidió el Supervisor.
    const { action: motorAction, reasons: motorReasons } = decideSupervisorAction({
      attendancePct,
      plannedSessions: planned,
      goalChanged: answers.goal === 'change',
      availabilityChanged: answers.availability === 'change',
      hasDiscomfort: !!answers.discomfort?.trim(),
      pendingSafetyEvents,
      strength: answers.strength,
      energy: answers.energy,
      recovery: answers.recovery,
      sleep: answers.sleep,
      stress: answers.stress,
      motivation: answers.motivation,
    });

    const copyPrompt = `${MASTER_PROMPT}

Actúas ahora como el COACH FIT-K redactando el mensaje de la revisión periódica de ${profile?.name ?? 'el usuario'} (cada 4-6 semanas). El MOTOR ya decidió la acción — tu única tarea es explicarla con cercanía, NUNCA elegir ni cambiar la acción.

ACCIÓN YA DECIDIDA POR EL MOTOR (no la cuestiones, no la cambies): "${motorAction}"
MOTIVOS internos del Motor: ${motorReasons.join(', ')}

DATOS QUE LA APP CONOCE:
- Objetivo actual: ${onboarding?.beginner_goal ?? onboarding?.advanced_goal ?? 'desconocido'}
- Sesiones planificadas (histórico): ${planned} | Completadas: ${completed} | Asistencia: ${attendancePct}%
- Peso anterior registrado: ${prevWeight ?? 'sin datos'} kg | Peso actual: ${answers.weight ?? 'no indicado'} kg

RESPUESTAS DE LA REVISIÓN:
- Fuerza: ${answers.strength} | Energía: ${answers.energy} | Recuperación: ${answers.recovery} | Sueño: ${answers.sleep} | Estrés: ${answers.stress} | Motivación: ${answers.motivation}
- Molestias o lesiones: ${answers.discomfort?.trim() || 'ninguna'}

INSTRUCCIONES:
- Escribe el mensaje al usuario: cercano, sin alarmismo, sin culpa, reforzando el acompañamiento. 2-4 frases, texto plano sin Markdown.
- Explica qué se mantiene o se ajusta y por qué (usa los motivos, en lenguaje natural), y cuál es el siguiente paso.
- Si la acción es "cambiar_ejercicio" por molestias, recomienda consultar a un profesional sanitario si persiste, SIN diagnosticar.

Responde SOLO con un JSON válido, sin nada más:
{"message": "..."}`;

    let coachMessage = 'Todo apunta a que el plan sigue funcionando bien, así que lo mantenemos tal cual. Sigue a tu ritmo y nos vemos en la próxima revisión.';
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: copyPrompt }],
        max_tokens: 300,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });
      const raw = completion.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(raw) as { message?: string };
      if (parsed.message?.trim()) coachMessage = parsed.message.trim();
    } catch (e) {
      console.error('[review] Redacción del Coach falló, se usa mensaje por defecto:', e);
    }

    // ── Persistencia ────────────────────────────────────────────────
    await supabase.from('user_reviews').insert({
      user_id: user.id,
      answers: answers as unknown as Record<string, unknown>,
      weight: answers.weight ?? null,
      motor_action: motorAction,
      coach_message: coachMessage,
    });

    // Peso y medidas → historial corporal + perfil
    if (answers.weight) {
      await Promise.all([
        supabase.from('body_measurements').insert({
          user_id: user.id,
          weight: answers.weight,
          waist: answers.measurements?.waist ?? null,
          chest: answers.measurements?.chest ?? null,
          arms: answers.measurements?.arms ?? null,
          thighs: answers.measurements?.thighs ?? null,
          calves: answers.measurements?.calves ?? null,
        }),
        supabase.from('user_profiles').update({ weight: answers.weight }).eq('id', user.id),
      ]);
    }

    // Cambios de objetivo / disponibilidad → onboarding
    const onboardingPatch: Record<string, unknown> = {};
    if (answers.goal === 'change' && answers.newGoal) {
      if (onboarding?.level === 'advanced') onboardingPatch.advanced_goal = answers.newGoal;
      else onboardingPatch.beginner_goal = answers.newGoal;
    }
    if (answers.availability === 'change' && answers.newDaysPerWeek) {
      onboardingPatch.days_per_week = answers.newDaysPerWeek;
    }
    if (Object.keys(onboardingPatch).length > 0) {
      await supabase.from('user_onboarding').update(onboardingPatch).eq('user_id', user.id);
    }

    // ── Evolución para la pantalla final ────────────────────────────
    return NextResponse.json({
      action: motorAction,
      coachMessage,
      evolution: {
        weightPrev: prevWeight,
        weightNow: answers.weight ?? null,
        completedSessions: completed,
        plannedSessions: planned,
        attendancePct,
        weeksTrained: (history?.length ?? 0) + 1,
      },
    });
  } catch (err) {
    console.error('[review POST]', err);
    return NextResponse.json({ error: 'Error al procesar la revisión' }, { status: 500 });
  }
}
