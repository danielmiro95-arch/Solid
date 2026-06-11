-- ============================================================================
-- SolidStream · Plan de aprendizaje personalizado por usuario
-- ============================================================================
-- Cada user puede tener UN plan activo por workspace, generado por Claude
-- según rol/equipo/objetivos. Estructura: 4 semanas con items (path o pill),
-- marcables como hechos. El plan se almacena como jsonb completo (más simple
-- que normalizar items a otra tabla: el plan es propiedad de un solo user y
-- raramente excede 30 items).
--
-- Ejecutar en SQL Editor. Idempotente.
-- ============================================================================

create table if not exists public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text default 'Mi plan de aprendizaje',
  weeks jsonb not null default '[]'::jsonb,
  -- weeks = [{ "label":"Semana 1", "focus":"Fundamentos", "items":[
  --   { "kind":"path"|"pill", "id":"...", "title":"...", "done":false } ] }, ...]
  generated_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, workspace_id)
);

create index if not exists learning_plans_user_ws_idx
  on public.learning_plans(user_id, workspace_id);

alter table public.learning_plans enable row level security;

-- RLS self-access · cada usuario solo ve y gestiona su propio plan.
drop policy if exists learning_plans_self on public.learning_plans;
create policy learning_plans_self on public.learning_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trigger updated_at (función set_updated_at ya existe en schema.sql).
drop trigger if exists learning_plans_updated_at on public.learning_plans;
create trigger learning_plans_updated_at before update on public.learning_plans
  for each row execute function public.set_updated_at();

-- ============================================================================
-- FIN · tras ejecutarlo, "Mi plan IA" persiste contra esta tabla.
-- ============================================================================
