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
    const msg = '📚 *SOLID · Formación Sprinklr*\nTe comparto este módulo: *' + pillTitle + '*\nDuración: ' + (duration||'3–5 min') + ' ⚡\n\nVer ahora → ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
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

  const rootClass = `proto-root ai-${aiMode}`;

  return (
    <div className={rootClass} data-screen-label={`Prototype · ${view}`}>
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

      {/* Secondary nav: onboarding entry — disabled in production-like view */}

      {tweaksOn && (
        <TweaksPanel
          shape={shape} setShape={setShape}
          accent={accent} setAccent={setAccent}
          aiMode={aiMode} setAIMode={setAIMode}
        />
      )}

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
