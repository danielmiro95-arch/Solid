-- ============================================================================
-- Hijos de Rivera Demo · setup + seed completo · idempotente
-- ============================================================================
-- Pegar entero en Supabase SQL Editor. Se puede correr varias veces sin
-- duplicar (todo usa where not exists / on conflict do nothing/update).
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 0 · migración pendiente
-- ──────────────────────────────────────────────────────────────────────────
alter table public.workspaces
  add column if not exists archived_at timestamptz;

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 1 · plataforma admin para todos los @beonit
-- ──────────────────────────────────────────────────────────────────────────
update public.profiles
set system_role = 'admin'
where id in (select id from auth.users where email ilike '%@beonit%');

-- Confirma el email de Julio si no estaba confirmado
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email ilike '%julio%';

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 2 · crear workspace "Hijos de Rivera Demo" con demo_mode preset
-- ──────────────────────────────────────────────────────────────────────────
insert into public.workspaces (name, slug, settings)
select
  'Hijos de Rivera Demo',
  'hijos-de-rivera-demo',
  jsonb_build_object(
    'demo_mode', true,
    'hide_beonai', true,
    'hide_analytics', true,
    'hide_resources', true,
    'hide_recommendations', true,
    'hide_durations', true,
    'hide_attribution', true,
    'simplified_avatar_menu', true,
    'simplified_settings', true,
    'simplified_profile', true,
    'lock_unassigned_courses', true,
    'path_label', 'Curso',
    'path_label_plural', 'Cursos',
    'catalog_label', 'Catálogo',
    'my_list_label', 'Mi Lista',
    'brief_diario_label', 'Brief Diario',
    'workshops_label', 'Inscríbete a talleres',
    'channels_action_label', 'Activar',
    'level_badges', jsonb_build_array('Básico','Intermedio','Experto')
  )
where not exists (select 1 from public.workspaces where slug = 'hijos-de-rivera-demo');

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 3 · memberships
--   · Todos los @beonit como admin de TODOS los workspaces
--   · Julio como member del workspace demo
-- ──────────────────────────────────────────────────────────────────────────
insert into public.workspace_members (workspace_id, user_id, role)
select w.id, u.id, 'admin'
from public.workspaces w
cross join auth.users u
where u.email ilike '%@beonit%'
on conflict (workspace_id, user_id) do update set role = 'admin';

insert into public.workspace_members (workspace_id, user_id, role)
select w.id, u.id, 'member'
from public.workspaces w, auth.users u
where w.slug = 'hijos-de-rivera-demo'
  and u.email ilike '%julio%'
on conflict (workspace_id, user_id) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 4 · seed de 3 paths/cursos en el workspace demo
-- ──────────────────────────────────────────────────────────────────────────
with ws as (select id from public.workspaces where slug = 'hijos-de-rivera-demo' limit 1)
insert into public.workspace_content (workspace_id, kind, slug, title, teacher, duration, level, category, position, metadata)
select ws.id, 'path', x.slug, x.title, x.teacher, x.duration, x.level, x.category, x.position, '{}'::jsonb
from ws,
(values
  ('mas-presentaciones-eficaces', 'Más presentaciones eficaces', 'María López', '3 h · 9 módulos', 'Básico', 'Comunicación', 1),
  ('liderazgo-equipos',           'Liderazgo de equipos comerciales', 'Carlos Vidal', '4 h · 10 módulos', 'Intermedio', 'Liderazgo', 2),
  ('gestion-tiempo',              'Gestión del tiempo y prioridades', 'Ana Ferrer', '2 h · 7 módulos', 'Básico', 'Productividad', 3)
) as x(slug, title, teacher, duration, level, category, position)
on conflict (workspace_id, kind, slug) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 5 · seed de 9 pills en el workspace demo (3 por curso, mismos slugs)
-- ──────────────────────────────────────────────────────────────────────────
with ws as (select id from public.workspaces where slug = 'hijos-de-rivera-demo' limit 1)
insert into public.pills (
  workspace_id, pill_number, slug, title, one_liner, teacher, duration,
  tone, format, level, rating, enrolled, category, yt, featured, new_badge, position
)
select ws.id, x.pill_number, x.slug, x.title, x.one_liner, x.teacher, x.duration,
       x.tone, x.format, x.level, x.rating, x.enrolled, x.category, x.yt, x.featured, x.new_badge, x.position
from ws,
(values
  -- Curso 1 · Más presentaciones eficaces (FEATURED · aparece en el hero)
  (101, 'estructura-narrativa',     'Estructura narrativa de impacto',     'Empieza por el porqué · cierra con el call to action', 'María López',   '4 min', 'teal',    'pill', 'Básico',     4.9, 1240, 'Comunicación', null, true,  true,  1),
  (102, 'diseno-slides-minimo',     'Diseño de slides al mínimo',          'Una idea por slide · jerarquía clara · menos texto',   'María López',   '5 min', 'teal',    'pill', 'Básico',     4.8, 980,  'Comunicación', null, false, true,  2),
  (103, 'storytelling-datos',       'Storytelling con datos',              'Convierte tu dashboard en una historia memorable',     'María López',   '6 min', 'teal',    'pill', 'Intermedio', 4.7, 870,  'Comunicación', null, false, false, 3),
  -- Curso 2 · Liderazgo de equipos comerciales (bloqueado en demo)
  (201, 'feedback-radical',         'Feedback radical sin drama',          'Específico · oportuno · accionable',                   'Carlos Vidal',  '5 min', 'amber',   'pill', 'Intermedio', 4.6, 720,  'Liderazgo',    null, false, false, 4),
  (202, 'reuniones-1a1',            'Reuniones 1-a-1 que funcionan',       '15 minutos bien gastados > 1 hora desenfocada',        'Carlos Vidal',  '5 min', 'amber',   'pill', 'Intermedio', 4.7, 690,  'Liderazgo',    null, false, false, 5),
  (203, 'delegar-bien',             'Cómo delegar sin perder control',     'Marco RACI sencillo + check-ins ligeros',              'Carlos Vidal',  '6 min', 'amber',   'pill', 'Experto',    4.5, 540,  'Liderazgo',    null, false, false, 6),
  -- Curso 3 · Gestión del tiempo (bloqueado en demo)
  (301, 'matriz-eisenhower',        'Matriz de Eisenhower aplicada',       'Diferenciar urgente vs importante en 60 segundos',     'Ana Ferrer',    '4 min', 'violet',  'pill', 'Básico',     4.8, 1100, 'Productividad',null, false, false, 7),
  (302, 'bloques-tiempo',           'Bloques de tiempo · time blocking',   'Tu calendario como contrato contigo mismo',            'Ana Ferrer',    '5 min', 'violet',  'pill', 'Básico',     4.7, 920,  'Productividad',null, false, false, 8),
  (303, 'decir-no-bien',            'Decir "no" sin romper relaciones',    'Plantillas para reuniones, peticiones y tareas',       'Ana Ferrer',    '4 min', 'violet',  'pill', 'Intermedio', 4.8, 810,  'Productividad',null, false, false, 9)
) as x(pill_number, slug, title, one_liner, teacher, duration, tone, format, level, rating, enrolled, category, yt, featured, new_badge, position)
on conflict (workspace_id, pill_number) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- PASO 6 · verificación final
-- ──────────────────────────────────────────────────────────────────────────
select
  u.email,
  p.system_role,
  w.name as workspace,
  m.role as workspace_role,
  w.settings ? 'demo_mode' as demo
from auth.users u
left join public.profiles p on p.id = u.id
left join public.workspace_members m on m.user_id = u.id
left join public.workspaces w on w.id = m.workspace_id
where u.email ilike '%@beonit%' or u.email ilike '%julio%'
order by u.email, w.name;

select
  w.name,
  (select count(*) from public.pills where workspace_id = w.id) as pills,
  (select count(*) from public.workspace_content where workspace_id = w.id and kind = 'path') as paths
from public.workspaces w
where w.slug = 'hijos-de-rivera-demo';
