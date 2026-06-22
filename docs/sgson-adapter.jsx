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
    // (b145) · Normalizador de level robusto · cliente reportó "Beyond
    // Prompting sigue saliendo como Básico en Tendencias". Causa raíz: la
    // pill tenía level='Básico' literal (escrito a mano desde admin) ·
    // el mapping anterior solo capturaba 'principiante' lowercase. Ahora
    // case-insensitive y captura toda variante razonable.
    const _normLevel = (raw) => {
      const s = String(raw || '').toLowerCase().trim();
      if (!s) return 'Intermedio';
      if (s === 'principiante' || s === 'básico' || s === 'basico' || s === 'beginner') return 'Intermedio';
      if (s === 'intermedio' || s === 'intermediate' || s === 'medio') return 'Intermedio';
      if (s === 'intermedio-alto' || s === 'intermedio alto' || s === 'upper-intermediate') return 'Intermedio-alto';
      if (s === 'avanzado' || s === 'advanced') return 'Avanzado';
      if (s === 'experto' || s === 'expert') return 'Experto';
      return raw;
    };
    // (b145) · Limpiador de título · strip prefijo "Pil N" / "Pill N" /
    // "PIL N" / "Pil N -" / "Pil N:" del comienzo del título. El cliente
    // reportó pills llamadas "Pil 1 de gestión de proyectos" · sale el
    // texto limpio sin el prefijo placeholder.
    const _cleanTitle = (raw) => String(raw || '').replace(/^\s*pi+l+\s*\d+(\.\d+)?\s*[-·:.]?\s*(de\s+)?/i, '').trim() || raw;
    const mapPill = (p) => ({
      ...p,
      pill:     String(p.pill != null ? p.pill : 0).padStart(2, '0'),
      title:    _cleanTitle(p.title),
      one:      p.one || _cleanTitle(p.title),
      teacher:  p.teacher || _teacherFallback,
      duration: p.duration || '4 min',
      category: p.category, // mantenemos el label real (Care, Social Publish, etc.)
      level:    _normLevel(p.level),
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

    // Fallback de poster · si una pill no tiene su propio poster, hereda
    // el del curso padre (workspace_content.metadata.poster_url). Así con
    // 12 imágenes (1 por curso) cubrimos las ~279 pills sin que ninguna
    // se quede con SVG placeholder en demo.
    const _pathPosterByUuid = {};
    const _pathAccentByUuid = {};
    (window.LEARNING_PATHS || []).forEach(p => {
      const meta = p._meta || {};
      if (p._id) {
        if (meta.poster_url) _pathPosterByUuid[p._id] = meta.poster_url;
        if (meta.accent)     _pathAccentByUuid[p._id] = meta.accent;
      }
    });
    PILLS.forEach(p => {
      if (!p.poster && p.pathId && _pathPosterByUuid[p.pathId]) {
        p.poster = _pathPosterByUuid[p.pathId];
      }
      if (!p.accentHex && p.pathId && _pathAccentByUuid[p.pathId]) {
        p.accentHex = _pathAccentByUuid[p.pathId];
      }
    });

    // (b149 · 2ª iteración) · cliente reportó "no veo ninguno de los cambios"
    // tras b148. Probable causa: el match exacto ('beyond prompting',
    // 'reuniones eficaces', etc.) era muy estricto · si la pill se llama
    // distinto no matcheaba. Ahora · ARRAY de keywords por imagen ·
    // basta con que UNA palabra clave esté contenida para que asigne el
    // poster. Y log en consola con resumen al final.
    const _HDR_POSTERS = {
      // base del bucket público · hijos-de-rivera
      base: 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/hijos-de-rivera/',
      ia:           'Inteligencia_Artificial_01.jpg',
      industria:    'Industria_Ingenieria_01.jpg',
      innovacion:   'Innovacion_01.jpg',
      ideas:        'close-up-idea-concept.jpg',
      colaboracion: 'Colaboracion_Digital_01.jpg',
      talento:      'Talento_Diversidad_01.jpg',
      hackers:      'team-governmental-hackers-look-green-screen-high-tech-agency-office.jpg',
      tecnologia:   'Tecnologia_Digital_01.jpg',
      teletrabajo:  'Teletrabajo_01.jpg',
    };
    const _hdrUrl = (k) => _HDR_POSTERS.base + _HDR_POSTERS[k];
    // Asignaciones · 4 explícitas + 5 con keywords razonables a criterio
    // según el contenido de cada imagen. El cliente dijo "el resto donde
    // tú quieras, a tu criterio".
    const _HDR_FIXED = [
      // FIJAS (las 4 que pidió el cliente explícitamente)
      { keys: ['beyond prompting', 'beyond promting', 'beyond prompt', 'criterio ia', 'criterio para trabajar con ia'], url: _hdrUrl('ia'), label: 'IA' },
      { keys: ['reuniones eficaces', 'reuniones eficases', 'reunion eficaz', 'reuniones'], url: _hdrUrl('industria'), label: 'Industria/Reuniones' },
      { keys: ['prioridades sin agobio', 'prioridades', 'agobio', 'gestion del tiempo', 'gestion tiempo'], url: _hdrUrl('innovacion'), label: 'Prioridades' },
      { keys: ['feedback 360', 'feedback que no escuece', 'feedback 360 que no escuece', 'feedback'], url: _hdrUrl('ideas'), label: 'Feedback' },
      // EXTRAS (a criterio · keywords ampliadas para cursos típicos del
      // catálogo HdR · "gestion de proyectos", "gestion de cambios",
      // "liderazgo", "comunicacion", etc.)
      { keys: ['colaboracion', 'trabajo en equipo', 'equipo', 'cooperacion', 'comunicacion'], url: _hdrUrl('colaboracion'), label: 'Colaboración' },
      { keys: ['diversidad', 'inclusion', 'talento', 'personas', 'desarrollo personas', 'desarrollar personas', 'liderazgo'], url: _hdrUrl('talento'), label: 'Talento/Diversidad' },
      { keys: ['ciberseguridad', 'seguridad', 'hacker', 'datos seguros', 'proteccion'], url: _hdrUrl('hackers'), label: 'Ciberseguridad' },
      { keys: ['transformacion digital', 'digitalizacion', 'tecnologia', 'innovacion digital', 'automatizacion', 'gestion de cambios', 'gestion del cambio'], url: _hdrUrl('tecnologia'), label: 'Tecnología' },
      { keys: ['teletrabajo', 'trabajo remoto', 'home office', 'remoto', 'hibrido', 'gestion de proyectos', 'proyecto'], url: _hdrUrl('teletrabajo'), label: 'Teletrabajo' },
    ];
    // Pool fallback completo para pills sin match · rotación determinista
    // por hash del id. Incluye TODAS las imágenes · si una pill no matchea
    // ninguna keyword, igual recibe una imagen bonita en vez del SVG.
    const _HDR_POOL = [
      _hdrUrl('colaboracion'), _hdrUrl('talento'), _hdrUrl('hackers'),
      _hdrUrl('tecnologia'), _hdrUrl('teletrabajo'), _hdrUrl('innovacion'),
      _hdrUrl('ia'), _hdrUrl('industria'), _hdrUrl('ideas'),
    ];
    const _normTitle = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    const _seedFromId = (id) => {
      const s = String(id || '');
      let h = 0;
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return Math.abs(h);
    };
    // (b154) · cliente: "sigue sin reflejarse en HdR". Root cause real ·
    // las pills HdR YA TIENEN p.poster asignado en BD (de seeds antiguos
    // o admin) · mi código las saltaba con `if (p.poster) return` →
    // ningún poster nuevo se aplicaba. Las 4 fijas DEBEN PISAR el poster
    // previo (orden explícita del cliente). Las extras y el pool solo si
    // no hay poster.
    let _hdrForcedFixed = 0, _hdrForcedExtra = 0, _hdrFallback = 0, _hdrSkipped = 0;
    const _hdrTitlesUnmatched = [];
    // Las 4 fijas se distinguen del resto · son las primeras 4 entradas
    // de _HDR_FIXED. Las extras (5+) NO pisan poster previo.
    const _HDR_FIXED_HARD = _HDR_FIXED.slice(0, 4);
    const _HDR_FIXED_SOFT = _HDR_FIXED.slice(4);
    PILLS.forEach(p => {
      const norm = _normTitle(p.title);
      // 1) Asignación FIJA EXPLÍCITA · pisa cualquier poster previo
      const hard = _HDR_FIXED_HARD.find(f => f.keys.some(k => norm.indexOf(k) !== -1));
      if (hard) {
        p.poster = hard.url; // FORZADO · pisa BD
        _hdrForcedFixed++;
        return;
      }
      // 2) Resto · respetamos lo que ya tenga
      if (p.poster) { _hdrSkipped++; return; }
      // 3) Asignación EXTRA por keyword
      const soft = _HDR_FIXED_SOFT.find(f => f.keys.some(k => norm.indexOf(k) !== -1));
      if (soft) {
        p.poster = soft.url;
        _hdrForcedExtra++;
        return;
      }
      _hdrTitlesUnmatched.push(p.title);
      // 4) Fallback pool determinista por hash del id
      p.poster = _HDR_POOL[_seedFromId(p.id) % _HDR_POOL.length];
      _hdrFallback++;
    });
    console.log('[posters-hdr] total pills=' + PILLS.length,
      '· FIJAS (pisaron BD)=' + _hdrForcedFixed,
      '· extras keyword=' + _hdrForcedExtra,
      '· pool fallback=' + _hdrFallback,
      '· respeté poster previo=' + _hdrSkipped);
    if (_hdrTitlesUnmatched.length > 0 && _hdrTitlesUnmatched.length < 30) {
      console.log('[posters-hdr] títulos SIN match keyword (cayeron al pool):', _hdrTitlesUnmatched);
    }

    // ── DemoMode · DETECCIÓN BRUTA POR URL ──
    // Sin race conditions, sin helpers, sin esperar a window.DemoMode.
    // Si la URL contiene "demo" en cualquier sitio (path, query, hash),
    // ESTAMOS EN DEMO. Punto. Esto resuelve definitivamente el problema
    // de que sgson-adapter cargue antes que prototype-main.
    // Solo workspace de demo · antes `/demo/i.test(href)` activaba el
    // contexto HdR (incluido el nombre forzado "Julio Turbón") para cualquier
    // user real que visitara una URL con "demo".
    const _isDemoURL = !!(window.isDemoWorkspace && window.isDemoWorkspace());
    const _dm = window.DemoMode;
    const _flag = _dm ? _dm.flag : () => undefined;
    const _label = _dm ? _dm.label : (_, f) => f;
    const _dmActive = _isDemoURL || (_dm && _dm.isActive && _dm.isActive());

    // ── ROWS · estructura de filas Home del rediseño ──
    // "Sigue formándote" · 1 sola card (cliente: "solo puedes ver un curso a
    // la vez"). Prioridad: 1º Beyond Prompting si existe (cliente lo pidió
    // como destacado · b136), 2º último en progreso del user.
    const _bpMatch = (p) => /beyond\s*prompt/i.test(String(p.title || ''));
    const _bp = PILLS.find(_bpMatch);
    const _inProgress = PILLS
      .filter(p => !_bpMatch(p) && p.progress > 0 && p.progress < 1)
      .sort((a, b) => (b.lastUpdated || b.progress || 0) - (a.lastUpdated || a.progress || 0));
    const inProgress = (_bp ? [_bp, ..._inProgress] : _inProgress)
      .map(p => p.id)
      .slice(0, 1);
    // (b141 → b142) · cliente reportó "en Tendencias aparecen pills que
    // hemos borrado · nombres de Pil antiguos que no servían". Helper
    // defensivo · excluye:
    //  · archivado/borrado en BD (varios campos según versión del schema)
    //  · status draft/archived/deleted
    // (b153) · cliente: "estás haciendo los cambios solo en RevSol · tienen
    // que ser en los 3 workspaces". Root cause: el filtro placeholder
    // _looksPlaceholder excluía las pills cuyo título empezaba por "Pil N"
    // → HdR tiene casi todas sus pills con ese patrón ("Pil 1 de gestión
    // de proyectos") → tras strip cleanTitle quedaban como "gestion de
    // proyectos" pero la pill misma se excluía del array trending/withVideo/etc.
    // → en HdR no se veían los cambios. Repsol no tiene pills placeholder ·
    // por eso sus cambios SÍ se veían.
    // Fix · QUITAR _looksPlaceholder del filtro. Las pills aparecen todas ·
    // cleanTitle ya limpia el prefijo "Pil N" del título visible. Las pills
    // con título solo "Pil 1" (sin contenido) tendrán título vacío tras
    // clean · usamos el raw para no perderlas (fallback a "Pil N" como
    // título visible si no hay nada más).
    const _isLive = (p) => !p.archived
                        && !p.archived_at
                        && !p.deleted_at
                        && p.status !== 'archived'
                        && p.status !== 'deleted'
                        && p.status !== 'draft';
    const _livePills = PILLS.filter(_isLive);
    // (b157) Orden MANUAL · por position/pill_number ascending (orden de
    // creación/subida en BD). Cliente: "Tendencias debe mostrar los 9
    // cursos del catálogo en el mismo orden en que se han subido · NO
    // ordenación automática". Helper reutilizable porque se usa también
    // en el catálogo (BrowseView) para mantener mismo orden.
    const _manualOrder = (a, b) => {
      const pa = (a.position != null) ? a.position : (a.pill_number != null ? a.pill_number : 9999);
      const pb = (b.position != null) ? b.position : (b.pill_number != null ? b.pill_number : 9999);
      return pa - pb;
    };
    const _ordered = _livePills.slice().sort(_manualOrder);
    window.__pillsManualOrder = _ordered.map(p => p.id);  // expone para BrowseView
    const withVideo       = _ordered.filter(p => p.yt || p.mp4).map(p => p.id).slice(0, 10);
    const trending        = _ordered.map(p => p.id).slice(0, 9);   // 9 cursos · orden manual
    const careIds         = _ordered.filter(p => p.category === 'Care' || p.category === 'Aprobaciones').map(p => p.id).slice(0, 10);
    const analyticsIds    = _ordered.filter(p => p.category === 'Analytics' || p.category === 'Integraciones').map(p => p.id).slice(0, 10);
    const newIds          = _ordered.slice(-12).reverse().map(p => p.id);

    // ── ROWS · orden definido en el spec del producto ──
    // 1. Sigue formándote (cursos en progreso)
    // 2. Recomendados para ti (según rol/puesto)
    // 3. Top 10 cursos · [Nombre de la marca]
    // 4. Disponibles
    // 5. Próximamente
    const ROWS = [];

    // 1. SIGUE FORMÁNDOTE · restaurada (b165) · cliente aclaró: el home
    //    sí lleva esta row · la quería quitar de Mi Lista (MyPathView).
    if (inProgress.length > 0) {
      const userProf = window.UserProfile ? window.UserProfile.get() : null;
      const firstName = (userProf && userProf.name && userProf.name !== 'Sin sesión')
        ? String(userProf.name).split(/\s+/)[0]
        : (window.I18n ? window.I18n.t('home.continue.fallback', 'tú') : 'tú');
      const T = window.I18n ? window.I18n.t.bind(window.I18n) : (k, f) => f;
      ROWS.push({
        key: 'continue',
        title: _dmActive
                  ? ('Sigue formándote, ' + firstName)
                  : T('home.continue.title','Continúa, {name}').replace('{name}', firstName),
        sub:   _dmActive ? '' : T('home.continue.sub','donde lo dejaste'),
        pillIds: inProgress, showProgress: true,
      });
    }

    // (b142) Tendencias se MOVIÓ aquí abajo · cliente pidió que vaya
    // DESPUÉS de Recomendados · empuje el push al final de la función.

    // 3. RECOMENDADOS PARA TI · 4 cursos fijos solicitados por el cliente
    //    (b161) · quita "Desarrollo de Personas" · añade "Desarrollar
    //    personas" (Liderazgo) y "Presentaciones eficaces" (Comunicación).
    //    Match exacto primero (NxRow) · si los paths no existen en BD se
    //    sintetiza un stub bloqueado "Próximamente".
    ROWS.push({
      key:'paths',
      title: _label('paths_recommended_label', 'Recomendados para ti'),
      sub:   _label('paths_recommended_sub', 'tu próxima ruta'),
      isPaths: true,
      _recommended: true,
      _recommendedTitles: ['Gestión de Proyectos', 'Comunicación y Feedback', 'Desarrollar personas', 'Presentaciones eficaces'],
    });

    // 3. TENDENCIAS DE LA SEMANA · (b142) movida AQUÍ · cliente: "tiene que
    //    estar por debajo de Recomendados para Ti". Antes iba justo después
    //    de Sigue formándote. NxRow trending: true renderiza los números al
    //    lado de cada card.
    if (trending.length > 0) {
      ROWS.push({
        key: 'trending',
        title: _label('trending_row_title', 'Tendencias de la semana'),
        sub:   _label('trending_row_sub', ''),
        pillIds: trending,
        trending: true,
      });
    }

    // 4. DISPONIBLES · (b158) cliente aclaró: NO quitar la row entera,
    //    solo el subtítulo "reproducir directamente". El título se queda.
    // (b162) cliente: "Disponibles tiene que mostrar las mismas pills que
    // Tendencias pero en otro orden, con botón Inscribirse". Las que no
    // están inscritas ya muestran "Inscribirse" automáticamente (NxCard
    // demoActive && !isAssigned branch). Beyond Prompting tiene progress
    // > 0 → isAssigned → botón "Reproducir" (correcto, ya está inscrito).
    // Orden invertido respecto a trending para que se sienta distinto.
    const availableIds = trending.slice().reverse();
    if (availableIds.length > 0) {
      ROWS.push({
        key:'available',
        title: 'Disponibles',
        sub: '',
        pillIds: availableIds,
        forceEnroll: true,   // (b163) NxCard fuerza botón Inscribirse aquí
      });
    }

    // 5. PRÓXIMAMENTE
    ROWS.push({
      key:'new',
      title: _label('new_row_title', 'Próximamente'),
      sub:   _label('new_row_sub',   ''),
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
        // Brand (sub-catálogo) · workspace_content.metadata.brand. Permite
        // agrupar paths por marca dentro de un workspace (HdR: 1906,
        // Estrella Galicia, Anchois Cuca…). Si no hay brand, queda null y
        // RutasView trata todo como "Catálogo general".
        brand:     meta.brand || null,
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
    // ── USER overrides ──
    // _dmActive · UX demo (sidebar simple, hide AI, etc.) · aplica a TODOS
    //   los non-admin por defecto + admins en URL demo.
    // _isHdRDemo · solo para la URL específica de la demo de Hijos de Rivera.
    //   Aquí gateamos los hardcodes HdR (nombre forzado Julio Turbón) para
    //   que NO se filtren a otros workspaces ni a usuarios reales de Repsol.
    const _demoActiveU = _dmActive;
    const _isHdRDemo   = _isDemoURL;  // URL contiene "demo" → contexto HdR
    const _wsName = (window.Workspaces && window.Workspaces.current && window.Workspaces.current() || {}).name || '';
    const _isPlatformAdmin = !!((profile && profile.isAdmin) || (sessionUser && (sessionUser.isAdmin || sessionUser.systemRole === 'admin')));
    // (b171) Cliente pidió simplificar el nombre del user demo · sin
    // punto · sin "de Cabo" · ambas palabras en minúscula.
    const _demoForceName = _isHdRDemo && !_isPlatformAdmin ? 'julio turbon' : null;
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
      // Role · "Learning Manager" solo en demo HdR (no para todos los
      // non-admin, que pueden tener roles reales en sus workspaces).
      role:     (_isHdRDemo && !_isPlatformAdmin)
                  ? 'Learning Manager'
                  : ((profile && profile.role) || (sessionUser && sessionUser.role) || 'Publish Agent'),
      // Team · usa el workspace activo · sin "Repsol" hardcoded para
      // ningún user (anti-leak entre tenants).
      team:     (profile && profile.team) || (sessionUser && sessionUser.team) || _wsNameClean || 'Mi equipo',
      email:    (profile && profile.email) || (sessionUser && sessionUser.email),
      market:   'IB · España',
      isAdmin:  _isPlatformAdmin,
      avatarUrl: (profile && (profile.avatarUrl || profile.avatar_url)) || (sessionUser && (sessionUser.avatarUrl || sessionUser.avatar_url)) || null,
      systemRole: (sessionUser && sessionUser.systemRole) || (profile && profile.systemRole) || 'user',
    };

    // ── SIDEBAR_LINKS · DOS arrays separados según _dmActive (URL-based) ──
    // En demo · sólo 3 items: Inicio + Catálogo + Mi Playlist.
    // Channels / Certificados / Mi Perfil viven en el popup del avatar.
    // Cero condicionales mezcladas · cero race conditions · cero excusas.
    const SIDEBAR_LINKS = _dmActive ? [
      { key:'home',  label:'Inicio',      icon:'home' },
      { key:'rutas', label:'Catálogo',    icon:'compass' },
      { key:'path',  label:'Mi Lista', icon:'route' },
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
