-- ─────────────────────────────────────────────────────────────────────
-- Historial semanal archivado (las "semanas cerradas" del acordeón de Historial)
-- Cada fila = una semana completa con sus sesiones guardadas como JSONB
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weekly_history (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER      NOT NULL,
  sessions    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  started_at  TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ  DEFAULT NOW(),
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_history_user_week
  ON weekly_history(user_id, week_number DESC);

ALTER TABLE weekly_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='weekly_history_select' AND tablename='weekly_history') THEN
    CREATE POLICY "weekly_history_select" ON weekly_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='weekly_history_insert' AND tablename='weekly_history') THEN
    CREATE POLICY "weekly_history_insert" ON weekly_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='weekly_history_update' AND tablename='weekly_history') THEN
    CREATE POLICY "weekly_history_update" ON weekly_history FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='weekly_history_delete' AND tablename='weekly_history') THEN
    CREATE POLICY "weekly_history_delete" ON weekly_history FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
