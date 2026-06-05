import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const profile = await request.json();

  const { error } = await supabase
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
