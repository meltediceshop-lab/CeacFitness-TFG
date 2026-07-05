import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { data: posts, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: myReactions } = await supabase
      .from('community_reactions')
      .select('post_id, reaction')
      .eq('user_id', user.id);

    const { data: reactionCounts } = await supabase
      .from('community_reactions')
      .select('post_id');

    const { data: commentCounts } = await supabase
      .from('community_comments')
      .select('post_id');

    const { data: comments } = await supabase
      .from('community_comments')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200);

    const myReactionMap = new Map((myReactions || []).map(r => [r.post_id, r.reaction]));
    const reactionCountMap = new Map<string, number>();
    for (const r of reactionCounts || []) {
      reactionCountMap.set(r.post_id, (reactionCountMap.get(r.post_id) || 0) + 1);
    }
    const commentCountMap = new Map<string, number>();
    for (const c of commentCounts || []) {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    }
    const commentsByPost = new Map<string, typeof comments>();
    for (const c of comments || []) {
      if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
      commentsByPost.get(c.post_id)!.push(c);
    }

    const enriched = (posts || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      type: p.type,
      content: p.content,
      workoutName: p.workout_name,
      workoutDuration: p.workout_duration,
      workoutExercises: p.workout_exercises,
      photoUrl: p.photo_url,
      createdAt: p.created_at,
      myReaction: myReactionMap.get(p.id) ?? null,
      reactionCount: reactionCountMap.get(p.id) ?? 0,
      commentCount: commentCountMap.get(p.id) ?? 0,
      comments: (commentsByPost.get(p.id) || []).slice(0, 3).map(c => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        displayName: c.display_name,
        content: c.content,
        createdAt: c.created_at,
      })),
    }));

    return NextResponse.json({ data: enriched });
  } catch (err) {
    console.error('[community/posts GET]', err);
    return NextResponse.json({ error: 'Error al cargar posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = await req.json();
    const { type, content, workoutName, workoutDuration, workoutExercises, displayName, avatarUrl, photoUrl } = body;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        display_name: displayName || 'Miembro',
        avatar_url: avatarUrl || null,
        type,
        content: content || null,
        workout_name: workoutName || null,
        workout_duration: workoutDuration || null,
        workout_exercises: workoutExercises || null,
        photo_url: photoUrl || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[community/posts POST]', err);
    return NextResponse.json({ error: 'Error al crear post' }, { status: 500 });
  }
}

// Editar el contenido de una publicación propia
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { postId, content } = await req.json();
    if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 });

    const admin = createAdminClient();
    // Verificar propiedad antes de editar
    const { data: post } = await admin
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post) return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    if (post.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { error } = await admin
      .from('community_posts')
      .update({ content: (content ?? '').toString().slice(0, 280) || null })
      .eq('id', postId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[community/posts PATCH]', err);
    return NextResponse.json({ error: 'Error al editar la publicación' }, { status: 500 });
  }
}

// Borrar una publicación propia (con sus reacciones y comentarios)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId') || (await req.json().catch(() => ({})))?.postId;
    if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 });

    const admin = createAdminClient();
    // Verificar propiedad antes de borrar
    const { data: post } = await admin
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post) return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    if (post.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    // Limpiar dependencias (por si no hay ON DELETE CASCADE) y luego el post
    await admin.from('community_reactions').delete().eq('post_id', postId);
    await admin.from('community_comments').delete().eq('post_id', postId);
    const { error } = await admin.from('community_posts').delete().eq('id', postId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[community/posts DELETE]', err);
    return NextResponse.json({ error: 'Error al borrar la publicación' }, { status: 500 });
  }
}
