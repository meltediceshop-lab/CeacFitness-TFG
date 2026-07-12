import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Devuelve las tarjetas del Coach ya mostradas al usuario (para no repetirlas)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ data: [] });

    const { data, error } = await supabase
      .from('coach_cards')
      .select('card_type, week_number')
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[coach-cards GET]', err);
    return NextResponse.json({ error: 'Error al cargar tarjetas' }, { status: 500 });
  }
}

// Marca una tarjeta del Coach como mostrada (para que no vuelva a aparecer)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { cardType, weekNumber } = await req.json() as {
      cardType: 'first_week' | 'new_week';
      weekNumber: number;
    };

    if (!cardType || !weekNumber) {
      return NextResponse.json({ error: 'cardType y weekNumber requeridos' }, { status: 400 });
    }

    const { error } = await supabase
      .from('coach_cards')
      .upsert(
        { user_id: user.id, card_type: cardType, week_number: weekNumber },
        { onConflict: 'user_id,card_type,week_number', ignoreDuplicates: true },
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[coach-cards POST]', err);
    return NextResponse.json({ error: 'Error al guardar tarjeta' }, { status: 500 });
  }
}
