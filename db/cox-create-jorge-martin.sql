-- ============================================================
-- COX · crear usuario demo Jorge Martín (jmartin@grupocox.com)
-- ----------------------------------------------------------------
-- Crea (o resetea password de) el usuario:
--   · email     · jmartin@grupocox.com
--   · password  · Demo2026!   (estándar de los demo users · cambialo
--                              si quieres otro · ej crypt('OtraPass!', gen_salt('bf')))
--   · name      · Jorge Martín
--   · role      · Learning Manager
--   · team      · COX
--   · workspace · COX (member · current_workspace_id seteado)
--
-- Idempotente · re-ejecutable · solo resetea password si ya existía.
-- ============================================================

DO $$
DECLARE
  v_email    text := 'jmartin@grupocox.com';
  v_name     text := 'Jorge Martín';
  v_pass     text := 'Demo2026!';
  v_ws_id    uuid;
  v_user_id  uuid;
  v_existing boolean := false;
BEGIN
  SELECT id INTO v_ws_id FROM public.workspaces WHERE slug = 'cox';
  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX (slug=cox) no existe';
  END IF;

  -- 1. auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      v_email, crypt(v_pass, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', v_name, 'role', 'Learning Manager',
                         'is_demo', true, 'workspace', 'COX'),
      now(), now(), '', '', ''
    ) RETURNING id INTO v_user_id;
  ELSE
    v_existing := true;
    UPDATE auth.users
       SET encrypted_password = crypt(v_pass, gen_salt('bf')),
           email_confirmed_at = COALESCE(email_confirmed_at, now())
     WHERE id = v_user_id;
  END IF;

  -- 1b. auth.identities · OBLIGATORIO para que /token (login) no
  -- devuelva "Database error querying schema". Supabase Auth requiere
  -- una identity por provider · sin ella el lookup del email falla.
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    created_at, last_sign_in_at, updated_at
  )
  SELECT
    gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email,
                       'email_verified', true, 'phone_verified', false),
    'email', v_user_id::text,
    now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email'
  );

  -- 2. public.profiles
  INSERT INTO public.profiles (id, email, name, role, system_role, team, current_workspace_id)
  VALUES (v_user_id, v_email, v_name, 'Learning Manager', 'user', 'COX', v_ws_id)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    team = EXCLUDED.team,
    system_role = 'user',
    current_workspace_id = EXCLUDED.current_workspace_id;

  -- 3. workspace_members · member del workspace COX
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, v_user_id, 'member')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RAISE NOTICE 'Usuario % · % · workspace COX · password: %',
    CASE WHEN v_existing THEN 'RESETEADO' ELSE 'CREADO' END,
    v_email, v_pass;
  RAISE NOTICE 'user_id: % · workspace_id: %', v_user_id, v_ws_id;
END $$;

-- Verificar:
-- SELECT u.email, p.name, p.role, p.team, m.role AS workspace_role
-- FROM auth.users u
-- JOIN public.profiles p ON p.id = u.id
-- LEFT JOIN public.workspace_members m ON m.user_id = u.id
-- WHERE u.email = 'jmartin@grupocox.com';
