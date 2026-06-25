-- ============================================================
-- COX · FIX · "Database error querying schema" al hacer login
-- ----------------------------------------------------------------
-- Causa · Supabase Auth requiere una fila en auth.identities por
-- cada user · sin ella · el endpoint /token (login) lanza
-- "Database error querying schema". El SQL anterior insertaba en
-- auth.users pero NO en auth.identities · por eso fallaba el login.
--
-- Este script:
--   1. Crea la identity faltante (provider 'email')
--   2. Verifica que el user existe en auth.users + profiles + members
--   3. RAISE NOTICE con resumen para confirmar todo OK
--
-- Idempotente · si la identity ya existe no la duplica.
-- ============================================================

DO $$
DECLARE
  v_email     text := 'jmartin@grupocox.com';
  v_user_id   uuid;
  v_existing  boolean;
BEGIN
  -- 1. Resolver user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % no existe · ejecuta antes cox-create-jorge-martin.sql', v_email;
  END IF;

  -- 2. auth.identities · INSERT si falta
  SELECT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = v_user_id AND provider = 'email'
  ) INTO v_existing;

  IF NOT v_existing THEN
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      created_at, last_sign_in_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email,
                         'email_verified', true, 'phone_verified', false),
      'email',
      v_user_id::text,
      now(), now(), now()
    );
    RAISE NOTICE 'auth.identities CREADA para % (user_id %)', v_email, v_user_id;
  ELSE
    RAISE NOTICE 'auth.identities YA EXISTÍA para % (user_id %)', v_email, v_user_id;
  END IF;

  -- 3. Verificación de todas las dependencias
  RAISE NOTICE 'auth.users: %', (SELECT COUNT(*) FROM auth.users WHERE id = v_user_id);
  RAISE NOTICE 'auth.identities: %', (SELECT COUNT(*) FROM auth.identities WHERE user_id = v_user_id);
  RAISE NOTICE 'public.profiles: %', (SELECT COUNT(*) FROM public.profiles WHERE id = v_user_id);
  RAISE NOTICE 'workspace_members: %', (SELECT COUNT(*) FROM public.workspace_members WHERE user_id = v_user_id);
END $$;

-- Login debería funcionar ya con:
--   email: jmartin@grupocox.com
--   password: Demo2026!
