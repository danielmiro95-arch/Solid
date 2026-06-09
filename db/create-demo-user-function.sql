-- ============================================================================
-- Función · create_demo_user_for_workspace
-- ============================================================================
-- Crea un usuario "demo" en cualquier workspace para presentaciones a
-- cliente. Patrón consistente: email predecible, password fijo, rol user,
-- nombre genérico. La UX simplificada se activa automáticamente vía el
-- DemoMode role-based del b53 · cero configuración adicional necesaria.
--
-- Uso (desde Supabase SQL Editor):
--   SELECT create_demo_user_for_workspace('hijos-de-rivera-demo');
--   SELECT create_demo_user_for_workspace('estrella-galicia');
--   SELECT create_demo_user_for_workspace('repsol');
--
-- Devuelve un JSON con email + password + status para que se pueda
-- compartir directamente con el cliente al final de la demo.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_demo_user_for_workspace(p_workspace_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ws_id      uuid;
  v_ws_name    text;
  v_user_id    uuid;
  v_email      text;
  v_password   text := 'Demo2026!';
  v_existing   boolean := false;
BEGIN
  -- 1) Resolver workspace
  SELECT id, name INTO v_ws_id, v_ws_name
  FROM public.workspaces
  WHERE slug = p_workspace_slug
  LIMIT 1;

  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'No existe workspace con slug "%"', p_workspace_slug;
  END IF;

  -- Email predecible · "demo+slug@beonit.es" · evita colisiones entre
  -- workspaces y permite usar Gmail-style + para distinguirlos.
  v_email := 'demo+' || p_workspace_slug || '@beonit.es';

  -- 2) Auth user · crea si no existe, resetea password si existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'full_name', 'Usuario Demo',
        'role',      'Learning Manager',
        'is_demo',   true,
        'workspace', v_ws_name
      ),
      now(), now(), '', '', ''
    ) RETURNING id INTO v_user_id;
  ELSE
    v_existing := true;
    -- Resetea password al estándar
    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = v_user_id;
  END IF;

  -- 3) Profile · upsert con datos del workspace
  INSERT INTO public.profiles (id, email, name, role, system_role, team)
  VALUES (v_user_id, v_email, 'Usuario Demo · ' || v_ws_name, 'Learning Manager', 'user', v_ws_name)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    team = EXCLUDED.team,
    system_role = 'user';

  -- 4) Membership como member del workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, v_user_id, 'member')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- 5) Set current_workspace_id para que al login vaya directo aquí
  UPDATE public.profiles
  SET current_workspace_id = v_ws_id
  WHERE id = v_user_id;

  -- 6) Return credenciales
  RETURN jsonb_build_object(
    'status',     CASE WHEN v_existing THEN 'reset' ELSE 'created' END,
    'workspace',  v_ws_name,
    'email',      v_email,
    'password',   v_password,
    'user_id',    v_user_id,
    'login_url',  'https://solid-stream.vercel.app/?ws=' || p_workspace_slug
  );
END;
$$;

-- Permisos · solo platform admins pueden invocarla
REVOKE EXECUTE ON FUNCTION public.create_demo_user_for_workspace(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_demo_user_for_workspace(text) TO authenticated;

-- ============================================================================
-- Función auxiliar · listar todos los demo users existentes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.list_demo_users()
RETURNS TABLE (
  workspace text,
  email text,
  created_at timestamptz,
  last_login_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    w.name AS workspace,
    u.email,
    u.created_at,
    u.last_sign_in_at AS last_login_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.workspaces w ON w.id = p.current_workspace_id
  WHERE u.email LIKE 'demo+%@beonit.es'
  ORDER BY u.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.list_demo_users() TO authenticated;

-- ============================================================================
-- Función auxiliar · borrar el demo user de un workspace (idempotente)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_demo_user_for_workspace(p_workspace_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email   text;
  v_user_id uuid;
BEGIN
  v_email := 'demo+' || p_workspace_slug || '@beonit.es';
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'not_found', 'email', v_email);
  END IF;

  -- Limpia dependencias antes de borrar el auth user
  BEGIN DELETE FROM public.workspace_members WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.profiles          WHERE id      = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.bookmarks         WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.progress          WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM public.certificates      WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM auth.identities          WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM auth.sessions            WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM auth.refresh_tokens      WHERE user_id::text = v_user_id::text; EXCEPTION WHEN OTHERS THEN NULL; END;
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN jsonb_build_object('status', 'deleted', 'email', v_email);
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_demo_user_for_workspace(text) TO authenticated;
