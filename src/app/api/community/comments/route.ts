import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const postId = req.nextUrl.searchParams.get('postId');
    if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 });

    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[community/comments GET]', err);
    return NextResponse.json({ error: 'Error al cargar comentarios' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { postId, content, displayName } = await req.json();
    if (!content?.trim() || content.length > 150) {
      return NextResponse.json({ error: 'Contenido inválido (máx 150 caracteres)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        display_name: displayName || 'Miembro',
        content: content.trim(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[community/comments POST]', err);
    return NextResponse.json({ error: 'Error al comentar' }, { status: 500 });
  }
}
