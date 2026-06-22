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
// portadas inline en SVG con paleta editorial variada (8 duotonos curados)
// + patrón de puntos + decoración geométrica. Cada pill/curso recibe un
// color determinista (hash del título → índice de paleta) así que dos
// pills distintas se ven distintas pero la misma pill siempre igual.
//
// Strings construidos con concat (no template literals anidados) para
// evitar problemas con babel-standalone en el navegador.
function _svgEscape(s) {
  s = String(s == null ? '' : s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 8 duotonos FRÍOS · paleta Udacity Midnight (azul · navy · aqua) · handoff
// de Claude Design §4. Cada poster recibe "a" (top-left, vibrante), "b"
// (bottom-right, navy profundo) + "ink" (tinte claro frío para chips/deco).
var _POSTER_PALETTES = [
  { a:'#006241', b:'#050E09', ink:'#AECBF2' },  // cobalt · navy (signature)
  { a:'#5BB8FF', b:'#133A86', ink:'#D6E4FA' },  // sky · royal
  { a:'#2FE0B5', b:'#082A2E', ink:'#CFF7EC' },  // aqua · deep
  { a:'#AECBF2', b:'#1B225C', ink:'#E6EFFB' },  // ice · indigo
  { a:'#8E7BF0', b:'#11142E', ink:'#E0DAFB' },  // violet · midnight
  { a:'#1E86F0', b:'#0C1B3A', ink:'#CDE5FB' },  // azure · slate
  { a:'#6FE0C0', b:'#0C2A24', ink:'#DBF7EE' },  // mint · forest
  { a:'#9DB0F5', b:'#050E09', ink:'#E3E9FB' },  // peri · navy
];
function _hashIdx(s, mod) {
  s = String(s || '');
  var h = 5381;
  for (var i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

// Workspace name dinámico para el footer · evita "BEONIT × HIJOS DE RIVERA"
// hardcoded que era incorrecto en cualquier otro tenant.
function _wsLabel() {
  if (typeof window === 'undefined') return 'SOLIDSTREAM';
  var n = (window.WORKSPACE_NAME || '').toString().trim();
  return (n ? n : 'SolidStream').toUpperCase();
}

function _coursePosterSVG(title, accentHex, level) {
  var t = _svgEscape(title || 'Curso');
  var lvl = _svgEscape(String(level || '').toUpperCase());
  var pal = _POSTER_PALETTES[_hashIdx(title, _POSTER_PALETTES.length)];
  var a = pal.a, b = pal.b, ink = pal.ink;
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  // Title wrap · hasta 22 chars/línea, máx 2 líneas
  var line1 = t.length > 22 ? t.slice(0, 22) : t;
  var line2 = t.length > 22 ? t.slice(22, 44) : '';
  var titleEls =
    '<tspan x="48" dy="0">' + line1 + '</tspan>' +
    (line2 ? '<tspan x="48" dy="58">' + line2 + '</tspan>' : '');
  var ws = _svgEscape(_wsLabel());
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">' +
      '<defs>' +
        '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + a + '" stop-opacity="1"/>' +
          '<stop offset="100%" stop-color="' + b + '" stop-opacity="1"/>' +
        '</linearGradient>' +
        '<pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">' +
          '<circle cx="16" cy="16" r="1.6" fill="#FFFFFF" fill-opacity="0.10"/>' +
        '</pattern>' +
      '</defs>' +
      '<rect width="600" height="800" fill="url(#g)"/>' +
      '<rect width="600" height="800" fill="url(#dots)"/>' +
      // Decoración geométrica · círculo grande top-right, levemente fuera
      '<circle cx="540" cy="160" r="180" fill="#FFFFFF" fill-opacity="0.06"/>' +
      '<circle cx="540" cy="160" r="110" fill="#FFFFFF" fill-opacity="0.05"/>' +
      '<circle cx="540" cy="160" r="50"  fill="' + ink + '" fill-opacity="0.85"/>' +
      // Level chip top-left
      (lvl ? '<rect x="40" y="48" width="' + Math.max(80, lvl.length * 9 + 24) + '" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.15"/>' +
             '<text x="' + (40 + (Math.max(80, lvl.length * 9 + 24) / 2)) + '" y="66" text-anchor="middle" fill="#FFFFFF" font-family="' + ff + '" font-size="11" font-weight="800" letter-spacing="2.5">' + lvl + '</text>' : '') +
      // Tagline pequeño · CURSO
      '<text x="48" y="556" fill="' + ink + '" fill-opacity="0.85" font-family="' + ff + '" font-size="11" font-weight="800" letter-spacing="4">CURSO</text>' +
      // Title bottom
      '<text x="48" y="610" fill="#FFFFFF" font-family="' + ff + '" font-size="48" font-weight="800" letter-spacing="-1.2">' + titleEls + '</text>' +
      // Línea decorativa
      '<rect x="48" y="' + (line2 ? 700 : 642) + '" width="64" height="3" fill="' + ink + '" fill-opacity="0.9"/>' +
      // Footer · workspace dinámico
      '<text x="48" y="760" fill="#FFFFFF" font-family="' + ff + '" font-size="10" font-weight="700" letter-spacing="3" opacity="0.65">' + ws + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
if (typeof window !== 'undefined') window.coursePosterSVG = _coursePosterSVG;

function _pillPosterSVG(title, accentHex) {
  var t = _svgEscape(title || 'Pill');
  var pal = _POSTER_PALETTES[_hashIdx(title, _POSTER_PALETTES.length)];
  var a = pal.a, b = pal.b, ink = pal.ink;
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  // Title wrap para pills: 16:9 → hasta 28 chars/línea, máx 2 líneas
  var line1 = t.length > 28 ? t.slice(0, 28) : t;
  var line2 = t.length > 28 ? t.slice(28, 56) : '';
  var titleEls =
    '<tspan x="32" dy="0">' + line1 + '</tspan>' +
    (line2 ? '<tspan x="32" dy="36">' + line2 + '</tspan>' : '');
  var ws = _svgEscape(_wsLabel());
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 338">' +
      '<defs>' +
        '<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + a + '" stop-opacity="1"/>' +
          '<stop offset="100%" stop-color="' + b + '" stop-opacity="1"/>' +
        '</linearGradient>' +
        '<pattern id="dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">' +
          '<circle cx="14" cy="14" r="1.4" fill="#FFFFFF" fill-opacity="0.10"/>' +
        '</pattern>' +
      '</defs>' +
      '<rect width="600" height="338" fill="url(#g2)"/>' +
      '<rect width="600" height="338" fill="url(#dots2)"/>' +
      // Decoración · círculos top-right
      '<circle cx="520" cy="60"  r="110" fill="#FFFFFF" fill-opacity="0.06"/>' +
      '<circle cx="520" cy="60"  r="70"  fill="#FFFFFF" fill-opacity="0.05"/>' +
      '<circle cx="520" cy="60"  r="32"  fill="' + ink + '" fill-opacity="0.85"/>' +
      // Tagline
      '<text x="32" y="200" fill="' + ink + '" fill-opacity="0.85" font-family="' + ff + '" font-size="10" font-weight="800" letter-spacing="3.5">PILL</text>' +
      // Title bottom
      '<text x="32" y="240" fill="#FFFFFF" font-family="' + ff + '" font-size="30" font-weight="800" letter-spacing="-0.6">' + titleEls + '</text>' +
      // Línea decorativa
      '<rect x="32" y="' + (line2 ? 290 : 262) + '" width="46" height="2.5" fill="' + ink + '" fill-opacity="0.9"/>' +
      // Footer
      '<text x="32" y="320" fill="#FFFFFF" font-family="' + ff + '" font-size="9" font-weight="700" letter-spacing="3" opacity="0.65">' + ws + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
if (typeof window !== 'undefined') window.pillPosterSVG = _pillPosterSVG;

function _certificateSVG(title, userName, accentHex, certNumber, dateStr, verifyUrl) {
  var t = _svgEscape(title || 'Curso');
  var u = _svgEscape(userName || 'Alumno');
  var a = accentHex || '#0072BE';
  var n = _svgEscape(certNumber || 'CERT-2026-0001');
  var d = _svgEscape(dateStr || new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }));
  var ff = 'Avenir Next, Helvetica, Arial, sans-serif';
  var serif = 'Georgia, serif';

  // QR de verificación · si la URL viene y qrcode-generator cargó, embebemos
  // los <rect>s como un grupo escalado. Si no hay verifyUrl o falla la CDN,
  // el cert se renderiza sin QR (no rompe).
  var qrBlock = '';
  if (verifyUrl && typeof window !== 'undefined' && window.generateQRRects) {
    var rects = window.generateQRRects(verifyUrl, 140);   // 140px en coords nativas del QR
    if (rects) {
      // Lo posicionamos abajo-derecha · 140x140 px en una caja blanca con
      // borde fino del accent. Coordenadas dentro del viewBox 1240x900:
      //   esquina top-left del QR: (1020, 640) · espacio bajo el círculo sello.
      qrBlock =
        '<rect x="1014" y="634" width="152" height="152" fill="#FFFFFF" stroke="' + a + '" stroke-width="1.5"/>' +
        '<g transform="translate(1020 640)">' + rects + '</g>' +
        '<text x="1090" y="804" text-anchor="middle" fill="#6F6F6F" font-family="' + ff + '" font-size="9" letter-spacing="1.5">VERIFICA EN L&#205;NEA</text>';
    }
  }

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
      '<text x="160" y="772" fill="#3D3D3D" font-family="' + ff + '" font-size="11" letter-spacing="2">' + n + '</text>' +
      '<text x="160" y="790" fill="#6F6F6F" font-family="' + ff + '" font-size="11" letter-spacing="1">' + d + '</text>' +
      qrBlock +
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
  // Tema · light/dark/auto · toggle visible en el menú del avatar (b124).
  const [theme, setThemeState] = useState(() => (window.Settings && window.Settings.get && window.Settings.get().theme) || 'light');
  const setTheme = (t) => { setThemeState(t); if (window.Settings && window.Settings.update) window.Settings.update({ theme: t }); };
  // Sync si el tema cambia desde otro sitio (Ajustes) · evita activo desfasado.
  useEffect(() => {
    const r = () => { try { setThemeState((window.Settings.get().theme) || 'light'); } catch(e) {} };
    window.addEventListener('settings-changed', r);
    return () => window.removeEventListener('settings-changed', r);
  }, []);
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
    { k:'profile',     label:T('nav.profile'),  icon:'user' },
    { k:'saved',       label:T('nav.saved'),    icon:'bookmark' },
    { k:'wa',          label:T('nav.wa'),       icon:'broadcast' },
    { k:'inbox',       label:T('nav.inbox'),    icon:'inbox', badge: inboxCount },
    { k:'settings',    label:T('nav.settings'), icon:'gear' },
  ];
  if (!isSimplified && canManager) menuItems.push({ k:'manager', label: T('nav.manager','Mi equipo'), icon:'users' });
  // (b139) · cliente: "los ajustes de admin no salen en demo · añádelos
  // para la visión solo de los admins". El item Admin se muestra siempre
  // que el user tenga permiso · INDEPENDIENTE de simplified_avatar_menu.
  // Sin esta línea · un admin entrando en URL demo perdía acceso al panel
  // (workspaces, pills, users, settings · todo lo que hace cambios).
  if (canAdmin)                    menuItems.push({ k:'admin',   label: T('nav.admin'),               icon:'shield' });

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

            {/* Toggle de tema · claro / oscuro / auto · oculto en demo (que
                fuerza su propio tema). Visible y a un clic · antes solo estaba
                enterrado en Ajustes. */}
            {!(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive()) && (
              <div style={{ padding:'8px 14px 10px' }}>
                <div style={{ fontSize:10, fontFamily:'var(--font-mono, monospace)', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(245,244,241,0.5)', marginBottom:8 }}>Apariencia</div>
                <div style={{ display:'flex', gap:4, padding:4, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9 }}>
                  {[
                    { id:'light', label:'Claro', icon:'☀' },
                    { id:'dark',  label:'Oscuro', icon:'☾' },
                    { id:'auto',  label:'Auto', icon:'◐' },
                  ].map(opt => {
                    const on = theme === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setTheme(opt.id)} style={{
                        flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5,
                        padding:'7px 6px', borderRadius:6, border:'none', cursor:'pointer',
                        fontFamily:'var(--font-sans, Inter)', fontSize:11.5, fontWeight:600,
                        background: on ? 'var(--accent, #006241)' : 'transparent',
                        color: on ? '#fff' : 'rgba(245,244,241,0.65)',
                        boxShadow: on ? '0 2px 8px rgba(0, 98, 65,0.30)' : 'none',
                        transition:'all .15s',
                      }}>
                        <span style={{ fontSize:13 }}>{opt.icon}</span>{opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

// (b138) · Logo del workspace editable inline desde el hero. Si el user es
// admin u owner del workspace activo · al hacer click abre un file picker,
// sube a Storage vía Workspaces.uploadLogo() y dispara workspace-branding-
// changed para que todas las cabeceras se refresquen sin recargar.
// El user no-admin solo ve el logo · sin badge ni cursor pointer.
function WorkspaceLogoHero({ src, alt }) {
  const fileRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  // (b141) · cliente reportó "sigue sin poder subir la foto de Hijos de
  // Rivera" · el check anterior exigía role 'owner'/'admin' del workspace
  // específico · si el user es platform admin pero NO miembro explícito de
  // ese ws, fallaba. Ahora · cualquier user con permiso admin.viewPanel
  // (Auth.can) puede subir el logo · captura el caso platform admin que
  // gestiona varios tenants sin ser owner formal de cada uno.
  const role = (window.Workspaces && window.Workspaces.currentRole && window.Workspaces.currentRole()) || null;
  const canByRole = role === 'owner' || role === 'admin';
  const canByAuth = !!(window.Auth && window.Auth.can && window.Auth.can('admin.viewPanel'));
  const canEdit = canByRole || canByAuth;

  const onClick = (e) => {
    if (!canEdit || uploading) return;
    e.stopPropagation();
    fileRef.current && fileRef.current.click();
  };

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      if (window.Toast) window.Toast.error('El logo no puede pesar más de 5MB · comprime la imagen');
      return;
    }
    const wsId = window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId();
    if (!wsId) {
      if (window.Toast) window.Toast.error('Selecciona un workspace primero');
      return;
    }
    setUploading(true);
    // (b143) Safety net · libera el spinner en 10s aunque uploadLogo nunca
    // resuelva (defensa en profundidad · uploadLogo ya tiene timeout 6+4s).
    const _safetyTimer = setTimeout(() => {
      console.warn('[hero-logo] safety timeout · libero spinner');
      setUploading(false);
    }, 10000);
    try {
      const url = await Promise.race([
        Promise.resolve(window.Workspaces.uploadLogo(wsId, f)),
        new Promise((_, reject) => setTimeout(
          () => reject(new Error('upload total timeout 9s')), 9000
        )),
      ]);
      if (url) {
        window.WORKSPACE_LOGO_URL = url;
        try { window.dispatchEvent(new Event('workspace-branding-changed')); } catch(_) {}
        if (window.Toast) window.Toast.success('Logo actualizado');
      } else {
        if (window.Toast) window.Toast.error('No se pudo guardar el logo · revisa la consola para detalles');
      }
    } catch (err) {
      console.error('[hero-logo] upload exception:', err);
      // Último recurso · convertimos el file a dataURL aquí mismo y lo
      // guardamos en localStorage · el cliente al menos ve SU logo. Que
      // es lo que pidió. Si el backend falla · que falle, pero la UI
      // tiene que mostrar el cambio.
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(f);
        });
        try { localStorage.setItem('solid:ws-logo:' + wsId, dataUrl); } catch(_) {}
        window.WORKSPACE_LOGO_URL = dataUrl;
        try { window.dispatchEvent(new Event('workspace-branding-changed')); } catch(_) {}
        if (window.Toast) window.Toast.success('Logo guardado localmente · backend tardó demasiado');
      } catch (e2) {
        if (window.Toast) window.Toast.error('Error al subir el logo: ' + (err && err.message || 'error desconocido'));
      }
    } finally {
      clearTimeout(_safetyTimer);
      setUploading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      title={canEdit ? 'Click para cambiar el logo de tu empresa (admin)' : ''}
      style={{
        position: 'relative', display: 'inline-block',
        cursor: canEdit ? 'pointer' : 'default',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          height: 36, width: 'auto', objectFit: 'contain', maxWidth: 180,
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))',
          opacity: uploading ? 0.4 : 1,
          transition: 'opacity .2s',
        }}
      />
      {canEdit && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={onFile}
            style={{ display: 'none' }}
          />
          <span style={{
            position: 'absolute', bottom: -6, right: -8,
            minWidth: 22, height: 22, padding: '0 6px',
            borderRadius: 999, background: 'rgba(0,0,0,0.82)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, lineHeight: 1, fontWeight: 700,
            border: '1.5px solid #fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}>{uploading ? '…' : '✎'}</span>
        </>
      )}
    </div>
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
      // (b141 → b142) Filtro live · excluye:
      //  · pills archivadas/borradas/draft
      //  · pills con título placeholder "Pil 1", "Pil 2", "Pil 3" · pills
      //    generadas con nombre default y nunca editadas
      //  · pills con título vacío
      const _looksPlaceholder = (t) => {
        const s = String(t || '').trim();
        if (!s) return true;
        return /^pi+l+\s*\d+(\.\d+)?\s*$/i.test(s);
      };
      const _isLive = (p) => !p.archived && !p.archived_at && !p.deleted_at
                          && p.status !== 'archived' && p.status !== 'deleted'
                          && p.status !== 'draft'
                          && !_looksPlaceholder(p.title);
      const tendencias = PILLS
        .filter(_isLive)
        .filter(p => /tendencias?/i.test(String(p.category || ''))
                  || /^tendencia-/i.test(String(p.id || p.slug || '')))
        .sort((a, b) => (a.position || a.pill_number || 0) - (b.position || b.pill_number || 0));
      if (tendencias.length > 0) return tendencias;
      // Fallback si aún no hay pills de tendencias en DB · prioridad:
      // 1) Beyond Prompting (b136 · cliente lo pidió como destacado)
      // 2) En progreso del user · 3) featured · 4) primera
      const beyond = PILLS.find(p => /beyond\s*prompt/i.test(String(p.title || '')));
      const inProgress = PILLS.find(p => p.progress > 0 && p.progress < 1);
      const f = beyond || inProgress || PILLS.find(p => p.featured) || PILLS[0];
      return f ? [f] : [];
    }
    // Pills con flag `featured: true` van primero (decisión del admin sobre
    // cuál destacar en el hero). El resto se rellena con pills con vídeo y,
    // si no hay suficientes, las más populares por `enrolled`.
    //
    // (b136) Promoción explícita del curso "Beyond Prompting" pedida por el
    // cliente · si existe una pill cuyo título contenga "beyond prompting",
    // va PRIMERA en el hero sin importar el flag featured. Heurística
    // simple para que aparezca destacada sin tocar BD.
    const _isBeyondPrompting = (p) => /beyond\s*prompt/i.test(String(p.title || ''));
    const withVid = PILLS.filter(p => p.yt || p.mp4)
      .sort((a, b) => {
        if (_isBeyondPrompting(a) && !_isBeyondPrompting(b)) return -1;
        if (_isBeyondPrompting(b) && !_isBeyondPrompting(a)) return 1;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
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
            // (b138) · ahora editable inline · admins y owners hacen click
            // en el logo del hero y sube el de su empresa sin abrir admin.
            const wsLogo = window.WORKSPACE_LOGO_URL || null;
            const logoSrc = wsLogo || `beonit-logo.png?v=${window.SOLID_VERSION || 'demo'}`;
            const logoAlt = wsLogo ? (window.WORKSPACE_NAME || 'workspace') : 'beonit';
            return <WorkspaceLogoHero src={logoSrc} alt={logoAlt}/>;
          }
          if (demoActive && p.progress > 0 && p.progress < 1) {
            return <>
              <span className="label">Seguir viendo</span>
              <span className="value">{Math.round(p.progress * 100)}% · Alicia Chavero</span>
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
                  <span className="pillmark">Curso · {p.pill}</span>
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
          {/* (b137) En demo · el hero muestra siempre "Dirección del curso:
              Alicia Chavero" en lugar del campo teacher de la pill (que en BD
              puede salir como "María López" u otro residual). Decisión del
              cliente · todo el branding del curso lo firma Alicia. */}
          {(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive())
            ? <span>Dirección del curso: Alicia Chavero</span>
            : <span>{p.teacher}</span>}
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
      window.Ratings.set(pill.id, next, { silent: true });
      if (window.Toast) window.Toast[next ? 'success' : 'info'](next ? '👍 Me gusta' : 'Valoración eliminada', { icon: next ? '👍' : '○' });
    }
  };
  const toggleDislike = (e) => {
    e.stopPropagation();
    if (window.Ratings) {
      const cur = window.Ratings.get && window.Ratings.get(pill.id);
      const curStars = typeof cur === 'number' ? cur : (cur && cur.stars) || 0;
      const next = curStars === 1 ? 0 : 1;
      window.Ratings.set(pill.id, next, { silent: true });
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
    // Persiste la petición de aviso (antes era un toast sin efecto). Se guarda
    // por user en localStorage · base para disparar el aviso al desbloquear.
    try {
      const key = 'solid-notify-unlock:' + (window.Auth && window.Auth.currentUserId ? window.Auth.currentUserId() : 'anon');
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const already = list.includes(pill.id);
      if (!already) { list.push(pill.id); localStorage.setItem(key, JSON.stringify(list)); }
      if (window.Toast) window.Toast.success(already ? 'Ya estás en la lista de aviso' : 'Te avisaremos cuando esté disponible', { icon:'🔔' });
    } catch (err) {
      if (window.Toast) window.Toast.success('Te avisaremos cuando esté disponible', { icon:'🔔' });
    }
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
        {/* (b145) Defensa de render · si alguna pill llega sin pasar por
            el adapter (cache antigua), limpiamos el prefijo "Pil N" del
            título y normalizamos "Básico"→"Intermedio" aquí mismo.
            Idempotente · no hace daño si ya está limpio. */}
        <h3 className="card-title">{(() => {
          const raw = String(pill.title || '');
          return raw.replace(/^\s*pi+l+\s*\d+(\.\d+)?\s*[-·:.]?\s*(de\s+)?/i, '').trim() || raw;
        })()}</h3>
        <div className="card-meta">
          {!demoActive && !(window.DemoMode && window.DemoMode.flag('hide_durations') === true) && <>
            <span>{pill.duration}</span>
            <span className="sep">·</span>
          </>}
          <span>{(() => {
            const raw = String(pill.level || '').toLowerCase().trim();
            const norm = (raw === 'básico' || raw === 'basico' || raw === 'principiante' || raw === 'beginner')
              ? 'Intermedio' : pill.level;
            return demoActive && norm ? `Nivel ${norm}` : norm;
          })()}</span>
        </div>
      </div>

      <div className="card-actions">
        {isLocked ? (
          /* Pill bloqueada · 3 acciones (per spec): Inscribirte · Notifícame · Más info.
             "Añadir a mi lista" sigue siendo el botón de bookmark de abajo (siempre visible). */
          <>
            <button className="card-action primary" aria-label="Inscribirte" title="Inscribirte (te avisaremos al desbloquear)" onClick={(e) => {
              e.stopPropagation();
              const id = pill.pathId || pill.id;
              let added = false;
              if (window.Enrollments && window.Enrollments.add) added = window.Enrollments.add(id);
              if (window.Toast) window.Toast.success(added ? 'Te has inscrito · te avisaremos cuando se desbloquee' : 'Ya estabas inscrito', { icon: '✓' });
            }}>
              <Ico name="plus" size={12}/>
            </button>
            <button className="card-action" aria-label="Notifícame" title="Notifícame cuando esté disponible" onClick={notifyLocked}>
              <Ico name="bell" size={12}/>
            </button>
            <button className="card-action" aria-label="Más información" title="Más información" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
              <Ico name="info" size={12}/>
            </button>
          </>
        ) : isAssigned || !demoActive ? (
          <button className="card-action primary" aria-label="Reproducir" title="Reproducir" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
            <Ico name="play" size={12}/>
          </button>
        ) : (
          <button className="card-action primary" aria-label="Inscribirse" title="Inscribirse" onClick={(e) => {
            e.stopPropagation();
            // Inscripción REAL · registra en Enrollments (antes solo toasteaba
            // "te has inscrito" sin guardar nada → no aparecía en Mi Lista).
            const id = pill.pathId || pill.id;
            let added = false;
            if (window.Enrollments && window.Enrollments.add) added = window.Enrollments.add(id);
            if (window.Toast) window.Toast.success(added ? 'Te has inscrito al curso' : 'Ya estabas inscrito', { icon: '✓' });
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
  // (b137) · path.forceLocked = true · bloqueado siempre (Empoderar Equipos
  // viene del adapter como stub con forceLocked para "próximamente").
  const isLocked = path.forceLocked === true || (lockEnabled && !(path.progress > 0) && !isUnlockedById && (seed % 3) !== 0);

  // (b137) · cliente reportó "Beyond Prompting aparece como Básico Y como
  // Intermedio-alto en sitios distintos" · el bug era que aquí se inventaba
  // un nivel por hash del id (seed % length) que NO respetaba el level real
  // del path. Ahora · si path.level existe lo usamos tal cual; solo
  // inventamos cuando NO hay level definido en BD. Y "Básico" sale del
  // pool de inventados (todos los cursos · intermedio o superior).
  const levels = (dm && dm.flag('level_badges')) || ['Intermedio','Intermedio-alto','Experto'];
  const _realLevel = path.level
    ? (typeof path.level === 'string' && path.level.length ? path.level.charAt(0).toUpperCase() + path.level.slice(1) : path.level)
    : null;
  const level = _realLevel || (demoActive ? levels[seed % levels.length] : null);

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
      // (b135) Si el adapter pidió títulos específicos (cliente fijó 3
      // recomendados: Gestión de Proyectos, Comunicación y Feedback,
      // Desarrollo de Personas), filtramos por match fuzzy de título.
      // Si no hay matches, caemos al scoring por rol de abajo.
      if (Array.isArray(row._recommendedTitles) && row._recommendedTitles.length) {
        const wanted = row._recommendedTitles.map(t => String(t).toLowerCase());
        const lockedTitles = Array.isArray(row._lockedTitles)
          ? row._lockedTitles.map(t => String(t).toLowerCase())
          : [];
        const matched = paths.filter(p => {
          const t = String(p.title || '').toLowerCase();
          return wanted.some(w => t.includes(w) || w.includes(t));
        });
        if (matched.length > 0) {
          // (b137) Para cada título pedido por el cliente · si hay path real
          // en BD lo usamos · si NO existe (caso típico "Empoderar Equipos"
          // que el cliente aún no ha creado) sintetizamos un stub bloqueado
          // con candado · así la fila siempre muestra los 4 que pidió y los
          // que faltan salen como "próximamente". Title original (con
          // mayúsculas) recuperado de row._recommendedTitles por índice.
          paths = wanted.map((w, idx) => {
            const real = matched.find(p => {
              const t = String(p.title || '').toLowerCase();
              return t.includes(w) || w.includes(t);
            });
            if (real) {
              const _wantsLock = lockedTitles.some(lt => lt.includes(w) || w.includes(lt));
              return _wantsLock ? Object.assign({}, real, { forceLocked: true }) : real;
            }
            // Stub virtual · no existe en BD · queda bloqueado siempre.
            const displayTitle = row._recommendedTitles[idx];
            return {
              id: 'stub-' + w.replace(/[^a-z0-9]+/g, '-'),
              title: displayTitle,
              badge: 'Próximamente',
              pills: 0,
              totalCount: 0,
              progress: 0,
              forceLocked: true,
            };
          });
          // Renderizamos directamente · saltamos el scoring por rol.
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
        // Si no hubo ningún match con los 3 títulos · fallback al scoring por rol.
      }
      const user = (D && D.USER) || {};
      const role = String(user.role || '').toLowerCase();
      const team = String(user.team || '').toLowerCase();
      // length >= 2 · roles/equipos de 2 letras (IT, UX, PM, QA, RH, BI) son
      // comunes y deben puntuar. Filtramos solo tokens de 1 char (ruido).
      const tokens = (role + ' ' + team).split(/[\s,·\-/]+/).filter(t => t.length >= 2);
      // Resultado del autotest · si el user lo declaró (palabras clave de áreas
      // de mejora: "liderazgo, comunicación") suman al match → la rec se
      // orienta según el test, no solo el rol. Se guarda en
      // localStorage 'solid-autotest-focus:userId' (campo en perfil + libre).
      const _focusKey = 'solid-autotest-focus:' + ((user && user.id) || 'anon');
      let focusTokens = [];
      try {
        const raw = localStorage.getItem(_focusKey) || '';
        focusTokens = raw.toLowerCase().split(/[\s,·\-/;]+/).filter(t => t.length >= 3);
      } catch (e) {}
      const Bm = window.Bookmarks;
      const _bmSet = Bm && Bm.get ? new Set(Bm.get()) : null;
      const scoreOf = (p) => {
        let s = 0;
        const hay = String((p.badge || '') + ' ' + (p.desc || '') + ' ' + (p.title || '')).toLowerCase();
        if (tokens.some(tok => hay.indexOf(tok) !== -1)) s += 3;
        // Match con áreas declaradas en el autotest · pesa más que el rol (es
        // input explícito del propio user) · +4 por coincidencia.
        if (focusTokens.length && focusTokens.some(tok => hay.indexOf(tok) !== -1)) s += 4;
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
    // (b146) · cliente 6ª iteración · "siguen sin aparecer los números".
    // Las 5 iteraciones de CSS no salieron · alguna combinación de cache
    // del SW + stacking context lo invisibilizaba. Ahora · inline styles
    // INLINE en el JSX · React los aplica con specificity máxima · no
    // hay CSS que pueda sobrescribirlos. El número se renderiza como
    // div flex hermano de la card · imposible que se esconda.
    const _isDarkTheme = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');
    const _numColor = _isDarkTheme ? '#FFFFFF' : '#000000';
    return (
      <section className="row row-trending" data-screen-label={`Row · ${row.key}`}>
        <header className="row-header">
          <h2 className="row-title">{row.title}</h2>
          {row.sub ? <span className="row-sub">— {row.sub}</span> : null}
          <button className="row-explore" onClick={() => onSeeAll && onSeeAll(row)}>Ranking completo <Ico name="chev-right" size={12}/></button>
        </header>
        <div className="rail no-scrollbar" ref={railRef}>
          <div className="rail-track" style={{ display:'flex', alignItems:'stretch', gap:32, paddingTop:16, paddingBottom:16, paddingLeft:24 }}>
            {row.pillIds.map((id, i) => {
              const p = pillById(id);
              if (!p) return null;
              return (
                <div key={id} style={{
                  flex:'0 0 auto', display:'flex', flexDirection:'row',
                  alignItems:'center', gap:16, overflow:'visible',
                }}>
                  <span style={{
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    minWidth:48, flex:'0 0 auto',
                    fontFamily:'Inter, sans-serif',
                    fontWeight:800, fontSize:36, lineHeight:1, letterSpacing:'-0.02em',
                    color:_numColor,
                    userSelect:'none', whiteSpace:'nowrap',
                  }}>{String(i+1).padStart(2,'0')}</span>
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
      /* Sin action · navegar al catálogo desmontaba Home (cond. mount en App)
         y con él el wizard, perdiendo el estado de paso. El tour solo describe
         las secciones; el último paso es el único que navega de verdad. */
    },
    {
      icon: '✓',
      title: 'Mi Lista',
      body: 'Tus cursos inscritos, en progreso y favoritos viven aquí. Es tu zona personal de aprendizaje.',
      cta: 'Siguiente',
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
    // Persistimos el cierre ANTES de ejecutar acciones que puedan desmontar
    // el componente (setView cambia view → App deja de renderizar Home y el
    // wizard) · así el flag de "onboarded" queda escrito siempre que el user
    // llegue al último paso, aunque la acción navegue fuera.
    if (isLast) {
      dismiss();
      if (s.action) s.action();
    } else {
      if (s.action) s.action();
      setStep(step + 1);
    }
  };

  return (
    <div onClick={dismiss} style={{
      position:'fixed', inset:0, background:'rgba(11,18,38,0.72)',
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

// ── NextStepIA · banner personalizado con Claude en el Home ───────────────
// Recomienda el "siguiente paso" del user basado en su progreso real
// (inscripciones, cursos en curso, ratings) + KB del workspace. Llama
// /api/chat con un sistema breve y devuelve { rec, action } parseado.
// Cache localStorage 6h para no spamear la API en cada montaje.
const _NEXT_STEP_TTL_MS = 6 * 60 * 60 * 1000;
function _nextStepCacheKey() {
  const uid = (window.Auth && window.Auth.currentUserId && window.Auth.currentUserId()) || 'anon';
  const ws = (window.Workspaces && window.Workspaces.currentId && window.Workspaces.currentId()) || 'noWs';
  return 'solid-next-step:' + uid + ':' + ws;
}
function _nextStepReadCache() {
  try {
    const raw = localStorage.getItem(_nextStepCacheKey());
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.ts || Date.now() - o.ts > _NEXT_STEP_TTL_MS) return null;
    return o;
  } catch (e) { return null; }
}
function _nextStepWriteCache(payload) {
  try { localStorage.setItem(_nextStepCacheKey(), JSON.stringify({ ts: Date.now(), ...payload })); } catch (e) {}
}

function NextStepIA({ setView, openPath, openDetail }) {
  const D = window.SGS_DATA || {};
  const USER = D.USER || {};
  const PATHS = D.LEARNING_PATHS || [];
  const PILLS = D.PILLS || [];
  const [state, setState] = useState(() => _nextStepReadCache() || { loading: false, rec: '', actionType: '', actionId: '', actionLabel: '' });
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('solid-next-step-dismissed:' + (USER.id || 'anon')) === '1'; } catch (e) { return false; }
  });

  // Heurística de fallback · curso con más progreso, o primer inscrito, o el primero.
  const _heuristicNext = React.useCallback(() => {
    const inProgress = PATHS.filter(p => p.progress > 0 && p.progress < 1).sort((a, b) => (b.progress || 0) - (a.progress || 0));
    if (inProgress.length) {
      const p = inProgress[0];
      return { rec: 'Sigue formándote · te queda menos en ' + p.title, actionType: 'path', actionId: p.id, actionLabel: 'Continuar' };
    }
    const enrolled = PATHS.filter(p => window.Enrollments && window.Enrollments.has && window.Enrollments.has(p.id));
    if (enrolled.length) {
      const p = enrolled[0];
      return { rec: 'Empieza por ' + p.title + ' · está en tu lista', actionType: 'path', actionId: p.id, actionLabel: 'Empezar' };
    }
    if (PATHS.length) {
      const p = PATHS[0];
      return { rec: 'Te sugerimos empezar por ' + p.title, actionType: 'path', actionId: p.id, actionLabel: 'Ver' };
    }
    return { rec: 'Explora el catálogo y elige tu primer curso', actionType: 'view', actionId: 'rutas', actionLabel: 'Ir al catálogo' };
  }, [PATHS.length]);

  const refresh = React.useCallback(async (force) => {
    if (state.loading) return;
    if (!force) {
      const cached = _nextStepReadCache();
      if (cached) { setState({ ...cached, loading: false }); return; }
    }
    setState(s => ({ ...s, loading: true }));
    // Contexto compacto para Claude · solo títulos y % · sin PII innecesaria.
    const ctx = {
      role: USER.role || '',
      team: USER.team || '',
      enrolled: PATHS.filter(p => window.Enrollments && window.Enrollments.has && window.Enrollments.has(p.id)).map(p => ({ id: p.id, title: p.title, pct: Math.round((p.progress || 0) * 100) })).slice(0, 6),
      inProgress: PATHS.filter(p => p.progress > 0 && p.progress < 1).map(p => ({ id: p.id, title: p.title, pct: Math.round(p.progress * 100) })).slice(0, 4),
      available: PATHS.filter(p => !p.progress).map(p => ({ id: p.id, title: p.title })).slice(0, 8),
    };
    const sysHint = 'Eres BeonAI · recomendador de aprendizaje. Devuelve UN ÚNICO mensaje breve (máx 22 palabras, en español, sin saludo) sugiriendo el SIGUIENTE PASO al usuario. Termina con `[ACTION:path:<id>]` (o `[ACTION:view:rutas]` si nada concreto). El id debe ser uno de los ofrecidos. NO inventes.';
    const messages = [
      { role: 'user', text: sysHint + '\n\nUsuario:\n' + JSON.stringify(ctx, null, 2) + '\n\nDame UN SOLO siguiente paso, breve y accionable.' },
    ];
    try {
      const cm = window.callMentorAPI || window.callMentorAPI;
      // callMentorAPI vive en prototype-views.jsx · expuesta en window
      const reply = await (window.callMentorAPI ? window.callMentorAPI(messages) : Promise.reject(new Error('no callMentorAPI')));
      const txt = String(reply || '').trim();
      // Parse [ACTION:type:id]
      const m = txt.match(/\[ACTION:([a-z]+):([^\]\s]+)\]/i);
      let actionType = '', actionId = '', actionLabel = 'Continuar';
      if (m) {
        actionType = m[1].toLowerCase();
        actionId = m[2];
        if (actionType === 'view') actionLabel = 'Ir';
      } else {
        // Fallback · si Claude no devolvió ACTION, usamos heurística
        const h = _heuristicNext();
        actionType = h.actionType; actionId = h.actionId; actionLabel = h.actionLabel;
      }
      const cleanRec = txt.replace(/\s*\[ACTION:[^\]]+\]\s*$/i, '').trim() || _heuristicNext().rec;
      const next = { rec: cleanRec, actionType, actionId, actionLabel, loading: false };
      setState(next);
      _nextStepWriteCache({ rec: next.rec, actionType: next.actionType, actionId: next.actionId, actionLabel: next.actionLabel });
    } catch (err) {
      // Si IA no disponible, caemos a la heurística silenciosamente (sin error)
      const h = _heuristicNext();
      setState({ ...h, loading: false });
      _nextStepWriteCache(h);
    }
  }, [USER.role, USER.team, PATHS.length, state.loading, _heuristicNext]);

  React.useEffect(() => {
    if (!state.rec && !state.loading) refresh(false);
    // refresh se omite a propósito · refresh ya estabiliza con sus deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [USER.id]);

  const handleAction = () => {
    if (state.actionType === 'path' && state.actionId) {
      if (window.__openPath) window.__openPath(state.actionId);
      else if (openPath) openPath(state.actionId);
      else setView && setView('rutas');
      return;
    }
    if (state.actionType === 'pill' && state.actionId) {
      const p = (PILLS || []).find(x => x.id === state.actionId);
      if (p && openDetail) openDetail(p);
      return;
    }
    setView && setView(state.actionId || 'rutas');
  };
  const handleDismiss = () => {
    try { localStorage.setItem('solid-next-step-dismissed:' + (USER.id || 'anon'), '1'); } catch (e) {}
    setDismissed(true);
  };
  const handleRefresh = () => { _nextStepWriteCache({}); refresh(true); };

  if (dismissed) return null;

  return (
    <section style={{
      margin:'-44px var(--row-pad, 60px) 32px',
      padding:'18px 22px',
      background:'linear-gradient(135deg, rgba(0, 98, 65,0.10), rgba(0, 98, 65,0.04))',
      border:'1px solid rgba(0, 98, 65,0.28)',
      borderRadius: 14,
      position:'relative', zIndex: 4,
      display:'flex', alignItems:'center', gap: 18, flexWrap:'wrap',
      boxShadow:'0 8px 24px rgba(0,0,0,0.30)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius:'50%',
        background:'var(--accent)', color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink: 0, fontSize: 18, boxShadow:'0 0 0 4px rgba(0, 98, 65,0.18)',
      }}>✦</div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--accent)',
          letterSpacing:'0.14em', textTransform:'uppercase', fontWeight: 700, marginBottom: 4,
        }}>Tu próximo paso · BeonAI</div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color:'var(--fg)', lineHeight: 1.45 }}>
          {state.loading ? 'Analizando tu progreso…' : (state.rec || 'Elige cómo seguir.')}
        </div>
      </div>
      <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
        {!state.loading && state.actionId && (
          <button onClick={handleAction} style={{
            padding:'10px 18px', background:'var(--accent)', color:'#fff',
            border:'none', borderRadius: 8, cursor:'pointer',
            fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13.5,
          }}>{state.actionLabel || 'Continuar'} →</button>
        )}
        <button onClick={handleRefresh} disabled={state.loading} title="Volver a pedir recomendación" style={{
          padding:'9px 12px', background:'transparent', color:'var(--fg-muted)',
          border:'1px solid var(--line)', borderRadius: 8, cursor: state.loading ? 'wait' : 'pointer',
          fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12,
        }}>↻</button>
        <button onClick={handleDismiss} title="Ocultar" style={{
          padding:'9px 12px', background:'transparent', color:'var(--fg-dim)',
          border:'none', cursor:'pointer', fontSize: 18, lineHeight: 1,
        }}>×</button>
      </div>
    </section>
  );
}
window.NextStepIA = NextStepIA;

// ── AutotestReminder · recordatorio del test si pasan 15 días desde el primer
// acceso del user en este workspace y no lo ha hecho. Marca de primer acceso
// en localStorage (solid-first-access:userId:wsId). Si el admin no configuró
// settings.autotest_url, no se muestra. Dismissable (recuerda el resultado:
// "done" o "skipped") y reaparece si el admin cambia la URL del test.
const AUTOTEST_REMIND_DAYS = 15;
function AutotestReminder({ setView }) {
  const USER = (window.SGS_DATA && window.SGS_DATA.USER) || {};
  const ws   = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
  const autoUrl = (ws.settings && ws.settings.autotest_url) || null;
  const uid = USER.id || 'anon';
  const wsId = ws.id || 'noWs';
  const _firstAccessKey = 'solid-first-access:' + uid + ':' + wsId;
  const _statusKey = 'solid-autotest-status:' + uid + ':' + wsId;
  const [status, setStatus] = useState(() => {
    try { return localStorage.getItem(_statusKey) || ''; } catch (e) { return ''; }
  });
  // Garantiza first-access marcado UNA vez por user+workspace.
  React.useEffect(() => {
    try { if (!localStorage.getItem(_firstAccessKey)) localStorage.setItem(_firstAccessKey, String(Date.now())); } catch (e) {}
  }, [uid, wsId]);
  if (!autoUrl) return null;
  if (status === 'done' || status === 'skipped') return null;
  let first = 0;
  try { first = parseInt(localStorage.getItem(_firstAccessKey), 10) || Date.now(); } catch (e) { first = Date.now(); }
  const elapsedDays = (Date.now() - first) / 86400000;
  if (elapsedDays < AUTOTEST_REMIND_DAYS) return null;
  const setDone    = () => { try { localStorage.setItem(_statusKey, 'done'); } catch (e) {} setStatus('done'); };
  const setSkipped = () => { try { localStorage.setItem(_statusKey, 'skipped'); } catch (e) {} setStatus('skipped'); };
  return (
    <section style={{
      margin:'-12px var(--row-pad, 60px) 28px',
      padding:'16px 22px',
      background:'linear-gradient(135deg, rgba(243,183,64,0.12), rgba(243,183,64,0.04))',
      border:'1px solid rgba(243,183,64,0.35)',
      borderRadius: 14, position:'relative', zIndex: 4,
      display:'flex', alignItems:'center', gap: 16, flexWrap:'wrap',
    }}>
      <div style={{ fontSize: 22 }}>🧭</div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'#F3B740', letterSpacing:'0.14em', textTransform:'uppercase', fontWeight: 700, marginBottom: 4 }}>Test autodiagnóstico · 15 min</div>
        <div style={{ fontSize: 14, color:'var(--fg)', lineHeight: 1.45 }}>
          Aún no has hecho el test inicial. Te orientará en el itinerario formativo que mejor encaja contigo.
        </div>
      </div>
      <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
        <a href={autoUrl} target="_blank" rel="noopener noreferrer" onClick={setDone} style={{
          padding:'10px 16px', background:'var(--accent)', color:'#fff', textDecoration:'none',
          borderRadius: 8, fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13,
        }}>Hacer test ahora</a>
        <button onClick={setSkipped} style={{
          padding:'9px 12px', background:'transparent', color:'var(--fg-muted)',
          border:'1px solid var(--line)', borderRadius: 8, cursor:'pointer',
          fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12,
        }}>No me interesa</button>
      </div>
    </section>
  );
}
window.AutotestReminder = AutotestReminder;

function Home({ openDetail, openPlayer, setView, openPath }) {
  const [, force] = useState(0);
  // welcomeDismissed como flag manual · DEBE declararse antes de cualquier
  // return condicional (Rules of Hooks). El estado persistido se lee en
  // render más abajo (no-hook) y se combina con este flag.
  const [welcomeDismissedManual, setWelcomeDismissedManual] = useState(false);
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
            : 'Preparando cursos…'}
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
  // Lectura persistida en render (no-hook · seguro tras el return condicional).
  const _persistedDismissed = (() => {
    try { return !!localStorage.getItem(_dismissKey); } catch (e) { return false; }
  })();
  const welcomeDismissed = welcomeDismissedManual || _persistedDismissed;
  const dismissWelcome = () => {
    try { localStorage.setItem(_dismissKey, '1'); } catch (e) {}
    setWelcomeDismissedManual(true);
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
        {/* "Tu próximo paso" · banner IA personalizado · va ENCIMA de las rows */}
        <NextStepIA setView={setView} openPath={openPath} openDetail={openDetail}/>
        {/* Recordatorio del test autodiagnóstico · sale tras 15 días sin hacerlo */}
        <AutotestReminder setView={setView}/>
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
            // Si el admin no configuró legal_url, mostramos un fallback a la
            // política de BeonIt · "Bases legales" siempre visible en el footer.
            const legalUrl = (ws.settings && ws.settings.legal_url) || 'https://beonit.com/legal';
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
