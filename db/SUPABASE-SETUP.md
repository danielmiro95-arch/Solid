# Setup · Supabase backend real

Esta guía activa el modo Supabase de SolidStream. Reemplaza el storage
local del navegador por un backend real con auth, multi-tenant, RLS y
realtime cross-device.

## 1. Crear proyecto Supabase

1. Ve a https://supabase.com → **New project**.
2. Elige región más cercana a tus usuarios (Europe West para Repsol).
3. Anota:
   - `SUPABASE_URL` (Settings → API → Project URL)
   - `SUPABASE_ANON_KEY` (Settings → API → anon public)

## 2. Aplicar schema

1. En el dashboard Supabase → **SQL Editor** → **New query**.
2. Copia/pega `db/schema.sql` completo.
3. Ejecuta. Crea todas las tablas, índices, RLS policies, trigger
   `handle_new_user` que autocrea profiles, y el bucket `pill-submissions`.

Verifica:
- **Database → Tables**: deberías ver `profiles`, `workspaces`,
  `workspace_members`, `bookmarks`, `ratings`, `progress`,
  `conversations`, `messages`, `user_channels`, `delivery_prefs`,
  `content_push`, `subscriptions`, `notification_rules`,
  `channel_notifs`, `inbox_messages`, `submissions`, `invitations`,
  `activity_log`, `test_sends`.
- **Storage → Buckets**: `pill-submissions` con MIME allowlist.
- **Database → Functions**: `handle_new_user`, `is_platform_admin`,
  `is_workspace_member`.

## 3. Variables de entorno

### Vercel (producción)

Project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://<TU_PROJECT>.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` (anon public) |
| `ANTHROPIC_API_KEY` | (para BeonAI con Claude) |

Aplica a `Production`, `Preview` y `Development`. Redeploy tras añadirlas.

### Local (dev)

Crea `.env.local` (no commitear):

```
SUPABASE_URL=https://<TU_PROJECT>.supabase.co
SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

## 4. Activar Auth providers

Supabase → **Authentication** → **Providers**:

- **Email**: Enabled (con confirmación si quieres) + dominios @repsol.com
  permitidos.
- **Azure AD** (SSO Microsoft) opcional: `Client ID`, `Client Secret` y
  `Tenant ID` desde Azure Portal → App registrations.

En **Email Templates** personaliza:
- Confirm signup → branding Repsol × BeonIt.
- Reset password.
- Magic link.

## 5. Verificación

1. Ve a la app deployada. Abre **DevTools → Console** y comprueba:
   ```js
   window.SGSON_BACKEND      // → 'supabase'
   window.supabaseClient     // → { auth: {...}, from: ƒ, ... }
   window.Auth.isAuthenticated() // → false al principio
   ```
2. Regístrate desde la pantalla de Login → el trigger `handle_new_user`
   debe crear automáticamente tu profile.
3. Ve a Supabase → **Authentication → Users** y verifica que apareces.
4. Abre **Database → profiles** y verifica que la fila tiene
   `system_role = 'admin'` (porque eres el primer user).

## 6. RLS · cómo funciona el scoping

Cada tabla con datos del usuario tiene policies que limitan acceso a:

- **Self**: `user_id = auth.uid()` → cada user solo ve los suyos.
- **Workspace member**: usa `public.is_workspace_member(workspace_id)` →
  miembros del workspace pueden leer/escribir datos del workspace según
  su rol.
- **Platform admin**: bypass total via `public.is_platform_admin()`.

Si quieres que un manager pueda ver KPIs de su equipo, ya está cubierto
via `is_workspace_member(workspace_id, 'admin')` en RLS.

## 7. Realtime · sync cross-device

Las siguientes tablas publican eventos:

- `inbox_messages` → notifs llegan en vivo a otras pestañas/dispositivos.
- `conversations` + `messages` → BeonAI chats sincronizados.
- `submissions` → admin ve nuevas entregas inmediatamente.
- `activity_log` → audit log live.

Para suscribirse en cliente:
```js
window.supabaseClient
  .channel('inbox-' + userId)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'inbox_messages', filter: `user_id=eq.${userId}` },
    payload => { /* refresh inbox */ })
  .subscribe();
```

## 8. Storage · pill-submissions

Bucket privado con allowlist `video/mp4|quicktime|webm` y 500 MB max.

Path convention: `<userId>/<pillId>/<timestamp>-<filename>`.

Ejemplo upload:
```js
const path = `${userId}/${pillId}/${Date.now()}-${file.name}`;
await window.supabaseClient.storage.from('pill-submissions')
  .upload(path, file, { contentType: file.type });
```

## 9. Migration · de demo localStorage a Supabase

La app actualmente funciona en modo **demo** (localStorage). Tras
configurar Supabase:

1. Mantén modo demo activo unos días en paralelo para verificar.
2. Usa el endpoint `/api/admin/export-localstorage` (TODO) para
   exportar el storage del browser de cada user y bulk-insertarlo en
   Supabase. Alternativamente, los usuarios re-crean sus bookmarks/
   preferencias desde cero (no hay tantos datos críticos).
3. Cuando `SUPABASE_URL` está set, la app entra en modo Supabase
   automáticamente (`window.SGSON_BACKEND === 'supabase'`).

## 10. Checklist final

- [ ] Schema aplicado sin errores.
- [ ] 19 tablas creadas + bucket storage.
- [ ] RLS enabled en todas las tablas (Database → Tables → RLS).
- [ ] Trigger `on_auth_user_created` activo.
- [ ] Auth providers configurados (Email + opcional Azure).
- [ ] `SUPABASE_URL` y `SUPABASE_ANON_KEY` en Vercel.
- [ ] Redeploy realizado.
- [ ] Test signup en producción → profile autocreado.
- [ ] Test RLS: user A no puede leer datos de user B.

---

**Troubleshooting**:

- "RLS prevents insert" → comprueba que el user está autenticado
  (`auth.uid()` no es null) y que pertenece al workspace correcto.
- "Storage upload fails" → revisa que el path empieza por `<auth.uid()>`.
- "Realtime no actualiza" → verifica que la tabla está en
  `supabase_realtime` publication.
