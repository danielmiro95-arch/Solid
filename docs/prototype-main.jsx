// prototype-main.jsx — orchestrator

const { useState: useSM, useEffect: useEM } = React;

// ── WhatsApp Link Tracker ──────────────────────────────────────────────────
const WATracker = (function() {
  const KEY = 'solid-wa-links';

  function getLinks() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function save(links) { localStorage.setItem(KEY, JSON.stringify(links)); }

  function seedIfEmpty() {
    if (getLinks().length > 0) return;
    const now = Date.now();
    const d = 86400000;
    save([
      { token:'wt_demo1', pillId:'p20', pillTitle:'Cómo son los flujos de aprobación dentro de la operativa de publicación', sharedAt: now-7*d, opens:15, watchSeconds:210, sharedBy:'Sara Molina' },
      { token:'wt_demo2', pillId:'p0',  pillTitle:'Importancia de este programa',                                           sharedAt: now-3*d, opens:12, watchSeconds:145, sharedBy:'Amaia Ruiz' },
      { token:'wt_demo3', pillId:'p41', pillTitle:'Qué es una macro',                                                       sharedAt: now-1*d, opens:8,  watchSeconds:98,  sharedBy:'Carlos Vega' },
      { token:'wt_demo4', pillId:'p3',  pillTitle:'Qué canales hay dentro de Sprinklr',                                    sharedAt: now-2*3600000, opens:3, watchSeconds:45, sharedBy:'Amaia Ruiz' },
    ]);
  }

  function shareLink(pillId, pillTitle, duration) {
    const token = 'wt_' + Math.random().toString(36).substr(2,6) + '_' + Date.now().toString(36);
    const base = window.location.href.split('?')[0].split('#')[0];
    const url = base + '?pill=' + pillId + '&wtrack=' + token;
    const links = getLinks();
    links.unshift({ token, pillId, pillTitle, duration: duration || '3 min', url, sharedAt: Date.now(), opens: 0, watchSeconds: 0, sharedBy: 'Amaia Ruiz' });
    save(links);
    const msg = '📚 *SolidStream · ' + (window.WORKSPACE_NAME || 'Formación') + '*\nTe comparto este módulo: *' + pillTitle + '*\nDuración: ' + (duration||'3–5 min') + ' ⚡\n\nVer ahora → ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    if (window.Toast) window.Toast.success('Enlace de WhatsApp generado', { icon: '💬' });
    return token;
  }

  function trackOpen(token) {
    const links = getLinks();
    const l = links.find(x => x.token === token);
    if (l) { l.opens = (l.opens||0) + 1; l.lastOpenAt = Date.now(); save(links); }
  }

  function addWatchTime(token, seconds) {
    const links = getLinks();
    const l = links.find(x => x.token === token);
    if (l) { l.watchSeconds = (l.watchSeconds||0) + seconds; save(links); }
  }

  function getStats() {
    const links = getLinks();
    const totalShared = links.length;
    const totalOpens = links.reduce((s,l) => s+(l.opens||0), 0);
    const totalWatch = links.reduce((s,l) => s+(l.watchSeconds||0), 0);
    const ctr = totalShared > 0 ? (totalOpens / totalShared).toFixed(1) : '0';
    const avgWatch = totalOpens > 0 ? Math.round(totalWatch / totalOpens) : 0;
    return { totalShared, totalOpens, totalWatch, ctr, avgWatch, links };
  }

  return { getLinks, shareLink, trackOpen, addWatchTime, getStats, seedIfEmpty };
})();
window.WATracker = WATracker;

// ── Ratings · puntuación de vídeos (1-5 estrellas) ─────────────────────────
// Cada usuario puede puntuar cada pill. Estructura:
//   { userId: { pillId: { stars: 1-5, ts: number } } }
const Ratings = (function() {
  const KEY = 'solid-ratings';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e) { return {}; }
  }
  function save(all) { localStorage.setItem(KEY, JSON.stringify(all)); }

  function _currentUserId() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      return (u && u.email) || 'guest';
    } catch(e) { return 'guest'; }
  }

  function set(pillId, stars, opts) {
    // opts.silent → omite el toast genérico de "Gracias por tu puntuación".
    // Los call sites con toast contextual (like/dislike en NxCard) usan silent.
    if (!pillId) return;
    const s = Math.max(0, Math.min(5, Math.round(stars)));
    const all = getAll();
    const uid = _currentUserId();
    if (!all[uid]) all[uid] = {};
    if (s === 0) {
      delete all[uid][pillId];
    } else {
      all[uid][pillId] = { stars: s, ts: Date.now() };
    }
    save(all);
    window.dispatchEvent(new CustomEvent('ratings-changed', { detail: { pillId, stars: s } }));
    if (window.Toast && !(opts && opts.silent)) {
      if (s === 0) window.Toast.info('Puntuación eliminada');
      else window.Toast.success('¡Gracias por tu puntuación: ' + s + ' estrella' + (s>1?'s':'') + '!', { icon: '★' });
    }
  }

  function get(pillId) {
    const all = getAll();
    const uid = _currentUserId();
    const r = all[uid] && all[uid][pillId];
    return r ? r.stars : 0;
  }

  // Aggregado: por pill, average + count + distribución [n1,n2,n3,n4,n5]
  function aggregateForPill(pillId) {
    const all = getAll();
    const stars = [];
    Object.keys(all).forEach(uid => {
      const r = all[uid][pillId];
      if (r && r.stars) stars.push(r.stars);
    });
    if (stars.length === 0) return { avg: 0, count: 0, dist:[0,0,0,0,0] };
    const sum = stars.reduce((a, b) => a + b, 0);
    const dist = [0,0,0,0,0];
    stars.forEach(s => dist[s-1]++);
    return { avg: +(sum / stars.length).toFixed(2), count: stars.length, dist };
  }

  // Aggregado global: promedio sobre todas las pills puntuadas + distribución total
  function globalStats() {
    const all = getAll();
    let total = 0, count = 0;
    const dist = [0,0,0,0,0];
    const byPill = {};
    Object.keys(all).forEach(uid => {
      Object.keys(all[uid]).forEach(pillId => {
        const s = all[uid][pillId].stars;
        if (!s) return;
        total += s; count++;
        dist[s-1]++;
        if (!byPill[pillId]) byPill[pillId] = { sum:0, count:0 };
        byPill[pillId].sum += s;
        byPill[pillId].count += 1;
      });
    });
    const top = Object.keys(byPill)
      .map(pid => ({ pillId: pid, avg: +(byPill[pid].sum / byPill[pid].count).toFixed(2), count: byPill[pid].count }))
      .sort((a, b) => b.avg - a.avg);
    return {
      avg: count > 0 ? +(total / count).toFixed(2) : 0,
      count,
      dist,
      top,
    };
  }

  // Seed · puntuaciones demo para que el dashboard tenga datos
  function seedIfEmpty() {
    const all = getAll();
    if (Object.keys(all).length > 0) return;
    const now = Date.now();
    save({
      'demo1@solid.app': { p0:{stars:5,ts:now}, p3:{stars:4,ts:now}, p17:{stars:5,ts:now}, p20:{stars:5,ts:now}, p31:{stars:3,ts:now}, p41:{stars:4,ts:now} },
      'demo2@solid.app': { p0:{stars:4,ts:now}, p3:{stars:5,ts:now}, p17:{stars:4,ts:now}, p41:{stars:5,ts:now} },
      'demo3@solid.app': { p0:{stars:5,ts:now}, p20:{stars:4,ts:now}, p41:{stars:5,ts:now}, p13:{stars:2,ts:now}, p25:{stars:3,ts:now} },
      'demo4@solid.app': { p3:{stars:5,ts:now}, p17:{stars:5,ts:now}, p31:{stars:4,ts:now}, p25:{stars:1,ts:now} },
      'demo5@solid.app': { p0:{stars:3,ts:now}, p17:{stars:4,ts:now}, p41:{stars:5,ts:now}, p13:{stars:3,ts:now} },
    });
  }

  return { get, set, getAll, aggregateForPill, globalStats, seedIfEmpty };
})();
window.Ratings = Ratings;
// Inicializa puntuaciones demo
try { Ratings.seedIfEmpty(); } catch(e) {}

// ── DeliveryPrefs · preferencias de recepción de contenido ─────────────────
// Modos: 'daily' | 'weekly' | 'custom' | 'smart-ai' | 'weekdays' | 'weekends'
const DeliveryPrefs = (function() {
  const KEY = 'solid-delivery-prefs';

  const DEFAULTS = {
    enabled: true,
    mode: 'weekdays',                      // por defecto: solo días laborales
    days: [true,true,true,true,true,false,false], // Lun..Dom
    time: '09:00',
    timezone: 'auto',                      // 'auto' | 'Europe/Madrid' | ...
    maxPerDay: 1,                          // límite suave
    updatedAt: Date.now(),
  };

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') return { ...DEFAULTS, ...s };
    } catch(e) {}
    return { ...DEFAULTS };
  }

  function save(prefs) {
    const next = { ...DEFAULTS, ...prefs, updatedAt: Date.now() };
    // Derivar días según modo
    if (next.mode === 'daily')    next.days = [true,true,true,true,true,true,true];
    if (next.mode === 'weekdays') next.days = [true,true,true,true,true,false,false];
    if (next.mode === 'weekends') next.days = [false,false,false,false,false,true,true];
    if (next.mode === 'weekly')   { next.days = [false,false,false,false,false,false,false]; next.days[0] = true; }
    localStorage.setItem(_userKey(), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('delivery-prefs-changed', { detail: next }));
    return next;
  }

  function reset() {
    localStorage.removeItem(_userKey());
    window.dispatchEvent(new CustomEvent('delivery-prefs-changed', { detail: DEFAULTS }));
    return { ...DEFAULTS };
  }

  // Calcula el próximo envío real según prefs.days y prefs.time
  function nextDelivery(prefs) {
    const p = prefs || get();
    if (!p.enabled) return null;
    const activeDays = p.days || DEFAULTS.days;
    if (!activeDays.some(d => d)) return null;
    const [hh, mm] = (p.time || '09:00').split(':').map(n => parseInt(n, 10));
    const now = new Date();
    for (let offset = 0; offset < 8; offset++) {
      const d = new Date(now.getTime() + offset * 86400000);
      // jsDay: 0=Sun .. 6=Sat. Prefs days: 0=Mon .. 6=Sun
      const jsDay = d.getDay();
      const idx = jsDay === 0 ? 6 : jsDay - 1;
      if (!activeDays[idx]) continue;
      const candidate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh || 9, mm || 0, 0);
      if (offset === 0 && candidate.getTime() <= now.getTime()) continue;
      return candidate;
    }
    return null;
  }

  function formatNext(date) {
    if (!date) return 'Sin envíos programados';
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const sameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const time = date.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
    if (sameDate(date, today))    return 'Hoy a las ' + time;
    if (sameDate(date, tomorrow)) return 'Mañana a las ' + time;
    return date.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'short' }) + ' · ' + time;
  }

  return { get, save, reset, nextDelivery, formatNext };
})();
window.DeliveryPrefs = DeliveryPrefs;

// ── Channels · Manager · canales conectados (Teams · WhatsApp · Email · Slack · Push) ─
// Estructura: { teams:{connected:true, account:'amaia@repsol.com', since:ts}, ... , primary:'teams' }
const Channels = (function() {
  const KEY = 'solid-channels';

  const CATALOG = [
    { id:'whatsapp', label:'WhatsApp',         color:'#25D366', icon:'💬',  desc:'Mensajes con thumbnail y CTA · ideal para móvil', authType:'phone',      available:true },
    { id:'teams',    label:'Microsoft Teams',  color:'#5059C9', icon:'🟦',  desc:'Adaptive cards y notificaciones en chat',         authType:'oauth',      available:true },
    { id:'email',    label:'Email',            color:'#EA4335', icon:'✉️',  desc:'Digest diario o semanal con HTML rico',           authType:'oauth',      available:true },
    { id:'slack',    label:'Slack',            color:'#4A154B', icon:'💼',  desc:'Bot notifications + channel posting',             authType:'oauth',      available:false },
    { id:'push',     label:'Push web/mobile',  color:'#2D6BF6', icon:'🔔',  desc:'Notificaciones nativas del navegador/app',        authType:'permission', available:false },
  ];

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') return s;
    } catch(e) {}
    // estado por defecto: WhatsApp conectado de fábrica
    return {
      whatsapp: { connected:true, account:'+34 6XX XXX 234', since: Date.now() - 7*86400000 },
      primary: 'whatsapp',
    };
  }

  function save(state) {
    localStorage.setItem(_userKey(), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('channels-changed', { detail: state }));
    return state;
  }

  function connect(channelId, account) {
    const def = CATALOG.find(c => c.id === channelId);
    if (!def) return null;
    // Deriva la cuenta del PERFIL del usuario actual · antes había literales
    // de Repsol (amaia.ruiz@repsol.com) hardcodeados que se filtraban a
    // CUALQUIER workspace/usuario. Si no hay dato, queda genérico.
    const prof = (window.UserProfile && window.UserProfile.get && window.UserProfile.get()) || {};
    const email = prof.email || '';
    const accs = {
      whatsapp: prof.phone || 'Tu número de WhatsApp',
      teams:    email || 'Tu cuenta de Teams',
      email:    email || 'Tu correo',
      slack:    email || 'Tu cuenta de Slack',
      push:     (navigator.userAgent || 'Web push').split(' ')[0],
    };
    const next = get();
    next[channelId] = { connected:true, account: account || accs[channelId] || 'Cuenta conectada', since: Date.now() };
    if (!next.primary || !next[next.primary] || !next[next.primary].connected) next.primary = channelId;
    if (window.Toast) window.Toast.success(def.label + ' conectado', { icon: def.icon });
    return save(next);
  }

  function disconnect(channelId) {
    const def = CATALOG.find(c => c.id === channelId);
    const next = get();
    delete next[channelId];
    if (next.primary === channelId) {
      const otherConnected = Object.keys(next).find(k => k !== 'primary' && next[k] && next[k].connected);
      next.primary = otherConnected || null;
    }
    if (def && window.Toast) window.Toast.info(def.label + ' desconectado');
    return save(next);
  }

  function setPrimary(channelId) {
    const next = get();
    if (!next[channelId] || !next[channelId].connected) return next;
    next.primary = channelId;
    if (window.Toast) {
      const def = CATALOG.find(c => c.id === channelId);
      if (def) window.Toast.success(def.label + ' es ahora tu canal principal', { icon:'⭐' });
    }
    return save(next);
  }

  function reauth(channelId) {
    const def = CATALOG.find(c => c.id === channelId);
    const next = get();
    if (next[channelId]) next[channelId].since = Date.now();
    if (def && window.Toast) window.Toast.success(def.label + ' re-autenticado', { icon:'🔐' });
    return save(next);
  }

  function getConnected() {
    const s = get();
    return CATALOG.filter(c => s[c.id] && s[c.id].connected).map(c => ({ ...c, ...s[c.id], primary: s.primary === c.id }));
  }

  return { CATALOG, get, save, connect, disconnect, setPrimary, reauth, getConnected };
})();
window.Channels = Channels;

// ── ContentPush · qué tipo de contenido recibir + formato de entrega ───────
const ContentPush = (function() {
  const KEY = 'solid-content-push';

  const TYPES = [
    { id:'videos',    label:'Vídeos',             icon:'🎬', desc:'Episodios y lecciones grabadas' },
    { id:'pills',     label:'Learning pills',     icon:'⚡',  desc:'Cápsulas cortas de 3-5 min' },
    { id:'workshops', label:'Talleres',           icon:'🛠',  desc:'Sesiones en vivo o híbridas' },
    { id:'courses',   label:'Cursos completos',   icon:'🎓', desc:'Rutas de certificación' },
    { id:'news',      label:'Noticias',           icon:'📰', desc:'Actualizaciones de la plataforma' },
    { id:'docs',      label:'Documentación',      icon:'📚', desc:'Guías técnicas y referencias' },
    { id:'podcasts',  label:'Podcasts',           icon:'🎙',  desc:'Audio long-form · escucha en ruta' },
    { id:'ia_recs',   label:'IA recommendations', icon:'✨', desc:'BeonAI te sugiere contenido relevante' },
  ];

  const DEFAULTS = {
    types: { videos:true, pills:true, workshops:true, courses:false, news:false, docs:false, podcasts:false, ia_recs:true },
    autoReceive: true,
    showSummary: true,
    showThumbnail: true,
    openInSolid: true,
    showDuration: true,
    updatedAt: Date.now(),
  };

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') return { ...DEFAULTS, ...s, types: { ...DEFAULTS.types, ...(s.types || {}) } };
    } catch(e) {}
    return { ...DEFAULTS, types: { ...DEFAULTS.types } };
  }

  function save(prefs) {
    const next = { ...prefs, updatedAt: Date.now() };
    localStorage.setItem(_userKey(), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('content-push-changed', { detail: next }));
    return next;
  }

  function toggleType(typeId) {
    const cur = get();
    cur.types = { ...cur.types, [typeId]: !cur.types[typeId] };
    return save(cur);
  }

  function setFlag(flag, value) {
    const cur = get();
    cur[flag] = !!value;
    return save(cur);
  }

  function reset() {
    localStorage.removeItem(_userKey());
    window.dispatchEvent(new CustomEvent('content-push-changed', { detail: DEFAULTS }));
    return { ...DEFAULTS, types: { ...DEFAULTS.types } };
  }

  return { TYPES, get, save, toggleType, setFlag, reset };
})();
window.ContentPush = ContentPush;

// ── Subscriptions · seguir categorías, skills, equipos y trainers ─────────
const Subscriptions = (function() {
  const KEY = 'solid-subscriptions';

  const CATALOG = {
    categories: [
      { id:'ia',         label:'Inteligencia Artificial', color:'var(--bn-purple)',   icon:'✨' },
      { id:'data',       label:'Data & Analytics',        color:'var(--bn-blue)',     icon:'📊' },
      { id:'cx',         label:'CX · Customer Experience',color:'var(--accent-glow)', icon:'💬' },
      { id:'care',       label:'Care · Soporte',          color:'var(--ok)',          icon:'🛟' },
      { id:'publish',    label:'Publish · Social',        color:'#25D366',            icon:'📢' },
      { id:'content',    label:'Content',                 color:'var(--bn-orange)',   icon:'🎨' },
      { id:'leadership', label:'Leadership',              color:'var(--accent)',      icon:'👥' },
      { id:'marketing',  label:'Marketing',               color:'var(--bn-lime)',     icon:'📣' },
    ],
    skills: [
      { id:'social_publish',  label:'Social Publishing' },
      { id:'care_console',    label:'Care Console' },
      { id:'analytics_sql',   label:'Analytics + SQL' },
      { id:'campaign_design', label:'Campaign Design' },
      { id:'crisis_mgmt',     label:'Crisis Management' },
      { id:'sentiment_ai',    label:'Sentiment AI' },
      { id:'reporting',       label:'Reporting' },
      { id:'workflow_automation', label:'Workflow Automation' },
      { id:'community_mgmt',  label:'Community Management' },
      { id:'kpis_dashboards', label:'KPIs & Dashboards' },
      { id:'governance',      label:'Governance & Compliance' },
      { id:'integrations',    label:'Integraciones (CRM, Salesforce)' },
    ],
    // Equipos · cada workspace configura los suyos. El admin los gestiona
    // desde el panel de Workspaces (sección Miembros). Vacío por defecto.
    teams: [],
    // Trainers · personas del workspace con rol formador. Vacío por defecto
    // hasta que se implemente un rol "trainer" en workspace_members.
    trainers: [],
  };

  const DEFAULTS = {
    categories: { ia:true, care:true },                   // arranca con 2 generales activas
    skills:     {},
    teams:      {},                                       // sin suscripciones por defecto · admin configura
    trainers:   {},
    updatedAt: Date.now(),
  };

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') {
        return {
          categories: { ...DEFAULTS.categories, ...(s.categories || {}) },
          skills:     { ...DEFAULTS.skills,     ...(s.skills     || {}) },
          teams:      { ...DEFAULTS.teams,      ...(s.teams      || {}) },
          trainers:   { ...DEFAULTS.trainers,   ...(s.trainers   || {}) },
          updatedAt:  s.updatedAt || Date.now(),
        };
      }
    } catch(e) {}
    return {
      categories: { ...DEFAULTS.categories },
      skills:     { ...DEFAULTS.skills },
      teams:      { ...DEFAULTS.teams },
      trainers:   { ...DEFAULTS.trainers },
      updatedAt:  Date.now(),
    };
  }

  function save(prefs) {
    const next = { ...prefs, updatedAt: Date.now() };
    localStorage.setItem(_userKey(), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('subscriptions-changed', { detail: next }));
    return next;
  }

  function toggle(group, id) {
    const cur = get();
    cur[group] = { ...cur[group], [id]: !cur[group][id] };
    return save(cur);
  }

  function count(group) {
    const cur = get();
    return Object.keys(cur[group] || {}).filter(k => cur[group][k]).length;
  }

  function totalCount() {
    return count('categories') + count('skills') + count('teams') + count('trainers');
  }

  function reset() {
    localStorage.removeItem(_userKey());
    const d = {
      categories: { ...DEFAULTS.categories },
      skills:     { ...DEFAULTS.skills },
      teams:      { ...DEFAULTS.teams },
      trainers:   { ...DEFAULTS.trainers },
      updatedAt:  Date.now(),
    };
    window.dispatchEvent(new CustomEvent('subscriptions-changed', { detail: d }));
    return d;
  }

  return { CATALOG, get, save, toggle, count, totalCount, reset };
})();
window.Subscriptions = Subscriptions;

// ── TestSends · historial de notificaciones de prueba ─────────────────────
const TestSends = (function() {
  const KEY = 'solid-test-sends';
  const MAX = 12;

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function list() {
    try { return JSON.parse(localStorage.getItem(_userKey()) || '[]'); } catch(e) { return []; }
  }
  function _save(arr) { localStorage.setItem(_userKey(), JSON.stringify(arr.slice(0, MAX))); }

  function send(channelId, channelLabel) {
    const entry = {
      id: 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
      channelId, channelLabel,
      ts: Date.now(),
      status: 'delivered',
    };
    const next = [entry, ...list()];
    _save(next);
    // Notificación nativa del navegador (si el usuario la permitió)
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('SolidStream · Test ' + channelLabel, {
          body: 'Hoy toca: Programar posts y calendario',
          icon: '/beonit-logo.png',
        });
      }
    } catch(e) {}
    window.dispatchEvent(new CustomEvent('test-sends-changed', { detail: next }));
    if (window.Toast) window.Toast.success('Test enviado a ' + channelLabel, { icon:'📨' });
    return entry;
  }

  function clear() {
    _save([]);
    window.dispatchEvent(new CustomEvent('test-sends-changed', { detail: [] }));
  }

  async function requestPermission() {
    try {
      if (typeof Notification === 'undefined') return 'unsupported';
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied')  return 'denied';
      const r = await Notification.requestPermission();
      return r;
    } catch(e) { return 'error'; }
  }

  return { list, send, clear, requestPermission };
})();
window.TestSends = TestSends;

// ── NotificationRules · quiet hours · vacation · digest · límites ─────────
const NotificationRules = (function() {
  const KEY = 'solid-notif-rules';

  const DEFAULTS = {
    digest: 'instant',      // 'instant' | 'daily' | 'weekly'
    quietHours: {
      enabled: true,
      from: '22:00',
      to:   '08:00',
    },
    vacation: {
      enabled: false,
      until: '',            // YYYY-MM-DD
    },
    maxPerDay: 3,
    priority: 'all',        // 'all' | 'high' | 'relevant'
    smartReminder: true,    // omitir si ya viste el contenido
    updatedAt: Date.now(),
  };

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') {
        return {
          ...DEFAULTS,
          ...s,
          quietHours: { ...DEFAULTS.quietHours, ...(s.quietHours || {}) },
          vacation:   { ...DEFAULTS.vacation,   ...(s.vacation   || {}) },
        };
      }
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function save(rules) {
    const next = { ...rules, updatedAt: Date.now() };
    localStorage.setItem(_userKey(), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('notif-rules-changed', { detail: next }));
    return next;
  }

  function update(patch) {
    const cur = get();
    return save({ ...cur, ...patch });
  }

  function reset() {
    localStorage.removeItem(_userKey());
    const d = JSON.parse(JSON.stringify(DEFAULTS));
    window.dispatchEvent(new CustomEvent('notif-rules-changed', { detail: d }));
    return d;
  }

  // Comprueba si AHORA estamos en quiet hours o vacation
  function isMuted() {
    const r = get();
    if (r.vacation && r.vacation.enabled) {
      if (!r.vacation.until) return true;
      try {
        const until = new Date(r.vacation.until + 'T23:59:59');
        if (Date.now() <= until.getTime()) return true;
      } catch(e) {}
    }
    if (r.quietHours && r.quietHours.enabled) {
      const now = new Date();
      const curMin = now.getHours() * 60 + now.getMinutes();
      const [fh, fm] = (r.quietHours.from || '00:00').split(':').map(Number);
      const [th, tm] = (r.quietHours.to   || '00:00').split(':').map(Number);
      const fMin = fh*60 + fm, tMin = th*60 + tm;
      // Quiet hours pueden cruzar la medianoche
      if (fMin === tMin) return false;
      if (fMin < tMin)   return curMin >= fMin && curMin < tMin;
      return curMin >= fMin || curMin < tMin;
    }
    return false;
  }

  return { get, save, update, reset, isMuted };
})();
window.NotificationRules = NotificationRules;

// ── ChannelNotifs · matriz Sprinklr-style · por tipo × por canal ─────────
// Estructura: { <notifTypeId>: { whatsapp: bool, teams: bool, email: bool, slack: bool, push: bool } }
const ChannelNotifs = (function() {
  const KEY = 'solid-channel-notifs';

  // Tipos de notificación · independientes del canal
  const TYPES = [
    { id:'daily_module',  icon:'📚', label:'Módulo diario',          desc:'Tu pill del día a primera hora' },
    { id:'meeting_brief', icon:'🗓', label:'Brief antes de reunión', desc:'30 min antes · contexto Sprinklr relacionado' },
    { id:'weekly_recap',  icon:'📈', label:'Resumen semanal',        desc:'Tu progreso de la semana · viernes 17:00' },
    { id:'beonai_chat',   icon:'✨', label:'Respuestas de BeonAI',   desc:'Si preguntas algo desde el canal, te responde aquí' },
    { id:'new_workshop',  icon:'🛠', label:'Nuevo taller',            desc:'Aviso cuando se publica un workshop relevante' },
    { id:'deadlines',     icon:'⏰', label:'Deadlines y recordatorios', desc:'Certificaciones, talleres en directo, fechas límite' },
    { id:'ai_recs',       icon:'🎯', label:'Recomendaciones IA',     desc:'BeonAI te sugiere contenido cuando detecta uno relevante' },
  ];

  // Por defecto · WhatsApp activo para módulo diario y briefs
  const DEFAULTS = {
    daily_module:  { whatsapp:true,  teams:false, email:false, slack:false, push:false },
    meeting_brief: { whatsapp:true,  teams:false, email:false, slack:false, push:false },
    weekly_recap:  { whatsapp:false, teams:false, email:true,  slack:false, push:false },
    beonai_chat:   { whatsapp:false, teams:false, email:false, slack:false, push:false },
    new_workshop:  { whatsapp:false, teams:false, email:true,  slack:false, push:false },
    deadlines:     { whatsapp:true,  teams:false, email:true,  slack:false, push:false },
    ai_recs:       { whatsapp:false, teams:false, email:false, slack:false, push:false },
  };

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') {
        const merged = {};
        TYPES.forEach(t => { merged[t.id] = { ...DEFAULTS[t.id], ...(s[t.id] || {}) }; });
        return merged;
      }
    } catch(e) {}
    // deep copy de DEFAULTS
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function save(state) {
    localStorage.setItem(_userKey(), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('channel-notifs-changed', { detail: state }));
    return state;
  }

  function toggle(typeId, channelId) {
    const cur = get();
    if (!cur[typeId]) cur[typeId] = {};
    cur[typeId][channelId] = !cur[typeId][channelId];
    return save(cur);
  }

  function setAll(channelId, value) {
    const cur = get();
    TYPES.forEach(t => {
      if (!cur[t.id]) cur[t.id] = {};
      cur[t.id][channelId] = !!value;
    });
    return save(cur);
  }

  function countForChannel(channelId) {
    const cur = get();
    return TYPES.filter(t => cur[t.id] && cur[t.id][channelId]).length;
  }

  function reset() {
    localStorage.removeItem(_userKey());
    const d = JSON.parse(JSON.stringify(DEFAULTS));
    window.dispatchEvent(new CustomEvent('channel-notifs-changed', { detail: d }));
    return d;
  }

  return { TYPES, get, save, toggle, setAll, countForChannel, reset };
})();
window.ChannelNotifs = ChannelNotifs;

// ── SmartScheduling · análisis IA del mejor horario para recibir contenido ─
// Genera insights mock realistas basados en heurísticas: hora más activa, día
// más interactivo, ventana óptima. En backend real esto vendrá de analytics.
const SmartScheduling = (function() {
  const KEY = 'solid-smart-scheduling';

  function _userKey() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      // Usa id como identificador (consistente con _userScopedKey global).
      // Fallback a email para datos legacy creados antes de tener id.
      const ident = (u && u.id) || (u && u.email) || 'guest';
      const wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
      return KEY + ':' + ident + ':' + wsId;
    } catch(e) { return KEY + ':guest'; }
  }

  // Construye un análisis a partir de heurísticas + un toque pseudoaleatorio
  // estable por usuario para que cambie entre cuentas pero no entre recargas.
  function _hash(s) { let h = 0; for (let i = 0; i < (s||'').length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }

  function analyze() {
    try {
      const u = (window.Auth && window.Auth.currentUser && window.Auth.currentUser()) || { email:'guest' };
      const seed = _hash(u.email || 'guest');

      // Hora óptima · entre 8:00 y 18:00, sesgada a media mañana
      const baseHour = 8 + (seed % 6);     // 8..13
      const minute   = ((seed >> 3) % 4) * 15; // 0/15/30/45
      const time = String(baseHour).padStart(2,'0') + ':' + String(minute).padStart(2,'0');

      // Día más activo · favoreciendo Mar/Mié/Jue
      const candidates = [1, 2, 3, 0, 4]; // mar, mié, jue, lun, vie
      const bestDayIdx = candidates[seed % candidates.length];
      const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

      const engagement = 62 + (seed % 32);  // 62-94%
      const avgWatch   = 3 + ((seed >> 5) % 4); // 3-6 min
      const peakWindow = baseHour + ':00 – ' + (baseHour + 2) + ':00';

      const insights = [
        { icon:'⏰', label:'Hora óptima',          value: time,                 hint:'Cuando más interactúas con el contenido' },
        { icon:'📅', label:'Día más activo',        value: days[bestDayIdx],     hint:'Más completaciones que el resto de días' },
        { icon:'⚡',  label:'Ventana de atención',  value: peakWindow,           hint:'Tu pico de concentración' },
        { icon:'📊', label:'Tiempo medio por pill',value: avgWatch + ' min',    hint:'Cuánto suele costarte completarla' },
        { icon:'❤️', label:'Engagement',           value: engagement + '%',     hint:'% de pills que terminas vs. abandonadas' },
      ];

      const result = { time, bestDayIdx, days, engagement, avgWatch, peakWindow, insights, generatedAt: Date.now() };
      localStorage.setItem(_userKey(), JSON.stringify(result));
      window.dispatchEvent(new CustomEvent('smart-scheduling-changed', { detail: result }));
      return result;
    } catch(e) { return null; }
  }

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(_userKey()) || 'null');
      if (s && typeof s === 'object') return s;
    } catch(e) {}
    return analyze();
  }

  function applyToDelivery() {
    const r = get();
    if (!r) return;
    if (window.DeliveryPrefs && window.DeliveryPrefs.save) {
      const prev = window.DeliveryPrefs.get();
      const days = [false,false,false,false,false,false,false];
      // Mantener un patrón coherente: laborales + el día más activo siempre on
      for (let i = 0; i < 5; i++) days[i] = true;
      days[r.bestDayIdx] = true;
      window.DeliveryPrefs.save({ ...prev, mode:'smart-ai', time: r.time, days });
    }
  }

  return { get, analyze, applyToDelivery };
})();
window.SmartScheduling = SmartScheduling;

// ── Workspaces · multi-tenant · cada user pertenece a uno o más workspaces ─
// Un workspace es un tenant (empresa cliente). Los datos del SaaS se scopean
// por workspace + user. Un user puede ser miembro de varios workspaces con
// distinto rol en cada uno (owner / admin / member).
const Workspaces = (function() {
  const KEY = 'solid-workspaces';
  const ACTIVE_KEY = 'solid-active-workspace';
  const MEMBERSHIP_KEY = 'solid-workspace-memberships'; // {userId:[{workspaceId, role, joinedAt}]}

  const ROLES = ['owner', 'admin', 'member'];

  function _gen() { return 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function _save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('workspaces-changed'));
  }

  function _memberships() {
    try { return JSON.parse(localStorage.getItem(MEMBERSHIP_KEY) || '{}'); } catch(e) { return {}; }
  }
  function _saveMemberships(m) { localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(m)); }

  function get(id) { return list().find(w => w.id === id) || null; }

  function listMine() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      if (!u) return [];
      // Platform admin ve TODOS los workspaces
      if (u.systemRole === 'admin') return list();
      const ms = _memberships()[u.id] || [];
      return ms.map(m => Object.assign({}, get(m.workspaceId), { _membership: m })).filter(w => w.id);
    } catch(e) { return []; }
  }

  function currentId() { return localStorage.getItem(ACTIVE_KEY) || null; }
  // Si la URL trae ?ws=<slug>, busca el workspace cuyo slug coincide y lo
  // hace activo (override de lo que haya en localStorage). Permite que un
  // link tipo solid.vercel.app/?ws=hijos-de-ribera te lleve directo ahí.
  function _resolveFromUrl() {
    try {
      if (typeof window === 'undefined' || !window.location) return null;
      const params = new URLSearchParams(window.location.search);
      const slug = (params.get('ws') || '').trim().toLowerCase();
      if (!slug) return null;
      const all = listMine();
      const match = all.find(w => (w.slug || '').toLowerCase() === slug || ((w.name || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') === slug));
      return match || null;
    } catch(e) { return null; }
  }
  function current() {
    // 1. URL override · ?ws=<slug> manda sobre localStorage
    const fromUrl = _resolveFromUrl();
    if (fromUrl) {
      if (currentId() !== fromUrl.id) localStorage.setItem(ACTIVE_KEY, fromUrl.id);
      return fromUrl;
    }
    const id = currentId();
    if (id) {
      const w = get(id);
      if (w) return w;
    }
    // Fallback al primer workspace del user
    const mine = listMine();
    return mine[0] || null;
  }
  function setCurrent(id) {
    const w = get(id);
    if (!w) return null;
    const wasActive = currentId() === id;
    localStorage.setItem(ACTIVE_KEY, id);
    // Refleja el workspace activo en la URL (?ws=<slug>) sin recargar. Permite
    // copiar/pegar el link y aterrizar directamente en el workspace correcto,
    // funcionar back/forward del navegador y dar sensación de SaaS multi-tenant.
    try {
      var slug = (w.slug || w.name || '').toString().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      if (slug && typeof window !== 'undefined' && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (url.searchParams.get('ws') !== slug) {
          url.searchParams.set('ws', slug);
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      }
    } catch(e) { /* router opcional */ }
    if (wasActive) return w; // No spam de eventos si el workspace ya estaba activo
    window.dispatchEvent(new CustomEvent('workspace-changed', { detail: w }));
    // Refresca todas las UIs reactivas a los stores per-workspace
    var STORE_EVENTS = ['bookmarks-changed','ratings-changed','channels-changed',
      'delivery-prefs-changed','content-push-changed','subscriptions-changed',
      'notif-rules-changed','channel-notifs-changed','test-sends-changed',
      'smart-scheduling-changed','chats-changed','inbox-changed'];
    STORE_EVENTS.forEach(function(ev){ window.dispatchEvent(new Event(ev)); });
    return w;
  }

  function create(data) {
    const wsList = list();
    const ws = {
      id: _gen(),
      name: data.name || 'Workspace',
      slug: (data.slug || data.name || 'ws').toString().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      logo: data.logo || null,
      primaryColor: data.primaryColor || '#6E50EE',
      ownerId: data.ownerId || (window.Auth && window.Auth.currentUserId && window.Auth.currentUserId()),
      createdAt: Date.now(),
      settings: { defaultLang: 'es', allowSignup: false, ...(data.settings || {}) },
    };
    wsList.push(ws);
    _save(wsList);
    // El creador queda como owner
    if (ws.ownerId) addMember(ws.id, ws.ownerId, 'owner');
    return ws;
  }

  function update(id, patch) {
    const wsList = list();
    const idx = wsList.findIndex(w => w.id === id);
    if (idx < 0) return null;
    wsList[idx] = Object.assign({}, wsList[idx], patch);
    _save(wsList);
    return wsList[idx];
  }

  function remove(id) {
    _save(list().filter(w => w.id !== id));
    // Limpia memberships de ese workspace
    const m = _memberships();
    Object.keys(m).forEach(uid => { m[uid] = m[uid].filter(x => x.workspaceId !== id); });
    _saveMemberships(m);
    if (currentId() === id) localStorage.removeItem(ACTIVE_KEY);
    window.dispatchEvent(new Event('workspaces-changed'));
  }
  // archive · marca archived_at (modo demo) · el override Supabase lo persiste
  // en DB. Sin esto el botón "Archivar" lanzaba 'archive is not a function' en
  // modo localStorage.
  function archive(id) {
    const all = list();
    const w = all.find(x => x.id === id);
    if (w) { w.archived_at = Date.now(); _save(all); window.dispatchEvent(new Event('workspaces-changed')); }
    return w || null;
  }

  function addMember(workspaceId, userId, role) {
    if (ROLES.indexOf(role) < 0) role = 'member';
    const m = _memberships();
    m[userId] = m[userId] || [];
    if (!m[userId].find(x => x.workspaceId === workspaceId)) {
      m[userId].push({ workspaceId, role, joinedAt: Date.now() });
      _saveMemberships(m);
      window.dispatchEvent(new Event('workspaces-changed'));
    }
  }

  function removeMember(workspaceId, userId) {
    const m = _memberships();
    if (m[userId]) {
      m[userId] = m[userId].filter(x => x.workspaceId !== workspaceId);
      _saveMemberships(m);
      window.dispatchEvent(new Event('workspaces-changed'));
    }
  }

  function setMemberRole(workspaceId, userId, role) {
    if (ROLES.indexOf(role) < 0) return;
    const m = _memberships();
    if (!m[userId]) return;
    const entry = m[userId].find(x => x.workspaceId === workspaceId);
    if (entry) {
      entry.role = role;
      _saveMemberships(m);
      window.dispatchEvent(new Event('workspaces-changed'));
    }
  }

  function membersOf(workspaceId) {
    const m = _memberships();
    const users = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
    const out = [];
    Object.keys(m).forEach(uid => {
      const entry = (m[uid] || []).find(x => x.workspaceId === workspaceId);
      if (entry) {
        const user = users.find(u => u.id === uid);
        if (user) out.push(Object.assign({}, user, { workspaceRole: entry.role, joinedAt: entry.joinedAt }));
      }
    });
    return out;
  }

  function currentRole() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      const wsId = currentId();
      if (!u || !wsId) return null;
      if (u.systemRole === 'admin') return 'admin'; // platform admin tiene poder en cualquier ws
      const entry = (_memberships()[u.id] || []).find(x => x.workspaceId === wsId);
      return entry ? entry.role : null;
    } catch(e) { return null; }
  }

  // ── Seed inicial · si no hay workspaces, crea "Repsol" con el primer user ──
  function seedIfEmpty() {
    if (list().length > 0) return;
    const users = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
    const firstAdmin = users.find(u => u.systemRole === 'admin' || u.isAdmin) || users[0];
    if (!firstAdmin) return;
    // Workspace por defecto en instalaciones nuevas (SaaS multi-cliente).
    // Las instalaciones existentes ya tienen su workspace, así que este seed
    // no afecta a Repsol/Hijos de Rivera/etc · sólo a nuevos despliegues.
    const repsol = {
      id: _gen(),
      name: 'Mi organización',
      slug: 'demo',
      logo: null,
      primaryColor: '#6E50EE',
      ownerId: firstAdmin.id,
      createdAt: Date.now(),
      settings: { defaultLang: 'es', allowSignup: true },
    };
    _save([repsol]);
    // Todos los usuarios actuales se añaden como member del workspace seed
    users.forEach(u => {
      const role = (u.id === firstAdmin.id) ? 'owner' : (u.systemRole === 'manager' ? 'admin' : 'member');
      addMember(repsol.id, u.id, role);
    });
    setCurrent(repsol.id);
    // Migración suave · copia datos legacy <KEY>:<email> a <KEY>:<email>:<wsId>
    _migrateLegacyDataIntoWorkspace(repsol.id);
  }

  // Migra datos pre-multi-tenant: si el user tenía bookmarks/ratings/channels…
  // bajo el key viejo <prefix>:<id_or_email>, los copia al nuevo scoping con
  // el workspaceId para que sobrevivan al cambio. Sólo corre 1 vez por user.
  function _migrateLegacyDataIntoWorkspace(wsId) {
    try {
      const users = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
      const PREFIXES = ['solid-bookmarks','solid-chats','solid-active-chat',
        'solid-channels','solid-delivery-prefs','solid-content-push',
        'solid-subscriptions','solid-notif-rules','solid-channel-notifs',
        'solid-test-sends','solid-smart-scheduling','sgson-inbox','sgson-route-exams'];
      const RATING_PREFIX = 'solid-ratings:'; // ratings es global con userId interno, no migra
      users.forEach(u => {
        const idents = [u.id, u.email]; // ambos formatos en uso histórico
        PREFIXES.forEach(p => {
          idents.forEach(idn => {
            const oldKey = p + ':' + idn;
            const newKey = p + ':' + u.id + ':' + wsId;
            const val = localStorage.getItem(oldKey);
            if (val != null && localStorage.getItem(newKey) == null) {
              localStorage.setItem(newKey, val);
            }
          });
        });
      });
    } catch(e) {}
  }

  // Sube un logo desde un File del input. Modo demo · convierte a dataURL
  // y lo guarda inline en workspace.logo (no hay red, todo localStorage).
  // El adapter Supabase sobrescribe esta función para subir al bucket real.
  async function uploadLogo(workspaceId, file) {
    if (!workspaceId || !file) return null;
    var dataUrl = await new Promise(function(resolve, reject){
      var r = new FileReader();
      r.onload = function(){ resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    update(workspaceId, { logo: dataUrl });
    return dataUrl;
  }

  return { list, listMine, get, current, currentId, setCurrent, create, update, remove, archive,
           addMember, removeMember, setMemberRole, membersOf, currentRole, uploadLogo, seedIfEmpty, ROLES };
})();
window.Workspaces = Workspaces;

// Helper · ¿estamos en un workspace de DEMO? · usado por sembrado de muestras
// y hardcodes de presentación HdR. Antes era `/demo/i.test(href)` lo cual hacía
// match con `?ws=demo` y metía progreso falso a users reales. La regla cierta:
// el slug del workspace activo es "demo" o termina en "-demo" (alineado con el
// patrón de db/security-hardening.sql).
window.isDemoWorkspace = function() {
  try {
    var ws = (Workspaces.current && Workspaces.current()) || null;
    var slug = (ws && (ws.slug || '')).toLowerCase();
    if (slug === 'demo' || /-demo$/.test(slug)) return true;
    // Fallback · subdomain demo.* (presentaciones con dominio dedicado)
    return /(^|\.)demo\./.test(window.location.hostname);
  } catch (e) { return false; }
};

// ── DemoMode · helper que lee workspace.settings y expone flags ────────
// Cualquier componente que quiera saber si está en modo demo (o si tiene
// que ocultar X feature) consulta window.DemoMode.flag('hide_beonai').
// Cuando settings.demo_mode === true se aplican TODOS los hide/rename del
// preset · cada flag individual permite override granular para casos
// futuros sin entrar en modo demo completo.
(function(){
  function _ws() {
    return (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || null;
  }
  function _settings() {
    const w = _ws();
    return (w && w.settings) || {};
  }
  // Detección por slug/nombre · si el workspace se llama "...demo" asumimos
  // demo_mode aunque la flag explícita en settings no esté seteada.
  function _slugSuggestsDemo() {
    const w = _ws();
    if (!w) return false;
    const slug = String(w.slug || '').toLowerCase();
    const name = String(w.name || '').toLowerCase();
    return slug.indexOf('demo') !== -1 || name.indexOf('demo') !== -1;
  }
  // Detección por URL (?ws=*demo*) · cubre el caso en que window.Workspaces
  // todavía no ha resuelto el workspace activo (race condition al boot).
  function _urlSuggestsDemo() {
    try {
      const urlWs = String(new URLSearchParams(window.location.search).get('ws') || '').toLowerCase();
      if (urlWs.indexOf('demo') !== -1) return true;
    } catch (e) {}
    return false;
  }
  function _isDemoActive() {
    // ORDEN de evaluación · cada nivel puede activar o desactivar el demo
    // independientemente. El target es:
    //   ADMIN     → siempre plataforma completa (Analytics, BeonAI, Recursos)
    //   NON-ADMIN → siempre experiencia simplificada estilo demo
    //   URL con "demo" → fuerza demo (permite a admin testear como user)
    //   settings.demo_mode explícito → override (gana sobre todo lo demás)

    // 1) Settings override · si está seteado boolean, gana
    const s = _settings();
    if (s.demo_mode === true)  return true;
    if (s.demo_mode === false) return false;

    // 2) URL con "demo" · permite a admin testear la experiencia
    if (_urlSuggestsDemo()) return true;
    if (_slugSuggestsDemo()) return true;

    // 3) Default por rol · admin → completa · user → demo simplificada
    // Esto convierte "demo UX" en la experiencia de usuario final por
    // defecto en cualquier workspace de la plataforma, manteniendo
    // analytics/IA/recursos solo para admins.
    try {
      const profile = (window.UserProfile && window.UserProfile.get && window.UserProfile.get()) || null;
      const sess    = (window.Auth && window.Auth.currentUser && window.Auth.currentUser()) || null;
      const isAdmin = !!(
        (profile && (profile.isAdmin || profile.systemRole === 'admin')) ||
        (sess && (sess.isAdmin || sess.systemRole === 'admin'))
      );
      return !isAdmin;
    } catch (e) {
      return false;
    }
  }
  // Si demo_mode está activo · estos son los valores por defecto que
  // aplican aunque la flag individual no esté en settings. El admin puede
  // anular cualquiera setándola explícitamente a false.
  const DEMO_PRESET = {
    hide_beonai: true,
    hide_analytics: true,
    hide_resources: true,
    hide_recommendations: true,
    hide_durations: true,
    hide_attribution: true,
    simplified_avatar_menu: true,
    simplified_settings: true,
    simplified_profile: true,
    lock_unassigned_courses: true,
    path_label: 'Curso',
    path_label_plural: 'Cursos',
    brief_diario_label: 'Brief Diario',
    workshops_label: 'Inscríbete a talleres',
    catalog_label: 'Catálogo',
    hero_title_label: 'Más presentaciones eficaces',
    catalog_subheader: 'Sigue formándote',
    my_list_label: 'Mi Lista',
    paths_recommended_label: 'Recomendados para ti',
    paths_recommended_sub: 'según tu rol',
    new_row_title: 'Próximamente',
    new_row_sub: '',
    channels_action_label: 'Activar',
    level_badges: ['Básico','Intermedio','Experto'],
  };
  window.DemoMode = {
    isActive: _isDemoActive,
    flag: function(name) {
      const s = _settings();
      // Override explícito en settings tiene prioridad
      if (name in s) return s[name];
      // Si demo está activo (por flag o por slug) · usa preset
      if (_isDemoActive() && name in DEMO_PRESET) return DEMO_PRESET[name];
      return undefined;
    },
    label: function(name, fallback) {
      const v = window.DemoMode.flag(name);
      // BUG fix · cadena vacía '' es un override válido (intencionalmente
      // vacío para ocultar el sub de una row, p.ej. new_row_sub). Antes
      // se caía al fallback porque `&& v` la trataba como falsy.
      return (typeof v === 'string') ? v : fallback;
    },
    unlocked: function() {
      // Lista de slugs de paths abiertos · si está vacía y
      // lock_unassigned_courses=true, TODO está cerrado
      const v = window.DemoMode.flag('unlocked_paths');
      return Array.isArray(v) ? v : [];
    },
    debug: function() {
      // Útil desde la consola del navegador: window.DemoMode.debug()
      const w = _ws();
      const out = {
        isActive: window.DemoMode.isActive(),
        urlSuggestsDemo: _urlSuggestsDemo(),
        slugSuggestsDemo: _slugSuggestsDemo(),
        workspace: w ? { id: w.id, name: w.name, slug: w.slug, settings: w.settings || {} } : null,
        urlWs: new URLSearchParams(window.location.search).get('ws'),
        htmlDataDemoMode: document.documentElement.getAttribute('data-demo-mode'),
        htmlDataTheme: document.documentElement.getAttribute('data-theme'),
      };
      console.table(out);
      return out;
    },
  };
})();


// ── Branding por workspace (Fase 1 multi-tenant) ─────────────────────────
// Cada workspace puede tener su propio logo y color accent. Cuando cambia
// el workspace activo, aplicamos su branding: --accent en el CSS root y
// window.WORKSPACE_LOGO_URL / NAME que consume el componente Wordmark.
// Fallback: BeonIt logo + accent violeta de la plataforma.
function _normalizeWorkspaceBranding(ws) {
  if (!ws) return null;
  // Acepta camelCase (modo demo localStorage) y snake_case (filas Supabase)
  return {
    id: ws.id,
    name: ws.name || '',
    logoUrl: ws.logoUrl || ws.logo_url || ws.logo || null,
    primaryColor: ws.primaryColor || ws.primary_color || '#6E50EE',
  };
}
// Convierte #RRGGBB a {h,s,l} 0-1. Suficientemente robusto para derivar
// hover/deep/glow del color principal del workspace sin librerías externas.
function _hexToHsl(hex) {
  var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').toString());
  if (!m) return null;
  var r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h, s: s, l: l };
}
function _hslToHex(h, s, l) {
  function f(n) {
    var k = (n + h * 12) % 12;
    var a = s * Math.min(l, 1 - l);
    var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  }
  return '#' + f(0) + f(8) + f(4);
}
function _shadeHex(hex, deltaL) {
  var hsl = _hexToHsl(hex);
  if (!hsl) return hex;
  var l = Math.max(0, Math.min(1, hsl.l + deltaL));
  return _hslToHex(hsl.h, hsl.s, l);
}
function _hexToRgba(hex, alpha) {
  var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').toString());
  if (!m) return 'rgba(110,80,238,' + alpha + ')';
  return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + alpha + ')';
}

function applyWorkspaceBranding() {
  try {
    var ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
    var b = _normalizeWorkspaceBranding(ws);
    if (b) {
      // Spec del cliente (b115+) · TODOS los workspaces usan exactamente
      // los mismos colores de plataforma (paleta Udacity navy + cobalt +
      // cream del :root). El primaryColor del workspace ya NO se aplica
      // ni siquiera al "dot" del topnav · el dot usa var(--accent) global.
      // Solo el logo y el nombre del workspace varían por tenant.
      window.WORKSPACE_LOGO_URL = b.logoUrl || null;
      window.WORKSPACE_NAME = b.name;
      window.WORKSPACE_DOT_COLOR = null;
    } else {
      // Sin workspace activo (login screen) · todos los valores limpios
      window.WORKSPACE_LOGO_URL = null;
      window.WORKSPACE_NAME = '';
      window.WORKSPACE_DOT_COLOR = null;
    }
    window.dispatchEvent(new Event('workspace-branding-changed'));
  } catch(e) { /* ignore */ }
}
window.applyWorkspaceBranding = applyWorkspaceBranding;
// Reaplica el branding cuando: cambia el workspace activo, la lista de
// workspaces o el usuario logueado (puede cambiar qué workspaces ve).
['workspace-changed','workspaces-changed','auth-changed','sgson-backend-ready']
  .forEach(function(ev){ window.addEventListener(ev, applyWorkspaceBranding); });
// Primer apply tras que el DOM esté listo
if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  setTimeout(applyWorkspaceBranding, 0);
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(applyWorkspaceBranding, 0); });
}

// ── Resources · documentos externos (Loop, SharePoint, PDFs) ──────────────
// El user los ve como cards dentro de Solid pero el click abre la URL en
// pestaña nueva. CRUD local-first con sync opcional a Supabase si está activo.
const Resources = (function() {
  function _key() {
    const ws = window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId();
    return ws ? 'sgson-resources:' + ws : 'sgson-resources';
  }
  function _load() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch (e) { return []; } }
  function _save(items) {
    localStorage.setItem(_key(), JSON.stringify(items));
    window.dispatchEvent(new Event('resources-changed'));
  }
  function list() { return _load().slice().sort((a,b) => (a.order_index || 0) - (b.order_index || 0)); }
  function get(id) { return _load().find(r => r.id === id) || null; }
  function _genId() { return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function create(data) {
    const items = _load();
    const ws = window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId();
    const r = {
      id: _genId(),
      workspace_id: ws || null,
      title: String(data.title || '').trim(),
      description: String(data.description || '').trim(),
      url: String(data.url || '').trim(),
      category: String(data.category || '').trim(),
      thumbnail_url: data.thumbnail_url || null,
      source: data.source || 'other',
      order_index: items.length,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    if (!r.title || !r.url) throw new Error('Título y URL son obligatorios');
    items.push(r);
    _save(items);
    return r;
  }
  function update(id, patch) {
    const items = _load();
    const i = items.findIndex(r => r.id === id);
    if (i < 0) return null;
    items[i] = Object.assign({}, items[i], patch, { updated_at: Date.now() });
    _save(items);
    return items[i];
  }
  function remove(id) {
    const items = _load().filter(r => r.id !== id);
    _save(items);
  }
  function reorder(orderedIds) {
    const items = _load();
    const byId = Object.fromEntries(items.map(r => [r.id, r]));
    const reordered = orderedIds.map((id, i) => byId[id] ? Object.assign({}, byId[id], { order_index: i }) : null).filter(Boolean);
    _save(reordered);
  }
  return { list, get, create, update, remove, reorder };
})();
window.Resources = Resources;

// ── PushNotifications · Web Push API · suscripción + envío ─────────────────
// Gestión completa de notificaciones push del navegador. El SW ya tiene listener
// `push` que muestra la notificación · este store maneja el lifecycle:
//   1. Pedir permiso al usuario.
//   2. Crear PushSubscription con VAPID public key.
//   3. Enviar la subscription al backend (Supabase si activo, localStorage si demo).
//   4. Listar / borrar suscripciones.
const PushNotifications = (function() {
  // VAPID public key · se obtiene desde /api/config (configurado server-side).
  // En modo demo sin VAPID, push solo funciona como showNotification local.
  function _vapidKey() { return window.VAPID_PUBLIC_KEY || null; }

  function isSupported() {
    return typeof window !== 'undefined'
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  }

  function permission() {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  }

  // Convierte base64url → Uint8Array (formato requerido por PushManager.subscribe)
  function _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function getRegistration() {
    if (!isSupported()) return null;
    try { return await navigator.serviceWorker.ready; } catch(e) { return null; }
  }

  async function getSubscription() {
    const reg = await getRegistration();
    if (!reg) return null;
    return reg.pushManager.getSubscription();
  }

  async function subscribe() {
    if (!isSupported()) return { error:'not-supported' };
    if (permission() === 'denied') return { error:'denied' };

    // Pedir permiso si aún no se otorgó
    if (permission() === 'default') {
      const r = await Notification.requestPermission();
      if (r !== 'granted') return { error:'permission-denied' };
    }

    const reg = await getRegistration();
    if (!reg) return { error:'no-service-worker' };

    // Si ya hay suscripción, devolverla
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const vapid = _vapidKey();
      if (!vapid) {
        // Sin VAPID el server no puede enviar push; solo notifs locales funcionarán
        if (window.Toast) window.Toast.info('Permiso concedido · push del servidor no configurado', { icon:'🔔' });
        return { warning:'no-vapid-key', subscription: null };
      }
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: _urlBase64ToUint8Array(vapid),
        });
      } catch (e) {
        console.warn('[push] subscribe failed', e);
        return { error:'subscribe-failed', message: e.message };
      }
    }

    await _persistSubscription(sub);
    if (window.Toast) window.Toast.success('Notificaciones push activadas', { icon:'🔔' });
    window.dispatchEvent(new CustomEvent('push-subscribed', { detail: sub }));
    return { subscription: sub };
  }

  async function unsubscribe() {
    const sub = await getSubscription();
    if (!sub) return { ok:true };
    try {
      await sub.unsubscribe();
      await _deleteSubscription(sub.endpoint);
      if (window.Toast) window.Toast.info('Notificaciones push desactivadas');
      window.dispatchEvent(new Event('push-unsubscribed'));
      return { ok:true };
    } catch (e) { return { error:'unsubscribe-failed', message: e.message }; }
  }

  // Persiste la subscription · Supabase si activo, sino localStorage.
  async function _persistSubscription(sub) {
    const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
    const wsId = window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId();
    if (!u) return;
    const payload = {
      endpoint: sub.endpoint,
      keys: sub.toJSON && sub.toJSON().keys,
      user_id: u.id,
      workspace_id: wsId,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    };
    if (window.SGSON_BACKEND === 'supabase' && window.supabaseClient) {
      const { error } = await window.supabaseClient.from('push_subscriptions').upsert(payload, { onConflict: 'endpoint' });
      if (error) console.warn('[push] persist', error.message);
    } else {
      const key = 'solid-push-subs:' + u.id;
      let arr = []; try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
      if (!arr.find(x => x.endpoint === sub.endpoint)) arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr));
    }
  }

  async function _deleteSubscription(endpoint) {
    const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
    if (!u) return;
    if (window.SGSON_BACKEND === 'supabase' && window.supabaseClient) {
      await window.supabaseClient.from('push_subscriptions').delete().eq('endpoint', endpoint);
    } else {
      const key = 'solid-push-subs:' + u.id;
      let arr = []; try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
      localStorage.setItem(key, JSON.stringify(arr.filter(x => x.endpoint !== endpoint)));
    }
  }

  // Envía una notif de PRUEBA local · usa showNotification del SW directamente
  async function sendTestLocal() {
    if (permission() !== 'granted') return { error:'no-permission' };
    const reg = await getRegistration();
    if (!reg) return { error:'no-service-worker' };
    await reg.showNotification('SolidStream · Test local', {
      body: 'Esta es una notificación push de prueba enviada localmente desde tu navegador.',
      icon: '/beonit-logo.png',
      badge: '/beonit-logo.png',
      tag: 'solid-test',
      data: { url: '/' },
    });
    return { ok: true };
  }

  // Envía via servidor (si endpoint /api/push-send está activo)
  async function sendTestRemote() {
    const sub = await getSubscription();
    if (!sub) return { error:'no-subscription' };
    try {
      let _t = '';
      try {
        if (window.supabaseClient && window.supabaseClient.auth) {
          const { data } = await window.supabaseClient.auth.getSession();
          _t = (data && data.session && data.session.access_token) || '';
        }
      } catch (e) {}
      const r = await fetch('/api/push-send', {
        method:'POST', headers:{ 'Content-Type':'application/json', ...(_t ? { Authorization: 'Bearer ' + _t } : {}) },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          payload: { title:'SolidStream · Test', body:'Push del servidor recibido ✓', url:'/' },
        }),
      });
      if (!r.ok) return { error:'send-failed', status: r.status };
      return { ok: true };
    } catch(e) { return { error:'send-failed', message: e.message }; }
  }

  async function isActive() {
    if (!isSupported() || permission() !== 'granted') return false;
    const sub = await getSubscription();
    return !!sub;
  }

  return { isSupported, permission, subscribe, unsubscribe, getSubscription,
           sendTestLocal, sendTestRemote, isActive };
})();
window.PushNotifications = PushNotifications;

// ── Auth · gestor de sesión multi-usuario con rol admin ────────────────────
// Modelo "demo auth": guarda usuarios en localStorage, sesión local. Sin backend
// ni passwords reales — pensado para enseñar el flujo SaaS multi-usuario hoy
// y poderlo sustituir por Supabase / Auth0 / Azure AD en una sola capa.
const Auth = (function() {
  const USERS_KEY = 'sgson-users';
  const SESSION_KEY = 'sgson-session';
  const COLORS = ['var(--repsol-red)', 'var(--bn-blue)', 'var(--bn-lime)', 'var(--bn-orange)', 'var(--bn-purple)', 'var(--bn-turquoise)', 'var(--ink)'];

  function _load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (e) { return fallback; }
  }

  function listUsers() { return _load(USERS_KEY, []); }
  function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('auth-users-changed'));
  }

  function _genId() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function currentUserId() { return localStorage.getItem(SESSION_KEY); }
  function currentUser() {
    const id = currentUserId();
    if (!id) return null;
    return listUsers().find(function(u){ return u.id === id; }) || null;
  }
  function isAuthenticated() { return !!currentUser(); }
  function isAdmin() { var u = currentUser(); return !!(u && u.isAdmin); }

  // ── Sistema de 3 roles · admin · manager · user ──────────────────────────
  // - admin   · platform owner · gestiona usuarios + audit log + invita managers
  // - manager · líder de equipo · ve KPIs de equipo + invita users a su scope
  // - user    · alumno estándar · consume contenido + canales propios
  // Cualquier nivel inferior NO puede invocar acciones de nivel superior.
  // `isAdmin` legacy se mantiene como espejo: isAdmin === (systemRole === 'admin').
  const SYSTEM_ROLES = ['admin', 'manager', 'user'];
  function _inferSystemRole(data, users) {
    if (data.systemRole && SYSTEM_ROLES.indexOf(data.systemRole) >= 0) return data.systemRole;
    // Bootstrap: el primer usuario del sistema es admin para que alguien pueda arrancar
    if (data.isAdmin || users.length === 0) return 'admin';
    // Bootstrap: cualquier email @beonit.* es admin de plataforma (equipo BeonIt)
    if (/@beonit\./i.test(data.email)) return 'admin';
    // El resto arranca como 'user'. El rol funcional (Publish Agent, Content Lead…)
    // NO otorga privilegios de sistema — el admin promueve a manager/admin desde
    // el panel admin manualmente, decisión consciente, no heurística.
    return 'user';
  }
  function signup(data) {
    var users = listUsers();
    if (!data.email || !data.email.includes('@')) throw new Error('Email no válido');
    if (!data.name || data.name.trim().length < 2) throw new Error('Nombre demasiado corto');
    var existing = users.find(function(u){ return u.email === data.email.toLowerCase(); });
    if (existing) throw new Error('Ya existe un usuario con ese email');
    var systemRole = _inferSystemRole(data, users);
    var user = {
      id: _genId(),
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      role: data.role || '',                        // rol funcional · lo asigna el admin del workspace después
      systemRole: systemRole,                       // rol del sistema (admin/manager/user)
      team: data.team || '',
      avatarColor: data.avatarColor || COLORS[users.length % COLORS.length],
      // Espejo legacy para componentes que aún usan isAdmin
      isAdmin: systemRole === 'admin',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    users.push(user);
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    window.dispatchEvent(new Event('auth-changed'));
    return user;
  }

  function login(email) {
    var users = listUsers();
    var user = users.find(function(u){ return u.email === (email || '').toLowerCase(); });
    if (!user) throw new Error('No existe un usuario con ese email');
    user.lastLoginAt = Date.now();
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    window.dispatchEvent(new Event('auth-changed'));
    return user;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('auth-changed'));
  }

  function updateUser(id, patch) {
    var users = listUsers();
    var idx = users.findIndex(function(u){ return u.id === id; });
    if (idx < 0) return null;
    users[idx] = Object.assign({}, users[idx], patch);
    _saveUsers(users);
    if (users[idx].id === currentUserId()) {
      window.dispatchEvent(new Event('auth-changed'));
    }
    return users[idx];
  }

  function deleteUser(id) {
    var deletedUser = listUsers().find(function(u){ return u.id === id; });
    var users = listUsers().filter(function(u){ return u.id !== id; });
    _saveUsers(users);
    // Borrar también su storage namespaced en todos los formatos en uso:
    //   <prefix>:<id>                  (legacy pre-multi-tenant via _userScopedKey)
    //   <prefix>:<id>:<wsId>           (multi-tenant via _userScopedKey)
    //   <prefix>:<email>:<wsId>        (multi-tenant via _userKey local de stores)
    var email = deletedUser && deletedUser.email;
    Object.keys(localStorage).forEach(function(k){
      if (k.endsWith(':' + id)) localStorage.removeItem(k);
      // Match :id:anything (multi-tenant)
      else if (k.indexOf(':' + id + ':') >= 0) localStorage.removeItem(k);
      // Match :email:anything (multi-tenant via _userKey local)
      else if (email && k.indexOf(':' + email + ':') >= 0) localStorage.removeItem(k);
    });
    if (currentUserId() === id) logout();
  }

  function setAdmin(id, value) {
    return updateUser(id, { isAdmin: !!value, systemRole: value ? 'admin' : 'user' });
  }
  function setSystemRole(id, role) {
    if (SYSTEM_ROLES.indexOf(role) < 0) throw new Error('Rol inválido');
    return updateUser(id, { systemRole: role, isAdmin: role === 'admin' });
  }

  // ── Permission matrix · single source of truth ─────────────────────────
  // Llaves de acciones que requieren un rol mínimo.
  // El nivel `admin` engloba a `manager` y éste a `user`.
  const ROLE_LEVEL = { user: 0, manager: 1, admin: 2 };
  const PERMISSIONS = {
    // user
    'content.view':       'user',
    'content.bookmark':   'user',
    'content.rate':       'user',
    'channel.connectSelf':'user',
    'profile.edit':       'user',
    // manager (líder de equipo)
    'team.viewMembers':   'manager',
    'team.viewKpis':      'manager',
    'team.inviteUser':    'manager',
    'submissions.review': 'manager',
    'campaigns.create':   'manager',
    // admin (plataforma)
    'admin.viewPanel':    'admin',
    'admin.inviteAny':    'admin',
    'admin.bulkInvite':   'admin',
    'admin.changeRoles':  'admin',
    'admin.auditLog':     'admin',
    'admin.exportData':   'admin',
    'admin.platformKpis': 'admin',
  };
  function _migrateLegacyRole(u) {
    if (u && !u.systemRole) {
      // Migración: usuarios viejos sin systemRole. NO inferimos manager por el
      // rol funcional — eso era el bug. Sólo respetamos `isAdmin` explícito.
      u.systemRole = u.isAdmin ? 'admin' : 'user';
    }
    if (u && u.systemRole === 'admin') u.isAdmin = true;
    return u;
  }
  function currentSystemRole() {
    var u = currentUser();
    if (!u) return null;
    _migrateLegacyRole(u);
    return u.systemRole || 'user';
  }
  function can(action) {
    var u = currentUser();
    if (!u) return false;
    _migrateLegacyRole(u);
    var required = PERMISSIONS[action];
    if (!required) return false;
    // Fallback bootstrap: si el user tiene isAdmin=true (asignado por panel) o
    // su email es @beonit.* (equipo BeonIt), promueve a admin in-flight para
    // evitar "Acceso restringido" si systemRole no se persistió. Quitamos la
    // regla `/admin/i.test(email)` porque cualquier email con "admin" en él
    // (incluido `admin@cliente.com`) entraría como admin de plataforma sin
    // intención.
    if (u.isAdmin || /@beonit\./i.test(u.email || '')) {
      u.systemRole = 'admin';
    }
    return ROLE_LEVEL[u.systemRole] >= ROLE_LEVEL[required];
  }
  function hasRole(role) {
    var u = currentUser();
    if (!u) return false;
    _migrateLegacyRole(u);
    if (u.isAdmin || /@beonit\./i.test(u.email || '')) {
      u.systemRole = 'admin';
    }
    return ROLE_LEVEL[u.systemRole] >= ROLE_LEVEL[role];
  }

  // SaaS multi-cliente · NO sembrar usuarios demo. El primer login crea el
  // primer usuario (que pasa a admin de plataforma vía la regla @beonit.es).
  // Si listUsers() está vacío → la app muestra el LoginScreen y obliga a
  // crear cuenta. Antes esto creaba admin@beonit.com + amaia.ruiz@repsol.com
  // de forma automática, lo que saltaba el login y atascaba a usuarios reales
  // dentro de la sesión Amaya fantasma.
  function seedIfEmpty() { /* no-op intencional · SaaS no semilla usuarios */ }

  return {
    listUsers, currentUser, currentUserId, isAuthenticated, isAdmin,
    signup, login, logout, updateUser, deleteUser, setAdmin, seedIfEmpty,
    setSystemRole, currentSystemRole, can, hasRole, SYSTEM_ROLES, PERMISSIONS,
    USERS_KEY, SESSION_KEY,
  };
})();
window.Auth = Auth;

// ── InviteUsersModal · UI de invitación bulk ────────────────────────────────
function InviteUsersModal({ onClose }) {
  const [tab, setTab] = useSM('single'); // 'single' | 'bulk'
  const [email, setEmail] = useSM('');
  const [name, setName] = useSM('');
  const [role, setRole] = useSM('member');  // default invita como User
  // Team default · usa el nombre del workspace activo. El admin lo puede editar.
  const [team, setTeam] = useSM(() => {
    const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
    return ws ? ws.name : '';
  });
  const [csv, setCsv] = useSM('');
  const [result, setResult] = useSM(null);
  const [error, setError] = useSM('');

  const submitSingle = async (e) => {
    e && e.preventDefault();
    setError('');
    try {
      // En Supabase mode create es async (insert + RPC); en demo es sync.
      // await Promise.resolve() funciona en ambos casos.
      const inv = await Promise.resolve(Invitations.create({ email, name, role, team }));
      if (inv.duplicate) {
        setError('Ya existe un usuario o invitación pendiente con ese email.');
      } else {
        setResult({ created: [inv], skipped: [], errors: [] });
        if (window.Toast) window.Toast.success('Invitación creada · ' + inv.email, { icon: '✉' });
        setEmail(''); setName('');
      }
    } catch (err) { setError(err.message); }
  };
  const submitBulk = async () => {
    setError('');
    if (!csv.trim()) { setError('Pega los emails primero.'); return; }
    const r = await Promise.resolve(Invitations.bulkCreate(csv));
    setResult(r);
    if (window.Toast) {
      if (r.created.length > 0) window.Toast.success(r.created.length + ' invitaciones creadas', { icon: '✉' });
      if (r.errors.length > 0) window.Toast.error(r.errors.length + ' errores en el CSV');
    }
  };

  const copyInvite = (token) => {
    const url = Invitations.inviteUrl(token);
    navigator.clipboard.writeText(url).then(() => {
      if (window.Toast) window.Toast.success('Link copiado al portapapeles', { icon: '📋' });
    }).catch(() => {});
  };

  const sendInviteEmail = async (inv) => {
    if (!inv) return;
    const me = window.Auth && window.Auth.currentUser();
    const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
    let _t = '';
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data } = await window.supabaseClient.auth.getSession();
        _t = (data && data.session && data.session.access_token) || '';
      }
    } catch (e) {}
    try {
      const r = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(_t ? { Authorization: 'Bearer ' + _t } : {}) },
        body: JSON.stringify({
          email: inv.email,
          name: inv.name,
          token: inv.token,
          role: inv.role,
          team: inv.team,
          fromName: me ? me.name : '',
          workspaceName: ws ? ws.name : '',
          workspaceColor: ws ? (ws.primaryColor || ws.primary_color) : null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 503) {
          if (window.Toast) window.Toast.error('Email no configurado · usa "Copiar link" y compártelo a mano (o configura RESEND_API_KEY en Vercel)');
        } else {
          if (window.Toast) window.Toast.error('No se pudo enviar: ' + (data.error || r.status));
        }
        return;
      }
      if (window.Toast) window.Toast.success('Email enviado a ' + inv.email, { icon: '✉' });
    } catch (e) {
      if (window.Toast) window.Toast.error('Error de red enviando email');
    }
  };

  const csvSample = 'email,name,role,team\nana.garcia@empresa.com,Ana García,Manager,Marketing\njuan.perez@empresa.com,Juan Pérez,Analista,Operaciones';

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,18,38,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(640px, 96vw)', maxHeight:'92vh', overflowY:'auto', padding:28, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16}}>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-blue)', fontWeight:700, marginBottom:4}}>ADMIN · INVITAR USUARIOS</div>
            <h2 style={{margin:0, fontSize:22, fontFamily:'var(--sans)', letterSpacing:'-0.01em'}}>Añadir gente a la plataforma</h2>
            <p style={{fontSize:13, color:'var(--ink-3)', marginTop:8, marginBottom:0, lineHeight:1.5}}>
              Crea cuentas de antemano y comparte el link de invitación con cada persona. Cuando lo abran, harán signup con un click sin crear password.
            </p>
          </div>
          <button onClick={onClose} style={{flexShrink:0, width:32, height:32, borderRadius:8, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{display:'flex', gap:4, marginBottom:18, padding:4, background:'var(--paper-2)', borderRadius:10, width:'fit-content'}}>
          {[{id:'single', label:'Una a una'}, {id:'bulk', label:'Bulk (CSV)'}].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(''); }}
              style={{padding:'7px 14px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600,
                background: tab === t.id ? 'var(--paper)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none'}}>{t.label}</button>
          ))}
        </div>

        {tab === 'single' && (
          <form onSubmit={submitSingle}>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Email *</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" autoFocus
                style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
            </label>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Nombre</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ana López" style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
            </label>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14}}>
              <label>
                <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Rol</div>
                {/* Roles del workspace · valores tal como los usa
                    public.workspace_members (member/admin/owner) +
                    "manager" para líderes de equipo. Determinan qué
                    permisos tiene el user al entrar al workspace. */}
                <select value={role} onChange={e => setRole(e.target.value)} style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, background:'var(--paper)', boxSizing:'border-box'}}>
                  <option value="member">User · acceso a contenido y certificación</option>
                  <option value="manager">Manager · acceso a panel de equipo</option>
                  <option value="admin">Admin · gestiona contenido y miembros</option>
                </select>
              </label>
              <label>
                <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Equipo</div>
                <input value={team} onChange={e => setTeam(e.target.value)} style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
              </label>
            </div>
            {error && <div style={{padding:'9px 12px', background:'rgba(110,80,238,0.08)', border:'1px solid rgba(110,80,238,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5, marginBottom:12}}>{error}</div>}
            <button type="submit" className="btn glow" style={{width:'100%', justifyContent:'center'}}>Crear invitación →</button>
          </form>
        )}

        {tab === 'bulk' && (
          <div>
            <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>CSV · una línea por usuario</div>
            <div style={{fontSize:12, color:'var(--ink-3)', marginBottom:8}}>Formato: <code style={{fontFamily:'var(--mono)', fontSize:11, background:'var(--paper-2)', padding:'1px 5px', borderRadius:3}}>email,name,role,team</code> · primera línea cabecera opcional · separador coma o punto y coma</div>
            <textarea value={csv} onChange={e => setCsv(e.target.value)} rows="10" placeholder={csvSample} spellCheck={false}
              style={{width:'100%', padding:'12px 14px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--mono)', fontSize:12, outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.5}}/>
            <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center'}}>
              <button type="button" onClick={() => setCsv(csvSample)} style={{padding:'6px 12px', border:'1px solid var(--line)', borderRadius:8, background:'var(--paper-2)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-3)'}}>Pegar ejemplo</button>
              <button type="button" onClick={submitBulk} className="btn glow" style={{marginLeft:'auto'}}>Importar CSV →</button>
            </div>
            {error && <div style={{marginTop:12, padding:'9px 12px', background:'rgba(110,80,238,0.08)', border:'1px solid rgba(110,80,238,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5}}>{error}</div>}
          </div>
        )}

        {result && (
          <div style={{marginTop:18, padding:'14px 16px', background:'var(--paper-2)', borderRadius:10, border:'1px solid var(--line)'}}>
            <div style={{display:'flex', gap:18, marginBottom:12, fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase'}}>
              {result.created.length > 0 && <span style={{color:'var(--bn-lime-dark)', fontWeight:700}}>✓ {result.created.length} creadas</span>}
              {result.skipped.length > 0 && <span style={{color:'var(--bn-orange)'}}>↷ {result.skipped.length} duplicadas</span>}
              {result.errors.length > 0 && <span style={{color:'var(--repsol-red)'}}>✗ {result.errors.length} errores</span>}
            </div>
            {result.created.length > 0 && (
              <div style={{display:'flex', flexDirection:'column', gap:6, maxHeight:240, overflowY:'auto'}}>
                {result.created.map(inv => (
                  <div key={inv.token} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'var(--paper)', borderRadius:7, border:'1px solid var(--line)'}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12.5, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{inv.email}</div>
                      <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{inv.role} · {inv.team}</div>
                    </div>
                    <button onClick={() => sendInviteEmail(inv)} title="Enviar email de invitación"
                      style={{padding:'5px 10px', border:'1px solid var(--bn-lime)', borderRadius:6, background:'rgba(188,214,48,0.12)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-lime-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                      ✉ Enviar email
                    </button>
                    <button onClick={() => copyInvite(inv.token)} title="Copiar link de invitación"
                      style={{padding:'5px 10px', border:'1px solid var(--bn-blue)', borderRadius:6, background:'rgba(0,114,190,0.06)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-blue-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                      Copiar link
                    </button>
                  </div>
                ))}
              </div>
            )}
            {result.errors.length > 0 && (
              <div style={{marginTop:10, fontSize:11.5, color:'var(--repsol-red)', fontFamily:'var(--mono)'}}>
                {result.errors.map((e, i) => <div key={i}>L{i+1}: {e.error} → "{e.line}"</div>)}
              </div>
            )}
            {window.SGSON_BACKEND !== 'supabase' && (
              <div style={{marginTop:12, padding:'8px 10px', background:'rgba(243,165,37,0.1)', border:'1px solid rgba(243,165,37,0.3)', borderRadius:6, fontSize:11.5, color:'#7a4400', lineHeight:1.5}}>
                ⚠ <strong>Modo demo</strong>: los emails NO se envían realmente. Copia los links y compártelos manualmente. Activa Supabase + Resend para envío automático.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
window.InviteUsersModal = InviteUsersModal;

// ── SupabaseAuth · adapter Phase 2 ────────────────────────────────────────── · invitaciones masivas a la cohorte (CSV bulk + tokens) ────
// Modelo: el admin importa una lista de emails, cada uno se convierte en una
// pre-cuenta con status='invited' + token único. El usuario abre /?invite=<tok>
// y completa registro con un click. Funciona en demo mode (localStorage) y
// queda preparado para mandar emails reales (Resend/Postmark) cuando se active
// Supabase + función serverless con service_role en commit G.
const Invitations = (function() {
  const KEY = 'sgson-invitations'; // global a la plataforma (admin las gestiona)

  function _load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function _save(invs) { localStorage.setItem(KEY, JSON.stringify(invs)); window.dispatchEvent(new Event('invitations-changed')); }

  function _genToken() { return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function list() { return _load(); }
  function getByToken(token) { return _load().find(i => i.token === token); }
  function getByEmail(email) { return _load().find(i => i.email === (email || '').toLowerCase()); }

  // Crea una invitación · idempotente sobre email
  function create(data) {
    if (!data.email || !data.email.includes('@')) throw new Error('Email inválido: ' + data.email);
    const email = data.email.toLowerCase().trim();

    // Si el email ya tiene cuenta activa, no se invita
    if (window.Auth && window.Auth.listUsers().find(u => u.email === email)) {
      return { duplicate: true, email };
    }
    // Si ya tiene invitación pendiente, devolver la existente
    const existing = getByEmail(email);
    if (existing && existing.status === 'pending') return existing;

    const inv = {
      token: _genToken(),
      email,
      name: (data.name || '').trim() || email.split('@')[0],
      role: data.role || 'Publish Agent',
      team: data.team || 'Repsol',
      status: 'pending', // 'pending' | 'accepted' | 'expired'
      createdAt: Date.now(),
      acceptedAt: null,
      sentBy: window.Auth && window.Auth.currentUser() ? window.Auth.currentUser().email : null,
    };
    const all = _load();
    all.unshift(inv);
    _save(all);
    if (window.Activity) window.Activity.log('send_invite', { email: inv.email, role: inv.role });
    return inv;
  }

  // Procesa CSV: una línea por usuario · `email[,name][,role][,team]`
  function bulkCreate(csvText) {
    const results = { created: [], skipped: [], errors: [] };
    const lines = csvText.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      // Soporta cabecera "email,name,role,team" — la salta
      if (idx === 0 && /^email/i.test(line)) return;
      const parts = line.split(/[;,\t]/).map(p => p.trim());
      const data = { email: parts[0], name: parts[1], role: parts[2], team: parts[3] };
      try {
        const inv = create(data);
        if (inv.duplicate) results.skipped.push({ email: inv.email, reason: 'ya tiene cuenta o invitación' });
        else results.created.push(inv);
      } catch (err) {
        results.errors.push({ line, error: err.message });
      }
    });
    return results;
  }

  function inviteUrl(token) {
    const base = window.location.href.split('?')[0].split('#')[0];
    return base + '?invite=' + token;
  }

  function markAccepted(token) {
    const all = _load();
    const idx = all.findIndex(i => i.token === token);
    if (idx < 0) return null;
    all[idx].status = 'accepted';
    all[idx].acceptedAt = Date.now();
    _save(all);
    return all[idx];
  }

  function remove(token) { _save(_load().filter(i => i.token !== token)); }

  function resend(token) {
    const inv = getByToken(token);
    if (!inv) return null;
    // En demo no se envía email real, sólo devolvemos el link. La llamada real
    // a /api/send-invite vive en SupabaseSync.sendInviteEmail() cuando el
    // backend está activo.
    if (window.SGSON_BACKEND === 'supabase' && window.SupabaseSync && window.SupabaseSync.sendInviteEmail) {
      window.SupabaseSync.sendInviteEmail({ email: inv.email, token: inv.token }).catch(() => {});
    }
    return inv;
  }

  return { list, getByToken, getByEmail, create, bulkCreate, inviteUrl, markAccepted, remove, resend };
})();
window.Invitations = Invitations;

// ── SupabaseAuth adapter Phase 2 ────────────────────────────────────────────
function _activateSupabaseAuth() {
  if (!window.supabaseClient) return;
  const sb = window.supabaseClient;

  let cachedProfile = null;
  let usersCache = [];

  async function _loadProfile(userId) {
    if (!userId) return null;
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) { console.warn('[supa] loadProfile', error.message); return null; }
    if (!data) return null;
    return _mapProfileRow(data);
  }

  function _mapProfileRow(row) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role || 'Publish Agent',
      team: row.team || 'Repsol',
      avatarColor: row.avatar_color || 'var(--bn-blue)',
      avatarUrl: row.avatar_url || null,
      isAdmin: !!row.is_admin,
      systemRole: row.system_role || (row.is_admin ? 'admin' : 'user'),
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).getTime() : Date.now(),
    };
  }

  async function _loadAllUsers() {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: true });
    if (error) { console.warn('[supa] loadAllUsers', error.message); return []; }
    usersCache = (data || []).map(_mapProfileRow);
    return usersCache;
  }

  // Sobreescribir métodos de Auth
  Auth.reloadUsers = async function() {
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-users-changed'));
  };
  Auth.listUsers = function() { return usersCache; };
  Auth.currentUser = function() { return cachedProfile; };
  Auth.currentUserId = function() { return cachedProfile ? cachedProfile.id : null; };
  Auth.isAuthenticated = function() { return !!cachedProfile; };
  Auth.isAdmin = function() { return !!(cachedProfile && cachedProfile.isAdmin); };

  Auth.signup = async function(data) {
    if (!data.password || data.password.length < 6) throw new Error('Password de al menos 6 caracteres');
    // emailRedirectTo · explícito al origen actual (window.location.origin) ·
    // así Supabase NO usa el Site URL del Dashboard (que por defecto está en
    // http://localhost:3000 y rompe los emails de verificación en producción).
    // Cada deployment usa su propio origen automáticamente.
    const { data: authData, error } = await sb.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: (typeof window !== 'undefined' && window.location)
          ? window.location.origin + '/'
          : undefined,
        data: {
          name: data.name,
          role: data.role || '',
          team: data.team || '',
          avatar_color: data.avatarColor || 'var(--bn-blue)',
        },
      },
    });
    if (error) throw new Error(error.message);
    // El trigger handle_new_user crea el profile automáticamente
    if (authData.user) {
      cachedProfile = await _loadProfile(authData.user.id);
      await _loadAllUsers();
      window.dispatchEvent(new Event('auth-changed'));
      window.dispatchEvent(new Event('auth-users-changed'));
    }
    return cachedProfile;
  };

  Auth.login = async function(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    cachedProfile = await _loadProfile(data.user.id);
    await sb.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id);
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-changed'));
    return cachedProfile;
  };

  Auth.logout = async function() {
    await sb.auth.signOut();
    cachedProfile = null;
    window.dispatchEvent(new Event('auth-changed'));
  };

  Auth.updateUser = async function(id, patch) {
    const dbPatch = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.role !== undefined) dbPatch.role = patch.role;
    if (patch.team !== undefined) dbPatch.team = patch.team;
    if (patch.avatarColor !== undefined) dbPatch.avatar_color = patch.avatarColor;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.isAdmin !== undefined) dbPatch.is_admin = !!patch.isAdmin;
    if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl;
    if (patch.avatar_url !== undefined) dbPatch.avatar_url = patch.avatar_url;
    const { data, error } = await sb.from('profiles').update(dbPatch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    const mapped = _mapProfileRow(data);
    if (cachedProfile && cachedProfile.id === id) cachedProfile = mapped;
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-users-changed'));
    return mapped;
  };

  Auth.deleteUser = async function(id) {
    // En Supabase, borrar de auth.users requiere service_role. Desde el cliente
    // anon solo podemos borrar el profile (cascade limpia bookmarks/chats/etc).
    const { error } = await sb.from('profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    if (cachedProfile && cachedProfile.id === id) await Auth.logout();
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-users-changed'));
  };

  Auth.setAdmin = async function(id, value) { return Auth.updateUser(id, { isAdmin: !!value, systemRole: value ? 'admin' : 'user' }); };
  Auth.setSystemRole = async function(id, role) {
    if (Auth.SYSTEM_ROLES.indexOf(role) < 0) throw new Error('Rol inválido');
    return Auth.updateUser(id, { systemRole: role, isAdmin: role === 'admin' });
  };
  Auth.currentSystemRole = function() {
    var u = (typeof cachedProfile !== 'undefined' && cachedProfile) || (Auth.currentUser && Auth.currentUser());
    if (!u) return null;
    if (!u.systemRole) u.systemRole = u.isAdmin ? 'admin' : 'user';
    return u.systemRole;
  };
  Auth.can = function(action) {
    var u = Auth.currentUser && Auth.currentUser();
    if (!u) return false;
    if (!u.systemRole) u.systemRole = u.isAdmin ? 'admin' : 'user';
    var required = Auth.PERMISSIONS && Auth.PERMISSIONS[action];
    if (!required) return false;
    var LEVEL = { user:0, manager:1, admin:2 };
    return LEVEL[u.systemRole] >= LEVEL[required];
  };
  Auth.hasRole = function(role) {
    var u = Auth.currentUser && Auth.currentUser();
    if (!u) return false;
    if (!u.systemRole) u.systemRole = u.isAdmin ? 'admin' : 'user';
    var LEVEL = { user:0, manager:1, admin:2 };
    return LEVEL[u.systemRole] >= LEVEL[role];
  };

  Auth.seedIfEmpty = async function() {
    // Recupera la sesión activa de Supabase (si la hay)
    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) {
      cachedProfile = await _loadProfile(session.user.id);
    }
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-changed'));
    window.dispatchEvent(new Event('auth-users-changed'));

    // Listener de cambios de sesión (login/logout/token refresh)
    sb.auth.onAuthStateChange(async (event, sess) => {
      if (sess && sess.user) {
        cachedProfile = await _loadProfile(sess.user.id);
      } else {
        cachedProfile = null;
      }
      window.dispatchEvent(new Event('auth-changed'));
    });
  };

  console.log('[SolidStream] Auth → Supabase backend activo');
}

// ── SupabaseData adapter Phase 2 · Bookmarks/ChatHistory/Submissions/Inbox/RouteExams ──
// Cuando Supabase está activo, monkey-patcheamos todos los stores para que lean
// y escriban en la DB. Mantenemos los métodos síncronos para no tocar la UI:
// usamos un cache en memoria + sync background. Los eventos
// (bookmarks-changed, chats-changed, etc) siguen disparándose igual.
function _activateSupabaseData() {
  const sb = window.supabaseClient;
  if (!sb) return;
  const _uid = function(){ return window.Auth && window.Auth.currentUser() ? window.Auth.currentUser().id : null; };
  const _wsid = function(){ return window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId(); };

  // ── Bookmarks (scoped por workspace) ─────────────────────
  let bmCache = [];
  async function _loadBookmarks() {
    const u = _uid(); const w = _wsid(); if (!u) { bmCache = []; return; }
    let q = sb.from('bookmarks').select('pill_id').eq('user_id', u);
    if (w) q = q.eq('workspace_id', w);
    const { data, error } = await q;
    if (error) { console.warn('[supa] bookmarks', error.message); return; }
    bmCache = (data || []).map(r => r.pill_id);

    // En demo · si Julio no tiene bookmarks aún, sembramos algunos ejemplos
    // para que la sección Mi Playlist no salga vacía durante la demo.
    // Sembrado en memoria (no se persiste) · transparente para el cliente.
    try {
      // Solo workspace de demo · antes `/demo/i.test(href)` sembraba bookmarks
      // falsos a users reales si su URL contenía "demo" en cualquier parte.
      const _isDemoWs = !!(window.isDemoWorkspace && window.isDemoWorkspace());
      if (_isDemoWs && bmCache.length === 0) {
        const allPills = (window.PILLS || []).filter(p => p && p.id);
        // Cogemos las 3 primeras Tendencias + las 3 primeras pills de otros
        // cursos para que la lista tenga variedad.
        const tend = allPills.filter(p => /tendencias?/i.test(String(p.category||'')) || /^tendencia-/i.test(String(p.id||'')));
        const otros = allPills.filter(p => !tend.find(t => t.id === p.id));
        const sample = tend.slice(0, 3).concat(otros.slice(0, 3));
        bmCache = sample.map(p => p.id);
        // También bookmarkamos un par de cursos para "Cursos favoritos"
        const paths = (window.LEARNING_PATHS || window.PATHS || []).filter(x => x && x.id);
        bmCache = bmCache.concat(paths.slice(0, 2).map(p => p.id));
      }
    } catch (e) { /* tolerante */ }

    window.dispatchEvent(new Event('bookmarks-changed'));
  }
  Bookmarks.get = function() { return bmCache.slice(); };
  Bookmarks.has = function(id) { return bmCache.indexOf(id) >= 0; };
  Bookmarks.toggle = function(id) {
    const u = _uid(); const w = _wsid(); if (!u || !id) return false;
    const exists = bmCache.indexOf(id) >= 0;
    // Optimistic update con rollback si la DB falla (RLS, offline) · antes
    // los errores se tragaban y el bookmark "desaparecía" al recargar.
    const _onError = (err) => {
      const msg = (err && err.message) || 'error';
      // Rollback al estado previo
      if (exists) bmCache = [id].concat(bmCache);
      else bmCache = bmCache.filter(x => x !== id);
      window.dispatchEvent(new Event('bookmarks-changed'));
      if (window.Toast) window.Toast.error('No se pudo guardar el cambio · ' + msg);
    };
    if (exists) {
      bmCache = bmCache.filter(x => x !== id);
      let q = sb.from('bookmarks').delete().eq('user_id', u).eq('pill_id', id);
      if (w) q = q.eq('workspace_id', w);
      q.then(r => { if (r && r.error) _onError(r.error); });
    } else {
      bmCache = [id].concat(bmCache);
      sb.from('bookmarks').insert({ user_id: u, workspace_id: w, pill_id: id })
        .then(r => { if (r && r.error) _onError(r.error); });
    }
    window.dispatchEvent(new Event('bookmarks-changed'));
    return !exists;
  };
  Bookmarks.clear = function() {
    const u = _uid(); const w = _wsid(); if (!u) return;
    bmCache = [];
    let q = sb.from('bookmarks').delete().eq('user_id', u);
    if (w) q = q.eq('workspace_id', w);
    q.then(()=>{});
    window.dispatchEvent(new Event('bookmarks-changed'));
  };

  // ── Enrollments (cursos inscritos · scoped por workspace) ─────────
  // Antes solo localStorage → se perdían entre dispositivos. Ahora sync a la
  // tabla public.enrollments (mismo patrón que bookmarks). Requiere ejecutar
  // db/enrollments-table.sql en Supabase.
  let enrollCache = [];
  async function _loadEnrollments() {
    const u = _uid(); const w = _wsid(); if (!u) { enrollCache = []; return; }
    let q = sb.from('enrollments').select('path_id').eq('user_id', u);
    if (w) q = q.eq('workspace_id', w);
    const { data, error } = await q;
    if (error) { console.warn('[supa] enrollments', error.message); return; }
    enrollCache = (data || []).map(r => r.path_id);
    window.dispatchEvent(new Event('enrollments-changed'));
  }
  Enrollments.get = function() { return enrollCache.slice(); };
  Enrollments.has = function(id) { return enrollCache.indexOf(id) >= 0; };
  Enrollments.add = function(id) {
    const u = _uid(); const w = _wsid(); if (!u || !id) return false;
    if (enrollCache.indexOf(id) >= 0) return false;
    enrollCache = [id].concat(enrollCache);
    sb.from('enrollments').insert({ user_id: u, workspace_id: w, path_id: id })
      .then(r => {
        if (!r || !r.error) return;
        // 23505 = unique (ya existía · carrera) · 42P01 = tabla no creada todavía
        // (el admin no ha corrido db/enrollments-table.sql) → en ambos casos
        // mantenemos la inscripción en sesión y no molestamos con error.
        if (r.error.code === '23505' || r.error.code === '42P01') {
          if (r.error.code === '42P01') console.warn('[supa] enrollments · tabla no existe · ejecuta db/enrollments-table.sql para persistir');
          return;
        }
        // Error real (RLS, red) → rollback + aviso
        enrollCache = enrollCache.filter(x => x !== id);
        window.dispatchEvent(new Event('enrollments-changed'));
        if (window.Toast) window.Toast.error('No se pudo guardar la inscripción · ' + (r.error.message || ''));
      });
    window.dispatchEvent(new Event('enrollments-changed'));
    return true;
  };
  Enrollments.remove = function(id) {
    const u = _uid(); const w = _wsid(); if (!u || !id) return;
    enrollCache = enrollCache.filter(x => x !== id);
    let q = sb.from('enrollments').delete().eq('user_id', u).eq('path_id', id);
    if (w) q = q.eq('workspace_id', w);
    q.then(()=>{});
    window.dispatchEvent(new Event('enrollments-changed'));
  };
  Enrollments.toggle = function(id) {
    if (Enrollments.has(id)) { Enrollments.remove(id); return false; }
    Enrollments.add(id); return true;
  };
  Enrollments.clear = function() {
    const u = _uid(); const w = _wsid(); if (!u) return;
    enrollCache = [];
    let q = sb.from('enrollments').delete().eq('user_id', u);
    if (w) q = q.eq('workspace_id', w);
    q.then(()=>{});
    window.dispatchEvent(new Event('enrollments-changed'));
  };

  // ── Ratings (me gusta/no me gusta · scoped por workspace) ─────────
  // Antes solo localStorage (no cross-device, agregados falsos). Ahora sync a
  // la tabla public.ratings (ya existe en schema · RLS self-write + ws-read).
  let ratingsOwn = {};   // pill_id → stars (del usuario actual · para get/display)
  let ratingsAll = [];   // {pill_id, stars} del workspace · para agregados admin
  async function _loadRatings() {
    const u = _uid(); const w = _wsid(); if (!u) { ratingsOwn = {}; ratingsAll = []; return; }
    let qo = sb.from('ratings').select('pill_id, stars').eq('user_id', u);
    if (w) qo = qo.eq('workspace_id', w);
    const ro = await qo;
    if (!ro.error) { ratingsOwn = {}; (ro.data || []).forEach(r => { ratingsOwn[r.pill_id] = r.stars; }); }
    // Agregados del workspace (RLS ws-read permite leer todas)
    let qa = sb.from('ratings').select('pill_id, stars');
    if (w) qa = qa.eq('workspace_id', w);
    const ra = await qa;
    if (!ra.error) ratingsAll = ra.data || [];
    window.dispatchEvent(new Event('ratings-changed'));
  }
  Ratings.get = function(pillId) { return ratingsOwn[pillId] || 0; };
  Ratings.set = function(pillId, stars, opts) {
    const u = _uid(); const w = _wsid();
    // Exigimos workspace · con workspace_id NULL el ON CONFLICT del upsert no
    // deduplica (NULL ≠ NULL en UNIQUE) → filas de rating duplicadas y agregados
    // inflados. Sin workspace activo no escribimos.
    if (!u || !pillId || !w) return;
    const s = Math.max(0, Math.min(5, Math.round(stars)));
    if (s === 0) {
      delete ratingsOwn[pillId];
      let q = sb.from('ratings').delete().eq('user_id', u).eq('pill_id', pillId);
      if (w) q = q.eq('workspace_id', w);
      q.then(()=>{});
    } else {
      ratingsOwn[pillId] = s;
      sb.from('ratings').upsert({ user_id: u, workspace_id: w, pill_id: pillId, stars: s, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,workspace_id,pill_id' }).then(()=>{});
    }
    window.dispatchEvent(new CustomEvent('ratings-changed', { detail: { pillId, stars: s } }));
    if (window.Toast && !(opts && opts.silent)) {
      if (s === 0) window.Toast.info('Puntuación eliminada');
      else window.Toast.success('¡Gracias por tu puntuación: ' + s + ' estrella' + (s>1?'s':'') + '!', { icon: '★' });
    }
  };
  Ratings.aggregateForPill = function(pillId) {
    const stars = ratingsAll.filter(r => r.pill_id === pillId && r.stars).map(r => r.stars);
    if (stars.length === 0) return { avg: 0, count: 0, dist:[0,0,0,0,0] };
    const sum = stars.reduce((a,b)=>a+b,0); const dist=[0,0,0,0,0];
    stars.forEach(s => dist[s-1]++);
    return { avg: +(sum/stars.length).toFixed(2), count: stars.length, dist };
  };
  Ratings.globalStats = function() {
    let total=0, count=0; const dist=[0,0,0,0,0]; const byPill={};
    ratingsAll.forEach(r => {
      if (!r.stars) return; total += r.stars; count++; dist[r.stars-1]++;
      if (!byPill[r.pill_id]) byPill[r.pill_id] = { sum:0, count:0 };
      byPill[r.pill_id].sum += r.stars; byPill[r.pill_id].count += 1;
    });
    const top = Object.keys(byPill).map(pid => ({ pillId: pid, avg: +(byPill[pid].sum/byPill[pid].count).toFixed(2), count: byPill[pid].count })).sort((a,b)=>b.avg-a.avg);
    return { avg: count>0 ? +(total/count).toFixed(2) : 0, count, dist, top };
  };
  Ratings.seedIfEmpty = function() {/* no-op en Supabase · datos reales */};

  // ── Notes (timestamped video notes · scoped user+workspace) ─────────
  // Requiere db/notes-table.sql (tabla public.notes con RLS self).
  let notesCache = [];
  async function _loadNotes() {
    const u = _uid(); const w = _wsid(); if (!u) { notesCache = []; return; }
    let q = sb.from('notes').select('id, pill_id, pill_title, at_seconds, text, created_at, updated_at')
      .eq('user_id', u).order('created_at', { ascending: false }).limit(2000);
    if (w) q = q.eq('workspace_id', w);
    const { data, error } = await q;
    if (error) { console.warn('[supa] notes', error.message); return; }
    notesCache = (data || []).map(r => ({
      id: r.id, pillId: r.pill_id, pillTitle: r.pill_title || '',
      atSeconds: r.at_seconds || 0, text: r.text || '',
      createdAt: new Date(r.created_at).getTime(),
      updatedAt: new Date(r.updated_at).getTime(),
    }));
    window.dispatchEvent(new Event('notes-changed'));
  }
  Notes.listAll = function() { return notesCache.slice(); };
  Notes.listFor = function(pillId) { return notesCache.filter(n => n.pillId === pillId).sort((a, b) => (a.atSeconds || 0) - (b.atSeconds || 0)); };
  Notes.add = function(pillId, atSeconds, text, pillTitle) {
    const u = _uid(); const w = _wsid(); if (!u || !pillId || !text || !text.trim()) return null;
    const localId = 'tmp_' + Date.now().toString(36);
    const n = {
      id: localId, pillId, pillTitle: pillTitle || '',
      atSeconds: Math.max(0, Math.round(atSeconds || 0)),
      text: text.trim(), createdAt: Date.now(), updatedAt: Date.now(),
    };
    notesCache = [n].concat(notesCache);
    window.dispatchEvent(new Event('notes-changed'));
    sb.from('notes').insert({
      user_id: u, workspace_id: w,
      pill_id: pillId, pill_title: pillTitle || null,
      at_seconds: n.atSeconds, text: n.text,
    }).select().single().then(({ data, error }) => {
      if (error) {
        if (error.code === '42P01') console.warn('[supa] notes · tabla no existe · ejecuta db/notes-table.sql');
        else if (window.Toast) window.Toast.error('No se pudo guardar la nota · ' + error.message);
        notesCache = notesCache.filter(x => x.id !== localId);
        window.dispatchEvent(new Event('notes-changed'));
        return;
      }
      const i = notesCache.findIndex(x => x.id === localId);
      if (i >= 0) {
        notesCache[i] = Object.assign({}, notesCache[i], {
          id: data.id,
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
        });
        window.dispatchEvent(new Event('notes-changed'));
      }
    });
    return n;
  };
  Notes.update = function(id, patch) {
    const i = notesCache.findIndex(x => x.id === id);
    if (i < 0) return null;
    notesCache[i] = Object.assign({}, notesCache[i], patch, { updatedAt: Date.now() });
    const dbPatch = {};
    if (patch.text !== undefined) dbPatch.text = patch.text;
    if (patch.atSeconds !== undefined) dbPatch.at_seconds = patch.atSeconds;
    if (String(id).startsWith('tmp_')) {
      window.dispatchEvent(new Event('notes-changed'));
      return notesCache[i];
    }
    sb.from('notes').update(dbPatch).eq('id', id).then(() => {});
    window.dispatchEvent(new Event('notes-changed'));
    return notesCache[i];
  };
  Notes.remove = function(id) {
    notesCache = notesCache.filter(x => x.id !== id);
    if (!String(id).startsWith('tmp_')) sb.from('notes').delete().eq('id', id).then(() => {});
    window.dispatchEvent(new Event('notes-changed'));
  };
  Notes.clear = function() {
    const u = _uid(); const w = _wsid(); if (!u) return;
    notesCache = [];
    let q = sb.from('notes').delete().eq('user_id', u);
    if (w) q = q.eq('workspace_id', w);
    q.then(() => {});
    window.dispatchEvent(new Event('notes-changed'));
  };

  // ── LearningPlans (plan IA · 1 por user+workspace) ─────────
  // Requiere db/learning-plans-table.sql (tabla public.learning_plans).
  let planCache = null;
  async function _loadLearningPlan() {
    const u = _uid(); const w = _wsid(); if (!u || !w) { planCache = null; return; }
    const { data, error } = await sb.from('learning_plans')
      .select('id, title, weeks, generated_at, updated_at')
      .eq('user_id', u).eq('workspace_id', w).maybeSingle();
    if (error) { console.warn('[supa] learning_plans', error.message); return; }
    planCache = data ? {
      id: data.id, title: data.title, weeks: data.weeks || [],
      generatedAt: new Date(data.generated_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    } : null;
    window.dispatchEvent(new Event('learning-plan-changed'));
  }
  LearningPlans.get = function() { return planCache; };
  LearningPlans.set = function(plan) {
    const u = _uid(); const w = _wsid(); if (!u || !w) return null;
    const now = Date.now();
    const p = Object.assign({}, plan, { generatedAt: plan.generatedAt || now, updatedAt: now });
    planCache = p;
    window.dispatchEvent(new Event('learning-plan-changed'));
    // upsert por (user_id, workspace_id)
    sb.from('learning_plans').upsert({
      user_id: u, workspace_id: w,
      title: p.title || 'Mi plan de aprendizaje',
      weeks: p.weeks || [],
      generated_at: new Date(p.generatedAt).toISOString(),
      updated_at: new Date(p.updatedAt).toISOString(),
    }, { onConflict: 'user_id,workspace_id' }).then(({ error }) => {
      if (error) {
        if (error.code === '42P01') console.warn('[supa] learning_plans · tabla no existe · ejecuta db/learning-plans-table.sql');
        else if (window.Toast) window.Toast.error('No se pudo guardar el plan · ' + error.message);
      }
    });
    return p;
  };
  LearningPlans.toggleItem = function(weekIdx, itemIdx) {
    if (!planCache || !planCache.weeks || !planCache.weeks[weekIdx]) return null;
    const w = planCache.weeks[weekIdx];
    if (!w.items || !w.items[itemIdx]) return null;
    w.items[itemIdx].done = !w.items[itemIdx].done;
    planCache.updatedAt = Date.now();
    window.dispatchEvent(new Event('learning-plan-changed'));
    LearningPlans.set(planCache);
    return planCache;
  };
  LearningPlans.clear = function() {
    const u = _uid(); const w = _wsid(); if (!u || !w) return;
    planCache = null;
    window.dispatchEvent(new Event('learning-plan-changed'));
    sb.from('learning_plans').delete().eq('user_id', u).eq('workspace_id', w).then(() => {});
  };

  // ── RouteExams ────────────────────────────────────────────
  let reCache = {};
  async function _loadRouteExams() {
    const u = _uid(); if (!u) { reCache = {}; return; }
    const { data, error } = await sb.from('route_exams').select('*').eq('user_id', u);
    if (error) { console.warn('[supa] route_exams', error.message); return; }
    reCache = {};
    (data || []).forEach(r => {
      reCache[r.route_id] = { score: r.score, total: r.total, passed: r.passed, completedAt: new Date(r.completed_at).getTime() };
    });
    window.dispatchEvent(new Event('exams-changed'));
  }
  RouteExams.get = function(routeId) { return reCache[routeId] || null; };
  RouteExams.getAll = function() { return Object.assign({}, reCache); };
  RouteExams.record = function(routeId, score, total, passed) {
    const u = _uid(); if (!u) return;
    reCache[routeId] = { score, total, passed, completedAt: Date.now() };
    sb.from('route_exams').upsert({ user_id: u, route_id: routeId, score, total, passed, completed_at: new Date().toISOString() }).then(()=>{});
    window.dispatchEvent(new Event('exams-changed'));
  };
  RouteExams.reset = function(routeId) {
    const u = _uid(); if (!u) return;
    delete reCache[routeId];
    sb.from('route_exams').delete().eq('user_id', u).eq('route_id', routeId).then(()=>{});
    window.dispatchEvent(new Event('exams-changed'));
  };

  // ── ChatHistory ────────────────────────────────────────────
  let chatsCache = [];
  let activeIdCache = null;
  async function _loadChats() {
    const u = _uid(); if (!u) { chatsCache = []; return; }
    const { data: convs, error } = await sb.from('conversations').select('*').eq('user_id', u).order('updated_at', { ascending: false });
    if (error) { console.warn('[supa] conversations', error.message); return; }
    if (!convs || convs.length === 0) { chatsCache = []; window.dispatchEvent(new Event('chats-changed')); return; }
    // Carga mensajes de todas las conversaciones en una sola query
    const ids = convs.map(c => c.id);
    const { data: msgs } = await sb.from('messages').select('*').in('conversation_id', ids).order('created_at', { ascending: true });
    const byConv = {};
    (msgs || []).forEach(m => { (byConv[m.conversation_id] = byConv[m.conversation_id] || []).push({ role: m.role, text: m.content }); });
    chatsCache = convs.map(c => ({
      id: c.id, title: c.title,
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.updated_at).getTime(),
      messages: byConv[c.id] || [],
    }));
    window.dispatchEvent(new Event('chats-changed'));
  }
  ChatHistory.list = function() { return chatsCache.slice(); };
  ChatHistory.get = function(id) { return chatsCache.find(c => c.id === id) || null; };
  ChatHistory.activeId = function() { return activeIdCache; };
  ChatHistory.setActive = function(id) { activeIdCache = id || null; window.dispatchEvent(new Event('chats-changed')); };
  // Remapeo tmp→real y cola de mensajes pendientes · evita la RACE en la que
  // appendMessage(tmpId) corría antes de que el insert async devolviera el id
  // real (mensaje perdido o conversation_id inválido en DB).
  let _convIdRemap = {};      // tmpId → realId
  let _pendingConvMsgs = {};  // tmpId → [msg,...] encolados mientras se crea la conv
  ChatHistory.create = function(initial) {
    const u = _uid(); if (!u) return null;
    const localId = 'tmp_' + Date.now().toString(36); // se reemplaza por el real
    const chat = { id: localId, title: 'Nueva conversación', createdAt: Date.now(), updatedAt: Date.now(), messages: initial || [] };
    chatsCache = [chat].concat(chatsCache);
    activeIdCache = localId;
    window.dispatchEvent(new Event('chats-changed'));
    sb.from('conversations').insert({ user_id: u, title: 'Nueva conversación' }).select().single().then(async ({ data, error }) => {
      if (error) { console.warn('[supa] create conv', error.message); return; }
      const realId = data.id;
      _convIdRemap[localId] = realId;
      const idx = chatsCache.findIndex(c => c.id === localId);
      if (idx >= 0) {
        chatsCache[idx].id = realId;
        chatsCache[idx].createdAt = new Date(data.created_at).getTime();
        chatsCache[idx].updatedAt = new Date(data.updated_at).getTime();
      }
      if (activeIdCache === localId) activeIdCache = realId;
      // Mensajes iniciales + los encolados mientras la conv no existía en DB
      const queued = (initial || []).concat(_pendingConvMsgs[localId] || []);
      if (queued.length > 0) {
        await sb.from('messages').insert(queued.map(m => ({ conversation_id: realId, role: m.role, content: m.text })));
      }
      // Sincroniza el título con el primer mensaje de usuario, si aplica
      const ci = chatsCache.findIndex(c => c.id === realId);
      if (ci >= 0 && chatsCache[ci].title && chatsCache[ci].title !== 'Nueva conversación') {
        sb.from('conversations').update({ title: chatsCache[ci].title, updated_at: new Date().toISOString() }).eq('id', realId).then(()=>{});
      }
      delete _pendingConvMsgs[localId];
      window.dispatchEvent(new Event('chats-changed'));
    });
    return chat;
  };
  ChatHistory.appendMessage = function(id, msg) {
    // Resuelve el id real si ya hubo remap; encuentra el chat por real o tmp.
    const realId = _convIdRemap[id] || id;
    let idx = chatsCache.findIndex(c => c.id === realId);
    if (idx < 0) idx = chatsCache.findIndex(c => c.id === id);
    if (idx < 0) return;
    chatsCache[idx].messages = (chatsCache[idx].messages || []).concat([msg]);
    chatsCache[idx].updatedAt = Date.now();
    const targetId = chatsCache[idx].id;            // ya remapeado en cache si resolvió
    const isTmp = String(targetId).startsWith('tmp_');
    if (chatsCache[idx].title === 'Nueva conversación' && msg.role === 'user') {
      chatsCache[idx].title = msg.text.slice(0, 50) + (msg.text.length > 50 ? '…' : '');
      if (!isTmp) sb.from('conversations').update({ title: chatsCache[idx].title, updated_at: new Date().toISOString() }).eq('id', targetId).then(()=>{});
    } else if (!isTmp) {
      sb.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', targetId).then(()=>{});
    }
    if (isTmp) {
      // La conversación aún no existe en DB · encola hasta que create resuelva.
      _pendingConvMsgs[id] = (_pendingConvMsgs[id] || []).concat([msg]);
    } else {
      sb.from('messages').insert({ conversation_id: targetId, role: msg.role, content: msg.text }).then(()=>{});
    }
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.update = function(id, patch) {
    // Resuelve tmp→real (igual que appendMessage) · sin esto, un update con id
    // temporal apuntaba a una fila inexistente en DB (no-op silencioso).
    const realId = _convIdRemap[id] || id;
    let idx = chatsCache.findIndex(c => c.id === realId);
    if (idx < 0) idx = chatsCache.findIndex(c => c.id === id);
    if (idx < 0) return;
    chatsCache[idx] = Object.assign({}, chatsCache[idx], patch, { updatedAt: Date.now() });
    const targetId = chatsCache[idx].id;
    if (String(targetId).startsWith('tmp_')) { window.dispatchEvent(new Event('chats-changed')); return; } // se sincroniza al resolver create
    const dbPatch = {};
    if (patch.title) dbPatch.title = patch.title;
    dbPatch.updated_at = new Date().toISOString();
    sb.from('conversations').update(dbPatch).eq('id', targetId).then(()=>{});
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.remove = function(id) {
    chatsCache = chatsCache.filter(c => c.id !== id);
    if (activeIdCache === id) activeIdCache = null;
    sb.from('conversations').delete().eq('id', id).then(()=>{});
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.getOrCreate = function() {
    if (activeIdCache && chatsCache.find(c => c.id === activeIdCache)) return chatsCache.find(c => c.id === activeIdCache);
    if (chatsCache.length > 0) { activeIdCache = chatsCache[0].id; return chatsCache[0]; }
    return ChatHistory.create();
  };

  // ── Submissions ────────────────────────────────────────────
  let subsCache = [];
  async function _loadSubmissions() {
    const u = _uid(); if (!u) { subsCache = []; return; }
    const me = window.Auth.currentUser();
    const isAdmin = me && me.isAdmin;
    let q = sb.from('submissions').select('*, profiles!submissions_user_id_fkey(name, email, avatar_color)').order('created_at', { ascending: false });
    if (!isAdmin) q = q.eq('user_id', u);
    const { data, error } = await q;
    if (error) { console.warn('[supa] submissions', error.message); return; }
    subsCache = (data || []).map(r => ({
      id: r.id, userId: r.user_id,
      userName: (r.profiles && r.profiles.name) || '—',
      userEmail: (r.profiles && r.profiles.email) || '—',
      userAvatarColor: (r.profiles && r.profiles.avatar_color) || 'var(--ink)',
      pillId: r.pill_id, pillTitle: r.pill_title,
      fileName: r.file_name, fileSize: r.file_size, durationSec: r.duration_sec,
      thumbDataUrl: r.thumb_url,
      filePath: r.file_path,
      status: r.status, feedback: r.feedback,
      submittedAt: new Date(r.submitted_at).getTime(),
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : null,
      reviewedBy: r.reviewed_by ? { id: r.reviewed_by } : null,
    }));
    window.dispatchEvent(new Event('submissions-changed'));
  }
  Submissions.listAll = function() { return subsCache.slice(); };
  Submissions.listByUser = function(uid) { return subsCache.filter(s => s.userId === uid); };
  Submissions.listByPill = function(pid) { return subsCache.filter(s => s.pillId === pid); };
  Submissions.listPending = function() { return subsCache.filter(s => s.status === 'pending'); };
  Submissions.get = function(id) { return subsCache.find(s => s.id === id) || null; };
  Submissions.getForUserAndPill = function(uid, pid) { return subsCache.find(s => s.userId === uid && s.pillId === pid) || null; };
  Submissions.submit = async function({ pillId, pillTitle, file, durationSec, thumbDataUrl, fileName, fileSize }) {
    const u = _uid(); if (!u) throw new Error('Necesitas iniciar sesión');
    if (durationSec > 600) throw new Error('Vídeo demasiado largo · máx 10 min');
    let filePath = null;
    if (file) {
      const ext = (fileName || file.name || 'video.mp4').split('.').pop();
      filePath = u + '/' + pillId + '_' + Date.now() + '.' + ext;
      const { error: upErr } = await sb.storage.from('pill-submissions').upload(filePath, file, { upsert: true });
      if (upErr) throw new Error('Error subiendo vídeo: ' + upErr.message);
    }
    const existing = subsCache.find(s => s.userId === u && s.pillId === pillId);
    const payload = {
      user_id: u, pill_id: pillId, pill_title: pillTitle,
      file_path: filePath || (existing && existing.filePath) || '',
      file_name: fileName, file_size: fileSize, duration_sec: durationSec,
      thumb_url: thumbDataUrl,
      status: 'pending', feedback: null, reviewed_at: null, reviewed_by: null,
      created_at: new Date().toISOString(),
      // Fix 7 · scoping multi-tenant: workspace_id necesario por schema/FK
      workspace_id: _wsid() || null,
    };
    let res;
    if (existing) res = await sb.from('submissions').update(payload).eq('id', existing.id).select().single();
    else res = await sb.from('submissions').insert(payload).select().single();
    if (res.error) throw new Error(res.error.message);
    await _loadSubmissions();
    return res.data;
  };
  Submissions.review = async function(id, status, feedback) {
    const me = window.Auth.currentUser();
    if (!me || !me.isAdmin) throw new Error('Solo admins pueden revisar');
    const { error } = await sb.from('submissions').update({
      status, feedback: feedback || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: me.id,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    // Notificar al user
    const sub = subsCache.find(s => s.id === id);
    if (sub) {
      await sb.from('inbox_messages').insert({
        category: 'notifications',
        user_id: sub.userId,
        text: 'Tu entrega de "' + sub.pillTitle + '" ha sido ' + (status === 'approved' ? 'APROBADA ✓' : 'rechazada — revisa el feedback'),
        kind: status, icon: status === 'approved' ? '✓' : '✗',
      });
    }
    await _loadSubmissions();
  };
  Submissions.remove = async function(id) {
    const sub = subsCache.find(s => s.id === id);
    if (sub && sub.filePath) {
      await sb.storage.from('pill-submissions').remove([sub.filePath]).catch(()=>{});
    }
    await sb.from('submissions').delete().eq('id', id);
    await _loadSubmissions();
  };

  // ── Inbox · usa tabla unificada inbox_messages con category filter ──────
  let inboxCache = { messages: [], notifications: [], releases: [] };
  async function _loadInbox() {
    const u = _uid(); if (!u) { inboxCache = { messages:[], notifications:[], releases:[] }; return; }
    const wsId = _wsid();
    // Una sola query · filtramos por categoría client-side. RLS limita por user_id.
    let q = sb.from('inbox_messages').select('*').eq('user_id', u).order('created_at', { ascending: false });
    if (wsId) q = q.eq('workspace_id', wsId);
    const { data, error } = await q;
    if (error) { console.warn('[supa] inbox', error.message); return; }
    const all = data || [];
    inboxCache.messages = all.filter(r => r.category === 'messages').map(r => ({
      id: r.id, from: r.from_label, subject: r.subject, body: r.body,
      createdAt: new Date(r.created_at).getTime(), read: r.read,
    }));
    inboxCache.notifications = all.filter(r => r.category === 'notifications').map(r => ({
      id: r.id, text: r.text, kind: r.kind, icon: r.icon, link: r.link,
      createdAt: new Date(r.created_at).getTime(), read: r.read,
    }));
    inboxCache.releases = all.filter(r => r.category === 'releases').map(r => ({
      id: r.id, version: r.version, title: r.subject || r.body, body: r.body,
      kind: r.kind, createdAt: new Date(r.created_at).getTime(), read: r.read,
    }));
    window.dispatchEvent(new Event('inbox-changed'));
  }
  Inbox.getAll = function() { return Object.assign({}, inboxCache); };
  Inbox.unreadCount = function(category) {
    if (category) return (inboxCache[category] || []).filter(i => !i.read).length;
    return inboxCache.messages.filter(i => !i.read).length + inboxCache.notifications.filter(i => !i.read).length;
  };
  Inbox.markRead = function(category, id) {
    if (category === 'releases') return; // release reads no se persisten en este modelo
    const list = inboxCache[category] || [];
    const item = list.find(x => x.id === id);
    if (item) {
      item.read = true;
      // Tabla unificada · filtramos por category
    const table = 'inbox_messages';
      sb.from(table).update({ read: true }).eq('id', id).then(()=>{});
      window.dispatchEvent(new Event('inbox-changed'));
    }
  };
  Inbox.markAllRead = function(category) {
    const u = _uid(); if (!u) return;
    if (category === 'releases') return;
    (inboxCache[category] || []).forEach(it => it.read = true);
    // Filtra por category Y workspace activo · antes era `.eq('user_id', u)`
    // sin más → marcaba leído TODO (mensajes, notificaciones, todos los
    // workspaces) silenciando avisos del resto de tenants.
    let q = sb.from('inbox_messages').update({ read: true })
      .eq('user_id', u).eq('category', category);
    const w = _wsid();
    if (w) q = q.eq('workspace_id', w);
    q.then(() => {});
    window.dispatchEvent(new Event('inbox-changed'));
  };
  Inbox.addNotification = function(text, opts) {
    const u = _uid(); if (!u) return;
    opts = opts || {};
    sb.from('inbox_messages').insert({
      category: 'notifications',
      user_id: u, workspace_id: _wsid() || null,
      text, kind: opts.kind || 'info',
      icon: opts.icon || '🔔', link: opts.link || null,
    }).then(() => _loadInbox());
  };
  Inbox.addMessage = function(from, subject, body, opts) {
    const u = _uid(); if (!u) return;
    opts = opts || {};
    sb.from('inbox_messages').insert({
      user_id: u, from_name: from, subject, body,
      is_admin: !!opts.fromAdmin, avatar_color: opts.fromAvatarColor,
    }).then(() => _loadInbox());
  };
  // Broadcast a miembros del workspace activo. Por defecto envía a TODOS;
  // pasar opts.userIds = [id1, id2, …] para filtrar a un subconjunto.
  // Solo callable por admins (la RLS del lado servidor impone el check real).
  // Inserta en una sola operación bulk para evitar N requests.
  Inbox.broadcastToWorkspace = async function(text, opts) {
    const w = _wsid(); if (!w) return { ok: false, error: 'no workspace' };
    opts = opts || {};
    const members = (window.Workspaces && window.Workspaces.membersOf) ? window.Workspaces.membersOf(w) : [];
    if (!members.length) return { ok: false, error: 'no members' };
    let targets = members;
    if (Array.isArray(opts.userIds) && opts.userIds.length) {
      const want = new Set(opts.userIds);
      targets = members.filter(m => want.has(m.user_id || m.id));
      if (!targets.length) return { ok: false, error: 'no targets match' };
    }
    const rows = targets.map(m => ({
      category: 'notifications',
      user_id: m.user_id || m.id,
      workspace_id: w,
      text, kind: opts.kind || 'info',
      icon: opts.icon || '🔔', link: opts.link || null,
    }));
    const { error } = await sb.from('inbox_messages').insert(rows);
    if (error) return { ok: false, error: error.message };
    await _loadInbox();
    return { ok: true, count: rows.length };
  };
  Inbox.deleteItem = function(category, id) {
    if (category === 'releases') return;
    inboxCache[category] = (inboxCache[category] || []).filter(x => x.id !== id);
    // Tabla unificada · filtramos por category
    const table = 'inbox_messages';
    sb.from(table).delete().eq('id', id).then(()=>{});
    window.dispatchEvent(new Event('inbox-changed'));
  };
  Inbox.seedIfEmpty = function() { _loadInbox(); /* el seed real viene del schema.sql */ };

  // ── Workspaces (multi-tenant · DB-backed) ────────────────
  let wsCache = [];
  let wsMembersCache = {}; // {workspaceId: [...users]}
  async function _loadWorkspaces() {
    const u = _uid(); if (!u) { wsCache = []; return; }
    // Lista los workspaces donde el user es member (RLS hace el resto)
    const { data: wss, error } = await sb.from('workspaces')
      .select('id, name, slug, logo_url, primary_color, owner_id, settings, archived_at, created_at');
    if (error) { console.warn('[supa] workspaces', error.message); return; }
    wsCache = (wss || []).map(w => ({
      id: w.id, name: w.name, slug: w.slug, logo: w.logo_url,
      primaryColor: w.primary_color, ownerId: w.owner_id,
      settings: w.settings || {},
      archivedAt: w.archived_at ? new Date(w.archived_at).getTime() : null,
      createdAt: w.created_at ? new Date(w.created_at).getTime() : Date.now(),
    }));
    window.dispatchEvent(new Event('workspaces-changed'));
  }
  async function _loadMembers(workspaceId) {
    if (!workspaceId) return;
    const { data, error } = await sb.from('workspace_members')
      .select('user_id, role, joined_at, profiles(id, email, name, role, system_role, team, avatar_color)')
      .eq('workspace_id', workspaceId);
    if (error) { console.warn('[supa] members', error.message); return; }
    wsMembersCache[workspaceId] = (data || []).map(row => Object.assign({}, row.profiles, {
      workspaceRole: row.role, joinedAt: row.joined_at ? new Date(row.joined_at).getTime() : Date.now(),
    }));
  }
  // Overrides síncronos (datos del cache)
  Workspaces.list = function(opts) {
    // list() devuelve solo activos por defecto · pasar { includeArchived:true }
    // para ver los archivados (útil en el panel admin de workspaces)
    if (opts && opts.includeArchived) return wsCache.slice();
    return wsCache.filter(w => !w.archivedAt);
  };
  Workspaces.listMine = function() {
    // En Supabase mode, RLS ya filtra · la lista que recibes ES la del user.
    // Filtramos archivados para que no aparezcan en el switcher del TopNav.
    return wsCache.filter(w => !w.archivedAt).map(w => Object.assign({}, w));
  };
  Workspaces.get = function(id) { return wsCache.find(w => w.id === id) || null; };
  Workspaces.membersOf = function(wsId) { return (wsMembersCache[wsId] || []).slice(); };
  Workspaces.create = async function(data) {
    const u = _uid(); if (!u) return null;
    const payload = {
      name: data.name || 'Workspace',
      slug: (data.slug || data.name || 'ws').toString().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      logo_url: data.logo || null,
      primary_color: data.primaryColor || '#6E50EE',
      owner_id: u,
      settings: data.settings || {},
    };
    const { data: ws, error } = await sb.from('workspaces').insert(payload).select().single();
    if (error) { console.warn('[supa] create ws', error.message); return null; }
    // Añade al owner como miembro owner
    await sb.from('workspace_members').insert({ workspace_id: ws.id, user_id: u, role: 'owner' });
    // Sembrar estructura placeholder · 4 pills numerados + 3 rutas. Sin esto
    // el workspace nuevo se ve completamente vacío y al admin no le queda
    // claro qué tiene que rellenar. Los placeholders dan navegabilidad y
    // sirven de plantilla editable. Si la inserción falla (RLS, conexión)
    // no rompemos el create · log y seguimos.
    try { await _seedWorkspacePlaceholders(ws.id); }
    catch(e) { console.warn('[supa] seedPlaceholders', e && e.message); }
    await _loadWorkspaces();
    if (window.Toast) window.Toast.success('Workspace "' + ws.name + '" creado', { icon:'🏢' });
    return ws;
  };

  // Plantilla inicial para workspaces nuevos. 4 pills numerados como esqueleto
  // del catálogo + 3 rutas placeholder. El admin las edita desde el panel.
  async function _seedWorkspacePlaceholders(wsId) {
    if (!wsId) return;
    const pillRows = [
      { workspace_id: wsId, pill_number: 1, slug:'pill-1', title:'Pill 1 · Configura este módulo', one_liner:'Edita desde Admin → Pills · añade vídeo, instructor y descripción.', teacher:'Sin asignar', duration:'4 min', tone:'teal',  category:'Sin clasificar', position: 1 },
      { workspace_id: wsId, pill_number: 2, slug:'pill-2', title:'Pill 2 · Configura este módulo', one_liner:'Edita desde Admin → Pills.',                                          teacher:'Sin asignar', duration:'4 min', tone:'plum',  category:'Sin clasificar', position: 2 },
      { workspace_id: wsId, pill_number: 3, slug:'pill-3', title:'Pill 3 · Configura este módulo', one_liner:'Edita desde Admin → Pills.',                                          teacher:'Sin asignar', duration:'4 min', tone:'clay',  category:'Sin clasificar', position: 3 },
      { workspace_id: wsId, pill_number: 4, slug:'pill-4', title:'Pill 4 · Configura este módulo', one_liner:'Edita desde Admin → Pills.',                                          teacher:'Sin asignar', duration:'4 min', tone:'olive', category:'Sin clasificar', position: 4 },
    ];
    const pathRows = [
      { workspace_id: wsId, kind:'path', slug:'ruta-1', title:'Ruta 1 · Certificación base',         teacher:'Por configurar · 0 think pills', duration:'Por definir', tone:'teal', format:'ruta', level:'principiante', category:'Certificación', position: 1 },
      { workspace_id: wsId, kind:'path', slug:'ruta-2', title:'Ruta 2 · Especialización intermedia', teacher:'Por configurar · 0 think pills', duration:'Por definir', tone:'plum', format:'ruta', level:'intermedio',   category:'Certificación', position: 2 },
      { workspace_id: wsId, kind:'path', slug:'ruta-3', title:'Ruta 3 · Especialización avanzada',   teacher:'Por configurar · 0 think pills', duration:'Por definir', tone:'clay', format:'ruta', level:'avanzado',     category:'Certificación', position: 3 },
    ];
    await Promise.all([
      sb.from('pills').insert(pillRows),
      sb.from('workspace_content').insert(pathRows),
    ]);
  }
  Workspaces.update = async function(id, patch) {
    const dbPatch = {};
    if (patch.name != null)         dbPatch.name = patch.name;
    if (patch.primaryColor != null) dbPatch.primary_color = patch.primaryColor;
    if (patch.logo != null)         dbPatch.logo_url = patch.logo;
    if (patch.settings != null)     dbPatch.settings = patch.settings;
    if (patch.archivedAt !== undefined) dbPatch.archived_at = patch.archivedAt;  // null = unarchive
    const { error } = await sb.from('workspaces').update(dbPatch).eq('id', id);
    if (error) { console.warn('[supa] update ws', error.message); return null; }
    await _loadWorkspaces();
    return Workspaces.get(id);
  };
  Workspaces.archive = async function(id) {
    return Workspaces.update(id, { archivedAt: new Date().toISOString() });
  };
  Workspaces.unarchive = async function(id) {
    return Workspaces.update(id, { archivedAt: null });
  };
  Workspaces.remove = async function(id) {
    const { error } = await sb.from('workspaces').delete().eq('id', id);
    if (error) { console.warn('[supa] remove ws', error.message); return; }
    if (Workspaces.currentId() === id) localStorage.removeItem('solid-active-workspace');
    await _loadWorkspaces();
    if (window.Toast) window.Toast.info('Workspace eliminado');
  };
  // Sube un logo al bucket workspace-assets bajo path <ws_id>/logo.<ext> con
  // upsert · cachebust de 30s mediante query string. Actualiza logo_url en
  // la fila del workspace con la public URL.
  Workspaces.uploadLogo = async function(workspaceId, file) {
    if (!workspaceId || !file) return null;
    const ext = (file.name && file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = workspaceId + '/logo.' + ext;
    const { error: upErr } = await sb.storage.from('workspace-assets').upload(path, file, {
      upsert: true, contentType: file.type || 'image/' + ext, cacheControl: '60',
    });
    if (upErr) { console.warn('[supa] upload logo', upErr.message); if (window.Toast) window.Toast.error('No se pudo subir el logo: ' + upErr.message); return null; }
    const { data: pub } = sb.storage.from('workspace-assets').getPublicUrl(path);
    const url = (pub && pub.publicUrl) + '?v=' + Date.now();
    await Workspaces.update(workspaceId, { logo: url });
    return url;
  };
  Workspaces.addMember = async function(workspaceId, userId, role) {
    if (Workspaces.ROLES.indexOf(role) < 0) role = 'member';
    const { error } = await sb.from('workspace_members')
      .upsert({ workspace_id: workspaceId, user_id: userId, role });
    if (error) { console.warn('[supa] addMember', error.message); return; }
    await _loadMembers(workspaceId);
    window.dispatchEvent(new Event('workspaces-changed'));
  };
  Workspaces.removeMember = async function(workspaceId, userId) {
    const { error } = await sb.from('workspace_members')
      .delete().eq('workspace_id', workspaceId).eq('user_id', userId);
    if (error) { console.warn('[supa] removeMember', error.message); return; }
    await _loadMembers(workspaceId);
    window.dispatchEvent(new Event('workspaces-changed'));
  };
  Workspaces.setMemberRole = async function(workspaceId, userId, role) {
    if (Workspaces.ROLES.indexOf(role) < 0) return;
    const { error } = await sb.from('workspace_members').update({ role })
      .eq('workspace_id', workspaceId).eq('user_id', userId);
    if (error) { console.warn('[supa] setMemberRole', error.message); return; }
    await _loadMembers(workspaceId);
    window.dispatchEvent(new Event('workspaces-changed'));
  };
  Workspaces.currentRole = function() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      const wsId = Workspaces.currentId();
      if (!u || !wsId) return null;
      if (u.systemRole === 'admin') return 'admin';
      const list = wsMembersCache[wsId] || [];
      const me = list.find(m => m.id === u.id);
      return me ? me.workspaceRole : null;
    } catch(e) { return null; }
  };
  // Override de currentId/current/setCurrent en Supabase mode · usan wsCache + ACTIVE_KEY localStorage
  const ACTIVE_KEY_SB = 'solid-active-workspace';
  Workspaces.currentId = function() { return localStorage.getItem(ACTIVE_KEY_SB) || null; };
  // ?ws=<slug> override · idéntico al path demo · ver Workspaces.current arriba
  function _resolveFromUrlSb() {
    try {
      if (typeof window === 'undefined' || !window.location) return null;
      const slug = (new URLSearchParams(window.location.search).get('ws') || '').trim().toLowerCase();
      if (!slug) return null;
      return wsCache.find(w => ((w.slug || '').toLowerCase() === slug) || ((w.name || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') === slug)) || null;
    } catch(e) { return null; }
  }
  Workspaces.current = function() {
    const fromUrl = _resolveFromUrlSb();
    if (fromUrl) {
      if (Workspaces.currentId() !== fromUrl.id) localStorage.setItem(ACTIVE_KEY_SB, fromUrl.id);
      return fromUrl;
    }
    const id = Workspaces.currentId();
    if (id) { const w = wsCache.find(w => w.id === id); if (w) return w; }
    return wsCache[0] || null;
  };
  Workspaces.setCurrent = function(id) {
    const w = wsCache.find(x => x.id === id);
    if (!w) return null;
    localStorage.setItem(ACTIVE_KEY_SB, id);
    // Sync URL ?ws=<slug>
    try {
      var slug = (w.slug || w.name || '').toString().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      if (slug && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (url.searchParams.get('ws') !== slug) {
          url.searchParams.set('ws', slug);
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      }
    } catch(e) {}
    window.dispatchEvent(new CustomEvent('workspace-changed', { detail: w }));
    ['bookmarks-changed','ratings-changed','channels-changed','delivery-prefs-changed',
     'content-push-changed','subscriptions-changed','notif-rules-changed','channel-notifs-changed',
     'test-sends-changed','smart-scheduling-changed','chats-changed','inbox-changed']
       .forEach(ev => window.dispatchEvent(new Event(ev)));
    return w;
  };
  // seedIfEmpty en Supabase: si no hay workspaces accesibles, crear "Repsol" como owner
  Workspaces.seedIfEmpty = async function() {
    await _loadWorkspaces();
    if (wsCache.length > 0) { Workspaces.setCurrent(Workspaces.currentId() || wsCache[0].id); return; }
    const u = _uid(); if (!u) return;
    const repsol = await Workspaces.create({ name:'Repsol', slug:'repsol', primaryColor:'#6E50EE' });
    if (repsol && repsol.id) Workspaces.setCurrent(repsol.id);
  };

  // ── Pills · catálogo de pills del workspace activo (Fase 2 multi-tenant)
  // Sobrescribe el array hardcoded de docs/prototype-home.jsx para que cada
  // workspace muestre su propio catálogo. RLS aísla por workspace_id.
  // Helper · resetea TODOS los buckets de contenido global al cambiar de
  // workspace en modo Supabase. PATHS/SERIES/REELS/PODCASTS están hardcoded
  // como Repsol en el bundle (prototype-home.jsx) y no tienen tabla DB
  // todavía, así que en Supabase mode los vaciamos para evitar que se vean
  // como contenido fantasma de Repsol en otros workspaces. Los iremos
  // implementando como tablas scopeadas a medida que se necesiten.
  function _resetWorkspaceScopedGlobals() {
    window.PILLS = [];
    window.PATHS = [];
    window.SERIES = [];
    window.REELS = [];
    window.PODCASTS = [];
    // LEARNING_PATHS · array hardcoded en prototype-views.jsx con las 6
    // rutas de Repsol (fundamentals/managers/publish-agent/care-agent/
    // content-lead/analytics-lead). El adapter lo lee como SRC_PATHS y lo
    // muestra en RutasView. Sin resetearlo, cualquier workspace seguía
    // viendo las 6 rutas de Repsol.
    window.LEARNING_PATHS = [];
    // Disparo pills-changed (que ya escucha sgson-adapter y App) para
    // forzar reconstrucción de SGS_DATA + re-render del árbol React.
    window.dispatchEvent(new Event('pills-changed'));
    ['paths-changed','series-changed','reels-changed','podcasts-changed']
      .forEach(ev => window.dispatchEvent(new Event(ev)));
  }
  async function _loadPills() {
    const wsId = _wsid();
    // Sin workspace activo · vacío. NO mantengas el catálogo del workspace
    // anterior, ni los 52 pills hardcoded del bundle. Esto era el bug real
    // que veía el usuario: switchear a "Hijos de Ribera" mostraba los pills
    // de Repsol porque el early return dejaba window.PILLS sin tocar.
    if (!wsId) { _resetWorkspaceScopedGlobals(); return; }
    // Intento principal · incluye metadata jsonb (descripciones largas
     // para "Más información"). Si la columna no existe en la instalación,
     // reintentamos sin ella para no romper boot.
    let { data, error } = await sb.from('pills')
      .select('pill_number, slug, title, one_liner, teacher, duration, tone, format, level, rating, enrolled, category, yt, mp4, poster, featured, new_badge, position, path_id, metadata')
      .eq('workspace_id', wsId)
      .order('position', { ascending: true });
    if (error && /metadata/.test(error.message || '')) {
      const r2 = await sb.from('pills')
        .select('pill_number, slug, title, one_liner, teacher, duration, tone, format, level, rating, enrolled, category, yt, mp4, poster, featured, new_badge, position, path_id')
        .eq('workspace_id', wsId)
        .order('position', { ascending: true });
      data = r2.data; error = r2.error;
    }
    if (error) {
      console.warn('[supa] pills', error.message);
      // Errores típicos: tabla pills no existe, RLS deny, red caída. En
      // CUALQUIER caso forzamos vacío · no podemos servir 52 pills de Repsol
      // como fallback a cualquier workspace.
      _resetWorkspaceScopedGlobals();
      return;
    }
    // Mapeo snake_case (DB) → camelCase (shape esperado por adapter/Wordmark)
    const mapped = (data || []).map(p => ({
      id: p.slug || ('p' + p.pill_number),
      pill: p.pill_number,
      title: p.title,
      one: p.one_liner || p.title,
      teacher: p.teacher,
      duration: p.duration,
      tone: p.tone,
      format: p.format,
      progress: 0,                 // per-user · no vive en la fila de pill
      level: p.level,
      rating: typeof p.rating === 'number' ? p.rating : parseFloat(p.rating) || 4.7,
      enrolled: p.enrolled || 0,
      category: p.category,
      yt: p.yt || undefined,
      mp4: p.mp4 || undefined,
      poster: p.poster || undefined,
      featured: !!p.featured,
      newBadge: !!p.new_badge,
      pathId: p.path_id,                  // uuid de la competencia/ruta a la que pertenece · usado para cruzar pills↔paths en el adapter
      description: (p.metadata && (p.metadata.description || p.metadata.more_info)) || null,
      _meta: p.metadata || {},
    }));
    window.PILLS = mapped;
    window.dispatchEvent(new Event('pills-changed'));
  }

  // ── workspace_content · paths / series / reels / podcasts ─────────────
  // Una sola tabla con kind = 'path'|'series'|'reel'|'podcast'. Un loader
  // genérico que mapea snake_case → camelCase del bundle hardcoded.
  const CONTENT_KIND_TO_GLOBAL = { path: 'PATHS', series: 'SERIES', reel: 'REELS', podcast: 'PODCASTS' };
  const CONTENT_KIND_TO_EVENT  = { path: 'paths-changed', series: 'series-changed', reel: 'reels-changed', podcast: 'podcasts-changed' };
  async function _loadContent(kind) {
    const wsId = _wsid();
    const globalKey = CONTENT_KIND_TO_GLOBAL[kind];
    if (!globalKey) return;
    if (!wsId) { window[globalKey] = []; window.dispatchEvent(new Event(CONTENT_KIND_TO_EVENT[kind])); return; }
    const { data, error } = await sb.from('workspace_content')
      .select('id, slug, title, teacher, duration, tone, format, level, rating, enrolled, category, position, metadata')
      .eq('workspace_id', wsId)
      .eq('kind', kind)
      .order('position', { ascending: true });
    if (error) {
      console.warn('[supa] content ' + kind, error.message);
      window[globalKey] = [];
      window.dispatchEvent(new Event(CONTENT_KIND_TO_EVENT[kind]));
      return;
    }
    const mapped = (data || []).map(r => ({
      id: r.slug || r.id,
      title: r.title,
      teacher: r.teacher,
      duration: r.duration,
      tone: r.tone,
      format: r.format,
      level: r.level,
      rating: typeof r.rating === 'number' ? r.rating : (r.rating != null ? parseFloat(r.rating) : undefined),
      enrolled: r.enrolled || 0,
      category: r.category,
      _id: r.id,                       // uuid real DB · útil para CRUD
      _meta: r.metadata || {},
    }));
    window[globalKey] = mapped;
    // El adapter (sgson-adapter.jsx) lee window.LEARNING_PATHS (no window.PATHS)
    // para construir D.LEARNING_PATHS que consume RutasView. Mantenemos los dos
    // sincronizados convirtiendo el shape: la entrada que viene de DB lleva
    // {title, teacher, duration, level…} y el adapter espera {label, desc,
    // pills (array), pillIds, duration, badge}. Map mínimo y compatible.
    if (kind === 'path') {
      // Cruza pills↔paths por path_id. Cada path queda con su array de
      // pillIds derivado de window.PILLS. Si _loadPills aún no terminó
      // (orden de Promise.all), el adapter recalcula al recibir
      // pills-changed (ver sgson-adapter.jsx).
      window.LEARNING_PATHS = mapped.map(p => {
        const pillsInPath = (window.PILLS || [])
          .filter(pill => pill.pathId && pill.pathId === p._id)
          .map(pill => pill.id);
        return {
          id: p.id,
          _id: p._id,                          // uuid expuesto para el adapter
          label: p.title,
          title: p.title,
          roleTag: p.level || '',
          desc: p.teacher || '',
          badge: p.category || '',
          duration: p.duration || '',
          pills: pillsInPath,                  // array de pill ids
          pillIds: pillsInPath,
          color: undefined,
          bg: undefined,
          icon: '🎓',
          // BUG fix · sin esto el adapter perdía la metadata (poster_url,
          // cert_url, accent) y todos los cursos terminaban con el mismo
          // SVG default porque no había hex distinto.
          _meta: p._meta || {},
        };
      });
    }
    window.dispatchEvent(new Event(CONTENT_KIND_TO_EVENT[kind]));
  }
  async function _loadAllContent() {
    await Promise.all(['path','series','reel','podcast'].map(_loadContent));
  }

  // window.Content · CRUD genérico para paths/series/reels/podcasts. Una API
  // por kind, en vez de window.Paths + window.Series + window.Reels + window.Podcasts.
  // Más compacto, mismo backend.
  window.Content = {
    list: (kind) => (window[CONTENT_KIND_TO_GLOBAL[kind]] || []).slice(),
    create: async function(kind, data) {
      const wsId = _wsid();
      if (!wsId) { if (window.Toast) window.Toast.error('No hay workspace activo'); return null; }
      if (!CONTENT_KIND_TO_GLOBAL[kind]) { if (window.Toast) window.Toast.error('Tipo de contenido desconocido'); return null; }
      const list = window[CONTENT_KIND_TO_GLOBAL[kind]] || [];
      const nextPos = list.reduce((m, x) => Math.max(m, x._meta?.position || 0), 0) + 1;
      const payload = {
        workspace_id: wsId, kind,
        slug: (data.slug || data.title || '').toString().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60),
        title: data.title || 'Sin título',
        teacher: data.teacher || null,
        duration: data.duration || null,
        tone: data.tone || 'teal',
        format: data.format || (kind === 'path' ? 'ruta' : kind === 'series' ? 'serie' : kind === 'reel' ? 'tip' : 'charla'),
        level: data.level || null,
        rating: data.rating || null,
        enrolled: data.enrolled || 0,
        category: data.category || null,
        position: data.position != null ? data.position : nextPos,
      };
      // metadata (brand, poster_url, cert_url, accent…) · se pasa tal cual si
      // viene en data. Sin esto, crear un curso con marca la perdía (solo
      // update la persistía).
      if (data.metadata && typeof data.metadata === 'object') {
        payload.metadata = data.metadata;
      }
      const { data: row, error } = await sb.from('workspace_content').insert(payload).select().single();
      if (error) { console.warn('[supa] content.create', error.message); if (window.Toast) window.Toast.error('Error: ' + error.message); return null; }
      await _loadContent(kind);
      if (window.Toast) window.Toast.success('Creado: ' + row.title);
      return row;
    },
    update: async function(kind, id, patch) {
      const dbPatch = {};
      ['title','teacher','duration','tone','format','level','rating','enrolled','category','position','slug'].forEach(k => {
        if (patch[k] !== undefined) dbPatch[k] = patch[k];
      });
      // Metadata · merge superficial. Si patch.metadata es objeto, lo fusionamos
      // con el actual (read-modify-write). Permite settear brand, poster_url,
      // cert_url, accent sin pisar otras keys.
      if (patch.metadata && typeof patch.metadata === 'object') {
        const { data: cur } = await sb.from('workspace_content').select('metadata').eq('id', id).maybeSingle();
        const merged = Object.assign({}, (cur && cur.metadata) || {}, patch.metadata);
        dbPatch.metadata = merged;
      }
      const { error } = await sb.from('workspace_content').update(dbPatch).eq('id', id);
      if (error) { console.warn('[supa] content.update', error.message); if (window.Toast) window.Toast.error('Error: ' + error.message); return null; }
      await _loadContent(kind);
      return true;
    },
    remove: async function(kind, id) {
      const { error } = await sb.from('workspace_content').delete().eq('id', id);
      if (error) { console.warn('[supa] content.remove', error.message); if (window.Toast) window.Toast.error('Error: ' + error.message); return false; }
      await _loadContent(kind);
      if (window.Toast) window.Toast.info('Eliminado');
      return true;
    },
    // Sube una imagen de poster para un curso/serie/reel/podcast y persiste
    // la URL pública en metadata.poster_url. Usa el bucket workspace-assets,
    // path content-posters/{kind}-{id}.{ext}.
    uploadPoster: async function(kind, id, file) {
      const wsId = _wsid(); if (!wsId || !file) return null;
      const ext = (file.name && file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = wsId + '/content-posters/' + kind + '-' + id + '.' + ext;
      const { error: upErr } = await sb.storage.from('workspace-assets').upload(path, file, {
        upsert: true, contentType: file.type || 'image/' + ext, cacheControl: '3600',
      });
      if (upErr) { console.warn('[supa] upload content poster', upErr.message); if (window.Toast) window.Toast.error('No se pudo subir el poster: ' + upErr.message); return null; }
      const { data: pub } = sb.storage.from('workspace-assets').getPublicUrl(path);
      const url = (pub && pub.publicUrl) + '?v=' + Date.now();
      await window.Content.update(kind, id, { metadata: { poster_url: url } });
      return url;
    },
  };

  // ── Progress · tracking de pills completadas por user ────────────────
  // Tabla public.progress · PK (user_id, workspace_id, pill_id).
  // El Player llama:
  //   · start(pillId)       → upsert con progress=0 (si no existe)
  //   · update(pillId, %)   → upsert con nuevo progress (0-1)
  //   · complete(pillId)    → upsert con progress=1 + completed_at=now
  // Alimentación de Analytics (pills_completed, active_users, etc.) y de
  // las cards del catálogo (badge ✓ completado). Cero efecto si no hay
  // user o workspace activo · es opt-in silencioso.
  let _progressCache = {};        // pill_id → { progress, completed_at }
  async function _loadProgress() {
    const u = _uid(); const ws = _wsid();
    if (!u || !ws) { _progressCache = {}; return; }
    const { data, error } = await sb.from('progress')
      .select('pill_id, progress, completed_at, watch_seconds')
      .eq('user_id', u).eq('workspace_id', ws);
    if (error) { console.warn('[progress] load', error.message); return; }
    _progressCache = {};
    (data || []).forEach(r => { _progressCache[r.pill_id] = r; });
    window.dispatchEvent(new Event('progress-changed'));
  }
  // Set de paths que ya fueron marcados como completados para este user ·
  // se persiste en localStorage scoped al user/workspace · al cruzar el
  // umbral por primera vez se dispara 'route-completed' (foundation para
  // certificados en un PR siguiente).
  function _completedRoutesKey() {
    const u = _uid(); const ws = _wsid();
    return 'solid-completed-routes:' + (u || 'anon') + ':' + (ws || 'none');
  }
  function _readCompletedRoutes() {
    try { return new Set(JSON.parse(localStorage.getItem(_completedRoutesKey()) || '[]')); }
    catch(e) { return new Set(); }
  }
  function _writeCompletedRoutes(set) {
    try { localStorage.setItem(_completedRoutesKey(), JSON.stringify(Array.from(set))); } catch(e) {}
  }
  window.Progress = {
    get: (pillId) => _progressCache[pillId] || null,
    isCompleted: (pillId) => !!(_progressCache[pillId] && _progressCache[pillId].completed_at),
    pct: (pillId) => { const r = _progressCache[pillId]; return r ? (r.progress || 0) : 0; },
    list: () => Object.assign({}, _progressCache),

    /* Progreso a nivel ruta/competencia · agrega completitud de las pills
     * que pertenecen al path (link por pill.pathId === path._id ó por la
     * lista pillIds que trae el path). Devuelve {completed,total,pct,
     * isCompleted}. Si total===0, isCompleted=false y pct=0. */
    routeProgress: function(pathRefOrId) {
      let path = pathRefOrId;
      // Acepta uuid, slug, o el objeto path entero
      if (typeof pathRefOrId === 'string') {
        const all = window.LEARNING_PATHS || [];
        path = all.find(p => p._id === pathRefOrId || p.id === pathRefOrId);
      }
      if (!path) return { completed: 0, total: 0, pct: 0, isCompleted: false };
      // pillIds explícito si vienen, si no derivar de window.PILLS
      let pillIds = Array.isArray(path.pillIds) ? path.pillIds.slice() :
                    Array.isArray(path.pills) ? path.pills.slice() : [];
      if (pillIds.length === 0 && path._id) {
        pillIds = (window.PILLS || [])
          .filter(p => p.pathId && p.pathId === path._id)
          .map(p => p.id);
      }
      const total = pillIds.length;
      if (total === 0) return { completed: 0, total: 0, pct: 0, isCompleted: false };
      const completed = pillIds.filter(id => !!(_progressCache[id] && _progressCache[id].completed_at)).length;
      const pct = completed / total;
      return { completed, total, pct, isCompleted: pct >= 1 };
    },

    start: async function(pillId) {
      const u = _uid(); const ws = _wsid();
      if (!u || !ws || !pillId) return;
      if (_progressCache[pillId]) return;
      const { error } = await sb.from('progress').upsert(
        { user_id: u, workspace_id: ws, pill_id: String(pillId), progress: 0, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,workspace_id,pill_id' }
      );
      if (error) { console.warn('[progress] start', error.message); return; }
      _progressCache[pillId] = { pill_id: String(pillId), progress: 0, completed_at: null };
      window.dispatchEvent(new Event('progress-changed'));
    },
    update: async function(pillId, pct, totalSec) {
      const u = _uid(); const ws = _wsid();
      if (!u || !ws || !pillId) return;
      const next = Math.max(0, Math.min(1, pct || 0));
      const prev = _progressCache[pillId];
      if (prev && prev.progress >= next) return;
      if (prev && Math.abs((prev.progress || 0) - next) < 0.05) return;
      // watch_seconds nunca decrece · usamos el máximo entre el previo y el
      // derivado de (pct × totalSec). Si no llega totalSec, dejamos el previo.
      const prevWatch = (prev && prev.watch_seconds) || 0;
      const derived = totalSec ? Math.round(next * totalSec) : 0;
      const watchSec = Math.max(prevWatch, derived);
      const payload = {
        user_id: u, workspace_id: ws, pill_id: String(pillId),
        progress: next,
        updated_at: new Date().toISOString(),
      };
      if (watchSec > prevWatch) payload.watch_seconds = watchSec;
      const { error } = await sb.from('progress').upsert(payload, { onConflict: 'user_id,workspace_id,pill_id' });
      if (error) { console.warn('[progress] update', error.message); return; }
      _progressCache[pillId] = Object.assign({}, prev || {}, { progress: next, watch_seconds: watchSec });
      window.dispatchEvent(new Event('progress-changed'));
    },
    complete: async function(pillId, totalSec) {
      const u = _uid(); const ws = _wsid();
      if (!u || !ws || !pillId) return;
      if (_progressCache[pillId] && _progressCache[pillId].completed_at) return;
      const now = new Date().toISOString();
      const prev = _progressCache[pillId];
      const prevWatch = (prev && prev.watch_seconds) || 0;
      // Al completar, watch_seconds = totalSec entero (si se conoce) ·
      // si no, mantenemos el previo.
      const finalWatch = totalSec ? Math.max(prevWatch, Math.round(totalSec)) : prevWatch;
      const payload = {
        user_id: u, workspace_id: ws, pill_id: String(pillId),
        progress: 1, completed_at: now, updated_at: now,
      };
      if (finalWatch > 0) payload.watch_seconds = finalWatch;
      const { error } = await sb.from('progress').upsert(payload, { onConflict: 'user_id,workspace_id,pill_id' });
      if (error) { console.warn('[progress] complete', error.message); return; }
      _progressCache[pillId] = { pill_id: String(pillId), progress: 1, completed_at: now, watch_seconds: finalWatch };
      if (window.Toast) window.Toast.success('Pill marcada como completada', { icon:'✓' });
      window.dispatchEvent(new Event('progress-changed'));
      if (window.Analytics && window.Analytics.refresh) window.Analytics.refresh();

      // ¿La ruta que contiene esta pill se acaba de completar?
      try {
        const paths = window.LEARNING_PATHS || [];
        const pill = (window.PILLS || []).find(p => p.id === pillId);
        const pid = pill && pill.pathId;
        if (pid) {
          const path = paths.find(p => p._id === pid);
          if (path) {
            const prog = window.Progress.routeProgress(path);
            if (prog.isCompleted) {
              const seen = _readCompletedRoutes();
              if (!seen.has(path._id || path.id)) {
                seen.add(path._id || path.id);
                _writeCompletedRoutes(seen);
                if (window.Toast) window.Toast.success('🏆 Ruta completada: ' + (path.title || path.label), { icon: '🏆' });
                window.dispatchEvent(new CustomEvent('route-completed', { detail: { path, completed: prog } }));
              }
            }
          }
        }
      } catch(e) { /* no rompemos el flow del complete por esto */ }
    },
  };

  // ── Pills CRUD (admin) ────────────────────────────────────────────────
  // Acciones administrativas sobre el catálogo del workspace activo.
  // Todas las funciones recargan tras la operación y devuelven el resultado.
  // ── Certificates · persistencia + descarga PDF ───────────────────────
  // Tabla public.certificates con UNIQUE(user_id, workspace_id, route_id).
  // Se crea automáticamente al recibir 'route-completed' (disparado por
  // Progress.complete cuando todas las pills de una ruta están done).
  let _certsCache = [];
  async function _loadCertificates() {
    const u = _uid(); const ws = _wsid();
    if (!u || !ws) { _certsCache = []; return; }
    const { data, error } = await sb.from('certificates')
      .select('id, user_id, workspace_id, route_id, route_title, cert_number, completed_at, metadata, created_at')
      .eq('user_id', u).eq('workspace_id', ws)
      .order('completed_at', { ascending: false });
    if (error) { console.warn('[certs] load', error.message); return; }
    _certsCache = data || [];
    window.dispatchEvent(new Event('certificates-changed'));
  }
  window.Certificates = {
    list: () => _certsCache.slice(),
    get: (routeId) => _certsCache.find(c => c.route_id === String(routeId)) || null,
    has: (routeId) => !!_certsCache.find(c => c.route_id === String(routeId)),
    create: async function(routeInfo) {
      const u = _uid(); const ws = _wsid();
      if (!u || !ws || !routeInfo) return null;
      const routeId = String(routeInfo.id || routeInfo._id || '');
      if (!routeId) return null;
      if (window.Certificates.has(routeId)) return window.Certificates.get(routeId);
      const payload = {
        user_id: u, workspace_id: ws,
        route_id: routeId,
        route_title: routeInfo.title || routeInfo.label || 'Ruta',
        metadata: routeInfo.metadata || {},
      };
      const { data, error } = await sb.from('certificates').insert(payload).select().single();
      if (error) {
        // unique constraint · ya existe · refresh y devuelve el que esté
        if (error.code === '23505') { await _loadCertificates(); return window.Certificates.get(routeId); }
        console.warn('[certs] create', error.message); return null;
      }
      _certsCache.unshift(data);
      window.dispatchEvent(new Event('certificates-changed'));
      return data;
    },
    /* URL pública de verificación · QR del PDF apunta aquí. Cualquier persona
     * (RRHH externo, recruiter) puede escanear y validar autenticidad. */
    verifyUrl: function(cert) {
      if (!cert || !cert.id) return null;
      const origin = (typeof location !== 'undefined') ? location.origin : 'https://solid-stream.vercel.app';
      return origin.replace(/\/$/, '') + '/verify.html?cert=' + encodeURIComponent(cert.id);
    },
    /* URLs de compartir precomputadas (LinkedIn / WhatsApp / X / email /
     * copy-link). Devuelve null si el cert no tiene id. El texto base es
     * accionable: "He completado [curso]" + URL pública de verificación.
     * Cualquiera que pulse el link aterriza en /verify.html · ve el cert
     * validado y autenticidad confirmada → branding orgánico beonit. */
    shareUrls: function(cert) {
      const vUrl = window.Certificates.verifyUrl(cert);
      if (!vUrl) return null;
      const profile = (window.Auth && window.Auth.currentUser()) || {};
      const userName = profile.name || (profile.email ? profile.email.split('@')[0] : 'Alumno');
      const wsName = window.WORKSPACE_NAME || 'SolidStream';
      const courseTitle = cert.route_title || 'un curso';
      // Texto largo (LinkedIn/email) + corto (WhatsApp/X).
      const txtLong = '¡Acabo de completar “' + courseTitle + '” en ' + wsName + '! 🎓\n\n' +
                      'Puedes verificar el certificado aquí: ' + vUrl;
      const txtShort = '🎓 He completado “' + courseTitle + '” en ' + wsName + ' · ' + vUrl;
      const enc = encodeURIComponent;
      return {
        url: vUrl,
        userName: userName,
        courseTitle: courseTitle,
        // LinkedIn · share article (URL solo · LinkedIn extrae el OG)
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(vUrl),
        // WhatsApp · texto + URL en uno solo
        whatsapp: 'https://wa.me/?text=' + enc(txtShort),
        // X (Twitter)
        x: 'https://twitter.com/intent/tweet?text=' + enc(txtShort),
        // Email · mailto con subject + body
        email: 'mailto:?subject=' + enc('Certificado · ' + courseTitle) + '&body=' + enc(txtLong),
        // Texto plano para copy-to-clipboard
        text: txtLong,
      };
    },
    /* Genera el HTML del certificado · ABRE como blob en pestaña nueva
     * o fuerza descarga · el user lo imprime a PDF desde el navegador.
     * Incluye QR de verificación pública abajo-derecha. */
    generateHTML: function(cert) {
      const profile = (window.Auth && window.Auth.currentUser()) || {};
      const wsName = window.WORKSPACE_NAME || (window.Workspaces && window.Workspaces.current && window.Workspaces.current() && window.Workspaces.current().name) || 'Plataforma';
      const today = cert.completed_at
        ? new Date(cert.completed_at).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })
        : new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
      const userName = profile.name || (profile.email ? profile.email.split('@')[0] : 'Alumno');
      const userRole = profile.role || '';
      const userTeam = profile.team || wsName;
      const wsColor = (window.Workspaces && window.Workspaces.current && window.Workspaces.current() && (window.Workspaces.current().primaryColor || window.Workspaces.current().primary_color)) || '#005996';
      const esc = s => (s||'').toString().replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c]));
      const vUrl = window.Certificates.verifyUrl(cert);
      const qrSvg = (vUrl && window.generateQRSvg) ? window.generateQRSvg(vUrl, 160) : '';
      const qrDataUrl = qrSvg ? ('data:image/svg+xml;utf8,' + encodeURIComponent(qrSvg)) : '';
      const qrBlock = qrDataUrl
        ? ('<div class="qr-box"><img src="' + qrDataUrl + '" alt="QR de verificación"/>'
           + '<div class="qr-cap">Verifica en línea</div>'
           + '<div class="qr-url">' + esc((vUrl || '').replace(/^https?:\/\//, '')) + '</div></div>')
        : '';
      return '<!doctype html><html><head><meta charset="utf-8"><title>Certificado · ' + esc(userName) + '</title>'
        + '<style>@page{size:A4 landscape;margin:0}body{font-family:Inter,-apple-system,system-ui,sans-serif;margin:0;padding:60px;min-height:100vh;box-sizing:border-box;background:linear-gradient(135deg,#fafbfc 0%,#f0f4f8 100%);display:flex;flex-direction:column}'
        + '.frame{border:6px double ' + wsColor + ';padding:50px 60px;flex:1;display:flex;flex-direction:column;background:#fff;position:relative}'
        + '.kicker{font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#99A5BD;margin-bottom:8px}'
        + 'h1{font-size:38px;margin:0 0 20px;color:#0B1220}'
        + '.lead{font-size:14px;color:#45506A;max-width:560px;margin:0 0 28px;line-height:1.55}'
        + '.name{font-style:italic;font-weight:700;font-size:58px;color:' + wsColor + ';margin:0 0 8px;letter-spacing:-.025em}'
        + '.role{font-size:16px;color:#0B1220;margin-bottom:28px}'
        + '.cert-line{height:2px;background:linear-gradient(90deg,' + wsColor + ',#BCD630,#8A3992,' + wsColor + ');margin:24px 0}'
        + '.foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;font-size:11px;color:#45506A;gap:24px}'
        + '.foot > div{min-width:0}'
        + '.sig{font-style:italic;font-size:18px;color:#0B1220;border-top:1px solid #ccc;padding-top:6px;margin-top:18px}'
        + '.cert-num{font-family:JetBrains Mono,monospace;font-size:10px;color:#99A5BD;letter-spacing:.1em}'
        + '.qr-box{display:flex;flex-direction:column;align-items:center;gap:4px;border:1px solid ' + wsColor + ';padding:8px;background:#fff}'
        + '.qr-box img{width:120px;height:120px;display:block}'
        + '.qr-cap{font-family:JetBrains Mono,monospace;font-size:8.5px;letter-spacing:.15em;text-transform:uppercase;color:#475569;font-weight:700;margin-top:4px}'
        + '.qr-url{font-family:JetBrains Mono,monospace;font-size:7.5px;color:#99A5BD;max-width:130px;text-align:center;word-break:break-all;line-height:1.3}'
        + '@media print{body{background:#fff}.frame{border-color:' + wsColor + '}}'
        + '</style></head><body>'
        + '<div class="frame">'
        +   '<div class="kicker">SolidStream · ' + esc(wsName) + ' · Certificación oficial</div>'
        +   '<h1>Certificado · ' + esc(cert.route_title || 'Ruta') + '</h1>'
        +   '<div class="lead">Por la presente certificamos que la persona reseñada ha completado los módulos de esta ruta dentro de la formación oficial del programa.</div>'
        +   '<div class="name">' + esc(userName) + '</div>'
        +   (userRole || userTeam ? '<div class="role">' + esc([userRole, userTeam].filter(Boolean).join(' · ')) + '</div>' : '')
        +   '<div class="cert-line"></div>'
        +   '<div class="foot">'
        +     '<div><strong>Fecha</strong><br/>' + esc(today) + '<div class="cert-num" style="margin-top:8px">' + esc(cert.cert_number || '—') + '</div></div>'
        +     '<div><div class="sig">' + esc(wsName) + '</div><div style="font-family:monospace;font-size:9px;color:#99A5BD;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">Equipo de formación</div></div>'
        +     qrBlock
        +   '</div>'
        + '</div></body></html>';
    },
    /* Forza descarga como .html · el user lo imprime a PDF en el navegador.
     * Filename sugerido: Certificado-{routeId}-{userName}.html */
    download: function(cert) {
      const html = window.Certificates.generateHTML(cert);
      const blob = new Blob([html], { type:'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safe = s => (s||'').toString().replace(/[^A-Za-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
      const profile = (window.Auth && window.Auth.currentUser()) || {};
      a.download = 'Certificado-' + safe(cert.route_title || cert.route_id) + '-' + safe(profile.name || profile.email || 'alumno') + '.html';
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    },
    /* Abre el cert en una pestaña nueva y dispara el print dialog. El user
     * elige "Guardar como PDF" del propio navegador · funciona en Chrome,
     * Safari, Firefox y Edge sin libs externas. Si el popup queda bloqueado,
     * cae a download() automáticamente. */
    openPrintDialog: function(cert) {
      const html = window.Certificates.generateHTML(cert);
      // Adjuntamos un <script> que auto-llama print() · el user solo elige.
      const printable = html.replace('</body>', '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},250);});<\/script></body>');
      const blob = new Blob([printable], { type:'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank', 'noopener,width=1100,height=780');
      if (!win) {
        // Popup blocked · fallback a descarga directa.
        URL.revokeObjectURL(url);
        return window.Certificates.download(cert);
      }
      // Revoke después de un rato para no filtrar memoria.
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch(e){} }, 60000);
    },
  };
  // Listener · al completar una ruta, crear cert (idempotente vía constraint
  // UNIQUE en DB · si ya existe, simplemente devuelve el existente).
  window.addEventListener('route-completed', async (ev) => {
    const path = ev && ev.detail && ev.detail.path;
    if (!path) return;
    const cert = await window.Certificates.create({
      id: path._id || path.id,
      title: path.title || path.label,
      metadata: { completed: ev.detail.completed },
    });
    if (cert && window.Toast) {
      window.Toast.success('Certificado emitido · descárgalo desde "Mis certificados"', { icon:'🏆' });
    }
  });

  // ── Invitations · override del módulo localStorage para usar Supabase ─
  // Las invitations viven en public.invitations · permite que el invitee
  // resuelva el token desde otro browser (la pieza que faltaba para que
  // el sistema de email invitations funcione end-to-end). RPCs:
  //   · get_invitation_by_token(token) → row pública por token (anon-safe)
  //   · accept_invitation(token) → inserta workspace_members + status=accepted
  let _invitationsCache = [];
  async function _loadInvitations() {
    const u = _uid(); const ws = _wsid();
    if (!u || !ws) { _invitationsCache = []; return; }
    // En esta instalación la tabla public.invitations NO tiene `created_at`
    // así que vamos directos a la query simple sin orden. Evitamos los 400
    // de ruido en consola.
    const r = await sb.from('invitations')
      .select('token, workspace_id, email, name, role, status, accepted_at, invited_by')
      .eq('workspace_id', ws);
    if (r.error) { console.warn('[invitations] load', r.error.message); _invitationsCache = []; return; }
    _invitationsCache = r.data || [];
    window.dispatchEvent(new Event('invitations-changed'));
  }
  if (window.Invitations) {
    window.Invitations.list = () => _invitationsCache.slice();
    window.Invitations.create = async function(data) {
      const wsId = _wsid(); const u = _uid();
      if (!wsId) throw new Error('No hay workspace activo · cambia al workspace correcto antes de invitar');
      if (!data || !data.email || !data.email.includes('@')) throw new Error('Email inválido');
      const email = data.email.toLowerCase().trim();
      const token = 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const payload = {
        token,
        workspace_id: wsId,
        email,
        name: (data.name || email.split('@')[0]).trim(),
        role: data.role || null,
        invited_by: u,
        status: 'pending',
      };
      const { data: row, error } = await sb.from('invitations').insert(payload).select().single();
      if (error) {
        if (error.code === '23505') return { duplicate: true, email };  // UNIQUE collision
        throw new Error(error.message);
      }
      _invitationsCache.unshift(row);
      window.dispatchEvent(new Event('invitations-changed'));
      return row;
    };
    window.Invitations.getByToken = async function(token) {
      if (!token) return null;
      const { data, error } = await sb.rpc('get_invitation_by_token', { _token: token });
      if (error) { console.warn('[invitations] getByToken', error.message); return null; }
      return (data && data[0]) || null;
    };
    window.Invitations.markAccepted = async function(token) {
      const { data, error } = await sb.rpc('accept_invitation', { _token: token });
      if (error) { console.warn('[invitations] accept', error.message); return null; }
      // El RPC ya añadió al user a workspace_members · recargamos para que
      // Workspaces.listMine() incluya el nuevo workspace
      if (typeof _loadWorkspaces === 'function') await _loadWorkspaces();
      return data;
    };
    window.Invitations.remove = async function(token) {
      const { error } = await sb.from('invitations').delete().eq('token', token);
      if (error) { console.warn('[invitations] remove', error.message); return false; }
      _invitationsCache = _invitationsCache.filter(i => i.token !== token);
      window.dispatchEvent(new Event('invitations-changed'));
      return true;
    };
    window.Invitations.bulkCreate = async function(csvText) {
      const results = { created: [], skipped: [], errors: [] };
      const lines = (csvText || '').split(/\n|\r/).map(l => l.trim()).filter(Boolean);
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (idx === 0 && /^email/i.test(line)) continue;
        const parts = line.split(/[;,\t]/).map(p => p.trim());
        try {
          const inv = await window.Invitations.create({ email: parts[0], name: parts[1], role: parts[2], team: parts[3] });
          if (inv.duplicate) results.skipped.push({ email: inv.email, reason: 'ya tiene cuenta o invitación' });
          else results.created.push(inv);
        } catch (err) { results.errors.push({ line, error: err.message }); }
      }
      return results;
    };
  }

  window.Pills = {
    list: () => (window.PILLS || []).slice(),
    // Crea una pill nueva. `data` admite el shape camelCase (igual que las
    // entries del array hardcoded). Si no se pasa pill_number, se calcula
    // como max(pill_number)+1 del workspace.
    create: async function(data) {
      const wsId = _wsid();
      if (!wsId) { if (window.Toast) window.Toast.error('No hay workspace activo'); return null; }
      let pn = data.pill;
      if (pn == null) {
        const { data: rows } = await sb.from('pills').select('pill_number').eq('workspace_id', wsId).order('pill_number', { ascending: false }).limit(1);
        pn = (rows && rows[0] ? (rows[0].pill_number + 1) : 0);
      }
      const row = {
        workspace_id: wsId,
        pill_number: pn,
        slug: data.id || ('p' + pn),
        title: data.title || 'Nueva pill',
        one_liner: data.one || null,
        teacher: data.teacher || null,
        duration: data.duration || '4 min',
        tone: data.tone || 'teal',
        format: data.format || 'módulo',
        level: data.level || 'principiante',
        rating: typeof data.rating === 'number' ? data.rating : 4.7,
        enrolled: data.enrolled || 0,
        category: data.category || 'Fundamentos',
        yt: data.yt || null,
        mp4: data.mp4 || null,
        poster: data.poster || null,
        featured: !!data.featured,
        new_badge: !!data.newBadge,
        position: typeof data.position === 'number' ? data.position : pn,
      };
      const { data: ins, error } = await sb.from('pills').insert(row).select('id').single();
      if (error) { console.warn('[supa] pill create', error.message); if (window.Toast) window.Toast.error('No se pudo crear: ' + error.message); return null; }
      await _loadPills();
      if (window.Toast) window.Toast.success('Pill creada');
      return ins;
    },
    update: async function(pillNumber, patch) {
      const wsId = _wsid(); if (!wsId) return null;
      const dbPatch = {};
      if (patch.title != null)    dbPatch.title = patch.title;
      if (patch.one != null)      dbPatch.one_liner = patch.one;
      if (patch.teacher != null)  dbPatch.teacher = patch.teacher;
      if (patch.duration != null) dbPatch.duration = patch.duration;
      if (patch.tone != null)     dbPatch.tone = patch.tone;
      if (patch.level != null)    dbPatch.level = patch.level;
      if (patch.rating != null)   dbPatch.rating = patch.rating;
      if (patch.enrolled != null) dbPatch.enrolled = patch.enrolled;
      if (patch.category != null) dbPatch.category = patch.category;
      if (patch.yt != null)       dbPatch.yt = patch.yt || null;
      if (patch.mp4 != null)      dbPatch.mp4 = patch.mp4 || null;
      if (patch.poster != null)   dbPatch.poster = patch.poster || null;
      if (patch.featured != null) dbPatch.featured = !!patch.featured;
      if (patch.newBadge != null) dbPatch.new_badge = !!patch.newBadge;
      if (patch.position != null) dbPatch.position = patch.position;
      const { error } = await sb.from('pills').update(dbPatch).eq('workspace_id', wsId).eq('pill_number', pillNumber);
      if (error) { console.warn('[supa] pill update', error.message); if (window.Toast) window.Toast.error('No se pudo guardar: ' + error.message); return null; }
      await _loadPills();
      return true;
    },
    remove: async function(pillNumber) {
      const wsId = _wsid(); if (!wsId) return null;
      const { error } = await sb.from('pills').delete().eq('workspace_id', wsId).eq('pill_number', pillNumber);
      if (error) { console.warn('[supa] pill remove', error.message); if (window.Toast) window.Toast.error('No se pudo borrar: ' + error.message); return null; }
      await _loadPills();
      if (window.Toast) window.Toast.info('Pill eliminada');
      return true;
    },
    uploadVideo: async function(pillNumber, file) {
      const wsId = _wsid(); if (!wsId || !file) return null;
      const ext = (file.name && file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
      const path = wsId + '/p' + pillNumber + '.' + ext;
      const { error: upErr } = await sb.storage.from('pill-videos').upload(path, file, {
        upsert: true, contentType: file.type || 'video/' + ext, cacheControl: '3600',
      });
      if (upErr) { console.warn('[supa] upload video', upErr.message); if (window.Toast) window.Toast.error('No se pudo subir el vídeo: ' + upErr.message); return null; }
      const { data: pub } = sb.storage.from('pill-videos').getPublicUrl(path);
      const url = (pub && pub.publicUrl) + '?v=' + Date.now();
      await window.Pills.update(pillNumber, { mp4: url });
      if (window.Toast) window.Toast.success('Vídeo subido');
      return url;
    },
    uploadPoster: async function(pillNumber, file) {
      const wsId = _wsid(); if (!wsId || !file) return null;
      const ext = (file.name && file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = wsId + '/posters/p' + pillNumber + '.' + ext;
      const { error: upErr } = await sb.storage.from('workspace-assets').upload(path, file, {
        upsert: true, contentType: file.type || 'image/' + ext, cacheControl: '3600',
      });
      if (upErr) { console.warn('[supa] upload poster', upErr.message); if (window.Toast) window.Toast.error('No se pudo subir el poster: ' + upErr.message); return null; }
      const { data: pub } = sb.storage.from('workspace-assets').getPublicUrl(path);
      const url = (pub && pub.publicUrl) + '?v=' + Date.now();
      await window.Pills.update(pillNumber, { poster: url });
      return url;
    },
  };

  // ── Sync inicial cuando hay sesión + en cada cambio de auth ──
  async function _syncAll() {
    if (!_uid()) {
      // LOGOUT · limpia TODAS las cachés en memoria antes de salir. Sin esto,
      // en un equipo compartido el siguiente usuario veía bookmarks/inbox/
      // chats/etc del anterior hasta que las queries de _syncAll terminaran
      // (y si una fallaba, indefinidamente). Fuga real de datos privados.
      try {
        bmCache = [];
        enrollCache = [];
        ratingsOwn = {}; ratingsAll = [];
        notesCache = [];
        planCache = null;
        reCache = {};
        inboxCache = { messages: [], notifications: [], releases: [] };
        chatsCache = [];
        subsCache = [];
        actCache = [];
        _progressCache = {};
        _certsCache = [];
        _invitationsCache = [];
        wsMembersCache = {};
        wsCache = [];
        cachedProfile = null;
        // Variables globales window.* scopeadas al user/workspace
        window.PILLS = []; window.LEARNING_PATHS = []; window.SERIES = [];
        window.REELS = []; window.PODCASTS = [];
        // Dispatch para que toda la UI re-renderice vacía
        ['bookmarks-changed','enrollments-changed','ratings-changed','notes-changed','learning-plan-changed','exams-changed','inbox-changed','chats-changed',
         'subs-changed','activity-changed','progress-changed','certificates-changed',
         'invitations-changed','members-changed','workspaces-changed',
         'pills-changed','paths-changed','series-changed','reels-changed','podcasts-changed']
          .forEach(ev => { try { window.dispatchEvent(new Event(ev)); } catch (e) {} });
      } catch (e) { console.warn('[supa] logout cache reset', e.message); }
      return;
    }
    // Workspaces primero · el resto puede depender del workspace activo
    await _loadWorkspaces();
    const curWs = Workspaces.currentId();
    if (curWs) await _loadMembers(curWs);
    await Promise.all([
      _loadBookmarks(), _loadEnrollments(), _loadRatings(), _loadNotes(), _loadLearningPlan(), _loadRouteExams(), _loadChats(), _loadSubmissions(), _loadInbox(), _loadActivity(),
      _loadPills(), _loadAllContent(), _loadProgress(), _loadCertificates(), _loadInvitations(),
    ]);
  }
  window.addEventListener('auth-changed', _syncAll);
  if (_uid()) _syncAll();

  // Cambio de workspace · recarga datos scopeados (bookmarks, members, pills,
  // paths/series/reels/podcasts). Sin esto, el switch entre tenants dejaba
  // el catálogo del workspace anterior visible.
  window.addEventListener('workspace-changed', async () => {
    if (!_uid()) return;
    const curWs = Workspaces.currentId();
    if (curWs) await _loadMembers(curWs);
    await Promise.all([_loadBookmarks(), _loadEnrollments(), _loadRatings(), _loadNotes(), _loadLearningPlan(), _loadInbox(), _loadPills(), _loadAllContent(), _loadProgress(), _loadCertificates(), _loadInvitations()]);
  });

  // ── Activity log persistente en tabla 'events' ──────────────────────────
  let actCache = [];
  async function _loadActivity() {
    const u = window.Auth && window.Auth.currentUser();
    if (!u) { actCache = []; return; }
    // Admin lee todos, user lee solo los suyos (RLS lo limita en DB)
    const { data, error } = await sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) { console.warn('[supa] events', error.message); return; }
    actCache = (data || []).map(r => ({
      id: r.id,
      type: r.type,
      meta: r.meta || {},
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      avatarColor: r.avatar_color,
      createdAt: new Date(r.created_at).getTime(),
    }));
    window.dispatchEvent(new Event('activity-changed'));
  }
  if (window.Activity) {
    const _origLog = window.Activity.log;
    window.Activity.log = function(type, meta) {
      const ev = _origLog.call(window.Activity, type, meta); // sigue guardando local también
      const u = window.Auth && window.Auth.currentUser();
      if (u) {
        sb.from('activity_log').insert({
          user_id: u.id,
          user_name: u.name,
          user_email: u.email,
          avatar_color: u.avatarColor,
          type, meta: meta || {},
        }).then(({ error }) => { if (error) console.warn('[supa] event insert', error.message); });
      }
      return ev;
    };
    window.Activity.list = function(filter) {
      let items = actCache.slice();
      if (filter) {
        if (filter.type) items = items.filter(i => i.type === filter.type);
        if (filter.userId) items = items.filter(i => i.userId === filter.userId);
        if (filter.since) items = items.filter(i => i.createdAt >= filter.since);
      }
      return items;
    };
  }

  // ── Realtime subscriptions · cambios en DB → eventos del bus interno ────
  // Los componentes ya escuchan estos eventos para refrescar. Con esto, lo que
  // cambia otro user/dispositivo lo ves en vivo sin recargar.
  const ch = sb.channel('sgson-realtime-' + Math.random().toString(36).slice(2));
  ch.on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => _loadSubmissions())
    // inbox_messages cubre messages + notifications + releases (filtrado por category)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_messages' }, () => _loadInbox())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { if (window.Auth && window.Auth.reloadUsers) window.Auth.reloadUsers(); })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => _loadActivity())
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log('[SolidStream] Realtime ✓ canal abierto');
      if (status === 'CHANNEL_ERROR') console.warn('[SolidStream] Realtime · error de canal');
    });
  window._sgsonSbChannel = ch;

  console.log('[SolidStream] Datos → Supabase backend activo · audit log + realtime activos');
}

// Activa adapters cuando el bootstrap del HTML termina.
// IMPORTANTE: _activateSupabaseData() referencia Bookmarks, ChatHistory,
// RouteExams, Submissions — todos definidos más abajo en este mismo archivo.
// Si el evento `sgson-backend-ready` se dispara antes de que el archivo
// termine de evaluarse (puede pasar si /api/config respondió rápido y el
// JS del prototype es largo), accederíamos a esos módulos como `undefined`
// y .get = fn lanzaría TypeError. Por eso esperamos a que todos existan.
if (typeof window !== 'undefined') {
  function _modulesReady() {
    return !!(window.Bookmarks && window.ChatHistory && window.RouteExams
           && window.Submissions && window.Workspaces && window.Inbox);
  }
  function _activateAll() {
    if (window.SGSON_BACKEND !== 'supabase') return;
    if (!_modulesReady()) {
      // Reintenta tras el siguiente tick · cuando el resto del archivo haya cargado
      setTimeout(_activateAll, 30);
      return;
    }
    _activateSupabaseAuth();
    _activateSupabaseData();
  }
  if (window.SGSON_BACKEND_READY) _activateAll();
  else window.addEventListener('sgson-backend-ready', _activateAll);
}

// Helper: namespacing de localStorage por usuario + workspace activo.
// Para keys que dependen del usuario (bookmarks, chats, etc.). Si hay un
// workspace activo (multi-tenant), añade :wsId al final · de modo que cada
// tenant tenga su propio set de datos para el mismo usuario.
function _userScopedKey(baseKey, opts) {
  var id = Auth.currentUserId();
  if (!id) return baseKey;
  // `opts.global` salta el scoping por workspace (Settings, UserProfile…
  // viven cross-workspace porque son del USUARIO, no del tenant).
  if (opts && opts.global) return baseKey + ':' + id;
  var wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
  return baseKey + ':' + id + ':' + wsId;
}
window.userKey = _userScopedKey;

// ── Bookmarks (Saved library) por usuario ──────────────────────────────────
const Bookmarks = (function() {
  function _key() { return _userScopedKey('solid-bookmarks'); }
  function get() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch(e) { return []; } }
  function save(ids) { localStorage.setItem(_key(), JSON.stringify(ids)); window.dispatchEvent(new Event('bookmarks-changed')); }
  function has(id) { return get().includes(id); }
  function toggle(id) {
    const ids = get();
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1); else ids.unshift(id);
    save(ids);
    return idx < 0;
  }
  function clear() { save([]); }
  return { get, has, toggle, clear };
})();
window.Bookmarks = Bookmarks;

// ── Enrollments (cursos "inscritos") por usuario+workspace ──────────────────
// Diferenciamos:
//   · Bookmarks → "Guardado" / "Favorito" (star button, intención débil)
//   · Enrollments → "Inscrito" en el curso (intención fuerte, CTA principal)
// El user puede tener bookmark sin inscribirse y viceversa. Persistimos en
// localStorage scopeado por user+workspace para no requerir migración de
// schema en Supabase. Migrable a tabla `enrollments` a futuro sin tocar UI.
const Enrollments = (function() {
  function _key() { return _userScopedKey('solid-enrollments'); }
  function get() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch(e) { return []; } }
  function save(ids) { localStorage.setItem(_key(), JSON.stringify(ids)); window.dispatchEvent(new Event('enrollments-changed')); }
  function has(id) { return get().includes(id); }
  function add(id) {
    const ids = get();
    if (!ids.includes(id)) { ids.unshift(id); save(ids); return true; }
    return false;
  }
  function remove(id) {
    const ids = get().filter(x => x !== id);
    save(ids);
  }
  function toggle(id) {
    const ids = get();
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1); else ids.unshift(id);
    save(ids);
    return idx < 0;
  }
  function clear() { save([]); }
  return { get, has, add, remove, toggle, clear };
})();
window.Enrollments = Enrollments;

// ── Notes (notas con timestamp del vídeo · scoped user+workspace) ─────────
// Cada nota: { id, pillId, pillTitle, atSeconds, text, createdAt, updatedAt }.
// Fallback localStorage (modo demo); Supabase override en _activateSupabaseData.
const Notes = (function() {
  function _key() { return _userScopedKey('solid-notes'); }
  function listAll() {
    try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch (e) { return []; }
  }
  function _save(arr) { localStorage.setItem(_key(), JSON.stringify(arr)); window.dispatchEvent(new Event('notes-changed')); }
  function listFor(pillId) { return listAll().filter(n => n.pillId === pillId).sort((a, b) => (a.atSeconds || 0) - (b.atSeconds || 0)); }
  function add(pillId, atSeconds, text, pillTitle) {
    if (!pillId || !text || !text.trim()) return null;
    const all = listAll();
    const n = {
      id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      pillId, pillTitle: pillTitle || '',
      atSeconds: Math.max(0, Math.round(atSeconds || 0)),
      text: text.trim(),
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    all.unshift(n); _save(all); return n;
  }
  function update(id, patch) {
    const all = listAll();
    const i = all.findIndex(x => x.id === id);
    if (i < 0) return null;
    all[i] = Object.assign({}, all[i], patch, { updatedAt: Date.now() });
    _save(all); return all[i];
  }
  function remove(id) { _save(listAll().filter(x => x.id !== id)); }
  function clear() { _save([]); }
  return { listAll, listFor, add, update, remove, clear };
})();
window.Notes = Notes;

// ── LearningPlans (plan personalizado IA · scoped user+workspace · 1 por par) ───
// Estructura: { id, title, weeks:[{label,focus,items:[{kind,id,title,done}]}], generatedAt, updatedAt }
// Fallback localStorage; Supabase override en _activateSupabaseData.
const LearningPlans = (function() {
  function _key() { return _userScopedKey('solid-learning-plan'); }
  function get() {
    try { return JSON.parse(localStorage.getItem(_key()) || 'null'); } catch (e) { return null; }
  }
  function save(plan) { localStorage.setItem(_key(), JSON.stringify(plan)); window.dispatchEvent(new Event('learning-plan-changed')); }
  function set(plan) {
    const now = Date.now();
    const p = Object.assign({}, plan, { generatedAt: plan.generatedAt || now, updatedAt: now });
    save(p); return p;
  }
  function toggleItem(weekIdx, itemIdx) {
    const p = get(); if (!p || !p.weeks || !p.weeks[weekIdx] || !p.weeks[weekIdx].items[itemIdx]) return null;
    p.weeks[weekIdx].items[itemIdx].done = !p.weeks[weekIdx].items[itemIdx].done;
    p.updatedAt = Date.now();
    save(p); return p;
  }
  function clear() { localStorage.removeItem(_key()); window.dispatchEvent(new Event('learning-plan-changed')); }
  return { get, set, toggleItem, clear };
})();
window.LearningPlans = LearningPlans;

// ── User profile (editable) — derivado del usuario autenticado ────────────
// Lee del Auth.currentUser() y guarda los cambios en el registro de usuarios.
const UserProfile = (function() {
  const DEFAULT = { name: 'Sin sesión', role: '—', team: '—', avatarColor: 'var(--ink-3)', email: '' };
  function get() {
    var u = window.Auth ? window.Auth.currentUser() : null;
    if (!u) return Object.assign({}, DEFAULT);
    return {
      name: u.name, role: u.role, team: u.team,
      avatarColor: u.avatarColor, avatarUrl: u.avatarUrl || u.avatar_url || null,
      email: u.email,
      isAdmin: !!u.isAdmin, id: u.id,
    };
  }
  function _toShape(u) {
    if (!u) return Object.assign({}, DEFAULT);
    return {
      name: u.name, role: u.role, team: u.team,
      avatarColor: u.avatarColor, avatarUrl: u.avatarUrl || u.avatar_url || null,
      email: u.email,
      isAdmin: !!u.isAdmin, id: u.id,
    };
  }
  function update(patch) {
    var u = window.Auth ? window.Auth.currentUser() : null;
    if (!u) return DEFAULT;
    var fields = ['name', 'role', 'team', 'avatarColor', 'email', 'avatarUrl'];
    var clean = {};
    fields.forEach(function(f){ if (patch[f] !== undefined) clean[f] = patch[f]; });
    // Auth.updateUser puede ser sync (modo demo) o Promise (modo Supabase).
    // En sync, devuelve el user actualizado. En async, devuelve Promise → manejamos ambos.
    var result = window.Auth.updateUser(u.id, clean);
    var optimistic = Object.assign({}, u, clean);
    var optimisticShape = _toShape(optimistic);
    if (result && typeof result.then === 'function') {
      // Async path · disparamos el shape optimista de inmediato y refrescamos con
      // el real al resolver. Devolvemos una Promise que SIEMPRE resuelve a
      // { ok, profile, error } (nunca rechaza) · así el caller puede esperar y
      // confirmar el guardado de verdad, y los fire-and-forget no generan
      // unhandled rejection.
      window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: optimisticShape }));
      return result.then(function(realUpdated){
        var shape = realUpdated ? _toShape(realUpdated) : optimisticShape;
        if (realUpdated) window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: shape }));
        return { ok: true, profile: shape };
      }, function(e){
        console.warn('[profile] update failed', e);
        // Revierte la UI al estado previo (el optimista no se confirmó)
        window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: _toShape(u) }));
        return { ok: false, error: e };
      });
    }
    var profileShape = _toShape(result || optimistic);
    window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: profileShape }));
    return { ok: true, profile: profileShape };
  }
  function reset() {/* legacy noop */}
  // Sube avatar a Supabase Storage · bucket workspace-assets, path avatars/{uid}.{ext}.
  // Devuelve la URL pública o lanza error. Tras subir, actualiza profile.avatar_url
  // y dispara user-profile-changed para que toda la UI se refresque.
  async function uploadAvatar(file) {
    if (!file) throw new Error('Sin archivo');
    if (file.size > 2 * 1024 * 1024) throw new Error('Máx 2MB');
    var u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
    if (!u || !u.id) throw new Error('No hay sesión');
    var sb = window.supabaseClient || (typeof supabase !== 'undefined' && supabase);
    if (!sb) throw new Error('Supabase no disponible');
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().slice(0, 5);
    var path = 'avatars/' + u.id + '.' + ext + '?v=' + Date.now();
    var pathToStore = 'avatars/' + u.id + '.' + ext;
    var upRes = await sb.storage.from('workspace-assets').upload(pathToStore, file, { upsert: true, contentType: file.type });
    if (upRes.error) throw upRes.error;
    var pub = sb.storage.from('workspace-assets').getPublicUrl(pathToStore);
    var url = (pub && pub.data && pub.data.publicUrl) || null;
    if (!url) throw new Error('No se pudo resolver la URL pública');
    // Cache-bust en el front (timestamp en la URL guardada)
    url = url + '?v=' + Date.now();
    // Persiste en profiles.avatar_url via Auth.updateUser (snake_case en DB)
    if (window.Auth && window.Auth.updateUser) {
      await Promise.resolve(window.Auth.updateUser(u.id, { avatarUrl: url, avatar_url: url }));
    }
    var optimistic = Object.assign({}, u, { avatarUrl: url, avatar_url: url });
    window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: _toShape(optimistic) }));
    return url;
  }
  return { get, update, reset, uploadAvatar, DEFAULT };
})();
window.UserProfile = UserProfile;

// ── Activity log · auditoría de eventos en la plataforma ──────────────────
// Cada acción significativa (login, complete_pill, submit_video, approve, etc)
// dispara un evento que se guarda en localStorage. El admin ve un feed.
// En Supabase mode esto debería ir a una tabla 'events' (próximo commit).
const Activity = (function() {
  const KEY = 'sgson-activity-global';
  const MAX_ENTRIES = 500;

  function _load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function _save(items) { localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ENTRIES))); window.dispatchEvent(new Event('activity-changed')); }

  function log(type, meta) {
    const u = window.Auth && window.Auth.currentUser();
    const ev = {
      id: 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      type, // 'signup' | 'login' | 'logout' | 'complete_pill' | 'submit_video' | 'review_submission' | 'send_invite' | 'accept_invite' | 'bookmark_add' | 'edit_profile' | etc
      meta: meta || {},
      userId: u ? u.id : null,
      userName: u ? u.name : 'anónimo',
      userEmail: u ? u.email : null,
      avatarColor: u ? u.avatarColor : 'var(--ink-3)',
      createdAt: Date.now(),
    };
    const items = _load();
    items.unshift(ev);
    _save(items);
    return ev;
  }
  function list(filter) {
    let items = _load();
    if (filter) {
      if (filter.type) items = items.filter(i => i.type === filter.type);
      if (filter.userId) items = items.filter(i => i.userId === filter.userId);
      if (filter.since) items = items.filter(i => i.createdAt >= filter.since);
    }
    return items;
  }
  function clear() { _save([]); }
  return { log, list, clear };
})();
window.Activity = Activity;

// Hook · eventos auto-logged desde Auth (login/logout/signup)
if (typeof window !== 'undefined') {
  const _origSignup = Auth.signup;
  const _origLogin = Auth.login;
  const _origLogout = Auth.logout;
  Auth.signup = function(data) {
    const r = _origSignup.call(Auth, data);
    if (r && r.id) Activity.log('signup', { role: r.role, team: r.team });
    return r;
  };
  Auth.login = function(email, pw) {
    const r = _origLogin.call(Auth, email, pw);
    if (r && r.id) Activity.log('login', { method: 'email' });
    return r;
  };
  Auth.logout = function() {
    const u = Auth.currentUser();
    if (u) Activity.log('logout', { userId: u.id });
    return _origLogout.call(Auth);
  };
}

// ── Settings · configuración del usuario ──────────────────────────────────
const Settings = (function() {
  const KEY_PREFIX = 'sgson-settings';
  // Settings (theme, language) son del USUARIO · cross-workspace
  function _key() { return _userScopedKey(KEY_PREFIX, { global: true }); }
  const DEFAULT = {
    theme: 'auto',          // 'light' | 'dark' | 'auto'
    language: 'es',         // 'es' | 'en'
    dateFormat: 'dd/mm/yyyy',
    notifyEmail: true,
    notifyPush: false,
    notifyWhatsApp: true,
    notifyInbox: true,
    weeklySummary: true,
    digestHour: '09:00',
    showOnboarding: true,
  };
  function get() {
    try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(_key()) || '{}')); }
    catch(e) { return Object.assign({}, DEFAULT); }
  }
  function update(patch) {
    const merged = Object.assign({}, get(), patch);
    localStorage.setItem(_key(), JSON.stringify(merged));
    // Persistir idioma fuera del scope user para que LoginScreen lo respete tras logout
    if (patch && patch.language) localStorage.setItem('solid-preferred-lang', patch.language);
    window.dispatchEvent(new CustomEvent('settings-changed', { detail: merged }));
    return merged;
  }
  function reset() { localStorage.removeItem(_key()); window.dispatchEvent(new Event('settings-changed')); }
  return { get, update, reset, DEFAULT };
})();
window.Settings = Settings;

// ── I18n · diccionario de traducciones es/en/pt ───────────────────────────
// Los componentes leen via I18n.t('key.path') con fallback a la propia key.
// Reactivo a settings-changed (Settings.update({language})).
const I18n = (function() {
  const DICTIONARIES = {
    es: {
      'nav.home':'Inicio', 'nav.browse':'Catálogo', 'nav.rutas':'Rutas', 'nav.path':'Mi ruta',
      'nav.dashboard':'Analytics', 'nav.coach':'BeonAI', 'nav.wa':'Channels', 'nav.inbox':'Bandeja', 'nav.resources':'Recursos',
      'nav.saved':'Mi lista', 'nav.profile':'Mi perfil', 'nav.settings':'Ajustes',
      'nav.admin':'Admin', 'nav.manager':'Mi equipo',
      'manager.eyebrow':'Panel · Manager', 'manager.title':'Tu equipo',
      'manager.sub':'Visión de progreso, KPIs y gestión de los miembros de tu equipo',
      'manager.members':'Miembros del equipo', 'manager.invite':'✉ Invitar miembro',
      'manager.empty':'Aún no tienes miembros en tu equipo',
      'manager.emptyDesc':'Invita a tus colegas usando el botón superior.',
      'manager.gotoAdmin':'Panel admin →',
      'manager.locked':'Acceso restringido',
      'manager.lockedDesc':'Solo managers y administradores pueden ver este panel.',
      'manager.kpi.team':'Miembros de tu equipo',
      'manager.kpi.completed':'Pills completadas', 'manager.kpi.completedSub':'total acumulado del equipo',
      'manager.kpi.avg':'Progreso medio', 'manager.kpi.avgSub':'vs total catálogo',
      'manager.kpi.openInvites':'Invitaciones abiertas', 'manager.kpi.openInvitesSub':'enviadas por ti',
      'workspaces.allWorkspaces':'Tus workspaces',
      'workspaces.switch':'Cambiar workspace',
      'workspaces.title':'Workspaces',
      'workspaces.sub':'Gestiona los tenants de la plataforma. Cada workspace tiene sus propios miembros, canales y configuración.',
      'workspaces.create':'+ Nuevo workspace',
      'workspaces.createTitle':'Crear workspace',
      'workspaces.namePh':'Nombre del workspace',
      'workspaces.colorLabel':'Color principal',
      'workspaces.members':'{n} miembro', 'workspaces.membersMulti':'{n} miembros',
      'workspaces.role.owner':'Owner', 'workspaces.role.admin':'Admin', 'workspaces.role.member':'Member',
      'workspaces.empty':'Aún no hay workspaces. Crea el primero para empezar.',
      'workspaces.confirmDelete':'¿Eliminar el workspace "{name}"? Esta acción borra todos los miembros del workspace.',
      'push.title':'Notificaciones push',
      'push.sub':'Recibe avisos en tu móvil o navegador cuando hay contenido nuevo o un mensaje importante.',
      'push.notSupported':'Tu navegador no soporta notificaciones push.',
      'push.denied':'Has bloqueado las notificaciones. Habilítalas desde la configuración del navegador.',
      'push.active':'✓ Activas en este dispositivo',
      'push.inactive':'Inactivas',
      'push.enable':'🔔 Activar push',
      'push.disable':'Desactivar',
      'push.testLocal':'Test local',
      'push.testRemote':'Test desde servidor',
      'push.install':'📲 Instalar como app',
      'push.installed':'✓ Instalada como app',
      'push.installPromo':'Añade SolidStream a tu pantalla de inicio para acceso rápido y notificaciones push.',
      'common.save':'Guardar', 'common.cancel':'Cancelar', 'common.close':'Cerrar', 'common.edit':'Editar',
      'common.delete':'Borrar', 'common.confirm':'Confirmar', 'common.logout':'Cerrar sesión',
      'common.search':'Buscar', 'common.loading':'Cargando…', 'common.reset':'Restablecer',
      'common.test':'Test', 'common.apply':'Aplicar', 'common.next':'Siguiente', 'common.back':'Volver',
      'common.allReady':'Todo al día', 'common.seeAll':'Ver todo', 'common.completeRanking':'Ranking completo',
      'common.connect':'Conectar', 'common.disconnect':'Desconectar',
      'settings.title':'Ajustes', 'settings.eyebrow':'Preferencias',
      'settings.general':'General', 'settings.general.sub':'Aspecto y idioma de la plataforma.',
      'settings.theme.title':'Tema visual',
      'settings.theme.desc':'Afecta a todas las vistas excepto Inicio y Reproductor, que mantienen el dark cinematic.',
      'settings.theme.light':'Claro', 'settings.theme.dark':'Oscuro', 'settings.theme.auto':'Automático',
      'settings.language.title':'Idioma',
      'settings.language.desc':'Idioma de interfaz, notificaciones y BeonAI.',
      'profile.title':'Mi perfil', 'profile.editBtn':'✎ Editar perfil',
      'profile.name':'Nombre', 'profile.role':'Rol', 'profile.team':'Equipo',
      'profile.updated':'Perfil actualizado', 'profile.confirmLogout':'¿Cerrar sesión de',
      'profile.stats.completed':'Pills completadas', 'profile.stats.inProgress':'En curso', 'profile.stats.daysActive':'Días activo',
      'inbox.title':'Bandeja', 'inbox.tab.messages':'Mensajes', 'inbox.tab.notifs':'Notificaciones',
      'inbox.tab.releases':'Novedades', 'inbox.empty':'Bandeja vacía',
      'inbox.emptyDesc':'Cuando recibas algo, aparecerá aquí.',
      'inbox.unread':'Sin leer', 'inbox.read':'Leídos', 'inbox.markAllRead':'✓ Marcar todo como leído',
      'inbox.confirmDelete':'¿Borrar este elemento?',
      'saved.title':'Pills guardadas', 'saved.eyebrow':'Mi lista',
      'saved.empty':'Aún no tienes pills guardadas',
      'saved.emptyDesc':'Marca pills con el botón ＋ para guardarlas aquí.',
      'saved.count':'módulos en tu colección',
      'browse.title':'Todos los módulos', 'browse.eyebrow':'Catálogo completo',
      'browse.sub':'Microlearning · Catálogo de tu workspace', 'browse.all':'Todos',
      'rutas.title':'Especialízate', 'rutas.titleEm':'en tu rol',
      'rutas.eyebrow':'Rutas de certificación',
      'rutas.sub':'Cada ruta es una secuencia curada · al completarla obtienes el certificado oficial de tu workspace',
      'rutas.start':'Empezar ruta →',
      'mypath.eyebrow':'Mi ruta', 'mypath.title':'Tu progreso',
      'mypath.sub':'{completed} de {total} pills completadas · {percent}% del programa',
      'mypath.exam':'🎓 Hacer examen final', 'mypath.allRoutes':'← Todas las rutas',
      'mypath.cert.title':'Certificación global',
      'mypath.cont':'Continúa aquí', 'mypath.next':'Próximas pills recomendadas',
      'mypath.completed':'Pills completadas', 'mypath.inProgress':'En progreso', 'mypath.toStart':'Por empezar',
      'channels.title':'Tu formación,', 'channels.titleEm':'donde estés',
      'channels.eyebrow':'Canales de comunicación',
      'channels.sub':'Conecta los canales corporativos por los que quieres recibir contenido. Puedes activar varios a la vez.',
      'channels.connected.title':'Canales conectados',
      'channels.connected.sub':'{n} de {total} canales disponibles activos · puedes conectar varios a la vez.',
      'channels.primary':'★ Principal', 'channels.connect':'Conectar', 'channels.disconnect':'Desconectar',
      'channels.reauth':'🔄 Reauth', 'channels.markPrimary':'⭐ Marcar principal', 'channels.soon':'Próximamente',
      'channels.connecting':'⏳ Conectando…',
      'channels.account':'Cuenta', 'channels.today':'hoy',
      'channels.confirmDisconnect':'¿Desconectar',
      'matrix.title':'Notificaciones por canal',
      'matrix.sub':'Activa el mismo tipo de aviso en uno o varios canales a la vez. Cada columna se configura independientemente.',
      'matrix.col.type':'Tipo de notificación',
      'matrix.activeOfTotal':'{n}/{total} activas',
      'matrix.activateAll':'✓ Activar todas', 'matrix.deactivateAll':'× Desactivar todas',
      'matrix.testBtn':'📨 Test',
      'matrix.tip':'Tip · activa la misma notificación en varios canales si quieres redundancia (ej: WhatsApp + Email para deadlines críticos).',
      'matrix.activateNative':'🔔 Activar notificaciones nativas',
      'matrix.reset':'↻ Restablecer matriz',
      'matrix.lastTests':'Últimos tests',
      'matrix.empty.title':'Sin canales conectados',
      'matrix.empty.desc':'Conecta al menos un canal arriba para configurar tus notificaciones.',
      'delivery.title':'Preferencias de entrega',
      'delivery.sub':'Define cuándo y con qué frecuencia recibes contenido en tu canal.',
      'delivery.enabled.label':'Recibir contenido',
      'delivery.enabled.on':'Activo · recibirás contenido según tu programación',
      'delivery.enabled.off':'Pausado · no se enviará nada hasta reactivar',
      'delivery.next':'📨 Próximo envío', 'delivery.paused':'En pausa',
      'delivery.mode.title':'Modo de programación',
      'delivery.mode.daily':'Diario', 'delivery.mode.daily.sub':'Todos los días',
      'delivery.mode.weekdays':'Solo laborales', 'delivery.mode.weekdays.sub':'Lunes a viernes',
      'delivery.mode.weekends':'Fines de semana', 'delivery.mode.weekends.sub':'Sábado y domingo',
      'delivery.mode.weekly':'Semanal', 'delivery.mode.weekly.sub':'Un día a la semana',
      'delivery.mode.custom':'Personalizado', 'delivery.mode.custom.sub':'Elige tus días',
      'delivery.mode.smart':'Smart · IA', 'delivery.mode.smart.sub':'BeonAI elige el mejor momento',
      'delivery.days.title':'Días de la semana',
      'delivery.days.byBeonai':'· gestionado por BeonAI',
      'delivery.days.count':'{n} días a la semana',
      'delivery.time.title':'Hora exacta',
      'delivery.tz.title':'Zona horaria', 'delivery.tz.auto':'Automática',
      'delivery.maxDaily.title':'📊 Límite diario',
      'delivery.maxDaily.sub':'Máximo de mensajes que recibirás al día por este canal.',
      'delivery.testBtn':'📨 Enviar test ahora',
      'delivery.testWarn':'Conecta un canal arriba para enviar test',
      'delivery.toSettings.title':'¿Quieres elegir qué contenido recibes o tus reglas de notificación?',
      'delivery.toSettings.sub':'Tipos de contenido, suscripciones y reglas viven en Ajustes.',
      'delivery.toSettings.btn':'Ir a Ajustes →',
      'content.title':'Qué contenido quieres recibir',
      'content.sub':'Activa los formatos que quieres que te lleguen por tu canal principal.',
      'content.count':'{n}/{total} tipos activos',
      'content.format.title':'Formato del mensaje',
      'content.preview.title':'Programar posts y calendario',
      'content.preview.desc':'Aprende a agendar publicaciones en tu plataforma y revisar tu calendario semanal.',
      'content.preview.cta.solid':'▶ Ver en SolidStream',
      'content.preview.cta.web':'Abrir en web',
      'content.preview.pushManual':'9:00 · push manual',
      'subs.title':'Lo que sigues',
      'subs.sub':'Recibirás contenido nuevo de las categorías, skills, equipos y trainers que sigas.',
      'subs.activeCount':'{n} suscripciones activas',
      'subs.tab.categories':'Categorías', 'subs.tab.skills':'Skills', 'subs.tab.teams':'Equipos', 'subs.tab.trainers':'Trainers',
      'subs.summary':'Resumen de suscripciones',
      'rules.title':'Reglas de notificación',
      'rules.sub':'Controla cuándo y con qué prioridad te llegan las notificaciones.',
      'rules.active':'Activas', 'rules.muted':'En silencio ahora',
      'rules.digest.title':'Frecuencia de envío',
      'rules.quiet.title':'🌙 Horas de silencio',
      'rules.vacation.title':'🏖 Modo vacaciones',
      'rules.smart.title':'🤖 Recordatorio inteligente',
      'rules.priority.title':'Filtro por prioridad',
      'smart.eyebrow':'Smart Scheduling',
      'smart.title':'BeonAI te recomienda',
      'smart.sub':'BeonAI analiza tu historial para sugerirte el mejor momento para recibir contenido.',
      'smart.bestTime':'📨 Best time to watch',
      'smart.youHeadline':'Te llega mejor a las',
      'smart.applyBtn':'⚡ Aplicar este horario', 'smart.appliedBtn':'✓ Aplicado a Channels',
      'smart.reAnalyze':'🔄 Re-analizar', 'smart.analyzing':'⏳ Analizando…',
      'admin.title':'Panel de administración', 'admin.eyebrow':'Admin · Plataforma',
      'admin.sub':'Gestiona usuarios, invitaciones y métricas de la plataforma',
      'admin.full':'Panel completo →',
      'admin.locked':'Acceso restringido',
      'admin.users':'Usuarios', 'admin.pending':'Invitaciones', 'admin.completed':'Pills completadas', 'admin.rating':'Rating medio',
      'hero.play':'Reproducir', 'hero.more':'Más información', 'hero.sound':'Sonido',
      'home.continue.title':'Continúa, {name}', 'home.continue.sub':'donde lo dejaste', 'home.continue.fallback':'tú',
      'coach.greeting':'Hola', 'coach.askYou':'¿qué quieres dominar hoy?',
      'coach.subtitle':'Pregunta sobre cualquier tema de tu formación, tu progreso o tu día a día.',
      'coach.placeholder':'Pregunta a BeonAI…',
      'coach.new':'Nueva conversación',
      'coach.empty':'Aún no tienes conversaciones.',
      'detail.relatedTitle':'Más pills de', 'detail.affinity':'% afinidad',
      'palette.placeholder':'Buscar módulos, vistas, profesores…',
      'palette.navigation':'Navegación', 'palette.modules':'Módulos',
      'palette.noResults':'Sin resultados para',
      'palette.goTo':'IR A',
      // Login
      'login.eyebrow':'★ Plataforma de formación cinematográfica · 2026',
      'login.title.l1':'Forma', 'login.title.l2':'a tu equipo', 'login.title.l3':'a tu',
      'login.title.expert':'ritmo',
      'login.subtitle':'Microlearning en vídeo · BeonAI integrado · seguimiento de progreso en tiempo real.',
      'login.chip.pills':'Microlearning', 'login.chip.workshops':'Talleres en directo',
      'login.chip.beonai':'BeonAI · Claude 4.5', 'login.chip.cert':'Certificado oficial',
      'login.poweredBy':'Powered by Claude',
      'login.mode.login':'Iniciar sesión', 'login.mode.signup':'Crear cuenta',
      'login.invite.title':'Invitación recibida',
      'login.invite.body':'Has sido invitado a unirte a SolidStream por {team} como {role}.',
      'login.welcome':'Bienvenido de vuelta',
      'login.welcomeCreated':'Cuenta creada · Bienvenido a SolidStream',
      'login.welcomeInvite':'Bienvenido · invitación aceptada',
      'login.sessionStarted':'Sesión iniciada',
      'login.email':'Email', 'login.password':'Contraseña', 'login.name':'Nombre completo',
      'login.role':'Rol', 'login.team':'Equipo',
      'login.submit.login':'Acceder', 'login.submit.signup':'Crear cuenta',
      'login.submitting':'Procesando…',
      'login.sso':'Continuar con Microsoft', 'login.ssoOr':'o',
      'login.toggleToSignup':'¿No tienes cuenta? Crear una',
      'login.toggleToLogin':'¿Ya tienes cuenta? Inicia sesión',
      'login.quickDemo':'Accesos rápidos · modo demo',
      'login.errorGeneric':'Error desconocido',
      // Onboarding
      'onboarding.skip':'Saltar', 'onboarding.next':'Siguiente', 'onboarding.finish':'Empezar',
      'onboarding.back':'← Atrás', 'onboarding.continue':'Continuar →',
      'onboarding.enter':'Entrar en SolidStream →',
      'onboarding.stepOf':'{step} · De {total}',
      'onboarding.s1.title.l1':'¿En qué área quieres',
      'onboarding.s1.title.l2':'quieres certificarte?',
      'onboarding.s1.titleEm':'certificarte',
      'onboarding.s1.lead':'Selecciona las áreas prioritarias. Tu ruta de formación se construirá en torno a ellas — puedes cambiarlas después.',
      'onboarding.s2.title.l1':'¿Cuál es tu rol',
      'onboarding.s2.title.l2':'en tu empresa?',
      'onboarding.s2.titleEm':'rol',
      'onboarding.s2.lead':'Personalizamos el orden de los módulos y los casos prácticos según tu función en el equipo de comunicación.',
      'onboarding.s3.title':'¿Cómo quieres aprender?',
      'onboarding.s3.titleEm':'aprender',
      'onboarding.s3.lead':'Elige cómo quieres recibir tu formación. Puedes activar o desactivar cada canal en cualquier momento desde tu perfil.',
      'onboarding.s4.title':'Tu agente IA te espera.',
      'onboarding.s4.titleEm':'te espera',
      'onboarding.s4.lead':'Conoce los flujos de tu empresa, tu progreso y las guías de tu formación. Pregúntale cualquier cosa — en cualquier momento.',
      'onboarding.s4.message':'Hola. Basándome en tu rol de {role} y las áreas que has elegido, te preparo una ruta de 4 semanas y 10 módulos. ¿Empezamos?',
      'onboarding.s4.cta':'Sí — entrar en SolidStream →',
      'onboarding.s4.more':'Cuéntame más', 'onboarding.s4.hide':'Ocultar',
      'onboarding.s4.featuresTitle':'Qué hace BeonAI',
      'onboarding.s4.f1':'Resuelve dudas de tu formación en el contexto de tu empresa con respuestas accionables',
      'onboarding.s4.f2':'Te recomienda el próximo módulo basándose en tu progreso y rol',
      'onboarding.s4.f3':'Genera quizzes personalizados para repasar lo aprendido',
      'onboarding.s4.f4':'Conoce todo el catálogo de tu workspace y sabe qué módulo cubre cada tema',
      'onboarding.s4.f5':'Funciona desde la barra lateral, en pantalla completa o por WhatsApp',
      'onboarding.role.publish':'Publish Agent',  'onboarding.role.publish.sub':'Publico y apruebo contenido en plataformas digitales',
      'onboarding.role.content':'Content Lead',   'onboarding.role.content.sub':'Lidero la estrategia de contenidos',
      'onboarding.role.analytics':'Analytics Lead','onboarding.role.analytics.sub':'Analizo rendimiento de campañas',
      'onboarding.role.it':'IT / Integraciones',   'onboarding.role.it.sub':'Gestiono la integración con los sistemas internos',
      'onboarding.role.direccion':'Dirección',     'onboarding.role.direccion.sub':'Necesito visión global de la plataforma',
      'onboarding.area.publish':'Social Publish', 'onboarding.area.aprobs':'Aprobaciones',
      'onboarding.area.calendar':'Calendario editorial', 'onboarding.area.analytics':'Analytics y Reporting',
      'onboarding.area.dam':'Activos DAM', 'onboarding.area.compliance':'Compliance',
      'onboarding.area.care':'Care y Atención al cliente', 'onboarding.area.salesforce':'Integraciones Salesforce',
      'onboarding.area.gov':'Gobernanza y roles', 'onboarding.area.fundamentals':'Fundamentos',
      'onboarding.notif.daily':'Recordatorio diario en WhatsApp, 9:00',
      'onboarding.notif.daily.sub':'Un módulo cada mañana. Sin ruido extra.',
      'onboarding.notif.free':'Acceso libre desde la app',
      'onboarding.notif.free.sub':'Entro cuando tengo tiempo, sin notificaciones.',
      'onboarding.notif.weekly':'Resumen semanal por email (viernes)',
      'onboarding.notif.weekly.sub':'Qué aprendiste, qué viene la próxima semana.',
      'onboarding.notif.meeting':'Alertas antes de reuniones formativas',
      'onboarding.notif.meeting.sub':'El agente te manda un módulo relevante 30 min antes.',
      'onboarding.complete':'Onboarding completado · Bienvenido a SolidStream',
      'onboarding.cert':'Certificación oficial',
      'onboarding.certOfficial':'Certificación oficial · 2026',
    },
    en: {
      'nav.home':'Home', 'nav.browse':'Catalog', 'nav.rutas':'Paths', 'nav.path':'My path',
      'nav.dashboard':'Analytics', 'nav.coach':'BeonAI', 'nav.wa':'Channels', 'nav.inbox':'Inbox', 'nav.resources':'Resources',
      'nav.saved':'My list', 'nav.profile':'My profile', 'nav.settings':'Settings',
      'nav.admin':'Admin', 'nav.manager':'My team',
      'manager.eyebrow':'Panel · Manager', 'manager.title':'Your team',
      'manager.sub':'Progress overview, KPIs and management of your team members',
      'manager.members':'Team members', 'manager.invite':'✉ Invite member',
      'manager.empty':'You don\'t have team members yet',
      'manager.emptyDesc':'Invite your colleagues using the top button.',
      'manager.gotoAdmin':'Admin panel →',
      'manager.locked':'Access restricted',
      'manager.lockedDesc':'Only managers and administrators can view this panel.',
      'manager.kpi.team':'Team members',
      'manager.kpi.completed':'Pills completed', 'manager.kpi.completedSub':'team accumulated total',
      'manager.kpi.avg':'Average progress', 'manager.kpi.avgSub':'vs full catalog',
      'manager.kpi.openInvites':'Open invitations', 'manager.kpi.openInvitesSub':'sent by you',
      'workspaces.allWorkspaces':'Your workspaces',
      'workspaces.switch':'Switch workspace',
      'workspaces.title':'Workspaces',
      'workspaces.sub':'Manage platform tenants. Each workspace has its own members, channels and settings.',
      'workspaces.create':'+ New workspace',
      'workspaces.createTitle':'Create workspace',
      'workspaces.namePh':'Workspace name',
      'workspaces.colorLabel':'Primary color',
      'workspaces.members':'{n} member', 'workspaces.membersMulti':'{n} members',
      'workspaces.role.owner':'Owner', 'workspaces.role.admin':'Admin', 'workspaces.role.member':'Member',
      'workspaces.empty':'No workspaces yet. Create the first one to get started.',
      'workspaces.confirmDelete':'Delete workspace "{name}"? This removes all workspace members.',
      'push.title':'Push notifications',
      'push.sub':'Get alerts on your phone or browser when there\'s new content or an important message.',
      'push.notSupported':'Your browser doesn\'t support push notifications.',
      'push.denied':'You\'ve blocked notifications. Enable them in browser settings.',
      'push.active':'✓ Active on this device',
      'push.inactive':'Inactive',
      'push.enable':'🔔 Enable push',
      'push.disable':'Disable',
      'push.testLocal':'Local test',
      'push.testRemote':'Server test',
      'push.install':'📲 Install as app',
      'push.installed':'✓ Installed as app',
      'push.installPromo':'Add SolidStream to your home screen for quick access and push notifications.',
      'common.save':'Save', 'common.cancel':'Cancel', 'common.close':'Close', 'common.edit':'Edit',
      'common.delete':'Delete', 'common.confirm':'Confirm', 'common.logout':'Log out',
      'common.search':'Search', 'common.loading':'Loading…', 'common.reset':'Reset',
      'common.test':'Test', 'common.apply':'Apply', 'common.next':'Next', 'common.back':'Back',
      'common.allReady':'All caught up', 'common.seeAll':'See all', 'common.completeRanking':'Full ranking',
      'common.connect':'Connect', 'common.disconnect':'Disconnect',
      'settings.title':'Settings', 'settings.eyebrow':'Preferences',
      'settings.general':'General', 'settings.general.sub':'Platform appearance and language.',
      'settings.theme.title':'Visual theme',
      'settings.theme.desc':'Affects all views except Home and Player, which stay in cinematic dark.',
      'settings.theme.light':'Light', 'settings.theme.dark':'Dark', 'settings.theme.auto':'Automatic',
      'settings.language.title':'Language',
      'settings.language.desc':'Language for interface, notifications and BeonAI.',
      'profile.title':'My profile', 'profile.editBtn':'✎ Edit profile',
      'profile.name':'Name', 'profile.role':'Role', 'profile.team':'Team',
      'profile.updated':'Profile updated', 'profile.confirmLogout':'Log out of',
      'profile.stats.completed':'Pills completed', 'profile.stats.inProgress':'In progress', 'profile.stats.daysActive':'Active days',
      'inbox.title':'Inbox', 'inbox.tab.messages':'Messages', 'inbox.tab.notifs':'Notifications',
      'inbox.tab.releases':'What\'s new', 'inbox.empty':'Inbox empty',
      'inbox.emptyDesc':'When you receive something, it will appear here.',
      'inbox.unread':'Unread', 'inbox.read':'Read', 'inbox.markAllRead':'✓ Mark all as read',
      'inbox.confirmDelete':'Delete this item?',
      'saved.title':'Saved pills', 'saved.eyebrow':'My list',
      'saved.empty':'You have no saved pills yet',
      'saved.emptyDesc':'Mark pills with the ＋ button to save them here.',
      'saved.count':'modules in your collection',
      'browse.title':'All modules', 'browse.eyebrow':'Full catalog',
      'browse.sub':'Microlearning · Catálogo de tu workspace', 'browse.all':'All',
      'rutas.title':'Specialize', 'rutas.titleEm':'in your role',
      'rutas.eyebrow':'Certification paths',
      'rutas.sub':'Each path is a curated sequence · completing it earns you the official certificate of your workspace',
      'rutas.start':'Start path →',
      'mypath.eyebrow':'My path', 'mypath.title':'Your progress',
      'mypath.sub':'{completed} of {total} pills completed · {percent}% of the program',
      'mypath.exam':'🎓 Take final exam', 'mypath.allRoutes':'← All paths',
      'mypath.cert.title':'Overall certification',
      'mypath.cont':'Continue here', 'mypath.next':'Recommended next pills',
      'mypath.completed':'Pills completed', 'mypath.inProgress':'In progress', 'mypath.toStart':'To start',
      'channels.title':'Your training,', 'channels.titleEm':'wherever you are',
      'channels.eyebrow':'Communication channels',
      'channels.sub':'Connect the corporate channels you want to receive content on. You can activate several at once.',
      'channels.connected.title':'Connected channels',
      'channels.connected.sub':'{n} of {total} available channels active · you can connect several at once.',
      'channels.primary':'★ Primary', 'channels.connect':'Connect', 'channels.disconnect':'Disconnect',
      'channels.reauth':'🔄 Reauth', 'channels.markPrimary':'⭐ Make primary', 'channels.soon':'Coming soon',
      'channels.connecting':'⏳ Connecting…',
      'channels.account':'Account', 'channels.today':'today',
      'channels.confirmDisconnect':'Disconnect',
      'matrix.title':'Notifications by channel',
      'matrix.sub':'Enable the same notification type on one or multiple channels at the same time. Each column is configured independently.',
      'matrix.col.type':'Notification type',
      'matrix.activeOfTotal':'{n}/{total} active',
      'matrix.activateAll':'✓ Enable all', 'matrix.deactivateAll':'× Disable all',
      'matrix.testBtn':'📨 Test',
      'matrix.tip':'Tip · enable the same notification on multiple channels for redundancy (e.g. WhatsApp + Email for critical deadlines).',
      'matrix.activateNative':'🔔 Enable native notifications',
      'matrix.reset':'↻ Reset matrix',
      'matrix.lastTests':'Recent tests',
      'matrix.empty.title':'No channels connected',
      'matrix.empty.desc':'Connect at least one channel above to configure your notifications.',
      'delivery.title':'Delivery preferences',
      'delivery.sub':'Define when and how often you receive content in your channel.',
      'delivery.enabled.label':'Receive content',
      'delivery.enabled.on':'On · you will receive content as scheduled',
      'delivery.enabled.off':'Paused · nothing will be sent until reactivated',
      'delivery.next':'📨 Next delivery', 'delivery.paused':'Paused',
      'delivery.mode.title':'Scheduling mode',
      'delivery.mode.daily':'Daily', 'delivery.mode.daily.sub':'Every day',
      'delivery.mode.weekdays':'Weekdays only', 'delivery.mode.weekdays.sub':'Monday to Friday',
      'delivery.mode.weekends':'Weekends', 'delivery.mode.weekends.sub':'Saturday and Sunday',
      'delivery.mode.weekly':'Weekly', 'delivery.mode.weekly.sub':'One day a week',
      'delivery.mode.custom':'Custom', 'delivery.mode.custom.sub':'Choose your days',
      'delivery.mode.smart':'Smart · AI', 'delivery.mode.smart.sub':'BeonAI picks the best moment',
      'delivery.days.title':'Days of the week',
      'delivery.days.byBeonai':'· managed by BeonAI',
      'delivery.days.count':'{n} days a week',
      'delivery.time.title':'Exact time',
      'delivery.tz.title':'Time zone', 'delivery.tz.auto':'Automatic',
      'delivery.maxDaily.title':'📊 Daily limit',
      'delivery.maxDaily.sub':'Maximum number of messages you will receive per day on this channel.',
      'delivery.testBtn':'📨 Send test now',
      'delivery.testWarn':'Connect a channel above to send a test',
      'delivery.toSettings.title':'Want to choose what content you receive or your notification rules?',
      'delivery.toSettings.sub':'Content types, subscriptions and rules live in Settings.',
      'delivery.toSettings.btn':'Go to Settings →',
      'content.title':'What content do you want to receive',
      'content.sub':'Enable the formats you want delivered through your main channel.',
      'content.count':'{n}/{total} types active',
      'content.format.title':'Message format',
      'content.preview.title':'Schedule posts and calendar',
      'content.preview.desc':'Learn how to schedule publications in your platform and review your weekly calendar.',
      'content.preview.cta.solid':'▶ Watch on SolidStream',
      'content.preview.cta.web':'Open on web',
      'content.preview.pushManual':'9:00 · manual push',
      'subs.title':'What you follow',
      'subs.sub':'You\'ll receive new content from the categories, skills, teams and trainers you follow.',
      'subs.activeCount':'{n} active subscriptions',
      'subs.tab.categories':'Categories', 'subs.tab.skills':'Skills', 'subs.tab.teams':'Teams', 'subs.tab.trainers':'Trainers',
      'subs.summary':'Subscription summary',
      'rules.title':'Notification rules',
      'rules.sub':'Control when and with what priority notifications reach you.',
      'rules.active':'Active', 'rules.muted':'Muted now',
      'rules.digest.title':'Delivery frequency',
      'rules.quiet.title':'🌙 Quiet hours',
      'rules.vacation.title':'🏖 Vacation mode',
      'rules.smart.title':'🤖 Smart reminder',
      'rules.priority.title':'Priority filter',
      'smart.eyebrow':'Smart Scheduling',
      'smart.title':'BeonAI recommends',
      'smart.sub':'BeonAI analyzes your history to suggest the best moment to receive content.',
      'smart.bestTime':'📨 Best time to watch',
      'smart.youHeadline':'Best for you at',
      'smart.applyBtn':'⚡ Apply this schedule', 'smart.appliedBtn':'✓ Applied to Channels',
      'smart.reAnalyze':'🔄 Re-analyze', 'smart.analyzing':'⏳ Analyzing…',
      'admin.title':'Admin panel', 'admin.eyebrow':'Admin · Plataforma',
      'admin.sub':'Manage users, invitations and platform metrics',
      'admin.full':'Full panel →',
      'admin.locked':'Access restricted',
      'admin.users':'Users', 'admin.pending':'Invitations', 'admin.completed':'Pills completed', 'admin.rating':'Average rating',
      'hero.play':'Play', 'hero.more':'More info', 'hero.sound':'Sound',
      'home.continue.title':'Keep going, {name}', 'home.continue.sub':'where you left off', 'home.continue.fallback':'you',
      'coach.greeting':'Hi', 'coach.askYou':'what do you want to master today?',
      'coach.subtitle':'Ask anything about your training, progress or daily work.',
      'coach.placeholder':'Ask BeonAI…',
      'coach.new':'New conversation',
      'coach.empty':'You don\'t have any conversations yet.',
      'detail.relatedTitle':'More pills from', 'detail.affinity':'% match',
      'palette.placeholder':'Search modules, views, teachers…',
      'palette.navigation':'Navigation', 'palette.modules':'Modules',
      'palette.noResults':'No results for',
      'palette.goTo':'GO TO',
      // Login
      'login.eyebrow':'★ Cinematic learning platform · 2026',
      'login.title.l1':'Train', 'login.title.l2':'your team', 'login.title.l3':'at your',
      'login.title.expert':'pace',
      'login.subtitle':'Video microlearning · Integrated AI assistant · Real-time progress tracking.',
      'login.chip.pills':'Microlearning', 'login.chip.workshops':'Live workshops',
      'login.chip.beonai':'BeonAI · Claude 4.5', 'login.chip.cert':'Official Certificate',
      'login.poweredBy':'Powered by Claude',
      'login.mode.login':'Sign in', 'login.mode.signup':'Create account',
      'login.invite.title':'Invitation received',
      'login.invite.body':'You\'ve been invited to join SolidStream by {team} as {role}.',
      'login.welcome':'Welcome back',
      'login.welcomeCreated':'Account created · Welcome to SolidStream',
      'login.welcomeInvite':'Welcome · invitation accepted',
      'login.sessionStarted':'Session started',
      'login.email':'Email', 'login.password':'Password', 'login.name':'Full name',
      'login.role':'Role', 'login.team':'Team',
      'login.submit.login':'Sign in', 'login.submit.signup':'Create account',
      'login.submitting':'Processing…',
      'login.sso':'Continue with Microsoft', 'login.ssoOr':'or',
      'login.toggleToSignup':'Don\'t have an account? Create one',
      'login.toggleToLogin':'Already have an account? Sign in',
      'login.quickDemo':'Quick access · demo mode',
      'login.errorGeneric':'Unknown error',
      // Onboarding
      'onboarding.skip':'Skip', 'onboarding.next':'Next', 'onboarding.finish':'Get started',
      'onboarding.back':'← Back', 'onboarding.continue':'Continue →',
      'onboarding.enter':'Enter SolidStream →',
      'onboarding.stepOf':'{step} · Of {total}',
      'onboarding.s1.title.l1':'Which area do you want',
      'onboarding.s1.title.l2':'do you want to get certified in?',
      'onboarding.s1.titleEm':'certified',
      'onboarding.s1.lead':'Select your priority areas. Your training path will be built around them — you can change them later.',
      'onboarding.s2.title.l1':'What\'s your role',
      'onboarding.s2.title.l2':'at your company?',
      'onboarding.s2.titleEm':'role',
      'onboarding.s2.lead':'We tailor the module order and case studies to your function in the communications team.',
      'onboarding.s3.title':'How do you want to learn?',
      'onboarding.s3.titleEm':'learn',
      'onboarding.s3.lead':'Choose how you want to receive your training. You can enable or disable each channel anytime from your profile.',
      'onboarding.s4.title':'Your AI agent is waiting.',
      'onboarding.s4.titleEm':'is waiting',
      'onboarding.s4.lead':'Knows your company flows, your progress and your training guides. Ask it anything — anytime.',
      'onboarding.s4.message':'Hi. Based on your {role} role and the areas you chose, I\'m preparing a 4-week, 10-module path. Shall we start?',
      'onboarding.s4.cta':'Yes — enter SolidStream →',
      'onboarding.s4.more':'Tell me more', 'onboarding.s4.hide':'Hide',
      'onboarding.s4.featuresTitle':'What BeonAI does',
      'onboarding.s4.f1':'Solves training questions in your company context with actionable answers',
      'onboarding.s4.f2':'Recommends your next module based on progress and role',
      'onboarding.s4.f3':'Generates personalized quizzes to review what you\'ve learned',
      'onboarding.s4.f4':'Knows your full catalog and which module covers each topic',
      'onboarding.s4.f5':'Works from the sidebar, fullscreen or via WhatsApp',
      'onboarding.role.publish':'Publish Agent',  'onboarding.role.publish.sub':'I publish and approve content on digital platforms',
      'onboarding.role.content':'Content Lead',   'onboarding.role.content.sub':'I lead the content strategy',
      'onboarding.role.analytics':'Analytics Lead','onboarding.role.analytics.sub':'I analyze campaign performance',
      'onboarding.role.it':'IT / Integrations',    'onboarding.role.it.sub':'I manage integration with internal systems',
      'onboarding.role.direccion':'Management',    'onboarding.role.direccion.sub':'I need a platform-wide view',
      'onboarding.area.publish':'Social Publish', 'onboarding.area.aprobs':'Approvals',
      'onboarding.area.calendar':'Editorial calendar', 'onboarding.area.analytics':'Analytics & Reporting',
      'onboarding.area.dam':'DAM Assets', 'onboarding.area.compliance':'Compliance',
      'onboarding.area.care':'Customer Care', 'onboarding.area.salesforce':'Salesforce Integrations',
      'onboarding.area.gov':'Governance & roles', 'onboarding.area.fundamentals':'Fundamentos',
      'onboarding.notif.daily':'Daily reminder on WhatsApp, 9:00',
      'onboarding.notif.daily.sub':'One module every morning. No extra noise.',
      'onboarding.notif.free':'Free access from the app',
      'onboarding.notif.free.sub':'I open it when I have time, no notifications.',
      'onboarding.notif.weekly':'Weekly summary by email (Friday)',
      'onboarding.notif.weekly.sub':'What you learned, what\'s coming next week.',
      'onboarding.notif.meeting':'Alerts before training meetings',
      'onboarding.notif.meeting.sub':'The agent sends you a relevant module 30 min before.',
      'onboarding.complete':'Onboarding completed · Welcome to SolidStream',
      'onboarding.cert':'Official certification',
      'onboarding.certOfficial':'Official certification · 2026',
    },
    pt: {
      'nav.home':'Início', 'nav.browse':'Catálogo', 'nav.rutas':'Trilhas', 'nav.path':'Minha trilha',
      'nav.dashboard':'Analytics', 'nav.coach':'BeonAI', 'nav.wa':'Canais', 'nav.inbox':'Caixa', 'nav.resources':'Recursos',
      'nav.saved':'Minha lista', 'nav.profile':'Meu perfil', 'nav.settings':'Ajustes',
      'nav.admin':'Admin', 'nav.manager':'Minha equipe',
      'manager.eyebrow':'Painel · Manager', 'manager.title':'Sua equipe',
      'manager.sub':'Visão de progresso, KPIs e gestão dos membros de sua equipe',
      'manager.members':'Membros da equipe', 'manager.invite':'✉ Convidar membro',
      'manager.empty':'Ainda não tem membros em sua equipe',
      'manager.emptyDesc':'Convide seus colegas usando o botão superior.',
      'manager.gotoAdmin':'Painel admin →',
      'manager.locked':'Acesso restrito',
      'manager.lockedDesc':'Apenas managers e administradores podem ver este painel.',
      'manager.kpi.team':'Membros da equipe',
      'manager.kpi.completed':'Pills concluídas', 'manager.kpi.completedSub':'total acumulado da equipe',
      'manager.kpi.avg':'Progresso médio', 'manager.kpi.avgSub':'vs catálogo total',
      'manager.kpi.openInvites':'Convites abertos', 'manager.kpi.openInvitesSub':'enviados por você',
      'workspaces.allWorkspaces':'Seus workspaces',
      'workspaces.switch':'Trocar workspace',
      'workspaces.title':'Workspaces',
      'workspaces.sub':'Gerencie os tenants da plataforma. Cada workspace tem seus próprios membros, canais e configurações.',
      'workspaces.create':'+ Novo workspace',
      'workspaces.createTitle':'Criar workspace',
      'workspaces.namePh':'Nome do workspace',
      'workspaces.colorLabel':'Cor principal',
      'workspaces.members':'{n} membro', 'workspaces.membersMulti':'{n} membros',
      'workspaces.role.owner':'Owner', 'workspaces.role.admin':'Admin', 'workspaces.role.member':'Member',
      'workspaces.empty':'Ainda não há workspaces. Crie o primeiro para começar.',
      'workspaces.confirmDelete':'Excluir o workspace "{name}"? Esta ação remove todos os membros do workspace.',
      'push.title':'Notificações push',
      'push.sub':'Receba avisos no seu celular ou navegador quando há conteúdo novo ou uma mensagem importante.',
      'push.notSupported':'Seu navegador não suporta notificações push.',
      'push.denied':'Você bloqueou as notificações. Ative-as nas configurações do navegador.',
      'push.active':'✓ Ativas neste dispositivo',
      'push.inactive':'Inativas',
      'push.enable':'🔔 Ativar push',
      'push.disable':'Desativar',
      'push.testLocal':'Teste local',
      'push.testRemote':'Teste do servidor',
      'push.install':'📲 Instalar como app',
      'push.installed':'✓ Instalado como app',
      'push.installPromo':'Adicione SolidStream à tela inicial para acesso rápido e notificações push.',
      'common.save':'Salvar', 'common.cancel':'Cancelar', 'common.close':'Fechar', 'common.edit':'Editar',
      'common.delete':'Excluir', 'common.confirm':'Confirmar', 'common.logout':'Sair',
      'common.search':'Buscar', 'common.loading':'Carregando…', 'common.reset':'Redefinir',
      'common.test':'Teste', 'common.apply':'Aplicar', 'common.next':'Próximo', 'common.back':'Voltar',
      'common.allReady':'Tudo em dia', 'common.seeAll':'Ver tudo', 'common.completeRanking':'Ranking completo',
      'common.connect':'Conectar', 'common.disconnect':'Desconectar',
      'settings.title':'Ajustes', 'settings.eyebrow':'Preferências',
      'settings.general':'Geral', 'settings.general.sub':'Aparência e idioma da plataforma.',
      'settings.theme.title':'Tema visual',
      'settings.theme.desc':'Afeta todas as vistas exceto Início e Reprodutor, que mantêm o dark cinematográfico.',
      'settings.theme.light':'Claro', 'settings.theme.dark':'Escuro', 'settings.theme.auto':'Automático',
      'settings.language.title':'Idioma',
      'settings.language.desc':'Idioma da interface, notificações e BeonAI.',
      'profile.title':'Meu perfil', 'profile.editBtn':'✎ Editar perfil',
      'profile.name':'Nome', 'profile.role':'Cargo', 'profile.team':'Equipe',
      'profile.updated':'Perfil atualizado', 'profile.confirmLogout':'Sair da conta de',
      'profile.stats.completed':'Pills concluídas', 'profile.stats.inProgress':'Em curso', 'profile.stats.daysActive':'Dias ativo',
      'inbox.title':'Caixa', 'inbox.tab.messages':'Mensagens', 'inbox.tab.notifs':'Notificações',
      'inbox.tab.releases':'Novidades', 'inbox.empty':'Caixa vazia',
      'inbox.emptyDesc':'Quando receber algo, aparecerá aqui.',
      'inbox.unread':'Não lidas', 'inbox.read':'Lidas', 'inbox.markAllRead':'✓ Marcar tudo como lido',
      'inbox.confirmDelete':'Excluir este item?',
      'saved.title':'Pills salvas', 'saved.eyebrow':'Minha lista',
      'saved.empty':'Ainda não tem pills salvas',
      'saved.emptyDesc':'Marque pills com o botão ＋ para salvar aqui.',
      'saved.count':'módulos na sua coleção',
      'browse.title':'Todos os módulos', 'browse.eyebrow':'Catálogo completo',
      'browse.sub':'Microlearning · Catálogo de tu workspace', 'browse.all':'Todos',
      'rutas.title':'Especialize-se', 'rutas.titleEm':'em seu cargo',
      'rutas.eyebrow':'Trilhas de certificação',
      'rutas.sub':'Cada trilha é uma sequência curada · ao completá-la você obtém o certificado oficial de tu workspace',
      'rutas.start':'Começar trilha →',
      'mypath.eyebrow':'Minha trilha', 'mypath.title':'Seu progresso',
      'mypath.sub':'{completed} de {total} pills concluídas · {percent}% do programa',
      'mypath.exam':'🎓 Fazer prova final', 'mypath.allRoutes':'← Todas as trilhas',
      'mypath.cert.title':'Certificação global',
      'mypath.cont':'Continue aqui', 'mypath.next':'Próximas pills recomendadas',
      'mypath.completed':'Pills concluídas', 'mypath.inProgress':'Em progresso', 'mypath.toStart':'Para começar',
      'channels.title':'Sua formação,', 'channels.titleEm':'onde você estiver',
      'channels.eyebrow':'Canais de comunicação',
      'channels.sub':'Conecte os canais corporativos pelos quais quer receber conteúdo. Pode ativar vários ao mesmo tempo.',
      'channels.connected.title':'Canais conectados',
      'channels.connected.sub':'{n} de {total} canais disponíveis ativos · pode conectar vários ao mesmo tempo.',
      'channels.primary':'★ Principal', 'channels.connect':'Conectar', 'channels.disconnect':'Desconectar',
      'channels.reauth':'🔄 Reauth', 'channels.markPrimary':'⭐ Marcar como principal', 'channels.soon':'Em breve',
      'channels.connecting':'⏳ Conectando…',
      'channels.account':'Conta', 'channels.today':'hoje',
      'channels.confirmDisconnect':'Desconectar',
      'matrix.title':'Notificações por canal',
      'matrix.sub':'Ative o mesmo tipo de aviso em um ou vários canais ao mesmo tempo. Cada coluna se configura independentemente.',
      'matrix.col.type':'Tipo de notificação',
      'matrix.activeOfTotal':'{n}/{total} ativas',
      'matrix.activateAll':'✓ Ativar todas', 'matrix.deactivateAll':'× Desativar todas',
      'matrix.testBtn':'📨 Teste',
      'matrix.tip':'Dica · ative a mesma notificação em vários canais se quiser redundância (ex: WhatsApp + Email para deadlines críticos).',
      'matrix.activateNative':'🔔 Ativar notificações nativas',
      'matrix.reset':'↻ Redefinir matriz',
      'matrix.lastTests':'Últimos testes',
      'matrix.empty.title':'Sem canais conectados',
      'matrix.empty.desc':'Conecte ao menos um canal acima para configurar suas notificações.',
      'delivery.title':'Preferências de entrega',
      'delivery.sub':'Defina quando e com que frequência recebe conteúdo no seu canal.',
      'delivery.enabled.label':'Receber conteúdo',
      'delivery.enabled.on':'Ativo · você receberá conteúdo segundo sua programação',
      'delivery.enabled.off':'Pausado · nada será enviado até reativar',
      'delivery.next':'📨 Próximo envio', 'delivery.paused':'Em pausa',
      'delivery.mode.title':'Modo de programação',
      'delivery.mode.daily':'Diário', 'delivery.mode.daily.sub':'Todos os dias',
      'delivery.mode.weekdays':'Apenas dias úteis', 'delivery.mode.weekdays.sub':'Segunda a sexta',
      'delivery.mode.weekends':'Finais de semana', 'delivery.mode.weekends.sub':'Sábado e domingo',
      'delivery.mode.weekly':'Semanal', 'delivery.mode.weekly.sub':'Um dia por semana',
      'delivery.mode.custom':'Personalizado', 'delivery.mode.custom.sub':'Escolha seus dias',
      'delivery.mode.smart':'Smart · IA', 'delivery.mode.smart.sub':'BeonAI escolhe o melhor momento',
      'delivery.days.title':'Dias da semana',
      'delivery.days.byBeonai':'· gerenciado pelo BeonAI',
      'delivery.days.count':'{n} dias por semana',
      'delivery.time.title':'Hora exata',
      'delivery.tz.title':'Fuso horário', 'delivery.tz.auto':'Automático',
      'delivery.maxDaily.title':'📊 Limite diário',
      'delivery.maxDaily.sub':'Máximo de mensagens que receberá por dia neste canal.',
      'delivery.testBtn':'📨 Enviar teste agora',
      'delivery.testWarn':'Conecte um canal acima para enviar teste',
      'delivery.toSettings.title':'Quer escolher que conteúdo recebe ou suas regras de notificação?',
      'delivery.toSettings.sub':'Tipos de conteúdo, assinaturas e regras vivem em Ajustes.',
      'delivery.toSettings.btn':'Ir para Ajustes →',
      'content.title':'Que conteúdo quer receber',
      'content.sub':'Ative os formatos que quer que cheguem pelo seu canal principal.',
      'content.count':'{n}/{total} tipos ativos',
      'content.format.title':'Formato da mensagem',
      'content.preview.title':'Agendar posts e calendário',
      'content.preview.desc':'Aprenda a agendar publicações no sua plataforma e revisar seu calendário semanal.',
      'content.preview.cta.solid':'▶ Ver no SolidStream',
      'content.preview.cta.web':'Abrir na web',
      'content.preview.pushManual':'9:00 · push manual',
      'subs.title':'O que você segue',
      'subs.sub':'Você receberá conteúdo novo das categorias, skills, equipes e trainers que segue.',
      'subs.activeCount':'{n} assinaturas ativas',
      'subs.tab.categories':'Categorias', 'subs.tab.skills':'Skills', 'subs.tab.teams':'Equipes', 'subs.tab.trainers':'Trainers',
      'subs.summary':'Resumo de assinaturas',
      'rules.title':'Regras de notificação',
      'rules.sub':'Controle quando e com que prioridade as notificações chegam.',
      'rules.active':'Ativas', 'rules.muted':'Em silêncio agora',
      'rules.digest.title':'Frequência de envio',
      'rules.quiet.title':'🌙 Horas de silêncio',
      'rules.vacation.title':'🏖 Modo férias',
      'rules.smart.title':'🤖 Lembrete inteligente',
      'rules.priority.title':'Filtro por prioridade',
      'smart.eyebrow':'Smart Scheduling',
      'smart.title':'BeonAI recomenda',
      'smart.sub':'BeonAI analisa seu histórico para sugerir o melhor momento para receber conteúdo.',
      'smart.bestTime':'📨 Best time to watch',
      'smart.youHeadline':'Melhor para você às',
      'smart.applyBtn':'⚡ Aplicar este horário', 'smart.appliedBtn':'✓ Aplicado a Canais',
      'smart.reAnalyze':'🔄 Re-analisar', 'smart.analyzing':'⏳ Analisando…',
      'admin.title':'Painel de administração', 'admin.eyebrow':'Admin · Plataforma',
      'admin.sub':'Gerencie usuários, convites e métricas da plataforma',
      'admin.full':'Painel completo →',
      'admin.locked':'Acesso restrito',
      'admin.users':'Usuários', 'admin.pending':'Convites', 'admin.completed':'Pills concluídas', 'admin.rating':'Avaliação média',
      'hero.play':'Reproduzir', 'hero.more':'Mais informações', 'hero.sound':'Som',
      'home.continue.title':'Continue, {name}', 'home.continue.sub':'de onde parou', 'home.continue.fallback':'você',
      'coach.greeting':'Olá', 'coach.askYou':'o que quer dominar hoje?',
      'coach.subtitle':'Pergunte sobre qualquer tema da sua formação, seu progresso ou seu dia a dia.',
      'coach.placeholder':'Pergunte ao BeonAI…',
      'coach.new':'Nova conversa',
      'coach.empty':'Ainda não tem conversas.',
      'detail.relatedTitle':'Mais pills de', 'detail.affinity':'% afinidade',
      'palette.placeholder':'Buscar módulos, vistas, professores…',
      'palette.navigation':'Navegação', 'palette.modules':'Módulos',
      'palette.noResults':'Sem resultados para',
      'palette.goTo':'IR PARA',
      // Login
      'login.eyebrow':'★ Plataforma de formação cinematográfica · 2026',
      'login.title.l1':'Forme', 'login.title.l2':'a sua equipa', 'login.title.l3':'no seu',
      'login.title.expert':'ritmo',
      'login.subtitle':'Microlearning em vídeo · BeonAI integrado · acompanhamento de progresso em tempo real.',
      'login.chip.pills':'Microlearning', 'login.chip.workshops':'Workshops ao vivo',
      'login.chip.beonai':'BeonAI · Claude 4.5', 'login.chip.cert':'Certificado oficial',
      'login.poweredBy':'Powered by Claude',
      'login.mode.login':'Entrar', 'login.mode.signup':'Criar conta',
      'login.invite.title':'Convite recebido',
      'login.invite.body':'Você foi convidado a se juntar ao SolidStream por {team} como {role}.',
      'login.welcome':'Bem-vindo de volta',
      'login.welcomeCreated':'Conta criada · Bem-vindo ao SolidStream',
      'login.welcomeInvite':'Bem-vindo · convite aceito',
      'login.sessionStarted':'Sessão iniciada',
      'login.email':'Email', 'login.password':'Senha', 'login.name':'Nome completo',
      'login.role':'Cargo', 'login.team':'Equipe',
      'login.submit.login':'Entrar', 'login.submit.signup':'Criar conta',
      'login.submitting':'Processando…',
      'login.sso':'Continuar com Microsoft', 'login.ssoOr':'ou',
      'login.toggleToSignup':'Não tem conta? Crie uma',
      'login.toggleToLogin':'Já tem conta? Entre',
      'login.quickDemo':'Acessos rápidos · modo demo',
      'login.errorGeneric':'Erro desconhecido',
      // Onboarding
      'onboarding.skip':'Pular', 'onboarding.next':'Próximo', 'onboarding.finish':'Começar',
      'onboarding.back':'← Voltar', 'onboarding.continue':'Continuar →',
      'onboarding.enter':'Entrar no SolidStream →',
      'onboarding.stepOf':'{step} · De {total}',
      'onboarding.s1.title.l1':'Em que área você quer',
      'onboarding.s1.title.l2':'quer se certificar?',
      'onboarding.s1.titleEm':'certificar',
      'onboarding.s1.lead':'Selecione as áreas prioritárias. Sua trilha de formação será construída em torno delas — pode mudá-las depois.',
      'onboarding.s2.title.l1':'Qual é seu cargo',
      'onboarding.s2.title.l2':'na sua empresa?',
      'onboarding.s2.titleEm':'cargo',
      'onboarding.s2.lead':'Personalizamos a ordem dos módulos e os casos práticos conforme sua função na equipe de comunicação.',
      'onboarding.s3.title':'Como quer aprender?',
      'onboarding.s3.titleEm':'aprender',
      'onboarding.s3.lead':'Escolha como quer receber sua formação. Pode ativar ou desativar cada canal a qualquer momento no seu perfil.',
      'onboarding.s4.title':'Seu agente IA te espera.',
      'onboarding.s4.titleEm':'te espera',
      'onboarding.s4.lead':'Conhece os fluxos da sua empresa, seu progresso e os guias da sua formação. Pergunte qualquer coisa — a qualquer momento.',
      'onboarding.s4.message':'Olá. Com base no seu cargo de {role} e nas áreas escolhidas, preparo uma trilha de 4 semanas e 10 módulos. Vamos começar?',
      'onboarding.s4.cta':'Sim — entrar no SolidStream →',
      'onboarding.s4.more':'Me conte mais', 'onboarding.s4.hide':'Ocultar',
      'onboarding.s4.featuresTitle':'O que o BeonAI faz',
      'onboarding.s4.f1':'Resolve dúvidas da sua formação no contexto da sua empresa com respostas acionáveis',
      'onboarding.s4.f2':'Recomenda seu próximo módulo com base em progresso e cargo',
      'onboarding.s4.f3':'Gera quizzes personalizados para revisar o aprendido',
      'onboarding.s4.f4':'Conhece as 41 Think Pills e sabe qual cobre cada tema',
      'onboarding.s4.f5':'Funciona pela barra lateral, em tela cheia ou pelo WhatsApp',
      'onboarding.role.publish':'Publish Agent',  'onboarding.role.publish.sub':'Publico e aprovo conteúdo em plataformas digitais',
      'onboarding.role.content':'Content Lead',   'onboarding.role.content.sub':'Lidero a estratégia de conteúdos',
      'onboarding.role.analytics':'Analytics Lead','onboarding.role.analytics.sub':'Analiso desempenho de campanhas',
      'onboarding.role.it':'TI / Integrações',     'onboarding.role.it.sub':'Gerencio a integração com sistemas internos',
      'onboarding.role.direccion':'Direção',       'onboarding.role.direccion.sub':'Preciso de visão global da plataforma',
      'onboarding.area.publish':'Social Publish', 'onboarding.area.aprobs':'Aprovações',
      'onboarding.area.calendar':'Calendário editorial', 'onboarding.area.analytics':'Analytics e Reporting',
      'onboarding.area.dam':'Ativos DAM', 'onboarding.area.compliance':'Compliance',
      'onboarding.area.care':'Care e Atenção ao cliente', 'onboarding.area.salesforce':'Integrações Salesforce',
      'onboarding.area.gov':'Governança e cargos', 'onboarding.area.fundamentals':'Fundamentos',
      'onboarding.notif.daily':'Lembrete diário no WhatsApp, 9:00',
      'onboarding.notif.daily.sub':'Um módulo cada manhã. Sem ruído extra.',
      'onboarding.notif.free':'Acesso livre pelo app',
      'onboarding.notif.free.sub':'Entro quando tenho tempo, sem notificações.',
      'onboarding.notif.weekly':'Resumo semanal por email (sexta)',
      'onboarding.notif.weekly.sub':'O que aprendeu, o que vem na próxima semana.',
      'onboarding.notif.meeting':'Alertas antes de reuniões formativas',
      'onboarding.notif.meeting.sub':'O agente envia um módulo relevante 30 min antes.',
      'onboarding.complete':'Onboarding concluído · Bem-vindo ao SolidStream',
      'onboarding.cert':'Certificação oficial',
      'onboarding.certOfficial':'Certificação oficial · 2026',
    },
  };

  function currentLang() {
    try {
      // 1. Preferencia del usuario (si está autenticado)
      const s = window.Settings && window.Settings.get && window.Settings.get();
      const lang = s && s.language;
      if (DICTIONARIES[lang]) return lang;
      // 2. Override pre-login persistido (último idioma usado en cualquier sesión)
      const pre = localStorage.getItem('solid-preferred-lang');
      if (DICTIONARIES[pre]) return pre;
      // 3. Idioma del navegador
      if (typeof navigator !== 'undefined' && navigator.language) {
        const navLang = navigator.language.toLowerCase().slice(0, 2);
        if (DICTIONARIES[navLang]) return navLang;
      }
      return 'es';
    } catch(e) { return 'es'; }
  }

  // Sustituye "Ruta"/"Rutas" en strings i18n por la etiqueta del workspace
  // activo (campo settings.path_label / path_label_plural). Solo aplica a
  // claves de la familia rutas.* y nav.rutas para evitar tocar contextos
  // donde "ruta" significa otra cosa (urls, paths de archivos, etc.).
  // Para Hijos de Rivera: 'Competencia' / 'Competencias'.
  function _applyWorkspacePathLabel(key, str) {
    if (!str || typeof str !== 'string') return str;
    if (!(key === 'nav.rutas' || (key.indexOf && key.indexOf('rutas.') === 0))) return str;
    try {
      const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
      const settings = ws && ws.settings;
      const singular = settings && settings.path_label;
      if (!singular) return str;
      const plural = (settings && settings.path_label_plural) || (singular + 's');
      return str
        .replace(/Rutas/g, plural)
        .replace(/Ruta/g, singular)
        .replace(/\brutas\b/g, plural.toLowerCase())
        .replace(/\bruta\b/g, singular.toLowerCase());
    } catch(e) { return str; }
  }
  function t(key, fallback) {
    const dict = DICTIONARIES[currentLang()] || DICTIONARIES.es;
    let str = (dict[key] != null) ? dict[key] :
              (DICTIONARIES.es[key] != null) ? DICTIONARIES.es[key] :
              (fallback != null ? fallback : key);
    return _applyWorkspacePathLabel(key, str);
  }

  return { t, currentLang, DICTIONARIES };
})();
window.I18n = I18n;
// Helper global · acceso corto sin window
window.t = (key, fallback) => I18n.t(key, fallback);

// Hook React · re-renderiza componentes cuando cambia el idioma
window.useI18n = function() {
  const [lang, setLang] = React.useState(I18n.currentLang());
  React.useEffect(() => {
    const onChange = () => setLang(I18n.currentLang());
    window.addEventListener('settings-changed', onChange);
    return () => window.removeEventListener('settings-changed', onChange);
  }, []);
  return { t: I18n.t, lang };
};

// ── Theme controller · respeta Settings.theme (b120) ────────────────────
// Toggle claro/oscuro de verdad. La preferencia vive en Settings.theme
// ('light' | 'dark' | 'auto'). Default = 'light' (look catálogo Udacity).
//   · 'auto' sigue prefers-color-scheme del SO.
//   · La paleta de ACENTOS (cobalt + cream) es idéntica en ambos · solo
//     cambian las superficies (ver html[data-theme="dark"] en sgson.css).
//
// EXCEPCIONES que ignoran la preferencia:
//   · Analytics (data-analytics-light='1') · se autoaplica light.
//   · Demo mode · data-theme='dark' + data-demo-mode='true' (Netflix demo
//     con paleta beonit · el CSS de [data-demo-mode] pisa los tokens).
//
// El tema resuelto se espeja en localStorage['solid-theme'] para que el
// boot script de index.html lo aplique antes del primer paint (sin flash).
(function _initThemeController(){
  function resolvePref() {
    var pref = 'light';
    try {
      if (window.Settings && window.Settings.get) pref = window.Settings.get().theme || 'light';
    } catch(e) {}
    if (pref === 'auto') {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return (pref === 'dark') ? 'dark' : 'light';
  }
  function applyTheme() {
    if (document.documentElement.getAttribute('data-analytics-light') === '1') return;
    const dm = window.DemoMode;
    const demoActive = dm && dm.isActive && dm.isActive();
    if (demoActive) {
      // Demo · siempre dark Netflix con paleta beonit (acuerdo cliente).
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-demo-mode', 'true');
      try { localStorage.setItem('solid-theme', 'dark'); } catch(e) {}
      return;
    }
    document.documentElement.removeAttribute('data-demo-mode');
    var resolved = resolvePref();
    document.documentElement.setAttribute('data-theme', resolved);
    try { localStorage.setItem('solid-theme', resolved); } catch(e) {}
  }
  // Reacciona también a cambios de preferencia del SO cuando theme='auto'.
  if (window.matchMedia) {
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); }
    catch(e) { /* Safari viejo · ignore */ }
  }
  window.addEventListener('settings-changed', applyTheme);
  window.addEventListener('auth-changed', applyTheme);
  window.addEventListener('workspace-changed', applyTheme);
  // Re-aplicar cuando window.DemoMode esté listo (polling rápido)
  (function _whenDemoReady(attempts) {
    attempts = attempts || 0;
    if (window.DemoMode || attempts > 100) { applyTheme(); return; }
    setTimeout(function() { _whenDemoReady(attempts + 1); }, 20);
  })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTheme);
  else applyTheme();
})();

// ── Realtime cross-tab · BroadcastChannel para sync entre pestañas ─────────
// Si tienes 2 pestañas abiertas como mismo usuario (o como admin viendo lo
// que hace otro usuario en otra), los eventos se reflejan al instante sin
// necesitar Supabase realtime. Si hay Supabase activo, este puente convive
// con las subscriptions de DB (no se pisan, solo añaden inmediatez local).
(function _initRealtimeBridge(){
  if (typeof BroadcastChannel === 'undefined') return; // navegadores muy viejos
  var ch = null;
  try { ch = new BroadcastChannel('sgson-realtime'); }
  catch(e) { return; }
  window._sgsonChannel = ch;

  // Lista de eventos del bus interno que se propagan cross-tab
  var BRIDGED = ['bookmarks-changed','chats-changed','submissions-changed','inbox-changed',
                 'invitations-changed','activity-changed','exams-changed','auth-users-changed',
                 'ratings-changed','settings-changed','channels-changed','delivery-prefs-changed',
                 'content-push-changed','subscriptions-changed','notif-rules-changed',
                 'channel-notifs-changed','test-sends-changed'];
  var inFlight = false;
  BRIDGED.forEach(function(evName){
    window.addEventListener(evName, function(){
      if (inFlight) return; // evita loops
      try { ch.postMessage({ type: 'event', name: evName }); } catch(e) {}
    });
  });
  ch.onmessage = function(msg) {
    if (!msg.data || msg.data.type !== 'event') return;
    inFlight = true;
    try { window.dispatchEvent(new Event(msg.data.name)); } finally {
      setTimeout(function(){ inFlight = false; }, 0);
    }
  };
})();

// ── CommandPalette (global search ⌘K) ──────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate, openDetail }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [q, setQ] = useSM('');
  const [activeIdx, setActiveIdx] = useSM(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  useEM(() => {
    if (open && inputRef.current) {
      setQ('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  // Items combinados · pills + series + reels + podcasts + paths/competencias.
  // Cada uno conserva su tipo para mostrar la etiqueta en el resultado y
  // poder enrutar al detail correcto.
  const taggedPills    = (window.PILLS    || []).map(x => ({ ...x, _kind:'pill',    _kindLabel:'PILL'   }));
  const taggedSeries   = (window.SERIES   || []).map(x => ({ ...x, _kind:'series',  _kindLabel:'BLOQUE' }));
  const taggedReels    = (window.REELS    || []).map(x => ({ ...x, _kind:'reel',    _kindLabel:'TIP'    }));
  const taggedPodcasts = (window.PODCASTS || []).map(x => ({ ...x, _kind:'podcast', _kindLabel:'CHARLA' }));
  const taggedPaths    = (window.LEARNING_PATHS || []).map(x => ({
    ...x,
    _kind: 'path',
    _kindLabel: (function() {
      const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
      const label = ws && ws.settings && ws.settings.path_label;
      return (label || 'RUTA').toUpperCase();
    })(),
    title: x.title || x.label,
  }));
  const all = taggedPills.concat(taggedSeries, taggedReels, taggedPodcasts, taggedPaths);

  const ql = q.trim().toLowerCase();
  const matches = (it) =>
    (it.title       || '').toLowerCase().includes(ql) ||
    (it.label       || '').toLowerCase().includes(ql) ||
    (it.category    || '').toLowerCase().includes(ql) ||
    (it.teacher     || '').toLowerCase().includes(ql) ||
    (it.one         || '').toLowerCase().includes(ql) ||
    (it.desc        || '').toLowerCase().includes(ql) ||
    (it.brand       || '').toLowerCase().includes(ql) ||
    (it.badge       || '').toLowerCase().includes(ql);
  const items = ql.length === 0
    ? taggedPills.slice(0, 8)              // Default · solo pills recientes
    : all.filter(matches).slice(0, 16);

  // En modo demo · la búsqueda solo expone módulos a los que el user tiene
  // acceso. Re-usamos D.SIDEBAR_LINKS (que ya está filtrado por DemoMode flags
  // en sgson-adapter) como fuente de verdad: si el item no está en el sidebar,
  // no aparece en la paleta.
  const _dm2 = window.DemoMode;
  const _demoSearchActive = _dm2 && _dm2.isActive && _dm2.isActive();
  const _sidebarLinks = (window.SGS_DATA && window.SGS_DATA.SIDEBAR_LINKS) || [];
  const _allowedKeys = _demoSearchActive ? new Set(_sidebarLinks.map(l => l.key)) : null;
  const navItems = [
    { id:'home',     label:'Inicio' },
    { id:'browse',   label:'Catálogo' },
    { id:'rutas',    label:'Rutas de certificación' },
    { id:'path',     label:'Mi ruta' },
    { id:'dashboard',label:'Analytics' },
    { id:'coach',    label:'BeonAI' },
    { id:'wa',       label:'Channels' },
    { id:'saved',    label:'Guardados' },
    { id:'inbox',    label:'Bandeja' },
    { id:'profile',  label:'Mi perfil' },
    { id:'settings', label:'Ajustes' },
    { id:'admin',    label:'Admin · panel' },
  ]
    .filter(n => !_allowedKeys || _allowedKeys.has(n.id))
    .filter(n => ql.length === 0 || n.label.toLowerCase().includes(ql));

  // Lista combinada plana · primero nav, luego items
  const combined = navItems.map(n => ({ type:'nav', payload: n })).concat(items.map(it => ({ type:'item', payload: it })));
  const totalCount = combined.length;

  // Reset activeIdx cuando cambia la consulta
  useEM(() => { setActiveIdx(0); }, [q]);

  const activate = (entry) => {
    if (!entry) return;
    if (entry.type === 'nav') { onNavigate(entry.payload.id); onClose(); return; }
    // Items con _kind 'path' van a la vista de ruta (no al detail modal de pill)
    if (entry.payload._kind === 'path') {
      if (window.__openPath) window.__openPath(entry.payload.id);
      else onNavigate('rutas');
      onClose();
      return;
    }
    openDetail(entry.payload);
    onClose();
  };

  useEM(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(totalCount - 1, i + 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(0, i - 1)); return; }
      if (e.key === 'Enter')     { e.preventDefault(); activate(combined[activeIdx]); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, activeIdx, totalCount]);

  // Scroll del activo al viewport
  useEM(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-active="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block:'nearest' });
  }, [activeIdx]);

  if (!open) return null;

  // Helper · es el item el activo
  const isActiveAt = (offset) => activeIdx === offset;

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,18,38,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10vh'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', width:'min(640px, 92vw)', borderRadius:14, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', overflow:'hidden', border:'1px solid var(--line)'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:10}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--ink-4)'}}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.6-4.6"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={T('palette.placeholder')}
            style={{flex:1, border:'none', outline:'none', fontFamily:'var(--sans)', fontSize:15, background:'transparent', color:'var(--ink)'}}
          />
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', padding:'2px 6px', border:'1px solid var(--line)', borderRadius:4}}>↑↓ ↩ ESC</span>
        </div>
        <div ref={listRef} style={{maxHeight:'55vh', overflowY:'auto'}}>
          {navItems.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>{T('palette.navigation')}</div>
              {navItems.map((n, i) => {
                const active = isActiveAt(i);
                return (
                  <button key={n.id} data-active={active}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { onNavigate(n.id); onClose(); }}
                    style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 18px', border:'none', background: active ? 'var(--paper-2)' : 'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)', borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent'}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.08em'}}>{T('palette.goTo')}</span> {n.label}
                  </button>
                );
              })}
            </div>
          )}
          {items.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>{T('palette.modules')} {ql && `· ${items.length}`}</div>
              {items.map((it, i) => {
                const offset = navItems.length + i;
                const active = isActiveAt(offset);
                const kindLabel = it._kindLabel || (it.format ? it.format.toUpperCase() : 'PILL');
                const subtitle  = [it.brand, it.teacher, it.category, it.duration].filter(Boolean).join(' · ');
                return (
                  <button key={(it._kind || 'pill') + ':' + it.id} data-active={active}
                    onMouseEnter={() => setActiveIdx(offset)}
                    onClick={() => activate({ type: 'item', payload: it })}
                    style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 18px', border:'none', background: active ? 'var(--paper-2)' : 'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)', borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent'}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:9, fontWeight:700, color:'var(--accent)', flexShrink:0, width:48, letterSpacing:'0.06em'}}>{kindLabel}</span>
                    <span style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, color:'var(--ink)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.title}</div>
                      {subtitle && <div style={{fontSize:11, color:'var(--ink-4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2}}>{subtitle}</div>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {totalCount === 0 && (
            <div style={{padding:'24px 18px', textAlign:'center', fontSize:13, color:'var(--ink-4)'}}>{T('palette.noResults')} "{q}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BrowseView · catálogo completo con búsqueda + filtros ──────────────────

// ── SettingsView · configuración del usuario ─────────────────────────────

// ── ActivityFeed · vista admin con timeline de eventos ────────────────────
const ACTIVITY_LABELS = {
  signup:           { icon: '🎉', verb: 'se registró',          color: 'var(--bn-lime-dark)' },
  login:            { icon: '🔑', verb: 'inició sesión',        color: 'var(--bn-blue)' },
  logout:           { icon: '🚪', verb: 'cerró sesión',         color: 'var(--ink-4)' },
  complete_pill:    { icon: '✓',  verb: 'completó la pill',     color: 'var(--bn-lime-dark)' },
  submit_video:     { icon: '🎬', verb: 'envió entrega de',     color: 'var(--bn-purple)' },
  review_submission:{ icon: '👀', verb: 'revisó entrega de',    color: 'var(--bn-blue)' },
  send_invite:      { icon: '✉',  verb: 'invitó a',             color: 'var(--bn-orange)' },
  accept_invite:    { icon: '🎫', verb: 'aceptó invitación',    color: 'var(--bn-lime-dark)' },
  bookmark_add:     { icon: '📌', verb: 'guardó',               color: 'var(--ink-3)' },
  edit_profile:     { icon: '✏',  verb: 'editó su perfil',      color: 'var(--ink-3)' },
  export_data:      { icon: '↓',  verb: 'exportó sus datos',    color: 'var(--ink-3)' },
  delete_account:   { icon: '⊘',  verb: 'eliminó su cuenta',    color: 'var(--repsol-red)' },
  pass_exam:        { icon: '🏆', verb: 'aprobó examen',        color: 'var(--bn-lime-dark)' },
};

function ActivityFeed() {
  const [items, setItems] = useSM(Activity.list());
  const [filterType, setFilterType] = useSM('all');
  const [filterUser, setFilterUser] = useSM('all');

  useEM(() => {
    const refresh = () => setItems(Activity.list());
    window.addEventListener('activity-changed', refresh);
    return () => window.removeEventListener('activity-changed', refresh);
  }, []);

  const fmtRel = (ts) => {
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    if (d < 86400*7) return Math.floor(d/86400) + ' d';
    return new Date(ts).toLocaleDateString('es-ES');
  };

  const types = Array.from(new Set(items.map(i => i.type)));
  const usersInLog = Array.from(new Set(items.map(i => i.userId).filter(Boolean))).map(uid => {
    const ev = items.find(i => i.userId === uid);
    return { id: uid, name: ev ? ev.userName : uid };
  });

  const filtered = items.filter(i => {
    if (filterType !== 'all' && i.type !== filterType) return false;
    if (filterUser !== 'all' && i.userId !== filterUser) return false;
    return true;
  });

  const renderMeta = (ev) => {
    const l = ACTIVITY_LABELS[ev.type] || { icon: '·', verb: ev.type, color: 'var(--ink-4)' };
    let extra = '';
    if (ev.meta) {
      if (ev.meta.pillTitle) extra = ' "' + ev.meta.pillTitle + '"';
      else if (ev.meta.email) extra = ' a ' + ev.meta.email;
      else if (ev.meta.status) extra = ' · ' + ev.meta.status;
      else if (ev.meta.role) extra = ' (' + ev.meta.role + ')';
    }
    return { label: l.verb + extra, icon: l.icon, color: l.color };
  };

  return (
    <div className="dash-panel" style={{padding:0, marginTop:24, overflow:'hidden'}}>
      <div className="dash-panel-head" style={{padding:'16px 22px'}}>
        <h3>Actividad reciente · auditoría</h3>
        <span className="panel-sub">Últimos {items.length} eventos de la plataforma · {filtered.length} mostrados con filtros</span>
      </div>
      <div style={{padding:'12px 22px', borderBottom:'1px solid var(--line-2)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{padding:'6px 10px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--mono)', fontSize:11, background:'var(--paper)', textTransform:'uppercase', letterSpacing:'0.05em'}}>
          <option value="all">TODOS LOS TIPOS</option>
          {types.map(t => <option key={t} value={t}>{(ACTIVITY_LABELS[t] && ACTIVITY_LABELS[t].verb) || t}</option>)}
        </select>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{padding:'6px 10px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--mono)', fontSize:11, background:'var(--paper)', textTransform:'uppercase', letterSpacing:'0.05em'}}>
          <option value="all">TODOS LOS USUARIOS</option>
          {usersInLog.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <span style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>
          {(filterType !== 'all' || filterUser !== 'all') && (
            <button onClick={() => { setFilterType('all'); setFilterUser('all'); }} style={{padding:'4px 10px', border:'1px solid var(--line)', borderRadius:6, background:'transparent', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-3)', letterSpacing:'0.06em'}}>× Limpiar</button>
          )}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div style={{padding:'32px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>Sin eventos que coincidan.</div>
      ) : (
        <div style={{maxHeight: 460, overflowY:'auto'}}>
          {filtered.slice(0, 100).map(ev => {
            const meta = renderMeta(ev);
            return (
              <div key={ev.id} style={{display:'flex', gap:12, padding:'12px 22px', borderBottom:'1px solid var(--line-2)', alignItems:'center'}}>
                <div style={{width:30, height:30, borderRadius:'50%', background:ev.avatarColor || 'var(--ink-3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                  {(ev.userName || '?').split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <span style={{fontSize:18, flexShrink:0}}>{meta.icon}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, color:'var(--ink-2)'}}>
                    <strong>{ev.userName}</strong> <span style={{color: meta.color, fontWeight:600}}>{meta.label}</span>
                  </div>
                  {ev.userEmail && <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{ev.userEmail}</div>}
                </div>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', flexShrink:0}}>{fmtRel(ev.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
window.ActivityFeed = ActivityFeed;

function App() {
  const saved = JSON.parse(localStorage.getItem('solid-proto') || '{}');
  const [view, _setView] = useSM(saved.view || 'home');
  // Stack de vistas previas · para botón "back" del Player
  const [prevView, setPrevView] = useSM(saved.prevView || 'home');
  const setView = (v) => { _setView(prev => { if (prev !== v) setPrevView(prev); return v; }); };
  // pathId activo · seteado por RutasView al pulsar una ruta concreta
  const [activePathId, setActivePathId] = useSM(saved.activePathId || null);
  const openPath = (pathId) => {
    // Delega a __openPath para que el guard de lock + Enrollments viva en un
    // solo sitio. __openPath se setea en el useEM más abajo · si aún no está
    // (boot temprano) caemos al comportamiento mínimo.
    if (window.__openPath) { window.__openPath(pathId); return; }
    if (pathId && window.Enrollments && window.Enrollments.add) window.Enrollments.add(pathId);
    setActivePathId(pathId); setView('path');
  };
  // AI oculta por defecto · entra como overlay solo cuando el usuario pulsa la rail-btn
  const [aiMode, setAIMode] = useSM(saved.aiMode || 'collapsed'); // hero | companion | collapsed
  // Exposición global · permite que componentes que no reciben setAIMode como prop (Player) puedan abrir BeonAI
  React.useEffect(() => { window.__setAIMode = setAIMode; return () => { try { delete window.__setAIMode; } catch(e) { window.__setAIMode = null; } }; }, []);
  const [shape, setShape] = useSM(saved.shape || 'mixed');
  const [accent, setAccent] = useSM(saved.accent || '#F3A524');
  const [detailItem, setDetailItem] = useSM(null);

  // Auth state — re-render cuando cambia el usuario
  const [authUser, setAuthUser] = useSM(() => Auth.currentUser());
  useEM(() => {
    Auth.seedIfEmpty();
    setAuthUser(Auth.currentUser());
    const refresh = () => {
      setAuthUser(Auth.currentUser());
      // cuando cambia de usuario, re-sembrar el inbox del nuevo
      if (window.Inbox) window.Inbox.seedIfEmpty();
    };
    window.addEventListener('auth-changed', refresh);
    return () => window.removeEventListener('auth-changed', refresh);
  }, []);

  // Data version · contador que se incrementa cuando cambian PILLS,
  // SGS_DATA o el workspace activo. Las vistas hijas leen D = window.SGS_DATA
  // al renderizar; sin esta señal de invalidación se quedan con los pills
  // del primer workspace que cargaron (lo que veía el usuario: Hijos de
  // Ribera mostraba el catálogo de Repsol). Cualquier estado React aquí
  // arriba fuerza re-render de todo el árbol.
  const [, setDataVer] = useSM(0);
  useEM(() => {
    const bump = () => setDataVer(v => v + 1);
    ['sgs-data-ready','pills-changed','paths-changed','series-changed','reels-changed','podcasts-changed','workspace-changed','workspace-branding-changed']
      .forEach(ev => window.addEventListener(ev, bump));
    return () => ['sgs-data-ready','pills-changed','paths-changed','series-changed','reels-changed','podcasts-changed','workspace-changed','workspace-branding-changed']
      .forEach(ev => window.removeEventListener(ev, bump));
  }, []);
  useEM(() => {
    if (authUser && window.Inbox) window.Inbox.seedIfEmpty();
    if (authUser && window.Workspaces) window.Workspaces.seedIfEmpty();
  }, [authUser?.id]);

  // Atajos globales · "Ir a Ajustes" desde otras vistas
  useEM(() => {
    const goSettings = () => setView('settings');
    window.addEventListener('__go-settings', goSettings);
    return () => window.removeEventListener('__go-settings', goSettings);
  }, []);

  // Atajo global · abrir Player desde un componente que no recibe openPlayer como prop
  useEM(() => {
    const onOpenPlayer = (e) => { if (e && e.detail) openPlayer(e.detail); };
    window.addEventListener('__openPlayer', onOpenPlayer);
    return () => window.removeEventListener('__openPlayer', onOpenPlayer);
  }, []);

  // Initialize tracker and handle tracked URL opens
  useEM(() => {
    WATracker.seedIfEmpty();
    const params = new URLSearchParams(window.location.search);
    const wtrack = params.get('wtrack');
    const pillId = params.get('pill');
    if (wtrack) {
      WATracker.trackOpen(wtrack);
      if (pillId && window.PILLS) {
        const pill = window.PILLS.find(p => p.id === pillId);
        if (pill) { setDetailItem(pill); setView('player'); }
      }
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Aceptar invitación tras login por SSO · cuando el usuario vuelve del redirect
  // de Microsoft a /?invite=token YA está autenticado (LoginScreen no se muestra),
  // así que la rama de signup nunca llamaba accept_invitation → quedaba logueado
  // pero fuera del workspace. Aquí lo aceptamos en cuanto hay sesión + token.
  useEM(() => {
    if (!authUser) return;
    const params = new URLSearchParams(window.location.search);
    const inviteTok = params.get('invite');
    if (!inviteTok || !window.Invitations || !window.Invitations.markAccepted) return;
    Promise.resolve(window.Invitations.markAccepted(inviteTok)).then((r) => {
      if (r && (r.status === 'accepted' || r.workspace_id)) {
        if (window.Workspaces && window.Workspaces.setCurrent && r.workspace_id) window.Workspaces.setCurrent(r.workspace_id);
        if (window.Toast) window.Toast.success('Te has unido al workspace', { icon: '🎫' });
      }
    }).catch(() => {}).finally(() => {
      // Limpia el token de la URL para no reintentar en cada render/recarga
      try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
    });
  }, [authUser && authUser.id]);

  useEM(() => {
    localStorage.setItem('solid-proto', JSON.stringify({ view, prevView, aiMode, shape, accent, activePathId }));
    document.documentElement.style.setProperty('--accent-glow', accent);
  }, [view, prevView, aiMode, shape, accent, activePathId]);

  // ── Browser history ↔ vista · el botón ATRÁS del navegador navega entre
  // vistas en vez de sacarte de la plataforma. Antes la navegación era solo
  // estado React (setView) sin tocar el historial, así que "atrás" abandonaba
  // la SPA. Ahora cada cambio de vista hace pushState y popstate restaura.
  const _historyInited = React.useRef(false);
  const _restoringFromHistory = React.useRef(false);
  // Refs con el contexto actual (activePathId / detailItem) para guardarlo en
  // el state del historial sin meterlos en las deps del efecto de push.
  const _pathIdRef = React.useRef(activePathId);
  const _detailRef = React.useRef(detailItem);
  React.useEffect(() => { _pathIdRef.current = activePathId; }, [activePathId]);
  React.useEffect(() => { _detailRef.current = detailItem; }, [detailItem]);

  useEM(() => {
    // Si este cambio de vista viene de un popstate (restauración), no empujamos
    // otra entrada · solo bajamos la bandera.
    if (_restoringFromHistory.current) { _restoringFromHistory.current = false; return; }
    try {
      const st = {
        __solidView: view,
        __pathId: _pathIdRef.current || null,
        __detailId: (_detailRef.current && _detailRef.current.id) || null,
      };
      if (!_historyInited.current) {
        // Primera entrada · reemplaza la actual (no añade) para que el primer
        // "atrás" desde aquí salga de forma natural, como en cualquier web.
        window.history.replaceState(st, '');
        _historyInited.current = true;
      } else {
        window.history.pushState(st, '');
      }
    } catch (e) {}
  }, [view]);

  useEM(() => {
    const onPop = (e) => {
      const st = e && e.state;
      if (!st || !st.__solidView) return; // entrada previa a la app → salir natural
      _restoringFromHistory.current = true;
      // Restaura contexto antes de la vista para que 'path'/'player' tengan datos.
      if (st.__pathId) setActivePathId(st.__pathId);
      if (st.__detailId) {
        const p = (window.PILLS || []).find(x => x.id === st.__detailId);
        if (p) setDetailItem(p);
      }
      _setView(st.__solidView);
      // Reset defensivo · si la vista restaurada es igual a la actual el efecto
      // de push no corre y no bajaría la bandera. El timeout lo garantiza.
      setTimeout(() => { _restoringFromHistory.current = false; }, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Home/Player/Onboarding son cinematic · SIEMPRE dark independientemente del tema.
  // El CSS lee data-cinematic en body y fuerza tokens dark.
  useEM(() => {
    const cinematic = (view === 'home' || view === 'player' || view === 'onboarding');
    if (cinematic) document.body.setAttribute('data-cinematic', 'true');
    else document.body.removeAttribute('data-cinematic');
  }, [view]);

  // Tweaks protocol
  useEM(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') window.__tweaksOn = true, window.dispatchEvent(new Event('__tweaks'));
      if (e.data?.type === '__deactivate_edit_mode') window.__tweaksOn = false, window.dispatchEvent(new Event('__tweaks'));
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [tweaksOn, setTweaksOn] = useSM(false);
  useEM(() => {
    const h = () => setTweaksOn(!!window.__tweaksOn);
    window.addEventListener('__tweaks', h);
    return () => window.removeEventListener('__tweaks', h);
  }, []);


  // Command palette (⌘K / Ctrl+K)
  const [paletteOpen, setPaletteOpen] = useSM(false);
  useEM(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', h);
    window.__openPalette = () => setPaletteOpen(true);
    // Expone openPath para que CommandPalette pueda navegar a una ruta concreta
    window.__openPath = (pathId) => {
      // Respeta el lock global (paleta/links/notif podían saltárselo · solo
      // RutasView lo aplicaba antes). Si el path está bloqueado y el user no
      // es admin, mostramos toast y no navegamos · tampoco inscribimos.
      const dm = window.DemoMode;
      const lockEnabled = dm && dm.isActive && dm.isActive() && dm.flag && dm.flag('lock_unassigned_courses') === true;
      if (lockEnabled && pathId) {
        const paths = (window.LEARNING_PATHS || []);
        const idx = paths.findIndex(p => p && p.id === pathId);
        const p = idx >= 0 ? paths[idx] : null;
        const unlockedList = (dm && dm.unlocked && dm.unlocked()) || [];
        const isUnlockedById = unlockedList.indexOf(pathId) !== -1;
        const seed = parseInt(String(pathId).replace(/\D/g, ''), 10) || idx;
        const isLocked = p && !(p.progress > 0) && !isUnlockedById && idx > 0 && (seed % 3) !== 0;
        const profile = (window.UserProfile && window.UserProfile.get && window.UserProfile.get()) || {};
        const isAdminUser = !!(profile.isAdmin || profile.systemRole === 'admin');
        if (isLocked && !isAdminUser) {
          if (window.Toast) window.Toast.info('🔒 Curso bloqueado · disponible próximamente');
          return;
        }
      }
      // Abrir un curso = inscribirse · centraliza el tracking de "Mi Lista"
      // sin importar el origen (home, catálogo, búsqueda, notificación).
      // Idempotente · Enrollments.add ignora duplicados.
      if (pathId && window.Enrollments && window.Enrollments.add) window.Enrollments.add(pathId);
      setActivePathId(pathId); setView('path');
    };
    return () => window.removeEventListener('keydown', h);
  }, []);

  // openDetail abre MODAL (Netflix-style overlay). Antes navegaba a vista 'detail'.
  const openDetail = (it) => { setDetailItem(it); };
  const openPlayer = (it) => { if (it) setDetailItem(it); setView('player'); };
  // Expone __openPlayer · permite que vistas que no reciben openPlayer como
  // prop (p.ej. NotesView desde el menú avatar) puedan saltar al player con
  // un startAt concreto.
  useEM(() => { window.__openPlayer = (it) => { if (it) setDetailItem(it); setView('player'); }; return () => { try { delete window.__openPlayer; } catch (e) { window.__openPlayer = null; } }; }, []);

  // SIDEBAR NETFLIX-STYLE:
  // - En vistas cinematográficas (home, detail, player, browse, rutas): sidebar
  //   OCULTO por defecto. El usuario pulsa el botón hamburguesa arriba-izq para
  //   abrirlo. Sidebar aparece como overlay dark-glass con backdrop dim. Click
  //   en backdrop, en un item o en X cierra.
  // - En vistas de utilidad (analytics, settings, profile, admin, coach, channels):
  const rootClass = `proto-root ai-${aiMode}`;

  // Sin sidebar fijo · main siempre ocupa toda la columna 2 (1fr)
  // Col 1 colapsa a 0 · Col 3 reserva espacio para AI panel (companion/hero)
  // --aiw: 0px collapsed · 380px companion · 520px hero (definido en CSS)
  const rootStyle = { gridTemplateColumns: '0 1fr var(--aiw, 380px)' };


  // Marca body con sgs-redesign · oculta shell-tabs legacy y aplica padding-top 0
  useEM(() => {
    if (view !== 'onboarding') document.body.classList.add('sgs-redesign');
    else document.body.classList.remove('sgs-redesign');
    return () => document.body.classList.remove('sgs-redesign');
  }, [view]);

  // openDetail · ahora abre MODAL (no navega a vista 'detail')
  const openDetailModal = (it) => { setDetailItem(it); };
  const closeDetailModal = () => { setDetailItem(null); };
  const openPlayerFromModal = (it) => { if (it) setDetailItem(it); setView('player'); };

  if (!authUser) return <LoginScreen/>;

  return (
    <div className={rootClass} style={rootStyle} data-screen-label={`Prototype · ${view}`}>
      {/* TOP NAV NETFLIX · siempre visible · contiene también el dropdown del avatar */}
      {view !== 'onboarding' && window.TopNav && (
        <TopNav
          view={view}
          onView={(v) => setView(v)}
          onSearch={() => window.__openPalette && window.__openPalette()}
          onLogout={() => { if (window.Auth && window.Auth.logout) window.Auth.logout(); }}
        />
      )}

      {/* DETAIL MODAL · slide-up cinematográfico · cualquier vista excepto player */}
      {detailItem && view !== 'player' && view !== 'detail' && window.DetailModal && (
        <DetailModal
          pill={detailItem}
          onClose={closeDetailModal}
          openPlayer={openPlayerFromModal}
          openPill={openDetail}
        />
      )}


      <main className="main" style={{
        gridColumn: view === 'onboarding' ? '1 / -1' : '2 / 3',
      }}>
        {view === 'home' && <Home openDetail={openDetail} openPlayer={openPlayer} setView={setView} openPath={openPath}/>}
        {view === 'player' && <Player back={() => setView(prevView && prevView !== 'player' ? prevView : 'home')} item={detailItem}/>}
        {view === 'coach' && <CoachView/>}
        {view === 'dashboard' && <AnalyticsView/>}
        {view === 'rutas' && <RutasView_New openDetail={openDetail} setView={setView} openPath={openPath}/>}
        {view === 'path' && <MyPathView_New openDetail={openDetail} setView={setView} pathId={activePathId} openPath={openPath}/>}
        {view === 'profile' && <ProfileView_New setView={setView}/>}
        {view === 'wa' && <ChannelsView_New/>}
        {view === 'saved' && <SavedView_New openDetail={openDetail}/>}
        {view === 'resources' && <ResourcesView_New/>}
        {view === 'admin' && (Auth.can && Auth.can('admin.viewPanel')
          ? <AdminView_New setView={setView} openLegacyAdmin={() => setView('admin-legacy')}/>
          : <div className="main-inner"><div className="empty-state"><div className="empty-icon">🔒</div><h3>{window.I18n ? window.I18n.t('admin.locked') : 'Acceso restringido'}</h3><p>{window.I18n ? window.I18n.t('admin.lockedDesc') : 'Solo administradores pueden ver este panel.'}</p></div></div>)}
        {view === 'admin-legacy' && Auth.can && Auth.can('admin.viewPanel') && <AdminPanel setView={setView}/>}
        {view === 'manager' && (Auth.hasRole && Auth.hasRole('manager')
          ? <ManagerView_New setView={setView}/>
          : <div className="main-inner"><div className="empty-state"><div className="empty-icon">🔒</div><h3>{window.I18n ? window.I18n.t('manager.locked','Acceso restringido') : 'Acceso restringido'}</h3><p>{window.I18n ? window.I18n.t('manager.lockedDesc','Solo managers y administradores pueden ver este panel.') : 'Solo managers y administradores pueden ver este panel.'}</p></div></div>)}
        {view === 'inbox' && <InboxView_New openDetail={openDetail}/>}
        {view === 'settings' && <SettingsView_New setView={setView}/>}
        {view === 'browse' && <BrowseView_New openDetail={openDetail}/>}
        {view === 'certificates' && window.CertificatesView && <window.CertificatesView setView={setView}/>}
        {view === 'notes' && window.NotesView && <window.NotesView setView={setView} openPlayer={openPlayer}/>}
        {view === 'plan' && window.MyPlanView && <window.MyPlanView setView={setView} openPath={openPath} openDetail={openDetail}/>}
        {view === 'leaderboard' && window.LeaderboardView && <window.LeaderboardView setView={setView}/>}
        {view === 'onboarding' && <Onboarding done={() => setView('home')}/>}
      </main>
      {view !== 'onboarding' && aiMode !== 'collapsed' && window.AISidekick && !(window.DemoMode && window.DemoMode.flag('hide_beonai') === true) && (
        <window.AISidekick setAIMode={setAIMode} aiMode={aiMode} view={view}/>
      )}
      {view !== 'onboarding' && aiMode === 'collapsed' && !(window.DemoMode && window.DemoMode.flag('hide_beonai') === true) && (
        <button
          className="ai-rail-btn"
          onClick={() => setAIMode('companion')}
          title="Abrir BeonAI"
          aria-label="Abrir BeonAI"
        >
          {window.BeonAIChar
            ? <BeonAIChar size={44} mood="happy" float interactive={false}/>
            : <span style={{color:'#fff', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em'}}>AI</span>}
          <span className="ai-rail-badge">BeonAI</span>
        </button>
      )}

      {view !== 'onboarding' && !(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive()) && <OnboardingRing onClick={() => setView('onboarding')}/>}

      {tweaksOn && (
        <TweaksPanel
          shape={shape} setShape={setShape}
          accent={accent} setAccent={setAccent}
          aiMode={aiMode} setAIMode={setAIMode}
        />
      )}

      <Toaster/>
      <InstallBanner/>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(v) => setView(v)}
        openDetail={openDetail}
      />
    </div>
  );
}

// ── Saved view (bookmarks) ─────────────────────────────────────────────────

// ── Onboarding ring · botón flotante que se va llenando con el progreso ───
// ── PWA install banner · aparece cuando beforeinstallprompt está disponible ─
function InstallBanner() {
  const [available, setAvailable] = useSM(!!window._installPromptEvent);
  const [dismissed, setDismissed] = useSM(localStorage.getItem('sgson-install-dismissed') === '1');

  useEM(() => {
    const onAvailable = () => setAvailable(true);
    const onInstalled = () => setAvailable(false);
    window.addEventListener('install-available', onAvailable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('install-available', onAvailable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    const ev = window._installPromptEvent;
    if (!ev) return;
    ev.prompt();
    const { outcome } = await ev.userChoice;
    if (outcome === 'accepted') {
      window._installPromptEvent = null;
      setAvailable(false);
      if (window.Toast) window.Toast.success('App instalada · ábrela desde tu home', { icon: '📱' });
    }
  };
  const dismiss = () => {
    localStorage.setItem('sgson-install-dismissed', '1');
    setDismissed(true);
  };

  if (!available || dismissed) return null;

  return (
    <div style={{position:'fixed', bottom:96, right:22, zIndex:299, maxWidth:280,
      background:'linear-gradient(135deg, #0B1220 0%, #1a2940 50%, #2a1f4d 100%)',
      color:'#fff', padding:'14px 16px', borderRadius:14,
      boxShadow:'0 12px 32px rgba(0,89,150,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
      animation:'toastSlideIn .3s ease'}}>
      <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
        <span style={{fontSize:22, flexShrink:0, marginTop:-2}}>📱</span>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:700, marginBottom:3}}>Instala SolidStream</div>
          <div style={{fontSize:11.5, color:'rgba(255,255,255,0.75)', lineHeight:1.45, marginBottom:10}}>
            Acceso rápido desde tu home screen y notificaciones de progreso.
          </div>
          <div style={{display:'flex', gap:6}}>
            <button onClick={install} style={{padding:'5px 10px', borderRadius:6, border:'none', background:'var(--bn-lime)', color:'var(--ink)', fontFamily:'var(--mono)', fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer'}}>Instalar</button>
            <button onClick={dismiss} style={{padding:'5px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'rgba(255,255,255,0.7)', fontFamily:'var(--mono)', fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer'}}>Ahora no</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingRing({ onClick }) {
  const computeProgress = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(window.userKey('solid-onboarding')) || '{}');
      if (raw.completedAt) return { value: 1, label: 'Completado', completed: true };
      const total = raw.totalSteps || 4;
      const step = Math.max(0, Math.min(total, raw.step || 0));
      // step va de 0..3 mientras está en onboarding; 0 = sin empezar, 4 = completado
      return { value: step / total, label: 'Onboarding · ' + step + '/' + total, completed: false };
    } catch (e) {
      return { value: 0, label: 'Onboarding', completed: false };
    }
  };
  const [prog, setProg] = useSM(computeProgress());
  useEM(() => {
    const refresh = () => setProg(computeProgress());
    window.addEventListener('onboarding-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('onboarding-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const size = 36, stroke = 3.5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dash = c * prog.value;

  const button = (
    <button onClick={onClick} title={prog.label} aria-label={prog.label}
      style={{position:'relative', width:size, height:size, borderRadius:'50%', border:'none',
        background:'rgba(255,255,255,0.85)', boxShadow:'0 2px 6px rgba(0,89,150,0.12), 0 0 0 1px rgba(0,114,190,0.1)',
        cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', padding:0,
        transition:'transform .14s, box-shadow .14s'}}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,114,190,0.28), 0 0 0 1px var(--bn-blue)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 6px rgba(0,89,150,0.12), 0 0 0 1px rgba(0,114,190,0.1)'; }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position:'absolute', inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--paper-3)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={prog.completed ? 'var(--bn-lime)' : 'var(--bn-blue)'}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{transition:'stroke-dasharray .35s ease'}}/>
      </svg>
      {prog.completed ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bn-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:'relative'}}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      ) : (
        <span style={{position:'relative', fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em'}}>
          {Math.round(prog.value * 100)}<span style={{fontSize:8, color:'var(--ink-4)'}}>%</span>
        </span>
      )}
    </button>
  );

  // Portal al slot del shell-tabs si existe; si no, fallback flotante
  const slot = typeof document !== 'undefined' ? document.getElementById('onboarding-ring-slot') : null;
  if (slot) return ReactDOM.createPortal(button, slot);
  return <div style={{position:'fixed', top:14, right:18, zIndex:500}}>{button}</div>;
}

// ── Toast notifications (global) ──────────────────────────────────────────
const Toast = (function() {
  let listeners = [];
  let counter = 0;
  function show(message, opts) {
    opts = opts || {};
    const id = 't_' + (++counter) + '_' + Date.now().toString(36);
    const toast = {
      id, message,
      type: opts.type || 'info',
      icon: opts.icon,
      duration: opts.duration != null ? opts.duration : 3500,
      action: opts.action || null,
    };
    listeners.forEach(function(fn){ fn({ type: 'add', toast: toast }); });
    if (toast.duration > 0) {
      setTimeout(function(){ listeners.forEach(function(fn){ fn({ type: 'remove', id: id }); }); }, toast.duration);
    }
    return id;
  }
  return {
    show: show,
    dismiss: function(id){ listeners.forEach(function(fn){ fn({ type: 'remove', id: id }); }); },
    subscribe: function(fn){
      listeners.push(fn);
      return function(){ listeners = listeners.filter(function(x){ return x !== fn; }); };
    },
    success: function(m, opts){ return show(m, Object.assign({type:'success'}, opts || {})); },
    error:   function(m, opts){ return show(m, Object.assign({type:'error',   duration: 5000}, opts || {})); },
    info:    function(m, opts){ return show(m, Object.assign({type:'info'},    opts || {})); },
  };
})();
window.Toast = Toast;

function Toaster() {
  const [toasts, setToasts] = useSM([]);
  useEM(function(){
    return Toast.subscribe(function(ev){
      if (ev.type === 'add')    setToasts(function(t){ return t.concat([ev.toast]); });
      if (ev.type === 'remove') setToasts(function(t){ return t.filter(function(x){ return x.id !== ev.id; }); });
    });
  }, []);
  return (
    <div style={{position:'fixed', bottom:20, right:20, zIndex:700, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none'}}>
      {toasts.map(function(t){
        const colors = {
          success: { bg: 'var(--bn-lime)', fg: 'var(--ink)', border: 'var(--bn-lime-dark)' },
          error:   { bg: 'var(--repsol-red)', fg: '#fff', border: 'var(--repsol-red-dark)' },
          info:    { bg: 'var(--ink)', fg: 'var(--paper)', border: 'var(--ink-2)' },
        }[t.type] || { bg: 'var(--ink)', fg: 'var(--paper)', border: 'var(--ink-2)' };
        return (
          <div key={t.id} className="toast-item" style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'12px 16px', borderRadius:10,
            background:colors.bg, color:colors.fg,
            boxShadow:'0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
            fontFamily:'var(--sans)', fontSize:13, fontWeight:500,
            minWidth:240, maxWidth:380,
            pointerEvents:'auto',
            border:'1px solid ' + colors.border,
          }}>
            {t.icon && <span style={{fontSize:16, flexShrink:0}}>{t.icon}</span>}
            <span style={{flex:1, lineHeight:1.4}}>{t.message}</span>
            {t.action && (
              <button onClick={function(){ t.action.onClick(); Toast.dismiss(t.id); }} style={{
                background:'rgba(255,255,255,0.18)', color:colors.fg, border:'none',
                padding:'5px 10px', borderRadius:6, cursor:'pointer',
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700,
              }}>{t.action.label}</button>
            )}
            <button onClick={function(){ Toast.dismiss(t.id); }} title="Cerrar" style={{
              background:'transparent', color:colors.fg, opacity:0.6, border:'none',
              cursor:'pointer', padding:0, display:'flex', alignItems:'center', justifyContent:'center',
              width:18, height:18, flexShrink:0,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Chat history (BeonAI conversaciones persistentes) ──────────────────
const ChatHistory = (function() {
  function _key() { return _userScopedKey('solid-chats'); }
  function _activeKey() { return _userScopedKey('solid-active-chat'); }
  function list() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch(e) { return []; } }
  function save(chats) { localStorage.setItem(_key(), JSON.stringify(chats)); window.dispatchEvent(new Event('chats-changed')); }
  function activeId() { return localStorage.getItem(_activeKey()) || null; }
  function setActive(id) { if (id) localStorage.setItem(_activeKey(), id); else localStorage.removeItem(_activeKey()); window.dispatchEvent(new Event('chats-changed')); }
  function get(id) { return list().find(c => c.id === id); }
  function create(initial) {
    const id = 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
    const chat = { id, title: 'Nueva conversación', createdAt: Date.now(), updatedAt: Date.now(), messages: initial || [] };
    const chats = list();
    chats.unshift(chat);
    save(chats);
    setActive(id);
    return chat;
  }
  function update(id, patch) {
    const chats = list();
    const idx = chats.findIndex(c => c.id === id);
    if (idx < 0) return;
    chats[idx] = Object.assign({}, chats[idx], patch, { updatedAt: Date.now() });
    save(chats);
  }
  function appendMessage(id, msg) {
    const chats = list();
    const idx = chats.findIndex(c => c.id === id);
    if (idx < 0) return;
    chats[idx].messages = (chats[idx].messages || []).concat([msg]);
    chats[idx].updatedAt = Date.now();
    // Auto-titular desde el primer mensaje del usuario
    if (chats[idx].title === 'Nueva conversación' && msg.role === 'user') {
      chats[idx].title = msg.text.slice(0, 50) + (msg.text.length > 50 ? '…' : '');
    }
    save(chats);
  }
  function remove(id) {
    save(list().filter(c => c.id !== id));
    if (activeId() === id) setActive(null);
  }
  function getOrCreate() {
    const id = activeId();
    if (id) {
      const c = get(id);
      if (c) return c;
    }
    return create();
  }
  return { list, get, create, update, appendMessage, remove, activeId, setActive, getOrCreate };
})();
window.ChatHistory = ChatHistory;

// ── Inbox · 3 pestañas (DM · Notificaciones · Releases) ─────────────────────
// Releases son globales (mismo changelog para todos), notificaciones se generan
// del propio uso, y mensajes son por usuario (admin puede mandarlos).
const Inbox = (function() {
  function _userKey() { return _userScopedKey('sgson-inbox'); }
  const RELEASES_KEY = 'sgson-releases-global'; // compartidos entre todos los usuarios

  function _loadUser() {
    try { return JSON.parse(localStorage.getItem(_userKey()) || '{"messages":[],"notifications":[]}'); }
    catch(e) { return { messages: [], notifications: [] }; }
  }
  function _saveUser(data) { localStorage.setItem(_userKey(), JSON.stringify(data)); window.dispatchEvent(new Event('inbox-changed')); }

  function _loadReleases() {
    try { return JSON.parse(localStorage.getItem(RELEASES_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function _saveReleases(rs) { localStorage.setItem(RELEASES_KEY, JSON.stringify(rs)); window.dispatchEvent(new Event('inbox-changed')); }

  function getAll() {
    const u = _loadUser();
    return {
      messages: u.messages || [],
      notifications: u.notifications || [],
      releases: _loadReleases(),
    };
  }

  function unreadCount(category) {
    const all = getAll();
    if (category) return (all[category] || []).filter(i => !i.read).length;
    return (all.messages || []).filter(i => !i.read).length
         + (all.notifications || []).filter(i => !i.read).length
         + (all.releases || []).filter(i => !i.read).length;
  }

  function markRead(category, id) {
    if (category === 'releases') {
      const rs = _loadReleases();
      const r = rs.find(x => x.id === id);
      if (r) { r.read = true; _saveReleases(rs); }
      return;
    }
    const u = _loadUser();
    const list = u[category] || [];
    const item = list.find(x => x.id === id);
    if (item) { item.read = true; _saveUser(u); }
  }

  function markAllRead(category) {
    if (category === 'releases') {
      const rs = _loadReleases();
      rs.forEach(r => r.read = true);
      _saveReleases(rs);
      return;
    }
    const u = _loadUser();
    (u[category] || []).forEach(it => it.read = true);
    _saveUser(u);
  }

  function addNotification(text, opts) {
    opts = opts || {};
    const u = _loadUser();
    const n = {
      id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      text, kind: opts.kind || 'info', icon: opts.icon || '🔔',
      createdAt: Date.now(), read: false, link: opts.link || null,
    };
    u.notifications = [n].concat(u.notifications || []).slice(0, 50);
    _saveUser(u);
    return n;
  }

  function addMessage(from, subject, body, opts) {
    opts = opts || {};
    const u = _loadUser();
    const m = {
      id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      from, subject, body,
      createdAt: Date.now(), read: false, fromAdmin: !!opts.fromAdmin, fromAvatarColor: opts.fromAvatarColor,
    };
    u.messages = [m].concat(u.messages || []).slice(0, 100);
    _saveUser(u);
    return m;
  }

  function deleteItem(category, id) {
    if (category === 'releases') {
      _saveReleases(_loadReleases().filter(x => x.id !== id));
      return;
    }
    const u = _loadUser();
    u[category] = (u[category] || []).filter(x => x.id !== id);
    _saveUser(u);
  }

  function seedIfEmpty() {
    // Seed de mensajes/notifs SOLO en workspaces de demo · antes inyectaba
    // mensajes falsos de "Equipo BeonIt" + "BeonAI" a cualquier user real en
    // modo localStorage (parecían comunicaciones reales del workspace).
    const _isDemoWs = !!(typeof window !== 'undefined' && window.isDemoWorkspace && window.isDemoWorkspace());
    // Releases globales: solo se siembran una vez en toda la plataforma
    if (_loadReleases().length === 0) {
      const now = Date.now();
      const d = 86400000;
      _saveReleases([
        { id:'r_1', version:'2.4', title:'Examen final por ruta · Genera tu certificado', body:'Ahora cada ruta de certificación termina con un examen rápido de 3 preguntas. Al superarlo, descargas tu certificado oficial de tu workspace.', createdAt: now - 1*3600000, read:false, kind:'feature' },
        { id:'r_2', version:'2.3', title:'Bandeja de entrada unificada', body:'Mensajes directos, notificaciones de actividad y releases ahora viven en un único lugar. Marcadas como leídas, eliminables, todo persistente.', createdAt: now - 6*3600000, read:false, kind:'feature' },
        { id:'r_3', version:'2.2', title:'BeonAI con historial de chats persistente', body:'Tus conversaciones con BeonAI se guardan automáticamente. Crea nuevas, retoma anteriores. Modo nocturno en el panel lateral.', createdAt: now - 2*d, read:false, kind:'feature' },
        { id:'r_4', version:'2.1', title:'Multi-usuario y panel de administración', body:'Nuevo flujo de login/registro con rol admin. Cada usuario tiene sus propios bookmarks, chats y progreso.', createdAt: now - 4*d, read:false, kind:'feature' },
        { id:'r_5', version:'2.0', title:'SolidStream · nuevo branding', body:'La plataforma se rebautiza como SolidStream, manteniendo la metodología SOLID GROWTH. Logos y paleta actualizados.', createdAt: now - 9*d, read:true, kind:'announcement' },
      ]);
    }

    // Notificaciones por usuario: solo si workspace de demo · evita mensajes
    // falsos en tenants reales.
    const u = _loadUser();
    if (_isDemoWs && (!u.notifications || u.notifications.length === 0)) {
      const now = Date.now();
      const me = window.Auth && window.Auth.currentUser();
      u.notifications = [
        { id:'n_1', text:'Bienvenido a SolidStream. Completa tu primer pill para empezar.', kind:'welcome', icon:'👋', createdAt: now - 5*60000, read: false },
        { id:'n_2', text:'Tu próxima Pill recomendada: P4 · Posibilidades operativas de los canales', kind:'recommendation', icon:'💡', createdAt: now - 30*60000, read: false, link:'p4' },
        { id:'n_3', text:'BeonAI está listo para responder tus dudas', kind:'info', icon:'✦', createdAt: now - 2*3600000, read: true },
      ];
    }

    if (_isDemoWs && (!u.messages || u.messages.length === 0)) {
      const now = Date.now();
      u.messages = [
        { id:'m_1', from:'Equipo BeonIt', subject:'Sesión de bienvenida', body:'Hola, gracias por unirte a la formación. El próximo lunes tenemos el taller introductorio en la sala virtual. Te llegará el link 30 minutos antes. ¡Bienvenido!', createdAt: now - 24*3600000, read:false, fromAdmin:true, fromAvatarColor:'var(--bn-blue)' },
        { id:'m_2', from:'BeonAI', subject:'Tu plan personalizado', body:'He preparado tu plan de las próximas 4 semanas basado en tu rol Publish Agent. Empieza por las Pills 0-5 (Bloque 1) esta semana. Pregúntame si dudas en algún concepto.', createdAt: now - 3*3600000, read:false, fromAvatarColor:'var(--bn-purple)' },
      ];
    }
    _saveUser(u);
  }

  return { getAll, unreadCount, markRead, markAllRead, addNotification, addMessage, deleteItem, seedIfEmpty };
})();
window.Inbox = Inbox;

// ── RouteExams · examen final de cada ruta + emisión de certificado ─────────
// Banco de preguntas por id de ruta (3 por ruta). Pasar = todas correctas.
const ROUTE_EXAM_BANK = {
  fundamentals: {
    title: 'Examen final · Fundamentals',
    questions: [
      { q: '¿Cuál es el rol que aprueba contenido antes de publicar en redes corporativas?', options: ['Publish Agent', 'Content Lead', 'Care Agent', 'Analytics Lead'], answer: 1 },
      { q: '¿Cuántas Think Pills cubre el bloque 1+2 (Fundamentos)?', options: ['3 pills', '6 pills', '10 pills', '12 pills'], answer: 1 },
      { q: '¿Qué módulo de Sprinklr se usa para gestionar activos digitales reutilizables?', options: ['Social Publish', 'DAM (Digital Asset Management)', 'Care', 'Reporting'], answer: 1 },
    ],
  },
  managers: {
    title: 'Examen final · Managers',
    questions: [
      { q: '¿Qué rol tiene permisos para aprobar publicación en producción?', options: ['Agent', 'Manager', 'Reporting', 'Viewer'], answer: 1 },
      { q: 'En el flujo de aprobación urgente ("fast-track"), ¿qué SLA de revisión aplica en Repsol?', options: ['2 horas', '4 horas', '24 horas', '48 horas'], answer: 0 },
      { q: '¿Qué herramienta usa Repsol para escalar casos de Sprinklr?', options: ['HubSpot', 'Zendesk', 'Salesforce', 'ServiceNow'], answer: 2 },
    ],
  },
  publish: {
    title: 'Examen final · Publish Agent',
    questions: [
      { q: '¿Desde dónde se programa una publicación multicanal?', options: ['Care', 'Calendario editorial de Social Publish', 'DAM', 'Reporting'], answer: 1 },
      { q: '¿Qué permite Sprinklr en publicación multicanal sin reescribir el copy?', options: ['Adaptación automática por red social', 'Solo Twitter', 'Solo LinkedIn', 'Programación manual canal a canal'], answer: 0 },
      { q: '¿Qué hace una macro en Sprinklr?', options: ['Genera reportes', 'Aplica una acción predefinida con un click', 'Borra contenido programado', 'Cambia idioma'], answer: 1 },
    ],
  },
  care: {
    title: 'Examen final · Care Agent',
    questions: [
      { q: '¿Cuál es el First Response SLA estándar de Repsol Care en horario laboral?', options: ['1 h', '2 h', '4 h', '8 h'], answer: 1 },
      { q: '¿Qué acción ejecuta una macro al recibir un mensaje recurrente?', options: ['Borra el caso', 'Responde, etiqueta y/o deriva con un click', 'Notifica solo al admin', 'Bloquea al usuario'], answer: 1 },
      { q: '¿A qué sistema escala Care un caso crítico?', options: ['HubSpot', 'Salesforce', 'Slack', 'Excel'], answer: 1 },
    ],
  },
  analytics: {
    title: 'Examen final · Analytics Lead',
    questions: [
      { q: '¿Qué módulo usarías para monitorización en tiempo real?', options: ['Sprinklr Insights', 'Sprinklr DAM', 'Sprinklr Publish', 'Sprinklr Print'], answer: 0 },
      { q: '¿Qué dimensión NO es típica de un dashboard Repsol?', options: ['Engagement por canal', 'Coste por punto de venta', 'Reach por país', 'Sentimiento agregado'], answer: 1 },
      { q: '¿Qué tipo de gráfica usarías para visualizar drop-off de un funnel formativo?', options: ['Pastel', 'Línea descendente', 'Mapa de calor', 'Treemap'], answer: 1 },
    ],
  },
};

const RouteExams = (function() {
  function _key() { return _userScopedKey('sgson-route-exams'); }
  function getAll() { try { return JSON.parse(localStorage.getItem(_key()) || '{}'); } catch(e) { return {}; } }
  function saveAll(d) { localStorage.setItem(_key(), JSON.stringify(d)); window.dispatchEvent(new Event('exams-changed')); }
  function get(routeId) { return getAll()[routeId] || null; }
  function record(routeId, score, total, passed) {
    const all = getAll();
    all[routeId] = { score, total, passed, completedAt: Date.now() };
    saveAll(all);
  }
  function reset(routeId) { const all = getAll(); delete all[routeId]; saveAll(all); }
  function bank(routeId) { return ROUTE_EXAM_BANK[routeId] || null; }
  return { getAll, get, record, reset, bank };
})();
window.RouteExams = RouteExams;

// ── Submissions · entregas de video por módulo, revisadas por admin ──────────
// Para no llenar localStorage con binarios pesados, guardamos METADATOS de la
// entrega + thumbnail base64 + duración. El video real no se persiste — en el
// modelo SaaS real iría a S3/Vercel Blob/Supabase Storage. Aquí basta para la
// demo del flujo.
const Submissions = (function() {
  const ALL_KEY = 'sgson-submissions-global'; // todas, accesibles por admin
  function _load() { try { return JSON.parse(localStorage.getItem(ALL_KEY) || '[]'); } catch(e) { return []; } }
  function _save(s) { localStorage.setItem(ALL_KEY, JSON.stringify(s)); window.dispatchEvent(new Event('submissions-changed')); }

  function listAll() { return _load(); }
  function listByUser(userId) { return _load().filter(s => s.userId === userId); }
  function listByPill(pillId) { return _load().filter(s => s.pillId === pillId); }
  function listPending() { return _load().filter(s => s.status === 'pending'); }
  function get(id) { return _load().find(s => s.id === id); }

  function getForUserAndPill(userId, pillId) {
    return _load().find(s => s.userId === userId && s.pillId === pillId) || null;
  }

  function submit({ pillId, pillTitle, fileName, fileSize, durationSec, thumbDataUrl }) {
    var u = window.Auth && window.Auth.currentUser();
    if (!u) throw new Error('Necesitas iniciar sesión');
    if (durationSec > 600) throw new Error('Vídeo demasiado largo · máximo 10 minutos');
    var existing = getForUserAndPill(u.id, pillId);
    var sub = {
      id: existing ? existing.id : 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      userId: u.id, userName: u.name, userEmail: u.email, userAvatarColor: u.avatarColor,
      pillId, pillTitle,
      fileName, fileSize, durationSec, thumbDataUrl,
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      submittedAt: Date.now(),
      reviewedAt: null, reviewedBy: null, feedback: null,
    };
    var all = _load();
    if (existing) { all = all.map(s => s.id === existing.id ? sub : s); }
    else { all.unshift(sub); }
    _save(all);
    // Notificar a todos los admins
    if (window.Auth) {
      // No tenemos tabla de notifs por admin individual, dejamos un toast al usuario
    }
    return sub;
  }

  function review(id, status, feedback) {
    var u = window.Auth && window.Auth.currentUser();
    if (!u || !u.isAdmin) throw new Error('Solo admins pueden revisar');
    var all = _load();
    var idx = all.findIndex(s => s.id === id);
    if (idx < 0) return null;
    all[idx].status = status; // 'approved' | 'rejected'
    all[idx].reviewedAt = Date.now();
    all[idx].reviewedBy = { id: u.id, name: u.name };
    all[idx].feedback = feedback || null;
    _save(all);
    // Notificar al usuario que entregó
    var sub = all[idx];
    var users = window.Auth.listUsers();
    var owner = users.find(x => x.id === sub.userId);
    if (owner) {
      // Inyectar notificación en el inbox del owner
      var key = 'sgson-inbox:' + owner.id;
      try {
        var ib = JSON.parse(localStorage.getItem(key) || '{"messages":[],"notifications":[]}');
        ib.notifications = [{
          id: 'n_' + Date.now().toString(36),
          text: 'Tu entrega de "' + sub.pillTitle + '" ha sido ' + (status === 'approved' ? 'APROBADA ✓' : 'rechazada — revisa el feedback'),
          kind: status, icon: status === 'approved' ? '✓' : '✗',
          createdAt: Date.now(), read: false,
        }].concat(ib.notifications || []);
        localStorage.setItem(key, JSON.stringify(ib));
      } catch(e) {}
    }
    return all[idx];
  }

  function remove(id) { _save(_load().filter(s => s.id !== id)); }

  return { listAll, listByUser, listByPill, listPending, get, getForUserAndPill, submit, review, remove };
})();
window.Submissions = Submissions;

function TweaksPanel({ shape, setShape, accent, setAccent, aiMode, setAIMode }) {
  const persist = (edits) => window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  return (
    <div style={{position:'fixed', right:20, top:76, width:280, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:14, padding:18, zIndex:600, boxShadow:'0 20px 60px rgba(0,0,0,0.12)'}}>
      <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17, marginBottom:4}}>Tweaks</div>
      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:16}}>Live · saved to file</div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Pill card shape</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
          {['mixed','capsule','square','vertical'].map(s => (
            <button key={s} onClick={() => { setShape(s); persist({shape:s}); }}
              style={{padding:'7px 10px', borderRadius:8, border:`1px solid ${shape===s?'var(--ink)':'var(--line)'}`, background: shape===s?'var(--ink)':'transparent', color: shape===s?'var(--paper)':'var(--ink)', fontSize:11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em', cursor:'pointer'}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Accent</div>
        <div style={{display:'flex', gap:8}}>
          {['#c8ff3d', '#ff5a1f', '#6d5efc', '#00d4a8', '#ffc93d'].map(c => (
            <button key={c} onClick={() => { setAccent(c); persist({accent:c}); }}
              style={{width:28, height:28, borderRadius:'50%', background:c, border: accent===c ? '2px solid var(--ink)':'1px solid var(--line)', cursor:'pointer'}}/>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Coach prominence</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
          {['collapsed','companion','hero'].map(m => (
            <button key={m} onClick={() => { setAIMode(m); persist({aiMode:m}); }}
              style={{padding:'7px 6px', borderRadius:8, border:`1px solid ${aiMode===m?'var(--ink)':'var(--line)'}`, background: aiMode===m?'var(--ink)':'transparent', color: aiMode===m?'var(--paper)':'var(--ink)', fontSize:10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.04em', cursor:'pointer'}}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Login / Signup screen ─────────────────────────────────────────────────
function LoginScreen() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  // Re-renderiza cuando cambia el idioma (vía selector inline durante login)
  const [, _forceRerender] = useSM(0);
  useEM(() => {
    const onChange = () => _forceRerender(x => x + 1);
    window.addEventListener('settings-changed', onChange);
    return () => window.removeEventListener('settings-changed', onChange);
  }, []);
  const isSupabase = (typeof window !== 'undefined' && window.SGSON_BACKEND === 'supabase');

  // Detectar invite token en la URL (?invite=inv_xxx)
  const inviteToken = (() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  })();
  // En Supabase mode getByToken es async (RPC) · resolvemos vía useEffect.
  // En demo mode (sin Supabase) sigue siendo sync · resolvemos inmediato.
  const [invitation, setInvitation] = useSM(() => {
    if (!inviteToken || !window.Invitations) return null;
    if (window.SGSON_BACKEND === 'supabase') return null;  // se carga async
    const res = window.Invitations.getByToken(inviteToken);
    return res && !res.then ? res : null;
  });
  useEM(() => {
    if (!inviteToken || !window.Invitations) return;
    if (window.SGSON_BACKEND !== 'supabase') return;
    Promise.resolve(window.Invitations.getByToken(inviteToken)).then(inv => {
      if (inv) setInvitation(inv);
    });
  }, [inviteToken]);

  const [mode, setMode] = useSM(invitation ? 'signup' : 'login');
  const [email, setEmail] = useSM(invitation ? invitation.email : '');
  const [password, setPassword] = useSM('');
  const [name, setName] = useSM(invitation ? invitation.name : '');
  // Cuando llega la invitación async, propaga los campos pre-rellenos
  useEM(() => {
    if (!invitation) return;
    setMode('signup');
    if (invitation.email && !email) setEmail(invitation.email);
    if (invitation.name && !name) setName(invitation.name);
  }, [invitation && invitation.token]);
  // Si llega por link de invitación, el admin ya pre-seleccionó role+team
  // en el token. Si no, signup público · ambos vacíos · los asignará el admin
  // del workspace cuando le añada al equipo.
  const [role, setRole] = useSM(invitation ? invitation.role : '');
  const [team, setTeam] = useSM(invitation ? invitation.team : '');
  const [error, setError] = useSM('');
  const [submitting, setSubmitting] = useSM(false);

  const submit = async (e) => {
    e && e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const u = await Promise.resolve(Auth.login(email, password));
        if (window.Toast && u) window.Toast.success(T('login.welcome') + ', ' + (u.name || '').split(' ')[0], { icon: '👋' });
      } else {
        const u = await Promise.resolve(Auth.signup({ email, password, name, role, team }));
        if (invitation && window.Invitations) {
          // accept_invitation (RPC en Supabase mode) inserta workspace_members
          // y marca status=accepted. En demo mode solo cambia status local.
          await Promise.resolve(window.Invitations.markAccepted(invitation.token));
          // Activa el workspace correcto para que el user aterrice en él
          if (invitation.workspace_id && window.Workspaces && window.Workspaces.setCurrent) {
            window.Workspaces.setCurrent(invitation.workspace_id);
          }
          if (window.Activity) window.Activity.log('accept_invite', { token: invitation.token, role: invitation.role });
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
        if (window.Toast && u) window.Toast.success(invitation ? T('login.welcomeInvite') : T('login.welcomeCreated'), { icon: '✓' });
      }
    } catch (err) {
      setError((err && err.message) || T('login.errorGeneric'));
    }
    setSubmitting(false);
  };

  const quickLogin = async (em) => {
    setEmail(em);
    setError('');
    try {
      const u = await Promise.resolve(Auth.login(em));
      if (window.Toast && u) window.Toast.success(T('login.sessionStarted'), { icon: '✓' });
    } catch(e) { setError(e.message); }
  };

  const ssoLogin = async () => {
    setError('');
    if (!window.supabaseClient) {
      setError('SSO requiere Supabase activo. Lee docs/EMAIL-AND-SSO-SETUP.md');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: window.location.origin + '/' + (inviteToken ? '?invite=' + inviteToken : ''),
          scopes: 'email openid profile',
        },
      });
      if (error) throw error;
      // Browser redirige a Microsoft, no llegamos aquí normalmente
    } catch (err) {
      // Mensaje claro según la causa más común · Azure provider no habilitado
      // en Supabase (Authentication → Providers) o redirect URL no permitida.
      const raw = (err && (err.message || err.error_description || err.msg)) || String(err);
      let hint = raw;
      if (/provider is not enabled|unsupported provider|not enabled/i.test(raw)) {
        hint = 'El proveedor Azure no está habilitado en Supabase · Authentication → Providers → Azure. Lee docs/EMAIL-AND-SSO-SETUP.md (sección B).';
      } else if (/redirect|callback|url/i.test(raw)) {
        hint = 'URL de redirect no permitida · añade ' + window.location.origin + '/ en Supabase · Authentication → URL Configuration → Redirect URLs.';
      }
      setError('SSO Microsoft: ' + hint);
      setSubmitting(false);
    }
  };

  const users = Auth.listUsers ? Auth.listUsers() : [];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000, display:'flex',
      background:'#F1F4F9',
      overflow:'auto', color:'#0B1220',
    }}>
      {/* Lado visual izquierdo · hero navy degradado estilo Udacity */}
      <div style={{flex:1, padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', color:'#FFFFFF', minWidth:0,
        background:'radial-gradient(circle at 85% 15%, rgba(45,107,246,0.35), transparent 50%), radial-gradient(circle at 10% 90%, rgba(17,72,199,0.45), transparent 55%), linear-gradient(135deg, #070F2A 0%, #0B1834 45%, #0F3CA8 130%)'}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <img src={`beonit-logo.png?v=${window.SOLID_VERSION || 'init'}`} alt="BeonIt" style={{height:42, width:'auto', flexShrink:0}}/>
          <span style={{fontFamily:'var(--font-sans, Inter)', fontWeight:700, fontSize:26, letterSpacing:'-0.025em', color:'#FFFFFF'}}>
            Solid<span style={{fontFamily:'var(--font-serif, "Instrument Serif", Georgia)', fontStyle:'italic', fontWeight:400}}>Stream</span>
          </span>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.60)', marginBottom:24}}>{T('login.eyebrow')}</div>
          <h1 style={{fontFamily:'var(--font-sans, Inter)', fontSize:'clamp(40px, 5.5vw, 72px)', fontWeight:700, lineHeight:1.02, letterSpacing:'-0.03em', margin:0, color:'#FFFFFF'}}>
            {T('login.title.l1')}<br/>{T('login.title.l2')}<br/>{T('login.title.l3')} <em style={{fontFamily:'var(--font-serif, "Instrument Serif", Georgia)', fontStyle:'italic', fontWeight:400, color:'#AECBF2'}}>{T('login.title.expert')}</em>.
          </h1>
          <p style={{fontFamily:'var(--font-serif, "Instrument Serif", Georgia)', fontStyle:'italic', fontSize:20, color:'rgba(255,255,255,0.78)', margin:'16px 0 0', maxWidth:520, lineHeight:1.5}}>
            {T('login.subtitle')}
          </p>
          <div style={{marginTop:36, display:'flex', gap:8, flexWrap:'wrap'}}>
            {[T('login.chip.pills'), T('login.chip.workshops'), T('login.chip.beonai'), T('login.chip.cert')].map(t => (
              <span key={t} style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10.5, letterSpacing:'0.12em', textTransform:'uppercase', padding:'6px 13px', border:'1px solid rgba(255,255,255,0.22)', borderRadius:999, color:'rgba(255,255,255,0.85)', background:'rgba(255,255,255,0.08)'}}>{t}</span>
            ))}
          </div>
          {/* Selector de idioma inline · sin sesión todavía */}
          <div style={{marginTop:18, display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.60)'}}>🌍</span>
            {['es','en','pt'].map(lng => {
              const cur = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
              const active = cur === lng;
              return (
                <button key={lng} onClick={() => {
                  // Bug: currentLang() lee primero de Settings.language (DEFAULT='es')
                  // antes de solid-preferred-lang. Si solo escribíamos en el segundo,
                  // el clic no surtía efecto · ahora actualizamos Settings (global)
                  // que persiste el idioma y dispara settings-changed automáticamente.
                  if (window.Settings && window.Settings.update) {
                    window.Settings.update({ language: lng });
                  } else {
                    localStorage.setItem('solid-preferred-lang', lng);
                    window.dispatchEvent(new Event('settings-changed'));
                  }
                }}
                  style={{padding:'4px 10px', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', background: active ? '#2D6BF6' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.70)', border:'1px solid '+(active ? '#2D6BF6' : 'rgba(255,255,255,0.22)'), borderRadius:6, cursor:'pointer'}}>{lng}</button>
              );
            })}
          </div>
        </div>
        <div style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10, color:'rgba(255,255,255,0.50)', letterSpacing:'0.1em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:10}}>
          <span>by BeonIt</span>
          <span style={{width:3, height:3, background:'rgba(255,255,255,0.50)', borderRadius:'50%'}}/>
          <span>Powered by Claude</span>
          <span style={{width:3, height:3, background:'rgba(255,255,255,0.50)', borderRadius:'50%'}}/>
          <span>v 2.0</span>
        </div>
      </div>

      {/* Form lado derecho · dark glass */}
      <div style={{
        flex:'0 0 480px', maxWidth:'100%',
        background:'rgba(255,255,255,0.90)', backdropFilter:'blur(24px) saturate(140%)', WebkitBackdropFilter:'blur(24px) saturate(140%)',
        borderLeft:'1px solid rgba(11,18,38,0.08)',
        padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'auto'
      }}>
        <div style={{maxWidth:380, width:'100%', margin:'auto 0'}}>
          {invitation && (
            <div style={{padding:'16px 18px', background:'rgba(45,107,246,0.08)', border:'1px solid rgba(45,107,246,0.3)', borderRadius:10, marginBottom:24}}>
              <div style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#2D6BF6', fontWeight:700, marginBottom:5}}>✉ {T('login.invite.title')}</div>
              <div style={{fontSize:13.5, color:'#0B1220', lineHeight:1.5}}>{T('login.invite.body','Te han invitado a SolidStream como {role}.').replace('{team}', invitation.team || 'tu empresa').replace('{role}', invitation.role || '—')}</div>
            </div>
          )}
          {/* Tabs login/signup · solo se ven cuando llega un ?invite=token ·
              cuentas nuevas se crean por invitación del admin del workspace,
              no por signup organic desde la landing. */}
          {invitation && (
            <div style={{display:'flex', gap:4, marginBottom:32, padding:5, background:'rgba(11,18,38,0.04)', border:'1px solid rgba(11,18,38,0.08)', borderRadius:10, width:'fit-content'}}>
              <button onClick={() => { setMode('login'); setError(''); }}
                style={{padding:'8px 20px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:600,
                  background: mode==='login' ? '#0B1220' : 'transparent', color: mode==='login' ? '#FFFFFF' : 'rgba(11,18,38,0.6)',
                  transition:'all .12s'}}>{T('login.mode.login')}</button>
              <button onClick={() => { setMode('signup'); setError(''); }}
                style={{padding:'8px 20px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:600,
                  background: mode==='signup' ? '#0B1220' : 'transparent', color: mode==='signup' ? '#FFFFFF' : 'rgba(11,18,38,0.6)',
                  transition:'all .12s'}}>{T('login.mode.signup')}</button>
            </div>
          )}
          <h2 style={{margin:'0 0 10px', fontSize:28, letterSpacing:'-0.02em', color:'#0B1220', fontWeight:700, fontFamily:'var(--font-sans, Inter)'}}>{mode === 'login' ? 'Entrar a tu cuenta' : 'Crear nueva cuenta'}</h2>
          <p style={{fontSize:14, color:'rgba(11,18,38,0.6)', marginBottom:28, lineHeight:1.5, fontFamily:'var(--font-serif, "Instrument Serif", Georgia)', fontStyle:'italic'}}>{mode === 'login' ? 'Usa el email con el que te registraste.' : 'Te llevará 30 segundos.'}</p>

          <form onSubmit={submit}>
            <label style={{display:'block', marginBottom:14}}>
              <div style={{fontSize:10, color:'rgba(11,18,38,0.5)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6, fontWeight:600}}>{T('login.email')}</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" autoFocus
                style={{width:'100%', padding:'12px 14px', border:'1px solid rgba(11,18,38,0.12)', borderRadius:8, fontFamily:'var(--font-sans, Inter)', fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(11,18,38,0.04)', color:'#0B1220', transition:'border-color .15s'}}
                onFocus={e => e.target.style.borderColor='#2D6BF6'}
                onBlur={e => e.target.style.borderColor='rgba(11,18,38,0.12)'}/>
            </label>
            {isSupabase && (
              <label style={{display:'block', marginBottom:14}}>
                <div style={{fontSize:10, color:'rgba(11,18,38,0.5)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6, fontWeight:600}}>{T('login.password')}</div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '············'}
                  style={{width:'100%', padding:'12px 14px', border:'1px solid rgba(11,18,38,0.12)', borderRadius:8, fontFamily:'var(--font-sans, Inter)', fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(11,18,38,0.04)', color:'#0B1220'}}
                  onFocus={e => e.target.style.borderColor='#2D6BF6'}
                  onBlur={e => e.target.style.borderColor='rgba(11,18,38,0.12)'}/>
              </label>
            )}
            {mode === 'signup' && (
              <label style={{display:'block', marginBottom:14}}>
                <div style={{fontSize:10, color:'rgba(11,18,38,0.5)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6, fontWeight:600}}>{T('login.name')}</div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo"
                  style={{width:'100%', padding:'12px 14px', border:'1px solid rgba(11,18,38,0.12)', borderRadius:8, fontFamily:'var(--font-sans, Inter)', fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(11,18,38,0.04)', color:'#0B1220'}}
                  onFocus={e => e.target.style.borderColor='#2D6BF6'}
                  onBlur={e => e.target.style.borderColor='rgba(11,18,38,0.12)'}/>
              </label>
            )}
            {/* Role y team los asigna el admin del workspace cuando crea/invita
                al usuario · NO se piden en el signup público · ver InviteUsersModal */}
            {error && (
              <div style={{padding:'10px 14px', background:'rgba(45,107,246,0.1)', border:'1px solid rgba(45,107,246,0.35)', borderRadius:8, color:'#D93843', fontSize:13, marginBottom:14, fontFamily:'var(--font-sans, Inter)'}}>
                {error}
              </div>
            )}
            <button type="submit" disabled={submitting}
              style={{width:'100%', justifyContent:'center', marginTop:8, opacity: submitting ? 0.6 : 1, padding:'14px 24px', background: submitting ? 'rgba(45,107,246,0.5)' : '#2D6BF6', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'var(--font-sans, Inter)', fontSize:14, fontWeight:700, transition:'background .15s', display:'flex', alignItems:'center', gap:8}}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#5A8DFF'; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#2D6BF6'; }}>
              {submitting ? T('login.submitting') : (mode === 'login' ? T('login.submit.login') + ' →' : T('login.submit.signup') + ' →')}
            </button>
          </form>

          {isSupabase && (
            <>
              <div style={{display:'flex', alignItems:'center', gap:10, margin:'20px 0', color:'rgba(11,18,38,0.4)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
                <div style={{flex:1, height:1, background:'rgba(11,18,38,0.1)'}}/>
                <span>o</span>
                <div style={{flex:1, height:1, background:'rgba(11,18,38,0.1)'}}/>
              </div>
              <button type="button" onClick={ssoLogin} disabled={submitting}
                style={{width:'100%', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px 16px', border:'1px solid rgba(11,18,38,0.12)', borderRadius:8, background:'rgba(11,18,38,0.04)', cursor:'pointer', fontFamily:'var(--font-sans, Inter)', fontSize:14, fontWeight:600, color:'#0B1220', transition:'all .15s'}}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(11,18,38,0.08)'; e.currentTarget.style.borderColor='rgba(11,18,38,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(11,18,38,0.04)'; e.currentTarget.style.borderColor='rgba(11,18,38,0.12)'; }}>
                <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f25022" d="M0 0h11v11H0z"/><path fill="#7fba00" d="M12 0h11v11H12z"/><path fill="#00a4ef" d="M0 12h11v11H0z"/><path fill="#ffb900" d="M12 12h11v11H12z"/></svg>
                {T('login.sso')}
              </button>
              <div style={{marginTop:8, fontSize:11, color:'rgba(11,18,38,0.4)', textAlign:'center', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', letterSpacing:'0.06em'}}>SSO corporativo · cuenta Microsoft de tu empresa</div>
            </>
          )}

          <div style={{marginTop:20, fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(11,18,38,0.5)', display:'flex', alignItems:'center', gap:8}}>
            <span style={{width:6, height:6, borderRadius:'50%', background: isSupabase ? '#4ADE80' : '#F4B740', display:'inline-block', boxShadow:`0 0 8px ${isSupabase ? '#4ADE80' : '#F4B740'}`}}/>
            Backend · {isSupabase ? 'Supabase · Conectado' : 'Demo · LocalStorage'}
          </div>

          {!isSupabase && users.length > 0 && mode === 'login' && (
            <div style={{marginTop:32, paddingTop:24, borderTop:'1px solid rgba(11,18,38,0.08)'}}>
              <div style={{fontSize:10, color:'rgba(11,18,38,0.5)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontWeight:600}}>{T('login.quickDemo')}</div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {users.slice(0, 4).map(u => (
                  <button key={u.id} onClick={() => quickLogin(u.email)} type="button"
                    style={{display:'flex', alignItems:'center', gap:12, padding:'10px 14px', border:'1px solid rgba(11,18,38,0.08)', borderRadius:8, background:'rgba(11,18,38,0.03)', cursor:'pointer', textAlign:'left', fontFamily:'var(--font-sans, Inter)', transition:'all .15s'}}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(11,18,38,0.08)'; e.currentTarget.style.borderColor='rgba(11,18,38,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(11,18,38,0.03)'; e.currentTarget.style.borderColor='rgba(11,18,38,0.08)'; }}>
                    <div style={{width:32, height:32, borderRadius:'50%', background:u.avatarColor || '#2D6BF6', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0}}>
                      {u.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13.5, fontWeight:600, color:'#0B1220', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{u.name}</div>
                      <div style={{fontSize:10.5, color:'rgba(11,18,38,0.5)', fontFamily:'var(--font-mono, "JetBrains Mono", monospace)'}}>{u.email}</div>
                    </div>
                    {u.isAdmin && <span style={{fontFamily:'var(--font-mono, "JetBrains Mono", monospace)', fontSize:9, fontWeight:800, padding:'3px 7px', background:'#2D6BF6', color:'#fff', borderRadius:4, letterSpacing:'0.08em'}}>ADMIN</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin panel · vista exclusiva para admins ──────────────────────────────
function ExportMenu({ onUsers, onSubmissions, onCohort }) {
  const [open, setOpen] = useSM(false);
  useEM(() => {
    if (!open) return;
    const close = () => setOpen(false);
    setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
  }, [open]);
  const onItem = (fn, e) => { e.stopPropagation(); setOpen(false); fn && fn(); };

  return (
    <div style={{position:'relative'}}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="btn ghost" style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Exportar
      </button>
      {open && (
        <div style={{position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200, minWidth:240,
          background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,0.12)',
          padding:6}} onClick={e => e.stopPropagation()}>
          {[
            { label:'Usuarios · CSV',           sub:'Lista con métricas básicas',     icon:'👤', fn: onUsers },
            { label:'Entregas prácticas · CSV', sub:'Vídeos enviados + revisión',     icon:'🎬', fn: onSubmissions },
            { label:'Reporte de cohorte · HTML', sub:'KPIs + tabla agregada (imprimible)', icon:'📄', fn: onCohort },
          ].map((x, i) => (
            <button key={i} onClick={(e) => onItem(x.fn, e)} style={{display:'flex', alignItems:'flex-start', gap:10, width:'100%', padding:'10px 12px', border:'none', background:'transparent', borderRadius:8, cursor:'pointer', textAlign:'left'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <span style={{fontSize:16, flexShrink:0}}>{x.icon}</span>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{x.label}</div>
                <div style={{fontSize:11, color:'var(--ink-4)', marginTop:1}}>{x.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ setView }) {
  const [users, setUsers] = useSM(Auth.listUsers());
  const [filter, setFilter] = useSM('');
  const [showInvite, setShowInvite] = useSM(false);
  const [selectedIds, setSelectedIds] = useSM([]);
  const [invitations, setInvitations] = useSM(window.Invitations ? window.Invitations.list() : []);
  useEM(() => {
    const refresh = () => setInvitations(window.Invitations ? window.Invitations.list() : []);
    window.addEventListener('invitations-changed', refresh);
    return () => window.removeEventListener('invitations-changed', refresh);
  }, []);
  useEM(() => {
    const refresh = () => setUsers(Auth.listUsers());
    window.addEventListener('auth-users-changed', refresh);
    return () => window.removeEventListener('auth-users-changed', refresh);
  }, []);

  // Métricas por usuario desde Supabase (RPC workspace_user_metrics) · en modo
  // Supabase los contadores por-usuario de OTROS usuarios no están en
  // localStorage, así que los traemos del backend (requiere
  // db/workspace-user-metrics.sql). Mapa userId → {bookmarks,chats,completed,enrolled}.
  const [dbMetrics, setDbMetrics] = useSM(null);
  useEM(() => {
    let alive = true;
    const fetchMetrics = () => {
      const sb = window.supabaseClient;
      const wsId = window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId();
      if (!sb || !sb.rpc || !wsId) { if (alive) setDbMetrics(null); return; }
      sb.rpc('workspace_user_metrics', { p_workspace_id: wsId }).then(({ data, error }) => {
        if (!alive) return;
        if (error) { console.warn('[admin] workspace_user_metrics', error.message); setDbMetrics(null); return; }
        const map = {};
        (data || []).forEach(r => { map[r.user_id] = { bookmarks: Number(r.bookmarks)||0, chats: Number(r.chats)||0, completed: Number(r.completed)||0, enrolled: Number(r.enrolled)||0 }; });
        setDbMetrics(map);
      });
    };
    fetchMetrics();
    // Re-fetch al cambiar de workspace · antes deps [] dejaba métricas del ws
    // anterior si el admin cambiaba de tenant con el panel abierto.
    window.addEventListener('workspace-changed', fetchMetrics);
    return () => { alive = false; window.removeEventListener('workspace-changed', fetchMetrics); };
  }, []);

  const filtered = users.filter(u => !filter || (u.name + ' ' + u.email + ' ' + u.role + ' ' + u.team).toLowerCase().includes(filter.toLowerCase()));
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.isAdmin).length;
  const totalActive7d = users.filter(u => Date.now() - (u.lastLoginAt || 0) < 7*86400000).length;

  // Helpers de export
  const _download = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  };
  const _csvCell = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? '"' + s + '"' : s;
  };
  const exportUsersCSV = () => {
    const rows = [['email','name','role','team','is_admin','created_at','last_login','bookmarks','chats','pills_completed']];
    userMetrics.forEach(u => rows.push([
      u.email, u.name, u.role, u.team, u.isAdmin ? 'yes' : 'no',
      u.createdAt ? new Date(u.createdAt).toISOString() : '',
      u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '',
      u._bookmarks, u._chats, u._completed,
    ]));
    const csv = rows.map(r => r.map(_csvCell).join(',')).join('\n');
    _download('sgson-users-' + new Date().toISOString().slice(0,10) + '.csv', csv, 'text/csv');
    if (window.Toast) window.Toast.success(userMetrics.length + ' usuarios exportados', { icon: '↓' });
  };
  const exportSubmissionsCSV = () => {
    const subs = (window.Submissions && window.Submissions.listAll()) || [];
    const rows = [['user_email','user_name','pill_id','pill_title','status','duration_sec','file_size','submitted_at','reviewed_at','reviewer','feedback']];
    subs.forEach(s => rows.push([
      s.userEmail || '', s.userName || '', s.pillId || '', s.pillTitle || '',
      s.status, s.durationSec, s.fileSize,
      s.submittedAt ? new Date(s.submittedAt).toISOString() : '',
      s.reviewedAt ? new Date(s.reviewedAt).toISOString() : '',
      s.reviewedBy ? s.reviewedBy.name : '',
      s.feedback || '',
    ]));
    const csv = rows.map(r => r.map(_csvCell).join(',')).join('\n');
    _download('sgson-submissions-' + new Date().toISOString().slice(0,10) + '.csv', csv, 'text/csv');
    if (window.Toast) window.Toast.success(subs.length + ' entregas exportadas', { icon: '↓' });
  };
  const exportCohortReport = () => {
    const today = new Date().toLocaleDateString('es-ES', { dateStyle:'long' });
    const subs = (window.Submissions && window.Submissions.listAll()) || [];
    const usersHtml = userMetrics.sort((a,b) => b._completed - a._completed).map(u => {
      const initials = u.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
      const pct = Math.round((u._completed / Math.max(1, (window.PILLS||[]).length || 41)) * 100);
      return '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:8px"><div style="width:24px;height:24px;border-radius:50%;background:' + u.avatarColor + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">' + initials + '</div>' + u.name + (u.isAdmin ? ' <span style="font-family:monospace;font-size:8px;padding:1px 5px;background:#0B1220;color:#fff;border-radius:3px">ADMIN</span>' : '') + '</div><div style="font-family:monospace;font-size:10px;color:#99A5BD">' + u.email + '</div></td>' +
        '<td>' + u.role + '<div style="font-family:monospace;font-size:10px;color:#99A5BD">' + u.team + '</div></td>' +
        '<td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:#EDF0F5;border-radius:3px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#BCD630,#0072BE)"></div></div><span style="font-family:monospace;font-size:11px;font-weight:700;flex-shrink:0">' + pct + '%</span></div><div style="font-family:monospace;font-size:10px;color:#99A5BD">' + u._completed + ' / ' + ((window.PILLS||[]).length || 41) + ' pills</div></td>' +
        '<td style="font-family:monospace;font-size:11px">' + u._chats + ' chats</td>' +
        '<td style="font-family:monospace;font-size:11px">' + u._bookmarks + ' guardados</td>' +
        '<td style="font-family:monospace;font-size:10px;color:#99A5BD">' + (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-ES') : '—') + '</td>' +
      '</tr>';
    }).join('');
    const subsByStatus = { pending:0, approved:0, rejected:0 };
    subs.forEach(s => subsByStatus[s.status] = (subsByStatus[s.status] || 0) + 1);
    const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte de cohorte · SolidStream · ' + today + '</title>' +
'<style>@page{size:A4;margin:18mm}body{font-family:Inter,-apple-system,system-ui,sans-serif;color:#0B1220;margin:0;padding:0;line-height:1.5}.kicker{font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#99A5BD;margin-bottom:6px}h1{font-size:32px;letter-spacing:-.02em;margin:0 0 8px}h2{font-size:18px;margin:32px 0 12px;border-bottom:1px solid #EDF0F5;padding-bottom:6px}.subtitle{color:#45506A;margin:0 0 28px}.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px}.kpi{padding:14px;border:1px solid #EDF0F5;border-radius:10px}.kpi-label{font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#99A5BD;margin-bottom:4px}.kpi-value{font-size:24px;font-weight:800;letter-spacing:-.02em}table{width:100%;border-collapse:collapse;font-size:12px}thead th{text-align:left;padding:8px 10px;background:#F5F7FA;font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#45506A;border-bottom:1px solid #EDF0F5}tbody td{padding:10px;border-bottom:1px solid #EDF0F5;vertical-align:top}.foot{margin-top:36px;padding-top:18px;border-top:2px solid #0072BE;font-family:JetBrains Mono,monospace;font-size:10px;color:#99A5BD;letter-spacing:.08em;text-transform:uppercase;display:flex;justify-content:space-between}.brand{background:linear-gradient(135deg,#BCD630,#0072BE,#8A3992);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700}</style>' +
'</head><body>' +
'<div class="kicker">SolidStream · ' + (window.WORKSPACE_NAME || 'Plataforma') + ' · Reporte de cohorte</div>' +
'<h1>Cohorte SolidStream · <span class="brand">snapshot</span> ' + today + '</h1>' +
'<p class="subtitle">Reporte agregado de progreso, exámenes y entregas prácticas de los ' + totalUsers + ' usuarios de la plataforma. Generado el ' + today + '.</p>' +
'<div class="kpis">' +
'<div class="kpi"><div class="kpi-label">Usuarios</div><div class="kpi-value">' + totalUsers + '</div></div>' +
'<div class="kpi"><div class="kpi-label">Activos 7d</div><div class="kpi-value">' + totalActive7d + '</div></div>' +
'<div class="kpi"><div class="kpi-label">Pills completadas</div><div class="kpi-value">' + totalCompletions + '</div></div>' +
'<div class="kpi"><div class="kpi-label">Conversaciones IA</div><div class="kpi-value">' + totalChats + '</div></div>' +
'<div class="kpi"><div class="kpi-label">Entregas pendientes</div><div class="kpi-value">' + (subsByStatus.pending || 0) + '</div></div>' +
'</div>' +
'<h2>Entregas prácticas · estado</h2>' +
'<p style="font-size:13px;color:#45506A">Pendientes <strong>' + (subsByStatus.pending || 0) + '</strong> · Aprobadas <strong>' + (subsByStatus.approved || 0) + '</strong> · Rechazadas <strong>' + (subsByStatus.rejected || 0) + '</strong>. Tasa aprobación: <strong>' + (subs.length > 0 ? Math.round((subsByStatus.approved / subs.length) * 100) : 0) + '%</strong>.</p>' +
'<h2>Tabla de usuarios · ordenados por progreso</h2>' +
'<table><thead><tr><th>Usuario</th><th>Rol · Equipo</th><th>Progreso</th><th>Chats</th><th>Guardados</th><th>Última conexión</th></tr></thead><tbody>' + usersHtml + '</tbody></table>' +
'<div class="foot"><span>SolidStream · ' + (window.WORKSPACE_NAME || 'Plataforma') + '</span><span>Reporte generado · ' + today + '</span></div>' +
'</body></html>';
    _download('sgson-cohort-report-' + new Date().toISOString().slice(0,10) + '.html', html, 'text/html');
    if (window.Toast) window.Toast.success('Reporte generado · imprimible como PDF', { icon: '📄' });
  };

  // Métricas por usuario · completados/chats/bookmarks.
  // Las claves correctas son workspace-scoped (`base:userId:wsId`) · antes
  // leía claves legacy pre-multitenant (`base:userId`) → siempre 0.
  // Para el usuario ACTUAL (el admin que mira) usamos las cachés vivas, que en
  // modo Supabase tienen los datos reales aunque no estén en localStorage.
  const _wsId = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || '_default';
  const _meId = (window.Auth && window.Auth.currentUserId && window.Auth.currentUserId()) || null;
  const userMetrics = users.map(u => {
    let bookmarks = 0, chats = 0, completed = 0;
    // 1) Si hay métricas del backend (RPC), son la fuente de verdad para TODOS.
    if (dbMetrics && dbMetrics[u.id]) {
      const m = dbMetrics[u.id];
      bookmarks = m.bookmarks; chats = m.chats; completed = m.completed;
    } else if (u.id === _meId) {
      // 2) Usuario actual · cachés vivas (Supabase o local · sin RPC todavía)
      try { bookmarks = (window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get().length) || 0; } catch(e) {}
      try { chats = (window.ChatHistory && window.ChatHistory.list && window.ChatHistory.list().length) || 0; } catch(e) {}
      try { completed = (window.Progress && window.Progress.completedCount && window.Progress.completedCount()) || ((window.SGS_DATA && window.SGS_DATA.PILLS) || []).filter(p => p.progress >= 1).length; } catch(e) {}
    } else {
      // 3) Otros usuarios sin RPC · solo disponible en modo localStorage
      try { bookmarks = JSON.parse(localStorage.getItem('solid-bookmarks:' + u.id + ':' + _wsId) || '[]').length; } catch(e) {}
      try { chats = JSON.parse(localStorage.getItem('solid-chats:' + u.id + ':' + _wsId) || '[]').length; } catch(e) {}
      try { completed = JSON.parse(localStorage.getItem('solid-completed-routes:' + u.id + ':' + _wsId) || '[]').length; } catch(e) {}
    }
    return { ...u, _bookmarks: bookmarks, _chats: chats, _completed: completed };
  });
  const totalCompletions = userMetrics.reduce((s,u) => s + u._completed, 0);
  const totalChats = userMetrics.reduce((s,u) => s + u._chats, 0);

  const filteredMetrics = userMetrics.filter(u => !filter || (u.name + ' ' + u.email + ' ' + u.role + ' ' + u.team).toLowerCase().includes(filter.toLowerCase()));

  const fmtRel = (ts) => {
    if (!ts) return '—';
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    return Math.floor(d/86400) + ' d';
  };

  const toggleAdmin = (u) => {
    if (u.id === Auth.currentUserId() && u.isAdmin) {
      if (!confirm('¿Quitarte el rol admin a TI mismo? Perderás acceso a este panel.')) return;
    }
    Auth.setAdmin(u.id, !u.isAdmin);
    if (window.Toast) window.Toast.success((u.isAdmin ? 'Quitado admin a ' : 'Hecho admin a ') + u.name);
  };
  const removeUser = (u) => {
    if (u.id === Auth.currentUserId()) { alert('No puedes borrar tu propio usuario.'); return; }
    if (!confirm('¿Borrar definitivamente a ' + u.name + ' y todos sus datos (bookmarks, chats, progreso)?')) return;
    Auth.deleteUser(u.id);
    if (window.Toast) window.Toast.info('Usuario eliminado · ' + u.name);
  };

  return (
    <div className="main-inner" style={{padding:'100px 48px 48px', maxWidth:'none'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24}}>
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot" style={{background:'var(--ink)'}}/>Panel de administración</div>
          <h1 style={{fontFamily:'var(--sans)', fontWeight:800, fontSize:'clamp(28px,3vw,38px)', letterSpacing:'-0.02em', margin:'4px 0 0'}}>Usuarios y métricas</h1>
          <p style={{fontSize:13.5, color:'var(--ink-3)', margin:'8px 0 0', maxWidth:580}}>Gestiona los usuarios de la plataforma, sus roles y revisa métricas agregadas en tiempo real.</p>
          <div style={{marginTop:10, display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', borderRadius:999, background: window.SGSON_BACKEND === 'supabase' ? 'rgba(188,214,48,0.12)' : 'rgba(243,165,37,0.12)', border: '1px solid ' + (window.SGSON_BACKEND === 'supabase' ? 'rgba(188,214,48,0.4)' : 'rgba(243,165,37,0.4)')}}>
            <span style={{width:7, height:7, borderRadius:'50%', background: window.SGSON_BACKEND === 'supabase' ? 'var(--bn-lime)' : 'var(--bn-orange)'}}/>
            <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, color: window.SGSON_BACKEND === 'supabase' ? 'var(--bn-lime-dark)' : '#7a4400'}}>
              {window.SGSON_BACKEND === 'supabase' ? 'Supabase backend conectado · datos reales en DB' : 'Demo mode · datos en localStorage de este navegador'}
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Buscar usuario, email, rol…"
            style={{padding:'10px 14px', border:'1px solid var(--line)', borderRadius:10, fontFamily:'var(--sans)', fontSize:13, minWidth:280, outline:'none'}}/>
          <button onClick={() => setShowInvite(true)} className="btn glow" style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Invitar usuarios
          </button>
          <ExportMenu onUsers={exportUsersCSV} onSubmissions={exportSubmissionsCSV} onCohort={exportCohortReport}/>
        </div>
      </div>

      {showInvite && <InviteUsersModal onClose={() => setShowInvite(false)}/>}

      {/* KPIs admin */}
      <div className="dash-kpis" style={{marginBottom:28}}>
        {[
          { label:'Usuarios totales', value: totalUsers, color:'var(--bn-blue)' },
          { label:'Activos últimos 7d', value: totalActive7d, color:'var(--bn-lime)' },
          { label:'Administradores', value: totalAdmins, color:'var(--ink)' },
          { label:'Conversaciones BeonAI', value: totalChats, color:'var(--bn-purple)' },
          { label:'Módulos completados', value: totalCompletions, color:'var(--bn-orange)' },
        ].map((k, i) => (
          <div key={i} className="kpi-card" style={{'--kpi-color': k.color}}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla de usuarios + bulk actions */}
      <div className="dash-panel" style={{padding:0, overflow:'hidden', position:'relative'}}>
        <div className="dash-panel-head" style={{padding:'16px 22px'}}>
          <h3>Usuarios ({filtered.length})</h3>
          <span className="panel-sub">{selectedIds.length > 0 ? `${selectedIds.length} seleccionado${selectedIds.length === 1 ? '' : 's'}` : 'Selecciona varios usuarios para acciones en lote'}</span>
        </div>
        {selectedIds.length > 0 && (
          <div style={{padding:'12px 22px', background:'rgba(0,114,190,0.06)', borderBottom:'1px solid rgba(0,114,190,0.18)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
            <span style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--bn-blue-dark)', fontWeight:700, marginRight:8}}>
              {selectedIds.length} · acción en lote
            </span>
            <button onClick={() => {
              if (!confirm('¿Hacer admin a los ' + selectedIds.length + ' usuarios seleccionados?')) return;
              selectedIds.forEach(id => Auth.setAdmin(id, true));
              if (window.Toast) window.Toast.success(selectedIds.length + ' promovidos a admin');
              setSelectedIds([]);
            }} style={{padding:'5px 10px', border:'1px solid var(--bn-lime)', borderRadius:6, background:'rgba(188,214,48,0.12)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-lime-dark)', fontWeight:700, letterSpacing:'0.06em'}}>+ admin</button>
            <button onClick={() => {
              if (!confirm('¿Quitar admin a los ' + selectedIds.length + ' usuarios seleccionados?')) return;
              selectedIds.forEach(id => Auth.setAdmin(id, false));
              if (window.Toast) window.Toast.info(selectedIds.length + ' degradados');
              setSelectedIds([]);
            }} style={{padding:'5px 10px', border:'1px solid var(--line)', borderRadius:6, background:'var(--paper)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-3)', fontWeight:700, letterSpacing:'0.06em'}}>− admin</button>
            <button onClick={() => {
              const targets = users.filter(u => selectedIds.includes(u.id) && u.id !== Auth.currentUserId());
              if (targets.length === 0) { if (window.Toast) window.Toast.error('No puedes borrarte a ti mismo'); return; }
              if (!confirm('¿Borrar permanentemente ' + targets.length + ' usuarios y todos sus datos?')) return;
              targets.forEach(u => Auth.deleteUser(u.id));
              if (window.Toast) window.Toast.info(targets.length + ' usuarios eliminados');
              setSelectedIds([]);
            }} style={{padding:'5px 10px', border:'1px solid rgba(110,80,238,0.4)', borderRadius:6, background:'rgba(110,80,238,0.08)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--repsol-red)', fontWeight:700, letterSpacing:'0.06em'}}>× borrar</button>
            <span style={{marginLeft:'auto'}}>
              <button onClick={() => setSelectedIds([])} style={{padding:'5px 10px', border:'1px solid var(--line)', borderRadius:6, background:'transparent', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-3)', letterSpacing:'0.06em'}}>Limpiar</button>
            </span>
          </div>
        )}
        <div style={{overflowX:'auto'}}>
          <table className="user-table" style={{width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:32, paddingRight:4}}>
                  <input type="checkbox"
                    checked={filteredMetrics.length > 0 && filteredMetrics.every(u => selectedIds.includes(u.id))}
                    ref={el => { if (el) el.indeterminate = selectedIds.length > 0 && !filteredMetrics.every(u => selectedIds.includes(u.id)); }}
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(filteredMetrics.map(u => u.id));
                      else setSelectedIds([]);
                    }}
                    style={{cursor:'pointer', width:15, height:15, accentColor:'var(--bn-blue)'}}/>
                </th>
                <th>Usuario</th><th>Rol · Equipo</th><th>Progreso</th><th>Chats</th><th>Bookmarks</th><th>Última conexión</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map(u => (
                <tr key={u.id} style={selectedIds.includes(u.id) ? {background:'rgba(0,114,190,0.05)'} : {}}>
                  <td style={{paddingRight:4}}>
                    <input type="checkbox" checked={selectedIds.includes(u.id)}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) setSelectedIds(s => s.concat([u.id]));
                        else setSelectedIds(s => s.filter(x => x !== u.id));
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{cursor:'pointer', width:15, height:15, accentColor:'var(--bn-blue)'}}/>
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:30, height:30, borderRadius:'50%', background:u.avatarColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                        {u.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="u-name">{u.name} {u.isAdmin && <span style={{fontFamily:'var(--mono)', fontSize:8.5, padding:'1px 5px', background:'var(--ink)', color:'#fff', borderRadius:3, letterSpacing:'0.06em', marginLeft:4}}>ADMIN</span>}</div>
                        <div className="u-role">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{fontSize:12.5}}>{u.role}</div><div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)'}}>{u.team}</div></td>
                  <td>
                    <div className="prog-pill">
                      <div className="prog-bar-sm"><i style={{width: Math.min(100, (u._completed/(window.PILLS||[]).length || 1) * 100) + '%'}}/></div>
                      <span style={{fontFamily:'var(--mono)', fontSize:11}}>{u._completed} pills</span>
                    </div>
                  </td>
                  <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u._chats}</td>
                  <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u._bookmarks}</td>
                  <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{fmtRel(u.lastLoginAt)}</td>
                  <td>
                    <div style={{display:'flex', gap:6}}>
                      <button onClick={() => toggleAdmin(u)} title={u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                        style={{padding:'5px 10px', borderRadius:6, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer', fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em'}}>
                        {u.isAdmin ? '− admin' : '+ admin'}
                      </button>
                      <button onClick={() => removeUser(u)} title="Borrar usuario"
                        style={{padding:'5px 10px', borderRadius:6, border:'1px solid rgba(110,80,238,0.3)', background:'transparent', cursor:'pointer', fontSize:11, color:'var(--repsol-red)', fontFamily:'var(--mono)', letterSpacing:'0.06em'}}>
                        × borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMetrics.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center', padding:32, color:'var(--ink-4)', fontSize:13}}>Sin usuarios que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitaciones pendientes */}
      <PendingInvitationsBlock invitations={invitations}/>

      {/* Cola de revisión de entregas prácticas */}
      <AdminSubmissionsQueue/>

      {/* Activity feed · auditoría en tiempo real */}
      <ActivityFeed/>
    </div>
  );
}

function PendingInvitationsBlock({ invitations }) {
  const pending = (invitations || []).filter(i => i.status === 'pending');
  const accepted = (invitations || []).filter(i => i.status === 'accepted');
  if (!invitations || invitations.length === 0) return null;

  const fmtRel = (ts) => {
    if (!ts) return '—';
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    return Math.floor(d/86400) + ' d';
  };

  const copyInvite = (token) => {
    navigator.clipboard.writeText(window.Invitations.inviteUrl(token)).then(() => {
      if (window.Toast) window.Toast.success('Link copiado', { icon: '📋' });
    }).catch(() => {});
  };

  const sendEmail = async (inv) => {
    const me = window.Auth && window.Auth.currentUser();
    const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
    let _t = '';
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data } = await window.supabaseClient.auth.getSession();
        _t = (data && data.session && data.session.access_token) || '';
      }
    } catch (e) {}
    try {
      const r = await fetch('/api/send-invite', {
        method:'POST', headers:{'Content-Type':'application/json', ...(_t ? { Authorization: 'Bearer ' + _t } : {})},
        body: JSON.stringify({
          email: inv.email, name: inv.name, token: inv.token,
          role: inv.role, team: inv.team,
          fromName: me ? me.name : '',
          workspaceName: ws ? ws.name : '',
          workspaceColor: ws ? (ws.primaryColor || ws.primary_color) : null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (window.Toast) window.Toast.error(r.status === 503 ? 'Email no configurado' : (data.error || 'Error'));
      } else {
        if (window.Toast) window.Toast.success('Email enviado a ' + inv.email, { icon: '✉' });
      }
    } catch(e) { if (window.Toast) window.Toast.error('Error de red'); }
  };

  const remove = (token, email) => {
    if (!confirm('¿Borrar la invitación a ' + email + '?')) return;
    window.Invitations.remove(token);
    if (window.Toast) window.Toast.info('Invitación eliminada');
  };

  return (
    <div className="dash-panel" style={{padding:0, marginTop:24, overflow:'hidden'}}>
      <div className="dash-panel-head" style={{padding:'16px 22px'}}>
        <h3>Invitaciones · {pending.length} pendientes · {accepted.length} aceptadas</h3>
        <span className="panel-sub">Comparte el link con cada persona — al abrirlo crean cuenta con un click</span>
      </div>
      {pending.length === 0 ? (
        <div style={{padding:'28px 20px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>Sin invitaciones pendientes. Pulsa "Invitar usuarios" arriba para añadir más.</div>
      ) : (
        <div style={{padding:'8px 14px 16px'}}>
          {pending.map(inv => (
            <div key={inv.token} style={{display:'flex', gap:10, padding:'12px 14px', border:'1px solid var(--line)', borderRadius:10, background:'var(--paper)', marginBottom:6, alignItems:'center'}}>
              <div style={{width:30, height:30, borderRadius:'50%', background:'var(--bn-orange)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                {(inv.name || inv.email).split(/\s+|@|\./)[0][0].toUpperCase() + ((inv.name || inv.email).split(/\s+|@|\./)[1] || '')[0]?.toUpperCase()}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:2}}>
                  <span style={{fontSize:13, fontWeight:600}}>{inv.name || '—'}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>· {inv.email}</span>
                  <span style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:9, padding:'2px 8px', borderRadius:999, background:'var(--bn-orange)', color:'#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>Pendiente</span>
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)'}}>{inv.role} · {inv.team} · creada {fmtRel(inv.createdAt)}</div>
              </div>
              <button onClick={() => sendEmail(inv)} title="Enviar email"
                style={{padding:'6px 10px', border:'1px solid var(--bn-lime)', borderRadius:6, background:'rgba(188,214,48,0.12)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-lime-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                ✉ Email
              </button>
              <button onClick={() => copyInvite(inv.token)} title="Copiar link"
                style={{padding:'6px 10px', border:'1px solid var(--bn-blue)', borderRadius:6, background:'rgba(0,114,190,0.06)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-blue-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                Link
              </button>
              <button onClick={() => remove(inv.token, inv.email)} title="Borrar invitación"
                style={{padding:'6px 10px', border:'1px solid rgba(110,80,238,0.3)', borderRadius:6, background:'transparent', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--repsol-red)', fontWeight:700, letterSpacing:'0.06em'}}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSubmissionsQueue() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [subs, setSubs] = useSM(Submissions.listAll());
  const [filter, setFilter] = useSM('pending'); // 'pending' | 'all' | 'approved' | 'rejected'
  const [reviewing, setReviewing] = useSM(null);
  const [feedback, setFeedback] = useSM('');

  useEM(() => {
    const refresh = () => setSubs(Submissions.listAll());
    window.addEventListener('submissions-changed', refresh);
    return () => window.removeEventListener('submissions-changed', refresh);
  }, []);

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);
  const counts = {
    pending: subs.filter(s => s.status === 'pending').length,
    approved: subs.filter(s => s.status === 'approved').length,
    rejected: subs.filter(s => s.status === 'rejected').length,
    all: subs.length,
  };

  const review = (status) => {
    if (!reviewing) return;
    Submissions.review(reviewing.id, status, feedback || null);
    if (window.Activity) window.Activity.log('review_submission', { pillTitle: reviewing.pillTitle, status, targetUser: reviewing.userName, email: reviewing.userEmail });
    if (window.Toast) window.Toast.success('Entrega ' + (status === 'approved' ? 'aprobada' : 'rechazada'));
    setReviewing(null);
    setFeedback('');
  };

  const fmtDur = (s) => Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0');
  const fmtSize = (b) => b < 1024*1024 ? (b/1024).toFixed(0) + ' KB' : (b/1024/1024).toFixed(1) + ' MB';

  return (
    <div className="dash-panel" style={{padding:0, marginTop:24, overflow:'hidden'}}>
      <div className="dash-panel-head" style={{padding:'16px 22px'}}>
        <h3>Entregas prácticas · revisión</h3>
        <span className="panel-sub">Vídeos enviados por los usuarios — revisa y da feedback</span>
      </div>
      <div style={{padding:'12px 22px', borderBottom:'1px solid var(--line-2)', display:'flex', gap:6, flexWrap:'wrap'}}>
        {[
          { id:'pending', label:'Pendientes', count: counts.pending, color:'var(--bn-orange)' },
          { id:'approved', label:'Aprobadas', count: counts.approved, color:'var(--bn-lime)' },
          { id:'rejected', label:'Rechazadas', count: counts.rejected, color:'var(--repsol-red)' },
          { id:'all', label:'Todas', count: counts.all, color:'var(--ink-3)' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{padding:'6px 12px', borderRadius:8, border:'1px solid ' + (filter === f.id ? f.color : 'var(--line)'), background: filter === f.id ? f.color : 'var(--paper)', color: filter === f.id ? (f.id === 'approved' ? 'var(--ink)' : '#fff') : 'var(--ink-3)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700}}>
            {f.label} {f.count > 0 && <span style={{marginLeft:4, opacity:0.85}}>· {f.count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>
          {filter === 'pending' ? 'Sin entregas pendientes de revisión.' : 'Sin entregas en este estado.'}
        </div>
      ) : (
        <div style={{padding:'8px 14px 16px'}}>
          {filtered.map(s => {
            const statusColor = { pending:'var(--bn-orange)', approved:'var(--bn-lime)', rejected:'var(--repsol-red)' }[s.status];
            return (
              <div key={s.id} style={{display:'flex', gap:12, padding:'14px', border:'1px solid var(--line)', borderRadius:10, background:'var(--paper)', marginBottom:8, alignItems:'flex-start'}}>
                {s.thumbDataUrl && <img src={s.thumbDataUrl} style={{width:120, borderRadius:6, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <div style={{width:24, height:24, borderRadius:'50%', background:s.userAvatarColor || 'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0}}>
                      {(s.userName || '?').split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <span style={{fontSize:12.5, fontWeight:600}}>{s.userName}</span>
                    <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>· {s.userEmail}</span>
                    <span style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:9.5, padding:'2px 8px', borderRadius:999, background: statusColor, color: s.status === 'approved' ? 'var(--ink)' : '#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:13.5, fontWeight:600, marginBottom:3, color:'var(--ink)'}}>{s.pillTitle}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{s.fileName} · {fmtDur(s.durationSec)} · {fmtSize(s.fileSize)} · enviado {new Date(s.submittedAt).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'})}</div>
                  {s.feedback && (
                    <div style={{marginTop:8, padding:'7px 10px', background:'var(--paper-2)', borderLeft:'3px solid ' + statusColor, borderRadius:'0 6px 6px 0', fontSize:12, color:'var(--ink-3)'}}>
                      <strong style={{color:'var(--ink-4)', fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase'}}>Feedback</strong> · {s.feedback}
                    </div>
                  )}
                  {s.status === 'pending' && (
                    <div style={{display:'flex', gap:6, marginTop:10}}>
                      <button className="btn ghost" style={{padding:'6px 12px', fontSize:12}} onClick={() => { setReviewing(s); setFeedback(''); }}>Revisar →</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de revisión */}
      {reviewing && (
        <div onClick={() => setReviewing(null)} style={{position:'fixed', inset:0, background:'rgba(11,18,38,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
          <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(540px, 96vw)', padding:28}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:6}}>Revisar entrega</div>
            <h2 style={{margin:'0 0 4px', fontSize:18}}>{reviewing.pillTitle}</h2>
            <div style={{fontSize:12.5, color:'var(--ink-3)', marginBottom:16}}>de <strong>{reviewing.userName}</strong> · {reviewing.userEmail}</div>
            {reviewing.thumbDataUrl && <img src={reviewing.thumbDataUrl} style={{width:'100%', maxHeight:240, objectFit:'cover', borderRadius:8, marginBottom:14, border:'1px solid var(--line)'}} alt=""/>}
            <label style={{display:'block', marginBottom:14}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:5}}>Feedback (opcional)</div>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comenta la entrega · qué hizo bien, qué mejorar…" rows="4"
                style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box'}}/>
            </label>
            <div style={{display:'flex', gap:8, justifyContent:'space-between'}}>
              <button className="btn ghost" onClick={() => setReviewing(null)}>{T('common.cancel')}</button>
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => review('rejected')} style={{padding:'8px 14px', borderRadius:8, border:'1px solid rgba(110,80,238,0.3)', background:'rgba(110,80,238,0.06)', color:'var(--repsol-red)', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600}}>Rechazar</button>
                <button onClick={() => review('approved')} className="btn glow" style={{background:'var(--bn-lime)', color:'var(--ink)'}}>Aprobar ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inbox view · 3 pestañas ────────────────────────────────────────────────

// ── Examen final de ruta · modal con 3 preguntas + cert al pasar ──────────
function RouteExamModal({ routeId, routeLabel, onClose, onPassed }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const bank = RouteExams.bank(routeId);
  const [answers, setAnswers] = useSM({}); // {qIdx: optionIdx}
  const [submitted, setSubmitted] = useSM(false);
  const [result, setResult] = useSM(null); // { score, total, passed }

  if (!bank) {
    return (
      <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,18,38,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, padding:32, maxWidth:420}}>
          <h2 style={{margin:'0 0 12px'}}>Examen no disponible</h2>
          <p style={{color:'var(--ink-3)', marginBottom:18}}>Esta ruta aún no tiene examen final configurado.</p>
          <button className="btn ghost" onClick={onClose}>{T('common.close')}</button>
        </div>
      </div>
    );
  }

  const submit = () => {
    let score = 0;
    bank.questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });
    const total = bank.questions.length;
    const passed = score === total;
    setResult({ score, total, passed });
    setSubmitted(true);
    RouteExams.record(routeId, score, total, passed);
    if (passed) {
      if (window.Activity) window.Activity.log('pass_exam', { routeId, routeLabel, score, total });
      if (window.Toast) window.Toast.success('¡Aprobado! Generando certificado…', { icon: '🎉' });
      if (window.Inbox) {
        window.Inbox.addNotification('Has superado el examen final de la ruta "' + (routeLabel || routeId) + '"', { kind:'achievement', icon:'🏆' });
      }
      if (onPassed) onPassed({ score, total });
    } else {
      if (window.Toast) window.Toast.error('Has fallado · ' + score + '/' + total + ' correctas. Repasa y vuelve a intentarlo.');
    }
  };

  const downloadCert = () => {
    var u = (window.Auth && window.Auth.currentUser()) || { name: 'Alumno', role: '', team: (window.WORKSPACE_NAME || '') };
    const today = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>Certificado · ' + u.name + '</title>' +
'<style>@page{size:A4 landscape;margin:0}body{font-family:Inter,-apple-system,system-ui,sans-serif;margin:0;padding:60px;min-height:100vh;box-sizing:border-box;background:linear-gradient(135deg,#fafbfc 0%,#f0f4f8 100%);display:flex;flex-direction:column}.frame{border:6px double #005996;padding:50px 60px;flex:1;display:flex;flex-direction:column;background:#fff}.kicker{font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#99A5BD;margin-bottom:8px}h1{font-size:38px;margin:0 0 20px;color:#0B1220}.lead{font-size:14px;color:#45506A;max-width:560px;margin:0 0 28px;line-height:1.55}.name{font-style:italic;font-weight:700;font-size:58px;color:#005996;margin:0 0 8px;letter-spacing:-.025em}.role{font-size:16px;color:#0B1220;margin-bottom:28px}.cert-line{height:2px;background:linear-gradient(90deg,#005996,#BCD630,#8A3992,#005996);margin:24px 0}.foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;font-size:11px;color:#45506A}.sig{font-style:italic;font-size:18px;color:#0B1220;border-top:1px solid #ccc;padding-top:6px;margin-top:18px}</style></head><body>' +
'<div class="frame"><div class="kicker">SolidStream · ' + (window.WORKSPACE_NAME || 'Plataforma') + ' · Certificación oficial</div>' +
'<h1>Certificado de ruta · ' + (routeLabel || routeId) + '</h1>' +
'<div class="lead">Por la presente certificamos que la persona reseñada ha completado y aprobado el examen final de esta ruta dentro de la formación oficial del programa.</div>' +
'<div class="name">' + u.name + '</div>' +
'<div class="role">' + u.role + ' · ' + u.team + '</div>' +
'<div class="cert-line"></div>' +
'<div class="foot"><div><strong>Fecha</strong><br/>' + today + '</div><div><strong>Resultado</strong><br/>Aprobado · ' + (result ? result.score + '/' + result.total : '?') + '</div><div><div class="sig">BeonIt · ' + (window.WORKSPACE_NAME || 'tu workspace') + '</div><div style="font-family:monospace;font-size:9px;color:#99A5BD;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">Equipo de formación</div></div></div></div></body></html>';
    const blob = new Blob([html], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Certificado-' + (routeId || 'ruta') + '-' + (u.name || '').replace(/\s+/g,'-') + '.html';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  };

  const allAnswered = bank.questions.every((_, i) => answers[i] !== undefined);

  return (
    <div onClick={!submitted ? onClose : null} style={{position:'fixed', inset:0, background:'rgba(11,18,38,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(620px, 96vw)', maxHeight:'90vh', overflowY:'auto', padding:32, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--bn-blue)', fontWeight:700}}>EXAMEN FINAL</span>
          {submitted && result && (
            <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'3px 10px', borderRadius:999, background: result.passed ? 'var(--bn-lime)' : 'rgba(110,80,238,0.12)', color: result.passed ? 'var(--ink)' : 'var(--repsol-red)', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>
              {result.passed ? '✓ Aprobado' : '✗ No aprobado'}
            </span>
          )}
        </div>
        <h2 style={{margin:'0 0 16px', fontSize:22, fontFamily:'var(--sans)', letterSpacing:'-0.01em'}}>{bank.title}</h2>
        {!submitted && <p style={{fontSize:13.5, color:'var(--ink-3)', marginBottom:20}}>Responde las 3 preguntas. Necesitas <strong>todas correctas</strong> para superar el examen y descargar tu certificado oficial.</p>}

        {bank.questions.map((q, qi) => {
          const userAns = answers[qi];
          const isCorrect = submitted && userAns === q.answer;
          return (
            <div key={qi} style={{marginBottom:20, padding:'16px 18px', border:'1px solid var(--line)', borderRadius:12, background: submitted ? (isCorrect ? 'rgba(188,214,48,0.08)' : 'rgba(110,80,238,0.06)') : 'var(--paper-2)'}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:12}}>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', fontWeight:700, marginTop:3}}>P{qi + 1}</span>
                <div style={{flex:1, fontSize:14, fontWeight:600, color:'var(--ink)', lineHeight:1.4}}>{q.q}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {q.options.map((opt, oi) => {
                  const isUserChoice = userAns === oi;
                  const showCorrect = submitted && oi === q.answer;
                  const showWrong = submitted && isUserChoice && oi !== q.answer;
                  return (
                    <button key={oi} disabled={submitted} onClick={() => setAnswers(a => ({...a, [qi]: oi}))}
                      style={{display:'flex', alignItems:'center', gap:10, padding:'9px 12px', border:'1px solid ' + (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : isUserChoice ? 'var(--bn-blue)' : 'var(--line)'), borderRadius:8, background: showCorrect ? 'rgba(188,214,48,0.15)' : showWrong ? 'rgba(110,80,238,0.08)' : isUserChoice ? 'rgba(0,114,190,0.06)' : 'var(--paper)', cursor: submitted ? 'default' : 'pointer', textAlign:'left', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)'}}>
                      <span style={{width:18, height:18, borderRadius:'50%', border:'2px solid ' + (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : isUserChoice ? 'var(--bn-blue)' : 'var(--line)'), background: (isUserChoice || showCorrect) ? (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : 'var(--bn-blue)') : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700}}>
                        {showCorrect ? '✓' : showWrong ? '✗' : isUserChoice ? '●' : ''}
                      </span>
                      <span style={{flex:1}}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!submitted ? (
          <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
            <button className="btn ghost" onClick={onClose}>{T('common.cancel')}</button>
            <button className="btn glow" onClick={submit} disabled={!allAnswered} style={{opacity: allAnswered ? 1 : 0.5}}>Enviar respuestas →</button>
          </div>
        ) : (
          <div style={{marginTop:18, padding:'18px 20px', background: result.passed ? 'rgba(188,214,48,0.1)' : 'var(--paper-2)', borderRadius:12, border:'1px solid ' + (result.passed ? 'var(--bn-lime)' : 'var(--line)')}}>
            <div style={{fontSize:14, fontWeight:600, marginBottom:6, color:'var(--ink)'}}>
              {result.passed ? '🎉 Has aprobado con ' + result.score + '/' + result.total : 'Has obtenido ' + result.score + '/' + result.total + ' · necesitas las 3 correctas para aprobar'}
            </div>
            <div style={{fontSize:12.5, color:'var(--ink-3)', marginBottom:14, lineHeight:1.5}}>
              {result.passed ? 'Tu certificado oficial está listo para descargar.' : 'Repasa el material y vuelve a intentarlo cuando quieras.'}
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              {!result.passed && <button className="btn ghost" onClick={() => { setAnswers({}); setSubmitted(false); setResult(null); }}>Reintentar</button>}
              <button className="btn ghost" onClick={onClose}>{T('common.close')}</button>
              {result.passed && <button className="btn glow" onClick={downloadCert}>↓ Descargar certificado</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.RouteExamModal = RouteExamModal;

// ── Video submission · entrega de examen práctico por módulo ───────────────
function VideoSubmissionForm({ pillId, pillTitle, onClose }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [file, setFile] = useSM(null);
  const [duration, setDuration] = useSM(0);
  const [thumb, setThumb] = useSM(null);
  const [error, setError] = useSM('');
  const [submitting, setSubmitting] = useSM(false);
  const [existing, setExisting] = useSM(null);

  useEM(() => {
    var u = window.Auth && window.Auth.currentUser();
    if (u && window.Submissions) {
      setExisting(window.Submissions.getForUserAndPill(u.id, pillId));
    }
    const refresh = () => {
      var u2 = window.Auth && window.Auth.currentUser();
      if (u2) setExisting(window.Submissions.getForUserAndPill(u2.id, pillId));
    };
    window.addEventListener('submissions-changed', refresh);
    return () => window.removeEventListener('submissions-changed', refresh);
  }, [pillId]);

  const onPick = (e) => {
    setError('');
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('El archivo debe ser un vídeo (.mp4, .mov, .webm…)'); return; }
    if (f.size > 200 * 1024 * 1024) { setError('Vídeo demasiado grande · máximo 200MB'); return; }

    setFile(f);

    // Extraer duración + thumbnail del primer frame
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.src = URL.createObjectURL(f);
    v.onloadedmetadata = () => {
      const sec = Math.round(v.duration);
      setDuration(sec);
      if (sec > 600) {
        setError('Vídeo demasiado largo · ' + Math.floor(sec/60) + ':' + (sec%60).toString().padStart(2,'0') + ' · máximo 10:00');
      }
      v.currentTime = Math.min(2, sec / 4);
    };
    v.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = (240 / v.videoWidth) * v.videoHeight || 135;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        setThumb(canvas.toDataURL('image/jpeg', 0.7));
      } catch(e) {}
      URL.revokeObjectURL(v.src);
    };
  };

  const submit = async () => {
    if (!file || error) return;
    setSubmitting(true);
    try {
      const sub = await Promise.resolve(Submissions.submit({
        pillId, pillTitle,
        file,
        fileName: file.name,
        fileSize: file.size,
        durationSec: duration,
        thumbDataUrl: thumb,
      }));
      setExisting(sub);
      if (window.Activity) window.Activity.log('submit_video', { pillId, pillTitle, durationSec: duration, fileSize: file.size });
      if (window.Toast) window.Toast.success('Entrega enviada · pendiente de revisión por admin', { icon: '↑' });
      if (onClose) setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const fmtSize = (b) => b < 1024*1024 ? (b/1024).toFixed(0) + ' KB' : (b/1024/1024).toFixed(1) + ' MB';
  const fmtDur = (s) => Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0');

  if (existing) {
    const statusColor = { pending:'var(--bn-orange)', approved:'var(--bn-lime)', rejected:'var(--repsol-red)' }[existing.status];
    const statusLabel = { pending:'Pendiente de revisión', approved:'Aprobado', rejected:'Rechazado' }[existing.status];
    return (
      <div style={{padding:'18px 20px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)'}}>Entrega práctica</span>
          <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'3px 10px', borderRadius:999, background: statusColor, color: existing.status === 'approved' ? 'var(--ink)' : '#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>{statusLabel}</span>
        </div>
        <div style={{display:'flex', gap:14, alignItems:'flex-start'}}>
          {existing.thumbDataUrl && <img src={existing.thumbDataUrl} style={{width:120, borderRadius:8, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{existing.fileName}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{fmtDur(existing.durationSec)} · {fmtSize(existing.fileSize)}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)', marginTop:6}}>Enviado: {new Date(existing.submittedAt).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'})}</div>
            {existing.feedback && (
              <div style={{marginTop:10, padding:'8px 10px', background: existing.status === 'approved' ? 'rgba(188,214,48,0.1)' : 'rgba(110,80,238,0.06)', borderLeft:'3px solid ' + statusColor, borderRadius:'0 6px 6px 0', fontSize:12.5, color:'var(--ink-2)', lineHeight:1.5}}>
                <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:3}}>Feedback {existing.reviewedBy ? '· ' + existing.reviewedBy.name : ''}</div>
                {existing.feedback}
              </div>
            )}
          </div>
        </div>
        {existing.status !== 'pending' && (
          <button className="btn ghost" style={{marginTop:14}} onClick={() => { Submissions.remove(existing.id); setExisting(null); setFile(null); setThumb(null); setDuration(0); }}>↺ Reenviar entrega</button>
        )}
      </div>
    );
  }

  return (
    <div style={{padding:'18px 20px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
        <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-purple)', fontWeight:700}}>Examen práctico · entrega obligatoria</span>
      </div>
      <div style={{fontSize:13.5, color:'var(--ink-2)', marginBottom:14, lineHeight:1.55}}>
        Para superar este módulo, sube un vídeo donde demuestres haber realizado <strong>algo real en Sprinklr</strong> aplicando lo aprendido. Los admins lo revisarán y darán feedback.
      </div>
      <div style={{fontSize:12, color:'var(--ink-4)', marginBottom:14, fontFamily:'var(--mono)'}}>
        Requisitos · Vídeo de máximo <strong>10:00</strong> · MP4/MOV/WEBM · 200 MB max
      </div>

      <label style={{display:'block', padding:'24px', border:'2px dashed var(--line)', borderRadius:10, background:'var(--paper)', cursor:'pointer', textAlign:'center', transition:'border-color .14s'}}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--bn-blue)'} onMouseLeave={e => e.currentTarget.style.borderColor='var(--line)'}>
        <div style={{fontSize:24, marginBottom:6, opacity:0.5}}>📹</div>
        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:3}}>{file ? 'Cambiar vídeo' : 'Selecciona o arrastra tu vídeo'}</div>
        <div style={{fontSize:11, color:'var(--ink-4)'}}>Click para abrir el explorador</div>
        <input type="file" accept="video/*" onChange={onPick} style={{display:'none'}}/>
      </label>

      {file && (
        <div style={{marginTop:14, display:'flex', gap:12, alignItems:'flex-start', padding:'10px 12px', background:'var(--paper)', borderRadius:8, border:'1px solid var(--line)'}}>
          {thumb && <img src={thumb} style={{width:90, borderRadius:6, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{file.name}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color: error ? 'var(--repsol-red)' : 'var(--ink-4)', marginTop:3}}>{duration > 0 ? fmtDur(duration) : 'analizando…'} · {fmtSize(file.size)}</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{marginTop:12, padding:'9px 12px', background:'rgba(110,80,238,0.08)', border:'1px solid rgba(110,80,238,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5}}>{error}</div>
      )}

      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:14}}>
        {onClose && <button className="btn ghost" onClick={onClose}>{T('common.cancel')}</button>}
        <button className="btn glow" onClick={submit} disabled={!file || !!error || submitting} style={{opacity: !file || error || submitting ? 0.5 : 1}}>
          {submitting ? 'Enviando…' : 'Enviar entrega →'}
        </button>
      </div>
    </div>
  );
}
window.VideoSubmissionForm = VideoSubmissionForm;

window.LoginScreen = LoginScreen;
window.AdminPanel = AdminPanel;

// ErrorBoundary de nivel superior · si cualquier componente lanza en render,
// mostramos un fallback con botón de recargar en vez de pantalla en blanco
// (la app no tenía ninguno · un solo throw la dejaba muerta).
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { try { console.error('[SolidStream] render error', error, info); } catch (e) {} }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'var(--bg-canvas, #1F1F1F)', color:'var(--fg, #F2F2F1)', fontFamily:'Inter, sans-serif', textAlign:'center' }}>
          <div style={{ maxWidth:440 }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🛠️</div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 8px' }}>Algo se rompió al pintar esta vista</h1>
            <p style={{ fontSize:14, color:'var(--fg-muted, #B9B9B7)', lineHeight:1.55, margin:'0 0 22px' }}>
              No te preocupes, tus datos están a salvo. Recarga para volver. Si pasa de nuevo, avísanos con lo que estabas haciendo.
            </p>
            <button onClick={() => { try { window.location.reload(); } catch (e) {} }} style={{
              padding:'12px 22px', background:'var(--accent, #EC1C24)', color:'#fff', border:'none',
              borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14,
            }}>Recargar la plataforma</button>
            <div style={{ marginTop:18, fontFamily:'monospace', fontSize:11, color:'var(--fg-dim, #9C9C9A)', wordBreak:'break-word' }}>
              {String((this.state.error && this.state.error.message) || this.state.error).slice(0, 200)}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
window.PrototypeApp = function PrototypeApp(props) {
  return <AppErrorBoundary><App {...props}/></AppErrorBoundary>;
};
