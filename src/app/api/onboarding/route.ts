import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { level, profile, ...onboardingData } = body;

  // Guardar preferencias de onboarding
  let { error: onboardingError } = await supabase
    .from('user_onboarding')
    .upsert({ user_id: user.id, level, ...onboardingData });

  // 40 minutos necesita scripts/setup-duracion-40.sql. Sin esa migración la
  // base de datos rechaza el valor: se guarda con 45 para no perder el
  // onboarding y se avisa en el registro del servidor.
  if (onboardingError && onboardingData.workout_duration === '40min' && onboardingError.message.includes('workout_duration')) {
    console.warn('[onboarding] 40min no admitido (¿falta la migración setup-duracion-40.sql?): se guarda 45min');
    ({ error: onboardingError } = await supabase
      .from('user_onboarding')
      .upsert({ user_id: user.id, level, ...onboardingData, workout_duration: '45min' }));
  }

  if (onboardingError) {
    return NextResponse.json({ error: onboardingError.message }, { status: 500 });
  }

  // Guardar perfil fisico si viene incluido
  if (profile) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name: profile.name,
        biological_profile: profile.biologicalProfile,
        weight: profile.weight,
        height: profile.height,
        age_range: profile.ageRange,
        other_sports: profile.otherSports,
        other_sports_days: profile.otherSportsDays,
        injuries: profile.injuries,
        excluded_exercises: profile.excludedExercises,
        measurements: profile.measurements,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// PATCH → ajustes del entrenamiento desde el perfil: días por semana y duración habitual.
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (Number.isInteger(body.days_per_week) && body.days_per_week >= 1 && body.days_per_week <= 6) update.days_per_week = body.days_per_week;
  if (['30min', '40min', '45min', '1hour'].includes(body.workout_duration)) update.workout_duration = body.workout_duration;
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

  const { error } = await supabase.from('user_onboarding').update(update).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ data: null });
  return NextResponse.json({ data });
}
