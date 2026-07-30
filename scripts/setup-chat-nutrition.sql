-- =============================================================
-- PASO 1: Tabla de mensajes del chat de IA
-- =============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role        TEXT         NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Índice para cargar mensajes por usuario más rápido
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, created_at);

-- Row Level Security (usuarios solo ven sus propios mensajes)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_select" ON chat_messages;
CREATE POLICY "chat_select" ON chat_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_insert" ON chat_messages;
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_delete" ON chat_messages;
CREATE POLICY "chat_delete" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- =============================================================
-- PASO 2: Columnas de nutrición en user_profiles
-- =============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nutrition_profile              JSONB,
  ADD COLUMN IF NOT EXISTS nutrition_plan                 JSONB,
  ADD COLUMN IF NOT EXISTS nutrition_questionnaire_completed BOOLEAN DEFAULT FALSE;

-- =============================================================
-- PASO 3: Columna avatar_url en user_profiles (si no existe)
-- =============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
