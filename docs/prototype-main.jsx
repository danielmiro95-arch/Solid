// prototype-main.jsx — orchestrator

const { useState: useSM, useEffect: useEM } = React;

function App() {
  const saved = JSON.parse(localStorage.getItem('solid-proto') || '{}');
  const [view, setView] = useSM(saved.view || 'home');
  const [aiMode, setAIMode] = useSM(saved.aiMode || 'companion'); // hero | companion | collapsed
  const [shape, setShape] = useSM(saved.shape || 'mixed');
  const [accent, setAccent] = useSM(saved.accent || '#c8ff3d');
  const [detailItem, setDetailItem] = useSM(null);

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

  const openDetail = (it) => { setDetailItem(it); setView('detail'); };
  const openPlayer = () => setView('player');

  const rootClass = `proto-root ai-${aiMode}`;

  return (
    <div className={rootClass} data-screen-label={`Prototype · ${view}`}>
      {view !== 'onboarding' && <Sidebar view={view} setView={(v) => { setView(v); if (v === 'wa') setView('wa'); }}/>}
      <main className="main" style={view === 'onboarding' ? {gridColumn:'1 / -1'} : {}}>
        {view === 'home' && <Home shape={shape} openDetail={openDetail} openPlayer={openPlayer}/>}
        {view === 'detail' && <Detail item={detailItem} openPlayer={openPlayer} back={() => setView('home')}/>}
        {view === 'player' && <Player back={() => setView('detail')}/>}
        {view === 'coach' && <Coach/>}
        {view === 'path' && <PathView/>}
        {view === 'profile' && <Profile/>}
        {view === 'wa' && <WhatsApp/>}
        {view === 'saved' && <div className="main-inner"><div className="hero-eye"><span className="chip">Saved · 12 items</span></div><h1 style={{fontFamily:'var(--serif)', fontSize:56, letterSpacing:'-0.025em', margin:'16px 0 32px'}}>Your <em style={{fontStyle:'italic'}}>canon</em>.</h1><div className="grid-pills" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>{[...PILLS, ...SERIES.slice(0,3)].map(p => <Card key={p.id} {...p}/>)}</div></div>}
        {view === 'browse' && <div className="main-inner"><Home shape={shape} openDetail={openDetail} openPlayer={openPlayer}/></div>}
        {view === 'onboarding' && <Onboarding/>}
      </main>
      {view !== 'onboarding' && aiMode !== 'collapsed' && (
        <AISidekick setAIMode={setAIMode} aiMode={aiMode} view={view}/>
      )}
      {aiMode === 'collapsed' && view !== 'onboarding' && (
        <button className="ai-rail-btn" onClick={() => setAIMode('companion')} title="Open coach">
          <Icon name="sparkle" size={22}/>
        </button>
      )}

      {/* Secondary nav: onboarding entry */}
      {view !== 'onboarding' && (
        <button onClick={() => setView('onboarding')} style={{position:'fixed', left:16, bottom:16, zIndex:300, background:'transparent', border:'1px solid var(--line)', padding:'6px 12px', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', color:'var(--ink-4)', background:'var(--paper)'}}>
          See onboarding
        </button>
      )}

      {tweaksOn && (
        <TweaksPanel
          shape={shape} setShape={setShape}
          accent={accent} setAccent={setAccent}
          aiMode={aiMode} setAIMode={setAIMode}
        />
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
