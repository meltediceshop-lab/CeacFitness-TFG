import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Safety Flow Fit-K v1.0 — registra un evento de molestia (SAFE-001).
// Best-effort: si la tabla `safety_events` todavía no existe (falta
// aplicar scripts/setup-safety-events.sql), no rompe el flujo de
// entrenamiento — el usuario ya vio el mensaje prudente en el cliente.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from('safety_events')
    .insert({
      user_id: user.id,
      workout_session_id: body.workoutSessionId ?? null,
      exercise_id: body.exerciseId,
      exercise_name: body.exerciseName ?? null,
      event_type: body.eventType ?? 'discomfort',
      temporary_exclusion: body.temporaryExclusion ?? true,
    })
    .select()
    .single();

  if (error) {
    console.warn('[safety-events] No se pudo registrar (¿falta migración?):', error.message);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

// Eventos pendientes de revisión (SupervisorState.exclusions_to_review).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: [] });

  const { data, error } = await supabase
    .from('safety_events')
    .select('*')
    .eq('user_id', user.id)
    .is('reviewed_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: data ?? [] });
}
