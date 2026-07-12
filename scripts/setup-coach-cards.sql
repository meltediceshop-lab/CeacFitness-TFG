-- =============================================================
-- Tarjetas del Coach: momentos institucionales (primera semana,
-- nueva semana). Cada una se muestra como mucho una vez por
-- usuario + semana.
-- =============================================================
CREATE TABLE IF NOT EXISTS coach_cards (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_type   TEXT         NOT NULL CHECK (card_type IN ('first_week', 'new_week')),
  week_number INT          NOT NULL,
  shown_at    TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (user_id, card_type, week_number)
);

CREATE INDEX IF NOT EXISTS idx_coach_cards_user ON coach_cards(user_id);

ALTER TABLE coach_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_cards_select" ON coach_cards;
CREATE POLICY "coach_cards_select" ON coach_cards FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "coach_cards_insert" ON coach_cards;
CREATE POLICY "coach_cards_insert" ON coach_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
