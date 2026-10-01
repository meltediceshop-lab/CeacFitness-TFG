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

  // Session Instance (Daily Adapter, MOTOR-STATE-MASTER): guarda para auditoría
  // los ejercicios REALMENTE presentados hoy (tras adaptar por energía/tiempo),
  // sin que afecte al Plan Base. Best-effort: si la columna `session_instance`
  // todavía no existe (falta aplicar scripts/setup-session-instance.sql), se
  // ignora en silencio y el registro base ya insertado no se ve afectado.
  if (body.sessionInstance && data?.id) {
    await supabase
      .from('workout_sessions')
      .update({ session_instance: body.sessionInstance })
      .eq('id', data.id)
      .then(({ error: updateError }) => {
        if (updateError) console.warn('[workouts] session_instance no persistida (¿falta migración?):', updateError.message);
      });
  }

  return NextResponse.json({ data }, { status: 201 });
}
