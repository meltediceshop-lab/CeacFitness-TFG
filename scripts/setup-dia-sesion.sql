-- =============================================================
-- Día de entreno de cada sesión (calendario de la semana)
-- Pega este SQL en Supabase → SQL Editor → Run
-- =============================================================
ALTER TABLE weekly_sessions ADD COLUMN IF NOT EXISTS day_of_week smallint
  CHECK (day_of_week BETWEEN 0 AND 6);
