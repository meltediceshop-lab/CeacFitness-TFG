import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MASTER_PROMPT } from '@/lib/coachPrompt';
import { libraryById, libraryPromptSummary, resolveLibraryId } from '@/lib/fitkLibrary';
import { COACH_MODEL, COACH_REASONING_EFFORT } from '@/lib/llm';
import { ALL_EQUIPMENT, EXTRA_FUNCTIONS, SESSION_FOCUS, type MotorInput } from '@/lib/fitkMotor';
import { motorInputFromRows } from '@/lib/motorInputFromRows';
import { buildMotorWorkout, findLibraryExercise, toPlainText } from '@/lib/coachMotor';
import type { CoachWorkout } from '@/types/user';
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY!,
});

// Biblioteca Fit-K — misma fuente de verdad que el Motor (fitkLibrary.ts).
const BOE_FK = libraryPromptSummary();

type ExerciseContext = {
  sessionName?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number[];
  repLabel?: string;
  targetMuscle?: string;
  /** Alternativas y variantes que ya calculó el Motor para este ejercicio. */
  alternatives?: string[];
  variations?: string[];
};

function getModeInstructions(mode?: string, exerciseContext?: ExerciseContext): string {
  if (mode === 'session') {
    const ex = exerciseContext;
    let instructions = `\n\nMODO ACTIVO: CHAT EN MITAD DE UN ENTRENAMIENTO EN DIRECTO
Sesión actual: ${ex?.sessionName || 'entreno de hoy'}`;
    if (ex?.exerciseName) {
      instructions += `\nEjercicio actual: ${ex.exerciseName}${ex.sets ? ` — ${ex.sets} series x ${ex.repLabel || `${(ex.reps || []).join('/')} reps`}` : ''}${ex.targetMuscle ? ` (músculo: ${ex.targetMuscle})` : ''}`;
      if (ex.alternatives?.length || ex.variations?.length) {
        instructions += `\nAlternativas que ya calculó el Motor para este ejercicio (misma función): ${[...(ex.variations ?? []), ...(ex.alternatives ?? [])].join(', ')}.
- Si pide sustituirlo (máquina ocupada, no le gusta, falta material), propón SOLO una de estas y recuérdale que puede cambiarla en el detalle del ejercicio. No inventes otras ni cambies series o reps.`;
      }
    }
    instructions += `\n- Si dice que tiene DOLOR o MOLESTIA: que pare ese ejercicio y pulse "Tengo molestias" en la pantalla del ejercicio (el Motor lo registra y no lo sustituye automáticamente). No propongas alternativas ni bajar el peso para seguir con dolor.`;
    instructions += `\nRESTRICCIÓN DE TEMA OBLIGATORIA: SOLO puedes ayudar con: técnica del ejercicio actual, variantes o alternativas (por lesión, falta de material, incomodidad), ajustar series/reps/peso/descanso, o dudas puntuales del entreno de hoy.
- Sé MUY breve: 1-3 frases máximo, el usuario está entrenando ahora mismo y no puede leer mucho.
- Si preguntan cualquier otra cosa (nutrición, otro día, temas ajenos al fitness), responde EXACTAMENTE: "Ahora mismo solo puedo ayudarte con el ejercicio de hoy. ¡Sigue así! 💪"

${BOE_FK}`;
    return instructions;
  }

  const envMap: Record<string, string> = {
    nutrition: 'NUTRICIÓN deportiva',
    gym: 'ENTRENAMIENTO EN GIMNASIO (pesas, máquinas, mancuernas)',
    outdoor: 'ENTRENAMIENTO AL AIRE LIBRE (running, HIIT en parque, circuitos)',
  };

  const modeLabel = envMap[mode || ''] || 'ENTRENAMIENTO Y NUTRICIÓN';
  const isNutrition = mode === 'nutrition';
  const isGym = mode === 'gym';
  const isOutdoor = mode === 'outdoor';

  let instructions = `\n\nMODO ACTIVO: ${modeLabel}
RESTRICCIÓN DE TEMA OBLIGATORIA: Solo debes responder preguntas relacionadas con fitness y nutrición deportiva.`;

  if (isGym) {
    instructions += `\n- Entrenos de GIMNASIO: pesas libres, barras, máquinas, mancuernas. No propones ejercicios al aire libre ni running.\n\n${BOE_FK}`;
  } else if (isOutdoor) {
    instructions += '\n- Entrenos AL AIRE LIBRE: la sesión de fuerza la construye el Motor con peso corporal y barras de parque (equipment ["dominadas","paralelas"], o [] si no tiene barras). Usa preferentemente el enfoque "fullB" o "legs" (la Biblioteca no tiene remo ni bisagra sin material). Para running o cardio da pautas en texto (no hay tarjeta para eso).';
  } else if (isNutrition) {
    instructions += '\n- Céntrate en nutrición: macros, timing de comidas, recetas, suplementos, dietas. Si preguntan sobre entrenamiento, puedes dar una respuesta mínima pero redirige a nutrición.';
  }

  instructions += '\n- Si el usuario pregunta algo ajeno al fitness y la nutrición (tiempo meteorológico, política, tecnología, entretenimiento, salud médica general, etc.), responde EXACTAMENTE esta frase y nada más: "Me limito solo a contestar preguntas sobre entrenamiento y nutrición. ¿En qué puedo ayudarte en esas áreas? 💪"';

  return instructions;
}

type KnowledgeEntry = { title: string; content: string };

function buildKnowledgeSection(knowledge: KnowledgeEntry[]): string {
  if (knowledge.length === 0) return '';
  const items = knowledge.map(k => `• ${k.title}: ${k.content}`).join('\n');
  return `\n\nBASE DE CONOCIMIENTO DEL COACH (información curada específicamente para esta app; úsala como referencia principal por encima de tu conocimiento general cuando sea relevante para la pregunta):\n${items}`;
}

function buildSystemPrompt(
  onboarding: Record<string, unknown>,
  profile: Record<string, unknown>,
  context?: { sessions?: Record<string, unknown>[]; lastMeasurement?: Record<string, unknown> | null },
  mode?: string,
  knowledge?: KnowledgeEntry[],
  exerciseContext?: ExerciseContext,
): string {
  const name = (profile.name as string) || 'Usuario';
  const isAdvanced = onboarding.level === 'advanced';
  const goal = (isAdvanced ? onboarding.advanced_goal : onboarding.beginner_goal) as string;

  const goalLabels: Record<string, string> = {
    energy: 'ganar energía',
    'feel-better': 'sentirse mejor',
    strength: 'ganar fuerza',
    routine: 'crear una rutina constante',
    physique: 'mejorar su físico',
    performance: 'mejorar rendimiento deportivo',
    maintain: 'mantener su forma',
    'lose-weight': 'perder peso (bajar báscula)',
    'lose-fat': 'perder grasa manteniendo el músculo',
    recomp: 'recomposición corporal (perder grasa y ganar músculo)',
  };

  const ageLabels: Record<string, string> = {
    'under-25': 'menos de 25',
    '25-34': '25-34',
    '35-44': '35-44',
    '45-54': '45-54',
    '55+': '55 o más',
  };

  const comfortLabels: Record<string, string> = {
    shy: 'muy tímido en el gym',
    insecure: 'algo inseguro',
    depends: 'depende del día',
    comfortable: 'cómodo en el gym',
  };

  const injuries = (profile.injuries as string[]) || [];
  const excluded = (profile.excluded_exercises as string[]) || [];
  const nutritionProfile = profile.nutrition_profile as Record<string, unknown> | null;

  let prompt = `${MASTER_PROMPT}

Actúas para ${name}, con un tono ${isAdvanced ? 'directo, técnico y sin rodeos' : 'cercano, motivador y sin tecnicismos innecesarios'}.

PERFIL DE ${name.toUpperCase()}:
- Género: ${profile.biological_profile === 'male' ? 'Hombre' : 'Mujer'}
- Edad: ${ageLabels[(profile.age_range as string)] || profile.age_range} años
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm
- Nivel: ${isAdvanced ? 'Avanzado (entrena con constancia)' : 'Principiante o retomando'}
- Objetivo: ${goalLabels[goal] || goal}
- Días de entrenamiento: ${onboarding.days_per_week} días/semana
- Duración de sesiones: ${(onboarding.workout_duration as string) || '45min'}
- Semana actual de programa: ${1}`;

  if (onboarding.gym_comfort) {
    prompt += `\n- Comodidad en el gym: ${comfortLabels[(onboarding.gym_comfort as string)] || onboarding.gym_comfort}`;
  }
  if (injuries.length > 0) {
    prompt += `\n- Lesiones/limitaciones: ${injuries.join(', ')}`;
  }
  if (excluded.length > 0) {
    prompt += `\n- Ejercicios que no hace: ${excluded.join(', ')}`;
  }

  if (nutritionProfile) {
    const dietLabels: Record<string, string> = {
      omnivore: 'omnívoro',
      vegetarian: 'vegetariano',
      vegan: 'vegano',
      other: 'dieta especial',
    };
    const goalNutrLabels: Record<string, string> = {
      'lose-fat': 'perder grasa',
      'gain-muscle': 'ganar músculo',
      maintain: 'mantener peso',
      performance: 'rendimiento',
    };

    prompt += `\n\nPERFIL NUTRICIONAL:
- Objetivo: ${goalNutrLabels[(nutritionProfile.goal as string)] || nutritionProfile.goal}
- Dieta: ${dietLabels[(nutritionProfile.dietType as string)] || nutritionProfile.dietType}
- Alergias: ${(nutritionProfile.allergies as string[])?.join(', ') || 'Ninguna'}
- Alimentos que no le gustan: ${(nutritionProfile.dislikedFoods as string) || 'Ninguno'}
- Comidas al día: ${nutritionProfile.mealsPerDay}
- Cocina en casa: ${nutritionProfile.cookingFrequency === 'home' ? 'Sí' : nutritionProfile.cookingFrequency === 'outside' ? 'No' : 'A veces'}
- Hora de entreno: ${nutritionProfile.trainingTime === 'morning' ? 'Mañana' : nutritionProfile.trainingTime === 'afternoon' ? 'Tarde' : 'Noche'}
- Suplementos: ${(nutritionProfile.supplements as string) || 'Ninguno'}`;
  }

  // Contexto de entrenamiento actual
  if (context?.sessions && context.sessions.length > 0) {
    const done = context.sessions.filter(s => s.status === 'completed').length;
    const total = context.sessions.length;
    const sessionList = context.sessions
      .map(s => `  · Sesión ${s.session_number}: ${s.name} (${s.duration}min) — ${s.status === 'completed' ? '✅ hecha' : s.status === 'available' ? '⏳ siguiente' : '🔒 pendiente'}`)
      .join('\n');
    prompt += `\n\nSEMANA DE ENTRENAMIENTO ACTUAL (${done}/${total} completadas):\n${sessionList}`;
  }

  // Contexto de métricas corporales
  if (context?.lastMeasurement) {
    const m = context.lastMeasurement;
    const parts = [
      m.weight && `peso ${m.weight}kg`,
      m.chest && `pecho ${m.chest}cm`,
      m.waist && `cintura ${m.waist}cm`,
      m.arms && `brazo ${m.arms}cm`,
      m.thighs && `muslo ${m.thighs}cm`,
    ].filter(Boolean);
    if (parts.length > 0) {
      prompt += `\n\nÚLTIMAS MÉTRICAS CORPORALES: ${parts.join(', ')}.`;
    }
  }

  prompt += `\n\nINSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español
- Sé conciso: máximo 3-4 párrafos por respuesta
- Escribe en TEXTO PLANO: nada de Markdown, asteriscos (**), almohadillas ni listas con símbolos — la app muestra el texto tal cual
- Usa siempre el nombre "${name}" al dirigirte al usuario
- TÚ NO DISEÑAS RUTINAS: las sesiones de entrenamiento las construye el Motor Fit-K (elige ejercicios, series, reps, RIR, descansos y peso según el perfil, lesiones y tiempo). Tu papel es entender qué necesita el usuario y pedírselo al Motor con la herramienta "request_motor_session" (enfoque, minutos, material disponible, ejercicios a evitar y, solo si lo pide, trabajo extra como cuello, tibial o flexores de cadera). Nunca escribas una rutina con ejercicios inventada por ti en el texto.
- Si el usuario pide un entreno, una rutina o una sesión, o AÑADIR/GUARDAR un entreno, llama a "request_motor_session". Elige el enfoque según lo que pida y lo que le falta esta semana; si no especifica, usa cuerpo completo.
- Ajustes del día: la energía baja y el poco tiempo los aplica el Motor al empezar la sesión (pantalla de energía): mantiene los ejercicios y reduce la dosis. Si tiene poco tiempo y quiere una sesión distinta, pide al Motor una sesión con esos minutos.
- Si quiere AÑADIR UN EJERCICIO CONCRETO a una de sus sesiones ("añádeme dominadas a la sesión del viernes"), usa "add_exercise_to_session" con el nombre del ejercicio y, si lo dice, la sesión o el día. El usuario elige la sesión y confirma en la tarjeta.
- Si un ejercicio de su plan está OCUPADO, no tiene el material o NO LE GUSTA, usa "swap_exercise": el usuario elige la alternativa del Motor en la tarjeta. Si es por DOLOR o molestia, no lo sustituyas: que pare y use "Tengo molestias".
- Si quiere MOVER una sesión a otro día o QUITARLA/SALTARLA esta semana, usa "move_session"; el usuario confirma en la tarjeta.
- Si pregunta cómo va, su progreso o un resumen, usa "progress_summary" y respóndele con esos datos reales (breve, motivador, sin inventar).
- Si pregunta si debe subir peso o cómo progresar en un ejercicio, usa "exercise_progress" y explica la recomendación con sus series reales.
- Si pregunta qué puedes hacer, explícalo en pocas frases (también cambiar ejercicios, mover sesiones, resumir su progreso y decirle cuándo subir peso): crear una sesión con el Motor (gimnasio, casa o calle), añadir un ejercicio a una sesión, adaptar el día a la energía o al tiempo (desde la pantalla de energía y "Cambiar tiempo"), preparar planes de comidas y macros, entender fotos (comida, máquinas, técnica, etiquetas) y notas de voz, y resolver dudas de técnica, descansos o progresión.
- La herramienta "create_nutrition_plan" crea un plan de comidas que se guarda en la pestaña Nutrición; adáptalo a su perfil.
- Cuando uses una herramienta, en tu respuesta de texto explica brevemente qué le has preparado y por qué, y anímale a guardarlo con el botón de la tarjeta. No repitas todos los datos: ya los verá en la tarjeta.
- Para nutrición puedes crear el plan directamente con la herramienta aunque no haya completado el cuestionario, usando los datos de su perfil
- NUNCA diagnostiques enfermedades ni recetes medicamentos
- Si hay lesiones, recomienda consultar a un médico además de dar consejos adaptados
- Tono: ${isAdvanced ? 'directo, sin rodeos, técnico cuando proceda' : 'motivador, cercano, sin agobiar con datos'}`;

  prompt += getModeInstructions(mode, exerciseContext);
  prompt += buildKnowledgeSection(knowledge ?? []);

  return prompt;
}

type Supa = Awaited<ReturnType<typeof createClient>>;
const exName = (id: string) => libraryById.get(resolveLibraryId(id))?.name ?? id;
const dayKey = (t: string) => t.slice(0, 10);

/** Resumen de progreso con datos reales del usuario (para «¿cómo voy?»). */
async function progressSummary(supabase: Supa, userId: string): Promise<string> {
  const since = new Date(Date.now() - 28 * 86400000).toISOString();
  const [{ data: weeks }, { data: workouts }, { data: metrics }, { data: logs }] = await Promise.all([
    supabase.from('weekly_sessions').select('name, status, week_number, year').eq('user_id', userId).order('year', { ascending: false }).order('week_number', { ascending: false }).limit(20),
    supabase.from('workout_sessions').select('date').eq('user_id', userId).gte('date', since),
    supabase.from('body_measurements').select('recorded_at, weight, waist').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(10),
    supabase.from('exercise_logs').select('exercise_id, weight, timestamp').eq('user_id', userId).gte('timestamp', since).order('timestamp', { ascending: true }).limit(500),
  ]);
  const lines: string[] = [];
  const w = weeks ?? [];
  if (w.length) {
    const cur = w.filter(r => r.week_number === w[0].week_number && r.year === w[0].year);
    const done = cur.filter(r => r.status === 'completed').length;
    lines.push(`Semana actual: ${done} de ${cur.length} sesiones hechas (pendientes: ${cur.filter(r => r.status !== 'completed').map(r => r.name).join(', ') || 'ninguna'}).`);
  }
  lines.push(`Entrenos registrados en las últimas 4 semanas: ${(workouts ?? []).length}.`);
  const m = (metrics ?? []).filter(r => r.weight != null);
  if (m.length) {
    const last = m[0], first = m[m.length - 1];
    lines.push(`Peso: ${last.weight} kg (${dayKey(String(last.recorded_at))})${m.length > 1 ? `, ${Number(last.weight) - Number(first.weight) >= 0 ? '+' : ''}${(Number(last.weight) - Number(first.weight)).toFixed(1)} kg desde ${dayKey(String(first.recorded_at))}` : ''}.`);
  }
  const waist = (metrics ?? []).filter(r => r.waist != null);
  if (waist.length) lines.push(`Cintura: ${waist[0].waist} cm${waist.length > 1 ? ` (antes ${waist[waist.length - 1].waist} cm)` : ''}.`);
  // Ejercicios en los que más ha subido el peso máximo
  const byEx = new Map<string, { first: number; last: number }>();
  for (const l of logs ?? []) {
    if (l.weight == null) continue;
    const e = byEx.get(l.exercise_id);
    if (!e) byEx.set(l.exercise_id, { first: Number(l.weight), last: Number(l.weight) });
    else e.last = Math.max(e.last, Number(l.weight));
  }
  const ups = [...byEx.entries()].map(([id, v]) => ({ id, d: v.last - v.first, v })).filter(x => x.d > 0).sort((a, b) => b.d - a.d).slice(0, 4);
  if (ups.length) lines.push(`Mejoras de peso este mes: ${ups.map(u => `${exName(u.id)} ${u.v.first}→${u.v.last} kg`).join('; ')}.`);
  if (!(logs ?? []).length) lines.push('No hay series registradas este mes (el usuario puede registrarlas al marcar cada ejercicio).');
  return lines.join('\n');
}

/** Últimas series de un ejercicio y la recomendación de la doble progresión. */
async function exerciseProgress(supabase: Supa, userId: string, query: string): Promise<string> {
  const found = findLibraryExercise(query);
  if (!found.exercise) return `No hay un ejercicio claro con ese nombre.${found.similar.length ? ` Parecidos: ${found.similar.join(', ')}.` : ''}`;
  const ex = found.exercise;
  const ids = [...new Set([ex.id, ex.libraryId].filter(Boolean))] as string[];
  const { data } = await supabase.from('exercise_logs').select('weight, reps, set_number, timestamp').eq('user_id', userId).in('exercise_id', ids).order('timestamp', { ascending: false }).limit(60);
  const logs = data ?? [];
  if (!logs.length) return `${ex.name}: no hay series registradas. Rango del Motor: ${ex.repRange?.join('-') ?? ex.reps[0]} repeticiones, ${ex.sets} series. Sugiérele registrar peso y repeticiones al marcarlo.`;
  const lastDay = dayKey(String(logs[0].timestamp));
  const last = logs.filter(l => dayKey(String(l.timestamp)) === lastDay).sort((a, b) => a.set_number - b.set_number);
  const prevDay = logs.find(l => dayKey(String(l.timestamp)) !== lastDay);
  const prev = prevDay ? logs.filter(l => dayKey(String(l.timestamp)) === dayKey(String(prevDay.timestamp))) : [];
  const [lo, hi] = ex.repRange ?? [ex.reps[0], ex.reps[0]];
  const allTop = last.every(l => (l.reps ?? 0) >= hi);
  const anyLow = last.some(l => (l.reps ?? 0) < lo);
  const rec = allTop
    ? `Llegó al tope del rango (${hi}) en todas las series: toca subir el peso un poco (unos 2,5 kg en ejercicios grandes, 1-2 kg o el siguiente disco en aislamiento) y volver a ${lo}-${lo + 1} repeticiones.`
    : anyLow
      ? `Alguna serie quedó por debajo de ${lo}: mantener el peso (o bajarlo un poco) hasta completar el rango.`
      : `Está dentro del rango ${lo}-${hi}: mantener el peso e intentar sumar repeticiones hasta llegar a ${hi} en todas las series.`;
  return `${ex.name} (doble progresión ${lo}-${hi} reps, ${ex.sets} series).
Última sesión (${lastDay}): ${last.map(l => `${l.weight ?? '–'} kg × ${l.reps ?? '–'}`).join(', ')}.${prev.length ? `\nSesión anterior (${dayKey(String(prev[0].timestamp))}): ${prev.map(l => `${l.weight ?? '–'} kg × ${l.reps ?? '–'}`).join(', ')}.` : ''}
Recomendación del Motor: ${rec}`;
}

const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

async function describeImage(dataUrl: string, question: string): Promise<string> {
  try {
    const res = await deepseek.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Describe en español, con detalle y sin inventar, lo que se ve en esta foto, centrándote en lo útil para un entrenador o nutricionista: alimentos y cantidades aproximadas, máquinas o ejercicios, postura y técnica, texto visible (etiquetas, informes). Pregunta del usuario: "${question.slice(0, 300)}"` },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      }],
    });
    return res.choices[0]?.message?.content?.trim() || 'no se ha podido describir la imagen';
  } catch (err) {
    console.error('[chat vision]', err);
    return 'no se ha podido analizar la imagen';
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json() as {
      message: string;
      history?: { role: string; content: string }[];
      mode?: string;
      context?: ExerciseContext;
      /** Foto adjunta (data URL, ya reducida en el móvil). */
      image?: string;
    };
    const { history, mode, context: exerciseContext } = body;
    let message = body.message ?? '';

    // Foto adjunta: un modelo con visión la describe y el Coach responde con esa descripción.
    if (typeof body.image === 'string' && body.image.startsWith('data:image/') && body.image.length < 8_000_000) {
      const description = await describeImage(body.image, message);
      message = `${message.trim() || '¿Qué te parece esta foto?'}\n\n[Foto adjunta. Lo que se ve: ${description}]`;
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    // Sin sesión iniciada el Motor usa valores por defecto (principiante, 45 min).
    let motorBase: MotorInput = motorInputFromRows('anon', null, null);

    // Base de conocimiento: prioriza la categoría del modo activo + entradas generales
    let knowledge: KnowledgeEntry[] = [];
    const knowledgeCategories = mode ? [mode, 'general'] : ['general'];
    const { data: matchedKnowledge } = await supabase
      .from('coach_knowledge')
      .select('title, content')
      .in('category', knowledgeCategories)
      .textSearch('search', message, { type: 'websearch', config: 'spanish' })
      .limit(6);
    knowledge = matchedKnowledge ?? [];
    if (knowledge.length === 0) {
      const { data: fallbackKnowledge } = await supabase
        .from('coach_knowledge')
        .select('title, content')
        .in('category', knowledgeCategories)
        .order('created_at', { ascending: false })
        .limit(4);
      knowledge = fallbackKnowledge ?? [];
    }

    if (user) {
      const [{ data: onboarding }, { data: profile }, { data: sessions }, { data: measurements }, { data: lastReview }] = await Promise.all([
        supabase.from('user_onboarding').select('*').eq('user_id', user.id).single(),
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('weekly_sessions').select('session_number, name, duration, status').eq('user_id', user.id).order('sort_order'),
        supabase.from('body_measurements').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1),
        supabase.from('user_reviews').select('answers, motor_action, coach_message, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      ]);

      motorBase = motorInputFromRows(user.id, onboarding, profile);

      if (onboarding && profile) {
        let prompt = buildSystemPrompt(onboarding, profile, {
          sessions: sessions ?? [],
          lastMeasurement: measurements?.[0] ?? null,
        }, mode, knowledge, exerciseContext);

        const review = lastReview?.[0];
        if (review) {
          const a = review.answers as Record<string, unknown>;
          prompt += `\n\nÚLTIMA REVISIÓN PERIÓDICA (${new Date(review.created_at).toLocaleDateString('es-ES')}):
- Fuerza: ${a.strength} | Energía: ${a.energy} | Recuperación: ${a.recovery} | Sueño: ${a.sleep} | Estrés: ${a.stress} | Motivación: ${a.motivation}
- Molestias: ${(a.discomfort as string) || 'ninguna'}
- Decisión del Motor: ${review.motor_action}
Ten en cuenta esta revisión al aconsejar (p.ej. si hay molestias, estrés alto o mala recuperación, sé más conservador).`;
        }

        messages.push({ role: 'system', content: prompt });
      }
    }

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: MASTER_PROMPT
          + '\n\nResponde siempre en español.'
          + getModeInstructions(mode, exerciseContext)
          + buildKnowledgeSection(knowledge),
      });
    }

    for (const msg of (history || []).slice(-20)) {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    }
    messages.push({ role: 'user', content: message });

    const nutritionTool: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'create_nutrition_plan',
        description: 'Crea un plan nutricional semanal personalizado. Úsala SOLO cuando el usuario pida explícitamente una dieta, plan de alimentación o nutrición específica.',
        parameters: {
          type: 'object',
          properties: {
            goal: { type: 'string', description: 'Objetivo (ej: "Perder 250g/semana", "Ganar músculo")' },
            dailyCalories: { type: 'number', description: 'Calorías diarias totales' },
            macros: {
              type: 'object',
              properties: {
                protein: { type: 'number', description: 'Gramos de proteína al día' },
                carbs: { type: 'number', description: 'Gramos de carbohidratos al día' },
                fats: { type: 'number', description: 'Gramos de grasas al día' },
              },
              required: ['protein', 'carbs', 'fats'],
            },
            meals: {
              type: 'array',
              description: 'Comidas del día (4-6 comidas)',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Ej: Desayuno, Almuerzo, Merienda' },
                  time: { type: 'string', description: 'Hora orientativa (ej: 08:00)' },
                  foods: { type: 'array', items: { type: 'string' }, description: 'Lista de alimentos sugeridos' },
                  calories: { type: 'number', description: 'Calorías aproximadas de esa comida' },
                },
                required: ['name', 'time', 'foods', 'calories'],
              },
            },
            guidelines: { type: 'array', items: { type: 'string' }, description: 'Pautas clave a seguir (3-5 consejos)' },
            preWorkout: { type: 'string', description: 'Qué comer antes de entrenar' },
            postWorkout: { type: 'string', description: 'Qué comer después de entrenar' },
          },
          required: ['goal', 'dailyCalories', 'macros', 'meals', 'guidelines'],
        },
      },
    };

    const workoutTool: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'request_motor_session',
        description: 'Pide al Motor Fit-K una sesión de entrenamiento de fuerza para el usuario (el Motor elige ejercicios y dosis). Úsala siempre que pida un entreno, rutina o sesión, o que quiera añadir/guardar uno.',
        parameters: {
          type: 'object',
          properties: {
            focus: {
              type: 'string',
              enum: Object.keys(SESSION_FOCUS),
              description: `Enfoque de la sesión: ${Object.entries(SESSION_FOCUS).map(([k, v]) => `${k} = ${v}`).join('; ')}`,
            },
            minutes: { type: 'number', description: 'Minutos disponibles si el usuario los indica (20-90). Si no, se usa su duración habitual.' },
            equipment: {
              type: 'array',
              items: { type: 'string', enum: [...ALL_EQUIPMENT] },
              description: 'Solo si el usuario dice qué material tiene (p. ej. en casa solo mancuernas → ["mancuernas","banco"]). Lista vacía = solo peso corporal. Omitir = gimnasio completo.',
            },
            avoidExercises: { type: 'array', items: { type: 'string' }, description: 'Ejercicios que el usuario pide evitar en esta sesión' },
            extras: {
              type: 'array',
              items: { type: 'string', enum: Object.keys(EXTRA_FUNCTIONS) },
              description: `Trabajo adicional SOLO si el usuario lo pide expresamente en este mensaje: ${Object.entries(EXTRA_FUNCTIONS).map(([k, v]) => `${k} = ${v}`).join('; ')}. "cuello" únicamente si pide entrenar cuello y no refiere dolor cervical, mareo ni hormigueo. Omitir en cualquier otro caso.`,
            },
          },
          required: ['focus'],
        },
      },
    };

    const addExerciseTool: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'add_exercise_to_session',
        description: 'Añade un ejercicio concreto de la Biblioteca a una de las sesiones de la semana del usuario. Úsala cuando pida meter/añadir/poner un ejercicio concreto en una sesión.',
        parameters: {
          type: 'object',
          properties: {
            exercise: { type: 'string', description: 'Ejercicio tal como lo dice el usuario (p. ej. "dominadas", "press banca", "curl de bíceps")' },
            session: { type: 'string', description: 'Sesión o día si lo indica (p. ej. "viernes", "pierna", "hoy"). Omitir si no lo dice.' },
          },
          required: ['exercise'],
        },
      },
    };

    const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[] = []): OpenAI.Chat.Completions.ChatCompletionTool =>
      ({ type: 'function', function: { name, description, parameters: { type: 'object', properties, required } } });
    const swapTool = fn('swap_exercise', 'Cambia un ejercicio de una de sus sesiones por una alternativa del Motor (ocupado, sin material o no le gusta; nunca por dolor).',
      { exercise: { type: 'string', description: 'Ejercicio que quiere cambiar, como lo dice el usuario' } }, ['exercise']);
    const moveTool = fn('move_session', 'Mueve una sesión de la semana a otro día o la quita de esta semana.',
      { session: { type: 'string', description: 'Sesión o día actual ("hoy", "pierna", "viernes"). Omitir si no lo dice.' },
        day: { type: 'string', description: 'Día al que moverla ("sábado", "mañana") o "quitar" si quiere saltarla.' } }, ['day']);
    const progressTool = fn('progress_summary', 'Resumen del progreso real del usuario: sesiones de la semana, entrenos del mes, peso y medidas, mejoras de peso.', {});
    const liftTool = fn('exercise_progress', 'Últimas series registradas de un ejercicio y si toca subir peso según la doble progresión del Motor.',
      { exercise: { type: 'string', description: 'Ejercicio por el que pregunta' } }, ['exercise']);

    // Si el usuario pide explícitamente añadir/guardar un entreno, forzamos la
    // herramienta para que siempre salga la tarjeta con el botón de guardar.
    const normalized = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    // «Añádeme X a la sesión…» es añadir un ejercicio, no pedir una sesión nueva.
    const wantsExerciseAdded = /(anad|agreg|\bmete|\bpon)/.test(normalized)
      && /(ejercicio|\ba (la|mi|el) (sesion|entreno|rutina)|\bal entreno)/.test(normalized);
    const wantsWorkoutSaved = !wantsExerciseAdded &&
      /(anad|agreg|guard|apunt|\bmete)/.test(normalized) &&
      /(entren|rutina|sesion)/.test(normalized);

    const completion = await deepseek.chat.completions.create({
      model: COACH_MODEL,
      reasoning_effort: COACH_REASONING_EFFORT,
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      tools: [workoutTool, nutritionTool, addExerciseTool, swapTool, moveTool, progressTool, liftTool],
      tool_choice: wantsWorkoutSaved
        ? { type: 'function', function: { name: 'request_motor_session' } }
        : 'auto',
    });

    const choice = completion.choices[0];
    let aiResponse = '';
    let workoutData: CoachWorkout | null = null;
    let nutritionData: Record<string, unknown> | null = null;
    let exerciseAdd: { exercise: unknown; target?: string } | null = null;
    let swap: { exercise: string } | null = null;
    let move: { session?: string; day: string } | null = null;

    if (choice.message.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0] as { id: string; type: string; function: { name: string; arguments: string } };
      const fnName = toolCall.function?.name;

      if (['request_motor_session', 'create_nutrition_plan', 'add_exercise_to_session', 'swap_exercise', 'move_session', 'progress_summary', 'exercise_progress'].includes(fnName)) {
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(toolCall.function.arguments || '{}'); } catch { /* ignore */ }

        let successMsg = 'Plan nutricional creado correctamente.';
        if (fnName === 'swap_exercise') {
          swap = { exercise: String(parsed.exercise ?? '') };
          successMsg = 'El usuario ve una tarjeta con las alternativas del Motor para ese ejercicio y elige una. Responde en 1-2 frases: que elija la que le encaje en la tarjeta.';
        } else if (fnName === 'move_session') {
          move = { session: typeof parsed.session === 'string' ? parsed.session : undefined, day: String(parsed.day ?? '') };
          successMsg = 'El usuario ve una tarjeta para confirmar el cambio de día o quitar la sesión. Responde en 1-2 frases, comprensivo, y que lo confirme en la tarjeta.';
        } else if (fnName === 'progress_summary') {
          successMsg = user ? await progressSummary(supabase, user.id) : 'No hay sesión iniciada: no hay datos de progreso.';
          successMsg += '\nResponde en 2-4 frases de texto plano con estos datos reales; destaca lo bueno y una cosa a mejorar. No inventes cifras.';
        } else if (fnName === 'exercise_progress') {
          successMsg = user ? await exerciseProgress(supabase, user.id, String(parsed.exercise ?? '')) : 'No hay sesión iniciada: no hay series registradas.';
          successMsg += '\nResponde en 2-3 frases de texto plano con estos datos y la recomendación. No inventes cifras.';
        } else if (fnName === 'add_exercise_to_session') {
          const found = findLibraryExercise(String(parsed.exercise ?? ''));
          if (found.exercise) {
            exerciseAdd = { exercise: found.exercise, target: typeof parsed.session === 'string' ? parsed.session : undefined };
            successMsg = `Ejercicio encontrado en la Biblioteca: ${found.exercise.name} (${found.exercise.sets} series). El usuario ve una tarjeta para elegir la sesión y añadirlo. Responde en 1-2 frases de texto plano: confirma qué ejercicio es y que lo añada desde la tarjeta eligiendo la sesión. No cambies la dosis.`;
          } else {
            successMsg = `No hay un ejercicio claro con ese nombre en la Biblioteca.${found.similar.length ? ` Los más parecidos: ${found.similar.join(', ')}.` : ''} Pregúntale cuál quiere (nombra esas opciones) o que lo describa de otra forma.`;
          }
        } else if (fnName === 'request_motor_session') {
          const motor = buildMotorWorkout(motorBase, parsed as Parameters<typeof buildMotorWorkout>[1], mode);
          workoutData = motor.workout;
          successMsg = motor.toolResult;
        } else {
          nutritionData = parsed;
        }

        const followUp = await deepseek.chat.completions.create({
          model: COACH_MODEL,
          reasoning_effort: COACH_REASONING_EFFORT,
          messages: [
            ...messages,
            choice.message,
            { role: 'tool' as const, tool_call_id: toolCall.id, content: successMsg },
          ],
          max_tokens: 400,
          temperature: 0.7,
        });
        aiResponse = followUp.choices[0]?.message?.content || (workoutData || nutritionData || exerciseAdd || swap || move ? '¡Listo! Lo tienes en la tarjeta de abajo.' : 'No he podido prepararlo con esas condiciones. ¿Qué material tienes disponible?');
      }
    } else {
      aiResponse = choice.message?.content || 'Lo siento, no pude generar una respuesta.';
    }

    aiResponse = toPlainText(aiResponse);

    if (user) {
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: message, mode: mode ?? null },
        { user_id: user.id, role: 'assistant', content: aiResponse, mode: mode ?? null },
      ]);
    }

    return NextResponse.json({ response: aiResponse, workout: workoutData, nutritionPlan: nutritionData, exerciseAdd, swap, move });
  } catch (err) {
    console.error('[chat POST]', err);
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ data: [] });

    const mode = req.nextUrl.searchParams.get('mode');

    let query = supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (mode) query = query.eq('mode', mode);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[chat GET]', err);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }
}
