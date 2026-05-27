# Setup BeonAI · Guía paso a paso

Esto te lleva desde cero a tener BeonAI funcionando en producción con la KB que tú cargues. Tiempo total: ~25 min.

## Pre-requisito · cuentas que necesitas

- ✅ Cuenta en **Anthropic Console** (`console.anthropic.com`) — gratis, sirve la misma de Claude
- ✅ Cuenta en **Supabase** (`supabase.com`) — gratis
- ✅ Cuenta en **Vercel** (`vercel.com`) — el SaaS ya está deployado allí
- ✅ Repo de GitHub con permisos de admin para hacer redeploys

---

## Fase 1 · API key de Anthropic (5 min)

1. Entra a https://console.anthropic.com
2. Login con tu cuenta
3. En el menú lateral izquierdo → **Settings** (icono engranaje)
4. **API Keys** → **Create Key**
5. Nombre: `solidstream-beonai` · permisos: por defecto (todos)
6. **Copia la key** ahora — no la vuelves a ver. Empieza por `sk-ant-`
7. Guárdala en un sitio seguro (1Password, gestor de notas)

Coste estimado: con Sonnet 4.6 + prompt caching, una conversación de coach típica cuesta ~$0.003-0.01 USD. Hablamos de céntimos al día para uso normal del equipo.

---

## Fase 2 · Supabase SQL (10 min)

1. Entra a https://supabase.com/dashboard
2. Abre tu proyecto SolidStream
3. Menú lateral → **SQL Editor** (icono de play `▶`)
4. **+ New query**
5. Abre el archivo `db/schema.sql` del repo (en GitHub, browse al archivo)
6. **Copia TODO** el contenido del archivo
7. **Pega** en el SQL Editor de Supabase
8. Pulsa **Run** (Ctrl+Enter)
9. Espera 5-10 segundos. Debería aparecer "Success. No rows returned."

**Comprobar que funcionó**:
- Menú lateral → **Table Editor**
- Deberías ver estas tablas (entre otras): `beonai_config`, `resources`, `profiles` (con columna `ingest_token`)

Si falla con un error de "function set_updated_at does not exist" → el schema ya tiene esa función. Re-ejecuta solo las partes nuevas (Sección 18c, 18d, alter table profiles).

---

## Fase 3 · Coger las claves de Supabase (3 min)

1. En Supabase dashboard, menú lateral → **Settings** (icono engranaje abajo) → **API**
2. Anota estos dos valores:

| Campo | Dónde está | Para qué |
|---|---|---|
| `URL` | Sección "Project URL" — algo como `https://abcdefghij.supabase.co` | Variable `SUPABASE_URL` |
| `service_role secret` | Sección "Project API keys" — el segundo (revelable con click) | Variable `SUPABASE_SERVICE_ROLE_KEY` |

**Importante**: la `service_role` salta RLS. **Nunca la pongas en código frontend**. Solo en env vars del backend (Vercel).

---

## Fase 4 · Env vars en Vercel (3 min)

1. Entra a https://vercel.com/dashboard
2. Abre el proyecto **solid-zeta** (o como se llame tu deploy de SolidStream)
3. **Settings** (pestaña arriba) → **Environment Variables**
4. Añade 3 variables, una por una:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | La key de la Fase 1 (`sk-ant-...`) | Production, Preview, Development |
| `SUPABASE_URL` | El URL de la Fase 3 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | El service_role secret de la Fase 3 | Production, Preview, Development |

5. Cada variable: click **Save** después de añadirla
6. (Opcional pero recomendado) Añade también: `NODE_ENV=production`

---

## Fase 5 · Redeploy (3 min)

1. En Vercel → pestaña **Deployments** (arriba)
2. Encuentra el último deploy del branch `claude/continue-vercel-setup-Sjuqc` (o `main`)
3. Click en los **tres puntos `···`** a la derecha del deploy más reciente
4. **Redeploy**
5. En el modal, **deja marcado** "Use existing Build Cache" (más rápido)
6. Click **Redeploy**
7. Espera 1-2 minutos hasta que aparezca "Ready" con bola verde

**Verificar**:
- Abre https://solid-zeta.vercel.app/
- Esquina inferior izquierda → debe poner `v=20260427dc` (o letra posterior)
- Si pone una letra anterior → el redeploy todavía no terminó, espera 1 minuto más y refresca

---

## Fase 6 · Login como admin (1 min)

Si ya tienes cuenta con `@beonit.` en el email, eres admin automáticamente. Si no:

1. https://solid-zeta.vercel.app/
2. Login / Sign up con `tu_email@beonit.es` (o el que uses)
3. Si te creas la cuenta y el sistema te marca como user → ve a Supabase → Table Editor → `profiles` → busca tu fila → cambia `system_role` de `user` a `admin` → Save

---

## Fase 7 · Cargar Loop a la KB (esto es lo que querías)

1. Ya logueado, ve a https://solid-zeta.vercel.app/admin
2. Scroll abajo hasta **🤖 BeonAI · Configuración**
3. Si está plegado, click **Mostrar**

### Cargar 1 doc (probar que funciona)

1. En **System prompt** pega algo como:
   ```
   Eres BeonAI, el tutor IA de SolidStream para el equipo de Repsol que usa Sprinklr.
   Responde siempre en español, conciso (3-4 párrafos máx).
   Si no tienes la info en tu KB, dilo y sugiere consultarlo con el Content Lead.
   ```
2. Modelo: deja **Sonnet 4.6**
3. En **Knowledge base**, click tab **Manual**
4. Nombre: `Test · página de bienvenida`
5. Contenido: pega cualquier texto corto (puede ser un párrafo)
6. **+ Añadir documento**
7. Scroll abajo → **Guardar configuración** (botón violeta)
8. Debe aparecer toast verde "Configuración guardada"

### Cargar Loop en masa (lo de verdad)

1. Abre **Microsoft Loop** en otra pestaña
2. Abre la página que quieres llevar (procedimiento, plantilla, lo que sea)
3. Click en el cuerpo de la página → **Ctrl+A** → **Ctrl+C** (copiar todo)
4. Vuelve a SolidStream → admin → BeonAI → tab **Pegado masivo**
5. En el textarea, escribe esto:

```
## Procedimiento de aprobación de campañas
[pegas aquí lo que copiaste de Loop]


## Plantilla de respuesta · cuentas particulares  
[abres otra página de Loop, copias, pegas aquí]


## Glosario de Sprinklr en Repsol
[etc]
```

(Cada página separada por `## Título nuevo` en línea aparte)

6. **Previsualizar troceo** → debe mostrarte los bloques detectados
7. Si está bien → **+ Añadir N documentos**
8. Scroll abajo → **Guardar configuración**

### Bookmarklet para mantenimiento

1. Tab **Bookmarklet** → **Generar mi bookmarklet**
2. Aparece un botón violeta `🔖 BeonAI · Importar`
3. **Arrastra** ese botón a la barra de favoritos del browser (no copies texto, drag & drop con ratón)
4. Cuando estés en una página de Loop, pulsas el favorito → la página entra a la KB

---

## Fase 8 · Probar BeonAI

1. Ve a **BeonAI** (link en el TopNav)
2. Pregunta algo que esté en la KB que cargaste, ej. *"¿Cuál es el procedimiento de aprobación?"*
3. Debe responder con info de tu Loop, en streaming (el texto aparece poco a poco)

Si responde "no tengo esa info documentada" → BeonAI no encontró el contexto. Posibles causas:
- No guardaste la config después de pegar
- El doc que pegaste no incluye esa info
- El nombre del doc no coincide con la pregunta

---

## Mantenimiento día a día

- **Loop cambió una página** → vuelve a Loop, abre la página actualizada, pulsa el bookmarklet → reemplaza automáticamente la versión vieja en la KB
- **Loop añadió docs nuevos** → usa el bookmarklet en cada uno
- **Quitar un doc** → admin → BeonAI → KB → botón "Quitar" en el doc → Guardar

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| `/admin` no muestra BeonAI | Deploy viejo | Redeploy en Vercel + Ctrl+Shift+R |
| Guardar config da error 503 | Falta `SUPABASE_SERVICE_ROLE_KEY` | Añadir env var en Vercel + redeploy |
| Guardar da error 403 | No eres admin del workspace | Cambia `system_role` en Supabase a `admin` |
| BeonAI responde error genérico | Falta `ANTHROPIC_API_KEY` | Añadir env var en Vercel + redeploy |
| Bookmarklet da error | Token rotado o caducado | Genera uno nuevo en el panel y re-arrastra |

## Costes

- **Anthropic Sonnet 4.6**: $3/M tokens input, $15/M tokens output. Con prompt caching, KB grande cuesta ~$0.30/M en hits cacheados.
- **Supabase free tier**: 500MB DB + 1GB transfer + 50k usuarios autenticados. Para un equipo de 50 personas usando Solid normal, **gratis**.
- **Vercel free tier**: 100GB bandwidth + serverless functions. **Gratis** para uso interno.

Una conversación de coach con 200 tokens input + 400 tokens output ≈ **$0.007 USD** (menos de 1 céntimo).
