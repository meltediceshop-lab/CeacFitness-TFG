-- =============================================================
-- Chats separados por modo de Coach (Nutrición / Gimnasio / Aire libre)
-- Ejecutar UNA VEZ en Supabase Dashboard → SQL Editor
-- =============================================================
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS mode TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_mode
  ON chat_messages(user_id, mode, created_at);
