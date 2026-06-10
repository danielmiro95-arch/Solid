-- ============================================================================
-- SolidStream · Security hardening
-- ============================================================================
-- Cierra los hallazgos críticos/altos de la revisión total (b78).
-- Ejecutar ENTERO en el SQL Editor de Supabase. Es idempotente (create or
-- replace / drop if exists) · se puede re-ejecutar sin problema.
--
-- Qué arregla:
--   1. search_path fijo en las funciones definer que sostienen toda la RLS
--   2. Guard de admin en las funciones SECURITY DEFINER de demo/seed
--   3. Password de demo aleatorio para workspaces REALES (predecible solo en
--      workspaces "*-demo" de presentación)
--   4. handle_new_user · quita el auto-admin por email ("%admin%" / @beonit.*)
--   5. Trigger anti-escalada · un usuario no puede hacerse admin a sí mismo
--   6. Invitations · cierra la policy `using(true)` (tokens legibles por todos)
--      y define los RPC token-lookup/accept que el frontend ya usa
--
-- Nota sobre el guard: las funciones se llaman de DOS formas ·
--   (a) desde el SQL Editor / service_role → auth.uid() es NULL → se permite
--       (ya tienes acceso total a la DB ahí)
--   (b) vía RPC desde el cliente autenticado → auth.uid() = el user → debe ser
--       admin del workspace destino
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) search_path fijo en las funciones que respaldan TODA la RLS
-- ----------------------------------------------------------------------------
create or replace function public.is_platform_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select coalesce((select system_role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_workspace_member(ws_id uuid, min_role text default 'member')
returns boolean language sql security definer stable
set search_path = public as $$
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


-- ----------------------------------------------------------------------------
-- 2 + 3) create_demo_user_for_workspace · guard de admin + password aleatorio
-- ----------------------------------------------------------------------------
create or replace function public.create_demo_user_for_workspace(p_workspace_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_ws_id      uuid;
  v_ws_name    text;
  v_user_id    uuid;
  v_email      text;
  v_password   text;
  v_existing   boolean := false;
begin
  -- Resolver workspace
  select id, name into v_ws_id, v_ws_name
  from public.workspaces where slug = p_workspace_slug limit 1;
  if v_ws_id is null then
    raise exception 'No existe workspace con slug "%"', p_workspace_slug;
  end if;

  -- GUARD · si lo llama un user autenticado (RPC), debe ser admin del workspace
  -- destino o platform admin. Si auth.uid() es null (SQL Editor / service_role)
  -- se permite (acceso a DB ya implica privilegio).
  if auth.uid() is not null
     and not (public.is_platform_admin() or public.is_workspace_member(v_ws_id, 'admin')) then
    raise exception 'forbidden: solo admins del workspace pueden crear demo users';
  end if;

  v_email := 'demo+' || p_workspace_slug || '@beonit.es';

  -- Password · predecible SOLO en workspaces de presentación ("*-demo" o "demo").
  -- En tenants reales (Repsol, BBVA…) es aleatorio · evita el backdoor
  -- "demo+slug@beonit.es / Demo2026!" adivinable.
  if p_workspace_slug like '%-demo' or p_workspace_slug = 'demo' then
    v_password := 'Demo2026!';
  else
    v_password := 'Sol-' || substr(md5(random()::text || clock_timestamp()::text), 1, 10) || '9!';
  end if;

  -- Auth user · crea o resetea
  select id into v_user_id from auth.users where email = v_email limit 1;
  if v_user_id is null then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new
    ) values (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name','Usuario Demo','role','Learning Manager','is_demo',true,'workspace',v_ws_name),
      now(), now(), '', '', ''
    ) returning id into v_user_id;
  else
    v_existing := true;
    update auth.users
    set encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now())
    where id = v_user_id;
  end if;

  insert into public.profiles (id, email, name, role, system_role, team)
  values (v_user_id, v_email, 'Usuario Demo · ' || v_ws_name, 'Learning Manager', 'user', v_ws_name)
  on conflict (id) do update set
    name = excluded.name, role = excluded.role, team = excluded.team, system_role = 'user';

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_ws_id, v_user_id, 'member')
  on conflict (workspace_id, user_id) do nothing;

  update public.profiles set current_workspace_id = v_ws_id where id = v_user_id;

  return jsonb_build_object(
    'status',    case when v_existing then 'reset' else 'created' end,
    'workspace', v_ws_name,
    'email',     v_email,
    'password',  v_password,
    'user_id',   v_user_id,
    'login_url', 'https://solid-stream.vercel.app/?ws=' || p_workspace_slug
  );
end;
$$;
-- Sigue concedida a authenticated PERO el guard interno bloquea a los no-admin.
revoke execute on function public.create_demo_user_for_workspace(text) from public;
grant execute on function public.create_demo_user_for_workspace(text) to authenticated;


-- list_demo_users · solo platform admin (o SQL editor) ve la lista
create or replace function public.list_demo_users()
returns table (workspace text, email text, created_at timestamptz, last_login_at timestamptz)
language sql security definer
set search_path = public, auth as $$
  select w.name as workspace, u.email, u.created_at, u.last_sign_in_at as last_login_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.workspaces w on w.id = p.current_workspace_id
  where u.email like 'demo+%@beonit.es'
    and (auth.uid() is null or public.is_platform_admin())
  order by u.created_at desc;
$$;
revoke execute on function public.list_demo_users() from public;
grant execute on function public.list_demo_users() to authenticated;


-- delete_demo_user_for_workspace · mismo guard de admin
create or replace function public.delete_demo_user_for_workspace(p_workspace_slug text)
returns jsonb
language plpgsql security definer
set search_path = public, auth
as $$
declare
  v_email   text;
  v_user_id uuid;
  v_ws_id   uuid;
begin
  v_email := 'demo+' || p_workspace_slug || '@beonit.es';
  select id into v_ws_id from public.workspaces where slug = p_workspace_slug limit 1;

  if auth.uid() is not null
     and not (public.is_platform_admin() or (v_ws_id is not null and public.is_workspace_member(v_ws_id, 'admin'))) then
    raise exception 'forbidden: solo admins pueden borrar demo users';
  end if;

  select id into v_user_id from auth.users where email = v_email limit 1;
  if v_user_id is null then
    return jsonb_build_object('status', 'not_found', 'email', v_email);
  end if;

  begin delete from public.workspace_members where user_id = v_user_id; exception when others then null; end;
  begin delete from public.profiles          where id      = v_user_id; exception when others then null; end;
  begin delete from public.bookmarks         where user_id = v_user_id; exception when others then null; end;
  begin delete from public.progress          where user_id = v_user_id; exception when others then null; end;
  begin delete from public.certificates      where user_id = v_user_id; exception when others then null; end;
  begin delete from auth.identities          where user_id = v_user_id; exception when others then null; end;
  begin delete from auth.sessions            where user_id = v_user_id; exception when others then null; end;
  begin delete from auth.refresh_tokens      where user_id::text = v_user_id::text; exception when others then null; end;
  delete from auth.users where id = v_user_id;

  return jsonb_build_object('status', 'deleted', 'email', v_email);
end;
$$;
revoke execute on function public.delete_demo_user_for_workspace(text) from public;
grant execute on function public.delete_demo_user_for_workspace(text) to authenticated;


-- seed_workspace_starter_pack · guard de admin (resto del cuerpo intacto)
create or replace function public.seed_workspace_starter_pack(p_workspace_slug text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_ws_id uuid; v_paths_in int; v_pills_in int;
  v_starter_id uuid; v_communication_id uuid; v_leadership_id uuid; v_productivity_id uuid;
begin
  select id into v_ws_id from public.workspaces where slug = p_workspace_slug limit 1;
  if v_ws_id is null then
    raise exception 'No existe workspace con slug "%"', p_workspace_slug;
  end if;

  if auth.uid() is not null
     and not (public.is_platform_admin() or public.is_workspace_member(v_ws_id, 'admin')) then
    raise exception 'forbidden: solo admins del workspace pueden sembrar contenido';
  end if;

  insert into public.workspace_content (
    workspace_id, kind, slug, title, teacher, duration, tone, format, level,
    rating, enrolled, category, position, metadata
  )
  select v_ws_id, 'path', x.slug, x.title, x.teacher, x.duration, x.tone, x.format, x.level,
         x.rating, x.enrolled, x.category, x.position, jsonb_build_object('accent', x.accent)
  from (values
    ('starter-bienvenida',  'Bienvenida a la plataforma', 'Equipo de Formación', '20 min · 3 módulos', 'teal',   'curso', 'Básico', 4.9, 0, 'Introducción', 1, '#0072BE'),
    ('starter-comunicacion','Comunicación efectiva',      'Equipo de Formación', '1 h · 3 módulos',     'amber',  'curso', 'Básico', 4.8, 0, 'Comunicación', 2, '#0072BE'),
    ('starter-liderazgo',   'Liderazgo de equipos',       'Equipo de Formación', '1.5 h · 3 módulos',   'violet', 'curso', 'Intermedio', 4.7, 0, 'Liderazgo', 3, '#FC220D'),
    ('starter-productividad','Productividad y gestión del tiempo', 'Equipo de Formación', '1 h · 3 módulos', 'teal', 'curso', 'Básico', 4.8, 0, 'Productividad', 4, '#F3A525')
  ) as x(slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position, accent)
  on conflict (workspace_id, kind, slug) do nothing;

  select id into v_starter_id       from public.workspace_content where workspace_id=v_ws_id and kind='path' and slug='starter-bienvenida'   limit 1;
  select id into v_communication_id from public.workspace_content where workspace_id=v_ws_id and kind='path' and slug='starter-comunicacion' limit 1;
  select id into v_leadership_id    from public.workspace_content where workspace_id=v_ws_id and kind='path' and slug='starter-liderazgo'    limit 1;
  select id into v_productivity_id  from public.workspace_content where workspace_id=v_ws_id and kind='path' and slug='starter-productividad' limit 1;

  insert into public.pills (
    workspace_id, pill_number, slug, title, one_liner, teacher, duration,
    tone, format, level, rating, enrolled, category, featured, new_badge, position, path_id
  )
  select v_ws_id, x.pill_number, x.slug, x.title, x.one_liner, x.teacher, x.duration,
         x.tone, x.format, x.level, x.rating, x.enrolled, x.category, x.featured, x.new_badge, x.position, x.path_id
  from (values
    (8001, 'starter-tour',          'Tour rápido de la plataforma',     'En 5 minutos te enseñamos lo esencial · qué encontrarás y cómo navegar', 'Equipo de Formación', '5 min', 'teal', 'pill', 'Básico', 4.9, 0, 'Introducción', true,  true,  1, v_starter_id),
    (8002, 'starter-objetivos',     'Cómo aprovechar tu formación',     'Marca tus objetivos · sigue tu progreso · gana certificados',           'Equipo de Formación', '6 min', 'teal', 'pill', 'Básico', 4.8, 0, 'Introducción', false, true,  2, v_starter_id),
    (8003, 'starter-canales',       'Configura tus canales',            'Recibe pills del día en WhatsApp · Teams · email · como prefieras',     'Equipo de Formación', '4 min', 'teal', 'pill', 'Básico', 4.7, 0, 'Introducción', false, false, 3, v_starter_id),
    (8101, 'comm-escucha',          'Escucha activa que cambia conversaciones', 'Tres técnicas para entender antes de responder',              'Equipo de Formación', '7 min', 'amber', 'pill', 'Básico',    4.8, 0, 'Comunicación', false, false, 4, v_communication_id),
    (8102, 'comm-feedback',         'Feedback que se recibe bien',      'Específico · oportuno · accionable · sin drama',                        'Equipo de Formación', '6 min', 'amber', 'pill', 'Intermedio',4.9, 0, 'Comunicación', false, false, 5, v_communication_id),
    (8103, 'comm-presentaciones',   'Presentaciones que enganchan',     'Una idea por slide · estructura clara · cierre potente',                'Equipo de Formación', '8 min', 'amber', 'pill', 'Intermedio',4.7, 0, 'Comunicación', false, false, 6, v_communication_id),
    (8201, 'lead-confianza',        'Construir confianza con tu equipo','Reuniones 1-a-1 que importan · transparencia · coherencia',             'Equipo de Formación', '8 min', 'violet','pill', 'Intermedio',4.8, 0, 'Liderazgo',    false, false, 7, v_leadership_id),
    (8202, 'lead-delegar',          'Delegar sin perder control',       'Marco RACI sencillo · ownership real · check-ins ligeros',              'Equipo de Formación', '7 min', 'violet','pill', 'Intermedio',4.7, 0, 'Liderazgo',    false, false, 8, v_leadership_id),
    (8203, 'lead-decisiones',       'Tomar decisiones bajo presión',    'Marcos prácticos para decidir cuando falta información o tiempo',       'Equipo de Formación', '9 min', 'violet','pill', 'Experto',   4.8, 0, 'Liderazgo',    false, false, 9, v_leadership_id),
    (8301, 'prod-prioridades',      'Matriz de prioridades aplicada',   'Urgente vs importante en 60 segundos · plantilla descargable',          'Equipo de Formación', '6 min', 'teal', 'pill', 'Básico',     4.9, 0, 'Productividad',false, false, 10, v_productivity_id),
    (8302, 'prod-bloques',          'Bloques de tiempo · time blocking','Tu calendario como contrato contigo mismo',                            'Equipo de Formación', '5 min', 'teal', 'pill', 'Básico',     4.8, 0, 'Productividad',false, false, 11, v_productivity_id),
    (8303, 'prod-decir-no',         'Decir "no" sin romper relaciones', 'Plantillas para reuniones, peticiones, deadlines',                      'Equipo de Formación', '6 min', 'teal', 'pill', 'Intermedio', 4.7, 0, 'Productividad',false, false, 12, v_productivity_id)
  ) as x(pill_number, slug, title, one_liner, teacher, duration, tone, format, level, rating, enrolled, category, featured, new_badge, position, path_id)
  on conflict (workspace_id, pill_number) do nothing;

  select count(*) into v_paths_in from public.workspace_content where workspace_id=v_ws_id and kind='path' and slug like 'starter-%';
  select count(*) into v_pills_in from public.pills where workspace_id=v_ws_id and slug in (
    'starter-tour','starter-objetivos','starter-canales',
    'comm-escucha','comm-feedback','comm-presentaciones',
    'lead-confianza','lead-delegar','lead-decisiones',
    'prod-prioridades','prod-bloques','prod-decir-no');

  return jsonb_build_object('status','ok','workspace',p_workspace_slug,'paths',v_paths_in,'pills',v_pills_in);
end;
$$;
revoke execute on function public.seed_workspace_starter_pack(text) from public;
grant execute on function public.seed_workspace_starter_pack(text) to authenticated;


-- ----------------------------------------------------------------------------
-- 4) handle_new_user · quita el auto-admin por email (vector de escalada)
--    Solo el PRIMER usuario del sistema arranca como admin (bootstrap).
--    El resto entra como 'user' y se promueve a mano desde el panel admin.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
  new_system_role text;
begin
  select count(*) into user_count from public.profiles;
  if user_count = 0 then
    new_system_role := 'admin';   -- bootstrap del primer admin
  else
    new_system_role := 'user';
  end if;

  insert into public.profiles(id, email, name, system_role, is_admin)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new_system_role, new_system_role = 'admin'
  )
  on conflict (id) do nothing;
  return new;
end; $$;


-- ----------------------------------------------------------------------------
-- 5) Trigger anti-escalada · un user no puede cambiarse system_role/is_admin
--    a sí mismo (la policy profiles_self_update permite editar tu fila, pero
--    no debe permitir tocar las columnas de privilegio).
-- ----------------------------------------------------------------------------
create or replace function public.prevent_privilege_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.system_role is distinct from old.system_role
      or new.is_admin is distinct from old.is_admin)
     and auth.uid() is not null
     and not public.is_platform_admin() then
    -- Revierte cualquier intento de cambiar privilegios por parte de un no-admin
    new.system_role := old.system_role;
    new.is_admin := old.is_admin;
  end if;
  return new;
end; $$;

drop trigger if exists trg_prevent_priv_escalation on public.profiles;
create trigger trg_prevent_priv_escalation
  before update on public.profiles
  for each row execute function public.prevent_privilege_escalation();


-- ----------------------------------------------------------------------------
-- 6) Invitations · cierra la fuga de tokens y define los RPC que el front usa
-- ----------------------------------------------------------------------------
-- Quita la policy world-readable. El admin del workspace sigue leyendo sus
-- invitaciones vía invitations_ws_admin; el invitee resuelve su token por RPC.
drop policy if exists invitations_token_lookup on public.invitations;

-- Lookup por token exacto · solo campos no sensibles · pending y no caducada.
create or replace function public.get_invitation_by_token(_token text)
returns table (token text, workspace_id uuid, workspace_name text, email text, name text, role text, team text, status text)
language sql security definer stable
set search_path = public as $$
  select i.token, i.workspace_id, w.name as workspace_name, i.email, i.name, i.role, i.team, i.status
  from public.invitations i
  left join public.workspaces w on w.id = i.workspace_id
  where i.token = _token
    and i.status = 'pending'
    and (i.expires_at is null or i.expires_at > now())
  limit 1;
$$;
revoke execute on function public.get_invitation_by_token(text) from public;
grant execute on function public.get_invitation_by_token(text) to anon, authenticated;

-- Aceptar invitación · añade al workspace + marca accepted. Requiere sesión.
create or replace function public.accept_invitation(_token text)
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_inv  public.invitations%rowtype;
  v_uid  uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    return jsonb_build_object('status','not_authenticated');
  end if;
  select * into v_inv from public.invitations
  where token = _token and status = 'pending'
    and (expires_at is null or expires_at > now())
  limit 1;
  if v_inv.token is null then
    return jsonb_build_object('status','invalid');
  end if;

  -- workspace_members.role solo admite owner/admin/member · el resto → member
  v_role := case when v_inv.role in ('owner','admin','member') then v_inv.role else 'member' end;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_inv.workspace_id, v_uid, v_role)
  on conflict (workspace_id, user_id) do nothing;

  update public.invitations set status = 'accepted', accepted_at = now() where token = _token;
  update public.profiles set current_workspace_id = v_inv.workspace_id
    where id = v_uid and current_workspace_id is null;

  return jsonb_build_object('status','accepted','workspace_id',v_inv.workspace_id);
end; $$;
revoke execute on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to authenticated;

-- ============================================================================
-- FIN · re-ejecutable. Tras correrlo, verifica en el panel que:
--   · "Crear demo user" sigue funcionando (eres admin)
--   · un user normal NO puede llamar las RPC (rpc() devuelve 'forbidden')
--   · el login con invitación sigue resolviendo el token
-- ============================================================================
