-- ============================================================================
-- SolidStream · Notas con timestamp del usuario
-- ============================================================================
-- Notas que el user toma mientras ve un vídeo. Cada nota guarda el segundo
-- del vídeo + el texto. Scope: user + workspace + pill. RLS self.
--
-- Ejecutar en SQL Editor. Idempotente.
-- ============================================================================

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  pill_id text not null,            -- id de la pill/curso a la que pertenece
  pill_title text,                  -- snapshot del título (para que la nota siga teniendo contexto si la pill cambia/se borra)
  at_seconds int not null default 0,-- segundo del vídeo donde se tomó
  text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists notes_user_ws_pill_idx on public.notes(user_id, workspace_id, pill_id, at_seconds);
create index if not exists notes_user_recent_idx on public.notes(user_id, workspace_id, created_at desc);

alter table public.notes enable row level security;

-- RLS self-access · cada usuario solo ve y gestiona sus propias notas.
drop policy if exists notes_self on public.notes;
create policy notes_self on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trigger updated_at (función set_updated_at ya existe en schema.sql).
drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- FIN · tras ejecutarlo, "Tomar nota" en el player persiste contra esta tabla.
-- ============================================================================
