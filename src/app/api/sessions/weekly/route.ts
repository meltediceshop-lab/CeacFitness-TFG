import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Semana de la fecha (cambia en domingo: ese día ya se trabaja con la semana
// siguiente). ?offset=n desplaza n semanas: -1 la pasada, 1 la próxima.
function getCurrentWeekAndYear(offset = 0) {
  const now = new Date(Date.now() + offset * 7 * 86400000);
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const offset = Math.max(-52, Math.min(4, Math.trunc(Number(new URL(request.url).searchParams.get('offset') ?? 0)) || 0));
  const { week, year } = getCurrentWeekAndYear(offset);

  const { data, error } = await supabase
    .from('weekly_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_number', week)
    .eq('year', year)
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const sessions = await request.json();
  // Solo se puede guardar la semana actual o la próxima (configurarla por adelantado).
  const offset = new URL(request.url).searchParams.get('offset') === '1' ? 1 : 0;
  const { week, year } = getCurrentWeekAndYear(offset);

  const rows = sessions.map((s: Record<string, unknown>, index: number) => ({
    id: s.id,
    user_id: user.id,
    session_number: s.sessionNumber,
    name: s.name,
    target_muscles: s.targetMuscles,
    duration: s.duration,
    status: s.status,
    completed_at: s.completedAt ?? null,
    week_number: week,
    year,
    sort_order: index,
    exercises: s.exercises,
    day_of_week: typeof s.dayOfWeek === 'number' ? s.dayOfWeek : null,
  }));

  const { error } = await supabase.from('weekly_sessions').upsert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
