-- ============================================================
-- COX · asignar 6 imágenes de preview a los 6 cursos
-- ----------------------------------------------------------------
-- URLs públicas del bucket COX (mayúsculas).
-- Cada curso recibe su poster_url en metadata jsonb (preserva
-- accent y cert_url existentes).
--
-- Asignación en orden 1:1 (curso N ← imagen N en el orden enviado
-- por el cliente). Si quiere otro mapeo, basta con reordenar las
-- líneas v_poster_N.
-- ============================================================

DO $$
DECLARE
  v_workspace_id uuid;
  v_count int;
  v_base text := 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/COX/';
  v_poster_1 text;
  v_poster_2 text;
  v_poster_3 text;
  v_poster_4 text;
  v_poster_5 text;
  v_poster_6 text;
BEGIN
  SELECT id INTO v_workspace_id FROM public.workspaces WHERE slug = 'cox';
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX no existe · ejecuta antes seed-cox-workspace.sql';
  END IF;

  v_poster_1 := v_base || '555be7a7-64df-41ef-b92f-83f2cf4725b1_alta-libre-aspect-ratio_default_0.jpg';
  v_poster_2 := v_base || 'businesswoman-showing-photovoltaics-plant-assets-shareholders-pitch.jpg';
  v_poster_3 := v_base || 'low-angle-view-modern-buildings.jpg';
  v_poster_4 := v_base || 'management-executives-talk-about-factory-automation-strategies.jpg';
  v_poster_5 := v_base || 'renewable-energy-environment-psd-solar-panel-remixed-media.jpg';
  v_poster_6 := v_base || 'specialist-technician-professional-engineer-with-laptop-tablet-maintenance-checking-installing-solar-roof-panel-factory-rooftop-sunlight-engineers-team-survey-check-solar-panel-roof.jpg';

  -- Curso 1 · Bienvenido a COX
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_1))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-1-bienvenido';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 1 (Bienvenido a COX) → poster 1 · % fila(s)', v_count;

  -- Curso 2 · Nuestros valores y cultura
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_2))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-2-valores';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 2 (Nuestros valores y cultura) → poster 2 · % fila(s)', v_count;

  -- Curso 3 · Nuestra estrategia
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_3))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-3-estrategia';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 3 (Nuestra estrategia) → poster 3 · % fila(s)', v_count;

  -- Curso 4 · Procesos clave
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_4))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-4-procesos';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 4 (Procesos clave) → poster 4 · % fila(s)', v_count;

  -- Curso 5 · Tu día a día
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_5))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-5-dia-a-dia';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 5 (Tu día a día) → poster 5 · % fila(s)', v_count;

  -- Curso 6 · Construye tu futuro con nosotros
  UPDATE public.workspace_content
     SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{poster_url}', to_jsonb(v_poster_6))
   WHERE workspace_id = v_workspace_id AND slug = 'cox-6-futuro';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Curso 6 (Construye tu futuro con nosotros) → poster 6 · % fila(s)', v_count;
END $$;

-- Verificar:
-- SELECT slug, title, metadata->>'poster_url' AS poster
-- FROM workspace_content
-- WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox')
-- ORDER BY position;
