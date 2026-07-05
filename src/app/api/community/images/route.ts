import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No se ha enviado ningún archivo' }, { status: 400 });

  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();

  // Crear bucket si no existe (idempotente)
  await admin.storage.createBucket('community-images', { public: true }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from('community-images')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from('community-images').getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
