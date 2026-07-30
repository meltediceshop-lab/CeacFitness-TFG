-- Historial completo de mediciones corporales
-- Ejecutar en: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS body_measurements (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at DATE         NOT NULL DEFAULT CURRENT_DATE,
  weight      NUMERIC(5,2),
  chest       NUMERIC(5,1),
  waist       NUMERIC(5,1),
  hips        NUMERIC(5,1),
  glutes      NUMERIC(5,1),
  arms        NUMERIC(5,1),
  forearms    NUMERIC(5,1),
  thighs      NUMERIC(5,1),
  calves      NUMERIC(5,1),
  photo_url   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date
  ON body_measurements(user_id, recorded_at DESC);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metrics_select" ON body_measurements;
CREATE POLICY "metrics_select" ON body_measurements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "metrics_insert" ON body_measurements;
CREATE POLICY "metrics_insert" ON body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "metrics_delete" ON body_measurements;
CREATE POLICY "metrics_delete" ON body_measurements
  FOR DELETE USING (auth.uid() = user_id);
