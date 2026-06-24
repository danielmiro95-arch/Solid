-- ============================================================
-- COX · asignar los 2 vídeos reales a pills 1 y 6
-- ----------------------------------------------------------------
-- URLs públicas confirmadas por el cliente (bucket COX, mayúsculas):
--   · 1.mp4 → Pill 1 (Curso 1 "Bienvenido a COX")
--   · 2.mp4 → Pill 6 (Curso 2 "Nuestros valores y cultura")
--
-- Copy-paste directo · ya no hay que editar nada · solo Run.
-- ============================================================

DO $$
DECLARE
  v_workspace_id uuid;
  v_count int;
  v_url_1 text := 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/COX/1.mp4';
  v_url_2 text := 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/COX/2.mp4';
BEGIN
  SELECT id INTO v_workspace_id FROM public.workspaces WHERE slug = 'cox';
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX no existe · ejecuta antes seed-cox-workspace.sql';
  END IF;

  -- Pill 1 (curso 1 "Bienvenido a COX") · 1.mp4
  UPDATE public.pills SET mp4 = v_url_1
   WHERE workspace_id = v_workspace_id AND pill_number = 1;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Pill 1 → 1.mp4 · % fila(s)', v_count;

  -- Pill 6 (curso 2 "Nuestros valores y cultura") · 2.mp4
  UPDATE public.pills SET mp4 = v_url_2
   WHERE workspace_id = v_workspace_id AND pill_number = 6;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Pill 6 → 2.mp4 · % fila(s)', v_count;
END $$;

-- Verificar:
-- SELECT pill_number, title, mp4 FROM pills
-- WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox')
--   AND pill_number IN (1, 6);
