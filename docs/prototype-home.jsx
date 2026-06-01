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
  const menuItems = [
    { k:'profile',  label:T('nav.profile'),  icon:'user' },
    { k:'saved',    label:T('nav.saved'),    icon:'bookmark' },
    { k:'wa',       label:T('nav.wa'),       icon:'broadcast' },
    { k:'inbox',    label:T('nav.inbox'),    icon:'inbox', badge: inboxCount },
    { k:'settings', label:T('nav.settings'), icon:'gear' },
  ];
  if (canManager) menuItems.push({ k:'manager', label: T('nav.manager','Mi equipo'), icon:'users' });
  if (canAdmin)   menuItems.push({ k:'admin',   label: T('nav.admin'),               icon:'shield' });

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
        <span className="label">Top esta semana</span>
        <span className="value">en {window.WORKSPACE_NAME || 'tu workspace'}</span>
        <span className="stroke"/>
      </div>

      <div className="hero-content" key={p.id}>
        <div className="hero-eyebrow">
          <span className="pillmark">Think Pill · {p.pill}</span>
          <span className="sep"/>
          <span className="meta">{cat.label}</span>
        </div>

        <h1 className="hero-title">{p.title}</h1>
        {p.one && p.one !== p.title && <p className="hero-quote">"{p.one}."</p>}

        <div className="hero-meta">
          <span className="tag">{p.level}</span>
          <span className="sep">/</span>
          <span>{p.duration}</span>
          <span className="sep">/</span>
          <span>{p.teacher}</span>
          {p.rating ? (<><span className="sep">/</span><span>★ {Number(p.rating).toFixed(1)} · {(p.enrolled||0).toLocaleString('es-ES')}</span></>) : null}
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

      <div className="hero-dots">
        {featured.map((_, i) => (
          <span key={i} className={`hero-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} style={{cursor:'pointer'}}/>
        ))}
      </div>
    </section>
  );
}

function NxCard({ pill, onOpen, showProgress, newBadge }) {
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

  return (
    <article className="card" onClick={() => onOpen(pill)} data-screen-label={`Card · ${pill.pill}`}>
      <div className={`card-cover cat-${slug}`}/>
      {pill.poster ? (
        <img
          src={pill.poster}
          alt=""
          style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover'}}
          onError={e => { e.currentTarget.style.display='none'; }}
        />
      ) : pill.yt ? (
        <img
          src={`https://img.youtube.com/vi/${pill.yt}/hqdefault.jpg`}
          alt=""
          style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover'}}
          onError={e => { e.currentTarget.style.display='none'; }}
        />
      ) : null}
      <div className="card-grad"/>

      <span className="card-pill-num">{String(cat.label).toUpperCase()} · {pill.pill}</span>
      {(newBadge || pill.newBadge) && <span className="card-badge">Nuevo</span>}

      <div className="card-body">
        <h3 className="card-title">{pill.title}</h3>
        <div className="card-meta">
          <span>{pill.duration}</span>
          <span className="sep">·</span>
          <span>{pill.level}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="card-action primary" aria-label="Reproducir" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
          <Ico name="play" size={12}/>
        </button>
        <button className={`card-action${saved ? ' is-active' : ''}`} aria-label={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} title={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} onClick={toggleSave}>
          <Ico name={saved ? 'check' : 'plus'} size={14}/>
        </button>
        <button className={`card-action${rated ? ' is-active' : ''}`} aria-label={rated ? 'Quitar Me gusta' : 'Me gusta'} title={rated ? 'Quitar Me gusta' : 'Me gusta'} onClick={toggleLike}>
          <Ico name="thumb" size={13}/>
        </button>
        <button className="card-action" aria-label="Más info" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
          <Ico name="chev-down" size={14}/>
        </button>
        <span className="card-match">{Math.round(78 + ((parseInt(String(pill.id).replace(/\D/g, ''), 10) || 0) * 17) % 22)}% match</span>
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
  return (
    <article className="card" onClick={() => onOpen && onOpen(path)}>
      <div className={`card-cover ${path.accent || 'cat-publish'}`}/>
      <div className="card-grad"/>
      <span className="card-pill-num">RUTA · {path.pills} pills</span>
      <div className="card-body" style={{ left: 16, right: 16 }}>
        <h3 className="card-title" style={{ fontSize: 17, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          {path.title}
        </h3>
        <div className="card-meta">
          <span>{path.hours}</span>
          <span className="sep">·</span>
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
          <span className="row-sub">— {row.sub}</span>
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
          <span className="row-sub">— {row.sub}</span>
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
                  <NxCard pill={p} onOpen={onOpen}/>
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
        <span className="row-sub">— {row.sub}</span>
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
        <div style={{fontSize:14}}>Preparando Think Pills…</div>
      </div>
    );
  }

  const onOpenPath = (p) => { if (p && p.id && openPath) openPath(p.id); else setView('rutas'); };
  const onSeeAll = () => setView('browse');

  return (
    <div data-screen-label="Home">
      <HomeHero onPlay={(p) => openPlayer(p)} onMore={(p) => openDetail(p)}/>
      <div className="rows">
        {D.ROWS.map(row => (
          <NxRow key={row.key} row={row} onOpen={openDetail} onOpenPath={onOpenPath} onSeeAll={onSeeAll}/>
        ))}
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
