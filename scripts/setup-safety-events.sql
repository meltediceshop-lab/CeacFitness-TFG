-- =============================================================
-- Safety Flow Fit-K v1.0 (SAFE-001, sección 11 de la Especificación
-- de Implementación): registro estructurado de eventos de molestia.
-- Antes solo existía texto libre en user_reviews.answers.discomfort;
-- esta tabla permite registrar el evento por ejercicio, cancelar sin
-- diagnosticar, y ofrecer una exclusión temporal pendiente de revisión
-- (SupervisorState.exclusions_to_review).
-- Pega este SQL en Supabase → SQL Editor → Run
-- =============================================================
CREATE TABLE IF NOT EXISTS safety_events (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_session_id  UUID        REFERENCES workout_sessions(id) ON DELETE SET NULL,
  exercise_id         TEXT        NOT NULL,   -- libraryId del ejercicio (fitkLibrary.ts)
  exercise_name       TEXT,
  event_type          TEXT        NOT NULL DEFAULT 'discomfort' CHECK (event_type IN ('discomfort')),
  temporary_exclusion BOOLEAN     NOT NULL DEFAULT TRUE,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_events_user ON safety_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_events_pending
  ON safety_events(user_id) WHERE reviewed_at IS NULL;

ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "safety_events_select" ON safety_events;
CREATE POLICY "safety_events_select" ON safety_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "safety_events_insert" ON safety_events;
CREATE POLICY "safety_events_insert" ON safety_events FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "safety_events_update" ON safety_events;
CREATE POLICY "safety_events_update" ON safety_events FOR UPDATE USING (auth.uid() = user_id);
