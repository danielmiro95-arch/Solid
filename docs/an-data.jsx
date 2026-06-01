/* ============================================================
   Solid · Analytics — DATA LAYER (real, sin mocks)
   Pobla un caché desde Supabase. Los chart renderers leen del
   caché de forma sync · si no hay datos para una (métrica, dim),
   devuelven array vacío → widget muestra empty state.

   Métricas instrumentadas hoy (read METRICS[i].real === true):
     · pills_completed   · count progress.completed_at
     · active_users      · count distinct progress.user_id
     · modules_started   · count distinct progress.pill_id
     · completion_rate   · completed / total pills * 100
     · cert_progress     · route_exams.passed / total intentos * 100

   Resto · devuelve null hasta que se instrumente.
   ============================================================ */

(function(){
  const Cache = {
    // serie temporal · 'metricId:dimId' → array de N puntos
    series: {},
    // categórica · 'metricId:dimId' → [{label, value}]
    cats: {},
    // escalar global · metricId → { value, delta } (delta vs periodo anterior)
    scalars: {},
    // metadatos
    lastRefresh: 0,
    loading: false,
    filters: { range:'30d', team:'Todos', role:'Todos' },
  };

  function sb() { return window.supabaseClient || null; }
  function wsId() { return window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId(); }

  function rangeStart(rangeId) {
    const r = (window.DATE_RANGES || []).find(x => x.id === rangeId);
    if (!r || r.days == null) return null;
    const t = new Date(); t.setDate(t.getDate() - r.days);
    return t.toISOString();
  }

  /* Agrupa filas por temporal/categorical. Devuelve array de N puntos para
   * temporal o [{label,value}] para categorical. Si rows está vacío, [].
   */
  function aggregateTemporal(rows, dimId, dateField, valueExtractor) {
    const n = window.pointsFor(dimId);
    const buckets = new Array(n).fill(0);
    if (!rows || rows.length === 0) return buckets;
    const now = Date.now();
    rows.forEach(row => {
      const t = new Date(row[dateField]).getTime();
      if (!t) return;
      const agoMs = now - t;
      let idx = -1;
      if (dimId === 'day')       idx = n - 1 - Math.floor(agoMs / (24*3600*1000));
      else if (dimId === 'week') idx = n - 1 - Math.floor(agoMs / (7*24*3600*1000));
      else if (dimId === 'month')idx = n - 1 - Math.floor(agoMs / (30*24*3600*1000));
      else if (dimId === 'hour') idx = new Date(row[dateField]).getHours();
      else if (dimId === 'weekday') idx = (new Date(row[dateField]).getDay() + 6) % 7;
      if (idx >= 0 && idx < n) buckets[idx] += valueExtractor ? valueExtractor(row) : 1;
    });
    return buckets;
  }

  function aggregateCategorical(rows, getCategory) {
    const map = new Map();
    (rows || []).forEach(row => {
      const cat = getCategory(row);
      if (cat == null || cat === '') return;
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a,b) => b.value - a.value);
  }

  async function refreshPillsCompleted(progressRows) {
    // Total scalar + delta vs periodo anterior (mitad del rango)
    const now = Date.now();
    const ws = window.DATE_RANGES.find(r => r.id === Cache.filters.range);
    const totalDays = ws && ws.days ? ws.days : 30;
    const halfMs = (totalDays / 2) * 24 * 3600 * 1000;
    const current = progressRows.filter(r => r.completed_at && (now - new Date(r.completed_at).getTime() <= halfMs)).length;
    const previous = progressRows.filter(r => r.completed_at && (now - new Date(r.completed_at).getTime() > halfMs)).length;
    const delta = previous > 0 ? Math.round((current - previous) / previous * 1000) / 10 : 0;
    Cache.scalars['pills_completed'] = {
      value: progressRows.filter(r => r.completed_at).length,
      delta,
    };
    // Series temporales
    ['day','week','month','hour','weekday'].forEach(dim => {
      Cache.series['pills_completed:' + dim] = aggregateTemporal(progressRows.filter(r => r.completed_at), dim, 'completed_at');
    });
    // Categóricas (por pill_id agrupado)
    Cache.cats['pills_completed:pill'] = aggregateCategorical(progressRows.filter(r => r.completed_at), r => r.pill_id);
  }

  async function refreshActiveUsers(progressRows) {
    const userIds = new Set();
    progressRows.forEach(r => { if (r.user_id) userIds.add(r.user_id); });
    Cache.scalars['active_users'] = { value: userIds.size, delta: 0 };
    // Serie temporal · distinct users por bucket
    ['day','week','month'].forEach(dim => {
      const n = window.pointsFor(dim);
      const byBucket = new Array(n).fill(null).map(() => new Set());
      const now = Date.now();
      progressRows.forEach(r => {
        if (!r.updated_at || !r.user_id) return;
        const agoMs = now - new Date(r.updated_at).getTime();
        let idx = -1;
        if (dim === 'day')   idx = n - 1 - Math.floor(agoMs / (24*3600*1000));
        if (dim === 'week')  idx = n - 1 - Math.floor(agoMs / (7*24*3600*1000));
        if (dim === 'month') idx = n - 1 - Math.floor(agoMs / (30*24*3600*1000));
        if (idx >= 0 && idx < n) byBucket[idx].add(r.user_id);
      });
      Cache.series['active_users:' + dim] = byBucket.map(s => s.size);
    });
  }

  async function refreshModulesStarted(progressRows) {
    const pillIds = new Set();
    progressRows.forEach(r => { if (r.pill_id) pillIds.add(r.pill_id); });
    Cache.scalars['modules_started'] = { value: pillIds.size, delta: 0 };
  }

  async function refreshCompletionRate(progressRows, totalPills) {
    const completed = progressRows.filter(r => r.completed_at).length;
    const started = progressRows.length;
    const rate = started > 0 ? Math.round((completed / started) * 100) : 0;
    Cache.scalars['completion_rate'] = { value: rate, delta: 0 };
  }

  async function refreshCertProgress(examRows) {
    if (!examRows || examRows.length === 0) {
      Cache.scalars['cert_progress'] = { value: 0, delta: 0 };
      return;
    }
    const passed = examRows.filter(r => r.passed).length;
    const rate = examRows.length > 0 ? Math.round((passed / examRows.length) * 100) : 0;
    Cache.scalars['cert_progress'] = { value: rate, delta: 0 };
  }

  async function refresh() {
    const client = sb();
    if (!client) return;
    const ws = wsId();
    Cache.loading = true;
    try {
      const startISO = rangeStart(Cache.filters.range);
      let qp = client.from('progress').select('user_id, pill_id, progress, completed_at, updated_at');
      if (ws) qp = qp.eq('workspace_id', ws);
      if (startISO) qp = qp.gte('updated_at', startISO);
      const { data: progressRows, error: ep } = await qp;
      if (ep) { console.warn('[analytics] progress', ep.message); }

      let qe = client.from('route_exams').select('user_id, route_id, score, total, passed, completed_at');
      const { data: examRows, error: ex } = await qe;
      if (ex) { console.warn('[analytics] route_exams', ex.message); }

      const rows = progressRows || [];
      const exams = examRows || [];

      // Total pills del workspace (denominador)
      let totalPills = 0;
      if (ws) {
        const { count } = await client.from('pills').select('id', { count:'exact', head:true }).eq('workspace_id', ws);
        totalPills = count || 0;
      }

      await refreshPillsCompleted(rows);
      await refreshActiveUsers(rows);
      await refreshModulesStarted(rows);
      await refreshCompletionRate(rows, totalPills);
      await refreshCertProgress(exams);

      Cache.lastRefresh = Date.now();
    } catch(e) {
      console.warn('[analytics] refresh', e && e.message);
    } finally {
      Cache.loading = false;
      window.dispatchEvent(new Event('analytics-data-changed'));
    }
  }

  function setFilters(next) {
    Object.assign(Cache.filters, next || {});
    refresh();
  }

  /* Lookups · usados por chart renderers (sync) */
  function getSeries(metricId, dimId) {
    const m = window.METRIC && window.METRIC[metricId];
    if (!m || !m.real) return null;     // métrica no instrumentada
    const key = metricId + ':' + dimId;
    return Cache.series[key] || null;
  }
  function getCats(metricId, dimId) {
    const m = window.METRIC && window.METRIC[metricId];
    if (!m || !m.real) return null;
    const key = metricId + ':' + dimId;
    return Cache.cats[key] || null;
  }
  function getScalar(metricId) {
    const m = window.METRIC && window.METRIC[metricId];
    if (!m || !m.real) return null;
    return Cache.scalars[metricId] || null;
  }

  /* Refresh automáticamente cuando cambia el workspace o llegan
   * pills/progress nuevas. La vista AnalyticsApp también llama a
   * refresh() al montarse. */
  ['workspace-changed','pills-changed','auth-changed'].forEach(ev => {
    window.addEventListener(ev, () => { if (sb()) refresh(); });
  });

  window.Analytics = { refresh, setFilters, getSeries, getCats, getScalar, Cache };
})();
