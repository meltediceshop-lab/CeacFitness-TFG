import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET ?date= → vasos y objetivo del día
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const date = new URL(req.url).searchParams.get('date') || todayStr();
    const { data } = await supabase
      .from('nutrition_days')
      .select('water_glasses, water_goal')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .maybeSingle();

    return NextResponse.json({ data: data || { water_glasses: 0, water_goal: 8 } });
  } catch (err) {
    console.error('[nutrition/water GET]', err);
    return NextResponse.json({ error: 'Error al cargar la hidratación' }, { status: 500 });
  }
}

// PUT → guarda vasos (y objetivo) del día
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const b = await req.json();
    const { error } = await supabase
      .from('nutrition_days')
      .upsert({
        user_id: user.id,
        log_date: b.date || todayStr(),
        water_glasses: Math.max(0, Math.round(b.waterGlasses ?? 0)),
        water_goal: Math.max(1, Math.round(b.waterGoal ?? 8)),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,log_date' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[nutrition/water PUT]', err);
    return NextResponse.json({ error: 'Error al guardar la hidratación' }, { status: 500 });
  }
}