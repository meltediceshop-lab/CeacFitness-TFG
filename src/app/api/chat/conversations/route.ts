import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatKeyMode, chatTitle, isChatKey, type CoachChatSummary } from '@/lib/coachChats';

/** Lista de conversaciones del Coach (la más reciente primero). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: [] });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('mode, role, content, created_at')
      .eq('user_id', user.id)
      .not('mode', 'is', null)
      .order('created_at', { ascending: true })
      .limit(5000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    type Acc = CoachChatSummary & { first?: string };
    const byKey = new Map<string, Acc>();
    for (const row of data ?? []) {
      const key = row.mode as string;
      if (!isChatKey(key)) continue;
      const cur: Acc = byKey.get(key) ?? { key, mode: chatKeyMode(key), title: '', updatedAt: row.created_at, count: 0 };
      cur.count += 1;
      cur.updatedAt = row.created_at;
      if (!cur.first && row.role === 'user') cur.first = row.content;
      byKey.set(key, cur);
    }
    const list: CoachChatSummary[] = [...byKey.values()]
      .map(({ first, ...c }) => ({ ...c, title: chatTitle(first) }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ data: list });
  } catch (err) {
    console.error('[chat conversations GET]', err);
    return NextResponse.json({ error: 'Error al cargar las conversaciones' }, { status: 500 });
  }
}

/** Borra una conversación entera. */
export async function DELETE(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key');
    if (!isChatKey(key)) return NextResponse.json({ error: 'Conversación no válida' }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { error } = await supabase.from('chat_messages').delete().eq('user_id', user.id).eq('mode', key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[chat conversations DELETE]', err);
    return NextResponse.json({ error: 'Error al borrar la conversación' }, { status: 500 });
  }
}
