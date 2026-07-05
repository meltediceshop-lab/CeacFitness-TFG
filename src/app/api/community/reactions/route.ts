import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { postId, reaction } = await req.json();

    const { data: existing } = await supabase
      .from('community_reactions')
      .select('id, reaction')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      if (existing.reaction === reaction) {
        // Same reaction → remove it (toggle off)
        await supabase.from('community_reactions').delete().eq('id', existing.id);
        return NextResponse.json({ action: 'removed' });
      } else {
        // Different reaction → update
        await supabase.from('community_reactions').update({ reaction }).eq('id', existing.id);
        return NextResponse.json({ action: 'updated', reaction });
      }
    } else {
      await supabase.from('community_reactions').insert({
        post_id: postId,
        user_id: user.id,
        reaction,
      });
      return NextResponse.json({ action: 'added', reaction });
    }
  } catch (err) {
    console.error('[community/reactions POST]', err);
    return NextResponse.json({ error: 'Error al reaccionar' }, { status: 500 });
  }
}
