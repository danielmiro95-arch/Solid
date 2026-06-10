-- ============================================================================
-- SolidStream · métricas por usuario del workspace (para panel admin)
-- ============================================================================
-- Devuelve, por cada miembro del workspace, sus contadores reales de
-- bookmarks / conversaciones / pills completadas / inscripciones + último
-- login. Reemplaza la lectura de localStorage (que no funciona en modo
-- Supabase para usuarios distintos al que mira).
--
-- SECURITY DEFINER + guard: solo platform admins o admins del workspace
-- obtienen filas (un no-admin recibe resultado vacío, sin error).
--
-- Requiere que exista public.enrollments (db/enrollments-table.sql). Ejecutar
-- ESE primero si aún no lo hiciste.
--
-- Ejecutar ENTERO en el SQL Editor de Supabase. Idempotente.
-- ============================================================================

drop function if exists public.workspace_user_metrics(uuid);
create or replace function public.workspace_user_metrics(p_workspace_id uuid)
returns table (
  user_id      uuid,
  email        text,
  name         text,
  role         text,
  team         text,
  bookmarks    bigint,
  chats        bigint,
  completed    bigint,
  enrolled     bigint,
  last_sign_in timestamptz
)
language sql security definer stable
set search_path = public, auth
as $$
  select
    p.id, p.email, p.name, p.role, p.team,
    coalesce(b.cnt, 0)  as bookmarks,
    coalesce(c.cnt, 0)  as chats,
    coalesce(pr.cnt, 0) as completed,
    coalesce(e.cnt, 0)  as enrolled,
    u.last_sign_in_at
  from public.workspace_members wm
  join public.profiles p on p.id = wm.user_id
  left join auth.users u on u.id = p.id
  left join (select user_id, count(*) cnt from public.bookmarks     where workspace_id = p_workspace_id group by user_id) b  on b.user_id  = p.id
  left join (select user_id, count(*) cnt from public.conversations where workspace_id = p_workspace_id group by user_id) c  on c.user_id  = p.id
  left join (select user_id, count(*) cnt from public.progress      where workspace_id = p_workspace_id and completed_at is not null group by user_id) pr on pr.user_id = p.id
  left join (select user_id, count(*) cnt from public.enrollments   where workspace_id = p_workspace_id group by user_id) e  on e.user_id  = p.id
  where wm.workspace_id = p_workspace_id
    and (public.is_platform_admin() or public.is_workspace_member(p_workspace_id, 'admin'))
  order by completed desc, name asc;
$$;

revoke execute on function public.workspace_user_metrics(uuid) from public;
grant execute on function public.workspace_user_metrics(uuid) to authenticated;

-- ============================================================================
-- FIN · el panel admin (Supabase) usa este RPC para las columnas
-- bookmarks/chats/completados/inscritos por usuario.
-- ============================================================================
