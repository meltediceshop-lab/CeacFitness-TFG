-- =============================================================
-- Revisiones periódicas Fit-K (cada 4-6 semanas)
-- Guarda las respuestas del usuario + la decisión del Motor
-- =============================================================
CREATE TABLE IF NOT EXISTS user_reviews (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers       JSONB        NOT NULL,
  weight        NUMERIC(5,2),
  motor_action  TEXT,
  coach_message TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_user ON user_reviews(user_id, created_at DESC);

ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON user_reviews;
CREATE POLICY "reviews_select" ON user_reviews FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_insert" ON user_reviews;
CREATE POLICY "reviews_insert" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
