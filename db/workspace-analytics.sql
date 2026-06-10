-- ============================================================================
-- SolidStream · Analytics del workspace (admin) · datos reales
-- ============================================================================
-- Devuelve KPIs + rankings agregados del workspace en una sola llamada:
--   · totales (miembros, inscripciones, completados, certificados, horas
--     vistas, valoración media, conversaciones BeonAI)
--   · top 10 pills más vistas (por nº de progresos > 0)
--   · top 10 pills mejor valoradas (avg estrellas, min 2 ratings)
--   · top 10 usuarios por completados
--   · serie 30 días · pills completadas por día (curva de engagement)
--
-- SECURITY DEFINER · guard de admin del workspace (o platform admin).
-- Ejecutar en SQL Editor. Idempotente.
-- ============================================================================

drop function if exists public.workspace_analytics(uuid);
create or replace function public.workspace_analytics(p_workspace_id uuid)
returns jsonb
language plpgsql security definer stable
set search_path = public, auth
as $$
declare
  v_result jsonb;
begin
  -- Guard · solo platform admin o admin del workspace
  if auth.uid() is not null
     and not (public.is_platform_admin() or public.is_workspace_member(p_workspace_id, 'admin')) then
    raise exception 'forbidden: solo admins del workspace pueden ver analytics';
  end if;

  with
  m as (select count(*)::int as cnt from public.workspace_members where workspace_id = p_workspace_id),
  e as (select count(*)::int as cnt from public.enrollments     where workspace_id = p_workspace_id),
  pc as (select count(*)::int as cnt, coalesce(sum(watch_seconds),0)::bigint as secs
         from public.progress where workspace_id = p_workspace_id and completed_at is not null),
  cert as (select count(*)::int as cnt from public.certificates where workspace_id = p_workspace_id),
  r as (select coalesce(avg(stars)::numeric,0) as avg_stars, count(*)::int as cnt
        from public.ratings where workspace_id = p_workspace_id),
  conv as (select count(*)::int as cnt from public.conversations where workspace_id = p_workspace_id),
  top_pills_views as (
    select pill_id, count(*)::int as views
    from public.progress
    where workspace_id = p_workspace_id and progress > 0
    group by pill_id order by count(*) desc limit 10
  ),
  top_pills_rated as (
    select pill_id, round(avg(stars)::numeric, 2) as avg_stars, count(*)::int as votes
    from public.ratings where workspace_id = p_workspace_id
    group by pill_id having count(*) >= 2
    order by avg(stars) desc, count(*) desc limit 10
  ),
  top_users as (
    select pr.user_id, count(*)::int as completed, p.name, p.email
    from public.progress pr
    left join public.profiles p on p.id = pr.user_id
    where pr.workspace_id = p_workspace_id and pr.completed_at is not null
    group by pr.user_id, p.name, p.email
    order by count(*) desc limit 10
  ),
  series_30d as (
    select to_char(d::date, 'YYYY-MM-DD') as day,
           coalesce((select count(*)::int from public.progress
                     where workspace_id = p_workspace_id
                       and completed_at is not null
                       and completed_at::date = d::date), 0) as completed
    from generate_series(current_date - interval '29 days', current_date, interval '1 day') as d
    order by d
  )
  select jsonb_build_object(
    'kpis', jsonb_build_object(
      'members',      (select cnt from m),
      'enrollments',  (select cnt from e),
      'completed',    (select cnt from pc),
      'watch_hours',  round((select secs from pc)::numeric / 3600, 1),
      'certificates', (select cnt from cert),
      'avg_rating',   round(coalesce((select avg_stars from r),0)::numeric, 2),
      'ratings_count',(select cnt from r),
      'conversations',(select cnt from conv)
    ),
    'top_pills_views', coalesce((select jsonb_agg(jsonb_build_object('pill_id', pill_id, 'views', views)) from top_pills_views), '[]'::jsonb),
    'top_pills_rated', coalesce((select jsonb_agg(jsonb_build_object('pill_id', pill_id, 'avg', avg_stars, 'votes', votes)) from top_pills_rated), '[]'::jsonb),
    'top_users',       coalesce((select jsonb_agg(jsonb_build_object('user_id', user_id, 'name', name, 'email', email, 'completed', completed)) from top_users), '[]'::jsonb),
    'series_30d',      coalesce((select jsonb_agg(jsonb_build_object('day', day, 'completed', completed)) from series_30d), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

revoke execute on function public.workspace_analytics(uuid) from public;
grant execute on function public.workspace_analytics(uuid) to authenticated;

-- ============================================================================
-- FIN · tras ejecutarlo, el panel admin "Analytics real" se rellena.
-- Requiere que existan public.enrollments y public.certificates.
-- ============================================================================
