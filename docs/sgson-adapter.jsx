/* ============================================================
   SolidStream · Redesign adapter
   Convierte la data EXISTENTE (PILLS, LEARNING_PATHS, USER profile)
   al formato que espera el rediseño (window.SGS_DATA).
   Se ejecuta después de que prototype-home.jsx haya expuesto window.PILLS.
   ============================================================ */

(function buildSGSData() {
  // Esperar a que prototype-home.jsx haya cargado window.PILLS
  // Si todavía no está, lo intentamos en cuanto haya un evento o tras un tick.
  function setup() {
    if (typeof window === 'undefined' || !window.PILLS) {
      // re-intentar al siguiente tick
      return setTimeout(setup, 50);
    }
    // sgson-adapter.jsx se carga ANTES de prototype-main.jsx (que define
    // window.Auth / window.UserProfile). Si aún no están listos, esperamos:
    // construir SGS_DATA aquí dejaría USER = "Usuario SGS" (el fallback final)
    // y los components que leen D.USER (TopNav, AdminView_New, MyPath…) verían
    // datos vacíos hasta que algo dispare auth-changed (cosa que no ocurre en
    // el restore de sesión inicial). Re-intentamos hasta tener Auth.
    if (!window.Auth || !window.UserProfile) {
      return setTimeout(setup, 50);
    }

    // ── Mapeo categoría tu data → tone visual del rediseño (5 paletas) ──
    // Conservamos las 11 categorías reales en el LABEL, solo el COLOR
    // de la cubierta se agrupa en una de las 5 tonalidades del rediseño.
    const CAT_TO_TONE = {
      'Fundamentos':    'manage',     // amarillo dorado
      'Estructura':     'manage',
      'Gobernanza':     'manage',
      'Social Publish': 'publish',    // naranja
      'Activos':        'content',    // púrpura
      'Aprobaciones':   'content',
      'Compliance':     'manage',
      'Calendario':     'publish',
      'Analytics':      'analytics',  // azul
      'Care':           'care',       // teal
      'Integraciones':  'analytics',
    };

    // CATS · expuesto al rediseño · 11 entradas, una por categoría real
    const CATS = {};
    Object.keys(CAT_TO_TONE).forEach(label => {
      const slug = label.toLowerCase().replace(/\s+/g, '-');
      CATS[slug] = { label, tone: 'cat-' + CAT_TO_TONE[label], cover: 'cover-' + CAT_TO_TONE[label] };
    });
    // Alias también con el label original sin slug (por si algún componente accede directo)
    Object.keys(CAT_TO_TONE).forEach(label => {
      CATS[label] = { label, tone: 'cat-' + CAT_TO_TONE[label], cover: 'cover-' + CAT_TO_TONE[label] };
    });

    // ── Helper · convierte un pill de tu data al shape del rediseño ──
    const mapPill = (p) => ({
      ...p,
      pill:     String(p.pill != null ? p.pill : 0).padStart(2, '0'),
      one:      p.one || p.title,
      teacher:  p.teacher || 'BeonIt × Repsol',
      duration: p.duration || '4 min',
      category: p.category, // mantenemos el label real (Care, Social Publish, etc.)
      level:    p.level === 'principiante' ? 'Básico' :
                p.level === 'intermedio'   ? 'Intermedio' :
                p.level === 'avanzado'     ? 'Avanzado' :
                (p.level || 'Básico'),
      rating:   p.rating || 4.7,
      enrolled: p.enrolled || 0,
      progress: typeof p.progress === 'number' && p.progress > 1 ? p.progress / 100 : (p.progress || 0),
      yt:       p.yt,
      featured: p.featured,
      newBadge: p.newBadge,
    });

    const PILLS = (window.PILLS || []).map(mapPill);
    const pillById = (id) => PILLS.find(p => p.id === id);

    // ── ROWS · estructura de filas Home del rediseño ──
    const inProgress      = PILLS.filter(p => p.progress > 0 && p.progress < 1).map(p => p.id).slice(0, 8);
    const withVideo       = PILLS.filter(p => p.yt || p.mp4).map(p => p.id).slice(0, 10);
    const trending        = PILLS.slice().sort((a,b) => (b.enrolled||0) - (a.enrolled||0)).map(p => p.id).slice(0, 10);
    const careIds         = PILLS.filter(p => p.category === 'Care' || p.category === 'Aprobaciones').map(p => p.id).slice(0, 10);
    const analyticsIds    = PILLS.filter(p => p.category === 'Analytics' || p.category === 'Integraciones').map(p => p.id).slice(0, 10);
    const newIds          = PILLS.slice(-12).reverse().map(p => p.id);

    const ROWS = [];
    if (inProgress.length > 0) {
      // Nombre del user actual · fallback genérico si no hay sesión
      const userProf = window.UserProfile ? window.UserProfile.get() : null;
      const firstName = (userProf && userProf.name && userProf.name !== 'Sin sesión')
        ? String(userProf.name).split(/\s+/)[0]
        : (window.I18n ? window.I18n.t('home.continue.fallback', 'tú') : 'tú');
      const T = window.I18n ? window.I18n.t.bind(window.I18n) : (k, f) => f;
      ROWS.push({
        key: 'continue',
        title: T('home.continue.title','Continúa, {name}').replace('{name}', firstName),
        sub:   T('home.continue.sub','donde lo dejaste'),
        pillIds: inProgress, showProgress: true,
      });
    }
    if (withVideo.length > 0) {
      ROWS.push({ key:'available', title:'Disponibles ahora', sub:'reproducir directamente', pillIds: withVideo });
    }
    ROWS.push({ key:'paths', title:'Rutas recomendadas para ti', sub:'según tu rol', isPaths: true });
    ROWS.push({ key:'trending', title:'Tendencia esta semana', sub:'en Repsol', pillIds: trending, trending: true });
    if (careIds.length > 0) {
      ROWS.push({ key:'care', title:'Care', sub:'atención al cliente que de verdad funciona', pillIds: careIds });
    }
    if (analyticsIds.length > 0) {
      ROWS.push({ key:'analytics', title:'Analytics & Integraciones', sub:'medir, integrar, mejorar', pillIds: analyticsIds });
    }
    ROWS.push({ key:'new', title:'Nuevo en SolidStream', sub:'recién publicado en BeonIt × Repsol', pillIds: newIds, newRow: true });

    // ── LEARNING_PATHS · convertir tu data al shape esperado ──
    const SRC_PATHS = window.LEARNING_PATHS || [];
    const TONE_BY_LABEL = {
      'Fundamentals': 'cat-analytics',
      'Managers': 'cat-content',
      'Publish Agent': 'cat-publish',
      'Care Agent': 'cat-care',
      'Reporting Agent': 'cat-analytics',
      'Analyst': 'cat-manage',
    };
    const LEARNING_PATHS = SRC_PATHS.map(p => ({
      id:      p.id,
      title:   p.label || p.title || 'Ruta',
      label:   p.label || p.title || 'Ruta',
      desc:    p.desc || p.roleTag || '',
      badge:   p.badge || '',
      // `pills` queda como CUENTA por compatibilidad con cards (Rutas).
      // `pillIds` guarda el array original para componentes que necesiten filtrar pills (MyPath).
      pills:   (p.pills && p.pills.length) || p.totalPills || 0,
      pillIds: Array.isArray(p.pills) ? p.pills.slice() : [],
      hours:   p.duration || (p.pills ? (p.pills.length * 5) + ' min' : '—'),
      accent:  TONE_BY_LABEL[p.label] || 'cat-publish',
    }));

    // ── USER · del Auth/UserProfile actual ──
    // Triple fallback · UserProfile → Auth.currentUser directo → datos del SGS_DATA viejo
    const profile = (window.UserProfile && window.UserProfile.get()) || null;
    const sessionUser = (window.Auth && window.Auth.currentUser && window.Auth.currentUser()) || null;
    function _firstNameOrEmail(p, fallback) {
      if (!p) return fallback;
      if (p.name && p.name !== 'Sin sesión') return p.name;
      // Si el name es default, usa la parte local del email capitalizada
      if (p.email) {
        const local = String(p.email).split('@')[0];
        return local.charAt(0).toUpperCase() + local.slice(1);
      }
      return fallback;
    }
    const fullName = _firstNameOrEmail(profile, _firstNameOrEmail(sessionUser, 'Usuario SGS'));
    const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
    const USER = {
      id:       (profile && profile.id) || (sessionUser && sessionUser.id),
      name:     fullName,
      initials: initials,
      role:     (profile && profile.role) || (sessionUser && sessionUser.role) || 'Publish Agent',
      team:     (profile && profile.team) || (sessionUser && sessionUser.team) || 'Repsol',
      email:    (profile && profile.email) || (sessionUser && sessionUser.email),
      market:   'IB · España',
      isAdmin:  !!((profile && profile.isAdmin) || (sessionUser && (sessionUser.isAdmin || sessionUser.systemRole === 'admin'))),
      systemRole: (sessionUser && sessionUser.systemRole) || (profile && profile.systemRole) || 'user',
    };

    // ── SIDEBAR_LINKS · usa los items de tu sidebar actual ──
    const SIDEBAR_LINKS = [
      { key:'home',      label:'Inicio',     icon:'home' },
      { key:'inbox',     label:'Bandeja',    icon:'inbox', count: (window.Inbox && window.Inbox.unreadCount()) || null },
      { key:'browse',    label:'Catálogo',   icon:'grid' },
      { key:'path',      label:'Mi ruta',    icon:'route' },
      { key:'rutas',     label:'Rutas',      icon:'compass' },
      { key:'dashboard', label:'Analytics',  icon:'chart' },
      { key:'coach',     label:'BeonAI',  icon:'spark' },
      { key:'wa',        label:'Channels',   icon:'broadcast' },
      { key:'saved',     label:'Guardado',   icon:'bookmark' },
      { key:'profile',   label:'Mi perfil',  icon:'user' },
      { key:'settings',  label:'Ajustes',    icon:'gear' },
      { key:'admin',     label:'Admin',      icon:'shield', admin: true },
    ];

    window.SGS_DATA = { CATS, PILLS, LEARNING_PATHS, ROWS, USER, SIDEBAR_LINKS, pillById };
    window.dispatchEvent(new Event('sgs-data-ready'));
  }

  setup();

  // Re-construir cuando cambia el perfil del usuario (login/logout), el
  // workspace activo, o el catálogo de pills (carga desde DB en Supabase mode).
  // El badge de bandeja se mantiene en TopNav directamente (suscribe a
  // `inbox-changed`), así que no es necesario reconstruir SGS_DATA en cada
  // notificación leída.
  window.addEventListener('user-profile-changed', setup);
  window.addEventListener('auth-changed', setup);
  window.addEventListener('pills-changed', setup);
  window.addEventListener('workspace-changed', setup);
})();
