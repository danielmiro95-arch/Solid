-- ============================================================
-- COX · asignar 2 vídeos del bucket Storage a pills concretas
-- ----------------------------------------------------------------
-- Vídeos en bucket público 'cox' · URL pattern:
--   https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/cox/<archivo>
--
-- Asignación pedida por el cliente:
--   · Vídeo 1 → Curso 1 "Bienvenido a COX" · pill 1
--   · Vídeo 2 → Curso 2 "Nuestros valores y cultura" · pill 6
--
-- INSTRUCCIONES · cambia los 2 nombres de archivo de abajo
-- (líneas v_video_1 y v_video_2) por los nombres reales que
-- subiste al bucket cox. Pueden ser .mp4, .webm, etc.
-- ============================================================

DO $$
DECLARE
  -- ⬇️ CAMBIA ESTOS 2 NOMBRES POR LOS ARCHIVOS REALES DEL BUCKET cox ⬇️
  v_video_1 text := 'video-bienvenida.mp4';
  v_video_2 text := 'video-valores.mp4';
  -- ⬆️ NOMBRES DE ARCHIVO DEL BUCKET cox ⬆️

  v_base   text := 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/cox/';
  v_url_1  text;
  v_url_2  text;
  v_workspace_id uuid;
  v_count int;
BEGIN
  SELECT id INTO v_workspace_id FROM public.workspaces WHERE slug = 'cox';
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX no existe · ejecuta antes seed-cox-workspace.sql';
  END IF;

  v_url_1 := v_base || v_video_1;
  v_url_2 := v_base || v_video_2;

  -- Pill 1 (curso 1 "Bienvenido a COX") · mp4 = vídeo 1
  UPDATE public.pills
     SET mp4 = v_url_1
   WHERE workspace_id = v_workspace_id AND pill_number = 1;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Pill 1 actualizada (% fila) · %', v_count, v_url_1;

  -- Pill 6 (curso 2 "Nuestros valores y cultura" · primera del curso 2) · mp4 = vídeo 2
  UPDATE public.pills
     SET mp4 = v_url_2
   WHERE workspace_id = v_workspace_id AND pill_number = 6;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Pill 6 actualizada (% fila) · %', v_count, v_url_2;
END $$;

-- Verificar:
-- SELECT pill_number, title, mp4 FROM pills
-- WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox')
--   AND pill_number IN (1, 6);
