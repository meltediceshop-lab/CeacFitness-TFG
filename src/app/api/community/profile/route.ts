import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { libraryById } from '@/lib/fitkLibrary';
import { weekStreakFrom, type CommunityProfileView, type FriendshipState, type ProfileLift, type ProfilePost, type ProfileStats } from '@/lib/communityProfiles';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Fecha en la hora de España (el servidor va en UTC). */
const madrid = (d: Date) => new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));

/** Perfil de una persona. Las estadísticas solo salen si es tuyo, público o sois amigos. */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const param = req.nextUrl.searchParams.get('userId');
    const target = !param || param === 'me' ? user.id : param;
    if (!UUID.test(target)) return NextResponse.json({ error: 'Perfil no válido' }, { status: 400 });
    const isMe = target === user.id;
    const admin = createAdminClient();

    const [{ data: base }, { data: cp }, { data: rel }, { count: friendsCount }] = await Promise.all([
      admin.from('user_profiles').select('name, avatar_url, created_at').eq('id', target).maybeSingle(),
      admin.from('community_profiles').select('bio, is_public').eq('user_id', target).maybeSingle(),
      isMe ? Promise.resolve({ data: null }) : admin.from('community_friendships').select('requester, addressee, status')
        .or(`and(requester.eq.${user.id},addressee.eq.${target}),and(requester.eq.${target},addressee.eq.${user.id})`).maybeSingle(),
      admin.from('community_friendships').select('id', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester.eq.${target},addressee.eq.${target}`),
    ]);

    // Nombre: el del perfil o, si no hay, el de sus publicaciones.
    let name = (base?.name as string | undefined)?.trim();
    if (!name) {
      const { data: p } = await admin.from('community_posts').select('display_name').eq('user_id', target).limit(1).maybeSingle();
      name = (p?.display_name as string | undefined) ?? 'Miembro de Fit K';
    }
    let friendship: FriendshipState = 'none';
    if (rel) friendship = rel.status === 'accepted' ? 'friends' : rel.requester === user.id ? 'outgoing' : 'incoming';
    // Privado si la persona no ha elegido lo contrario (o aún no tiene perfil).
    const isPublic = cp?.is_public ?? false;
    const canView = isMe || isPublic || friendship === 'friends';

    const view: CommunityProfileView = {
      userId: target, name, avatarUrl: (base?.avatar_url as string | undefined) ?? undefined, bio: (cp?.bio as string | undefined) ?? undefined,
      isPublic, isMe, friendship, friendsCount: friendsCount ?? 0, canView,
    };
    if (!canView) return NextResponse.json({ data: view });

    // Totales calculados en la base de datos; aquí solo las fechas recientes (racha y mes).
    const [{ data: agg }, { data: sessions }, { data: posts }] = await Promise.all([
      admin.rpc('community_profile_stats', { p_user: target }),
      admin.from('weekly_sessions').select('completed_at').eq('user_id', target).eq('status', 'completed').not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }).limit(500),
      admin.from('community_posts').select('id, type, content, workout_name, photo_url, created_at').eq('user_id', target).order('created_at', { ascending: false }).limit(30),
    ]);
    const postIds = (posts ?? []).map(p => p.id as string);
    const { count: reactions } = postIds.length
      ? await admin.from('community_reactions').select('post_id', { count: 'exact', head: true }).in('post_id', postIds)
      : { count: 0 };

    const a = (agg ?? {}) as { total_sessions?: number; total_minutes?: number; volume?: number; lifts?: { exercise_id: string; kg: number }[] };
    const dates = (sessions ?? []).map(s => madrid(new Date(s.completed_at as string)));
    const now = madrid(new Date());
    const stats: ProfileStats = {
      totalSessions: Number(a.total_sessions) || 0,
      totalMinutes: Number(a.total_minutes) || 0,
      monthSessions: dates.filter(d => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()).length,
      weekStreak: weekStreakFrom(dates, now),
      totalVolumeKg: Math.round(Number(a.volume) || 0),
      posts: postIds.length,
      reactionsReceived: reactions ?? 0,
      memberSince: (base?.created_at as string | undefined) ?? undefined,
    };
    const lifts: ProfileLift[] = (a.lifts ?? []).map(l => ({ name: libraryById.get(l.exercise_id)?.name ?? l.exercise_id.replace(/[-_]/g, ' '), kg: Number(l.kg) || 0 }));
    const recent: ProfilePost[] = (posts ?? []).slice(0, 12).map(p => ({
      id: p.id as string, type: p.type as 'note' | 'workout', content: (p.content as string) ?? undefined,
      workoutName: (p.workout_name as string) ?? undefined, photoUrl: (p.photo_url as string) ?? undefined, createdAt: p.created_at as string,
    }));
    return NextResponse.json({ data: { ...view, stats, lifts, posts: recent } });
  } catch (err) {
    console.error('[community profile GET]', err);
    return NextResponse.json({ error: 'No se ha podido cargar el perfil' }, { status: 500 });
  }
}

/** Cambia tu biografía o la privacidad de tu perfil. */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const b = await req.json() as { bio?: string; isPublic?: boolean };
    const row: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
    if (typeof b.bio === 'string') row.bio = b.bio.trim().slice(0, 160) || null;
    if (typeof b.isPublic === 'boolean') row.is_public = b.isPublic;
    const { error } = await supabase.from('community_profiles').upsert(row, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[community profile PATCH]', err);
    return NextResponse.json({ error: 'No se ha podido guardar' }, { status: 500 });
  }
}
