-- =====================================================================
-- SGS|on · Schema Supabase (Phase 2 backend real)
-- =====================================================================
-- Pega este SQL completo en tu proyecto Supabase → SQL Editor → New query.
-- Ejecuta una vez. Crea todas las tablas, índices, políticas RLS y el bucket
-- de storage para los vídeos de las entregas.
--
-- Después, en Vercel → Settings → Environment Variables añade:
--   SUPABASE_URL          = https://<TU_PROJECT_ID>.supabase.co
--   SUPABASE_ANON_KEY     = <ANON KEY pública del proyecto>
-- y haz redeploy. La app detecta las vars y activa Supabase automáticamente.
-- =====================================================================

-- 1. profiles · extiende auth.users con campos de la app
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  role text default 'Publish Agent',
  team text default 'Repsol',
  avatar_color text default 'var(--bn-blue)',
  is_admin boolean default false,
  created_at timestamptz default now(),
  last_login_at timestamptz default now()
);

-- 2. bookmarks · biblioteca de cada usuario
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  pill_id text not null,
  created_at timestamptz default now(),
  unique(user_id, pill_id)
);

-- 3. conversations + messages · chats con MENTOR-IA
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null default 'Nueva conversación',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

-- 4. progress · pills completadas
create table if not exists public.progress (
  user_id uuid references public.profiles(id) on delete cascade,
  pill_id text not null,
  completed_at timestamptz default now(),
  primary key (user_id, pill_id)
);

-- 5. submissions · entregas de vídeo de los exámenes prácticos
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  pill_id text not null,
  pill_title text,
  file_path text not null,
  file_name text,
  file_size bigint,
  duration_sec int,
  thumb_url text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  feedback text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz default now()
);
create index if not exists submissions_user_idx on public.submissions(user_id);
create index if not exists submissions_status_idx on public.submissions(status);

-- 6. inbox_messages · DM al usuario
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  from_name text not null,
  from_user_id uuid references public.profiles(id),
  subject text not null,
  body text not null,
  read boolean default false,
  is_admin boolean default false,
  avatar_color text,
  created_at timestamptz default now()
);

-- 7. inbox_notifications · notificaciones por usuario
create table if not exists public.inbox_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  kind text default 'info',
  icon text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- 8. releases · changelog global compartido
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  body text,
  kind text default 'feature',
  created_at timestamptz default now()
);

-- 9. route_exams · examen final por ruta
create table if not exists public.route_exams (
  user_id uuid references public.profiles(id) on delete cascade,
  route_id text not null,
  score int not null,
  total int not null,
  passed boolean not null,
  completed_at timestamptz default now(),
  primary key (user_id, route_id)
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.progress enable row level security;
alter table public.submissions enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.inbox_notifications enable row level security;
alter table public.releases enable row level security;
alter table public.route_exams enable row level security;

-- helper: ¿es admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles: legibles por todos los autenticados, editables solo por uno mismo (excepto admin)
drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

-- bookmarks: solo el dueño
drop policy if exists "bookmarks_own" on public.bookmarks;
create policy "bookmarks_own" on public.bookmarks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations + messages: solo el dueño (admin puede leer todo para soporte)
drop policy if exists "conversations_own" on public.conversations;
create policy "conversations_own" on public.conversations for all to authenticated using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);
drop policy if exists "messages_via_conv" on public.messages;
create policy "messages_via_conv" on public.messages for all to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- progress: dueño
drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress for all to authenticated using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);

-- submissions: dueño escribe; admin revisa todas
drop policy if exists "submissions_read" on public.submissions;
drop policy if exists "submissions_insert" on public.submissions;
drop policy if exists "submissions_update_admin" on public.submissions;
create policy "submissions_read" on public.submissions for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "submissions_insert" on public.submissions for insert to authenticated with check (auth.uid() = user_id);
create policy "submissions_update_admin" on public.submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- inbox_messages: dueño lee/marca; admin puede crear DMs a cualquiera
drop policy if exists "inbox_msg_read" on public.inbox_messages;
drop policy if exists "inbox_msg_insert_admin" on public.inbox_messages;
drop policy if exists "inbox_msg_update_own" on public.inbox_messages;
create policy "inbox_msg_read" on public.inbox_messages for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "inbox_msg_insert_admin" on public.inbox_messages for insert to authenticated with check (public.is_admin());
create policy "inbox_msg_update_own" on public.inbox_messages for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- inbox_notifications: igual
drop policy if exists "inbox_notif_read" on public.inbox_notifications;
drop policy if exists "inbox_notif_insert" on public.inbox_notifications;
drop policy if exists "inbox_notif_update_own" on public.inbox_notifications;
create policy "inbox_notif_read" on public.inbox_notifications for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "inbox_notif_insert" on public.inbox_notifications for insert to authenticated with check (auth.uid() = user_id or public.is_admin());
create policy "inbox_notif_update_own" on public.inbox_notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- releases: lectura para todos, escritura solo admins
drop policy if exists "releases_read" on public.releases;
drop policy if exists "releases_write_admin" on public.releases;
create policy "releases_read" on public.releases for select to authenticated using (true);
create policy "releases_write_admin" on public.releases for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- route_exams: dueño
drop policy if exists "route_exams_own" on public.route_exams;
create policy "route_exams_own" on public.route_exams for all to authenticated using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);

-- =====================================================================
-- Auto-create profile when user signs up
-- =====================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role, team, avatar_color, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'Publish Agent'),
    coalesce(new.raw_user_meta_data->>'team', 'Repsol'),
    coalesce(new.raw_user_meta_data->>'avatar_color', 'var(--bn-blue)'),
    -- primer usuario o emails @beonit.com son admin
    case
      when (select count(*) from public.profiles) = 0 then true
      when new.email like '%@beonit.com' then true
      else false
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Storage bucket para los vídeos de entregas
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "submissions_upload" on storage.objects;
drop policy if exists "submissions_read" on storage.objects;
create policy "submissions_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions_read" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- =====================================================================
-- Seed inicial · 5 release notes globales
-- =====================================================================
insert into public.releases (version, title, body, kind, created_at) values
  ('2.4', 'Examen final por ruta · Genera tu certificado', 'Cada ruta de certificación termina con un examen rápido de 3 preguntas. Al superarlo, descargas tu certificado oficial Repsol × BeonIt.', 'feature', now() - interval '1 hour'),
  ('2.3', 'Bandeja de entrada unificada', 'Mensajes directos, notificaciones de actividad y releases en un único lugar.', 'feature', now() - interval '6 hours'),
  ('2.2', 'MENTOR-IA con historial de chats persistente', 'Tus conversaciones se guardan automáticamente. Modo nocturno en el panel lateral.', 'feature', now() - interval '2 days'),
  ('2.1', 'Multi-usuario y panel de administración', 'Login/registro real, rol admin, datos por usuario.', 'feature', now() - interval '4 days'),
  ('2.0', 'SGS|on · nuevo branding', 'La plataforma se rebautiza como SGS|on, manteniendo SOLID GROWTH como metodología.', 'announcement', now() - interval '9 days')
on conflict do nothing;
