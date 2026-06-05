import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
  }

  // Usar admin client para crear el usuario ya confirmado (bypasea email confirmation)
  const adminClient = createAdminClient();
  const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (adminError) {
    const msg = adminError.message.includes('already registered')
      ? 'Este email ya está registrado'
      : adminError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Hacer login inmediatamente para establecer la sesión con cookies
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}
