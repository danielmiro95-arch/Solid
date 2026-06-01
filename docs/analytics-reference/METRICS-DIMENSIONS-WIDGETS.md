# SolidStream · Analytics Reference Document

Repositorio canónico de **métricas, dimensiones y widgets** disponibles en el
módulo de Analytics. Esta es la fuente para el equipo de diseño cuando rediseñe
o amplíe la página de dashboards.

Versión del bundle: ver `docs/prototype-views.jsx` líneas 1700-1815.

---

## 1 · MÉTRICAS · qué se mide (eje Y / valor)

13 métricas disponibles. Cada una tiene su unidad y color por defecto. El widget
suele recibir `metric: 'pills_completed'` y deriva el resto.

| id (interno) | Label UI | Unidad | Color por defecto | Uso típico |
|---|---|---|---|---|
| `pills_completed` | Pills completadas | unidades | `--bn-blue` | KPIs de progreso, comparativas por equipo |
| `active_users` | Usuarios activos | usuarios | `--ok` (verde) | Engagement diario/semanal |
| `sessions` | Sesiones | sesiones | `--accent-glow` | Patrones de uso |
| `avg_session_time` | Tiempo medio · sesión | minutos | `--bn-purple` | Profundidad de uso |
| `completion_rate` | Tasa de completación | % | `--bn-lime` | Salud del aprendizaje |
| `nps` | NPS | puntos | `--info` | Satisfacción del usuario |
| `engagement` | Engagement score | puntos | `--warn` (ámbar) | Score compuesto |
| `drop_off` | Drop-off rate | % | `--accent` (violeta) | Pérdida de atención |
| `time_invested` | Tiempo invertido | horas | `--bn-blue` | ROI de la formación |
| `modules_started` | Módulos iniciados | módulos | `--bn-purple-2` | Top-of-funnel |
| `cert_progress` | Progreso certificación | % | `--ok` (verde) | Camino al certificado |
| `rating_avg` | Rating medio (★) | estrellas | `#F4B740` (oro) | Calidad percibida |
| `rating_count` | Nº puntuaciones | votos | `#F4B740` (oro) | Volumen de feedback |

---

## 2 · DIMENSIONES · cómo se agrupa (eje X / categoría)

13 dimensiones. Combinadas con una métrica producen un widget concreto.

| id (interno) | Label UI | Tipo |
|---|---|---|
| `day` | Día | Temporal |
| `week` | Semana | Temporal |
| `month` | Mes | Temporal |
| `hour` | Hora del día | Temporal cíclica |
| `weekday` | Día de la semana | Temporal cíclica |
| `role` | Rol | Categórica · user-attr |
| `team` | Equipo | Categórica · user-attr |
| `market` | Mercado | Categórica · user-attr |
| `category` | Categoría | Categórica · content-attr |
| `module` | Módulo | Categórica · content-attr |
| `pill` | Pill | Categórica · content-attr |
| `level` | Nivel | Categórica · content-attr |
| `user` | Usuario | Categórica · identity |

**Combinaciones típicas:**
- `pills_completed × week` → línea temporal de progreso
- `completion_rate × team` → barras comparativas entre equipos
- `engagement × role` → quién más se engancha
- `rating_avg × pill` → mejor / peor contenido
- `drop_off × module` → dónde se pierde la gente

---

## 3 · WIDGETS · tipos disponibles (37 total)

Organizados en 9 categorías. Cada widget tiene `id`, `label`, `cat` (categoría)
y `defaultSpan` (1 o 2 columnas del grid).

### 3.1 KPIs · Counters

Métricas únicas y resúmenes numéricos.

| id | Label | Span | Descripción |
|---|---|---|---|
| `counter` | Counter | 1 | Métrica única + delta vs periodo anterior |
| `counter-summary` | Counter Summary | 2 | Varios KPIs en fila horizontal |
| `gauge` | Gauge / Dial | 1 | Medidor analógico (engagement vs meta) |
| `nps` | NPS Scorecard | 1 | NPS + breakdown promoters/passives/detractors |
| `ratings-overview` | Rating overview | 1 | ★ medio global + nº de votos · alimentado por datos reales (no mock) |

### 3.2 Column · Bar

Comparaciones entre categorías.

| id | Label | Span | Descripción |
|---|---|---|---|
| `column` | Column | 1 | Barras verticales por categoría |
| `bar` | Bar | 1 | Barras horizontales por categoría |
| `stacked` | Stacked Bar | 2 | Barras horizontales acumuladas |
| `stacked-column` | Stacked Column | 2 | Columnas verticales acumuladas |
| `cluster` | Clustered Column | 2 | Columnas agrupadas por dimensión secundaria |

### 3.3 Line · Area · Spline

Tendencias temporales.

| id | Label | Span | Descripción |
|---|---|---|---|
| `line` | Line | 1 | Serie temporal puntos conectados |
| `spline` | Spline | 1 | Línea suavizada curva |
| `area` | Area | 1 | Área bajo la línea |
| `dropoff` | Drop-off | 1 | Retención minuto a minuto (específico de player) |
| `sentiment` | Sentiment | 1 | Trend stacked pos/neu/neg |

### 3.4 Distribution

Reparto y densidad.

| id | Label | Span | Descripción |
|---|---|---|---|
| `donut` | Donut / Pie | 1 | Distribución porcentual |
| `tree-map` | Tree Map | 2 | Rectángulos jerárquicos |
| `heatmap` | Heatmap | 1 | Matriz de intensidad |
| `wordcloud` | Word Cloud | 2 | Términos por peso |
| `ratings-dist` | Rating distribution | 2 | Distribución 1-5★ sobre todas las pills |

### 3.5 Tables

Datos tabulares.

| id | Label | Span | Descripción |
|---|---|---|---|
| `pivot` | Pivot Table | 2 | Cross-tab con heatmap embebido |
| `summary-table` | Summary Table | 1 | Métrica + previous + delta |
| `users` | Tabla usuarios | 2 | Listado individual de usuarios |
| `topquestions` | Top Questions | 1 | Ranking de preguntas frecuentes a BeonAI |
| `ratings-top` | Top pills · rating | 2 | Pills mejor puntuadas |

### 3.6 Funnel · Stages

Conversión y etapas.

| id | Label | Span | Descripción |
|---|---|---|---|
| `funnel` | Funnel | 1 | Etapas de conversión (descubrir → iniciar → completar → certificar) |
| `modules` | Completación | 1 | % completado por módulo |

### 3.7 AI · Insights · generados por BeonAI

| id | Label | Span | Descripción |
|---|---|---|---|
| `ia-insight` | AI Insight | 2 | Insight en texto sobre la métrica seleccionada |
| `ia-cluster` | AI Cluster | 2 | Agrupación automática de usuarios por comportamiento |
| `ia-anomaly` | AI Anomaly | 1 | Detección de anomalías en serie temporal |

### 3.8 Advanced

| id | Label | Span | Descripción |
|---|---|---|---|
| `bubble` | Bubble | 1 | Scatter 3D (x, y, tamaño) |
| `dual-axis` | Dual Axis | 1 | Bar + línea con 2 ejes |
| `quadrant` | Quadrant Matrix | 1 | Scatter dividido en 4 cuadrantes (priority/quick-win/etc.) |
| `activity` | Activity feed | 1 | Eventos recientes timeline |
| `wa` | WhatsApp KPIs | 1 | Compartidos / aperturas / CTR de pills enviadas por WhatsApp |

### 3.9 Layout · sin datos

| id | Label | Span | Descripción |
|---|---|---|---|
| `title` | Title | 2 | Título de sección |
| `text` | Text | 1 | Texto libre customizable (markdown ligero) |

---

## 4 · FILTROS GLOBALES del dashboard

Aplicados desde la barra superior del dashboard a TODOS los widgets compatibles.

### 4.1 Date range

| id | Label |
|---|---|
| `7d` | 7 días |
| `30d` | 30 días |
| `90d` | 90 días |
| `12m` | 12 meses |
| `all` | Todo |

### 4.2 Equipo

Genérico actualmente (pendiente de hacerse workspace-aware):
- Todos
- Equipo principal
- Externos

### 4.3 Rol

Lista derivada del catálogo de roles funcionales:
- Todos · Publish Agent · Care Agent · Manager · Analyst · Content Lead

---

## 5 · CATEGORÍAS DE WIDGETS · navegación de la librería

Cuando el user abre "Añadir widget" en el dashboard, ve estas 9 carpetas:

| id | Label | Descripción |
|---|---|---|
| `kpi` | KPIs · Counters | Métricas únicas y resúmenes numéricos |
| `column` | Column · Bar | Comparaciones entre categorías |
| `line` | Line · Area · Spline | Tendencias temporales |
| `distribution` | Distribution | Pie, donut, tree map, heatmap, word cloud |
| `table` | Tables | Pivot, summary, tabla 2D |
| `funnel` | Funnel · Stages | Conversión y etapas |
| `ai` | AI · Insights | Cluster, anomalías y resúmenes BeonAI |
| `advanced` | Advanced | Bubble, quadrant, dual axis |
| `layout` | Layout | Title, text — sin datos |

---

## 6 · ESTADO ACTUAL vs OBJETIVO

### Lo que funciona hoy

- **Renderizado de los 37 widgets** con datos MOCK (hardcoded en `prototype-views.jsx`)
- **Filtros globales** date/team/role se aplican visualmente (no a datos reales)
- **Drag & drop** de widgets en grid resizable
- **Templates** de dashboards predefinidos (ej. "Learning Analytics Q4")
- **Persistencia local** vía localStorage (NO multi-device, NO multi-user, NO scope por workspace)

### Lo que falta para que sea real

1. **Data layer**: SQL views/functions que computen cada métrica desde `pills`, `progress`, `workspace_members`, `route_exams`. Hoy los datos vienen de mocks.
2. **Persistencia de dashboards**: tabla `saved_dashboards(id, user_id, workspace_id, name, layout jsonb, …)` con RLS. Hoy se pierden al cambiar de browser/user.
3. **Defaults por workspace**: cada tenant arranca con un dashboard adecuado a su contexto (Repsol vs Hijos de Rivera). Hoy todos ven el mismo mock.
4. **Equipos y roles dinámicos** por workspace en lugar de la lista hardcoded.
5. **Editar widgets**: cambiar métrica/dimensión/filtros del widget tras crearlo (hoy se borra y se recrea).
6. **Compartir dashboard**: link público read-only · útil para reportes a stakeholders.

---

## 7 · FICHEROS RELEVANTES PARA EL DISEÑO

| Archivo | Líneas | Qué contiene |
|---|---|---|
| `docs/prototype-views.jsx` | 1700-1815 | Catálogos METRICS / DIMENSIONS / WIDGET_LIBRARY / WIDGET_CATEGORIES |
| `docs/prototype-views.jsx` | 865-1265 | Implementación visual de cada tipo de chart |
| `docs/prototype-views.jsx` | 2442-2840 | Componentes Dashboard, DashboardView, DashboardLibrary |
| `docs/sgson-views.jsx` | 445-467 | AnalyticsView · wrapper de Dashboard en la app principal |

---

## 8 · CONVENCIONES DE NAMING para extender

- **IDs** snake_case, en inglés (`pills_completed`, `drop_off`)
- **Labels** UI en español (cambia automáticamente con i18n cuando se cabletee)
- **Colores** usar CSS vars existentes (`--bn-blue`, `--ok`, `--warn`, `--accent`, `--bn-lime`, etc.) en lugar de hex directos · permite que cambien con el tema
- **`defaultSpan`**: 1 = ocupa media fila del grid (380px aprox), 2 = fila completa (760px aprox)
- **Iconos** unicode emoji por simplicidad · si el diseño quiere SVG custom, decidir y aplicar a todo el library de un golpe

---

_Última actualización: refleja el estado del bundle al momento de generación._
