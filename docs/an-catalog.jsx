/* ============================================================
   Solid · Analytics — CATÁLOGO (genérico, multi-cliente)
   13 métricas · 13 dimensiones · 37 widgets · 9 categorías
   Fuente: docs/analytics-reference/METRICS-DIMENSIONS-WIDGETS.md
   ============================================================ */

/* ── MÉTRICAS · qué se mide ────────────────────────────────── */
const METRICS = [
  { id:'pills_completed',  label:'Pills completadas',     unit:'u',        color:'var(--bn-blue)',   fmt:'int',  real:true,  source:'public.progress' },
  { id:'active_users',     label:'Usuarios activos',      unit:'usuarios', color:'var(--ok)',        fmt:'int',  real:true,  source:'public.progress (distinct user_id)' },
  { id:'sessions',         label:'Sesiones',              unit:'sesiones', color:'var(--accent)',    fmt:'int',  real:false, source:'pendiente · tabla sessions' },
  { id:'avg_session_time', label:'Tiempo medio · sesión', unit:'min',      color:'var(--bn-purple)', fmt:'time', real:false, source:'pendiente · activity_log' },
  { id:'completion_rate',  label:'Tasa de completación',  unit:'%',        color:'var(--bn-lime)',   fmt:'pct',  real:true,  source:'public.progress / count pills' },
  { id:'nps',              label:'NPS',                   unit:'pts',      color:'var(--info)',      fmt:'nps',  real:false, source:'pendiente · tabla nps_responses' },
  { id:'engagement',       label:'Engagement score',      unit:'pts',      color:'var(--warn)',      fmt:'int',  real:false, source:'pendiente · fórmula compuesta' },
  { id:'drop_off',         label:'Drop-off rate',         unit:'%',        color:'var(--accent)',    fmt:'pct',  real:false, source:'pendiente · player tracking' },
  { id:'time_invested',    label:'Tiempo invertido',      unit:'h',        color:'var(--bn-blue)',   fmt:'hrs',  real:false, source:'pendiente · watch_seconds en progress' },
  { id:'modules_started',  label:'Módulos iniciados',     unit:'módulos',  color:'var(--bn-purple)', fmt:'int',  real:true,  source:'public.progress (distinct pill_id)' },
  { id:'cert_progress',    label:'Progreso certificación', unit:'%',       color:'var(--ok)',        fmt:'pct',  real:true,  source:'public.route_exams' },
  { id:'rating_avg',       label:'Rating medio',          unit:'★',        color:'#F4B740',          fmt:'star', real:false, source:'pendiente · tabla ratings' },
  { id:'rating_count',     label:'Nº puntuaciones',       unit:'votos',    color:'#F4B740',          fmt:'int',  real:false, source:'pendiente · tabla ratings' },
];
const METRIC = Object.fromEntries(METRICS.map(m => [m.id, m]));

/* ── DIMENSIONES · cómo se agrupa ──────────────────────────── */
const DIMENSIONS = [
  { id:'day',     label:'Día',              type:'Temporal' },
  { id:'week',    label:'Semana',           type:'Temporal' },
  { id:'month',   label:'Mes',              type:'Temporal' },
  { id:'hour',    label:'Hora del día',     type:'Temporal cíclica' },
  { id:'weekday', label:'Día de la semana', type:'Temporal cíclica' },
  { id:'role',    label:'Rol',              type:'Categórica · user' },
  { id:'team',    label:'Equipo',           type:'Categórica · user' },
  { id:'market',  label:'Mercado',          type:'Categórica · user' },
  { id:'category',label:'Categoría',        type:'Categórica · contenido' },
  { id:'module',  label:'Módulo',           type:'Categórica · contenido' },
  { id:'pill',    label:'Pill',             type:'Categórica · contenido' },
  { id:'level',   label:'Nivel',            type:'Categórica · contenido' },
  { id:'user',    label:'Usuario',          type:'Categórica · identidad' },
];
const DIM = Object.fromEntries(DIMENSIONS.map(d => [d.id, d]));

/* Categorías estáticas usadas cuando el dim no es temporal · se sustituirán
 * por valores reales del workspace cuando el data-layer pueble cada uno. */
const DIM_VALUES = {
  role:    ['—'],
  team:    ['—'],
  market:  ['—'],
  category:['—'],
  module:  ['—'],
  level:   ['—'],
  pill:    ['—'],
  user:    ['—'],
  weekday: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
};

const CAT_COLORS = ['var(--bn-blue)','var(--ok)','var(--bn-purple)','#F4B740','var(--bn-lime)','var(--accent)','var(--info)','var(--bn-orange)'];

/* ── WIDGETS (37) ──────────────────────────────────────────── */
const WIDGET_LIBRARY = [
  // KPIs · Counters
  { id:'counter',          label:'Counter',            cat:'kpi',          span:1, viz:'counter',   desc:'Métrica única + delta vs periodo anterior' },
  { id:'counter-summary',  label:'Counter Summary',    cat:'kpi',          span:2, viz:'summary',   desc:'Varios KPIs en fila horizontal' },
  { id:'gauge',            label:'Gauge / Dial',       cat:'kpi',          span:1, viz:'gauge',     desc:'Medidor analógico vs meta' },
  { id:'nps',              label:'NPS Scorecard',      cat:'kpi',          span:1, viz:'nps',       desc:'NPS + promoters / passives / detractors' },
  { id:'ratings-overview', label:'Rating overview',    cat:'kpi',          span:1, viz:'ratingovw', desc:'★ medio global + nº de votos' },
  // Column · Bar
  { id:'column',           label:'Column',             cat:'column',       span:1, viz:'column',    desc:'Barras verticales por categoría' },
  { id:'bar',              label:'Bar',                cat:'column',       span:1, viz:'bar',       desc:'Barras horizontales por categoría' },
  { id:'stacked',          label:'Stacked Bar',        cat:'column',       span:2, viz:'stackedbar',desc:'Barras horizontales acumuladas' },
  { id:'stacked-column',   label:'Stacked Column',     cat:'column',       span:2, viz:'stackedcol',desc:'Columnas verticales acumuladas' },
  { id:'cluster',          label:'Clustered Column',   cat:'column',       span:2, viz:'cluster',   desc:'Columnas agrupadas por 2ª dimensión' },
  // Line · Area · Spline
  { id:'line',             label:'Line',               cat:'line',         span:1, viz:'line',      desc:'Serie temporal' },
  { id:'spline',           label:'Spline',             cat:'line',         span:1, viz:'spline',    desc:'Línea suavizada' },
  { id:'area',             label:'Area',               cat:'line',         span:1, viz:'area',      desc:'Área bajo la línea' },
  { id:'dropoff',          label:'Drop-off',           cat:'line',         span:1, viz:'retention', desc:'Retención minuto a minuto' },
  { id:'sentiment',        label:'Sentiment',          cat:'line',         span:1, viz:'sentiment', desc:'Trend stacked pos / neu / neg' },
  // Distribution
  { id:'donut',            label:'Donut / Pie',        cat:'distribution', span:1, viz:'donut',     desc:'Distribución porcentual' },
  { id:'tree-map',         label:'Tree Map',           cat:'distribution', span:2, viz:'treemap',   desc:'Rectángulos jerárquicos' },
  { id:'heatmap',          label:'Heatmap',            cat:'distribution', span:1, viz:'heatmap',   desc:'Matriz de intensidad' },
  { id:'wordcloud',        label:'Word Cloud',         cat:'distribution', span:2, viz:'wordcloud', desc:'Términos por peso' },
  { id:'ratings-dist',     label:'Rating distribution',cat:'distribution', span:2, viz:'ratingdist',desc:'Distribución 1-5★' },
  // Tables
  { id:'pivot',            label:'Pivot Table',        cat:'table',        span:2, viz:'pivot',     desc:'Cross-tab con heatmap embebido' },
  { id:'summary-table',    label:'Summary Table',      cat:'table',        span:1, viz:'summtable', desc:'Métrica + previous + delta' },
  { id:'users',            label:'Tabla usuarios',     cat:'table',        span:2, viz:'usertable', desc:'Listado individual de usuarios' },
  { id:'topquestions',     label:'Top Questions',      cat:'table',        span:1, viz:'questions', desc:'Preguntas frecuentes a BeonAI' },
  { id:'ratings-top',      label:'Top pills · rating', cat:'table',        span:2, viz:'topratings',desc:'Pills mejor puntuadas' },
  // Funnel · Stages
  { id:'funnel',           label:'Funnel',             cat:'funnel',       span:1, viz:'funnel',    desc:'Descubrir → iniciar → completar → certificar' },
  { id:'modules',          label:'Completación',       cat:'funnel',       span:1, viz:'modules',   desc:'% completado por módulo' },
  // AI · Insights
  { id:'ia-insight',       label:'AI Insight',         cat:'ai',           span:2, viz:'aiinsight', desc:'Insight en texto sobre la métrica · BeonAI' },
  { id:'ia-cluster',       label:'AI Cluster',         cat:'ai',           span:2, viz:'aicluster', desc:'Agrupación de usuarios por comportamiento' },
  { id:'ia-anomaly',       label:'AI Anomaly',         cat:'ai',           span:1, viz:'aianomaly', desc:'Detección de anomalías en serie' },
  // Advanced
  { id:'bubble',           label:'Bubble',             cat:'advanced',     span:1, viz:'bubble',    desc:'Scatter (x, y, tamaño)' },
  { id:'dual-axis',        label:'Dual Axis',          cat:'advanced',     span:1, viz:'dualaxis',  desc:'Bar + línea con 2 ejes' },
  { id:'quadrant',         label:'Quadrant Matrix',    cat:'advanced',     span:1, viz:'quadrant',  desc:'Scatter en 4 cuadrantes' },
  { id:'activity',         label:'Activity feed',      cat:'advanced',     span:1, viz:'activity',  desc:'Eventos recientes de la plataforma' },
  { id:'wa',               label:'WhatsApp KPIs',      cat:'advanced',     span:1, viz:'wakpis',    desc:'Compartidos / aperturas / CTR' },
  // Layout
  { id:'title',            label:'Title',              cat:'layout',       span:2, viz:'ltitle',    desc:'Título de sección' },
  { id:'text',             label:'Text',               cat:'layout',       span:1, viz:'ltext',     desc:'Texto libre (markdown ligero)' },
];
const WIDGET = Object.fromEntries(WIDGET_LIBRARY.map(w => [w.id, w]));

const WIDGET_CATEGORIES = [
  { id:'kpi',          label:'KPIs · Counters',      icon:'viz-kpi',    desc:'Métricas únicas y resúmenes' },
  { id:'column',       label:'Column · Bar',         icon:'viz-bar',    desc:'Comparaciones entre categorías' },
  { id:'line',         label:'Line · Area · Spline', icon:'viz-line',   desc:'Tendencias temporales' },
  { id:'distribution', label:'Distribution',         icon:'viz-donut',  desc:'Pie, donut, tree map, heatmap' },
  { id:'table',        label:'Tables',               icon:'viz-table',  desc:'Pivot, summary, tabla 2D' },
  { id:'funnel',       label:'Funnel · Stages',      icon:'viz-funnel', desc:'Conversión y etapas' },
  { id:'ai',           label:'AI · Insights',        icon:'sparkle',    desc:'Cluster, anomalías y resúmenes BeonAI' },
  { id:'advanced',     label:'Advanced',             icon:'viz-bubble', desc:'Bubble, quadrant, dual axis' },
  { id:'layout',       label:'Layout',               icon:'grid',       desc:'Title, text — sin datos' },
];

const DATE_RANGES = [
  { id:'7d',  label:'7 días',   days:7 },
  { id:'30d', label:'30 días',  days:30 },
  { id:'90d', label:'90 días',  days:90 },
  { id:'12m', label:'12 meses', days:365 },
  { id:'all', label:'Todo',     days:null },
];
const TEAM_FILTER = ['Todos'];
const ROLE_FILTER = ['Todos'];

/* Format · turn raw numeric into display string */
function fmtValue(metricId, v){
  if (v == null) return '—';
  const m = METRIC[metricId] || { fmt:'int' };
  switch(m.fmt){
    case 'pct':  return Math.round(v) + '%';
    case 'time': { const mm = Math.floor(v); const ss = Math.round((v-mm)*60); return mm + 'm ' + String(ss).padStart(2,'0') + 's'; }
    case 'hrs':  return v.toLocaleString('es-ES') + ' h';
    case 'nps':  return (v >= 0 ? '+' : '') + Math.round(v);
    case 'star': return v.toFixed(1);
    default:     return Math.round(v).toLocaleString('es-ES');
  }
}

function pointsFor(dimId){
  return ({day:30, week:12, month:12, hour:24, weekday:7}[dimId]) || 12;
}

Object.assign(window, {
  METRICS, METRIC, DIMENSIONS, DIM, DIM_VALUES, CAT_COLORS,
  WIDGET_LIBRARY, WIDGET, WIDGET_CATEGORIES,
  DATE_RANGES, TEAM_FILTER, ROLE_FILTER,
  fmtValue, pointsFor,
});
