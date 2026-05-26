# Solid · SGS|on

Plataforma SaaS B2B de formación corporativa para **BeonIt × Repsol** (formación Sprinklr).
Visión producto: *"Netflix corporativo con IA integrada"* — AI-powered Learning Experience Platform.

> Estado actual: **prototipo funcional + capa SaaS parcial**. Mezcla demo client-side y backend Supabase. Pendiente de migración a stack moderno (ver [Roadmap](#roadmap)).

---

## Tech stack actual (sin maquillar)

| Capa | Tecnología | Madurez |
|---|---|---|
| Frontend | React 18 vía CDN UMD · Babel-standalone en navegador | 🟡 Prototipo |
| Estilo | CSS vanilla (`styles.css`, `prototype.css`) + tokens design system | 🟡 Funcional |
| Bundling | Ninguno · scripts `<script type="text/babel">` inline | 🔴 No prod |
| Tipos | Sin TypeScript | 🔴 Deuda |
| Auth | Supabase Auth (real) + fake demo en `localStorage` | 🟡 Mezcla |
| Datos | Supabase Postgres + RLS (real) + `localStorage` (demo) | 🟡 Mezcla |
| API serverless | Vercel Functions (`/api/*`) | 🟡 Sin auth user-level |
| IA | Anthropic Claude API vía `/api/chat` | 🟡 Sin rate limit / costes |
| Video | YouTube embed público (3 pills) + cubiertas estáticas | 🟢 Demo OK |
| PWA | Service worker offline-first + manifest | 🟢 OK |
| Push | Web Push (estructura preparada, sin VAPID activo) | 🟡 Stub |

---

## Estructura del repositorio

```
/
├── api/                      # Vercel Serverless Functions
│   ├── chat.js               # MENTOR-IA (Anthropic Claude) · ⚠ sin auth user-level
│   ├── config.js             # Bootstrap Supabase config
│   ├── send-invite.js        # Email invite (Resend) · ⚠ sin validación de rol
│   └── kb/sprinklr-repsol.md # Knowledge base para Claude
├── db/
│   └── schema.sql            # Esquema Postgres + RLS + Realtime
├── docs/                     # ★ FRONTEND ACTIVO (lo que Vercel sirve)
│   ├── index.html            # Boot · carga React/Babel/Supabase desde CDN
│   ├── styles.css            # Design tokens + dark theme
│   ├── prototype.css         # ~3000 líneas, layout app
│   ├── components.jsx        # Card, Icon, primitives
│   ├── prototype-home.jsx    # Home Netflix-style + Sidebar + PILLS data
│   ├── prototype-views.jsx   # Detail, Player, Coach, Path, Rutas, Channels, Dashboard
│   ├── prototype-main.jsx    # App router, Auth, Bookmarks, Inbox, Settings
│   ├── mentor-ia.jsx         # Coach component (full MENTOR-IA chat)
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # PWA SW (cache-first shell, network-first /api/)
│   ├── *.png                 # Logos (sgs-on, mentor-ia, beonit)
│   ├── SUPABASE-SETUP.md
│   └── EMAIL-AND-SSO-SETUP.md
├── solid destk/              # ⚠ Workaround Vercel (ver "Workarounds" abajo)
├── vercel.json               # outputDirectory: "docs"
├── .env.example
├── MENTOR-IA-SETUP.md
└── README.md                 # (este archivo)
```

---

## Cómo se despliega

### Producción
- **Vercel** (proyecto `solid-platform`)
  - Conectado a GitHub `danielmiro95-arch/Solid`, rama `main`
  - `vercel.json` raíz · `outputDirectory: "docs"` · `framework: null`
  - Cada merge a `main` dispara Production Deploy automático
  - Variables de entorno: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY` (todas en Vercel → Settings → Env Vars)

### Branch de desarrollo
- `claude/continue-vercel-setup-Sjuqc` — Vercel hace Preview Deploy automático en cada push
- Para producción: merge a `main` (vía PR)

### Local (sin build)
```bash
# Servidor estático cualquiera apuntando a /docs
cd docs && python3 -m http.server 8000
# Abrir http://localhost:8000
```
> ⚠ Sin `npm install` ni build. Todo React + Babel compila en el navegador. **No es producción real.**

---

## Demo vs Producción · dónde vive cada lado

| Componente | Demo (localStorage) | Producción (Supabase) | Selector |
|---|---|---|---|
| Auth | `Auth.demoLogin()` | Supabase Auth + magic links | `window.SGSON_BACKEND === 'supabase'` (auto-detectado vía `/api/config`) |
| Usuarios | `_userScopedKey('solid-user')` | tabla `profiles` + RLS | `window.SGSON_BACKEND` |
| Bookmarks | `solid-bookmarks` localStorage | tabla `bookmarks` | Idem |
| Progreso pills | `solid-completed` | tabla `progress` | Idem |
| Conversaciones IA | `ChatHistory` localStorage | tabla `conversations` + `messages` | Idem |
| Inbox | `Inbox` localStorage | tabla `inbox_messages` + realtime | Idem |
| Settings | `Settings` localStorage | tabla `profiles.settings` JSONB | Idem |
| Activity / audit | `Activity` localStorage | tabla `events` + realtime | Idem |
| Submissions vídeo | `Submissions` localStorage | tabla `submissions` + Storage bucket | Idem |
| Invitations | `Invitations` localStorage | tabla `route_exams` (parcial) | Idem |

**Detección de modo**: `/api/config` lee `SUPABASE_URL` + `SUPABASE_ANON_KEY` de env vars. Si existen, frontend bootea `SGSON_BACKEND = 'supabase'`. Si no, fallback `'demo'`.

---

## Variables de entorno (Vercel)

```bash
# IA
ANTHROPIC_API_KEY=sk-ant-...           # Claude API (MENTOR-IA)

# Supabase (opcional — sin esto, modo demo)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJh...

# Email (opcional — sin esto, /api/send-invite responde 503)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="SGS|on <noreply@beonit.com>"

# URL pública (opcional — usado por send-invite)
PUBLIC_BASE_URL=https://solid-platform.vercel.app
```

Ver `.env.example` para template.

---

## Workarounds activos

### `solid destk/` — copia duplicada del proyecto
**Por qué existe**: el dashboard de Vercel tuvo `solid destk` configurado como Root Directory en algún momento. Al limpiar esa carpeta el deploy fallaba con `Root Directory "solid destk" does not exist`.

**Estado actual**: conservada por seguridad hasta confirmar en Vercel dashboard que Root Directory está vacío o apunta a `/`. Mientras existe, **hay que sincronizar cambios manualmente** entre `/docs/*` y `solid destk/docs/*` o el preview podría servir versión antigua.

**Cómo eliminar el workaround**:
1. Vercel.com → Project settings → General → Root Directory → vaciar o `./`
2. `rm -rf "solid destk"` + commit
3. Quitar este apartado del README

---

## Riesgos pendientes

| ID | Riesgo | Severidad | Plan |
|---|---|---|---|
| R1 | Duplicación `solid destk/` con `/docs/`, `/api/`, `/db/` | 🔴 Alta | Eliminar tras limpiar Vercel dashboard |
| R2 | Babel-runtime en navegador + ~6.000 líneas JSX recompiladas en cada carga | 🔴 Alta | Migrar a Next.js (Fase 2) |
| R3 | Sin TypeScript → cambios pueden romper silenciosamente | 🟡 Media | Migración Fase 2 |
| R4 | `/api/chat` y `/api/send-invite` sin auth user-level (solo CORS abierto + env API key) | 🟡 Media | Fase 3: validar sesión Supabase server-side |
| R5 | Mezcla mock + Supabase en mismo código frontend (confuso para mantenimiento) | 🟡 Media | Fase 2: separar via feature flag explícito + módulos `/services/` |
| R6 | Sin rate limit ni tracking de coste IA | 🟡 Media | Fase 3: middleware en `/api/chat` |
| R7 | Web Push estructurado pero sin VAPID configurado | 🟢 Baja | Fase 4 |
| R8 | Sin tests automáticos | 🟡 Media | Fase 2: añadir Playwright en migración |

---

## Roadmap

### ✅ Fase 0 — Demo visual (completada)
Prototipo Netflix-style con 41 Think Pills mock, MENTOR-IA chat, dashboards, rutas.

### 🟡 Fase 1 — Estabilización (en curso)
- [x] Auditoría duplicados (`solid destk/`)
- [x] Eliminar `_incoming.zip` del repo
- [x] Documentar estado real (este README)
- [x] Confirmar Vercel output (`/docs`)
- [ ] Eliminar `solid destk/` (pendiente limpiar Vercel dashboard)
- [ ] Separar demo/prod via feature flag claro
- [ ] Logs server-side básicos en `/api/*`

### 🔵 Fase 2 — Migración frontend a Next.js (próxima)
**Sin big-bang**. Estrategia incremental coexistencia:

#### Paso 2.1 · Scaffold `/app-next/` (1 día)
- `cd /` → `npx create-next-app@latest app-next --typescript --tailwind --app --no-src-dir`
- Configurar para servir desde subpath `/app-next` o subdominio `next.solid.beonit.com`
- Pipeline CI: build + lint + type-check
- Deploy preview en Vercel apart del actual
- **El actual `/docs` sigue sirviendo en producción**. No hay risk.

#### Paso 2.2 · Mover design system (2-3 días)
- Tokens CSS de `styles.css` → Tailwind config + CSS custom properties
- `shadcn/ui` instalado: Button, Card, Dialog, Sheet, Tabs, Toast, Progress, Avatar
- Storybook opcional para verificar componentes uno a uno

#### Paso 2.3 · Migrar primitives + data (1-2 días)
- `components/Card.tsx` (TypeScript) match visual con actual `Card` JSX
- `data/pills.ts` con tipos `Pill`, `Path`, `Series` (extraído de `PILLS` actual)
- Tests visuales: snapshot del Card antiguo vs nuevo

#### Paso 2.4 · Migrar páginas (3-5 días)
- `/login` → `app/login/page.tsx` con Supabase SSR (`@supabase/ssr`)
- `/` (home Netflix) → `app/page.tsx`
- `/detail/[id]` → `app/detail/[id]/page.tsx`
- `/analytics` → `app/analytics/page.tsx`
- `/coach` → `app/coach/page.tsx`
- A medida que se migra cada ruta, el `/docs/` antiguo redirige al `/app-next/` correspondiente

#### Paso 2.5 · Backend en server actions (2-3 días)
- Bookmarks, Settings, Progress → server actions con Supabase admin client
- `/api/chat` y `/api/send-invite` → Route handlers Next.js con auth middleware (`createServerClient` + `getUser()`)

#### Paso 2.6 · Cut-over (1 día)
- Vercel: cambiar `outputDirectory` a la build Next.js
- Borrar `/docs/`, `solid destk/`, `prototype-*.jsx`
- Retirar Babel runtime
- Verificar todos los flujos

**Total estimado**: ~2-3 semanas a tiempo parcial. Cero downtime durante la migración.

### 🟢 Fase 3 — SaaS mínimo vendible (post-migración)
- Auth obligatoria en todas las rutas (`middleware.ts`)
- RBAC admin/user/viewer en server
- Validación payload con `zod` en cada endpoint
- Rate limit `/api/chat` (Upstash Redis o Vercel KV)
- Tracking de uso IA por usuario (tabla `ai_usage`)
- Email transaccional para invites + reset password
- Onboarding corporativo bulk (CSV → invitations + tabla `companies`)

### 🚀 Fase 4 — Escalado producto
- Multi-tenant (tabla `tenants`, RLS por tenant_id)
- Billing (Stripe Subscriptions)
- Analytics avanzados (Mixpanel o PostHog)
- Integraciones Teams (bot Microsoft Graph) + WhatsApp (BSP)
- Observabilidad (Sentry + Vercel Analytics)
- Auditoría enterprise (tabla `audit_log` ya existe como `events`, ampliar)

---

## Convenciones (mientras estabilizamos)

- **No editar `solid destk/` directamente**. Si cambias algo en `/docs/`, debe sincronizarse o se pierde en deploy.
- **Cache busting**: bumpear letra al final de la versión en `index.html` (línea 26 `var V = '20260427XX'`) + `service-worker.js` VERSION + todos los `?v=` en imports.
- **Verificar JSX antes de commit**: `npx @babel/parser` o el script en commits anteriores.
- **No `--no-verify` en git commit** salvo emergencia justificada.
- **Cada PR debe**: parsear sin error, tener test plan en descripción, mantener compatibilidad con localStorage existente.

---

## Setup notes históricos

- `MENTOR-IA-SETUP.md` · cómo configurar Anthropic key en Vercel
- `docs/SUPABASE-SETUP.md` · setup tablas + RLS + storage bucket
- `docs/EMAIL-AND-SSO-SETUP.md` · Resend + Azure AD SSO (parcial)
- `db/schema.sql` · esquema completo Postgres aplicable con `psql -f`

---

## Contacto

Daniel Miro · `daamiro@beonit.es`
Repositorio: `https://github.com/danielmiro95-arch/Solid`
Producción: `https://solid-platform.vercel.app`
