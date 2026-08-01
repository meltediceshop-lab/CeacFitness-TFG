-- =============================================================
-- Objetivos v2: añade pérdida de peso, pérdida de grasa y
-- recomposición corporal a los objetivos del onboarding
-- =============================================================
ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_beginner_goal_check;
ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_beginner_goal_check
  CHECK (beginner_goal = ANY (ARRAY[
    'energy'::text, 'feel-better'::text, 'strength'::text, 'routine'::text,
    'lose-weight'::text, 'lose-fat'::text, 'recomp'::text
  ]));

ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_advanced_goal_check;
ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_advanced_goal_check
  CHECK (advanced_goal = ANY (ARRAY[
    'strength'::text, 'physique'::text, 'performance'::text, 'maintain'::text,
    'lose-weight'::text, 'lose-fat'::text, 'recomp'::text
  ]));
