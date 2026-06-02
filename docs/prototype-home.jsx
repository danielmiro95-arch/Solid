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

  const items = [
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
        <button className="icon-btn" onClick={onSearch} aria-label="Buscar"><Ico name="search" size={18}/></button>
        <button className="icon-btn" aria-label="Notificaciones" onClick={() => onView('inbox')}>
          <Ico name="bell" size={18}/>
          {inboxCount ? <span className="badge">{inboxCount}</span> : null}
        </button>
        <button className="avatar" aria-label="Menú de usuario" onClick={() => setMenuOpen(o => !o)}>{initials}</button>

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
              <div style={{width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent, #6E50EE), var(--accent-deep, #4E36C5))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700}}>{initials}</div>
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

            {/* En demo mode · stats del user · Formación completada / en curso / Días activos */}
            {isSimplified && (() => {
              const PILLS = (D && D.PILLS) || [];
              const completed = PILLS.filter(p => p.progress >= 1).length;
              const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1).length;
              const daysActive = (window.Activity && window.Activity.daysActive && window.Activity.daysActive()) || 14;
              const stats = [
                { label: 'Formación completada', value: completed },
                { label: 'Formación en curso',    value: inProgress },
                { label: 'Días activos',          value: daysActive },
              ];
              return (
                <>
                  <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'6px 6px'}}/>
                  <div style={{padding:'10px 14px 6px'}}>
                    {stats.map(s => (
                      <div key={s.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <span style={{fontSize:12.5, color:'rgba(245,244,241,0.75)', fontFamily:'var(--font-sans, Inter)'}}>{s.label}</span>
                        <span style={{fontSize:14, fontWeight:700, color:'#F5F4F1', fontFamily:'var(--font-sans, Inter)'}}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

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
    // En modo demo · el hero funciona como sección "Seguir viendo":
    //   1) si hay alguna pill con progreso > 0 (asignada/en curso) · la mostramos
    //   2) si no · mostramos la pill featured ("Más presentaciones eficaces")
    //   3) sin rotación · una sola pill
    const dm = window.DemoMode;
    if (dm && dm.isActive && dm.isActive()) {
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
          const dm = window.DemoMode;
          const demoActive = dm && dm.isActive && dm.isActive();
          // En demo · si la pill mostrada tiene progreso → "Seguir viendo"
          // (sección que pidieron en reunión). Si no → "Destacado" + nombre
          // del workspace, evitando "Top esta semana en HdR Demo".
          if (demoActive && p.progress > 0 && p.progress < 1) {
            return <>
              <span className="label">Seguir viendo</span>
              <span className="value">{Math.round(p.progress * 100)}% · {p.teacher}</span>
              <span className="stroke"/>
            </>;
          }
          if (demoActive) {
            return <>
              <span className="label">Destacado</span>
              <span className="value">curso recomendado para ti</span>
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

        <h1 className="hero-title">{(() => {
          // En demo · si hay progreso en la pill mostrada → usa pill.title
          // (Seguir viendo el curso real). Si no → "Más presentaciones eficaces"
          // como pill destacada per spec del cliente.
          const dm = window.DemoMode;
          if (dm && dm.isActive && dm.isActive()) {
            if (p.progress > 0 && p.progress < 1) return p.title;
            const override = dm.label && dm.label('hero_title_label', null);
            return override || 'Más presentaciones eficaces';
          }
          return p.title;
        })()}</h1>
        {p.one && p.one !== p.title && !(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive()) && <p className="hero-quote">"{p.one}."</p>}

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
          <button className="btn btn-primary" onClick={() => onPlay(p)}>
            <Ico name="play" size={16}/> {T('hero.play')}
          </button>
          <button className="btn btn-secondary" onClick={() => onMore(p)}>
            <Ico name="info" size={16}/> {T('hero.more')}
          </button>
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
  const [rated, setRated]  = React.useState(() => {
    const r = window.Ratings && window.Ratings.get && window.Ratings.get(pill.id);
    return typeof r === 'number' ? r >= 4 : !!(r && r.stars >= 4);
  });
  React.useEffect(() => {
    const onB = () => setSaved(window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
    const onR = (e) => { if (e && e.detail && e.detail.pillId === pill.id) setRated(e.detail.stars >= 4); };
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
      const next = rated ? 0 : 5;
      window.Ratings.set(pill.id, next);
      if (window.Toast) window.Toast[next ? 'success' : 'info'](next ? '👍 Me gusta' : 'Sin valoración', { icon: next ? '👍' : '○' });
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
        <>
          <span style={{
            position:'absolute', top:10, right:10, padding:'5px 10px',
            background:'rgba(15,23,42,0.85)', color:'#fff', borderRadius:999,
            fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:700,
            letterSpacing:'0.06em', display:'inline-flex', alignItems:'center', gap:4,
            backdropFilter:'blur(8px)',
          }}>🔒 Bloqueado</span>
          {/* Candado grande centrado en la card · refuerza visual de bloqueo */}
          <div style={{
            position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
            pointerEvents:'none', fontSize:42, opacity:0.85, color:'#fff',
            textShadow:'0 2px 12px rgba(0,0,0,0.5)',
          }}>🔒</div>
        </>
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
          <button className="card-action primary" aria-label="Notifícame" title="Notifícame cuando esté disponible" onClick={notifyLocked} style={{background:'rgba(110,80,238,0.85)', color:'#fff'}}>
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
          style={saved ? { background:'rgba(110,80,238,0.85)', color:'#fff', borderColor:'rgba(110,80,238,0.85)' } : undefined}>
          <Ico name={saved ? 'check' : 'bookmark'} size={14}/>
        </button>
        {!demoActive && (
          <button className={`card-action${rated ? ' is-active' : ''}`} aria-label={rated ? 'Quitar Me gusta' : 'Me gusta'} title={rated ? 'Quitar Me gusta' : 'Me gusta'} onClick={toggleLike}>
            <Ico name="thumb" size={13}/>
          </button>
        )}
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

  return (
    <article className={`card${isLocked ? ' is-locked' : ''}`} onClick={handleClick} style={isLocked ? { cursor:'not-allowed' } : undefined}>
      <div className={`card-cover ${path.accent || 'cat-publish'}`} style={isLocked ? { filter:'grayscale(0.6) brightness(0.55)' } : undefined}/>
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
          background:'rgba(110,80,238,0.92)', color:'#fff', borderRadius:999,
          fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:700,
          letterSpacing:'0.06em',
        }}>Nivel {level}</span>
      )}
      <div className="card-body" style={{ left: 16, right: 16 }}>
        <h3 className="card-title" style={{ fontSize: 17, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          {path.title}
        </h3>
        <div className="card-meta">
          {!(window.DemoMode && window.DemoMode.flag('hide_durations') === true) && <>
            <span>{path.hours}</span>
            <span className="sep">·</span>
          </>}
          <span>{(path.desc || '').slice(0, 38)}…</span>
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
    const paths = (D && D.LEARNING_PATHS) || [];
    if (paths.length === 0) return null;
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

  return (
    <div data-screen-label="Home">
      <HomeHero onPlay={(p) => openPlayer(p)} onMore={(p) => openDetail(p)}/>
      <div className="rows">
        {D.ROWS.map(row => (
          <NxRow key={row.key} row={row} onOpen={openDetail} onOpenPath={onOpenPath} onSeeAll={onSeeAll}/>
        ))}
        {/* En demo · CTA "Inscríbete a talleres" como sección simple */}
        {demoActive && <WorkshopsCTASection/>}
      </div>
      <footer className="footer-strip">
        <div className="cobranding">
          <span><b>SolidStream</b></span>
          <span>·</span>
          <span>by BeonIt</span>
          <span>·</span>
          <span>{window.WORKSPACE_NAME || 'Plataforma de formación'}</span>
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
