import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id: workoutSessionId } = await params;
  const logs = await request.json() as Array<Record<string, unknown>>; // array de ExerciseLog (+ meta? opcional)

  const rows = logs.map((log) => ({
    workout_session_id: workoutSessionId,
    user_id: user.id,
    exercise_id: log.exerciseId,
    set_number: log.setNumber,
    weight: log.weight ?? null,
    reps: log.reps,
    timestamp: log.timestamp ?? new Date().toISOString(),
  }));

  const { data: inserted, error } = await supabase.from('exercise_logs').insert(rows).select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Execution Log enriquecido (Motor v1.0): rirActual/reasonCodes/densityBlockId
  // por serie, best-effort. Si la columna `meta` no existe aún (falta
  // scripts/setup-exercise-logs-meta.sql), no afecta a las filas ya insertadas.
  if (inserted) {
    await Promise.all(
      logs.map((log, i) => {
        if (!log.meta || !inserted[i]) return null;
        return supabase.from('exercise_logs').update({ meta: log.meta }).eq('id', inserted[i].id)
          .then(({ error: metaError }) => {
            if (metaError) console.warn('[logs] meta no persistida (¿falta migración?):', metaError.message);
          });
      }),
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id: workoutSessionId } = await params;

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('workout_session_id', workoutSessionId)
    .eq('user_id', user.id)
    .order('timestamp');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
