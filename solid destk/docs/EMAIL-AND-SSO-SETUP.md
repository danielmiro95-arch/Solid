# Email transaccional + SSO Azure AD · setup

Esta guía cubre los dos requisitos enterprise del Piloto B:
1. **Email transaccional** para que las invitaciones lleguen automáticamente
2. **SSO Azure AD** para que los empleados Repsol entren con su cuenta corporativa (sin password nuevo)

Ambas son opcionales: si no las activas, la app sigue funcionando — las
invitaciones se reparten manualmente copiando links, y el login pide
email + password.

---

## A · Email transaccional con Resend (5 min)

[Resend](https://resend.com) es el proveedor más simple para email
transaccional. Free tier: **3000 emails / mes** (suficiente para piloto).

### A.1 · Crear cuenta y API key

1. <https://resend.com> → Sign up con GitHub o email
2. Onboarding → "Get API key" → copia la `re_xxx`
3. Para piloto puedes usar el dominio compartido `onboarding@resend.dev`
   sin verificar nada (limitación: solo se puede mandar a tu propio email
   verificado en Resend hasta que verifiques un dominio propio)
4. Para producción real con dominio Repsol/BeonIt:
   - Resend → **Domains** → Add domain → `beonit.com` (o subdominio)
   - Copia los 3 registros DNS (SPF, DKIM, DMARC) y los pega en
     Cloudflare/registrar
   - Espera ~10 min a que se verifique

### A.2 · Configurar Vercel

En el proyecto Vercel, **Settings → Environment Variables**, añade:

| Name | Value | Ejemplo |
|---|---|---|
| `RESEND_API_KEY` | tu API key de Resend | `re_3xK9Lp...` |
| `RESEND_FROM_EMAIL` | el "from" verificado | `SGS\|on <noreply@beonit.com>` |
| `RESEND_FROM_FALLBACK` | si no tienes dominio propio | `onboarding@resend.dev` |
| `PUBLIC_BASE_URL` | dominio público | `https://solid.vercel.app` |

Redeploy.

### A.3 · Cómo se usa

En el panel admin, cuando creas una invitación, junto al "Copiar link"
aparece un botón **"✉ Enviar email"** que hace POST a `/api/send-invite`
con el token. Resend manda un HTML brandeado con un CTA que abre
`/?invite=<token>` en el navegador.

Si `RESEND_API_KEY` no está, el endpoint devuelve 503 con instrucciones
y el frontend cae a "modo demo" (copy-paste del link).

---

## B · SSO Azure AD · login corporativo (15 min · requiere admin AD)

Para que los 200 empleados Repsol entren con `juan.perez@repsol.com`
y su password corporativo (sin crear uno nuevo).

### B.1 · Registrar app en Azure

> **Necesitas a alguien con permisos de admin en el tenant de Repsol**.
> Si no, sáltate este paso o pide que IT lo haga.

1. <https://portal.azure.com> → Microsoft Entra ID (antes Azure AD)
2. **App registrations** → New registration
3. Nombre: `SGS|on · Plataforma de formación`
4. Supported account types: "Accounts in this organizational directory only"
5. Redirect URI: **Web** → `https://<TU_PROJECT>.supabase.co/auth/v1/callback`
6. Register

Tras crear:
- Copia **Application (client) ID**
- Copia **Directory (tenant) ID**
- Sección **Certificates & secrets** → New client secret → copia el `value`

### B.2 · Configurar Supabase

> Solo aplica si has activado Supabase como backend (ver
> `docs/SUPABASE-SETUP.md` primero).

1. Supabase project → **Authentication → Providers**
2. Encuentra **Azure (Microsoft)** → habilítalo
3. Pega:
   - **Client ID** = el Application ID de Azure
   - **Client Secret** = el secret value
   - **Microsoft Tenant URL** = `https://login.microsoftonline.com/<TENANT_ID>/v2.0`
4. Save

### B.3 · Frontend

El LoginScreen detecta si SSO está disponible (preguntando a Supabase) y
muestra un botón **"Continuar con Microsoft"** además del email/password.

Lo que pasa al hacer click:
1. Redirect a login.microsoftonline.com con SSO de Repsol
2. Usuario se autentica con sus credenciales corporativas
3. Microsoft redirige de vuelta con un token
4. Supabase crea la fila en `auth.users` (si no existe)
5. El trigger `handle_new_user` crea su `profiles` row con email,
   nombre y rol por defecto
6. Si tienes una invitación pendiente con ese email → marca como aceptada

### B.4 · Auto-aprovisionamiento

Para que cualquier empleado con `@repsol.com` pueda entrar sin
invitación previa, dejas SSO abierto. Los que no quieras que entren
tendrías que filtrarlos en Azure AD a nivel de "App permissions".

Si prefieres SSO **solo para invitados** (los 20 del piloto):
- Mantén las invitaciones obligatorias (cada usuario solo entra si
  tiene token válido)
- El SSO solo "rellena el password", el flujo de signup es el mismo

---

## Coste

- **Resend**: free 3000 emails/mes · Pro $20/mes para 50K
- **Azure AD**: incluido en cualquier subscripción Microsoft 365 de
  Repsol — sin coste adicional
- **Supabase**: ya cubierto en su free tier

Total para piloto de 20 personas: **0 €**
Total para producción 200 personas: ~$25-50 €/mes (Supabase Pro + Resend si superas el free tier)
