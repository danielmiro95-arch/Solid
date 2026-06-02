-- =====================================================================
-- SolidStream · Schema Supabase (Phase 3 · backend multi-tenant real)
-- =====================================================================
-- Pega este SQL completo en tu proyecto Supabase → SQL Editor → New query.
-- Ejecuta una vez. Crea todas las tablas, índices, políticas RLS, triggers
-- y el bucket de storage para los vídeos de las entregas.
--
-- Después, en Vercel → Settings → Environment Variables añade:
--   SUPABASE_URL          = https://<TU_PROJECT_ID>.supabase.co
--   SUPABASE_ANON_KEY     = <ANON KEY pública del proyecto>
--   (opcional) SUPABASE_SERVICE_ROLE_KEY para edge functions
-- y haz redeploy. La app detecta las vars y activa Supabase automáticamente.
--
-- MODELO:
--   - Multi-tenant · cada usuario pertenece a uno o más workspaces.
--   - 3 roles del sistema: admin (plataforma) / manager / user.
--   - 3 roles del workspace: owner / admin / member.
--   - Todas las queries scopeadas por workspace_id vía RLS.
-- =====================================================================

-- =====================================================================
-- 0. Extensions
-- =====================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Desactivar validación del cuerpo de las funciones durante esta migración.
-- Necesario porque is_platform_admin() referencia public.profiles antes de
-- que la tabla exista. Postgres permite esto explícitamente vía este flag.
-- Una vez ejecutado el script entero, las funciones quedan registradas con
-- sus tablas ya existentes y todo funciona normal.
set check_function_bodies = off;

-- =====================================================================
-- 0b. RLS helpers · funciones que se referencian en políticas inline
-- =====================================================================
-- Estas funciones se definen ANTES que cualquier tabla/policy para que el
-- planner las encuentre cuando ejecuta `create policy ... using (...)`.
-- Las tablas que referencian (profiles, workspace_members) se crean después;
-- como las funciones son `language sql`, el cuerpo se resuelve lazy en
-- runtime, no en parse time, así que el forward reference es seguro.
create or replace function public.is_platform_admin()
returns boolean language sql security definer stable as $$
  select coalesce((select system_role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Trigger genérico para auto-actualizar columna `updated_at`.
-- Necesita estar definido antes que cualquier `create trigger` que lo referencie.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

create or replace function public.is_workspace_member(ws_id uuid, min_role text default 'member')
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and (
        min_role = 'member' or
        (min_role = 'admin' and role in ('owner','admin')) or
        (min_role = 'owner' and role = 'owner')
      )
  );
$$;

-- =====================================================================
-- 1. profiles · extiende auth.users con campos del usuario
-- =====================================================================
-- profiles.ingest_token · token personal opaco para autenticar el bookmarklet
-- de KB sin necesitar OAuth desde el browser. Se genera lazy la primera vez
-- que el user pide su bookmarklet desde el panel admin · rotable.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  role text default 'Publish Agent',                  -- rol funcional
  system_role text default 'user'                     -- platform role
    check (system_role in ('admin','manager','user')),
  team text default 'Repsol',
  avatar_color text default '#6E50EE',
  is_admin boolean default false,                     -- espejo legacy de system_role='admin'
  current_workspace_id uuid,                          -- workspace activo (FK añadida abajo)
  language text default 'es' check (language in ('es','en','pt')),
  theme text default 'auto' check (theme in ('light','dark','auto')),
  ingest_token uuid,                                  -- token opaco para el bookmarklet
  ingest_token_created_at timestamptz,
  created_at timestamptz default now(),
  last_login_at timestamptz default now()
);
-- Si la tabla ya existía con esquema viejo, añadimos columnas nuevas idempotente
alter table public.profiles add column if not exists ingest_token uuid;
alter table public.profiles add column if not exists ingest_token_created_at timestamptz;
create unique index if not exists profiles_ingest_token_uniq on public.profiles(ingest_token) where ingest_token is not null;

-- =====================================================================
-- 2. workspaces · tenants (empresa cliente)
-- =====================================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#6E50EE',
  owner_id uuid references public.profiles(id) on delete set null,
  settings jsonb default '{}'::jsonb,
  archived_at timestamptz,                       -- soft delete · workspaces archivados se ocultan del switcher pero conservan datos
  created_at timestamptz default now()
);
-- Migration in-place para instalaciones existentes
alter table public.workspaces add column if not exists archived_at timestamptz;
create index if not exists workspaces_owner_idx on public.workspaces(owner_id);

-- FK current_workspace_id ahora que workspaces existe
alter table public.profiles
  drop constraint if exists profiles_current_workspace_fk,
  add constraint profiles_current_workspace_fk
  foreign key (current_workspace_id) references public.workspaces(id) on delete set null;

-- =====================================================================
-- 3. workspace_members · membership N:M user × workspace
-- =====================================================================
create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz default now(),
  primary key (workspace_id, user_id)
);
create index if not exists wsm_user_idx on public.workspace_members(user_id);
create index if not exists wsm_workspace_idx on public.workspace_members(workspace_id);

-- =====================================================================
-- 4. bookmarks · pills guardadas (scoped por workspace)
-- =====================================================================
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  pill_id text not null,
  created_at timestamptz default now(),
  unique(user_id, workspace_id, pill_id)
);
create index if not exists bookmarks_user_ws_idx on public.bookmarks(user_id, workspace_id);

-- =====================================================================
-- 5. ratings · valoraciones por pill
-- =====================================================================
create table if not exists public.ratings (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  pill_id text not null,
  stars int check (stars between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id, pill_id)
);
create index if not exists ratings_pill_idx on public.ratings(workspace_id, pill_id);

-- =====================================================================
-- 6. progress · pills completadas
-- =====================================================================
create table if not exists public.progress (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  pill_id text not null,
  progress numeric default 0 check (progress between 0 and 1),
  completed_at timestamptz,
  watch_seconds int default 0,                  -- segundos acumulados de visionado · alimenta time_invested
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id, pill_id)
);
-- Migration in-place para instalaciones existentes que no tienen la columna
alter table public.progress add column if not exists watch_seconds int default 0;

-- =====================================================================
-- 7. conversations + messages · chats con BeonAI
-- =====================================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null default 'Nueva conversación',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists conv_user_ws_idx on public.conversations(user_id, workspace_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text check (role in ('user','assistant','system')) not null,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

-- =====================================================================
-- 8. channels · canales conectados por usuario × workspace
-- =====================================================================
create table if not exists public.user_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  channel_type text not null check (channel_type in ('whatsapp','teams','email','slack','push')),
  account text,                              -- email, teléfono, etc.
  connected boolean default true,
  is_primary boolean default false,
  oauth_token text,                          -- encrypted bucket si lo añades
  connected_at timestamptz default now(),
  unique(user_id, workspace_id, channel_type)
);

-- =====================================================================
-- 9. delivery_prefs · cuándo recibir contenido por canal
-- =====================================================================
create table if not exists public.delivery_prefs (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  enabled boolean default true,
  mode text default 'weekdays' check (mode in ('daily','weekly','custom','smart-ai','weekdays','weekends')),
  days int[] default '{1,1,1,1,1,0,0}',      -- L-D
  time text default '09:00',
  timezone text default 'auto',
  max_per_day int default 1,
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id)
);

-- =====================================================================
-- 10. content_push · tipos de contenido + formato
-- =====================================================================
create table if not exists public.content_push (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  types jsonb default '{}'::jsonb,           -- {videos:true, pills:true, ...}
  auto_receive boolean default true,
  show_summary boolean default true,
  show_thumbnail boolean default true,
  show_duration boolean default true,
  open_in_solid boolean default true,
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id)
);

-- =====================================================================
-- 11. subscriptions · categorías/skills/teams/trainers seguidos
-- =====================================================================
create table if not exists public.subscriptions (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  group_type text not null check (group_type in ('categories','skills','teams','trainers')),
  item_id text not null,
  subscribed_at timestamptz default now(),
  primary key (user_id, workspace_id, group_type, item_id)
);

-- =====================================================================
-- 12. notification_rules · quiet hours, vacation, digest, smart
-- =====================================================================
create table if not exists public.notification_rules (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  digest text default 'instant' check (digest in ('instant','daily','weekly')),
  quiet_hours jsonb default '{"enabled":true,"from":"22:00","to":"08:00"}'::jsonb,
  vacation jsonb default '{"enabled":false,"until":null}'::jsonb,
  smart_reminder boolean default true,
  priority text default 'all' check (priority in ('all','high','relevant')),
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id)
);

-- =====================================================================
-- 13. channel_notifs · matriz Sprinklr-style · tipo × canal
-- =====================================================================
create table if not exists public.channel_notifs (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  notif_type text not null,                   -- daily_module, meeting_brief, etc.
  channels jsonb default '{}'::jsonb,         -- {whatsapp:true, teams:false, email:true, ...}
  updated_at timestamptz default now(),
  primary key (user_id, workspace_id, notif_type)
);

-- =====================================================================
-- 14. inbox · messages + notifications + releases unified
-- =====================================================================
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  category text not null check (category in ('messages','notifications','releases')),
  subject text,
  body text,
  text text,                                  -- short text for notifications
  icon text,
  link text,                                  -- pill:p0 etc.
  kind text default 'info',                   -- info, success, warning, achievement
  from_label text,
  version text,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists inbox_user_cat_idx on public.inbox_messages(user_id, workspace_id, category, created_at desc);

-- =====================================================================
-- 15. submissions · entregas de vídeo de los exámenes prácticos
-- =====================================================================
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  pill_id text not null,
  pill_title text,
  file_path text not null,
  file_name text,
  file_size bigint,
  duration_sec int,
  thumb_url text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists submissions_status_idx on public.submissions(workspace_id, status, created_at desc);

-- =====================================================================
-- 16. invitations · invitaciones pendientes
-- =====================================================================
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  email text not null,
  name text,
  role text default 'Publish Agent',
  system_role text default 'user' check (system_role in ('admin','manager','user')),
  team text,
  token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  status text default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  expires_at timestamptz default now() + interval '14 days'
);
create index if not exists invitations_token_idx on public.invitations(token);
create index if not exists invitations_email_idx on public.invitations(email);

-- =====================================================================
-- 17. activity_log · audit log de eventos importantes
-- =====================================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  type text not null,                          -- 'bookmark_add','complete_pill','invite_send'…
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists activity_ws_time_idx on public.activity_log(workspace_id, created_at desc);
create index if not exists activity_user_time_idx on public.activity_log(user_id, created_at desc);

-- =====================================================================
-- 18. test_sends · historial de notificaciones de prueba
-- =====================================================================
create table if not exists public.test_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  channel_id text not null,
  channel_label text,
  status text default 'delivered',
  created_at timestamptz default now()
);
create index if not exists test_sends_user_ws_idx on public.test_sends(user_id, workspace_id, created_at desc);

-- =====================================================================
-- 18a. route_exams · resultados de exámenes finales por ruta
-- =====================================================================
create table if not exists public.route_exams (
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  route_id text not null,
  score int not null,
  total int not null,
  passed boolean not null default false,
  completed_at timestamptz default now(),
  primary key (user_id, workspace_id, route_id)
);
create index if not exists route_exams_user_idx on public.route_exams(user_id, completed_at desc);

alter table public.route_exams enable row level security;
drop policy if exists route_exams_self on public.route_exams;
create policy route_exams_self on public.route_exams
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================================
-- 18b. push_subscriptions · suscripciones Web Push del navegador
-- =====================================================================
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  keys jsonb not null,                       -- { p256dh, auth }
  user_agent text,
  active boolean default true,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
create index if not exists push_subs_user_idx on public.push_subscriptions(user_id, active);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subs_self on public.push_subscriptions;
create policy push_subs_self on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists push_subs_admin_read on public.push_subscriptions;
create policy push_subs_admin_read on public.push_subscriptions
  for select using (public.is_platform_admin());

-- =====================================================================
-- 18d. resources · documentos externos (Loop, SharePoint, PDFs)
-- · Cards launcher: el user los ve dentro de Solid pero el click abre la
--   URL original en pestaña nueva (fuente de verdad sigue siendo el origen).
-- · BeonAI puede buscarlos para sugerirlos en respuestas relevantes.
-- =====================================================================
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null,
  description text default '',
  url text not null,
  category text default '',
  thumbnail_url text,
  source text default 'other',                        -- loop | sharepoint | web | pdf | other
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists resources_workspace_idx on public.resources(workspace_id, order_index);

alter table public.resources enable row level security;

drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources
  for select using (public.is_workspace_member(workspace_id));

drop policy if exists resources_write on public.resources;
create policy resources_write on public.resources
  for all using (
    public.is_platform_admin() or
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = resources.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner','admin')
    )
  ) with check (
    public.is_platform_admin() or
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = resources.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner','admin')
    )
  );

drop trigger if exists resources_updated_at on public.resources;
create trigger resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 18c. beonai_config · configuración del agente Claude por workspace
-- · system_prompt: instrucciones que un admin edita desde el panel
-- · knowledge_docs: array de { name, content } concatenado al system con
--   cache_control breakpoint para que el SDK de Claude aplique prompt cache
-- · tools_enabled: feature flags por tool name
-- · Singleton por workspace (pk = workspace_id)
-- =====================================================================
create table if not exists public.beonai_config (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  system_prompt text not null default '',
  model text not null default 'claude-sonnet-4-6',
  temperature numeric not null default 0.7,
  max_tokens integer not null default 1024,
  knowledge_docs jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  tools_enabled jsonb not null default '{"read_solid_data":false,"web_search":false}'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.beonai_config enable row level security;

-- Cualquier miembro del workspace puede LEER (el agente usa la config)
drop policy if exists beonai_config_read on public.beonai_config;
create policy beonai_config_read on public.beonai_config
  for select using (public.is_workspace_member(workspace_id));

-- Solo admins de la plataforma o del workspace pueden ESCRIBIR
drop policy if exists beonai_config_write on public.beonai_config;
create policy beonai_config_write on public.beonai_config
  for all using (
    public.is_platform_admin() or
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = beonai_config.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner','admin')
    )
  ) with check (
    public.is_platform_admin() or
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = beonai_config.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner','admin')
    )
  );

-- updated_at automático
drop trigger if exists beonai_config_updated_at on public.beonai_config;
create trigger beonai_config_updated_at before update on public.beonai_config
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 19. Storage bucket · pill-submissions
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pill-submissions', 'pill-submissions', false, 524288000, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- Bucket público para los vídeos de las propias pills (contenido formativo).
-- Público para que el <video> los reproduzca por streaming sin auth · la
-- escritura sigue restringida a admins por las RLS policies de storage.objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pill-videos', 'pill-videos', true, 1073741824, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do nothing;

-- Bucket público para assets de branding de cada workspace (logos, posters, etc.)
-- Lectura pública · escritura por platform admin o workspace admin (vía RLS
-- usando la convención de path "<workspace_id>/<filename>" para el segundo caso).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-assets', 'workspace-assets', true, 10485760, array['image/png','image/jpeg','image/svg+xml','image/webp','image/x-icon'])
on conflict (id) do nothing;

-- =====================================================================
-- 20. Trigger · auto-crea profile cuando se crea un auth.user
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
  new_system_role text;
begin
  select count(*) into user_count from public.profiles;
  -- Primer usuario o email de admin → admin
  if user_count = 0 or new.email ilike '%admin%' or new.email ilike '%@beonit.%' then
    new_system_role := 'admin';
  else
    new_system_role := 'user';
  end if;

  insert into public.profiles(id, email, name, system_role, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new_system_role,
    new_system_role = 'admin'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 21. Trigger · auto-update updated_at en tablas con esa columna
-- =====================================================================
-- (función set_updated_at() definida en sección 0b arriba)

do $$
declare
  tbl text;
begin
  for tbl in
    select c.relname
    from pg_class c
    join pg_attribute a on a.attrelid = c.oid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and a.attname = 'updated_at'
      and c.relkind = 'r'
  loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I;', tbl);
    execute format('create trigger trg_set_updated_at before update on public.%I for each row execute procedure public.set_updated_at();', tbl);
  end loop;
end $$;

-- =====================================================================
-- 22. RLS · ENABLE en todas las tablas
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.workspaces          enable row level security;
alter table public.workspace_members   enable row level security;
alter table public.bookmarks           enable row level security;
alter table public.ratings             enable row level security;
alter table public.progress            enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.user_channels       enable row level security;
alter table public.delivery_prefs      enable row level security;
alter table public.content_push        enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.notification_rules  enable row level security;
alter table public.channel_notifs      enable row level security;
alter table public.inbox_messages      enable row level security;
alter table public.submissions         enable row level security;
alter table public.invitations         enable row level security;
alter table public.activity_log        enable row level security;
alter table public.test_sends          enable row level security;

-- =====================================================================
-- 23. RLS helpers · (definidos arriba en sección 0b, antes de las tablas)
-- =====================================================================

-- =====================================================================
-- 24. RLS policies · profiles
-- =====================================================================
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or public.is_platform_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id or public.is_platform_admin())
  with check (auth.uid() = id or public.is_platform_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_platform_admin());

-- =====================================================================
-- 25. RLS · workspaces · usuario ve los workspaces donde es miembro
-- =====================================================================
drop policy if exists workspaces_member_read on public.workspaces;
create policy workspaces_member_read on public.workspaces
  for select using (
    public.is_platform_admin() or public.is_workspace_member(id, 'member')
  );

drop policy if exists workspaces_admin_write on public.workspaces;
create policy workspaces_admin_write on public.workspaces
  for all using (
    public.is_platform_admin() or public.is_workspace_member(id, 'admin')
  );

-- =====================================================================
-- 26. RLS · workspace_members
-- =====================================================================
drop policy if exists wsm_read on public.workspace_members;
create policy wsm_read on public.workspace_members
  for select using (
    public.is_platform_admin() or user_id = auth.uid() or public.is_workspace_member(workspace_id, 'admin')
  );

drop policy if exists wsm_admin_write on public.workspace_members;
create policy wsm_admin_write on public.workspace_members
  for all using (
    public.is_platform_admin() or public.is_workspace_member(workspace_id, 'admin')
  );

-- =====================================================================
-- 27. RLS · datos del usuario en su workspace
--      patrón común: SELF + same workspace
-- =====================================================================
-- Bookmarks
drop policy if exists bookmarks_self on public.bookmarks;
create policy bookmarks_self on public.bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Ratings (lectura amplia dentro del workspace para agregados)
drop policy if exists ratings_self_write on public.ratings;
create policy ratings_self_write on public.ratings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists ratings_ws_read on public.ratings;
create policy ratings_ws_read on public.ratings
  for select using (public.is_workspace_member(workspace_id, 'member') or public.is_platform_admin());

-- Progress
drop policy if exists progress_self on public.progress;
create policy progress_self on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Conversations + messages
drop policy if exists conv_self on public.conversations;
create policy conv_self on public.conversations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists msg_self on public.messages;
create policy msg_self on public.messages
  for all using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );

-- User channels + delivery prefs + content push + subs + rules + channel notifs + test sends
drop policy if exists user_channels_self on public.user_channels;
create policy user_channels_self on public.user_channels
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists delivery_self on public.delivery_prefs;
create policy delivery_self on public.delivery_prefs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists content_push_self on public.content_push;
create policy content_push_self on public.content_push
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists subs_self on public.subscriptions;
create policy subs_self on public.subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists rules_self on public.notification_rules;
create policy rules_self on public.notification_rules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists channel_notifs_self on public.channel_notifs;
create policy channel_notifs_self on public.channel_notifs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists test_sends_self on public.test_sends;
create policy test_sends_self on public.test_sends
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Inbox · self read · system inserts (vía service role)
drop policy if exists inbox_self_read on public.inbox_messages;
create policy inbox_self_read on public.inbox_messages
  for select using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists inbox_self_update on public.inbox_messages;
create policy inbox_self_update on public.inbox_messages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists inbox_self_delete on public.inbox_messages;
create policy inbox_self_delete on public.inbox_messages
  for delete using (user_id = auth.uid() or public.is_platform_admin());

-- =====================================================================
-- 28. RLS · submissions · self CRUD, managers/admin review
-- =====================================================================
drop policy if exists submissions_self_rw on public.submissions;
create policy submissions_self_rw on public.submissions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists submissions_ws_review on public.submissions;
create policy submissions_ws_review on public.submissions
  for update using (public.is_workspace_member(workspace_id, 'admin') or public.is_platform_admin());

drop policy if exists submissions_ws_read on public.submissions;
create policy submissions_ws_read on public.submissions
  for select using (
    user_id = auth.uid() or public.is_workspace_member(workspace_id, 'admin') or public.is_platform_admin()
  );

-- =====================================================================
-- 29. RLS · invitations · solo admin/manager del workspace
-- =====================================================================
drop policy if exists invitations_ws_admin on public.invitations;
create policy invitations_ws_admin on public.invitations
  for all using (
    public.is_workspace_member(workspace_id, 'admin') or public.is_platform_admin()
  );

drop policy if exists invitations_token_lookup on public.invitations;
create policy invitations_token_lookup on public.invitations
  for select using (true);  -- token lookup público (anyone con token puede leer)

-- =====================================================================
-- 30. RLS · activity_log
-- =====================================================================
drop policy if exists activity_self_insert on public.activity_log;
create policy activity_self_insert on public.activity_log
  for insert with check (user_id = auth.uid());

drop policy if exists activity_self_read on public.activity_log;
create policy activity_self_read on public.activity_log
  for select using (
    user_id = auth.uid()
    or public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  );

-- =====================================================================
-- 31. RLS · storage policies para pill-submissions
-- =====================================================================
drop policy if exists subm_owner_read on storage.objects;
create policy subm_owner_read on storage.objects
  for select using (
    bucket_id = 'pill-submissions'
    and (
      auth.uid()::text = split_part(name, '/', 1)
      or public.is_platform_admin()
    )
  );

drop policy if exists subm_owner_insert on storage.objects;
create policy subm_owner_insert on storage.objects
  for insert with check (
    bucket_id = 'pill-submissions'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists subm_owner_delete on storage.objects;
create policy subm_owner_delete on storage.objects
  for delete using (
    bucket_id = 'pill-submissions'
    and (
      auth.uid()::text = split_part(name, '/', 1)
      or public.is_platform_admin()
    )
  );

-- pill-videos · lectura pública (bucket public=true), escritura por platform
-- admin O por workspace admin cuyo uuid sea el primer segmento del path
-- (convención <workspace_id>/<slug>.<ext> · ej: 7e8a.../p44.mp4).
drop policy if exists pillvid_public_read on storage.objects;
create policy pillvid_public_read on storage.objects
  for select using (bucket_id = 'pill-videos');

drop policy if exists pillvid_admin_insert on storage.objects;
create policy pillvid_admin_insert on storage.objects
  for insert with check (
    bucket_id = 'pill-videos' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

drop policy if exists pillvid_admin_update on storage.objects;
create policy pillvid_admin_update on storage.objects
  for update using (
    bucket_id = 'pill-videos' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

drop policy if exists pillvid_admin_delete on storage.objects;
create policy pillvid_admin_delete on storage.objects
  for delete using (
    bucket_id = 'pill-videos' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

-- workspace-assets · lectura pública. Escritura por platform admin o por
-- admins del workspace cuyo id sea el primer segmento del path
-- (convención: <workspace_uuid>/logo.png).
drop policy if exists wsassets_public_read on storage.objects;
create policy wsassets_public_read on storage.objects
  for select using (bucket_id = 'workspace-assets');

drop policy if exists wsassets_admin_insert on storage.objects;
create policy wsassets_admin_insert on storage.objects
  for insert with check (
    bucket_id = 'workspace-assets' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

drop policy if exists wsassets_admin_update on storage.objects;
create policy wsassets_admin_update on storage.objects
  for update using (
    bucket_id = 'workspace-assets' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

drop policy if exists wsassets_admin_delete on storage.objects;
create policy wsassets_admin_delete on storage.objects
  for delete using (
    bucket_id = 'workspace-assets' and (
      public.is_platform_admin()
      or public.is_workspace_member(nullif(split_part(name, '/', 1), '')::uuid, 'admin')
    )
  );

-- =====================================================================
-- 32a. pills · catálogo de pills por workspace (multi-tenant content)
-- =====================================================================
-- Reemplaza el array hardcoded en docs/prototype-home.jsx. Cada cliente
-- tiene sus propias pills · el frontend las carga del DB al activarse el
-- workspace. RLS aísla por workspace_id.
create table if not exists public.pills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  pill_number int not null,
  slug text,
  title text not null,
  one_liner text,
  teacher text default 'BeonIt × Cliente',
  duration text default '4 min',
  tone text default 'teal',
  format text default 'módulo',
  level text default 'principiante',
  rating numeric(3,1) default 4.7,
  enrolled int default 0,
  category text not null,
  yt text,
  mp4 text,
  poster text,
  featured boolean default false,
  new_badge boolean default false,
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, pill_number)
);
create index if not exists pills_ws_idx on public.pills(workspace_id, position);
create index if not exists pills_ws_cat_idx on public.pills(workspace_id, category);
create index if not exists pills_ws_featured_idx on public.pills(workspace_id) where featured = true;

alter table public.pills enable row level security;

drop policy if exists pills_read on public.pills;
create policy pills_read on public.pills
  for select using (
    public.is_workspace_member(workspace_id, 'member')
    or public.is_platform_admin()
  );

drop policy if exists pills_write on public.pills;
create policy pills_write on public.pills
  for all using (
    public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  ) with check (
    public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  );

drop trigger if exists pills_updated_at on public.pills;
create trigger pills_updated_at before update on public.pills
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 32. Realtime · publica eventos para sync cross-device
-- · Envueltos en DO block que ignora el error 42710 (la tabla ya está
--   en la publication) · permite re-ejecutar schema.sql sin romper.
-- =====================================================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'public.inbox_messages',
    'public.conversations',
    'public.messages',
    'public.submissions',
    'public.activity_log',
    'public.pills'
  ])
  loop
    begin
      execute 'alter publication supabase_realtime add table ' || t;
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- =====================================================================
-- 35. workspace_content · catálogo multi-formato por workspace
-- · Una sola tabla para PATHS / SERIES / REELS / PODCASTS, distinguidos
--   por la columna `kind`. Antes estos arrays vivían hardcoded en el
--   bundle JS como datos de Repsol y se "filtraban" a todos los
--   workspaces · ahora cada tenant tiene los suyos.
-- · Misma estrategia de RLS que pills: members read, admins write.
-- =====================================================================
create table if not exists public.workspace_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('path','series','reel','podcast')),
  slug text,
  title text not null,
  teacher text,
  duration text,
  tone text,
  format text,
  level text,
  rating numeric,
  enrolled integer default 0,
  category text,
  position integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, kind, slug)
);
create index if not exists workspace_content_ws_kind_idx on public.workspace_content(workspace_id, kind, position);

alter table public.workspace_content enable row level security;

drop policy if exists ws_content_read on public.workspace_content;
create policy ws_content_read on public.workspace_content
  for select using (
    public.is_workspace_member(workspace_id, 'member')
    or public.is_platform_admin()
  );

drop policy if exists ws_content_write on public.workspace_content;
create policy ws_content_write on public.workspace_content
  for all using (
    public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  ) with check (
    public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  );

do $$ begin
  alter publication supabase_realtime add table public.workspace_content;
exception when duplicate_object then null;
end $$;

-- =====================================================================
-- 36. certificates · certificados emitidos al completar una ruta
-- · El frontend dispara 'route-completed' cuando todas las pills de una
--   ruta están en progress.completed_at IS NOT NULL.
-- · Un listener inserta una fila aquí (idempotente por user+route).
-- · El user descarga el PDF generado del template del frontend
--   (Certificates.generateHTML).
-- =====================================================================
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  route_id text not null,                       -- slug o uuid del path
  route_title text not null,                    -- snapshot del nombre al emitir
  cert_number text not null default ('CERT-' || to_char(now(), 'YYYY') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  completed_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb,           -- score, total, etc.
  created_at timestamptz default now(),
  unique(user_id, workspace_id, route_id)        -- idempotente · 1 cert por user/ws/ruta
);
create index if not exists certificates_user_idx on public.certificates(user_id, completed_at desc);
create index if not exists certificates_workspace_idx on public.certificates(workspace_id, completed_at desc);

alter table public.certificates enable row level security;

-- User lee sus propios certs
drop policy if exists certs_read_self on public.certificates;
create policy certs_read_self on public.certificates
  for select using (user_id = auth.uid());

-- Admins del workspace + platform admin ven todos los del workspace
drop policy if exists certs_read_admin on public.certificates;
create policy certs_read_admin on public.certificates
  for select using (
    public.is_workspace_member(workspace_id, 'admin')
    or public.is_platform_admin()
  );

-- User puede insertar sus propios certs (cuando completa una ruta)
drop policy if exists certs_insert_self on public.certificates;
create policy certs_insert_self on public.certificates
  for insert with check (user_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.certificates;
exception when duplicate_object then null;
end $$;

-- =====================================================================
-- DONE · revisa Authentication → Settings y habilita los providers que uses
-- (email/password siempre, Azure AD opcional para SSO Microsoft).
-- =====================================================================
