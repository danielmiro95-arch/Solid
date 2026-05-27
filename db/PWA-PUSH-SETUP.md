# Setup · PWA + Web Push notifications

Esta guía activa las notificaciones push nativas (Android Chrome, iOS Safari 16.4+, desktop Chrome/Firefox/Edge). Funciona en cualquier dispositivo donde el user instale la PWA o tenga la web abierta en background.

## 1. Generar VAPID keys

Las VAPID keys son un par pública/privada que firma las suscripciones push para garantizar autenticidad. **Solo necesitas generarlas una vez** y guardarlas como env vars.

```bash
npx web-push generate-vapid-keys
```

Salida:
```
Public Key:  BCdef...XYZ
Private Key: AbCd...123
```

## 2. Configurar env vars en Vercel

Project → **Settings** → **Environment Variables**:

| Key | Value | Visibilidad |
|-----|-------|-------------|
| `VAPID_PUBLIC_KEY`  | `BCdef...XYZ` | Expuesto al cliente (público por diseño) |
| `VAPID_PRIVATE_KEY` | `AbCd...123`  | **NUNCA al cliente** · solo server-side |
| `VAPID_SUBJECT`     | `mailto:contact@beonit.com` | Identifica al sender |

Aplica a `Production`, `Preview` y `Development`. Redeploy.

## 3. Aplicar schema (si no lo hiciste)

`db/schema.sql` incluye la tabla `push_subscriptions` (sección 18b). Si ya aplicaste el schema antes de este PR, ejecuta solo esta sección extra en SQL Editor:

```sql
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  keys jsonb not null,
  user_agent text,
  active boolean default true,
  created_at timestamptz default now(),
  last_used_at timestamptz
);
create index if not exists push_subs_user_idx on public.push_subscriptions(user_id, active);
alter table public.push_subscriptions enable row level security;
create policy push_subs_self on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## 4. Verificar

1. **Frontend**: abre devtools console → `window.VAPID_PUBLIC_KEY` debe estar definido.
2. **Backend**: `curl https://tu-app.vercel.app/api/push-send -X POST -d '{}'` debe devolver `{"error":"missing-subscription"}` (no `no-vapid-keys`).

## 5. Flujo del usuario

1. User entra a **Ajustes** → **Notificaciones push** → toggle "🔔 Activar push".
2. Browser muestra prompt de permiso. User acepta.
3. `PushManager.subscribe()` con la VAPID public key.
4. Subscription se persiste en `push_subscriptions` (Supabase) o localStorage (demo).
5. Cuando el servidor quiere enviar push, recupera la subscription y llama `/api/push-send` con ella + payload.
6. El SW del navegador del user recibe el evento `push` → muestra `showNotification()`.
7. Si user clica la notif, `notificationclick` abre la URL en la PWA.

## 6. Enviar push desde el backend (server-side)

Ejemplo Node:
```js
import webpush from 'web-push';
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subs = await supabase.from('push_subscriptions')
  .select('endpoint, keys').eq('user_id', userId).eq('active', true);

for (const s of subs.data) {
  try {
    await webpush.sendNotification(
      { endpoint: s.endpoint, keys: s.keys },
      JSON.stringify({ title: 'Nueva pill', body: '...', url: '/?view=path' })
    );
  } catch (err) {
    if (err.statusCode === 410) {
      // Subscription expirada → marcar como inactive
      await supabase.from('push_subscriptions').update({ active: false }).eq('endpoint', s.endpoint);
    }
  }
}
```

## 7. PWA · install prompt

La app es PWA completa con `manifest.json`. Para instalarse:

- **Android Chrome**: aparece banner "Instalar app" automáticamente. También capturamos `beforeinstallprompt` para mostrar un CTA en Settings.
- **iOS Safari**: user debe usar "Compartir → Añadir a pantalla de inicio". No hay prompt programático.
- **Desktop Chrome/Edge**: icono ⊕ en la barra de URL.

Estado se detecta con:
```js
window.matchMedia('(display-mode: standalone)').matches
```

## 8. Checklist final

- [ ] VAPID keys generadas
- [ ] `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` en Vercel
- [ ] Schema `push_subscriptions` aplicado
- [ ] Redeploy
- [ ] User activa push en Ajustes → permiso concedido → fila en `push_subscriptions`
- [ ] Test desde Ajustes → "Test local" muestra notif inmediata
- [ ] Test desde Ajustes → "Test desde servidor" funciona si el backend está OK
- [ ] Cuando user borra permisos del browser, la sub queda obsoleta (410 al enviar) y se marca inactive

---

**Troubleshooting**:

- "Push solo funciona local" → falta `VAPID_PUBLIC_KEY` o `VAPID_PRIVATE_KEY`.
- "iOS no recibe push" → user debe instalar la PWA primero (Add to Home Screen). iOS solo permite push en PWA instalada.
- "Notif aparece dos veces" → SW antiguo cacheado · bump versión `VERSION` en `service-worker.js` y redeploy.
