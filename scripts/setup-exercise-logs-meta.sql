-- =============================================================
-- Execution Log enriquecido (Motor Fit-K v1.0): RIR real, reason codes
-- y bloque de densidad, sin tocar las columnas normalizadas existentes
-- (exercise_id, set_number, weight, reps) ni las filas ya guardadas.
-- Pega este SQL en Supabase → SQL Editor → Run
-- =============================================================
ALTER TABLE exercise_logs
  ADD COLUMN IF NOT EXISTS meta JSONB;

COMMENT ON COLUMN exercise_logs.meta IS
  'Datos opcionales del Motor v1.0 para esta serie: { rirActual?, reasonCodes?, densityBlockId? }.';
