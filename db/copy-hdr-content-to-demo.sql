-- ============================================================================
-- Copiar contenido del workspace "Hijos de Rivera" (original) al "Hijos de
-- Rivera Demo". Crea los 11 comportamientos como cursos + todas sus pills.
-- ============================================================================
-- Pegar entero en Supabase SQL Editor. Idempotente: cada vez que se corre,
-- limpia el demo y vuelve a copiar el contenido del workspace original.
-- ============================================================================

DO $$
DECLARE
  src_ws uuid;
  dst_ws uuid;
  has_path_id boolean;
  n_paths int;
  n_pills int;
BEGIN
  -- Resolver workspaces · busca el original por name "Hijos de Rivera"
  -- (acepta Rivera/Ribera y excluye cualquier slug que contenga "demo")
  SELECT id INTO src_ws
  FROM public.workspaces
  WHERE (name ILIKE '%hijos%de%rivera%' OR name ILIKE '%hijos%de%ribera%'
         OR slug ILIKE 'hijos-de-rivera' OR slug ILIKE 'hijos-de-ribera')
    AND COALESCE(slug,'') NOT ILIKE '%demo%'
    AND COALESCE(name,'') NOT ILIKE '%demo%'
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO dst_ws
  FROM public.workspaces
  WHERE slug = 'hijos-de-rivera-demo'
  LIMIT 1;

  IF src_ws IS NULL THEN
    RAISE EXCEPTION 'No encuentro workspace original "Hijos de Rivera". Crea el workspace original antes de correr este script.';
  END IF;
  IF dst_ws IS NULL THEN
    RAISE EXCEPTION 'No encuentro workspace destino "hijos-de-rivera-demo". Corre primero db/seed-hijos-de-rivera-demo.sql.';
  END IF;

  RAISE NOTICE 'Origen: %', src_ws;
  RAISE NOTICE 'Destino: %', dst_ws;

  -- ──────────────────────────────────────────────────────────────────────
  -- Limpieza del demo (sólo contenido · NO toca workspace, members ni settings)
  -- ──────────────────────────────────────────────────────────────────────
  DELETE FROM public.pills WHERE workspace_id = dst_ws;
  DELETE FROM public.workspace_content WHERE workspace_id = dst_ws;

  -- ──────────────────────────────────────────────────────────────────────
  -- Copiar workspace_content (paths/series/reels/podcasts) del origen
  -- ──────────────────────────────────────────────────────────────────────
  INSERT INTO public.workspace_content (
    workspace_id, kind, slug, title, teacher, duration, tone, format, level,
    rating, enrolled, category, position, metadata
  )
  SELECT
    dst_ws, kind, slug, title, teacher, duration, tone, format, level,
    rating, enrolled, category, position, metadata
  FROM public.workspace_content
  WHERE workspace_id = src_ws;

  GET DIAGNOSTICS n_paths = ROW_COUNT;
  RAISE NOTICE 'Cursos/paths copiados: %', n_paths;

  -- ──────────────────────────────────────────────────────────────────────
  -- Copiar pills · con remap de path_id si la columna existe
  -- ──────────────────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pills' AND column_name = 'path_id'
  ) INTO has_path_id;

  IF has_path_id THEN
    -- Remap: para cada pill del origen, busca el path destino que tenga
    -- el mismo slug que el path origen referido por p.path_id.
    EXECUTE format($exec$
      INSERT INTO public.pills (
        workspace_id, pill_number, slug, title, one_liner, teacher, duration,
        tone, format, level, rating, enrolled, category, yt, mp4, poster,
        featured, new_badge, position, path_id
      )
      SELECT
        %1$L::uuid,
        p.pill_number, p.slug, p.title, p.one_liner, p.teacher, p.duration,
        p.tone, p.format, p.level, p.rating, p.enrolled, p.category, p.yt, p.mp4, p.poster,
        p.featured, p.new_badge, p.position,
        (SELECT dst.id
           FROM public.workspace_content dst
           JOIN public.workspace_content src
             ON src.kind = dst.kind AND src.slug = dst.slug
          WHERE dst.workspace_id = %1$L::uuid
            AND src.id = p.path_id
          LIMIT 1) AS path_id
      FROM public.pills p
      WHERE p.workspace_id = %2$L::uuid
    $exec$, dst_ws, src_ws);
  ELSE
    INSERT INTO public.pills (
      workspace_id, pill_number, slug, title, one_liner, teacher, duration,
      tone, format, level, rating, enrolled, category, yt, mp4, poster,
      featured, new_badge, position
    )
    SELECT
      dst_ws,
      p.pill_number, p.slug, p.title, p.one_liner, p.teacher, p.duration,
      p.tone, p.format, p.level, p.rating, p.enrolled, p.category, p.yt, p.mp4, p.poster,
      p.featured, p.new_badge, p.position
    FROM public.pills p
    WHERE p.workspace_id = src_ws;
  END IF;

  GET DIAGNOSTICS n_pills = ROW_COUNT;
  RAISE NOTICE 'Pills copiadas: %', n_pills;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Verificación · cuenta lo que quedó en el demo
-- ────────────────────────────────────────────────────────────────────────────
SELECT
  w.name AS workspace,
  (SELECT COUNT(*) FROM public.workspace_content wc WHERE wc.workspace_id = w.id AND wc.kind = 'path') AS cursos,
  (SELECT COUNT(*) FROM public.pills            p WHERE p.workspace_id  = w.id) AS pills
FROM public.workspaces w
WHERE w.slug IN ('hijos-de-rivera-demo','hijos-de-rivera','hijos-de-ribera')
   OR w.name ILIKE '%hijos%de%rivera%'
   OR w.name ILIKE '%hijos%de%ribera%'
ORDER BY w.name;

-- Lista de los cursos copiados (deberías ver los 11 comportamientos)
SELECT
  wc.position, wc.slug, wc.title, wc.level, wc.category
FROM public.workspace_content wc
JOIN public.workspaces w ON w.id = wc.workspace_id
WHERE w.slug = 'hijos-de-rivera-demo' AND wc.kind = 'path'
ORDER BY wc.position, wc.title;
