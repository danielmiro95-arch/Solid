-- ============================================================================
-- SolidStream · tabla de inscripciones (enrollments)
-- ============================================================================
-- Sustituye el almacenamiento localStorage (que se perdía entre dispositivos)
-- por persistencia real en Supabase, con el mismo patrón que bookmarks:
-- scoped por user + workspace, RLS self-access.
--
-- Ejecutar ENTERO en el SQL Editor de Supabase. Idempotente.
-- ============================================================================

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  path_id text not null,                         -- slug del curso (LEARNING_PATHS id)
  created_at timestamptz default now(),
  unique(user_id, workspace_id, path_id)
);

create index if not exists enrollments_user_ws_idx
  on public.enrollments(user_id, workspace_id);

alter table public.enrollments enable row level security;

-- Self-access · cada usuario solo ve y gestiona sus propias inscripciones.
drop policy if exists enrollments_self on public.enrollments;
create policy enrollments_self on public.enrollments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- FIN · tras ejecutarlo, "Mi Lista" persiste entre dispositivos y sesiones.
-- ============================================================================
