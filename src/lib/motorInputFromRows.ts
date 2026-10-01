import type { MotorInput } from '@/lib/fitkMotor';
import type { MuscleGroup } from '@/types/user';

/** Filas de Supabase (user_onboarding + user_profiles) → entrada del Motor (lado servidor). */
export function motorInputFromRows(
  userId: string,
  ob: Record<string, unknown> | null,
  profile: Record<string, unknown> | null,
): MotorInput {
  return {
    daysPerWeek: (ob?.days_per_week as number) ?? 3,
    workoutDuration: (ob?.workout_duration as string) ?? '45min',
    goal: ((ob?.beginner_goal ?? ob?.advanced_goal) as string | undefined) ?? undefined,
    level: (ob?.level as 'beginner' | 'advanced' | undefined) ?? undefined,
    priorityMuscle: (ob?.priority_muscle as MuscleGroup | undefined) ?? undefined,
    injuries: (profile?.injuries as string[]) ?? [],
    excludedExercises: (profile?.excluded_exercises as string[]) ?? [],
    weight: (profile?.weight as number | undefined) ?? undefined,
    height: (profile?.height as number | undefined) ?? undefined,
    biologicalProfile: (profile?.biological_profile as 'male' | 'female' | undefined) ?? undefined,
    otherSports: (profile?.other_sports as string[]) ?? [],
    otherSportsDays: (profile?.other_sports_days as number) ?? 0,
    userId,
  };
}
