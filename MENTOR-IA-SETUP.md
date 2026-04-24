# MENTOR-IA — Guía de configuración

## 1. Desplegar en Vercel (5 min)

### Primer despliegue
1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click "New Project" → importa el repo `danielmiro95-arch/Solid`
3. En "Build & Output Settings":
   - **Output Directory**: `docs`
   - **Build Command**: (dejar vacío — es un sitio estático)
4. En "Environment Variables", añade:
   ```
   ANTHROPIC_API_KEY = sk-ant-...tu-clave...
   ```
5. Click "Deploy"

Vercel genera automáticamente una URL tipo `solid-xxxx.vercel.app`.

---

## 2. Conectar el frontend con la API

Una vez tengas la URL de Vercel, añade esta línea al `<head>` del `docs/index.html`:

```html
<script>
  window.MENTOR_IA_API_URL = 'https://TU-PROYECTO.vercel.app/api/chat';
</script>
```

Sustituyendo `TU-PROYECTO` por el nombre real de tu proyecto en Vercel.

---

## 3. Añadir contenido de Microsoft Loop a la KB

El archivo de knowledge base está en:
```
api/kb/sprinklr-repsol.md
```

### Cómo exportar desde Microsoft Loop
1. Abre la página de Loop que quieras exportar
2. Clic en los `...` (más opciones) de la página
3. Selecciona **"Exportar a Word"** o copia el contenido directamente
4. Abre el archivo `api/kb/sprinklr-repsol.md`
5. Busca la sección correspondiente (ej: `## 3. FLUJOS DE TRABAJO PRINCIPALES`)
6. Reemplaza o añade el contenido de Loop debajo
7. Guarda y haz push a GitHub → Vercel redespliega automáticamente

### Secciones disponibles en la KB
- `## 1. QUÉ ES SPRINKLR EN REPSOL`
- `## 2. ESTRUCTURA DE ROLES EN REPSOL`
- `## 3. FLUJOS DE TRABAJO PRINCIPALES`
- `## 4. CANALES ACTIVOS EN REPSOL`
- `## 5. ESTRUCTURA DE CAMPAÑAS`
- `## 6. MACROS EN SPRINKLR CARE`
- `## 7. SLA (ACUERDOS DE NIVEL DE SERVICIO)`
- `## 8. INTEGRACIÓN CON SALESFORCE`
- `## 9. DAM — GESTIÓN DE ACTIVOS DIGITALES`
- `## 10. REPORTING Y ANALYTICS`
- `## 11. PREGUNTAS FRECUENTES DEL EQUIPO`

Puedes añadir secciones nuevas siguiendo el mismo formato `## N. TÍTULO`.

---

## 4. Desarrollo local

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la raíz del proyecto
cp .env.example .env.local
# Edita .env.local con tu API key de Anthropic

# Arrancar en local (sirve docs/ + api/)
vercel dev
```

El servidor local arranca en `http://localhost:3000`.

---

## 5. Actualizar el agente

### Cambiar el modelo
En `api/chat.js`, línea del `client.messages.create`:
```js
model: 'claude-sonnet-4-6',  // cambiar a 'claude-opus-4-7' para más potencia
```

### Ajustar el system prompt
En `api/chat.js`, función `buildSystemPrompt()`.
Puedes añadir reglas, ejemplos, o contexto adicional de Repsol.

### Cambiar el perfil de usuario
En `docs/prototype-views.jsx`, constante `USER_PROFILE`.
En producción, esto vendría del sistema de autenticación.

---

## Costes estimados (Anthropic API)

| Uso | Coste aprox. |
|-----|-------------|
| 1 conversación (10 turnos) | ~0.003 € |
| 163 usuarios × 5 conversaciones/semana | ~2.5 €/semana |
| POC completo (13 semanas) | ~30-40 € total |

Modelo usado: Claude Sonnet 4.6 (mejor ratio calidad/precio).
