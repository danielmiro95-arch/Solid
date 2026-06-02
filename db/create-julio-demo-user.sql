-- ============================================================================
-- Crear usuario Julio Turbón de Cabo para la demo
-- ============================================================================
-- Pegar entero en Supabase SQL Editor (NO requiere acceso al dashboard de Auth)
-- Crea: auth.users + public.profiles + workspace_members en HdR Demo
-- ============================================================================

DO $$
DECLARE
  julio_uid uuid;
  demo_ws uuid;
  julio_email text := 'julio.turbon@hijosderivera.com';
  julio_pwd text := 'JulioDemo2026!';
BEGIN
  -- 1. Crear usuario en auth.users (con password encriptada)
  SELECT id INTO julio_uid FROM auth.users WHERE email = julio_email LIMIT 1;
  IF julio_uid IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token, email_change_token_new
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      julio_email, crypt(julio_pwd, gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('full_name','Julio Turbón de Cabo','role','Learning Manager'),
      now(), now(), '', '', ''
    ) RETURNING id INTO julio_uid;
    RAISE NOTICE 'Usuario Julio creado · id %', julio_uid;
  ELSE
    -- Si ya existe, actualizar password y confirmar email
    UPDATE auth.users
    SET encrypted_password = crypt(julio_pwd, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
          || jsonb_build_object('full_name','Julio Turbón de Cabo','role','Learning Manager')
    WHERE id = julio_uid;
    RAISE NOTICE 'Usuario Julio ya existía · password reseteado · id %', julio_uid;
  END IF;

  -- 2. Crear/actualizar profile (columna se llama `name`, no `full_name`)
  INSERT INTO public.profiles (id, email, name, role, system_role, team)
  VALUES (julio_uid, julio_email, 'Julio Turbón de Cabo', 'Learning Manager', 'user', 'Hijos de Rivera Demo')
  ON CONFLICT (id) DO UPDATE SET
    name = 'Julio Turbón de Cabo',
    role = 'Learning Manager',
    team = 'Hijos de Rivera Demo';

  -- 3. Buscar el workspace demo
  SELECT id INTO demo_ws FROM public.workspaces WHERE slug = 'hijos-de-rivera-demo' LIMIT 1;
  IF demo_ws IS NULL THEN
    RAISE EXCEPTION 'No existe workspace "hijos-de-rivera-demo" · ejecuta primero db/seed-hijos-de-rivera-demo.sql';
  END IF;

  -- 4. Añadir Julio como member del workspace demo
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (demo_ws, julio_uid, 'member')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RAISE NOTICE '════════════════════════════════════════════════════════';
  RAISE NOTICE 'JULIO TURBÓN DE CABO listo para la demo';
  RAISE NOTICE 'Email · %', julio_email;
  RAISE NOTICE 'Pwd   · %', julio_pwd;
  RAISE NOTICE 'WS    · Hijos de Rivera Demo';
  RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

-- Verificación
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_ok,
  p.name AS profile_name,
  p.role AS profile_role,
  w.name AS workspace,
  m.role AS workspace_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.workspace_members m ON m.user_id = u.id
LEFT JOIN public.workspaces w ON w.id = m.workspace_id
WHERE u.email = 'julio.turbon@hijosderivera.com';
