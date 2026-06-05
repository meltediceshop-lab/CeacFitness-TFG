import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      weekly_session_id: body.weeklySessionId ?? null,
      date: body.date ?? new Date().toISOString(),
      energy_level: body.energyLevel,
      completed: body.completed ?? false,
      notes: body.notes ?? null,
      mode: body.mode ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
