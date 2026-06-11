-- ============================================================================
-- SolidStream · Leaderboard del workspace (ranking del equipo)
-- ============================================================================
-- Devuelve top N usuarios del workspace por puntos. Los puntos se CALCULAN
-- al vuelo desde las tablas existentes · no hay tabla "points" que mantener:
--
--   · cada pill completada      = 10 pts  (public.progress.completed_at)
--   · cada examen aprobado      = 50 pts  (public.route_exams.passed)
--   · cada inscripción          =  5 pts  (public.enrollments)
--   · cada certificado emitido  = 30 pts  (public.certificates)
--
-- También devuelve métricas de la semana en curso (lunes 00:00 → ahora) por
-- usuario, para alimentar los retos semanales (completas N pills, apruebas
-- examen, etc.).
--
-- SECURITY DEFINER + guard: solo platform admin o member del workspace ven
-- el leaderboard (incluye sus propios datos · todos los miembros pueden ver
-- el ranking, no solo admins).
--
-- Idempotente. Ejecutar en SQL Editor.
-- ============================================================================

drop function if exists public.workspace_leaderboard(uuid, int);
create or replace function public.workspace_leaderboard(p_workspace_id uuid, p_limit int default 50)
returns table (
  user_id        uuid,
  name           text,
  avatar_color   text,
  role           text,
  team           text,
  points         bigint,
  completed      bigint,
  passed_exams   bigint,
  enrolled       bigint,
  certs          bigint,
  -- Semana en curso (lunes ISO 00:00 → ahora) para retos
  week_completed bigint,
  week_passed    bigint,
  week_ratings   bigint
)
language sql security definer stable
set search_path = public, auth
as $$
  with
  -- Guard · solo miembros (incluido admin) del workspace ven el leaderboard.
  guard as (
    select case
      when auth.uid() is null
        or public.is_platform_admin()
        or public.is_workspace_member(p_workspace_id, 'member')
      then true else false end as ok
  ),
  base as (
    select wm.user_id, p.name, p.avatar_color, p.role, p.team
    from public.workspace_members wm
    left join public.profiles p on p.id = wm.user_id
    where wm.workspace_id = p_workspace_id
  ),
  pc as (
    select user_id, count(*)::bigint as cnt from public.progress
    where workspace_id = p_workspace_id and completed_at is not null
    group by user_id
  ),
  ex as (
    select user_id, count(*)::bigint as cnt from public.route_exams
    where passed = true group by user_id
  ),
  en as (
    select user_id, count(*)::bigint as cnt from public.enrollments
    where workspace_id = p_workspace_id group by user_id
  ),
  ct as (
    select user_id, count(*)::bigint as cnt from public.certificates
    where workspace_id = p_workspace_id group by user_id
  ),
  -- Semana ISO actual: monday 00:00 → now
  wpc as (
    select user_id, count(*)::bigint as cnt from public.progress
    where workspace_id = p_workspace_id and completed_at is not null
      and completed_at >= date_trunc('week', now())
    group by user_id
  ),
  wex as (
    select user_id, count(*)::bigint as cnt from public.route_exams
    where passed = true and completed_at >= date_trunc('week', now())
    group by user_id
  ),
  wra as (
    select user_id, count(*)::bigint as cnt from public.ratings
    where workspace_id = p_workspace_id
      and coalesce(updated_at, created_at) >= date_trunc('week', now())
    group by user_id
  )
  select
    b.user_id, b.name, b.avatar_color, b.role, b.team,
    (coalesce(pc.cnt,0) * 10
     + coalesce(ex.cnt,0) * 50
     + coalesce(en.cnt,0) * 5
     + coalesce(ct.cnt,0) * 30)::bigint as points,
    coalesce(pc.cnt,0)  as completed,
    coalesce(ex.cnt,0)  as passed_exams,
    coalesce(en.cnt,0)  as enrolled,
    coalesce(ct.cnt,0)  as certs,
    coalesce(wpc.cnt,0) as week_completed,
    coalesce(wex.cnt,0) as week_passed,
    coalesce(wra.cnt,0) as week_ratings
  from base b
  left join pc  on pc.user_id  = b.user_id
  left join ex  on ex.user_id  = b.user_id
  left join en  on en.user_id  = b.user_id
  left join ct  on ct.user_id  = b.user_id
  left join wpc on wpc.user_id = b.user_id
  left join wex on wex.user_id = b.user_id
  left join wra on wra.user_id = b.user_id
  where (select ok from guard)
  order by points desc, completed desc, name asc
  limit p_limit;
$$;

revoke execute on function public.workspace_leaderboard(uuid, int) from public;
grant execute on function public.workspace_leaderboard(uuid, int) to authenticated;

-- ============================================================================
-- FIN · tras ejecutarlo, la vista "Ranking del equipo" se rellena.
-- ============================================================================
