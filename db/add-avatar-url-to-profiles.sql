-- ============================================================================
-- Schema migration · profiles.avatar_url
-- ============================================================================
-- Añade columna avatar_url a profiles para que cualquier user (admin o
-- demo) pueda subir su foto de perfil desde Mi Perfil. Idempotente:
-- safe de re-ejecutar.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Index opcional · útil si en el futuro filtramos por "tiene avatar"
-- (no añade overhead, NULL no se indexa por defecto en btree)
CREATE INDEX IF NOT EXISTS idx_profiles_has_avatar
  ON public.profiles ((avatar_url IS NOT NULL));
