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
    const msg = '📚 *SGS|on · Formación Sprinklr*\nTe comparto este módulo: *' + pillTitle + '*\nDuración: ' + (duration||'3–5 min') + ' ⚡\n\nVer ahora → ' + url;
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

// ── Bookmarks (Saved library) ──────────────────────────────────────────────
const Bookmarks = (function() {
  const KEY = 'solid-bookmarks';
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function save(ids) { localStorage.setItem(KEY, JSON.stringify(ids)); window.dispatchEvent(new Event('bookmarks-changed')); }
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

// ── User profile (editable) ────────────────────────────────────────────────
const UserProfile = (function() {
  const KEY = 'solid-user-profile';
  const DEFAULT = { name: 'Amaia Ruiz', role: 'Publish Agent', team: 'Repsol', avatarColor: 'var(--repsol-red)', email: 'amaia.ruiz@repsol.com' };
  function get() {
    try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch(e) { return Object.assign({}, DEFAULT); }
  }
  function update(patch) {
    const merged = Object.assign({}, get(), patch);
    localStorage.setItem(KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: merged }));
    return merged;
  }
  function reset() { localStorage.removeItem(KEY); window.dispatchEvent(new Event('user-profile-changed')); }
  return { get, update, reset, DEFAULT };
})();
window.UserProfile = UserProfile;

// ── CommandPalette (global search ⌘K) ──────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate, openDetail }) {
  const [q, setQ] = useSM('');
  const inputRef = React.useRef(null);

  useEM(() => {
    if (open && inputRef.current) {
      setQ('');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  useEM(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const all = (window.PILLS || []).concat(window.SERIES || []).concat(window.PODCASTS || []);
  const ql = q.trim().toLowerCase();
  const items = ql.length === 0
    ? all.slice(0, 8)
    : all.filter(it => (it.title || '').toLowerCase().includes(ql) || (it.category || '').toLowerCase().includes(ql) || (it.teacher || '').toLowerCase().includes(ql)).slice(0, 12);

  const navItems = [
    { id:'home', label:'Inicio' },
    { id:'browse', label:'Catálogo' },
    { id:'rutas', label:'Rutas de certificación' },
    { id:'path', label:'Mi ruta' },
    { id:'dashboard', label:'Dashboard' },
    { id:'coach', label:'MENTOR-IA' },
    { id:'cronograma', label:'Cronograma' },
    { id:'wa', label:'WhatsApp' },
    { id:'saved', label:'Guardados' },
    { id:'profile', label:'Mi perfil' },
  ].filter(n => ql.length === 0 || n.label.toLowerCase().includes(ql));

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10vh'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', width:'min(640px, 92vw)', borderRadius:14, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', overflow:'hidden', border:'1px solid var(--line)'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:10}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--ink-4)'}}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.6-4.6"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar módulos, vistas, profesores…"
            style={{flex:1, border:'none', outline:'none', fontFamily:'var(--sans)', fontSize:15, background:'transparent', color:'var(--ink)'}}
          />
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', padding:'2px 6px', border:'1px solid var(--line)', borderRadius:4}}>ESC</span>
        </div>
        <div style={{maxHeight:'55vh', overflowY:'auto'}}>
          {navItems.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Navegación</div>
              {navItems.map(n => (
                <button key={n.id} onClick={() => { onNavigate(n.id); onClose(); }} style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)'}} onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.08em'}}>IR A</span> {n.label}
                </button>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Módulos {ql && `· ${items.length} resultados`}</div>
              {items.map(it => (
                <button key={it.id} onClick={() => { openDetail(it); onClose(); }} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)'}} onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', flexShrink:0, width:36}}>{it.format || 'módulo'}</span>
                  <span style={{flex:1, fontSize:13, color:'var(--ink)', fontWeight:500}}>{it.title}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{it.duration}</span>
                </button>
              ))}
            </div>
          )}
          {items.length === 0 && navItems.length === 0 && (
            <div style={{padding:'24px 18px', textAlign:'center', fontSize:13, color:'var(--ink-4)'}}>Sin resultados para "{q}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const saved = JSON.parse(localStorage.getItem('solid-proto') || '{}');
  const [view, setView] = useSM(saved.view || 'home');
  const [aiMode, setAIMode] = useSM(saved.aiMode || 'companion'); // hero | companion | collapsed
  const [shape, setShape] = useSM(saved.shape || 'mixed');
  const [accent, setAccent] = useSM(saved.accent || '#F3A524');
  const [detailItem, setDetailItem] = useSM(null);

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

  useEM(() => {
    localStorage.setItem('solid-proto', JSON.stringify({ view, aiMode, shape, accent }));
    document.documentElement.style.setProperty('--accent-glow', accent);
  }, [view, aiMode, shape, accent]);

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

  // Mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useSM(false);

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
    return () => window.removeEventListener('keydown', h);
  }, []);

  const openDetail = (it) => { setDetailItem(it); setView('detail'); };
  const openPlayer = (it) => { if (it) setDetailItem(it); setView('player'); };

  const rootClass = `proto-root ai-${aiMode}${mobileMenuOpen ? ' mobile-menu-open' : ''}`;

  // Cierra el menú móvil al cambiar de vista
  useEM(() => { setMobileMenuOpen(false); }, [view]);

  return (
    <div className={rootClass} data-screen-label={`Prototype · ${view}`}>
      {view !== 'onboarding' && (
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Abrir menú">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 6h18M3 12h18M3 18h18"/></>}
          </svg>
        </button>
      )}
      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}/>}
      {view !== 'onboarding' && <Sidebar view={view} setView={(v) => { setView(v); if (v === 'wa') setView('wa'); }}/>}
      <main className="main" style={view === 'onboarding' ? {gridColumn:'1 / -1'} : {}}>
        {view === 'home' && <Home openDetail={openDetail} openPlayer={openPlayer} setView={setView}/>}
        {view === 'detail' && <Detail item={detailItem} openPlayer={openPlayer} back={() => setView('home')} setView={setView} setAIMode={setAIMode}/>}
        {view === 'player' && <Player back={() => setView('detail')} item={detailItem}/>}
        {view === 'coach' && <Coach/>}
        {view === 'dashboard' && <Dashboard/>}
        {view === 'rutas' && <Rutas openPlayer={openPlayer}/>}
        {view === 'path' && <PathView openPlayer={openPlayer} setView={setView}/>}
        {view === 'profile' && <Profile setView={setView}/>}
        {view === 'wa' && <WhatsApp/>}
        {view === 'cronograma' && <div className="main-inner"><Cronograma/></div>}
        {view === 'saved' && <SavedView openDetail={openDetail} setView={setView}/>}
        {view === 'browse' && <div className="main-inner"><Home openDetail={openDetail} openPlayer={openPlayer} setView={setView}/></div>}
        {view === 'onboarding' && <Onboarding done={() => setView('home')}/>}
      </main>
      {view !== 'onboarding' && aiMode !== 'collapsed' && (
        <AISidekick setAIMode={setAIMode} aiMode={aiMode} view={view}/>
      )}
      {aiMode === 'collapsed' && view !== 'onboarding' && (
        <button className="ai-rail-btn" onClick={() => setAIMode('companion')} title="Open coach">
          <Icon name="sparkle" size={22}/>
        </button>
      )}

      {view !== 'onboarding' && <OnboardingRing onClick={() => setView('onboarding')}/>}

      {tweaksOn && (
        <TweaksPanel
          shape={shape} setShape={setShape}
          accent={accent} setAccent={setAccent}
          aiMode={aiMode} setAIMode={setAIMode}
        />
      )}

      <Toaster/>

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
function SavedView({ openDetail, setView }) {
  const [tick, setTick] = useSM(0);
  useEM(() => {
    const h = () => setTick(t => t + 1);
    window.addEventListener('bookmarks-changed', h);
    return () => window.removeEventListener('bookmarks-changed', h);
  }, []);
  const ids = (window.Bookmarks ? window.Bookmarks.get() : []);
  const all = (window.PILLS || []).concat(window.SERIES || []).concat(window.PODCASTS || []);
  const items = ids.map(id => all.find(x => x.id === id)).filter(Boolean);
  return (
    <div className="main-inner">
      <div className="lms-hero-eyebrow" style={{marginBottom:8}}><span className="repsol-dot"/>Módulos guardados</div>
      <h1 style={{fontFamily:'var(--serif)', fontWeight:700, fontSize:'clamp(36px, 4vw, 52px)', letterSpacing:'-0.025em', margin:'0 0 8px'}}>Tu <em style={{fontStyle:'italic', color:'var(--accent-glow)'}}>biblioteca</em>.</h1>
      <p style={{fontSize:14, color:'var(--ink-3)', marginBottom:32}}>{items.length} {items.length === 1 ? 'módulo guardado' : 'módulos guardados'}</p>
      {items.length === 0 ? (
        <div style={{padding:'48px 24px', textAlign:'center', border:'1px dashed var(--line)', borderRadius:14, background:'var(--paper-2)'}}>
          <div style={{fontSize:32, marginBottom:8}}>📑</div>
          <div style={{fontSize:15, fontWeight:600, marginBottom:6, color:'var(--ink)'}}>Aún no has guardado ningún módulo</div>
          <div style={{fontSize:13, color:'var(--ink-3)', marginBottom:16}}>Pulsa <em style={{fontStyle:'italic'}}>Guardar</em> en cualquier módulo para añadirlo aquí.</div>
          <button className="btn glow" onClick={() => setView('browse')}>Explorar catálogo →</button>
        </div>
      ) : (
        <div className="catalog-grid">{items.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}</div>
      )}
    </div>
  );
}

// ── Onboarding ring · botón flotante que se va llenando con el progreso ───
function OnboardingRing({ onClick }) {
  const computeProgress = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('solid-onboarding') || '{}');
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

  const size = 44, stroke = 4, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dash = c * prog.value;

  return (
    <button onClick={onClick} title={prog.label} aria-label={prog.label}
      style={{position:'fixed', top:14, right:18, zIndex:500, width:size, height:size, borderRadius:'50%', border:'none',
        background:'var(--paper)', boxShadow:'0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--line)',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0,
        transition:'transform .14s, box-shadow .14s'}}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(0,114,190,0.25), 0 0 0 1px var(--bn-blue)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--line)'; }}>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bn-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:'relative'}}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      ) : (
        <span style={{position:'relative', fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em'}}>
          {Math.round(prog.value * 100)}<span style={{fontSize:8, color:'var(--ink-4)'}}>%</span>
        </span>
      )}
    </button>
  );
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

// ── Chat history (MENTOR-IA conversaciones persistentes) ──────────────────
const ChatHistory = (function() {
  const KEY = 'solid-chats';
  const ACTIVE_KEY = 'solid-active-chat';
  function list() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function save(chats) { localStorage.setItem(KEY, JSON.stringify(chats)); window.dispatchEvent(new Event('chats-changed')); }
  function activeId() { return localStorage.getItem(ACTIVE_KEY) || null; }
  function setActive(id) { if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY); window.dispatchEvent(new Event('chats-changed')); }
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

window.PrototypeApp = App;
