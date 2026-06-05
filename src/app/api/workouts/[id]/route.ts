import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.completed !== undefined) update.completed = body.completed;
  if (body.notes !== undefined) update.notes = body.notes;
  if (body.energyLevel !== undefined) update.energy_level = body.energyLevel;

  const { error } = await supabase
    .from('workout_sessions')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
