-- ============================================================================
-- Función · seed_workspace_starter_pack
-- ============================================================================
-- Siembra un workspace recién creado con contenido de ejemplo profesional
-- para que el admin pueda demostrar la plataforma de inmediato sin tener
-- que cargar contenido manualmente. Inserta 4 cursos + 12 pills cubriendo
-- temas universales de formación corporativa (no específicos de ningún
-- vertical · safe para cualquier industria).
--
-- Uso:
--   SELECT seed_workspace_starter_pack('estrella-galicia');
--   SELECT seed_workspace_starter_pack('bbva');
--
-- Idempotente · si ya hay paths/pills con esos slugs, hace skip via
-- ON CONFLICT DO NOTHING. Devuelve summary con counts.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.seed_workspace_starter_pack(p_workspace_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ws_id      uuid;
  v_paths_in   int;
  v_pills_in   int;
  v_path_id    uuid;
  v_starter_id uuid;
  v_communication_id uuid;
  v_leadership_id uuid;
  v_productivity_id uuid;
BEGIN
  SELECT id INTO v_ws_id FROM public.workspaces WHERE slug = p_workspace_slug LIMIT 1;
  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'No existe workspace con slug "%"', p_workspace_slug;
  END IF;

  -- 1) Cursos starter pack · 4 universales + accent del manual beonit
  INSERT INTO public.workspace_content (
    workspace_id, kind, slug, title, teacher, duration, tone, format, level,
    rating, enrolled, category, position, metadata
  )
  SELECT v_ws_id, 'path', x.slug, x.title, x.teacher, x.duration, x.tone, x.format, x.level,
         x.rating, x.enrolled, x.category, x.position, jsonb_build_object('accent', x.accent)
  FROM (VALUES
    ('starter-bienvenida',  'Bienvenida a la plataforma', 'Equipo de Formación', '20 min · 3 módulos', 'teal',   'curso', 'Básico', 4.9, 0, 'Introducción', 1, '#0072BE'),
    ('starter-comunicacion','Comunicación efectiva',      'Equipo de Formación', '1 h · 3 módulos',     'amber',  'curso', 'Básico', 4.8, 0, 'Comunicación', 2, '#0072BE'),
    ('starter-liderazgo',   'Liderazgo de equipos',       'Equipo de Formación', '1.5 h · 3 módulos',   'violet', 'curso', 'Intermedio', 4.7, 0, 'Liderazgo', 3, '#FC220D'),
    ('starter-productividad','Productividad y gestión del tiempo', 'Equipo de Formación', '1 h · 3 módulos', 'teal', 'curso', 'Básico', 4.8, 0, 'Productividad', 4, '#F3A525')
  ) AS x(slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position, accent)
  ON CONFLICT (workspace_id, kind, slug) DO NOTHING;

  -- Capturamos los IDs para asignar path_id en pills
  SELECT id INTO v_starter_id       FROM public.workspace_content WHERE workspace_id=v_ws_id AND kind='path' AND slug='starter-bienvenida'   LIMIT 1;
  SELECT id INTO v_communication_id FROM public.workspace_content WHERE workspace_id=v_ws_id AND kind='path' AND slug='starter-comunicacion' LIMIT 1;
  SELECT id INTO v_leadership_id    FROM public.workspace_content WHERE workspace_id=v_ws_id AND kind='path' AND slug='starter-liderazgo'    LIMIT 1;
  SELECT id INTO v_productivity_id  FROM public.workspace_content WHERE workspace_id=v_ws_id AND kind='path' AND slug='starter-productividad' LIMIT 1;

  -- 2) Pills · 3 por curso · 12 total
  INSERT INTO public.pills (
    workspace_id, pill_number, slug, title, one_liner, teacher, duration,
    tone, format, level, rating, enrolled, category, featured, new_badge, position, path_id
  )
  SELECT v_ws_id, x.pill_number, x.slug, x.title, x.one_liner, x.teacher, x.duration,
         x.tone, x.format, x.level, x.rating, x.enrolled, x.category, x.featured, x.new_badge, x.position, x.path_id
  FROM (VALUES
    -- Bienvenida (path_id = v_starter_id)
    (8001, 'starter-tour',          'Tour rápido de la plataforma',     'En 5 minutos te enseñamos lo esencial · qué encontrarás y cómo navegar', 'Equipo de Formación', '5 min', 'teal', 'pill', 'Básico', 4.9, 0, 'Introducción', true,  true,  1, v_starter_id),
    (8002, 'starter-objetivos',     'Cómo aprovechar tu formación',     'Marca tus objetivos · sigue tu progreso · gana certificados',           'Equipo de Formación', '6 min', 'teal', 'pill', 'Básico', 4.8, 0, 'Introducción', false, true,  2, v_starter_id),
    (8003, 'starter-canales',       'Configura tus canales',            'Recibe pills del día en WhatsApp · Teams · email · como prefieras',     'Equipo de Formación', '4 min', 'teal', 'pill', 'Básico', 4.7, 0, 'Introducción', false, false, 3, v_starter_id),
    -- Comunicación (path_id = v_communication_id)
    (8101, 'comm-escucha',          'Escucha activa que cambia conversaciones', 'Tres técnicas para entender antes de responder',              'Equipo de Formación', '7 min', 'amber', 'pill', 'Básico',    4.8, 0, 'Comunicación', false, false, 4, v_communication_id),
    (8102, 'comm-feedback',         'Feedback que se recibe bien',      'Específico · oportuno · accionable · sin drama',                        'Equipo de Formación', '6 min', 'amber', 'pill', 'Intermedio',4.9, 0, 'Comunicación', false, false, 5, v_communication_id),
    (8103, 'comm-presentaciones',   'Presentaciones que enganchan',     'Una idea por slide · estructura clara · cierre potente',                'Equipo de Formación', '8 min', 'amber', 'pill', 'Intermedio',4.7, 0, 'Comunicación', false, false, 6, v_communication_id),
    -- Liderazgo (path_id = v_leadership_id)
    (8201, 'lead-confianza',        'Construir confianza con tu equipo','Reuniones 1-a-1 que importan · transparencia · coherencia',             'Equipo de Formación', '8 min', 'violet','pill', 'Intermedio',4.8, 0, 'Liderazgo',    false, false, 7, v_leadership_id),
    (8202, 'lead-delegar',          'Delegar sin perder control',       'Marco RACI sencillo · ownership real · check-ins ligeros',              'Equipo de Formación', '7 min', 'violet','pill', 'Intermedio',4.7, 0, 'Liderazgo',    false, false, 8, v_leadership_id),
    (8203, 'lead-decisiones',       'Tomar decisiones bajo presión',    'Marcos prácticos para decidir cuando falta información o tiempo',       'Equipo de Formación', '9 min', 'violet','pill', 'Experto',   4.8, 0, 'Liderazgo',    false, false, 9, v_leadership_id),
    -- Productividad (path_id = v_productivity_id)
    (8301, 'prod-prioridades',      'Matriz de prioridades aplicada',   'Urgente vs importante en 60 segundos · plantilla descargable',          'Equipo de Formación', '6 min', 'teal', 'pill', 'Básico',     4.9, 0, 'Productividad',false, false, 10, v_productivity_id),
    (8302, 'prod-bloques',          'Bloques de tiempo · time blocking','Tu calendario como contrato contigo mismo',                            'Equipo de Formación', '5 min', 'teal', 'pill', 'Básico',     4.8, 0, 'Productividad',false, false, 11, v_productivity_id),
    (8303, 'prod-decir-no',         'Decir "no" sin romper relaciones', 'Plantillas para reuniones, peticiones, deadlines',                      'Equipo de Formación', '6 min', 'teal', 'pill', 'Intermedio', 4.7, 0, 'Productividad',false, false, 12, v_productivity_id)
  ) AS x(pill_number, slug, title, one_liner, teacher, duration, tone, format, level, rating, enrolled, category, featured, new_badge, position, path_id)
  ON CONFLICT (workspace_id, pill_number) DO NOTHING;

  SELECT count(*) INTO v_paths_in FROM public.workspace_content WHERE workspace_id=v_ws_id AND kind='path' AND slug LIKE 'starter-%';
  SELECT count(*) INTO v_pills_in FROM public.pills WHERE workspace_id=v_ws_id AND slug IN (
    'starter-tour','starter-objetivos','starter-canales',
    'comm-escucha','comm-feedback','comm-presentaciones',
    'lead-confianza','lead-delegar','lead-decisiones',
    'prod-prioridades','prod-bloques','prod-decir-no'
  );

  RETURN jsonb_build_object(
    'status',    'ok',
    'workspace', p_workspace_slug,
    'paths',     v_paths_in,
    'pills',     v_pills_in
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.seed_workspace_starter_pack(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_workspace_starter_pack(text) TO authenticated;
