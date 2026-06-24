-- ============================================================
-- COX · FIX · añadir al usuario como owner + member
-- ----------------------------------------------------------------
-- El seed (seed-cox-workspace.sql) creó el workspace COX pero NO
-- añadió ningún miembro · el selector de workspaces solo muestra
-- los workspaces donde el user es member (RLS filtra el resto) ·
-- por eso COX existe en BD pero no se ve en la app.
--
-- Este script:
--   1. Setea owner_id del workspace COX = profile del admin
--   2. Inserta al admin en workspace_members con role 'owner'
--
-- Cambia el email de abajo si el admin que debe ver COX es otro.
-- Por defecto · daamiro@beonit.es (admin de plataforma).
-- ============================================================

DO $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid;
BEGIN
  -- Workspace COX
  SELECT id INTO v_workspace_id FROM public.workspaces WHERE slug = 'cox';
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX no existe · ejecuta antes seed-cox-workspace.sql';
  END IF;

  -- Usuario admin (cambiar email si procede)
  SELECT id INTO v_user_id FROM public.profiles WHERE email = 'daamiro@beonit.es';
  IF v_user_id IS NULL THEN
    -- Fallback · primer admin de plataforma
    SELECT id INTO v_user_id FROM public.profiles
    WHERE is_admin = true OR system_role = 'admin'
    ORDER BY created_at LIMIT 1;
  END IF;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró usuario admin · revisa el email';
  END IF;

  -- 1. owner_id del workspace
  UPDATE public.workspaces SET owner_id = v_user_id WHERE id = v_workspace_id;

  -- 2. membership como owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'owner')
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner';

  RAISE NOTICE 'COX workspace_id: % · owner/member: %', v_workspace_id, v_user_id;
END $$;

-- Verificar:
-- SELECT w.name, w.slug, w.owner_id, m.user_id, m.role, p.email
-- FROM workspaces w
-- LEFT JOIN workspace_members m ON m.workspace_id = w.id
-- LEFT JOIN profiles p ON p.id = m.user_id
-- WHERE w.slug = 'cox';
