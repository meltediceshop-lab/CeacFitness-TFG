-- =============================================================
-- Duración de 40 minutos por sesión (Motor V1, Word del 20/11/2026)
-- Amplía los valores admitidos en user_onboarding.workout_duration.
-- Sin esta migración, quien elija 40 minutos queda guardado con 45.
-- Pega este SQL en Supabase → SQL Editor → Run
-- =============================================================
ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_workout_duration_check;
ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_workout_duration_check
  CHECK (workout_duration = ANY (ARRAY[
    '30min'::text, '40min'::text, '45min'::text, '1hour'::text, 'depends'::text
  ]));
