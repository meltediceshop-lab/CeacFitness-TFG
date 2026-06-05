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
  const logs = await request.json(); // array de ExerciseLog

  const rows = logs.map((log: Record<string, unknown>) => ({
    workout_session_id: workoutSessionId,
    user_id: user.id,
    exercise_id: log.exerciseId,
    set_number: log.setNumber,
    weight: log.weight ?? null,
    reps: log.reps,
    timestamp: log.timestamp ?? new Date().toISOString(),
  }));

  const { error } = await supabase.from('exercise_logs').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
