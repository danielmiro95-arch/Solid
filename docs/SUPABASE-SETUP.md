# Activar Supabase · Phase 2 backend real

Hasta ahora SGS|on funciona en **modo demo client-side**: todos los datos viven
en localStorage del navegador. Útil para mostrar a Repsol y validar el producto,
pero no escala (cada navegador es un universo aislado).

Esta guía activa el backend real con **Supabase**: auth con password,
sincronización entre dispositivos, vídeos a storage real, datos persistentes
y compartidos entre usuarios.

## Resumen

1. Crear proyecto Supabase
2. Pegar `db/schema.sql` en SQL Editor
3. Configurar 2 env vars en Vercel
4. Redeploy
5. La app detecta Supabase automáticamente y empieza a usarlo

---

## 1. Crear proyecto Supabase (2 min)

1. Vete a <https://supabase.com> → "Start your project" → login con GitHub o email
2. **New project** → Organization "BeonIt" (o crear una) → nombre `sgs-on` → región `Frankfurt (eu-central-1)` (más cerca de España) → password fuerte para la DB
3. Espera ~1 min a que se aprovisione

## 2. Pegar el schema (1 min)

1. En el proyecto Supabase → menú izquierdo **SQL Editor**
2. **New query**
3. Abre el archivo `db/schema.sql` de este repo, copia TODO el contenido, pégalo
4. **Run** (botón verde abajo a la derecha)
5. Deberías ver "Success. No rows returned" y todas las tablas creadas

Verifica en menú izquierdo → **Table Editor**: deberías ver `profiles`,
`bookmarks`, `conversations`, `messages`, `progress`, `submissions`,
`inbox_messages`, `inbox_notifications`, `releases`, `route_exams`.

## 3. Activar email auth (30 s)

1. **Authentication → Providers**
2. **Email** está activado por defecto. Para demo, **desactiva "Confirm email"**
   (sino los usuarios necesitan abrir un link en su email para activarse).
   En producción real para Repsol, lo dejas activado.

Opcional: añadir Azure AD / Microsoft como SSO si Repsol lo pide. Está en la
misma pantalla.

## 4. Coger las credenciales (30 s)

1. Menú izquierdo → **Project Settings** (engranaje abajo) → **API**
2. Copia **Project URL** (algo como `https://abcdefgh.supabase.co`)
3. Copia **anon · public key** (la de abajo, no la `service_role`)

## 5. Configurar Vercel (1 min)

En el proyecto Vercel `solid` o `solid-platform`:

1. **Settings → Environment Variables**
2. Añade dos variables (las dos en **Production**, **Preview** y **Development**):

| Name | Value |
|---|---|
| `SUPABASE_URL` | tu Project URL |
| `SUPABASE_ANON_KEY` | tu anon key |

3. **Settings → Deployments → Redeploy** el último deploy

## 6. Listo

Tras el redeploy:

- La app detecta `SUPABASE_URL` y `SUPABASE_ANON_KEY` (inyectadas a `window` desde
  el HTML al arrancar) y activa el adapter Supabase
- El login deja de ser "demo sin password" → pide password real
- Los usuarios se crean en `auth.users` y un trigger les genera su `profiles` row
- Los datos (bookmarks, chats, progreso, entregas) viajan a la DB
- Los vídeos suben al bucket `submissions`
- Cualquier usuario que entre desde otro dispositivo ve sus datos sincronizados

## Troubleshooting

- **"Invalid email or password" al hacer signup nuevo**: probablemente "Confirm
  email" sigue activado. Authentication → Providers → Email → off
- **Quiero hacer admin a un usuario manualmente**: SQL Editor →
  `update profiles set is_admin = true where email = 'juan@beonit.com';`
- **Los vídeos no suben**: revisa que el bucket `submissions` exista en Storage
  (lo crea el schema, pero a veces hay que hacerlo manualmente en UI)
- **Quiero borrar todo y empezar de cero**: SQL Editor →
  `truncate profiles cascade; delete from auth.users;` (cuidado, irreversible)

## Coste

- Free tier de Supabase: hasta **50 000 usuarios activos al mes** + 500 MB DB +
  1 GB storage. Suficiente para piloto Repsol (200 personas)
- Para escalar a varios clientes: Pro $25/mes (8 GB DB + 100 GB storage)
- Vídeos de entregas pueden ocupar mucho. Para Repsol asumimos máx 200 MB por
  entrega · 200 personas · 41 modulos = potencial de ~1.6 TB. Se plantea
  mover storage a S3 directo o Vercel Blob para abaratar
