import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET ?date=YYYY-MM-DD  → entradas del día
// GET ?range=week        → resumen de los últimos 7 días (totales por día)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);

    if (searchParams.get('range') === 'week') {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      const sinceStr = since.toISOString().slice(0, 10);

      const [{ data: logs }, { data: days }] = await Promise.all([
        supabase.from('nutrition_logs').select('log_date, kcal, protein, carbs, fats').eq('user_id', user.id).gte('log_date', sinceStr),
        supabase.from('nutrition_days').select('log_date, water_glasses, water_goal').eq('user_id', user.id).gte('log_date', sinceStr),
      ]);

      const byDay = new Map<string, { kcal: number; protein: number; carbs: number; fats: number; water: number; waterGoal: number; entries: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay.set(d.toISOString().slice(0, 10), { kcal: 0, protein: 0, carbs: 0, fats: 0, water: 0, waterGoal: 8, entries: 0 });
      }
      for (const l of logs || []) {
        const e = byDay.get(l.log_date);
        if (e) { e.kcal += Number(l.kcal); e.protein += Number(l.protein); e.carbs += Number(l.carbs); e.fats += Number(l.fats); e.entries += 1; }
      }
      for (const d of days || []) {
        const e = byDay.get(d.log_date);
        if (e) { e.water = d.water_glasses; e.waterGoal = d.water_goal; }
      }

      const week = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));
      return NextResponse.json({ data: week });
    }

    const date = searchParams.get('date') || todayStr();
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[nutrition/logs GET]', err);
    return NextResponse.json({ error: 'Error al cargar el registro' }, { status: 500 });
  }
}

// POST → añade una entrada de alimento
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const b = await req.json();
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: user.id,
        log_date: b.date || todayStr(),
        meal_slot: b.mealSlot || 'other',
        food_name: b.foodName,
        quantity_g: b.quantityG ?? null,
        kcal: Math.round(b.kcal ?? 0),
        protein: b.protein ?? 0,
        carbs: b.carbs ?? 0,
        fats: b.fats ?? 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[nutrition/logs POST]', err);
    return NextResponse.json({ error: 'Error al registrar el alimento' }, { status: 500 });
  }
}

// DELETE ?id=  → borra una entrada propia
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[nutrition/logs DELETE]', err);
    return NextResponse.json({ error: 'Error al borrar la entrada' }, { status: 500 });
  }
}