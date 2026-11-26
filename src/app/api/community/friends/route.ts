import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FriendItem, FriendsList } from '@/lib/communityProfiles';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tus amigos y las solicitudes pendientes (recibidas y enviadas). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const { data: rows, error } = await supabase.from('community_friendships')
      .select('requester, addressee, status, created_at, accepted_at')
      .or(`requester.eq.${user.id},addressee.eq.${user.id}`).limit(1000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const others = [...new Set((rows ?? []).map(r => (r.requester === user.id ? r.addressee : r.requester) as string))];
    const names = new Map<string, { name: string; avatarUrl?: string }>();
    if (others.length) {
      const { data: profiles } = await createAdminClient().from('user_profiles').select('id, name, avatar_url').in('id', others);
      for (const p of profiles ?? []) names.set(p.id as string, { name: (p.name as string) || 'Miembro de Fit K', avatarUrl: (p.avatar_url as string) ?? undefined });
    }
    const out: FriendsList = { friends: [], incoming: [], outgoing: [] };
    for (const r of rows ?? []) {
      const other = (r.requester === user.id ? r.addressee : r.requester) as string;
      const item: FriendItem = { userId: other, name: names.get(other)?.name ?? 'Miembro de Fit K', avatarUrl: names.get(other)?.avatarUrl, since: (r.accepted_at ?? r.created_at) as string };
      if (r.status === 'accepted') out.friends.push(item);
      else if (r.addressee === user.id) out.incoming.push(item);
      else out.outgoing.push(item);
    }
    return NextResponse.json({ data: out });
  } catch (err) {
    console.error('[community friends GET]', err);
    return NextResponse.json({ error: 'No se han podido cargar tus amigos' }, { status: 500 });
  }
}

/** Enviar, aceptar, rechazar, cancelar una solicitud o quitar a un amigo. */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const { userId, action } = await req.json() as { userId?: string; action?: 'request' | 'accept' | 'decline' | 'cancel' | 'remove' };
    if (!userId || !UUID.test(userId) || userId === user.id) return NextResponse.json({ error: 'Persona no válida' }, { status: 400 });
    const pair = `and(requester.eq.${user.id},addressee.eq.${userId}),and(requester.eq.${userId},addressee.eq.${user.id})`;
    const { data: existing } = await supabase.from('community_friendships').select('id, requester, addressee, status').or(pair).maybeSingle();

    if (action === 'request') {
      if (existing?.status === 'accepted') return NextResponse.json({ state: 'friends' });
      // Si la otra persona ya te la había enviado, enviarla equivale a aceptar.
      if (existing && existing.addressee === user.id) {
        const { error } = await supabase.from('community_friendships').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ state: 'friends' });
      }
      if (existing) return NextResponse.json({ state: 'outgoing' });
      const { error } = await supabase.from('community_friendships').insert({ requester: user.id, addressee: userId, status: 'pending' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ state: 'outgoing' });
    }
    if (action === 'accept') {
      if (!existing || existing.addressee !== user.id) return NextResponse.json({ error: 'No hay solicitud que aceptar' }, { status: 404 });
      const { error } = await supabase.from('community_friendships').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ state: 'friends' });
    }
    if (action === 'decline' || action === 'cancel' || action === 'remove') {
      if (existing) {
        const { error } = await supabase.from('community_friendships').delete().eq('id', existing.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ state: 'none' });
    }
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err) {
    console.error('[community friends POST]', err);
    return NextResponse.json({ error: 'No se ha podido completar' }, { status: 500 });
  }
}
