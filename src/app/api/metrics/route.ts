import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET → historial completo (más reciente primero)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[metrics GET]', err);
    return NextResponse.json({ error: 'Error al cargar métricas' }, { status: 500 });
  }
}

// POST → guardar nueva medición
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const b = await req.json();

    const { data, error } = await supabase
      .from('body_measurements')
      .insert({
        user_id:     user.id,
        recorded_at: b.recordedAt ?? new Date().toISOString().slice(0, 10),
        weight:      b.weight   ?? null,
        chest:       b.chest    ?? null,
        waist:       b.waist    ?? null,
        hips:        b.hips     ?? null,
        glutes:      b.glutes   ?? null,
        arms:        b.arms     ?? null,
        forearms:    b.forearms ?? null,
        thighs:      b.thighs   ?? null,
        calves:      b.calves   ?? null,
        photo_url:   b.photoUrl ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Actualizar también user_profiles con el último peso y medidas
    if (b.weight || b.chest || b.waist) {
      const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (b.weight) profileUpdate.weight = b.weight;
      if (b.chest || b.waist || b.hips || b.arms) {
        profileUpdate.measurements = {
          chest: b.chest,
          waist: b.waist,
          hips:  b.hips,
          arms:  b.arms,
        };
      }
      await supabase.from('user_profiles').update(profileUpdate).eq('id', user.id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[metrics POST]', err);
    return NextResponse.json({ error: 'Error al guardar métricas' }, { status: 500 });
  }
}

// DELETE ?id= → eliminar un registro
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[metrics DELETE]', err);
    return NextResponse.json({ error: 'Error al eliminar métrica' }, { status: 500 });
  }
}
