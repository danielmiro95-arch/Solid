-- ============================================================
-- COX · FULL RESET · Jorge Martín · arregla "Database error querying schema"
-- ----------------------------------------------------------------
-- Estrategia · BORRAR todo lo del user y RECREAR con todos los
-- campos modernos de Supabase Auth (incluido is_sso_user,
-- is_anonymous, etc. que en schemas viejos podían faltar).
--
-- Idempotente · ejecutar varias veces no rompe nada.
-- ============================================================

DO $$
DECLARE
  v_email     text  := 'jmartin@grupocox.com';
  v_name      text  := 'Jorge Martín';
  v_pass      text  := 'Demo2026!';
  v_ws_id     uuid;
  v_user_id   uuid;
BEGIN
  SELECT id INTO v_ws_id FROM public.workspaces WHERE slug = 'cox';
  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'Workspace COX (slug=cox) no existe';
  END IF;

  -- 0. BORRAR cualquier rastro previo del user para empezar limpio
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    BEGIN DELETE FROM public.workspace_members WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM public.profiles          WHERE id      = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM public.bookmarks         WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM public.progress          WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM auth.identities          WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM auth.sessions            WHERE user_id = v_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN DELETE FROM auth.refresh_tokens      WHERE user_id::text = v_user_id::text; EXCEPTION WHEN OTHERS THEN NULL; END;
    DELETE FROM auth.users WHERE id = v_user_id;
    RAISE NOTICE 'BORRADO previo del user %', v_email;
  END IF;

  -- 1. auth.users con TODOS los campos modernos
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, invited_at,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin,
    created_at, updated_at,
    phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    banned_until, reauthentication_token, reauthentication_sent_at,
    is_sso_user, deleted_at, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    v_email, crypt(v_pass, gen_salt('bf')),
    now(), null,
    '', null,
    '', null,
    '', '', null,
    null,
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', v_name, 'name', v_name,
                       'role', 'Learning Manager', 'is_demo', true, 'workspace', 'COX'),
    false,
    now(), now(),
    null, null, '', '', null,
    '', 0,
    null, '', null,
    false, null, false
  );
  RAISE NOTICE 'auth.users CREADO · id=%', v_user_id;

  -- 2. auth.identities
  INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at, id
  ) VALUES (
    v_user_id::text, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email,
                       'email_verified', true, 'phone_verified', false),
    'email',
    now(), now(), now(), gen_random_uuid()
  );
  RAISE NOTICE 'auth.identities CREADA';

  -- 3. public.profiles (puede haberse autocreado por trigger · UPSERT)
  INSERT INTO public.profiles (id, email, name, role, system_role, team, current_workspace_id)
  VALUES (v_user_id, v_email, v_name, 'Learning Manager', 'user', 'COX', v_ws_id)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
    team = EXCLUDED.team, system_role = 'user',
    current_workspace_id = EXCLUDED.current_workspace_id;
  RAISE NOTICE 'public.profiles UPSERT OK';

  -- 4. workspace_members
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, v_user_id, 'member')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RAISE NOTICE 'workspace_members OK';

  RAISE NOTICE '=========================================';
  RAISE NOTICE 'LOGIN: % / %', v_email, v_pass;
  RAISE NOTICE '=========================================';
END $$;
