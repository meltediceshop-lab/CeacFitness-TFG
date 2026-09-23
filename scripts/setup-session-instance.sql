-- =============================================================
-- Daily Adapter — Session Instance (Motor Fit-K v1.0, MOTOR-STATE-MASTER)
-- Columna aditiva y nullable: guarda los ejercicios REALMENTE presentados
-- ese día (tras adaptar por energía/tiempo), sin tocar weekly_sessions
-- (el Plan Base). No rompe filas existentes ni código que no la use.
-- Pega este SQL en Supabase → SQL Editor → Run
-- =============================================================
ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS session_instance JSONB;

COMMENT ON COLUMN workout_sessions.session_instance IS
  'Ejercicios efectivamente presentados en esta sesión, tras el Daily Adapter (energía/tiempo). El Plan Base sigue intacto en weekly_sessions.exercises.';
