import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { level, profile, ...onboardingData } = body;

  // Guardar preferencias de onboarding
  const { error: onboardingError } = await supabase
    .from('user_onboarding')
    .upsert({ user_id: user.id, level, ...onboardingData });

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
