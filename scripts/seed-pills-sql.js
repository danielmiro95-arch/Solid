// scripts/seed-pills-sql.js
// Lee el array PILLS hardcodeado en docs/prototype-home.jsx y emite un
// archivo SQL idempotente que inserta esas pills en el workspace 'Repsol'
// (busca por slug o name). El SQL se ejecuta una vez en Supabase SQL Editor
// para migrar el catálogo legacy al modelo en DB.

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'prototype-home.jsx'), 'utf8');

// Extrae el bloque `const PILLS = [ ... ];` (greedy hasta el cierre ];)
const m = src.match(/const PILLS\s*=\s*(\[[\s\S]*?\n\]);/);
if (!m) { console.error('PILLS array no encontrado'); process.exit(1); }

// eval del literal · el array es pura data, sin function calls
let PILLS;
try { PILLS = eval('(' + m[1] + ')'); }
catch(e) { console.error('eval PILLS falló:', e.message); process.exit(1); }

if (!Array.isArray(PILLS) || PILLS.length === 0) { console.error('PILLS vacío'); process.exit(1); }

const sqlQuote = (v) => {
  if (v == null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
};

const rows = PILLS.map((p, i) => {
  return '    (ws_id, ' + [
    p.pill != null ? p.pill : i,
    sqlQuote(p.id || ('p' + (p.pill != null ? p.pill : i))),
    sqlQuote(p.title),
    sqlQuote(p.one || p.title),
    sqlQuote(p.teacher || 'BeonIt × Repsol'),
    sqlQuote(p.duration || '4 min'),
    sqlQuote(p.tone || 'teal'),
    sqlQuote(p.format || 'módulo'),
    sqlQuote(p.level || 'principiante'),
    typeof p.rating === 'number' ? p.rating : 4.7,
    typeof p.enrolled === 'number' ? p.enrolled : 0,
    sqlQuote(p.category),
    sqlQuote(p.yt || null),
    sqlQuote(p.mp4 || null),
    sqlQuote(p.poster || null),
    p.featured ? 'true' : 'false',
    p.newBadge ? 'true' : 'false',
    i,
  ].join(', ') + ')';
}).join(',\n');

const out = `-- =====================================================================
-- Seed · pills de Repsol (Sprinklr curriculum)
-- =====================================================================
-- Generado por scripts/seed-pills-sql.js a partir del array hardcoded en
-- docs/prototype-home.jsx. Inserta las ${PILLS.length} pills en el workspace
-- llamado 'Repsol' (busca por slug o name). Idempotente: ON CONFLICT
-- (workspace_id, pill_number) DO NOTHING.
--
-- Ejecuta este SQL UNA VEZ en Supabase SQL Editor tras crear la tabla
-- public.pills (sección 32a de schema.sql).
-- =====================================================================
do $$
declare ws_id uuid;
begin
  select id into ws_id from public.workspaces
    where lower(slug) = 'repsol' or lower(name) = 'repsol'
    order by created_at asc limit 1;
  if ws_id is null then
    raise notice 'No se encontró un workspace Repsol. Crea uno primero o renombra el existente.';
    return;
  end if;

  insert into public.pills (
    workspace_id, pill_number, slug, title, one_liner, teacher, duration, tone, format,
    level, rating, enrolled, category, yt, mp4, poster, featured, new_badge, position
  ) values
${rows}
  on conflict (workspace_id, pill_number) do nothing;

  raise notice 'Seed pills Repsol completado · workspace_id=%', ws_id;
end $$;
`;

const outPath = path.join(__dirname, '..', 'db', 'seed-repsol-pills.sql');
fs.writeFileSync(outPath, out);
console.log('✓ Generado:', outPath, '· pills:', PILLS.length);
