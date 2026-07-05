import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET → historial semanal archivado (semanas más antiguas primero)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { data, error } = await supabase
      .from('weekly_history')
      .select('*')
      .eq('user_id', user.id)
      .order('week_number', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Devolver con el shape que usa el cliente (WeekRecord)
    const records = (data || []).map(w => ({
      weekNumber: w.week_number,
      sessions: w.sessions ?? [],
      startedAt: w.started_at,
      closedAt: w.closed_at,
    }));

    return NextResponse.json({ data: records });
  } catch (err) {
    console.error('[history/weekly GET]', err);
    return NextResponse.json({ error: 'Error al cargar el historial semanal' }, { status: 500 });
  }
}

// POST → archivar una semana (upsert por user_id + week_number)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = await req.json();
    // Acepta un único WeekRecord o un array de ellos
    const records = Array.isArray(body) ? body : [body];

    const rows = records.map((w: Record<string, unknown>) => ({
      user_id: user.id,
      week_number: w.weekNumber,
      sessions: w.sessions ?? [],
      started_at: w.startedAt ?? null,
      closed_at: w.closedAt ?? new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('weekly_history')
      .upsert(rows, { onConflict: 'user_id,week_number' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[history/weekly POST]', err);
    return NextResponse.json({ error: 'Error al guardar el historial semanal' }, { status: 500 });
  }
}
