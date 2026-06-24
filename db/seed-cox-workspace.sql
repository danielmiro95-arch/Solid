-- ============================================================
-- COX · workspace nuevo + 6 cursos + 30 pills (5 por curso)
-- ----------------------------------------------------------------
-- Generado tras solicitud del cliente · workspace full (no demo)
-- mismo branding que HdR (borgoña #810404) · sin restricciones de
-- demo_mode · 6 cursos con nombres exactos y 5 pills placeholder
-- por curso (totalmente editables luego desde admin).
--
-- Aplicación:
--   · MCP Supabase: ejecutar este script con execute_sql
--   · O · Supabase Studio (SQL Editor) → pegar y Run
--   · O · supabase db push (si se mueve a migrations/)
--
-- Idempotente · usa ON CONFLICT (slug) DO NOTHING en workspace, y
-- comprueba existencia previa en paths/pills para que se pueda
-- re-ejecutar sin duplicar.
-- ============================================================

DO $$
DECLARE
  v_workspace_id uuid;
BEGIN
  -- 1. WORKSPACE COX
  INSERT INTO public.workspaces (name, slug, primary_color, settings)
  VALUES (
    'COX',
    'cox',
    '#810404',  -- borgoña (mismo que Hijos de Rivera)
    jsonb_build_object(
      'allowSignup', false,
      'defaultLang', 'es',
      'path_label', 'Curso',
      'path_label_plural', 'Cursos'
    )
  )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name,
        primary_color = EXCLUDED.primary_color,
        settings = EXCLUDED.settings
  RETURNING id INTO v_workspace_id;

  -- 2. 6 CURSOS (workspace_content kind='path')
  INSERT INTO public.workspace_content
    (workspace_id, kind, slug, title, teacher, duration, tone, format, level, category, position, metadata)
  SELECT
    v_workspace_id,
    'path',
    p.slug,
    p.title,
    '5 pills · por configurar',
    'Por definir',
    p.tone,
    'ruta',
    'Intermedio',
    p.category,
    p.position,
    jsonb_build_object(
      'accent', p.accent,
      'poster_url', '',
      'cert_url', ''
    )
  FROM (VALUES
    (1, 'cox-1-bienvenido',     'Bienvenido a COX',                 'noir', 'Onboarding',    '#810404'),
    (2, 'cox-2-valores',        'Nuestros valores y cultura',       'clay', 'Cultura',       '#BCD630'),
    (3, 'cox-3-estrategia',     'Nuestra estrategia',               'noir', 'Estrategia',    '#8A3992'),
    (4, 'cox-4-procesos',       'Procesos clave',                   'clay', 'Operaciones',   '#F3A525'),
    (5, 'cox-5-dia-a-dia',      'Tu día a día',                     'noir', 'Productividad', '#0072BE'),
    (6, 'cox-6-futuro',         'Construye tu futuro con nosotros', 'clay', 'Desarrollo',    '#FC220D')
  ) AS p(position, slug, title, tone, category, accent)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspace_content wc
    WHERE wc.workspace_id = v_workspace_id AND wc.slug = p.slug
  );

  -- 3. 30 PILLS · 5 por cada curso
  INSERT INTO public.pills
    (workspace_id, pill_number, slug, title, one_liner, teacher, duration, tone, format, level, category, position, path_id, metadata)
  SELECT
    v_workspace_id,
    (np.position - 1) * 5 + n,
    'cox-' || np.position || '-pill-' || n,
    'Pill ' || n || ' · ' || np.title,
    'Pill ' || n || ' del curso ' || np.title,
    'BeonIt × COX',
    '4 min',
    'noir',
    'módulo',
    'intermedio',
    np.category,
    n,
    np.id,
    jsonb_build_object('description', '')
  FROM public.workspace_content np
  CROSS JOIN generate_series(1, 5) n
  WHERE np.workspace_id = v_workspace_id
    AND np.kind = 'path'
    AND np.slug LIKE 'cox-%'
    AND NOT EXISTS (
      SELECT 1 FROM public.pills pp
      WHERE pp.workspace_id = v_workspace_id
        AND pp.pill_number = (np.position - 1) * 5 + n
    );

  -- Verificación
  RAISE NOTICE 'COX workspace_id: %', v_workspace_id;
  RAISE NOTICE 'Paths creados: %', (SELECT COUNT(*) FROM public.workspace_content WHERE workspace_id = v_workspace_id AND kind = 'path');
  RAISE NOTICE 'Pills creadas: %', (SELECT COUNT(*) FROM public.pills WHERE workspace_id = v_workspace_id);
END $$;

-- Para verificar después de ejecutar:
-- SELECT id, name, slug, primary_color FROM workspaces WHERE slug = 'cox';
-- SELECT slug, title, position FROM workspace_content WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox') ORDER BY position;
-- SELECT pill_number, title, path_id FROM pills WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox') ORDER BY pill_number;
