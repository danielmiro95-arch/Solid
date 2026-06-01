-- =====================================================================
-- SEED · Repsol workspace_content (paths, series, reels, podcasts)
-- ---------------------------------------------------------------------
-- Migra a la tabla `public.workspace_content` los arrays que antes
-- vivían hardcoded en docs/prototype-home.jsx como datos exclusivos de
-- Repsol/Sprinklr. Tras este seed:
--   • Repsol ve sus 3 rutas + 8 bloques + 6 reels + 2 podcasts
--   • Cualquier otro workspace (Hijos de Ribera…) los ve vacíos hasta
--     que el admin los cree desde el Admin Panel.
--
-- Ejecútalo UNA VEZ en Supabase SQL Editor tras db/schema.sql.
-- Idempotente: usa ON CONFLICT DO NOTHING sobre (workspace_id, kind, slug).
-- =====================================================================

with repsol as (
  select id from public.workspaces where slug = 'repsol' limit 1
)
insert into public.workspace_content
  (workspace_id, kind, slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position)
select repsol.id, kind, slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position
from repsol, (values
  -- ── Rutas (paths) ───────────────────────────────────────────────────
  ('path','pa1','Sprinklr Fundamentals · Certificación base',     '2 semanas · 11 think pills','45 min',  'teal',  'ruta',   'principiante', 4.9, 247, 'Certificación', 1),
  ('path','pa2','Rol Publish Agent · Certificación completa',     '4 semanas · 27 think pills','1h 50m',  'clay',  'ruta',   'intermedio',   4.8, 200, 'Certificación', 2),
  ('path','pa3','Rol Care Agent · Certificación completa',        '3 semanas · 25 think pills','1h 40m',  'olive', 'ruta',   'intermedio',   4.8, 155, 'Certificación', 3),

  -- ── Bloques formativos (series) ─────────────────────────────────────
  ('series','s1','Bloque 1+2 · Sprinklr en Repsol',                            '6 think pills · Carlos Vega',  '22 min','teal', 'serie','principiante',4.9,247,'Fundamentos',1),
  ('series','s2','Bloque 2 · Estructura, roles y gobernanza',                  '5 think pills · Equipo Legal', '18 min','noir', 'serie','principiante',4.8,220,'Gobernanza',2),
  ('series','s3','Bloque 3 · Gestión estructural de campañas en Social Publish','6 think pills · Sara Molina',  '22 min','clay', 'serie','intermedio',  4.8,190,'Social Publish',3),
  ('series','s4','Bloque 4 · Operativa editorial y control de contenidos',     '6 think pills · Carlos Vega',  '25 min','warm', 'serie','intermedio',  4.8,200,'Social Publish',4),
  ('series','s5','Bloque 5 · Calendario editorial',                            '2 think pills · Sara Molina',  '7 min', 'plum', 'serie','principiante',4.7,185,'Calendario',5),
  ('series','s6','Bloque 6 · Reporting de campañas y performance',             '2 think pills · Ana García',   '9 min', 'olive','serie','intermedio',  4.8,170,'Analytics',6),
  ('series','s7','Bloque 7 · Operativa Community Manager en Care',             '10 think pills · Luis Romero', '40 min','teal', 'serie','intermedio',  4.9,155,'Care',7),
  ('series','s8','Bloque 8 · SLA y paneles de atención al cliente',            '4 think pills · Ana García',   '16 min','plum', 'serie','intermedio',  4.8,140,'Care',8),

  -- ── Quick tips (reels) ──────────────────────────────────────────────
  ('reel','r1','Regístrate en Sprinklr con SSO en 30 segundos','@solid',':30','teal', 'tip',null,null,null,null,1),
  ('reel','r2','Crea una campaña rápida en Social Publish',    '@solid',':45','clay', 'tip',null,null,null,null,2),
  ('reel','r3','Filtra activos en el DAM',                     '@solid',':38','olive','tip',null,null,null,null,3),
  ('reel','r4','Aprueba un post en 30 segundos',               '@solid',':30','warm', 'tip',null,null,null,null,4),
  ('reel','r5','Ve las métricas de rendimiento de una campaña','@solid',':41','plum', 'tip',null,null,null,null,5),
  ('reel','r6','Transfiere un caso a Salesforce',              '@solid',':52','noir', 'tip',null,null,null,null,6),

  -- ── Charlas (podcasts) ──────────────────────────────────────────────
  ('podcast','c1','Estrategia digital de Repsol en Sprinklr 2026',           'Dirección Comms · 22 min','22 min','noir','charla','avanzado',    4.8,247,'Fundamentos',1),
  ('podcast','c2','Por qué Sprinklr transforma el equipo de comunicación',   'Carlos Vega · 18 min',    '18 min','teal','charla','principiante',4.7,220,'Fundamentos',2)
) as v(kind, slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position)
on conflict (workspace_id, kind, slug) do nothing;

-- Cuenta lo migrado por tipo para verificar
select kind, count(*) as inserted
from public.workspace_content c
join public.workspaces w on w.id = c.workspace_id
where w.slug = 'repsol'
group by kind
order by kind;
