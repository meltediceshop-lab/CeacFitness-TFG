-- =============================================================
-- Base de conocimiento del Coach IA (nutrición y entrenamiento)
-- Ejecutar UNA VEZ en Supabase Dashboard → SQL Editor
-- =============================================================
CREATE TABLE IF NOT EXISTS coach_knowledge (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT         NOT NULL CHECK (category IN ('nutrition', 'gym', 'outdoor', 'calisthenics', 'general')),
  title       TEXT         NOT NULL,
  content     TEXT         NOT NULL,
  tags        TEXT[]       DEFAULT '{}',
  search      TSVECTOR     GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || content)) STORED,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Índices: búsqueda de texto completo + filtro por categoría (escala a miles de filas)
CREATE INDEX IF NOT EXISTS idx_coach_knowledge_search   ON coach_knowledge USING GIN(search);
CREATE INDEX IF NOT EXISTS idx_coach_knowledge_category ON coach_knowledge(category);

-- RLS: cualquier usuario autenticado puede leer, pero solo el service role
-- (usado por scripts/add-knowledge.mjs) puede insertar/editar/borrar.
ALTER TABLE coach_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_select_authenticated" ON coach_knowledge;
CREATE POLICY "knowledge_select_authenticated" ON coach_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');
