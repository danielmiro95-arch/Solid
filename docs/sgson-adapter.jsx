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
    // En demo · el fallback de teacher pasa a "BeonIt × Hijos de Rivera"
    // para no leak el branding de Repsol en cards sin teacher explícito.
    const _dmMap = window.DemoMode;
    const _dmMapActive = _dmMap && _dmMap.isActive && _dmMap.isActive();
    const _teacherFallback = _dmMapActive ? 'BeonIt × Hijos de Rivera' : 'BeonIt × Repsol';
    const mapPill = (p) => ({
      ...p,
      pill:     String(p.pill != null ? p.pill : 0).padStart(2, '0'),
      one:      p.one || p.title,
      teacher:  p.teacher || _teacherFallback,
      duration: p.duration || '4 min',
      category: p.category, // mantenemos el label real (Care, Social Publish, etc.)
      level:    p.level === 'principiante' ? 'Básico' :
                p.level === 'intermedio'   ? 'Intermedio' :
                p.level === 'avanzado'     ? 'Avanzado' :
                (p.level || 'Básico'),
      rating:   p.rating || 4.7,
      enrolled: p.enrolled || 0,
      // Progress · primero busca el del user en window.Progress (Supabase
       // real). Si no hay registro, cae al hardcoded de la pill (legacy).
       progress: (() => {
         const real = window.Progress && window.Progress.get && window.Progress.get(p.id);
         if (real) return real.progress || 0;
         return typeof p.progress === 'number' && p.progress > 1 ? p.progress / 100 : (p.progress || 0);
       })(),
       completed: !!(window.Progress && window.Progress.isCompleted && window.Progress.isCompleted(p.id)),
      yt:       p.yt,
      featured: p.featured,
      newBadge: p.newBadge,
    });

    const PILLS = (window.PILLS || []).map(mapPill);
    const pillById = (id) => PILLS.find(p => p.id === id);

    // ── DemoMode · DETECCIÓN BRUTA POR URL ──
    // Sin race conditions, sin helpers, sin esperar a window.DemoMode.
    // Si la URL contiene "demo" en cualquier sitio (path, query, hash),
    // ESTAMOS EN DEMO. Punto. Esto resuelve definitivamente el problema
    // de que sgson-adapter cargue antes que prototype-main.
    const _isDemoURL = /demo/i.test(window.location.href);
    const _dm = window.DemoMode;
    const _flag = _dm ? _dm.flag : () => undefined;
    const _label = _dm ? _dm.label : (_, f) => f;
    const _dmActive = _isDemoURL || (_dm && _dm.isActive && _dm.isActive());

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
    ROWS.push({
      key:'paths',
      title: _label('paths_recommended_label', 'Rutas recomendadas para ti'),
      sub:   _label('paths_recommended_sub', 'según tu rol'),
      isPaths: true,
    });
    ROWS.push({ key:'trending', title:'Tendencia esta semana', sub:(window.WORKSPACE_NAME ? ('en ' + window.WORKSPACE_NAME) : 'en tu workspace'), pillIds: trending, trending: true });
    if (careIds.length > 0) {
      ROWS.push({ key:'care', title:'Care', sub:'atención al cliente que de verdad funciona', pillIds: careIds });
    }
    if (analyticsIds.length > 0) {
      ROWS.push({ key:'analytics', title:'Analytics & Integraciones', sub:'medir, integrar, mejorar', pillIds: analyticsIds });
    }
    ROWS.push({
      key:'new',
      // En demo · el título pasa a "Recién publicado" (per spec del cliente)
      // y el sub se vacía. Fuera de demo se mantiene "Nuevo en SolidStream
      // / recién publicado en BeonIt × Repsol".
      title: _label('new_row_title', 'Nuevo en SolidStream'),
      sub:   _label('new_row_sub',   'recién publicado en BeonIt × Repsol'),
      pillIds: newIds,
      newRow: true,
    });

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
    // Derivar pillIds dinámicamente · si el path tiene _id (uuid · Supabase
     // mode), cruzar con window.PILLS por pill.pathId. Esto resuelve la race
     // condition de Promise.all(loadPills, loadContent('path')) donde el
     // primer build podía no encontrar pills aún. El adapter se vuelve a
     // ejecutar en pills-changed (líneas finales del archivo).
    const LEARNING_PATHS = SRC_PATHS.map(p => {
      let pillIds = Array.isArray(p.pills) ? p.pills.slice() : (Array.isArray(p.pillIds) ? p.pillIds.slice() : []);
      if (pillIds.length === 0 && p._id) {
        pillIds = (window.PILLS || [])
          .filter(x => x.pathId && x.pathId === p._id)
          .map(x => x.id);
      }
      // Progreso real de la ruta · cuenta cuántas de sus pills están
      // marcadas como completadas en window.Progress (Supabase scope user).
      // Si total=0, progress=0. La card lo renderiza como barra + "N/M".
      let completed = 0;
      if (window.Progress && window.Progress.get && pillIds.length > 0) {
        completed = pillIds.filter(id => {
          const r = window.Progress.get(id);
          return !!(r && r.completed_at);
        }).length;
      }
      const total = pillIds.length;
      const pct = total > 0 ? completed / total : 0;
      // Metadata del workspace_content · contiene poster_url (cover del
      // curso · cargado a Supabase Storage por design), cert_url (PDF/PNG
      // del certificado), accent (color hex del manual beonit).
      const meta = p._meta || {};
      const accentHex = meta.accent || null;
      return {
        id:        p.id,
        _id:       p._id,            // uuid expuesto para routeProgress() externo
        slug:      p.id,             // usado por components para match con assets
        title:     p.label || p.title || 'Ruta',
        label:     p.label || p.title || 'Ruta',
        desc:      p.desc || p.roleTag || '',
        badge:     p.badge || '',
        pills:     pillIds.length || p.totalPills || 0,
        pillIds:   pillIds,
        hours:     p.duration || (pillIds.length ? (pillIds.length * 5) + ' min' : '—'),
        accent:    TONE_BY_LABEL[p.label] || 'cat-publish',
        accentHex: accentHex,        // color hex del design (#0072BE, #FC220D, etc.)
        posterUrl: meta.poster_url || null,  // cover image del curso (design)
        certUrl:   meta.cert_url || null,    // certificado descargable (design)
        // Progreso del user en esta ruta
        progress:  pct,
        completedCount: completed,
        totalCount: total,
        isCompleted: pct >= 1 && total > 0,
      };
    });

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
    // En modo demo · el role y team se FUERZAN (no usan profile.role/team
    // por defecto). Esto cubre el caso en que Julio se crea desde el
    // Dashboard y queda con role='Publish Agent' / team='Repsol' default
    // del schema. Los platform admins ven su nombre real para gestionar.
    // Usamos _dmActive (URL-based ya calculado arriba) para evitar race.
    const _demoActiveU = _dmActive;
    const _wsName = (window.Workspaces && window.Workspaces.current && window.Workspaces.current() || {}).name || 'Hijos de Rivera';
    const _isPlatformAdmin = !!((profile && profile.isAdmin) || (sessionUser && (sessionUser.isAdmin || sessionUser.systemRole === 'admin')));
    const _demoForceName = _demoActiveU && !_isPlatformAdmin ? 'Julio Turbón de Cabo' : null;
    const finalName = _demoForceName || fullName;
    const finalInitials = _demoForceName
      ? finalName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
      : initials;
    // Demo · workspace name sin sufijo "Demo" para presentación
    const _wsNameClean = String(_wsName).replace(/\s+demo\s*$/i, '').trim() || _wsName;
    const USER = {
      id:       (profile && profile.id) || (sessionUser && sessionUser.id),
      name:     finalName,
      initials: finalInitials,
      role:     (_demoActiveU && !_isPlatformAdmin)
                  ? 'Learning Specialist'
                  : ((profile && profile.role) || (sessionUser && sessionUser.role) || 'Publish Agent'),
      team:     (_demoActiveU && !_isPlatformAdmin)
                  ? _wsNameClean
                  : ((profile && profile.team) || (sessionUser && sessionUser.team) || 'Repsol'),
      email:    (profile && profile.email) || (sessionUser && sessionUser.email),
      market:   'IB · España',
      isAdmin:  _isPlatformAdmin,
      systemRole: (sessionUser && sessionUser.systemRole) || (profile && profile.systemRole) || 'user',
    };

    // ── SIDEBAR_LINKS · DOS arrays separados según _dmActive (URL-based) ──
    // En demo · sólo 3 items: Inicio + Catálogo + Mi Playlist.
    // Channels / Certificados / Mi Perfil viven en el popup del avatar.
    // Cero condicionales mezcladas · cero race conditions · cero excusas.
    const SIDEBAR_LINKS = _dmActive ? [
      { key:'home',  label:'Inicio',      icon:'home' },
      { key:'rutas', label:'Catálogo',    icon:'compass' },
      { key:'path',  label:'Mi Playlist', icon:'route' },
    ] : [
      { key:'home',      label:'Inicio',     icon:'home' },
      { key:'inbox',     label:'Bandeja',    icon:'inbox', count: (window.Inbox && window.Inbox.unreadCount()) || null },
      { key:'browse',    label: _label('catalog_label', 'Catálogo'),   icon:'grid',
        hidden: _flag('hide_browse_catalog') === true },
      { key:'rutas',     label: _label('path_label_plural', 'Rutas'),  icon:'compass' },
      { key:'path',      label: _label('my_list_label', 'Mi ruta'),    icon:'route' },
      { key:'dashboard', label:'Analytics',  icon:'chart',     hidden: _flag('hide_analytics') === true },
      { key:'coach',     label:'BeonAI',     icon:'spark',     hidden: _flag('hide_beonai') === true },
      { key:'wa',        label:'Channels',   icon:'broadcast' },
      { key:'resources', label:'Recursos',   icon:'book',      hidden: _flag('hide_resources') === true },
      { key:'saved',     label:'Guardado',   icon:'bookmark' },
      { key:'profile',   label:'Mi perfil',  icon:'user' },
      { key:'settings',  label:'Ajustes',    icon:'gear' },
      { key:'admin',     label:'Admin',      icon:'shield', admin: true,
        hidden: _flag('simplified_profile') === true },
    ].filter(x => !x.hidden);

    window.SGS_DATA = { CATS, PILLS, LEARNING_PATHS, ROWS, USER, SIDEBAR_LINKS, pillById };
    window.dispatchEvent(new Event('sgs-data-ready'));
  }

  setup();

  // BUG FIX · sgson-adapter.jsx carga ANTES que prototype-main.jsx, donde
  // se define window.DemoMode. En el primer setup() _dm es undefined →
  // sidebar se construye sin filtros de demo. Polling para re-ejecutar
  // setup() en cuanto window.DemoMode esté disponible.
  function _whenDemoReady(cb, attempts) {
    attempts = attempts || 0;
    if (window.DemoMode || attempts > 100) { cb(); return; }
    setTimeout(function() { _whenDemoReady(cb, attempts + 1); }, 20);
  }
  _whenDemoReady(setup);

  // Re-construir cuando cambia el perfil del usuario (login/logout), el
  // workspace activo, o el catálogo de pills (carga desde DB en Supabase mode).
  // El badge de bandeja se mantiene en TopNav directamente (suscribe a
  // `inbox-changed`), así que no es necesario reconstruir SGS_DATA en cada
  // notificación leída.
  window.addEventListener('user-profile-changed', setup);
  window.addEventListener('auth-changed', setup);
  window.addEventListener('pills-changed', setup);
  // Cambios en paths/series/reels/podcasts también requieren rebuild de
  // SGS_DATA · son parte del catálogo expuesto en window.PATHS etc.
  ['paths-changed','series-changed','reels-changed','podcasts-changed','progress-changed'].forEach(ev => window.addEventListener(ev, setup));
  window.addEventListener('workspace-changed', setup);
})();
