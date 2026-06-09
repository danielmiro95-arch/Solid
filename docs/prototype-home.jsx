// prototype-home.jsx — SOLID · Repsol × BeonIt

const { useState, useEffect } = React;

// Resuelve la URL de vídeo de una pill. Acepta:
//  - URL completa (https://...)  → se usa tal cual (YouTube, Vimeo, CDN, etc.)
//  - nombre de archivo (p44.mp4) → se construye la URL pública del bucket
//    `pill-videos` de Supabase Storage usando window.SUPABASE_URL.
// Devuelve null si no hay valor.
function pillVideoUrl(mp4) {
  if (!mp4) return null;
  if (/^https?:\/\//i.test(mp4)) return mp4;
  var base = (typeof window !== 'undefined' && window.SUPABASE_URL) || '';
  if (!base) return null; // sin Supabase configurado no podemos resolver el nombre
  return base.replace(/\/$/, '') + '/storage/v1/object/public/pill-videos/' + mp4;
}
if (typeof window !== 'undefined') window.pillVideoUrl = pillVideoUrl;

// ── SVG placeholder generator ────────────────────────────────────────────
// Mientras design no haya subido los assets reales a Storage, generamos
// portadas inline en SVG que respetan el acento corporativo del curso y
// el manual beonit (Avenir Next, geometría limpia, badge "BEONIT"). Salen
// como data: URLs y van directas al <img src=...>, sin tocar la red.
//
// Strings construidos con concat (no template literals anidados) para
// evitar problemas con babel-standalone en el navegador.
function _svgEscape(s) {
  s = String(s == null ? '' : s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function _coursePosterSVG(title, accentHex, level) {
  var t = _svgEscape(title || 'Curso');
  var a = accentHex || '#0072BE';
  var lvl = _svgEscape(String(level || '').toUpperCase());
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  var line1 = t.length > 22 ? t.slice(0, 22) : t;
  var line2 = t.length > 22 ? t.slice(22, 44) : '';
  var titleEls =
    '<tspan x="40" dy="0">' + line1 + '</tspan>' +
    (line2 ? '<tspan x="40" dy="52">' + line2 + '</tspan>' : '');
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">' +
      '<defs>' +
        '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + a + '" stop-opacity="1"/>' +
          '<stop offset="60%" stop-color="' + a + '" stop-opacity="0.65"/>' +
          '<stop offset="100%" stop-color="#0A0A0A" stop-opacity="0.95"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="600" height="800" fill="url(#g)"/>' +
      '<text x="40" y="64" fill="#FFFFFF" font-family="' + ff + '" font-size="11" font-weight="700" letter-spacing="3" opacity="0.85">' + lvl + '</text>' +
      '<text x="40" y="660" fill="#FFFFFF" font-family="' + ff + '" font-size="44" font-weight="800" letter-spacing="-1">' + titleEls + '</text>' +
      '<text x="40" y="760" fill="#FFFFFF" font-family="' + ff + '" font-size="10" font-weight="600" letter-spacing="3" opacity="0.75">BEONIT &#215; HIJOS DE RIVERA</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
if (typeof window !== 'undefined') window.coursePosterSVG = _coursePosterSVG;

function _pillPosterSVG(title, accentHex) {
  var t = _svgEscape(title || 'Pill');
  var a = accentHex || '#0072BE';
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  var line = t.length > 32 ? t.slice(0, 32) + '…' : t;
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 338">' +
      '<defs>' +
        '<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + a + '" stop-opacity="0.95"/>' +
          '<stop offset="100%" stop-color="#0A0A0A" stop-opacity="0.92"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="600" height="338" fill="url(#g2)"/>' +
      '<text x="32" y="288" fill="#FFFFFF" font-family="' + ff + '" font-size="26" font-weight="800" letter-spacing="-0.5">' + line + '</text>' +
      '<text x="32" y="320" fill="#FFFFFF" font-family="' + ff + '" font-size="9" font-weight="600" letter-spacing="3" opacity="0.65">BEONIT</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
if (typeof window !== 'undefined') window.pillPosterSVG = _pillPosterSVG;

function _certificateSVG(title, userName, accentHex, certNumber, dateStr) {
  var t = _svgEscape(title || 'Curso');
  var u = _svgEscape(userName || 'Alumno');
  var a = accentHex || '#0072BE';
  var n = _svgEscape(certNumber || 'CERT-2026-0001');
  var d = _svgEscape(dateStr || new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }));
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  var serif = 'Georgia, serif';
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 900">' +
      '<rect width="1240" height="900" fill="#FFFFFF"/>' +
      '<rect x="40" y="40" width="1160" height="820" fill="none" stroke="' + a + '" stroke-width="2"/>' +
      '<rect x="80" y="80" width="1080" height="740" fill="none" stroke="' + a + '" stroke-width="1" stroke-opacity="0.3"/>' +
      '<circle cx="1080" cy="180" r="60" fill="' + a + '"/>' +
      '<text x="1080" y="195" text-anchor="middle" fill="#FFFFFF" font-family="' + ff + '" font-size="42" font-weight="800">&#9733;</text>' +
      '<text x="160" y="200" fill="' + a + '" font-family="' + ff + '" font-size="13" font-weight="800" letter-spacing="4">CERTIFICADO DE FINALIZACI&#211;N</text>' +
      '<text x="160" y="330" fill="#0A0A0A" font-family="' + ff + '" font-size="52" font-weight="800" letter-spacing="-1">' + u + '</text>' +
      '<text x="160" y="400" fill="#3D3D3D" font-family="' + serif + '" font-style="italic" font-size="22">ha completado satisfactoriamente el curso</text>' +
      '<text x="160" y="490" fill="#0A0A0A" font-family="' + serif + '" font-style="italic" font-size="38" font-weight="500">' + t + '</text>' +
      '<line x1="160" y1="700" x2="500" y2="700" stroke="#0A0A0A" stroke-width="1"/>' +
      '<text x="160" y="730" fill="#3D3D3D" font-family="' + ff + '" font-size="12" font-weight="700" letter-spacing="2">JULIO TURB&#211;N</text>' +
      '<text x="160" y="748" fill="#6F6F6F" font-family="' + ff + '" font-size="11" letter-spacing="1">Direcci&#243;n de Formaci&#243;n &#183; Hijos de Rivera</text>' +
      '<text x="1080" y="730" text-anchor="end" fill="#3D3D3D" font-family="' + ff + '" font-size="11" letter-spacing="2">' + n + '</text>' +
      '<text x="1080" y="748" text-anchor="end" fill="#6F6F6F" font-family="' + ff + '" font-size="11" letter-spacing="1">' + d + '</text>' +
      '<text x="160" y="830" fill="#9A9A9A" font-family="' + ff + '" font-size="10" font-weight="600" letter-spacing="3">BEONIT &#215; HIJOS DE RIVERA</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
if (typeof window !== 'undefined') window.certificateSVG = _certificateSVG;

// PILLS · catálogo · ahora vienen del DB (public.pills) filtrados
// por workspace_id. Bundle ya no trae contenido. _loadPills() en
// prototype-main.jsx puebla window.PILLS al cambiar de workspace.
const PILLS = [];

// SERIES · bloques formativos · ahora vienen de workspace_content
// (kind='series'). Loader _loadContent('series') las puebla.
const SERIES = [];

// REELS · quick tips · ahora vienen de workspace_content (kind='reel').
const REELS = [];

// PODCASTS · charlas · ahora vienen de workspace_content (kind='podcast').
const PODCASTS = [];

// PATHS · rutas · ahora vienen de workspace_content (kind='path').
const PATHS = [];

const CATEGORIES = ['Todo', 'Fundamentos', 'Estructura', 'Gobernanza', 'Social Publish', 'Aprobaciones', 'Calendario', 'Analytics', 'Care', 'Activos', 'Integraciones', 'Compliance', 'Certificación'];

// ── Components ────────────────────────────────────────────────────────────
function CategoryBar({ active, setActive }) {
  return (
    <div className="cat-bar">
      {CATEGORIES.map(c => (
        <button key={c} className={`cat-pill ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
      ))}
    </div>
  );
}
// ============================================================
// REDESIGN · TopNav · Hero · Card · PathCard · Row · HomeView
// Adaptación del mockup `redesign/sgson-home.jsx` al SaaS actual.
// Usa window.SGS_DATA (alimentado por sgson-adapter.jsx).
// ============================================================

const _catSlugFix = (s) => {
  const x = String(s || '').toLowerCase().replace(/\s+/g, '-');
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

// ── WorkspaceSwitcher · chip con dropdown para cambiar de tenant ──────────
function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = React.useRef(null);
  useEffect(() => {
    const refresh = () => setTick(x => x + 1);
    window.addEventListener('workspaces-changed', refresh);
    window.addEventListener('workspace-changed', refresh);
    window.addEventListener('auth-changed', refresh);
    return () => {
      window.removeEventListener('workspaces-changed', refresh);
      window.removeEventListener('workspace-changed', refresh);
      window.removeEventListener('auth-changed', refresh);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onClickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [open]);

  if (!window.Workspaces) return null;
  const current = window.Workspaces.current();
  const mine = window.Workspaces.listMine();
  // Platform admins ven el switcher siempre, incluso sin workspaces (para
  // poder crear el primero). Members lo ven solo si tienen workspaces.
  const isPlatformAdmin = !!(window.Auth && window.Auth.can && window.Auth.can('admin.viewPanel'));
  if (mine.length === 0 && !isPlatformAdmin) return null;

  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const T_ALL = T('workspaces.allWorkspaces','Tus workspaces');
  const T_SWITCH = T('workspaces.switch','Cambiar workspace');

  const createNewWorkspace = async () => {
    const name = newName.trim();
    if (!name) return;
    const ws = await Promise.resolve(window.Workspaces.create({ name, primaryColor: '#6E50EE' }));
    setNewName(''); setCreating(false); setOpen(false);
    if (ws && ws.id) window.Workspaces.setCurrent(ws.id);
    if (window.Toast) window.Toast.success('Workspace "' + name + '" creado');
  };

  return (
    <div ref={ref} className="workspace-switcher" style={{ position:'relative', marginLeft: 10 }}>
      <button onClick={() => setOpen(o => !o)}
        title={T_SWITCH}
        style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          padding:'5px 10px',
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.10)',
          borderRadius: 999,
          fontFamily:'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize: 10.5, letterSpacing:'0.06em', fontWeight: 600,
          color:'#F5F4F1',
          cursor:'pointer',
          maxWidth: 220, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
        <span style={{ width: 6, height: 6, borderRadius:'50%', background: (current && current.primaryColor) || 'var(--accent)' }}/>
        {current ? current.name : 'Sin workspace'}
        <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left: 0, zIndex: 80,
          minWidth: 260,
          background:'rgba(14,14,18,0.96)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.10)',
          borderRadius: 10, padding: 6,
          boxShadow:'0 20px 60px rgba(0,0,0,0.40)',
        }}>
          <div style={{ padding:'8px 12px', fontFamily:'var(--font-mono, monospace)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(245,244,241,0.6)', fontWeight: 700 }}>
            {T_ALL}
          </div>
          {mine.length === 0 && (
            <div style={{ padding:'12px 12px 6px', fontSize: 12, color:'rgba(245,244,241,0.7)', fontStyle:'italic' }}>
              Aún no hay workspaces. Crea el primero abajo ↓
            </div>
          )}
          {mine.map(w => (
            <button key={w.id} onClick={() => { window.Workspaces.setCurrent(w.id); setOpen(false); }}
              style={{
                display:'flex', alignItems:'center', gap: 10, width:'100%',
                padding:'8px 12px', border:'none', background: (current && w.id === current.id) ? 'rgba(110,80,238,0.16)' : 'transparent',
                cursor:'pointer', textAlign:'left', borderRadius: 6,
                fontFamily:'var(--font-sans, Inter)', fontSize: 13, color:'#F5F4F1',
              }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: w.primaryColor || 'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 11, fontWeight: 800, flexShrink: 0, overflow:'hidden' }}>
                {w.logo || w.logo_url ? (
                  <img src={w.logo || w.logo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }}/>
                ) : (w.name || '?').slice(0, 2).toUpperCase()}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.name}</span>
              {w._membership && (
                <span style={{ fontFamily:'var(--font-mono, monospace)', fontSize: 9, color:'rgba(245,244,241,0.6)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{w._membership.role}</span>
              )}
              {current && w.id === current.id && <span style={{ color:'var(--accent)', fontSize: 14 }}>✓</span>}
            </button>
          ))}
          {/* Crear nuevo workspace · solo platform admin */}
          {isPlatformAdmin && (
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', marginTop: 4, paddingTop: 4 }}>
              {!creating ? (
                <button onClick={() => setCreating(true)}
                  style={{
                    display:'flex', alignItems:'center', gap: 8, width:'100%',
                    padding:'8px 12px', border:'none', background:'transparent',
                    cursor:'pointer', textAlign:'left', borderRadius: 6,
                    fontFamily:'var(--font-sans, Inter)', fontSize: 12.5, fontWeight: 600,
                    color:'var(--accent)',
                  }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                  <span>Nuevo workspace</span>
                </button>
              ) : (
                <div style={{ padding:'8px 8px 4px', display:'flex', gap: 6 }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') createNewWorkspace(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                    placeholder="Nombre del cliente"
                    style={{
                      flex: 1, padding:'6px 10px',
                      background:'rgba(255,255,255,0.06)',
                      border:'1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6, fontSize: 12, color:'#F5F4F1', outline:'none',
                    }}/>
                  <button onClick={createNewWorkspace} disabled={!newName.trim()}
                    style={{
                      padding:'6px 12px',
                      background: newName.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                      color: newName.trim() ? '#fff' : 'rgba(245,244,241,0.5)',
                      border:'none', borderRadius: 6,
                      cursor: newName.trim() ? 'pointer' : 'not-allowed',
                      fontSize: 11.5, fontWeight: 700,
                    }}>
                    Crear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopNav({ view, onView, onSearch, onLogout }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Close mobile nav al navegar
  useEffect(() => { setMobileNavOpen(false); }, [view]);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inboxCount, setInboxCount] = useState(() => (window.Inbox && window.Inbox.unreadCount && window.Inbox.unreadCount()) || 0);
  const menuRef = React.useRef(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Click fuera cierra el dropdown
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOut = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [menuOpen]);
  // Badge de bandeja se mantiene reactivo a cambios del Inbox
  useEffect(() => {
    const refresh = () => setInboxCount((window.Inbox && window.Inbox.unreadCount && window.Inbox.unreadCount()) || 0);
    refresh();
    window.addEventListener('inbox-changed', refresh);
    return () => window.removeEventListener('inbox-changed', refresh);
  }, []);

  // Re-render cuando cambia el idioma
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });

  // En demo (URL contiene "demo") · TopNav reducido a 3 items.
  // Esto es DISTINTO del SIDEBAR_LINKS del adapter (que va al popup
  // del avatar) · el TopNav center es lo que el user ve como navegación
  // principal arriba. Antes era hardcoded e ignoraba demo · CAUSA RAÍZ
  // de que el user siguiera viendo Catálogo/Cursos/Mi ruta/Recursos/
  // Analytics/BeonAI a pesar de tener demo activo.
  const _isDemoURL = /demo/i.test(window.location.href);
  const items = _isDemoURL ? [
    { k:'home',  label:'Inicio' },
    { k:'rutas', label:'Catálogo' },
    { k:'path',  label:'Mi Lista' },
  ] : [
    { k:'home',      label:T('nav.home') },
    { k:'browse',    label:T('nav.browse') },
    { k:'rutas',     label:T('nav.rutas') },
    { k:'path',      label:T('nav.path') },
    { k:'resources', label:T('nav.resources','Recursos') },
    { k:'dashboard', label:T('nav.dashboard') },
    { k:'coach',     label:T('nav.coach') },
  ];

  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const initials = (D && D.USER && D.USER.initials) || 'U';
  const userName = (D && D.USER && D.USER.name) || 'Usuario';
  const userAvatarUrl = (D && D.USER && D.USER.avatarUrl) || null;
  const userRole = (D && D.USER && D.USER.role) || '';
  const isAdmin = !!(D && D.USER && D.USER.isAdmin);
  const canManager = !!(window.Auth && window.Auth.hasRole && window.Auth.hasRole('manager'));
  const canAdmin   = !!(window.Auth && window.Auth.can     && window.Auth.can('admin.viewPanel'));

  // Items del dropdown del avatar · ANTES estaban en la sidebar
  // En demo · tras última reunión · el popup contiene:
  //   Mi Perfil · Channels · Certificados (+ stats abajo)
  // Channels se mueve aquí porque ya no está en sidebar.
  const isSimplified = window.DemoMode && window.DemoMode.flag('simplified_avatar_menu') === true;
  const menuItems = isSimplified ? [
    { k:'profile',      label: T('nav.profile'),               icon:'user' },
    { k:'wa',           label: T('nav.wa', 'Channels'),        icon:'broadcast' },
    { k:'certificates', label: 'Certificados',                 icon:'award' },
  ] : [
    { k:'profile',  label:T('nav.profile'),  icon:'user' },
    { k:'saved',    label:T('nav.saved'),    icon:'bookmark' },
    { k:'wa',       label:T('nav.wa'),       icon:'broadcast' },
    { k:'inbox',    label:T('nav.inbox'),    icon:'inbox', badge: inboxCount },
    { k:'settings', label:T('nav.settings'), icon:'gear' },
  ];
  if (!isSimplified && canManager) menuItems.push({ k:'manager', label: T('nav.manager','Mi equipo'), icon:'users' });
  if (!isSimplified && canAdmin)   menuItems.push({ k:'admin',   label: T('nav.admin'),               icon:'shield' });

  return (
    <nav className={`topnav ${scrolled ? 'scrolled' : ''}`}>
      <div className="topnav-left">
        {window.Wordmark
          ? <Wordmark variant="v1"/>
          : <span style={{display:'inline-flex', alignItems:'center', gap:8}}><img src={`beonit-logo.png?v=${window.SOLID_VERSION || 'init'}`} alt="" style={{height:32}}/><span style={{fontFamily:'Inter, sans-serif', fontWeight:700, fontSize:18, letterSpacing:'-0.02em'}}>SolidStream</span></span>
        }
        {/* Workspace switcher · chip al lado del logo si hay workspaces */}
        <WorkspaceSwitcher/>
      </div>

      <div className="topnav-center">
        {items.map(it => (
          <button
            key={it.k}
            className={`nav-item ${view === it.k ? 'active' : ''}`}
            onClick={() => onView(it.k)}>
            {it.label}
          </button>
        ))}
      </div>

      <div className="topnav-right" ref={menuRef} style={{position:'relative'}}>
        {/* Hamburger · solo visible en mobile via CSS */}
        <button className="topnav-hamburger icon-btn" onClick={() => setMobileNavOpen(o => !o)} aria-label="Menú" title="Menú">
          <Ico name={mobileNavOpen ? 'close' : 'menu'} size={20}/>
        </button>
        <button className="icon-btn topnav-search" onClick={onSearch}
          title="Buscar (⌘K / Ctrl+K)" aria-label="Buscar"
          style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:8 }}>
          <Ico name="search" size={18}/>
          <span className="topnav-search-kbd" aria-hidden="true" style={{
            fontFamily:'var(--mono, "JetBrains Mono", monospace)', fontSize: 9.5, fontWeight: 700,
            color:'var(--ink-4)', letterSpacing:'0.04em',
            padding:'2px 6px', border:'1px solid var(--line)', borderRadius: 4,
            background:'rgba(255,255,255,0.06)',
          }}>⌘K</span>
        </button>
        {/* Bell · oculto en demo · inbox no está en sidebar y bell apuntaba ahí */}
        {!isSimplified && (
          <button className="icon-btn" aria-label="Notificaciones" onClick={() => onView('inbox')}>
            <Ico name="bell" size={18}/>
            {inboxCount ? <span className="badge">{inboxCount}</span> : null}
          </button>
        )}
        <button className="avatar" aria-label="Menú de usuario" onClick={() => setMenuOpen(o => !o)}
          style={userAvatarUrl ? {
            backgroundImage: `url(${userAvatarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'transparent',
          } : undefined}>
          {!userAvatarUrl && initials}
        </button>

        {/* Dropdown del avatar · contiene lo que antes estaba en sidebar */}
        {menuOpen && (
          <div className="avatar-menu" style={{
            position:'absolute', top:'calc(100% + 12px)', right:0, zIndex:1100,
            minWidth:280,
            background:'rgba(14,14,18,0.96)',
            backdropFilter:'blur(20px) saturate(140%)',
            WebkitBackdropFilter:'blur(20px) saturate(140%)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12,
            boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
            padding:8,
            animation:'fadeIn .15s ease',
            color:'#F5F4F1',
          }}>
            {/* Header con usuario */}
            <div style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px 14px',
              borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6,
            }}>
              <div style={Object.assign({width:42, height:42, borderRadius:'50%', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700},
                userAvatarUrl
                  ? { backgroundImage:`url(${userAvatarUrl})`, backgroundSize:'cover', backgroundPosition:'center' }
                  : { background:'linear-gradient(135deg, var(--accent, #6E50EE), var(--accent-deep, #4E36C5))' })}>{!userAvatarUrl && initials}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, color:'#F5F4F1', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userName}</div>
                {userRole && <div style={{fontSize:11, color:'rgba(245,244,241,0.7)', fontFamily:'var(--font-mono, monospace)', letterSpacing:'0.06em', textTransform:'uppercase'}}>{userRole}</div>}
              </div>
            </div>

            {/* Items */}
            {menuItems.map(item => (
              <button key={item.k}
                onClick={() => { setMenuOpen(false); onView(item.k); }}
                style={{
                  display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 14px',
                  background: view === item.k ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border:'none', borderRadius:8, cursor:'pointer',
                  color:'#F5F4F1', textAlign:'left',
                  fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:500,
                  transition:'background .12s',
                }}
                onMouseEnter={e => { if (view !== item.k) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (view !== item.k) e.currentTarget.style.background='transparent'; }}>
                <span style={{display:'flex', alignItems:'center', justifyContent:'center', width:18, color:'rgba(245,244,241,0.7)'}}>
                  <Ico name={item.icon} size={16}/>
                </span>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge ? <span style={{padding:'2px 7px', fontSize:10, fontWeight:700, background:'var(--accent, #6E50EE)', color:'#fff', borderRadius:999, fontFamily:'var(--font-mono, monospace)'}}>{item.badge}</span> : null}
              </button>
            ))}

            {/* En demo mode · stats del user (Formación completada / en curso /
                Días activos) ELIMINADOS por petición del cliente · saturaban
                el popup sin aportar valor en la demo. El usuario puede ver su
                progreso real en "Mi Playlist". */}

            {/* Separador */}
            <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'6px 6px'}}/>

            {/* Logout */}
            <button data-logout="true" onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
              style={{
                display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 14px',
                background:'transparent', border:'none', borderRadius:8, cursor:'pointer',
                color:'var(--accent, #6E50EE)', textAlign:'left',
                fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:600,
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(110,80,238,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <span style={{display:'flex', alignItems:'center', justifyContent:'center', width:18}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </span>
              <span style={{flex:1}}>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile nav drawer · visible solo en móvil cuando hamburger está abierto */}
      {mobileNavOpen && (
        <div className="topnav-mobile-drawer" onClick={() => setMobileNavOpen(false)}>
          <div className="topnav-mobile-panel" onClick={e => e.stopPropagation()}>
            {items.map(it => (
              <button key={it.k} className={`mobile-nav-item ${view === it.k ? 'active' : ''}`} onClick={() => { onView(it.k); setMobileNavOpen(false); }}>
                {it.label}
              </button>
            ))}
            <div className="mobile-nav-divider"/>
            {menuItems.map(mi => (
              <button key={mi.k} className={`mobile-nav-item ${view === mi.k ? 'active' : ''}`} onClick={() => { onView(mi.k); setMobileNavOpen(false); }}>
                {mi.label} {mi.badge ? <span className="mobile-nav-badge">{mi.badge}</span> : null}
              </button>
            ))}
            <div className="mobile-nav-divider"/>
            <button className="mobile-nav-item mobile-nav-logout" onClick={() => { onLogout && onLogout(); setMobileNavOpen(false); }}>
              {(window.I18n ? window.I18n.t('common.logout') : 'Cerrar sesión')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function HomeHero({ onPlay, onMore }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const [muted, setMuted] = React.useState(true);

  const featured = React.useMemo(() => {
    // En modo demo · el hero muestra las 4 pills de "Tendencias de la semana"
    // como carrusel Netflix-style. El cover viene de pill.poster (URLs de
    // Supabase Storage subidas por el cliente).
    //
    // Filtros · category === 'Tendencias' (case-insensitive) o slug que
    // empiece por "tendencia-". Si no hay 4 · fallback a featured/in-progress.
    const _isDemoURL = /demo/i.test(window.location.href);
    const dm = window.DemoMode;
    if (_isDemoURL || (dm && dm.isActive && dm.isActive())) {
      const tendencias = PILLS
        .filter(p => /tendencias?/i.test(String(p.category || ''))
                  || /^tendencia-/i.test(String(p.id || p.slug || '')))
        .sort((a, b) => (a.position || a.pill_number || 0) - (b.position || b.pill_number || 0));
      if (tendencias.length > 0) return tendencias;
      // Fallback si aún no hay pills de tendencias en DB
      const inProgress = PILLS.find(p => p.progress > 0 && p.progress < 1);
      const f = inProgress || PILLS.find(p => p.featured) || PILLS[0];
      return f ? [f] : [];
    }
    // Pills con flag `featured: true` van primero (decisión del admin sobre
    // cuál destacar en el hero). El resto se rellena con pills con vídeo y,
    // si no hay suficientes, las más populares por `enrolled`.
    const withVid = PILLS.filter(p => p.yt || p.mp4)
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (withVid.length >= 4) return withVid.slice(0, 4);
    const fill = PILLS.slice().sort((a,b) => (b.enrolled||0)-(a.enrolled||0));
    const ids = new Set(withVid.map(p => p.id));
    for (const p of fill) {
      if (!ids.has(p.id)) { withVid.push(p); ids.add(p.id); }
      if (withVid.length >= 4) break;
    }
    return withVid.slice(0, 4);
  }, [PILLS.length]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (featured.length <= 1 || paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 12000);
    return () => clearInterval(t);
  }, [featured.length, paused]);

  const p = featured[idx];
  if (!p) return null;

  const pMp4 = (p.mp4 && window.pillVideoUrl) ? window.pillVideoUrl(p.mp4) : null;
  const slug = _catSlugFix(p.category);
  const cat = (D && D.CATS && (D.CATS[p.category] || D.CATS[slug])) || { label: p.category };

  return (
    <section className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-screen-label="Hero">
      <div className="hero-media">
        <div className={`hero-media-placeholder cover-${slug}`}/>
        {pMp4 ? (
          <video
            key={'video-'+p.id}
            ref={el => {
              if (!el) return;
              el.muted = muted;          // forzar property (no solo attribute) · autoplay policy
              const play = el.play();
              if (play && play.catch) play.catch(() => {});  // ignora rechazo de autoplay
            }}
            src={pMp4}
            autoPlay
            muted
            loop
            playsInline
            poster={p.poster || undefined}
            aria-hidden="true"
            tabIndex={-1}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none'}}
          />
        ) : (
          <>
            {p.yt && (
              <img
                key={'thumb-'+p.id}
                src={`https://img.youtube.com/vi/${p.yt}/maxresdefault.jpg`}
                alt=""
                aria-hidden="true"
                style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.85}}
                onError={e => {
                  if (!e.currentTarget.dataset.fb) { e.currentTarget.dataset.fb='1'; e.currentTarget.src = `https://img.youtube.com/vi/${p.yt}/hqdefault.jpg`; }
                  else { e.currentTarget.style.display = 'none'; }
                }}
              />
            )}
            {p.yt && (
              <iframe
                key={'video-'+p.id}
                src={`https://www.youtube.com/embed/${p.yt}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${p.yt}&playsinline=1&start=45&iv_load_policy=3&disablekb=1`}
                style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', pointerEvents:'none', transform:'scale(1.3)'}}
                allow="autoplay; encrypted-media"
                aria-hidden="true"
                tabIndex={-1}
                title=""
              />
            )}
          </>
        )}
      </div>
      <div className="hero-overlay"/>

      <div className="hero-badge">
        {(() => {
          const _isDemoURL = /demo/i.test(window.location.href);
          const dm = window.DemoMode;
          const demoActive = _isDemoURL || (dm && dm.isActive && dm.isActive());
          // En demo · el hero-badge muestra el LOGO BEONIT en lugar de
          // "Tendencias de la semana / María López". Petición del cliente.
          if (demoActive) {
            // Logo del workspace activo si existe, fallback al de beonit.
            // Permite que cada workspace muestre su propia marca en el hero
            // sin tener que tocar código. Settear workspace.logo_url en DB.
            const wsLogo = window.WORKSPACE_LOGO_URL || null;
            const logoSrc = wsLogo || `beonit-logo.png?v=${window.SOLID_VERSION || 'demo'}`;
            const logoAlt = wsLogo ? (window.WORKSPACE_NAME || 'workspace') : 'beonit';
            return (
              <img
                src={logoSrc}
                alt={logoAlt}
                style={{
                  height: 36,
                  width: 'auto',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
                  objectFit: 'contain',
                  maxWidth: 180,
                }}
              />
            );
          }
          if (demoActive && p.progress > 0 && p.progress < 1) {
            return <>
              <span className="label">Seguir viendo</span>
              <span className="value">{Math.round(p.progress * 100)}% · {p.teacher}</span>
              <span className="stroke"/>
            </>;
          }
          return <>
            <span className="label">Top esta semana</span>
            <span className="value">en {window.WORKSPACE_NAME || 'tu workspace'}</span>
            <span className="stroke"/>
          </>;
        })()}
      </div>

      <div className="hero-content" key={p.id}>
        <div className="hero-eyebrow">
          {(() => {
            const dm = window.DemoMode;
            const demoActive = dm && dm.isActive && dm.isActive();
            // En demo · sin prefijo "Think Pill · N", solo categoría
            return demoActive
              ? <span className="meta">{cat.label}</span>
              : <>
                  <span className="pillmark">Think Pill · {p.pill}</span>
                  <span className="sep"/>
                  <span className="meta">{cat.label}</span>
                </>;
          })()}
        </div>

        <h1 className="hero-title">{p.title}</h1>
        {/* En demo · si la pill tiene pill.one (intro text en DB), lo mostramos
            como hero-quote. Cubre el caso del cliente "texto introductorio
            que te puse en el WhatsApp" · solo hace falta actualizar
            pills.one_liner en Supabase. */}
        {p.one && p.one !== p.title && <p className="hero-quote">"{p.one}."</p>}

        <div className="hero-meta">
          <span className="tag">{(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive()) ? 'Nivel ' + p.level : p.level}</span>
          {!(window.DemoMode && window.DemoMode.flag('hide_durations') === true) && <>
            <span className="sep">/</span>
            <span>{p.duration}</span>
          </>}
          <span className="sep">/</span>
          <span>{p.teacher}</span>
          {p.rating && !(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive())
            ? (<><span className="sep">/</span><span>★ {Number(p.rating).toFixed(1)} · {(p.enrolled||0).toLocaleString('es-ES')}</span></>)
            : null}
        </div>

        <div className="hero-actions">
          {(() => {
            const _isDemoURL = /demo/i.test(window.location.href);
            const dm = window.DemoMode;
            const demoActive = _isDemoURL || (dm && dm.isActive && dm.isActive());
            const isAssigned = p && p.progress > 0;
            // En demo · botón primario "Inscríbete" si la pill no está asignada,
            // "Reproducir" si ya está en curso.
            if (demoActive && !isAssigned) {
              return (
                <button className="btn btn-primary" onClick={() => {
                  if (window.Toast) window.Toast.success('Te has inscrito al curso');
                  onPlay(p);
                }}>
                  <Ico name="plus" size={16}/> Inscríbete
                </button>
              );
            }
            return (
              <button className="btn btn-primary" onClick={() => onPlay(p)}>
                <Ico name="play" size={16}/> {T('hero.play')}
              </button>
            );
          })()}
          <button className="btn btn-secondary" onClick={() => onMore(p)}>
            <Ico name="info" size={16}/> {T('hero.more')}
          </button>
          {/* Favorito en hero (demo) · idéntica lógica que en cards */}
          {(() => {
            const _isDemoURL = /demo/i.test(window.location.href);
            const dm = window.DemoMode;
            const demoActive = _isDemoURL || (dm && dm.isActive && dm.isActive());
            if (!demoActive) return null;
            const isFav = window.Bookmarks && window.Bookmarks.has && window.Bookmarks.has(p.id);
            return (
              <button
                className="btn btn-icon btn-ghost"
                aria-label={isFav ? 'Quitar favorito' : 'Añadir a favoritos'}
                title={isFav ? 'Quitar favorito' : 'Añadir a favoritos'}
                onClick={() => {
                  if (window.Bookmarks) {
                    const isNow = window.Bookmarks.toggle(p.id);
                    if (window.Toast) window.Toast[isNow ? 'success' : 'info'](isNow ? 'Curso añadido a favoritos' : 'Quitado de favoritos', { icon: isNow ? '⭐' : '○' });
                  }
                }}
                style={isFav ? { background:'var(--accent)', color:'#fff', borderColor:'var(--accent)' } : undefined}>
                <Ico name={isFav ? 'check' : 'bookmark'} size={16}/>
              </button>
            );
          })()}
          <button className="btn btn-icon btn-ghost" aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'} onClick={() => setMuted(m => !m)}>
            <Ico name={muted ? 'mute' : 'volume'} size={16}/>
          </button>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="hero-dots">
          {featured.map((_, i) => (
            <span key={i} className={`hero-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} style={{cursor:'pointer'}}/>
          ))}
        </div>
      )}
    </section>
  );
}

// En modo demo · determina si un card de pill debe aparecer bloqueado.
// Reglas (actualizadas tras reunión):
//   1) si demo_mode no activo o lock_unassigned_courses=false · siempre abierto.
//   2) si forceUnlocked=true (fila trending = Tendencias de la semana) · abierto.
//   3) si la pill está en DemoMode.unlocked() · abierta.
//   4) si la pill tiene progress > 0 (asignada/en curso) · abierta.
//   5) por curso · primeras 3 pills (por position) abiertas, resto cerradas.
function _isPillLockedDemo(pill, forceUnlocked) {
  const dm = window.DemoMode;
  if (!dm || !dm.isActive || !dm.isActive()) return false;
  if (dm.flag('lock_unassigned_courses') !== true) return false;
  if (forceUnlocked) return false;
  if (pill && pill.progress > 0) return false;
  const list = dm.unlocked ? dm.unlocked() : [];
  if (Array.isArray(list) && pill && list.indexOf(pill.id) !== -1) return false;
  // Calcula la posición de la pill dentro de su curso. Si no podemos
  // determinar a qué curso pertenece, usamos posición global ordenada.
  const allPills = window.PILLS || [];
  if (pill && pill.pathId) {
    const sameCurso = allPills
      .filter(p => p.pathId === pill.pathId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const idxInCurso = sameCurso.findIndex(p => p.id === pill.id);
    if (idxInCurso !== -1) return idxInCurso >= 3;
  }
  // Fallback · sin pathId, ordena por position globalmente y aplica regla
  const sortedAll = allPills.slice().sort((a, b) => (a.position || 0) - (b.position || 0));
  const idxGlobal = sortedAll.findIndex(p => p.id === pill.id);
  return idxGlobal >= 3;
}

function NxCard({ pill, onOpen, showProgress, newBadge, forceUnlocked }) {
  const D = window.SGS_DATA;
  const cat = (D && D.CATS && (D.CATS[pill.category] || D.CATS[_catSlugFix(pill.category)])) || { label: pill.category || 'Módulo' };
  const slug = _catSlugFix(pill.category);

  const [saved, setSaved] = React.useState(() => window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
  const _getStars = () => {
    const r = window.Ratings && window.Ratings.get && window.Ratings.get(pill.id);
    return typeof r === 'number' ? r : (r && r.stars) || 0;
  };
  const [stars, setStars] = React.useState(_getStars);
  const rated   = stars >= 4;      // legacy alias · "Me gusta"
  const liked   = stars === 5;
  const disliked = stars === 1;
  React.useEffect(() => {
    const onB = () => setSaved(window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
    const onR = (e) => { if (e && e.detail && e.detail.pillId === pill.id) setStars(e.detail.stars || 0); };
    window.addEventListener('bookmarks-changed', onB);
    window.addEventListener('ratings-changed', onR);
    return () => { window.removeEventListener('bookmarks-changed', onB); window.removeEventListener('ratings-changed', onR); };
  }, [pill.id]);

  const toggleSave = (e) => {
    e.stopPropagation();
    if (window.Bookmarks) {
      const isNowSaved = window.Bookmarks.toggle(pill.id);
      if (window.Toast) window.Toast[isNowSaved ? 'success' : 'info'](isNowSaved ? 'Añadido a tu lista' : 'Quitado de tu lista', { icon: isNowSaved ? '➕' : '➖' });
    }
  };
  const toggleLike = (e) => {
    e.stopPropagation();
    if (window.Ratings) {
      const cur = window.Ratings.get && window.Ratings.get(pill.id);
      const curStars = typeof cur === 'number' ? cur : (cur && cur.stars) || 0;
      // Like · 5★. Si ya estaba en 5 → desactiva (0). Si era dislike (1) → cambia a 5.
      const next = curStars === 5 ? 0 : 5;
      window.Ratings.set(pill.id, next);
      if (window.Toast) window.Toast[next ? 'success' : 'info'](next ? '👍 Me gusta' : 'Valoración eliminada', { icon: next ? '👍' : '○' });
    }
  };
  const toggleDislike = (e) => {
    e.stopPropagation();
    if (window.Ratings) {
      const cur = window.Ratings.get && window.Ratings.get(pill.id);
      const curStars = typeof cur === 'number' ? cur : (cur && cur.stars) || 0;
      const next = curStars === 1 ? 0 : 1;
      window.Ratings.set(pill.id, next);
      if (window.Toast) window.Toast.info(next ? '👎 No me gusta' : 'Valoración eliminada', { icon: next ? '👎' : '○' });
    }
  };

  const isLocked = _isPillLockedDemo(pill, forceUnlocked);
  const demoActive = window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive();
  const isAssigned = pill && pill.progress > 0;
  const handleCardClick = () => {
    if (isLocked) {
      if (window.Toast) window.Toast.info('🔒 Pill bloqueada · te avisaremos cuando esté disponible');
      return;
    }
    onOpen(pill);
  };
  // En demo · pills bloqueadas se difuminan claramente (blur + saturación
  // baja + brillo bajo) para que se entienda "viene más adelante".
  const lockedCoverStyle = isLocked
    ? { filter:'grayscale(0.7) brightness(0.55) blur(2px)' }
    : undefined;
  const notifyLocked = (e) => {
    e.stopPropagation();
    if (window.Toast) window.Toast.success('Te avisaremos cuando esté disponible', { icon:'🔔' });
  };

  return (
    <article className={`card${isLocked ? ' is-locked' : ''}`} onClick={handleCardClick} data-screen-label={`Card · ${pill.pill}`} style={isLocked ? { cursor:'not-allowed', opacity:0.85 } : undefined}>
      <div className={`card-cover cat-${slug}`} style={isLocked ? { filter:'grayscale(0.6) brightness(0.6)' } : undefined}/>
      {pill.poster ? (
        <img
          src={pill.poster}
          alt=""
          style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover', ...(lockedCoverStyle || {})}}
          onError={e => { e.currentTarget.style.display='none'; }}
        />
      ) : pill.yt ? (
        <img
          src={`https://img.youtube.com/vi/${pill.yt}/hqdefault.jpg`}
          alt=""
          style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover', ...(lockedCoverStyle || {})}}
          onError={e => { e.currentTarget.style.display='none'; }}
        />
      ) : null}
      <div className="card-grad"/>

      <span className="card-pill-num">{String(cat.label).toUpperCase()}{!demoActive ? ` · ${pill.pill}` : ''}</span>
      {(newBadge || pill.newBadge) && !isLocked && <span className="card-badge">Nuevo</span>}
      {isLocked && (
        /* Card bloqueada · pill discreta arriba-derecha (sin candado central
           grande que rompa el look Netflix · per spec del cliente) */
        <span style={{
          position:'absolute', top:10, right:10, padding:'5px 11px',
          background:'rgba(15,23,42,0.85)', color:'#fff', borderRadius:999,
          fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:700,
          letterSpacing:'0.06em', display:'inline-flex', alignItems:'center', gap:5,
          backdropFilter:'blur(8px)',
        }}>🔒 Bloqueado</span>
      )}

      <div className="card-body">
        <h3 className="card-title">{pill.title}</h3>
        <div className="card-meta">
          {/* En demo · sólo nivel (sin duración · sin "·" separador) */}
          {!demoActive && !(window.DemoMode && window.DemoMode.flag('hide_durations') === true) && <>
            <span>{pill.duration}</span>
            <span className="sep">·</span>
          </>}
          <span>{demoActive && pill.level ? `Nivel ${pill.level}` : pill.level}</span>
        </div>
      </div>

      <div className="card-actions">
        {isLocked ? (
          /* Pill bloqueada · botón "Notifícame" (campana) */
          <button className="card-action primary" aria-label="Notifícame" title="Notifícame cuando esté disponible" onClick={notifyLocked} style={{background:'rgba(0,114,190,0.85)', color:'#fff'}}>
            <Ico name="bell" size={12}/>
          </button>
        ) : isAssigned || !demoActive ? (
          <button className="card-action primary" aria-label="Reproducir" title="Reproducir" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
            <Ico name="play" size={12}/>
          </button>
        ) : (
          <button className="card-action primary" aria-label="Inscribirse" title="Inscribirse" onClick={(e) => {
            e.stopPropagation();
            if (window.Toast) window.Toast.success('Te has inscrito al curso');
            onOpen(pill);
          }}>
            <Ico name="plus" size={12}/>
          </button>
        )}
        {/* Favorito · disponible incluso si bloqueada (per spec: "el botón
            guardar/marcar favorito se vea bien"); active state contrastado */}
        <button
          className={`card-action${saved ? ' is-active' : ''}`}
          aria-label={saved ? 'Quitar favorito' : 'Favorito'}
          title={saved ? 'Quitar favorito' : 'Favorito'}
          onClick={toggleSave}
          style={saved ? { background:'rgba(0,114,190,0.85)', color:'#fff', borderColor:'rgba(0,114,190,0.85)' } : undefined}>
          <Ico name={saved ? 'check' : 'bookmark'} size={14}/>
        </button>
        {/* Like · 5★ · activo en azul beonit */}
        <button
          className={`card-action${liked ? ' is-active' : ''}`}
          aria-label={liked ? 'Quitar Me gusta' : 'Me gusta'}
          title={liked ? 'Quitar Me gusta' : 'Me gusta'}
          onClick={toggleLike}
          style={liked ? { background:'rgba(0,114,190,0.85)', color:'#fff', borderColor:'rgba(0,114,190,0.85)' } : undefined}>
          <Ico name="thumb" size={13}/>
        </button>
        {/* Dislike · 1★ · activo en rojo beonit · rotación visual del thumb */}
        <button
          className={`card-action${disliked ? ' is-active' : ''}`}
          aria-label={disliked ? 'Quitar No me gusta' : 'No me gusta'}
          title={disliked ? 'Quitar No me gusta' : 'No me gusta'}
          onClick={toggleDislike}
          style={Object.assign({transform:'scaleY(-1)'}, disliked ? { background:'rgba(252,34,13,0.85)', color:'#fff', borderColor:'rgba(252,34,13,0.85)' } : {})}>
          <Ico name="thumb" size={13}/>
        </button>
        {!isLocked && (
          <button className="card-action" aria-label="Más info" title="Más información" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
            <Ico name="chev-down" size={14}/>
          </button>
        )}
        {!demoActive && (
          <span className="card-match">{Math.round(78 + ((parseInt(String(pill.id).replace(/\D/g, ''), 10) || 0) * 17) % 22)}% match</span>
        )}
      </div>

      {showProgress && pill.progress > 0 && (
        <div className="card-progress">
          <div className="fill" style={{ width: `${Math.round(pill.progress * 100)}%` }}/>
        </div>
      )}
    </article>
  );
}

function NxPathCard({ path, onOpen }) {
  const dm = window.DemoMode;
  const demoActive = dm && dm.isActive && dm.isActive();
  const lockEnabled = demoActive && dm.flag('lock_unassigned_courses') === true;
  // Path bloqueado en demo si: no asignado · sin progreso · no está en lista unlocked
  // El primer path por orden queda abierto para que se vea uno disponible.
  const unlockedList = (dm && dm.unlocked) ? dm.unlocked() : [];
  const isUnlockedById = Array.isArray(unlockedList) && unlockedList.indexOf(path.id) !== -1;
  const seed = parseInt(String(path.id || '').replace(/\D/g, ''), 10) || 0;
  const isLocked = lockEnabled && !(path.progress > 0) && !isUnlockedById && (seed % 3) !== 0;

  // Nivel inventado por hash del id (Básico / Intermedio / Experto) en demo
  const levels = (dm && dm.flag('level_badges')) || ['Básico','Intermedio','Experto'];
  const level = demoActive ? levels[seed % levels.length] : null;

  // Etiqueta del badge: "CURSO · X pills" o "RUTA · X pills"
  const pathLabel = (dm && dm.label) ? dm.label('path_label', 'Ruta') : 'Ruta';
  const pathBadge = `${String(pathLabel).toUpperCase()} · ${path.pills} pills`;

  const handleClick = () => {
    if (isLocked) {
      if (window.Toast) window.Toast.info('🔒 Curso bloqueado · disponible próximamente');
      return;
    }
    onOpen && onOpen(path);
  };

  // Color del badge "Nivel X" · usa accentHex del manual beonit si lo trae,
  // si no el azul por defecto.
  const _badgeColor = path.accentHex || '#0072BE';

  return (
    <article className={`card card-path${isLocked ? ' is-locked' : ''}`} onClick={handleClick} style={isLocked ? { cursor:'not-allowed' } : undefined}>
      {/* Cover · posterUrl de Storage si existe; si no, SVG placeholder
          generado con accentHex + título + level + watermark BEONIT. */}
      <img
        src={path.posterUrl || (window.coursePosterSVG && window.coursePosterSVG(path.title, path.accentHex, level))}
        alt={path.title || ''} loading="lazy"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
                 filter: isLocked ? 'grayscale(0.6) brightness(0.55)' : 'none' }}
        onError={e => { e.currentTarget.style.display='none'; }}/>
      <div className="card-grad"/>
      <span className="card-pill-num">{pathBadge}</span>
      {isLocked && (
        <span style={{
          position:'absolute', top:10, right:10, padding:'4px 10px',
          background:'rgba(0,0,0,0.72)', color:'#fff', borderRadius:999,
          fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:700,
          letterSpacing:'0.06em',
        }}>🔒 Bloqueado</span>
      )}
      {level && !isLocked && (
        <span style={{
          position:'absolute', top:10, right:10, padding:'4px 10px',
          background:_badgeColor, color:'#fff', borderRadius:999,
          fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:700,
          letterSpacing:'0.06em',
        }}>Nivel {level}</span>
      )}
      <div className="card-body" style={{ left: 16, right: 16 }}>
        <h3 className="card-title" style={{ fontSize: 17, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          {path.title}
        </h3>
        <div className="card-meta">
          {/* Descripción: competencia · nivel · # pills · director del programa
              (per spec del cliente). El director se setea en workspace.settings.
              program_director y se hereda automáticamente a todos los paths. */}
          {(() => {
            const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
            const director = (ws.settings && ws.settings.program_director) || null;
            const pills = path.totalCount || path.pills || 0;
            const parts = [];
            if (path.badge) parts.push(path.badge);
            if (level) parts.push('Nivel ' + level);
            if (pills) parts.push(pills + ' pills');
            if (director) parts.push('Dirige: ' + director);
            return parts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="sep">·</span>}
                <span>{part}</span>
              </React.Fragment>
            ));
          })()}
        </div>
      </div>
    </article>
  );
}

function NxRow({ row, onOpen, onOpenPath, onSeeAll }) {
  const railRef = React.useRef(null);
  const D = window.SGS_DATA;

  const scroll = (dir) => {
    const el = railRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (row.isPaths) {
    let paths = (D && D.LEARNING_PATHS) || [];
    if (paths.length === 0) return null;
    // Recomendación por rol · scoring simple. Solo si el row pidió ranking
    // ("_recommended": true en el adapter) reordenamos. Sino preservamos
    // el orden de inserción del backend.
    if (row._recommended) {
      const user = (D && D.USER) || {};
      const role = String(user.role || '').toLowerCase();
      const team = String(user.team || '').toLowerCase();
      // length >= 2 · roles/equipos de 2 letras (IT, UX, PM, QA, RH, BI) son
      // comunes y deben puntuar. Filtramos solo tokens de 1 char (ruido).
      const tokens = (role + ' ' + team).split(/[\s,·\-/]+/).filter(t => t.length >= 2);
      const Bm = window.Bookmarks;
      // Cache de bookmarks · una sola lectura de localStorage por scoring pass
      // (Bookmarks.has hace JSON.parse en cada llamada · evitamos N parses).
      const _bmSet = Bm && Bm.get ? new Set(Bm.get()) : null;
      const scoreOf = (p) => {
        let s = 0;
        const hay = String((p.badge || '') + ' ' + (p.desc || '') + ' ' + (p.title || '')).toLowerCase();
        if (tokens.some(tok => hay.indexOf(tok) !== -1)) s += 3;
        if (p.progress > 0 && p.progress < 1) s += 2;
        if (_bmSet && _bmSet.has(p.id)) s += 1;
        return s;
      };
      paths = paths.slice().map((p, i) => ({ p, i, s: scoreOf(p) }))
                   .sort((a, b) => (b.s - a.s) || (a.i - b.i))
                   .map(x => x.p);
    }
    return (
      <section className="row" data-screen-label={`Row · ${row.key}`}>
        <header className="row-header">
          <h2 className="row-title">{row.title}</h2>
          {row.sub ? <span className="row-sub">— {row.sub}</span> : null}
          <button className="row-explore" onClick={() => onOpenPath && onOpenPath()}>Explorar todas <Ico name="chev-right" size={12}/></button>
        </header>
        <div className="rail no-scrollbar" ref={railRef}>
          <div className="rail-track">
            {paths.map(p => <NxPathCard key={p.id} path={p} onOpen={() => onOpenPath && onOpenPath(p)}/>)}
          </div>
        </div>
        <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
        <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
      </section>
    );
  }

  const pillById = (id) => (D && D.pillById && D.pillById(id)) || null;

  if (row.trending) {
    return (
      <section className="row row-trending" data-screen-label={`Row · ${row.key}`}>
        <header className="row-header">
          <h2 className="row-title">{row.title}</h2>
          {row.sub ? <span className="row-sub">— {row.sub}</span> : null}
          <button className="row-explore" onClick={() => onSeeAll && onSeeAll(row)}>Ranking completo <Ico name="chev-right" size={12}/></button>
        </header>
        <div className="rail no-scrollbar" ref={railRef}>
          <div className="rail-track">
            {row.pillIds.map((id, i) => {
              const p = pillById(id);
              if (!p) return null;
              return (
                <div className="trending-cell" key={id}>
                  <span className="trending-num">{String(i+1).padStart(2,'0')}</span>
                  <NxCard pill={p} onOpen={onOpen} forceUnlocked={true}/>
                </div>
              );
            })}
          </div>
        </div>
        <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
        <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
      </section>
    );
  }

  return (
    <section className="row" data-screen-label={`Row · ${row.key}`}>
      <header className="row-header">
        <h2 className="row-title">{row.title}</h2>
        {row.sub ? <span className="row-sub">— {row.sub}</span> : null}
        <button className="row-explore" onClick={() => onSeeAll && onSeeAll(row)}>Ver todo <Ico name="chev-right" size={12}/></button>
      </header>
      <div className="rail no-scrollbar" ref={railRef}>
        <div className="rail-track">
          {row.pillIds.map(id => {
            const p = pillById(id);
            if (!p) return null;
            return <NxCard key={id} pill={p} onOpen={onOpen} showProgress={row.showProgress} newBadge={row.newRow}/>;
          })}
        </div>
      </div>
      <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
      <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
    </section>
  );
}

// ── OnboardingWizard · tour de 4 pasos la primera vez que entra el user ───
// Visible solo si:
//   · existe sesión y D.USER.id
//   · localStorage no marca al user como "onboarded"
//   · el user no es admin (admins no necesitan tour)
// Persiste el flag por user (no por workspace) para que no se repita al
// cambiar de tenant. Pasos:
//   1 · Bienvenida personalizada con workspace name
//   2 · Catálogo (donde están los cursos)
//   3 · Mi Lista (sigue formándote)
//   4 · Test autodiagnóstico (si workspace lo tiene) o cierre
function OnboardingWizard({ setView }) {
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
  const autoUrl = (ws.settings && ws.settings.autotest_url) || null;
  const _storeKey = 'solid-onboarded:' + (USER.id || 'anon');
  const [step, setStep] = useState(0);
  const [hidden, setHidden] = useState(() => {
    try {
      if (USER.isAdmin) return true;
      if (!USER.id) return true;
      return localStorage.getItem(_storeKey) === '1';
    } catch (e) { return false; }
  });
  if (hidden) return null;

  const dismiss = () => {
    try { localStorage.setItem(_storeKey, '1'); } catch (e) {}
    setHidden(true);
  };
  const firstName = (USER.name || '').split(/\s+/)[0] || 'hola';
  const wsName = (ws.name || '').replace(/\s+demo\s*$/i, '').trim() || 'tu plataforma';

  const steps = [
    {
      icon: '👋',
      title: `¡Hola, ${firstName}!`,
      body: `Bienvenido a ${wsName}. En 30 segundos te enseñamos cómo aprovecharlo al máximo.`,
      cta: 'Empezar tour',
    },
    {
      icon: '📚',
      title: 'Catálogo',
      body: 'Aquí encuentras todos los cursos disponibles para ti. Filtra por marca, categoría o busca por nombre.',
      cta: 'Siguiente',
      action: () => setView && setView('rutas'),
    },
    {
      icon: '✓',
      title: 'Mi Lista',
      body: 'Tus cursos inscritos, en progreso y favoritos viven aquí. Es tu zona personal de aprendizaje.',
      cta: 'Siguiente',
      action: () => setView && setView('path'),
    },
    autoUrl ? {
      icon: '🧭',
      title: 'Test autodiagnóstico',
      body: '¿No sabes por dónde empezar? Haz el test (15 min) y te recomendamos el itinerario que mejor encaja contigo.',
      cta: 'Hacer test ahora',
      action: () => { window.open(autoUrl, '_blank', 'noopener'); },
      altCta: 'Hacerlo después',
    } : {
      icon: '🚀',
      title: 'Listo para empezar',
      body: 'Explora el catálogo y empieza por el curso que más te llame la atención. Si tienes dudas, tu admin puede ayudarte.',
      cta: 'Ver catálogo',
      action: () => setView && setView('rutas'),
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;
  const next = () => {
    if (s.action) s.action();
    if (isLast) dismiss();
    else setStep(step + 1);
  };

  return (
    <div onClick={dismiss} style={{
      position:'fixed', inset:0, background:'rgba(13,17,23,0.72)',
      backdropFilter:'blur(6px)', zIndex: 700,
      display:'flex', alignItems:'center', justifyContent:'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 16,
        boxShadow:'0 30px 80px rgba(0,0,0,0.45)',
        width:'min(460px, 100%)', padding:'32px 28px 24px', textAlign:'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 18, lineHeight: 1 }}>{s.icon}</div>
        <h2 style={{
          margin:'0 0 10px', fontSize: 22, fontWeight: 800, color:'var(--fg)',
          fontFamily:'var(--font-sans)', letterSpacing:'-0.01em',
        }}>{s.title}</h2>
        <p style={{
          margin:'0 0 26px', fontSize: 14, color:'var(--fg-muted)', lineHeight: 1.55,
        }}>{s.body}</p>
        {/* Step dots */}
        <div style={{ display:'flex', gap: 6, justifyContent:'center', marginBottom: 22 }}>
          {steps.map((_, i) => (
            <span key={i} style={{
              width: i === step ? 22 : 7, height: 7, borderRadius: 4,
              background: i === step ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
              transition:'all .2s',
            }}/>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          <button onClick={next} style={{
            padding:'12px 20px', background:'var(--accent)', color:'#fff', border:'none',
            borderRadius: 10, cursor:'pointer', fontFamily:'var(--font-sans)',
            fontWeight: 700, fontSize: 14,
          }}>{s.cta}</button>
          <button onClick={s.altCta ? () => { if (isLast) dismiss(); else setStep(step + 1); } : dismiss} style={{
            padding:'9px 16px', background:'transparent', color:'var(--fg-muted)',
            border:'none', cursor:'pointer', fontFamily:'var(--font-sans)',
            fontWeight: 500, fontSize: 12.5,
          }}>{s.altCta || (isLast ? 'Cerrar' : 'Saltar tour')}</button>
        </div>
      </div>
    </div>
  );
}
window.OnboardingWizard = OnboardingWizard;

function Home({ openDetail, openPlayer, setView, openPath }) {
  const [, force] = useState(0);
  useEffect(() => {
    const refresh = () => force(x => x + 1);
    window.addEventListener('sgs-data-ready', refresh);
    return () => window.removeEventListener('sgs-data-ready', refresh);
  }, []);

  const D = window.SGS_DATA;
  if (!D || !D.ROWS) {
    return (
      <div style={{padding:'120px 64px', color:'var(--fg-muted, #A8A6A0)', fontFamily:'var(--font-sans, Inter)', textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--fg-dim, #6F6D67)', marginBottom:12}}>SolidStream · cargando data del catálogo</div>
        <div style={{fontSize:14}}>
          {(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive())
            ? 'Preparando tus cursos…'
            : 'Preparando Think Pills…'}
        </div>
      </div>
    );
  }

  const onOpenPath = (p) => { if (p && p.id && openPath) openPath(p.id); else setView('rutas'); };
  const onSeeAll = () => setView('browse');

  const demoActive = window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive();

  // Welcome message customizable por workspace via settings.welcome_message.
  // Si no está seteado, fallback genérico personalizado con el nombre del user.
  // Dismissible via localStorage por (user+workspace) para que no salga
  // siempre · se vuelve a mostrar si el admin actualiza el mensaje.
  const _wsObj    = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || null;
  const _wsSettings = (_wsObj && _wsObj.settings) || {};
  const _welcomeMsg = _wsSettings.welcome_message || null;
  const _userName   = (D.USER && D.USER.name) ? String(D.USER.name).split(/\s+/)[0] : null;
  const _wsName     = (_wsObj && _wsObj.name) ? String(_wsObj.name).replace(/\s+demo\s*$/i, '').trim() : null;
  const _dismissKey = 'solid-welcome-dismissed:' + ((D.USER && D.USER.id) || 'anon') + ':' + ((_wsObj && _wsObj.id) || 'no-ws') + ':' + (_welcomeMsg ? _welcomeMsg.length : 0);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    try { return !!localStorage.getItem(_dismissKey); } catch (e) { return false; }
  });
  const dismissWelcome = () => {
    try { localStorage.setItem(_dismissKey, '1'); } catch (e) {}
    setWelcomeDismissed(true);
  };
  const showWelcome = !welcomeDismissed && (_welcomeMsg || demoActive);
  const welcomeText = _welcomeMsg ||
    (_userName && _wsName ? `Bienvenido a ${_wsName}, ${_userName}. Aquí encontrarás formación pensada para ti.`
     : _userName ? `Bienvenido, ${_userName}.`
     : 'Bienvenido a tu plataforma de formación.');

  return (
    <div data-screen-label="Home">
      <OnboardingWizard setView={setView}/>
      <HomeHero onPlay={(p) => openPlayer(p)} onMore={(p) => openDetail(p)}/>
      <div className="rows">
        {showWelcome && (
          <section style={{
            margin:'-32px var(--row-pad, 48px) 32px',
            padding:'18px 22px', borderRadius:14,
            background:'linear-gradient(135deg, rgba(0,114,190,0.16), rgba(252,34,13,0.06))',
            border:'1px solid rgba(255,255,255,0.10)',
            backdropFilter:'blur(12px)',
            position:'relative', zIndex:5,
            display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
          }}>
            <div style={{ flex:1, minWidth:260 }}>
              <div style={{ fontFamily:'var(--font-mono, monospace)', fontSize:10, letterSpacing:'0.12em',
                color:'var(--accent-2, #FC220D)', fontWeight:800, textTransform:'uppercase', marginBottom:6 }}>
                Bienvenido
              </div>
              <div style={{ fontSize:15.5, lineHeight:1.45, color:'var(--fg)' }}>
                {welcomeText}
              </div>
            </div>
            <button onClick={dismissWelcome} aria-label="Cerrar bienvenida" style={{
              padding:'7px 12px', background:'transparent', color:'var(--fg-muted)',
              border:'1px solid var(--line)', borderRadius:8, cursor:'pointer',
              fontFamily:'var(--font-sans)', fontWeight:600, fontSize:12,
            }}>Entendido</button>
          </section>
        )}
        {D.ROWS.map(row => (
          <NxRow key={row.key} row={row} onOpen={openDetail} onOpenPath={onOpenPath} onSeeAll={onSeeAll}/>
        ))}
        {/* WorkshopsCTA · ocultado en demo a petición del cliente */}
      </div>
      <footer className="footer-strip">
        <div className="cobranding">
          <span><b>SolidStream</b></span>
          <span>·</span>
          <span>by BeonIt</span>
          <span>·</span>
          <span>{window.WORKSPACE_NAME || 'Plataforma de formación'}</span>
          {(() => {
            const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
            const legalUrl = (ws.settings && ws.settings.legal_url) || null;
            if (!legalUrl) return null;
            return (
              <>
                <span>·</span>
                <a href={legalUrl} target="_blank" rel="noopener noreferrer" style={{
                  color:'var(--fg-muted)', textDecoration:'underline',
                }}>Bases legales</a>
              </>
            );
          })()}
        </div>
        <div>v 2.0 · MAY 2026</div>
      </footer>
    </div>
  );
}

// ── WorkshopsCTASection · CTA simple "Inscríbete a talleres" (solo demo) ──
// Spec: próximo · fecha · hora · botón recordatorio. Sin lógica real:
// muestra 3 talleres mock con "Crear recordatorio" → toast. Talleres
// reales vivirían en una tabla workshops scopeada por workspace; por ahora
// el contenido es estático y enfocado a la demo comercial.
function WorkshopsCTASection() {
  const _dm = window.DemoMode;
  const title = (_dm && _dm.label) ? _dm.label('workshops_label', 'Inscríbete a talleres') : 'Inscríbete a talleres';

  // Próximos talleres · fechas relativas al "hoy" para que siempre se vean futuros
  const today = new Date();
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' });
  };
  const workshops = [
    { id:'w1', title:'Storytelling con datos para presentaciones',  date: addDays(3),  time:'10:00 – 11:30', host:'María López' },
    { id:'w2', title:'Reuniones eficaces: facilitación práctica',   date: addDays(8),  time:'16:00 – 17:00', host:'Carlos Vidal' },
    { id:'w3', title:'Gestión del tiempo · time blocking en equipo', date: addDays(15), time:'09:30 – 11:00', host:'Ana Ferrer' },
  ];

  const setReminder = (w) => {
    if (window.Toast) window.Toast.success(`Recordatorio creado · ${w.title}`, { icon:'⏰' });
  };

  return (
    <section className="row" data-screen-label="Workshops CTA" style={{paddingBottom: 24}}>
      <header className="row-header">
        <h2 className="row-title">{title}</h2>
        <span className="row-sub">— sesiones en directo · plazas limitadas</span>
      </header>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap: 14,
        padding:'0 var(--row-pad, 48px)',
      }}>
        {workshops.map(w => (
          <article key={w.id} style={{
            padding:18, background:'var(--bg-surface)', border:'1px solid var(--line)',
            borderRadius:14, display:'flex', flexDirection:'column', gap:10,
          }}>
            <div style={{fontFamily:'var(--font-mono, monospace)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700}}>
              {w.date} · {w.time}
            </div>
            <h3 style={{margin:0, fontSize:15.5, fontWeight:700, color:'var(--fg)', lineHeight:1.3}}>{w.title}</h3>
            <div style={{fontSize:12, color:'var(--fg-muted)'}}>Facilita {w.host}</div>
            <button onClick={() => setReminder(w)} style={{
              marginTop:'auto', padding:'10px 14px', background:'var(--accent)', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'var(--font-sans)', fontWeight:700, fontSize:13,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              ⏰ Crear recordatorio
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
window.WorkshopsCTASection = WorkshopsCTASection;

window.TopNav = TopNav;
window.HomeHero = HomeHero;
window.NxCard = NxCard;
window.NxPathCard = NxPathCard;
window.NxRow = NxRow;
window.Home = Home;

// ── CineRow · fila horizontal scrolleable (legacy, usado por otras vistas) ──
function CineRow({ title, emTitle, children, onSeeAll, extraClass }) {
  const scrollRef = React.useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = React.useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current; if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scroll = (dir) => {
    const el = scrollRef.current; if (!el) return;
    const amt = Math.max(320, el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amt, behavior: 'smooth' });
  };

  return (
    <section className={`cine-row ${extraClass || ''}`}>
      <div className="row-head">
        <h2>{title}{emTitle && <> <em>{emTitle}</em></>}</h2>
        {onSeeAll && <button className="link-btn" onClick={onSeeAll}>Ver todo →</button>}
      </div>
      <div className="cine-row-wrap">
        {canL && (
          <button className="cine-arrow cine-arrow-l" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        <div className="cine-row-scroll" ref={scrollRef}>
          {children}
        </div>
        {canR && (
          <button className="cine-arrow cine-arrow-r" onClick={() => scroll(1)} aria-label="Siguiente">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        )}
      </div>
    </section>
  );
}

window.CineRow = CineRow;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
