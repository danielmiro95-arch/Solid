// prototype-views.jsx — Detail, Player, Coach, Onboarding, Path, Profile, WhatsApp (es)

const { useState: useS2, useEffect: useE2 } = React;

const CAT_COLORS = {
  'Fundamentos': '#0072BE', 'Estructura': '#005a96', 'Gobernanza': '#3d31cc',
  'Social Publish': '#6E50EE', 'Activos': '#036837', 'Aprobaciones': '#8A3992',
  'Compliance': '#1a1a2e', 'Calendario': '#0072BE', 'Analytics': '#004d8a',
  'Care': '#B8001F', 'Integraciones': '#3d31cc',
};

const RepsolDetailCover = ({ pill, category, title }) => {
  const accent = CAT_COLORS[category] || '#0D1117';
  return (
    <div style={{position:'absolute', inset:0, background:`linear-gradient(160deg, ${accent} 0%, #080e1a 100%)`, overflow:'hidden'}}>
      <div style={{position:'absolute', top:0, left:0, right:0, height:4, background:'#6E50EE'}}/>
      <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 28px)'}}/>
      <div style={{position:'absolute', right:-20, bottom:-20, fontSize:160, fontWeight:800, fontFamily:'var(--mono)', color:'rgba(255,255,255,0.04)', lineHeight:1, letterSpacing:'-0.05em', userSelect:'none'}}>
        {pill != null ? String(pill).padStart(2,'0') : ''}
      </div>
      <div style={{position:'absolute', bottom:24, left:24, right:24}}>
        <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:8}}>{window.WORKSPACE_NAME || 'Tu workspace'}</div>
        {category && <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', fontWeight:700, marginBottom:8}}>{category}</div>}
        <div style={{fontFamily:'var(--sans)', fontSize:18, fontWeight:600, color:'#fff', lineHeight:1.25, letterSpacing:'-0.01em'}}>{title}</div>
      </div>
    </div>
  );
};

// ---------- StarRating · puntuar de 1 a 5 estrellas ----------
function StarRating({ pillId, size = 28, showCount = true, label = '¿Qué tal este vídeo?' }) {
  const initial = (window.Ratings && pillId) ? window.Ratings.get(pillId) : 0;
  const [stars, setStars] = useS2(initial);
  const [hover, setHover] = useS2(0);
  const agg = (window.Ratings && pillId) ? window.Ratings.aggregateForPill(pillId) : { avg:0, count:0 };
  const [aggState, setAggState] = useS2(agg);

  // Refresca aggregado cuando hay cambios externos
  useE2(() => {
    const onChange = () => {
      if (window.Ratings) setAggState(window.Ratings.aggregateForPill(pillId));
    };
    window.addEventListener('ratings-changed', onChange);
    return () => window.removeEventListener('ratings-changed', onChange);
  }, [pillId]);

  const pick = (n) => {
    const next = stars === n ? 0 : n; // click en la misma → desmarca
    setStars(next);
    if (window.Ratings && pillId) window.Ratings.set(pillId, next);
    if (window.Ratings && pillId) setAggState(window.Ratings.aggregateForPill(pillId));
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      {label && (
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700}}>
          ★ {label}
        </div>
      )}
      <div style={{display:'flex', alignItems:'center', gap:14}}>
        <div style={{display:'flex', gap:4}} onMouseLeave={() => setHover(0)}>
          {[1,2,3,4,5].map(n => {
            const filled = (hover || stars) >= n;
            return (
              <button key={n}
                onClick={() => pick(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`Puntuar con ${n} estrella${n>1?'s':''}`}
                style={{
                  background:'transparent', border:'none', cursor:'pointer', padding:2,
                  color: filled ? '#F4B740' : 'rgba(15,23,42,0.18)',
                  fontSize: size, lineHeight:1,
                  transition:'transform .12s, color .12s',
                  transform: hover === n ? 'scale(1.15)' : 'scale(1)',
                }}>
                {filled ? '★' : '☆'}
              </button>
            );
          })}
        </div>
        {showCount && (
          <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', display:'flex', gap:8, alignItems:'center'}}>
            {aggState.count > 0 ? (
              <>
                <span><strong style={{color:'var(--ink)'}}>{aggState.avg}</strong> / 5</span>
                <span>·</span>
                <span>{aggState.count} puntuaci{aggState.count===1?'ón':'ones'}</span>
              </>
            ) : (
              <span>Sé el primero en puntuar</span>
            )}
            {stars > 0 && (
              <>
                <span>·</span>
                <span style={{color:'var(--ok)'}}>Tu voto: {stars}★</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Carga la YouTube IFrame API una sola vez (singleton) · resuelve cuando
// window.YT.Player está disponible. Permite leer getCurrentTime/getDuration
// del vídeo real para registrar progreso (antes solo el player simulado lo hacía).
let _ytApiPromise = null;
function _loadYouTubeAPI() {
  if (_ytApiPromise) return _ytApiPromise;
  _ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') { try { prev(); } catch (e) {} }
      resolve(window.YT);
    };
    if (!document.getElementById('yt-iframe-api')) {
      const s = document.createElement('script');
      s.id = 'yt-iframe-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  });
  return _ytApiPromise;
}

function Player({ back, item }) {
  const startAt = (item && typeof item.startAt === 'number') ? item.startAt : 45;
  const [playing, setPlaying] = useS2(true);
  const [currentSec, setCurrentSec] = useS2(startAt);
  const [speed, setSpeed] = useS2(1);
  const [muted, setMuted] = useS2(false);
  const [showSubs, setShowSubs] = useS2(true);
  // Resolución defensiva · item del prop, si no fallback a una pill con video
  // de window.PILLS, si no la primera pill, si no null. Cubre el caso del
  // boot con view='player' restaurado de localStorage sin item asociado.
  const _allPills = (typeof window !== 'undefined' && window.PILLS) || [];
  const _realIt = item || _allPills.find(p => p && p.yt) || _allPills.find(p => p && p.mp4) || _allPills[0] || null;
  // Placeholder en vez de `return null` temprano · así TODOS los hooks de abajo
  // corren siempre (Rules of Hooks). El render-null se hace al final, tras los
  // hooks. Sin esto, si `it` pasaba de null→pill (boot con view='player'
  // restaurado antes de cargar PILLS) el nº de hooks cambiaba → crash.
  const it = _realIt || { id: null, title: '', duration: '', level: '', _placeholder: true };
  React.useEffect(() => { if (it._placeholder && back) back(); }, [it._placeholder]);
  const mp4Url = (it && it.mp4 && window.pillVideoUrl) ? window.pillVideoUrl(it.mp4) : null;
  const hasVideo = !!(it.yt || mp4Url);

  // Chapter markers hardcoded del player · genéricos cuando demo activo
  // para no leak "Repsol" / "Sprinklr" que son específicos del workspace
  // original. Sin tabla de capítulos por pill todavía.
  const _dmChapters = window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive();
  const chapters = _dmChapters ? [
    { n: 1, t: 'Introducción y contexto',          d: '0:00 · 0:52', tone: 'teal',  start: 0,   end: 52 },
    { n: 2, t: 'Conceptos clave',                  d: '0:52 · 1:10', tone: 'plum',  start: 52,  end: 122 },
    { n: 3, t: 'Flujo de trabajo paso a paso',     d: '2:02 · 1:18', tone: 'clay',  start: 122, end: 200, active: true },
    { n: 4, t: 'Ejemplos reales',                  d: '3:20 · 0:45', tone: 'olive', start: 200, end: 245 },
    { n: 5, t: 'Errores comunes y cómo evitarlos', d: '4:05 · 0:55', tone: 'warm',  start: 245, end: 300 },
  ] : [
    { n: 1, t: 'Introducción y contexto en Repsol', d: '0:00 · 0:52', tone: 'teal',  start: 0,   end: 52 },
    { n: 2, t: 'Interfaz y accesos en Sprinklr',    d: '0:52 · 1:10', tone: 'plum',  start: 52,  end: 122 },
    { n: 3, t: 'Flujo de trabajo paso a paso',      d: '2:02 · 1:18', tone: 'clay',  start: 122, end: 200, active: true },
    { n: 4, t: 'Casos reales del equipo Repsol',    d: '3:20 · 0:45', tone: 'olive', start: 200, end: 245 },
    { n: 5, t: 'Errores comunes y cómo evitarlos',  d: '4:05 · 0:55', tone: 'warm',  start: 245, end: 300 },
  ];
  // Duración REAL del pill · el reloj simulado, el % de progreso y el trigger
  // de "completado" se basan en esto (antes era 300s fijo · el % y el complete
  // al 95% estaban mal para vídeos de otra duración).
  function _parseDuration(dur) {
    if (!dur || typeof dur !== 'string') return 300; // fallback 5 min
    const d = dur.trim().toLowerCase();
    const ssOnly = d.match(/^:(\d{1,2})$/);
    if (ssOnly) return parseInt(ssOnly[1], 10);
    const hm = d.match(/^(\d+)\s*h\s*(\d+)?(\s*m)?$/);
    if (hm) return parseInt(hm[1], 10) * 3600 + (hm[2] ? parseInt(hm[2], 10) * 60 : 0);
    const minOnly = d.match(/^(\d+)\s*min$/);
    if (minOnly) return parseInt(minOnly[1], 10) * 60;
    const mss = d.match(/^(\d+):(\d{2})$/);
    if (mss) return parseInt(mss[1], 10) * 60 + parseInt(mss[2], 10);
    return 300;
  }
  const pillTotalSec = _parseDuration(it && it.duration);
  const totalSec = pillTotalSec; // el reloj/%/complete usan la duración real
  const fmtTime = (s) => Math.floor(s/60) + ':' + (Math.round(s) % 60).toString().padStart(2,'0');

  // Reloj simulado (sólo en path SIN YouTube — el iframe de YT no se controla sin la IFrame API)
  useE2(() => {
    if (hasVideo) return; // YT iframe maneja su propio tiempo
    if (!playing) return;
    const t = setInterval(() => {
      setCurrentSec(c => {
        const next = c + speed;
        if (next >= totalSec) { setPlaying(false); return totalSec; }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, speed, hasVideo]);

  // ── Progress tracking · escribe en public.progress vía window.Progress ─
  // Al abrir la pill se registra start (progress=0 si no existe). Mientras
  // se ve, update con el % actual + duración del pill para acumular
  // watch_seconds (alimenta métrica time_invested). Al >=95% se marca
  // complete. Si el user es anónimo o no hay workspace, no-op silencioso.

  useE2(() => {
    if (!it || !it.id) return;
    if (window.Progress && window.Progress.start) window.Progress.start(it.id);
  }, [it && it.id]);

  // ── Tracking de progreso con VÍDEO REAL ──────────────────────────────────
  // trackProgress recibe el tiempo/duración reales (de <video> mp4 o de la YT
  // IFrame API) y escribe en window.Progress. Throttle a 5s para no spamear la
  // DB, salvo el complete (95%) que se registra al instante.
  const _lastTrackRef = React.useRef(0);
  const _videoRef = React.useRef(null);
  const _ytIframeRef = React.useRef(null);
  const _ytPlayerRef = React.useRef(null);
  const trackProgress = React.useCallback((cur, dur) => {
    if (!it || !it.id || !window.Progress || !dur || dur < 1) return;
    const pct = cur / dur;
    if (pct >= 0.95) {
      if (window.Progress.complete) window.Progress.complete(it.id, Math.round(dur));
      _lastTrackRef.current = Date.now();
      return;
    }
    const now = Date.now();
    if (now - _lastTrackRef.current < 5000) return; // throttle 5s
    _lastTrackRef.current = now;
    if (pct > 0 && window.Progress.update) window.Progress.update(it.id, pct, Math.round(dur));
  }, [it && it.id]);

  // Tracking del player SIMULADO (sin vídeo) · para vídeo real usamos
  // trackProgress vía onTimeUpdate (mp4) / polling YT (abajo).
  useE2(() => {
    if (hasVideo) return; // con vídeo real, el tracking lo lleva trackProgress
    if (!it || !it.id || !window.Progress) return;
    const pct = totalSec > 0 ? currentSec / totalSec : 0;
    if (pct >= 0.95) {
      window.Progress.complete(it.id, pillTotalSec);
    } else if (pct > 0) {
      window.Progress.update(it.id, pct, pillTotalSec);
    }
  }, [currentSec, it && it.id]);

  // YouTube · adjunta YT.Player al iframe (enablejsapi) y sondea el tiempo real.
  useE2(() => {
    if (!it || !it.yt) return;
    let interval = null;
    let cancelled = false;
    _loadYouTubeAPI().then((YT) => {
      if (cancelled || !_ytIframeRef.current || !YT || !YT.Player) return;
      try {
        _ytPlayerRef.current = new YT.Player(_ytIframeRef.current, {
          events: {
            onReady: () => {
              interval = setInterval(() => {
                const p = _ytPlayerRef.current;
                if (!p || !p.getCurrentTime || !p.getPlayerState) return;
                // 1 = playing
                if (p.getPlayerState() !== 1) return;
                try { trackProgress(p.getCurrentTime(), p.getDuration()); } catch (e) {}
              }, 3000);
            },
          },
        });
      } catch (e) { /* tolerante */ }
    });
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try { if (_ytPlayerRef.current && _ytPlayerRef.current.destroy) _ytPlayerRef.current.destroy(); } catch (e) {}
      _ytPlayerRef.current = null;
    };
  }, [it && it.yt]);

  // En demo · player BLOQUEA fast-forward (seek hacia delante). Permite
  // pausar, retroceder, y avanzar hasta donde ya hayas visto. Por spec:
  // "en los videos no puedes darle a correr hacia delante".
  const _demoPlayer = window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive();
  const [_maxSeen, _setMaxSeen] = useS2(0);
  useE2(() => { _setMaxSeen(m => Math.max(m, currentSec)); }, [currentSec]);

  // Atajos de teclado: espacio = play/pause, ← → = seek 10s, M = mute
  useE2(() => {
    if (hasVideo) return; // los YT iframes capturan los eventos
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); setCurrentSec(c => Math.max(0, c - 10)); }
      else if (e.code === 'ArrowRight') {
        e.preventDefault();
        // En demo · ArrowRight sólo permite avanzar hasta donde ya viste
        if (_demoPlayer) {
          setCurrentSec(c => Math.min(_maxSeen, c + 10));
          if (window.Toast && (currentSec + 10) > _maxSeen) {
            window.Toast.info('Esta sección aún no la has visto');
          }
        } else {
          setCurrentSec(c => Math.min(totalSec, c + 10));
        }
      }
      else if (e.code === 'KeyM') { e.preventDefault(); setMuted(m => !m); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasVideo, _demoPlayer, _maxSeen, currentSec]);

  const seekTo = (sec) => {
    // Demo · sólo permite seek a posiciones ya vistas (no fast-forward)
    if (_demoPlayer && sec > _maxSeen) {
      if (window.Toast) window.Toast.info('No puedes saltar contenido que aún no has visto', { icon:'🔒' });
      return;
    }
    setCurrentSec(Math.max(0, Math.min(totalSec, sec)));
  };
  const seekBar = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct * totalSec);
  };
  const currentChapter = chapters.find(c => currentSec >= c.start && currentSec < c.end) || chapters[0];

  // Fullscreen toggle nativo del navegador
  const playerStageRef = React.useRef(null);
  const toggleFullscreen = () => {
    const el = playerStageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen && document.exitFullscreen();
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el);
    }
  };

  // Render-null TRAS todos los hooks · si no hay pill real, no pintamos el
  // player (el efecto de arriba ya disparó back()).
  if (it._placeholder) return null;

  return (
    <div className="player-root">
      <div className="player-stage" ref={playerStageRef}>
        <button onClick={toggleFullscreen} className="player-fullscreen-btn" title="Pantalla completa" aria-label="Pantalla completa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/>
          </svg>
        </button>
        {hasVideo ? (
          <>
            {mp4Url ? (
              <video
                key={it.id}
                ref={_videoRef}
                src={mp4Url + '#t=' + Math.floor(startAt)}
                controls
                autoPlay
                playsInline
                poster={it.poster || undefined}
                onTimeUpdate={e => trackProgress(e.currentTarget.currentTime, e.currentTarget.duration)}
                style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', zIndex:1, background:'#000', objectFit:'contain'}}
              />
            ) : (
            <iframe
              key={it.yt}
              ref={_ytIframeRef}
              src={`https://www.youtube.com/embed/${it.yt}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1&color=white&start=${Math.floor(startAt)}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', zIndex:1}}
            />
            )}
            <div className="player-overlay-top" style={{zIndex:2, pointerEvents:'none'}}>
              <button onClick={back} style={{pointerEvents:'all'}} className="back">
                <Icon name="back" size={12}/> Volver al módulo
              </button>
              <div style={{display:'flex', gap:8, pointerEvents:'all'}}>
                <button className="back" onClick={() => { const setAIMode = window.__setAIMode; if (setAIMode) setAIMode('hero'); else if (window.Toast) window.Toast.info('Abre BeonAI desde el botón inferior', { icon:'✦' }); }} style={{background:'rgba(108,95,252,0.15)', border:'1px solid rgba(108,95,252,0.4)', color:'var(--accent-glow)'}}>
                  ✦ BeonAI activo
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{position:'absolute',inset:0, background:`linear-gradient(135deg, var(--bn-blue) 0%, #001f3d 100%)`}}/>
            <div style={{position:'absolute',inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, zIndex:1}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:4}}>{(window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive()) ? it.category : `Think Pill ${it.pill ?? ''} · ${it.category}`}</div>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:700, fontSize:'clamp(22px,3vw,36px)', color:'#fff', textAlign:'center', maxWidth:480, lineHeight:1.2, padding:'0 32px'}}>{it.title}</div>
              <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4}}>{(window.DemoMode && window.DemoMode.flag('hide_durations') === true) ? it.teacher : `${it.teacher} · ${it.duration}`}</div>
            </div>
            <div className="player-overlay-top">
              <button className="back" onClick={back}><Icon name="back" size={12}/> Volver al módulo</button>
              <div style={{display:'flex', gap:8}}>
                <button className="back" onClick={() => setShowSubs(s => !s)} title={showSubs ? 'Desactivar subtítulos' : 'Activar subtítulos'} style={{background: showSubs ? 'rgba(108,95,252,0.18)' : 'transparent'}}><Icon name="caption" size={12}/> SUB</button>
                <button className="back" onClick={() => { const setAIMode = window.__setAIMode; if (setAIMode) setAIMode('hero'); else if (window.Toast) window.Toast.info('Abre BeonAI desde el botón inferior', { icon:'✦' }); }}>BeonAI activo</button>
              </div>
            </div>
            <div className="player-overlay-bottom">
              <div className="title-row">
                <div>
                  <div className="t-eyebrow">{it.category} · capítulo {currentChapter.n} · {currentChapter.t}</div>
                  <div className="title">{it.title}</div>
                  <div className="sub">{(it.teacher || 'BeonIt').toUpperCase()} · {it.duration}</div>
                </div>
              </div>
              {/* Scrubber clickeable con marcadores de capítulos */}
              <div className="scrubber" onClick={seekBar} style={{cursor: _demoPlayer ? 'default' : 'pointer', position:'relative'}}>
                <i style={{width: (currentSec / totalSec * 100) + '%'}}/>
                <b style={{left: (currentSec / totalSec * 100) + '%'}}/>
                {/* En demo · zona "no vista" sombreada para indicar que está bloqueada */}
                {_demoPlayer && _maxSeen < totalSec && (
                  <span style={{
                    position:'absolute', left: (_maxSeen / totalSec * 100) + '%', right:0, top:0, bottom:0,
                    background:'rgba(0,0,0,0.4)', backdropFilter:'blur(1px)', pointerEvents:'none', borderRadius:'0 4px 4px 0',
                  }}/>
                )}
                {chapters.slice(1).map(ch => (
                  <span key={ch.n} style={{position:'absolute', left: (ch.start / totalSec * 100) + '%', top:-2, width:2, height:8, background:'rgba(255,255,255,0.6)', borderRadius:1, pointerEvents:'none'}}/>
                ))}
              </div>
              <div className="player-controls">
                <button onClick={() => seekTo(currentSec - 10)} title="Atrás 10s (←)"><Icon name="skip" size={18}/></button>
                <button className="play" onClick={() => setPlaying(!playing)} title="Play / pausa (espacio)"><Icon name={playing ? 'pause' : 'play'} size={20}/></button>
                <button onClick={() => seekTo(currentSec + 10)} title={_demoPlayer ? 'Bloqueado en demo · no puedes saltar contenido' : 'Avanzar 10s (→)'} disabled={_demoPlayer && (currentSec + 10) > _maxSeen} style={_demoPlayer && (currentSec + 10) > _maxSeen ? {opacity:0.35, cursor:'not-allowed'} : undefined}><Icon name="next" size={18}/></button>
                <button className="pill-btn" onClick={() => setSpeed(s => s === 1 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 0.75 : 1)} title="Velocidad de reproducción">{speed}×</button>
                <button className="pill-btn" onClick={() => setShowSubs(s => !s)} style={{opacity: showSubs ? 1 : 0.5}} title="Subtítulos">SUB</button>
                <button onClick={() => setMuted(m => !m)} title="Silenciar (M)" style={{opacity: muted ? 0.5 : 1}}><Icon name="vol" size={18}/></button>
                <span className="time">{fmtTime(currentSec)} / {fmtTime(totalSec)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rating · puntuar de 1 a 5 estrellas */}
      <div style={{padding:'14px 24px', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, marginTop:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
        <StarRating pillId={it.id} label="¿Te ha gustado este vídeo?"/>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink-4)', maxWidth:300, lineHeight:1.5}}>
          Tu puntuación ayuda a otros agentes a descubrir el mejor contenido.
        </div>
      </div>

      {/* Below video: pill info + related */}
      <div className="player-chapter-bar">
        <div className="pchap active" style={{flex:'0 0 280px'}}>
          <div className="thumb"><div className={`ph ${it.tone || 'teal'}`}/></div>
          <div>
            <div className="n">REPRODUCIENDO AHORA</div>
            <div className="t">{it.title}</div>
            <div className="d">{it.teacher} · {it.duration} · {it.category}</div>
          </div>
        </div>
        {PILLS.filter(p => p.yt && p.id !== it.id).slice(0, 4).map(c => (
          <div key={c.id} className="pchap" onClick={() => { back(); setTimeout(() => window.dispatchEvent(new CustomEvent('__openPlayer', {detail: c})), 50); }}>
            <div className="thumb"><div className={`ph ${c.tone}`}/></div>
            <div>
              <div className="n">CON VÍDEO</div>
              <div className="t">{c.title}</div>
              <div className="d">{c.teacher} · {c.duration}</div>
            </div>
          </div>
        ))}
        {!hasVideo && chapters.map(c => (
          <div key={c.n} className={`pchap ${c.active ? 'active' : ''}`}
            onClick={() => { setCurrentSec(c.start || 0); setPlaying(true); }}
            title={`Saltar a ${Math.floor((c.start||0)/60)}:${((c.start||0)%60).toString().padStart(2,'0')}`}
            style={{ cursor:'pointer' }}>
            <div className="thumb"><div className={`ph ${c.tone}`}/></div>
            <div>
              <div className="n">LECCIÓN {String(c.n).padStart(2,'0')}</div>
              <div className="t">{c.t}</div>
              <div className="d">{c.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- AI Sidekick ----------
function AISidekick({ setAIMode, aiMode, view }) {
  const [input, setInput] = useS2('');
  const [loading, setLoading] = useS2(false);
  const [dynMsgs, setDynMsgs] = useS2([]);
  const [happyPulse, setHappyPulse] = useS2(false);
  const feedRef = React.useRef(null);

  // Mood del BeonAIChar · cambia según el estado del chat
  // - typing input: 'curious' (mirando lo que escribes)
  // - loading API: 'thinking' (un ojo cerrado)
  // - recién respondido: 'happy' (sonrisa breve · 1.5s)
  // - idle sin actividad: 'idle' (parpadeo)
  // - default: 'neutral'
  const mood = (() => {
    if (loading) return 'thinking';
    if (happyPulse) return 'happy';
    if (input.length > 0) return 'curious';
    if (dynMsgs.length === 0) return 'neutral';
    return 'neutral';
  })();

  const contextLabel = {
    home: 'Vista general · tu progreso',
    player: 'Viendo módulo · Programar posts',
    detail: 'Detalle de módulo',
    path: 'Tu ruta de certificación',
    dashboard: 'Analytics · visión admin',
    coach: 'BeonAI · modo completo',
  }[view] || (window.WORKSPACE_NAME ? ('Contexto ' + window.WORKSPACE_NAME) : 'Plataforma · contexto tu workspace');

  // Acciones rápidas con icono · más presencia visual (estilo design)
  const QUICK = [
    { icon: '🎯', label: '¿Qué módulo sigue?', q: '¿Cuál es el siguiente módulo que debería hacer según mi ruta?', accent: 'var(--bai-cyan)' },
    { icon: '🧪', label: 'Hazme un quiz',      q: 'Hazme 3 preguntas de repaso sobre lo que he visto hasta ahora.', accent: 'var(--bai-blue)' },
    { icon: '⚡', label: 'Flujo aprobación',    q: '¿Cómo funciona el flujo de aprobación urgente?', accent: 'var(--bai-violet)' },
    { icon: '⚙️', label: 'Macros',              q: '¿Qué es una macro y cómo se usa en el día a día?', accent: 'var(--bai-lav)' },
  ];

  // Acciones según el trabajo (cambian moods + tone)
  const TASK_CHIPS = [
    { label: 'Resumir',        prefix: 'Resume en 3 puntos: ', mood:'thinking' },
    { label: 'Plan en pasos',  prefix: 'Conviértelo en un plan paso a paso: ', mood:'thinking' },
    { label: 'Citar fuente',   prefix: 'Cita la fuente exacta (think pill nº) de: ', mood:'curious' },
    { label: 'Traducir',       prefix: 'Tradúcelo al inglés: ', mood:'curious' },
  ];

  // BeonAI: respuestas vienen 100% de /api/chat (Claude + KB del workspace
  // vía BeonAIConfigPanel). Antes había un diccionario SIDE_DEMOS hardcoded
  // que devolvía respuestas falsas si /api/chat fallaba · disfrazaba caídas
  // como respuestas legítimas. Eliminado · si el backend falla mostramos
  // error claro y el user puede reintentar.

  React.useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [dynMsgs.length, loading]);

  // Actualiza el texto del ÚLTIMO mensaje de asistente (para streaming).
  const _patchLastAssistant = (patch) => setDynMsgs(m => {
    const c = [...m];
    for (let i = c.length - 1; i >= 0; i--) { if (c[i].role === 'assistant') { c[i] = { ...c[i], ...patch }; break; } }
    return c;
  });

  const sendMsg = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading) return;
    const history = dynMsgs;
    setDynMsgs(m => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', streaming: true }]);
    setInput('');
    setLoading(true);

    // Persistencia · asegura conversación activa y guarda el mensaje de usuario.
    // El overlay ahora comparte historial con la vista Coach (antes no guardaba).
    let convId = null;
    try {
      const CH = window.ChatHistory;
      if (CH) {
        convId = (CH.activeId && CH.activeId()) || null;
        if (!convId && CH.create) { const c = CH.create([]); convId = c && c.id; }
        if (convId && CH.appendMessage) CH.appendMessage(convId, { role: 'user', text: q });
      }
    } catch (e) {}

    let streamed = '';
    try {
      const reply = await callMentorAPI([...history, { role: 'user', text: q }], (delta, full) => {
        streamed = full;
        _patchLastAssistant({ text: full, streaming: true });
      });
      const finalText = reply || streamed;
      _patchLastAssistant({ text: finalText, streaming: false });
      try { if (convId && window.ChatHistory && window.ChatHistory.appendMessage) window.ChatHistory.appendMessage(convId, { role: 'assistant', text: finalText }); } catch (e) {}
    } catch (err) {
      const detail = (err && err.message) || 'sin detalle';
      _patchLastAssistant({
        text: '⚠ BeonAI no está disponible ahora mismo. Si esto persiste, comprueba que el admin del workspace ha configurado el panel de BeonAI (Admin → BeonAI). Detalle técnico: ' + detail,
        streaming: false, isError: true,
      });
    }
    setLoading(false);
    setHappyPulse(true);
    setTimeout(() => setHappyPulse(false), 1800);
  };

  // Tokens modo día · light theme
  const SURFACE   = '#FFFFFF';
  const SURFACE_2 = '#F7F8FB';
  const BORDER    = 'rgba(15, 23, 42, 0.08)';
  const BORDER_2  = 'rgba(15, 23, 42, 0.12)';
  const INK       = '#0F172A';
  const INK_MUTED = '#64748B';
  const INK_DIM   = '#94A3B8';

  return (
    <aside className="ai bai-light" style={{
      background: SURFACE,
      color: INK,
      /* sin borderLeft · ahora es popup, no sidebar · CSS define border-radius */
    }}>
      {/* HEADER · BeonAIChar grande con mood + título + acciones */}
      <div className="ai-head" style={{padding:'18px 18px 14px', borderBottom:`1px solid ${BORDER}`, background:'transparent'}}>
        <div className="ai-head-left" style={{flex:1, display:'flex', alignItems:'center', gap:12}}>
          {window.BeonAIChar
            ? <BeonAIChar size={44} mood={mood} float interactive={false}/>
            : <span className="orb"/>}
          <div style={{flex:1, minWidth:0}}>
            <div className="title" style={{fontFamily:'var(--font-sans, Inter)', fontWeight:700, fontSize:16, color:INK, letterSpacing:'-0.015em', display:'flex', alignItems:'center', gap:6}}>
              BeonAI
              <span style={{fontFamily:'var(--font-mono, monospace)', fontSize:9, fontWeight:700, letterSpacing:'0.12em', padding:'2px 6px', background:'linear-gradient(135deg, var(--bai-cyan, #4FC3F7), var(--bai-violet, #6E50EE))', color:'#fff', borderRadius:4}}>BETA</span>
            </div>
            <div className="sub" style={{fontSize:11, color:INK_MUTED, fontFamily:'var(--font-mono, monospace)', letterSpacing:'0.06em', marginTop:2}}>
              <span style={{color: loading ? '#F4B740' : '#22C55E'}}>●</span> {loading ? 'pensando…' : contextLabel}
            </div>
          </div>
        </div>
        <button onClick={() => setAIMode(aiMode === 'hero' ? 'companion' : 'hero')}
          style={{background:SURFACE_2, border:`1px solid ${BORDER}`, color:INK_MUTED, padding:'4px 8px', borderRadius:6, fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:600, cursor:'pointer', letterSpacing:'0.04em'}}
          title={aiMode === 'hero' ? 'Reducir panel' : 'Ampliar panel'}>
          {aiMode === 'hero' ? '—' : '↔'}
        </button>
        <button onClick={() => setAIMode('collapsed')}
          style={{background:SURFACE_2, border:`1px solid ${BORDER}`, color:INK_MUTED, padding:'4px 8px', borderRadius:6, fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:600, cursor:'pointer', marginLeft:4}}
          title="Cerrar">×</button>
      </div>

      {/* FEED · mensajes */}
      <div className="ai-body" ref={feedRef} style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:14, overflowY:'auto', flex:1, background:SURFACE}}>
        {view === 'player' && (
          <div style={{padding:'12px 14px', background:SURFACE_2, border:`1px solid ${BORDER}`, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:42, height:42, borderRadius:8, background:'linear-gradient(135deg, var(--bai-cyan, #4FC3F7), var(--bai-violet, #6E50EE))', flexShrink:0}}/>
            <div>
              <div style={{fontFamily:'var(--font-mono, monospace)', fontSize:9, color:INK_DIM, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3}}>Viendo ahora</div>
              <div style={{fontSize:13, fontWeight:600, color:INK}}>Programar posts · Lección 3 de 5</div>
            </div>
          </div>
        )}

        {/* Mensaje inicial · saludo */}
        {dynMsgs.length === 0 && !loading && (
          <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            {window.BeonAIChar && <BeonAIChar size={28} mood="neutral" interactive={false}/>}
            <div style={{flex:1, padding:'12px 14px', background:SURFACE_2, border:`1px solid ${BORDER}`, borderRadius:'4px 12px 12px 12px', color:INK, fontSize:13.5, lineHeight:1.55}}>
              ¡Hola! Soy <strong style={{background:'linear-gradient(135deg, var(--bai-cyan, #4FC3F7), var(--bai-violet, #6E50EE))', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', fontWeight:700}}>BeonAI</strong>. Llevas un <span style={{background:'linear-gradient(180deg, transparent 62%, rgba(188,214,48,0.45) 62%)', padding:'0 3px'}}>58% de tu certificación</span>. ¿En qué te ayudo?
            </div>
          </div>
        )}

        {/* Quick action cards · más presencia */}
        {dynMsgs.length === 0 && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4}}>
            {QUICK.map((q, i) => (
              <button key={i} onClick={() => sendMsg(q.q)}
                style={{
                  padding:'12px 12px', background:SURFACE_2, border:`1px solid ${BORDER}`,
                  borderRadius:10, cursor:'pointer', textAlign:'left',
                  display:'flex', flexDirection:'column', gap:6, transition:'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#EEF2F7'; e.currentTarget.style.borderColor=q.accent; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(15,23,42,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background=SURFACE_2; e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                <span style={{fontSize:18, lineHeight:1}}>{q.icon}</span>
                <span style={{fontSize:12.5, color:INK, fontWeight:600, fontFamily:'var(--font-sans, Inter)', lineHeight:1.3}}>{q.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mensajes dinámicos */}
        {dynMsgs.map((m, i) => (
          m.role === 'assistant' ? (
            <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
              {window.BeonAIChar && <BeonAIChar size={28} mood="neutral" interactive={false}/>}
              <div style={{flex:1, padding:'12px 14px', background:SURFACE_2, border:`1px solid ${BORDER}`, borderRadius:'4px 12px 12px 12px', color:INK, fontSize:13.5, lineHeight:1.55, whiteSpace:'pre-wrap'}}>
                {m.text}{m.streaming ? <span style={{opacity:0.6}}> ▍</span> : ''}
              </div>
            </div>
          ) : (
            <div key={i} style={{display:'flex', justifyContent:'flex-end'}}>
              <div style={{maxWidth:'85%', padding:'10px 14px', background:'linear-gradient(135deg, var(--bai-violet, #6E50EE), var(--bai-blue, #3B82F6))', color:'#fff', borderRadius:'12px 12px 4px 12px', fontSize:13.5, lineHeight:1.5, fontFamily:'var(--font-sans, Inter)', boxShadow:'0 4px 14px rgba(110, 80, 238, 0.25)'}}>
                {m.text}
              </div>
            </div>
          )
        ))}

        {/* Loading indicator · solo si NO hay ya una burbuja en streaming
            (con streaming el cursor ▍ de la burbuja cubre el "pensando"). */}
        {loading && !dynMsgs.some(m => m.streaming) && (
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            {window.BeonAIChar && <BeonAIChar size={28} mood="thinking" interactive={false}/>}
            <div style={{padding:'12px 14px', background:SURFACE_2, border:`1px solid ${BORDER}`, borderRadius:'4px 12px 12px 12px', display:'flex', gap:5, alignItems:'center'}}>
              <span style={{width:5, height:5, borderRadius:'50%', background:'var(--bai-cyan, #4FC3F7)', animation:'mentorDot 1.4s ease-in-out infinite both'}}/>
              <span style={{width:5, height:5, borderRadius:'50%', background:'var(--bai-blue, #3B82F6)', animation:'mentorDot 1.4s ease-in-out .15s infinite both'}}/>
              <span style={{width:5, height:5, borderRadius:'50%', background:'var(--bai-violet, #6E50EE)', animation:'mentorDot 1.4s ease-in-out .3s infinite both'}}/>
            </div>
          </div>
        )}
      </div>

      {/* COMPOSER · chips de tarea + input */}
      <div className="ai-input-wrap" style={{padding:'12px 14px 14px', borderTop:`1px solid ${BORDER}`, background:SURFACE_2}}>
        {dynMsgs.length > 0 && (
          <div style={{display:'flex', gap:5, marginBottom:10, flexWrap:'wrap'}}>
            {TASK_CHIPS.map((c, i) => (
              <button key={i} onClick={() => setInput(c.prefix)}
                style={{padding:'4px 10px', fontFamily:'var(--font-mono, monospace)', fontSize:10, fontWeight:600, letterSpacing:'0.04em', background:SURFACE, color:INK_MUTED, border:`1px solid ${BORDER}`, borderRadius:999, cursor:'pointer', transition:'all .12s'}}
                onMouseEnter={e => { e.currentTarget.style.background='#EEF2F7'; e.currentTarget.style.color=INK; e.currentTarget.style.borderColor=BORDER_2; }}
                onMouseLeave={e => { e.currentTarget.style.background=SURFACE; e.currentTarget.style.color=INK_MUTED; e.currentTarget.style.borderColor=BORDER; }}>
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div style={{display:'flex', gap:6, alignItems:'center', padding:'8px 10px', background:SURFACE, border:`1px solid ${BORDER_2}`, borderRadius:10, transition:'border-color .15s', boxShadow:'0 2px 6px rgba(15,23,42,0.04)'}}
          onFocus={e => e.currentTarget.style.borderColor='var(--bai-violet, #6E50EE)'}
          onBlur={e => e.currentTarget.style.borderColor=BORDER_2}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Pregunta a BeonAI…"
            style={{flex:1, background:'transparent', border:'none', outline:'none', color:INK, fontFamily:'var(--font-sans, Inter)', fontSize:13.5}}
          />
          <button onClick={() => sendMsg()} disabled={!input.trim() || loading}
            title={loading ? 'BeonAI pensando…' : 'Enviar a BeonAI'}
            aria-label="Enviar a BeonAI"
            className="bai-send"
            style={{
              width:38, height:38, borderRadius:'50%',
              padding:0, border:'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, var(--bai-cyan, #4FC3F7), var(--bai-violet, #6E50EE))'
                : 'rgba(255,255,255,0.06)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
              opacity: input.trim() && !loading ? 1 : 0.55,
              boxShadow: input.trim() && !loading
                ? '0 4px 14px rgba(110, 80, 238, 0.45), 0 0 0 1px rgba(255,255,255,0.15) inset'
                : 'none',
              transition:'all .15s',
            }}>
            {window.BeonAIChar
              ? <BeonAIChar size={30} mood={loading ? 'thinking' : (input.trim() ? 'happy' : 'neutral')} interactive={false}/>
              : <Icon name="send" size={13}/>}
          </button>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, fontFamily:'var(--font-mono, monospace)', fontSize:9, letterSpacing:'0.06em', color:INK_DIM, textTransform:'uppercase'}}>
          <span>★ Contexto: {view} · ruta · progreso</span>
          <span>↵ enviar · ⇧↵ línea</span>
        </div>
      </div>
    </aside>
  );
}


// USER_PROFILE fallback · usado por callMentorAPI cuando window.UserProfile
// no está cargado. Antes traía datos mock (Amaia Ruiz · Publish Agent · 15%
// · pill 4). Ahora vacío · la BeonAI recibe contexto solo si el user real
// está autenticado y UserProfile.get() devuelve datos.
const USER_PROFILE = {
  name: '',
  role: '',
  progress: 0,
  currentPill: 0,
};

// callMentorAPI · llama al endpoint /api/chat de BeonAI.
// Si recibe onDelta, abre una conexión SSE y va emitiendo deltas según llegan
// (UX streaming: el texto aparece a medida que se genera). Si no, hace fetch
// normal y devuelve la respuesta completa de una vez.
async function callMentorAPI(messages, onDelta) {
  const url = window.MENTOR_IA_API_URL || '/api/chat';
  const u = (window.UserProfile && window.UserProfile.get && window.UserProfile.get()) || null;
  const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || null;
  const profile = {
    name: (u && u.name) || (USER_PROFILE && USER_PROFILE.name),
    role: (u && u.role) || (USER_PROFILE && USER_PROFILE.role),
    progress: USER_PROFILE && USER_PROFILE.progress,
    currentPill: USER_PROFILE && USER_PROFILE.currentPill,
    workspace: ws && ws.name,
  };
  const payload = {
    messages: messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || m.content || '',
    })),
    userProfile: profile,
    workspaceId: ws && ws.id,
    stream: !!onDelta,
  };

  // Token de sesión · el endpoint valida quién eres y que perteneces al
  // workspace antes de leer su config/KB (sin esto, /api/chat confiaba en el
  // workspaceId del cliente y filtraba la base de conocimiento de cualquier tenant).
  let _token = '';
  try {
    if (window.supabaseClient && window.supabaseClient.auth) {
      const { data } = await window.supabaseClient.auth.getSession();
      _token = (data && data.session && data.session.access_token) || '';
    }
  } catch (e) {}

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(_token ? { Authorization: 'Bearer ' + _token } : {}) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.status);
    console.error('[BeonAI] error:', res.status, err);
    throw new Error(String(res.status));
  }

  // Modo no-streaming · respuesta JSON completa.
  if (!onDelta) {
    const data = await res.json();
    return data.content || '';
  }

  // Modo streaming · parsea Server-Sent Events `data: {json}\n\n`.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let full = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const m = line.match(/^data:\s*(.+)$/);
      if (!m) continue;
      let evt = null;
      try {
        evt = JSON.parse(m[1]);
      } catch (e) { /* línea SSE parcial · ignorar SOLO el parse */ continue; }
      if (evt.delta) { full += evt.delta; onDelta(evt.delta, full); }
      // El error del backend NO debe tragarse · antes el throw caía en el
      // mismo catch del JSON.parse y el usuario veía respuesta vacía sin aviso.
      if (evt.error) throw new Error(evt.error);
    }
  }
  return full;
}


// ---------- Onboarding ----------
function Onboarding({ done = () => {} }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  // Re-render al cambiar el idioma (en caso de que el usuario lo cambie via login screen previo)
  const [, _force] = useS2(0);
  useE2(() => {
    const onChange = () => _force(x => x + 1);
    window.addEventListener('settings-changed', onChange);
    return () => window.removeEventListener('settings-changed', onChange);
  }, []);
  const [step, setStep] = useS2(0);
  const [selectedAreas, setSelectedAreas] = useS2(new Set(['publish','aprobs']));
  const [role, setRole] = useS2('publish');
  const [notifs, setNotifs] = useS2([true, true, false, false]);
  const [showMentorInfo, setShowMentorInfo] = useS2(false);

  // Persistir progreso paso a paso para que el anillo del shell se vaya llenando
  useE2(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(window.userKey('solid-onboarding')) || '{}');
      if (!existing.completedAt) {
        localStorage.setItem(window.userKey('solid-onboarding'), JSON.stringify({ ...existing, step, totalSteps: 4 }));
        window.dispatchEvent(new CustomEvent('onboarding-progress', { detail: { step, totalSteps: 4 }}));
      }
    } catch(e) {}
  }, [step]);

  const persistOnboarding = () => {
    localStorage.setItem(window.userKey('solid-onboarding'), JSON.stringify({
      areas: Array.from(selectedAreas),
      role,
      notifs,
      step: 4,
      totalSteps: 4,
      completedAt: Date.now(),
    }));
    window.dispatchEvent(new CustomEvent('onboarding-progress', { detail: { step: 4, totalSteps: 4 }}));
    if (window.UserProfile) {
      const roleLabel = ({ publish:'Publish Agent', content:'Content Lead', analytics:'Analytics Lead', it:'IT / Integraciones', direccion:'Dirección' })[role] || 'Publish Agent';
      window.UserProfile.update({ role: roleLabel });
    }
    if (window.Toast) window.Toast.success(T('onboarding.complete'), { icon: '🎉' });
    done();
  };

  // Áreas con id para i18n
  const areaIds = ['publish','aprobs','calendar','analytics','dam','compliance','care','salesforce','gov','fundamentals'];
  const areaLabel = (id) => T('onboarding.area.' + id, id);
  const toggleArea = (id) => { const n = new Set(selectedAreas); n.has(id) ? n.delete(id) : n.add(id); setSelectedAreas(n); };
  const toggleNotif = (i) => setNotifs(ns => ns.map((v, idx) => idx === i ? !v : v));

  const roles = [
    { id: 'publish',   label: T('onboarding.role.publish'),   desc: T('onboarding.role.publish.sub') },
    { id: 'content',   label: T('onboarding.role.content'),   desc: T('onboarding.role.content.sub') },
    { id: 'analytics', label: T('onboarding.role.analytics'), desc: T('onboarding.role.analytics.sub') },
    { id: 'it',        label: T('onboarding.role.it'),        desc: T('onboarding.role.it.sub') },
    { id: 'direccion', label: T('onboarding.role.direccion'), desc: T('onboarding.role.direccion.sub') },
  ];

  const notifOptions = [
    { t: T('onboarding.notif.daily'),   d: T('onboarding.notif.daily.sub') },
    { t: T('onboarding.notif.free'),    d: T('onboarding.notif.free.sub') },
    { t: T('onboarding.notif.weekly'),  d: T('onboarding.notif.weekly.sub') },
    { t: T('onboarding.notif.meeting'), d: T('onboarding.notif.meeting.sub') },
  ];

  const fmtStep = (n) => T('onboarding.stepOf','{step} · De {total}').replace('{step}', String(n).padStart(2,'0')).replace('{total}', '04');

  const steps = [
    {
      eyebrow: fmtStep(1),
      title: <>{T('onboarding.s1.title.l1')}<br/>{T('onboarding.s1.title.l2').replace(T('onboarding.s1.titleEm',''), '')}<em> {T('onboarding.s1.titleEm')}</em>?</>,
      lead: T('onboarding.s1.lead'),
      body: (
        <div className="onb-chips">
          {areaIds.map(id => (
            <button key={id} className={`onb-chip ${selectedAreas.has(id) ? 'sel' : ''}`} onClick={() => toggleArea(id)}>
              <span className="mark"/>{areaLabel(id)}
            </button>
          ))}
        </div>
      )
    },
    {
      eyebrow: fmtStep(2),
      title: <>{T('onboarding.s2.title.l1')}<br/>{T('onboarding.s2.title.l2')}</>,
      lead: T('onboarding.s2.lead'),
      body: (
        <div style={{display:'flex', flexDirection:'column', gap:10, maxWidth:520}}>
          {roles.map(r => (
            <div key={r.id} onClick={() => setRole(r.id)}
              style={{padding:'14px 18px', border:`1px solid ${role === r.id ? 'var(--ink)' : 'var(--line)'}`, borderRadius:12, cursor:'pointer', background: role === r.id ? 'var(--ink)' : 'var(--paper)', transition:'all .12s', display:'flex', alignItems:'center', gap:14}}>
              <div style={{width:18, height:18, borderRadius:'50%', border:`2px solid ${role === r.id ? 'var(--accent-glow)' : 'var(--line)'}`, background: role === r.id ? 'var(--accent-glow)' : 'transparent', flexShrink:0}}/>
              <div>
                <div style={{fontWeight:600, fontSize:14, color: role === r.id ? 'var(--paper)' : 'var(--ink)'}}>{r.label}</div>
                <div style={{fontSize:12, color: role === r.id ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)', marginTop:2}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      eyebrow: fmtStep(3),
      title: <>{T('onboarding.s3.title')}</>,
      lead: T('onboarding.s3.lead'),
      body: (
        <div style={{display:'flex', flexDirection:'column', gap:12, maxWidth:520}}>
          {notifOptions.map((x, i) => (
            <div key={i} className={`wa-toggle ${notifs[i] ? 'on' : ''}`} onClick={() => toggleNotif(i)} style={{cursor:'pointer'}}>
              <div>
                <div className="t">{x.t}</div>
                <div className="d">{x.d}</div>
              </div>
              <div className="sw"/>
            </div>
          ))}
        </div>
      )
    },
    {
      eyebrow: fmtStep(4),
      title: <>{T('onboarding.s4.title')}</>,
      lead: T('onboarding.s4.lead'),
      body: (
        <div style={{border:'1px solid var(--line)', borderRadius:16, padding:24, maxWidth:560, background:'var(--paper-2)'}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
            <div style={{width:40, height:40, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #FCCB00, var(--accent-glow) 60%, #b06800)', boxShadow:'0 0 18px rgba(243,165,36,0.4)', flexShrink:0}}/>
            <div>
              <div style={{fontWeight:600, fontSize:14}}>BeonAI <span className="beta-badge">BETA</span></div>
            </div>
          </div>
          <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, lineHeight:1.4, marginBottom:16, color:'var(--ink)'}}>
            "{T('onboarding.s4.message').replace('{role}', T('onboarding.role.' + role, 'Publish Agent'))}"
          </div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn glow" onClick={persistOnboarding}>{T('onboarding.s4.cta')}</button>
            <button className="btn ghost" onClick={() => setShowMentorInfo(s => !s)}>{showMentorInfo ? T('onboarding.s4.hide') : T('onboarding.s4.more')}</button>
          </div>
          {showMentorInfo && (
            <div style={{marginTop:16, padding:'14px 16px', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10, fontSize:13, lineHeight:1.55, color:'var(--ink-2)'}}>
              <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:6}}>{T('onboarding.s4.featuresTitle')}</div>
              <ul style={{margin:0, paddingLeft:18}}>
                <li>{T('onboarding.s4.f1')}</li>
                <li>{T('onboarding.s4.f2')}</li>
                <li>{T('onboarding.s4.f3')}</li>
                <li>{T('onboarding.s4.f4')}</li>
                <li>{T('onboarding.s4.f5')}</li>
              </ul>
            </div>
          )}
        </div>
      )
    },
  ];

  const s = steps[step];
  return (
    <div className="onb-root">
      <div className="onb-visual">
        <div style={{display:'flex', alignItems:'center', gap:10, position:'relative'}}>
          <img src="beonit-logo.png" style={{height:22, width:'auto', opacity:0.9}} alt="BeonIt"/>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginLeft:4}}>× {window.WORKSPACE_NAME || 'tu workspace'}</span>
        </div>
        <div style={{position:'relative'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:16}}>{T('onboarding.cert')}</div>
          <h2 style={{fontSize:'clamp(40px,5vw,62px)', fontWeight:700, fontStyle:'normal', lineHeight:1.05}}>{T('login.title.l1')}<br/>{T('login.title.l2')}<br/>{T('login.title.l3')}<br/><em style={{fontStyle:'italic', color:'var(--bn-lime)'}}>{T('login.title.expert')}</em>.</h2>
          <div style={{marginTop:24, display:'flex', flexWrap:'wrap', gap:8}}>
            {[T('login.chip.pills'), T('login.chip.workshops'), 'BeonAI', T('login.chip.cert')].map(t => (
              <span key={t} style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:999, color:'rgba(255,255,255,0.7)'}}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'var(--bn-lime)'}}/>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{T('onboarding.certOfficial')}</span>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase'}}>SolidStream · BeonIt · {window.WORKSPACE_NAME || 'Plataforma'}</div>
        </div>
      </div>
      <div className="onb-right">
        <div className="step-meta">{s.eyebrow}</div>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
        {s.body}
        <div className="onb-nav">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step-1)}>{T('onboarding.back')}</button>}
          <button className="btn" style={{background:'var(--ink)'}} onClick={() => step < 3 ? setStep(step+1) : persistOnboarding()}>
            {step < 3 ? T('onboarding.continue') : T('onboarding.enter')}
          </button>
          <div style={{marginLeft:'auto'}} className="onb-progress">
            {[0,1,2,3].map(i => <span key={i} className={i <= step ? 'on' : ''}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Rutas de aprendizaje · constante usada por sgson-adapter ----------
const useS3 = React.useState;
const useE3 = React.useEffect;
// LEARNING_PATHS · 6 rutas hardcoded de Repsol. Ahora se derivan en
// _loadContent('path') desde workspace_content. Esqueleto vacío.
const LEARNING_PATHS = [];


// ── Chart primitives (pure SVG, no deps) ─────────────────────────────────

function ColumnChart({ data, color = 'var(--accent-glow)', height = 110 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const w = 300, bw = Math.floor(w / data.length) - 4;
  return (
    <svg viewBox={`0 0 ${w} ${height + 20}`} style={{width:'100%', overflow:'visible'}}>
      {data.map((d, i) => {
        const bh = Math.max(2, Math.round(d.v / max * height));
        const x = i * (bw + 4) + 2;
        return (
          <g key={i}>
            <rect x={x} y={height - bh} width={bw} height={bh} rx={3} fill={color} opacity="0.85"/>
            <text x={x + bw/2} y={height + 14} textAnchor="middle" fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StackedBarChart({ series, categories, height = 140 }) {
  const colors = ['var(--accent-glow)', 'var(--bn-lime)', 'var(--bn-orange)', 'var(--bn-purple)', 'var(--bn-turquoise)'];
  const totals = categories.map((_, ci) => series.reduce((s, sr) => s + (sr.values[ci] || 0), 0));
  const maxT = Math.max(...totals, 1);
  const barH = height / categories.length - 6;
  return (
    <svg viewBox={`0 ${-4} 300 ${height + 20}`} style={{width:'100%', overflow:'visible'}}>
      {categories.map((cat, ci) => {
        let x = 0;
        const total = totals[ci];
        return (
          <g key={ci}>
            <text x={0} y={ci*(barH+6)+barH/2+4} fontSize="9" fill="var(--ink-4)" fontFamily="var(--mono)" textAnchor="start">{cat}</text>
            {series.map((sr, si) => {
              const fw = total > 0 ? sr.values[ci] / maxT * 220 : 0;
              const rect = <rect key={si} x={75+x} y={ci*(barH+6)} width={fw} height={barH} rx={si===0?3:0} fill={colors[si%colors.length]} opacity="0.85"/>;
              x += fw;
              return rect;
            })}
          </g>
        );
      })}
      {/* Legend */}
      {series.map((sr, si) => (
        <g key={si} transform={`translate(${si*80},${height+14})`}>
          <rect width={10} height={10} rx={2} fill={colors[si%colors.length]} opacity="0.85"/>
          <text x={14} y={9} fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">{sr.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Stacked Column · barras verticales acumuladas
function StackedColumnChart({ series, categories, height = 200 }) {
  const defaultColors = ['var(--ok)', 'var(--accent-glow)', 'var(--ink-4)', 'var(--bn-purple)', 'var(--bn-turquoise)'];
  const totals = categories.map((_, ci) => series.reduce((s, sr) => s + (sr.values[ci] || 0), 0));
  const maxT = Math.max(...totals, 1);
  const W = 320, H = height;
  const barW = W / categories.length - 8;
  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} style={{width:'100%', overflow:'visible'}}>
      {categories.map((cat, ci) => {
        let y = H;
        const total = totals[ci];
        return (
          <g key={ci} transform={`translate(${ci*(barW+8)+4},0)`}>
            {series.map((sr, si) => {
              const segH = total > 0 ? (sr.values[ci] / maxT) * (H - 10) : 0;
              y -= segH;
              return <rect key={si} x={0} y={y} width={barW} height={segH} rx={si===series.length-1?3:0} fill={sr.color || defaultColors[si%defaultColors.length]} opacity="0.92"/>;
            })}
            <text x={barW/2} y={H + 12} fontSize="9" fill="var(--ink-4)" fontFamily="var(--mono)" textAnchor="middle">{cat}</text>
          </g>
        );
      })}
      {/* Legend */}
      {series.map((sr, si) => (
        <g key={si} transform={`translate(${si*86},${H+26})`}>
          <rect width={10} height={10} rx={2} fill={sr.color || defaultColors[si%defaultColors.length]} opacity="0.92"/>
          <text x={14} y={9} fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">{sr.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Clustered Column · columnas agrupadas por dimensión
function ClusterChart({ groups, series, height = 200 }) {
  const W = 320, H = height;
  const maxV = Math.max(...groups.flatMap(g => g.values.map(v => v.v)), 1);
  const groupW = W / groups.length;
  const innerBarW = (groupW - 12) / series.length - 2;
  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} style={{width:'100%', overflow:'visible'}}>
      {groups.map((g, gi) => (
        <g key={gi} transform={`translate(${gi*groupW+6},0)`}>
          {g.values.map((bar, bi) => {
            const barH = (bar.v / maxV) * (H - 10);
            const x = bi * (innerBarW + 2);
            return <rect key={bi} x={x} y={H - barH} width={innerBarW} height={barH} rx={2} fill={series[bi]?.color || 'var(--bn-blue)'} opacity="0.9"/>;
          })}
          <text x={groupW/2-6} y={H + 12} fontSize="9" fill="var(--ink-4)" fontFamily="var(--mono)" textAnchor="middle">{g.label}</text>
        </g>
      ))}
      {/* Legend */}
      {series.map((sr, si) => (
        <g key={si} transform={`translate(${si*86},${H+26})`}>
          <rect width={10} height={10} rx={2} fill={sr.color} opacity="0.9"/>
          <text x={14} y={9} fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">{sr.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Ratings Overview · KPI grande con ★ media + count
function RatingsOverviewWidget({ avg, count }) {
  const stars = Math.round((avg || 0) * 2) / 2; // medio paso
  return (
    <div style={{padding:'18px 22px', display:'flex', alignItems:'center', gap:18}}>
      <div style={{fontSize:42, fontFamily:'var(--sans)', fontWeight:800, color:'#F4B740', letterSpacing:'-0.02em', lineHeight:1}}>
        {(avg || 0).toFixed(1)}
        <span style={{fontSize:18, color:'var(--ink-4)', fontWeight:600, marginLeft:4}}>/ 5</span>
      </div>
      <div style={{flex:1}}>
        <div style={{display:'flex', gap:2, fontSize:22, lineHeight:1, color:'#F4B740'}}>
          {[1,2,3,4,5].map(n => <span key={n}>{n <= stars ? '★' : (n - 0.5 === stars ? '⯨' : '☆')}</span>)}
        </div>
        <div style={{fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.06em', color:'var(--ink-4)', marginTop:5, textTransform:'uppercase'}}>{count || 0} puntuaciones · {count > 0 ? 'datos reales' : 'todavía sin votos'}</div>
      </div>
    </div>
  );
}

// Ratings Distribution · barras horizontales 1-5★ con count
function RatingsDistWidget({ dist, count, avg }) {
  const max = Math.max(...(dist || [0,0,0,0,0]), 1);
  return (
    <div style={{padding:'12px 22px 18px'}}>
      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--ink-4)', textTransform:'uppercase', marginBottom:10}}>
        Media: <strong style={{color:'#F4B740'}}>{(avg||0).toFixed(2)}★</strong> · {count||0} votos
      </div>
      {[5,4,3,2,1].map(stars => {
        const n = (dist || [0,0,0,0,0])[stars-1] || 0;
        const pct = count > 0 ? (n / count) * 100 : 0;
        return (
          <div key={stars} style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
            <div style={{width:46, display:'flex', alignItems:'center', gap:2, fontSize:13, color:'#F4B740'}}>
              {stars} <span style={{fontSize:14}}>★</span>
            </div>
            <div style={{flex:1, height:14, background:'var(--paper-2)', borderRadius:7, overflow:'hidden', position:'relative'}}>
              <div style={{width: (n/max*100) + '%', height:'100%', background:'linear-gradient(90deg, #F4B740, #E89B0F)', borderRadius:7, transition:'width .3s'}}/>
            </div>
            <div style={{minWidth:50, textAlign:'right', fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-3)'}}>
              {n} <span style={{color:'var(--ink-4)'}}>({Math.round(pct)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Ratings Top · tabla de pills mejor puntuadas
function RatingsTopWidget({ rows }) {
  if (!rows || rows.length === 0) {
    return <div style={{padding:'22px 22px', textAlign:'center', color:'var(--ink-4)', fontSize:12}}>Todavía no hay puntuaciones. Anima a tu equipo a votar los vídeos.</div>;
  }
  return (
    <div style={{padding:'4px 16px 14px'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
        <thead>
          <tr style={{borderBottom:'1px solid var(--line)'}}>
            <th style={{textAlign:'left', padding:'8px 6px', fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700}}>Pill</th>
            <th style={{textAlign:'right', padding:'8px 6px', fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700}}>★ media</th>
            <th style={{textAlign:'right', padding:'8px 6px', fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700}}>Votos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.pillId} style={{borderBottom: i === rows.length-1 ? 'none' : '1px solid var(--line-2)'}}>
              <td style={{padding:'8px 6px', color:'var(--ink-2)', maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r.title}>{r.title}</td>
              <td style={{padding:'8px 6px', textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'#F4B740'}}>{r.avg.toFixed(2)} ★</td>
              <td style={{padding:'8px 6px', textAlign:'right', fontFamily:'var(--mono)', color:'var(--ink-4)'}}>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// AI Insight · texto generado por BeonAI sobre una métrica
function AIInsightWidget({ insight, tags, widget }) {
  return (
    <div style={{padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start'}}>
      {window.BeonAIChar && <window.BeonAIChar size={36} mood="happy" interactive={false} float/>}
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--bai-violet, #6E50EE)', fontWeight:700, marginBottom:4}}>★ AI Insight · BeonAI</div>
        <div style={{fontSize:13.5, lineHeight:1.55, color:'var(--ink)'}} dangerouslySetInnerHTML={{__html: (insight || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')}}/>
        {tags && tags.length > 0 && (
          <div style={{display:'flex', gap:5, marginTop:8, flexWrap:'wrap'}}>
            {tags.map((t,i) => <span key={i} style={{fontFamily:'var(--mono)', fontSize:9, padding:'2px 7px', background:'rgba(110,80,238,0.08)', color:'var(--bai-violet, #6E50EE)', borderRadius:999, fontWeight:600}}>#{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

// AI Cluster · agrupación automática de usuarios
function AIClusterWidget({ clusters, widget }) {
  const totalSize = clusters.reduce((s, c) => s + c.size, 0) || 1;
  return (
    <div style={{padding:'12px 18px', display:'flex', flexDirection:'column', gap:10}}>
      <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--bai-violet, #6E50EE)', fontWeight:700}}>★ Clusters generados por BeonAI · {clusters.length} grupos · {totalSize} usuarios</div>
      {clusters.map((c, i) => (
        <div key={i} style={{padding:'10px 12px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:8, display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:8, height:36, borderRadius:2, background:c.color, flexShrink:0}}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:12.5, fontWeight:700, color:'var(--ink)'}}>{c.name}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', marginTop:2}}>{c.traits.join(' · ')}</div>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:18, fontWeight:800, color:c.color}}>{c.size}</div>
        </div>
      ))}
    </div>
  );
}

// AI Anomaly · detección de outliers en serie temporal
function AIAnomalyWidget({ points, anomalyIdx, color, alert, widget }) {
  const W = 280, H = 120, pad = 10;
  const maxV = Math.max(...points, 1);
  const step = (W - pad*2) / (points.length - 1);
  const pathD = points.map((v, i) => {
    const x = pad + i * step;
    const y = H - pad - (v / maxV) * (H - pad*2);
    return (i === 0 ? 'M' : 'L') + x + ' ' + y;
  }).join(' ');
  return (
    <div style={{padding:'10px 18px 14px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%'}}>
        <path d={pathD} stroke={color || 'var(--bn-blue)'} strokeWidth="2" fill="none"/>
        {points.map((v, i) => {
          const x = pad + i * step;
          const y = H - pad - (v / maxV) * (H - pad*2);
          const isAn = i === anomalyIdx;
          return <circle key={i} cx={x} cy={y} r={isAn ? 6 : 3} fill={isAn ? 'var(--accent)' : color || 'var(--bn-blue)'} stroke={isAn ? '#fff' : 'none'} strokeWidth={isAn ? 2 : 0}/>;
        })}
      </svg>
      {alert && (
        <div style={{marginTop:8, padding:'8px 10px', background:'rgba(244,87,68,0.06)', border:'1px solid rgba(244,87,68,0.25)', borderRadius:6, fontSize:11.5, color:'var(--accent)', display:'flex', gap:6, alignItems:'flex-start'}}>
          <span>⚠</span><span>{alert}</span>
        </div>
      )}
    </div>
  );
}

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.v, 0) || 1;
  const r = 42, cx = size/2, cy = size/2, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const colors = ['var(--accent-glow)', 'var(--bn-orange)', 'var(--bn-lime)', 'var(--bn-purple)', 'var(--bn-turquoise)', 'var(--beonit-blue)'];
  return (
    <div style={{display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--paper-3)" strokeWidth={strokeW}/>
        {segments.map((seg, i) => {
          const pct = seg.v / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i%colors.length]} strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              opacity="0.9"
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--ink)" fontFamily="var(--sans)">{total}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize="7" fill="var(--ink-4)" fontFamily="var(--mono)">TOTAL</text>
      </svg>
      <div style={{display:'flex', flexDirection:'column', gap:5, flex:1, minWidth:100}}>
        {segments.map((seg, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{width:10, height:10, borderRadius:2, background:colors[i%colors.length], flexShrink:0, opacity:0.9}}/>
            <div style={{fontSize:11, color:'var(--ink-3)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{seg.l}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:'var(--ink)'}}>{Math.round(seg.v/total*100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Line / Area chart con gradiente ──────────────────────────────────────
function AreaChart({ data, color = 'var(--accent-glow)', height = 110 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const w = 300, pad = 10;
  const stepX = (w - pad*2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = height - Math.round(d.v / max * (height - 14)) - 2;
    return [x, y];
  });
  const linePath = points.map((p, i) => (i===0?'M':'L') + p[0] + ',' + p[1]).join(' ');
  const areaPath = linePath + ` L ${points[points.length-1][0]},${height} L ${points[0][0]},${height} Z`;
  const gradId = 'g-' + Math.random().toString(36).slice(2,8);
  return (
    <svg viewBox={`0 0 ${w} ${height + 22}`} style={{width:'100%', overflow:'visible'}}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.45"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`}/>
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill={color} stroke="var(--paper)" strokeWidth="1.2"/>
      ))}
      {data.map((d, i) => i % 2 === 0 && (
        <text key={i} x={pad + i*stepX} y={height + 14} textAnchor="middle" fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">{d.l}</text>
      ))}
    </svg>
  );
}

// ── Activity heatmap (calendario por días/horas) ─────────────────────────
function HeatmapChart({ rows, cols, matrix, color = 'var(--accent-glow)' }) {
  const cellW = 18, cellH = 16, gap = 2, labelW = 20;
  const w = labelW + cols.length * (cellW + gap);
  const h = rows.length * (cellH + gap) + 18;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%', overflow:'visible'}}>
      {rows.map((r, ri) => (
        <g key={ri}>
          <text x={0} y={ri*(cellH+gap) + cellH*0.7} fontSize="9" fill="var(--ink-4)" fontFamily="var(--mono)">{r}</text>
          {cols.map((_, ci) => {
            const v = matrix[ri][ci];
            const op = 0.08 + (v/100) * 0.85;
            return <rect key={ci} x={labelW + ci*(cellW+gap)} y={ri*(cellH+gap)} width={cellW} height={cellH} rx={2.5} fill={color} opacity={op}>
              <title>{r} · día {ci+1} — actividad {v}</title>
            </rect>;
          })}
        </g>
      ))}
      {[0, Math.floor(cols.length/2), cols.length-1].map(ci => (
        <text key={ci} x={labelW + ci*(cellW+gap) + cellW/2} y={rows.length*(cellH+gap) + 12} textAnchor="middle" fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)">d{ci+1}</text>
      ))}
    </svg>
  );
}

// ── Gauge / KPI dial ─────────────────────────────────────────────────────
function GaugeChart({ value, label, sub, target = 80, size = 160 }) {
  const cx = size/2, cy = size*0.62, r = size*0.42;
  const arcPath = (start, end) => {
    const sx = cx + r*Math.cos(start), sy = cy + r*Math.sin(start);
    const ex = cx + r*Math.cos(end),   ey = cy + r*Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  };
  const v = Math.max(0, Math.min(100, value));
  const startA = Math.PI * 0.85, endA = Math.PI * 2.15;
  const valueA = startA + (endA - startA) * (v/100);
  const targetA = startA + (endA - startA) * (target/100);
  const color = v >= target ? 'var(--bn-lime)' : v >= target*0.75 ? 'var(--accent-glow)' : 'var(--bn-orange)';
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
      <svg width={size} height={size*0.78} viewBox={`0 0 ${size} ${size*0.78}`}>
        <path d={arcPath(startA, endA)} stroke="var(--paper-3)" strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d={arcPath(startA, valueA)} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round"/>
        <line x1={cx + (r-10)*Math.cos(targetA)} y1={cy + (r-10)*Math.sin(targetA)} x2={cx + (r+10)*Math.cos(targetA)} y2={cy + (r+10)*Math.sin(targetA)} stroke="var(--ink-4)" strokeWidth="1.5" strokeDasharray="2 2"/>
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size*0.22} fontWeight="800" fill="var(--ink)" fontFamily="var(--sans)">{Math.round(v)}<tspan fontSize={size*0.11} fill="var(--ink-4)">%</tspan></text>
        <text x={cx} y={cy + size*0.12} textAnchor="middle" fontSize="8" fill="var(--ink-4)" fontFamily="var(--mono)" letterSpacing="0.08em">META {target}%</text>
      </svg>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:12, fontWeight:700, color:'var(--ink)'}}>{label}</div>
        <div style={{fontSize:10, color:'var(--ink-4)', fontFamily:'var(--mono)', marginTop:2}}>{sub}</div>
      </div>
    </div>
  );
}

// ── Funnel chart (conversión) ────────────────────────────────────────────
function FunnelChart({ stages }) {
  const top = stages[0]?.v || 1;
  const w = 280;
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6, padding:'4px 0'}}>
      {stages.map((s, i) => {
        const pct = s.v / top;
        const widthPx = Math.max(60, pct * w);
        const conv = i === 0 ? 100 : Math.round(s.v / top * 100);
        const drop = i === 0 ? 0 : Math.round((stages[i-1].v - s.v) / Math.max(1, stages[i-1].v) * 100);
        return (
          <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{flex:'0 0 36%', fontSize:11, color:'var(--ink-3)', fontWeight:600}}>{s.l}</div>
            <div style={{flex:1, position:'relative', height:26}}>
              <div style={{position:'absolute', left:0, top:0, height:'100%', width:widthPx, background:s.c, opacity:0.85, clipPath:'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)', borderRadius:'3px 0 0 3px'}}/>
              <div style={{position:'absolute', left:8, top:0, height:'100%', display:'flex', alignItems:'center', fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:'#fff', textShadow:'0 1px 2px rgba(0,0,0,0.25)'}}>{s.v}</div>
            </div>
            <div style={{flex:'0 0 64px', textAlign:'right', fontFamily:'var(--mono)', fontSize:10}}>
              <div style={{color:'var(--ink-3)', fontWeight:700}}>{conv}%</div>
              {drop > 0 && <div style={{color:'var(--repsol-red)', fontSize:9}}>−{drop}%</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Word cloud · términos dimensionados por peso
function WordCloud({ words, palette = ['var(--bn-blue)','var(--accent-glow)','var(--bn-lime)','var(--bn-purple)','var(--bn-orange)','var(--bn-teal)'] }) {
  const max = Math.max.apply(null, words.map(w => w.weight));
  const min = Math.min.apply(null, words.map(w => w.weight));
  const range = Math.max(1, max - min);
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:'8px 14px', padding:'12px 8px', alignItems:'center', justifyContent:'center', minHeight:130, lineHeight:1.1}}>
      {words.map((w, i) => {
        const norm = (w.weight - min) / range;
        const size = 11 + norm * 22;
        const opacity = 0.55 + norm * 0.45;
        const color = palette[i % palette.length];
        return (
          <span key={i} title={w.text + ' · ' + w.weight + (w.delta ? ' (' + w.delta + ')' : '')}
            style={{fontFamily:'var(--sans)', fontWeight: 500 + Math.round(norm * 4) * 100, fontSize:size, color, opacity, letterSpacing:'-0.01em', cursor:'default', transition:'transform .15s'}}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
}

// Sentiment stacked area · positivo/neutro/negativo a lo largo del tiempo
function SentimentTrend({ data, height = 140 }) {
  const W = 320, H = height, pad = 22;
  const max = 100;
  const xs = data.map((_, i) => pad + (i / Math.max(1, data.length - 1)) * (W - pad * 2));
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const pathPos = xs.map((x, i) => (i===0?'M':'L') + x + ',' + y(data[i].pos)).join(' ');
  const pathPosNeu = xs.map((x, i) => (i===0?'M':'L') + x + ',' + y(data[i].pos + data[i].neu)).join(' ');
  const areaPos = pathPos + ' L ' + xs[xs.length-1] + ',' + y(0) + ' L ' + xs[0] + ',' + y(0) + ' Z';
  const areaNeu = pathPosNeu + ' L ' + xs[xs.length-1] + ',' + y(0) + ' L ' + xs[0] + ',' + y(0) + ' Z';
  const last = data[data.length-1];
  return (
    <div style={{padding:'4px 10px 8px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}}>
        <path d={`M ${pad},${y(0)} L ${pad},${y(100)} L ${W-pad},${y(100)} L ${W-pad},${y(0)} Z`} fill="var(--bn-red)" opacity="0.18"/>
        <path d={areaNeu} fill="var(--bn-orange)" opacity="0.55"/>
        <path d={areaPos} fill="var(--bn-green)" opacity="0.78"/>
        <path d={pathPos} fill="none" stroke="var(--bn-green)" strokeWidth="1.5"/>
        <path d={pathPosNeu} fill="none" stroke="var(--bn-orange)" strokeWidth="1"/>
        {data.map((d, i) => i % Math.ceil(data.length/6) === 0 && (
          <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)">{d.l}</text>
        ))}
      </svg>
      <div style={{display:'flex', gap:14, justifyContent:'center', marginTop:6, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.04em'}}>
        <span style={{color:'var(--bn-green)', fontWeight:700}}>● Positivo {last.pos}%</span>
        <span style={{color:'var(--bn-orange)', fontWeight:700}}>● Neutro {last.neu}%</span>
        <span style={{color:'var(--bn-red)', fontWeight:700}}>● Negativo {last.neg}%</span>
      </div>
    </div>
  );
}

// NPS Scorecard · número grande + segmentos Promoters/Passives/Detractors
function NPSScorecard({ nps, promoters, passives, detractors, total, target = 50 }) {
  const segP = (promoters / total) * 100;
  const segN = (passives / total) * 100;
  const segD = (detractors / total) * 100;
  const color = nps >= target ? 'var(--bn-green)' : nps >= 20 ? 'var(--bn-orange)' : 'var(--bn-red)';
  return (
    <div style={{padding:'10px 18px 16px'}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:18, marginBottom:14}}>
        <div>
          <div style={{fontSize:54, fontWeight:800, letterSpacing:'-0.04em', color, lineHeight:1}}>{nps > 0 ? '+' : ''}{nps}</div>
          <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:2}}>NPS · {total} respuestas</div>
        </div>
        <div style={{flex:1, fontSize:11, color:'var(--ink-3)', lineHeight:1.5, paddingBottom:6}}>
          {nps >= target
            ? <>Por encima de la meta de {target}. <strong style={{color:'var(--bn-green)'}}>Excelente percepción.</strong></>
            : nps >= 20
              ? <>Aceptable, pero por debajo de la meta de {target}.</>
              : <>Crítico. Revisa las quejas recientes.</>}
        </div>
      </div>
      <div style={{display:'flex', height:14, borderRadius:7, overflow:'hidden', background:'var(--paper-2)'}}>
        <div title={`Promoters: ${promoters}`} style={{width: segP + '%', background:'var(--bn-green)', transition:'width .35s'}}/>
        <div title={`Passives: ${passives}`} style={{width: segN + '%', background:'var(--bn-orange)'}}/>
        <div title={`Detractors: ${detractors}`} style={{width: segD + '%', background:'var(--bn-red)'}}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8, fontFamily:'var(--mono)', fontSize:10}}>
        <div><span style={{color:'var(--bn-green)', fontWeight:700}}>● Promoters</span> {promoters} ({Math.round(segP)}%)</div>
        <div style={{textAlign:'center'}}><span style={{color:'var(--bn-orange)', fontWeight:700}}>● Passives</span> {passives} ({Math.round(segN)}%)</div>
        <div style={{textAlign:'right'}}><span style={{color:'var(--bn-red)', fontWeight:700}}>● Detractors</span> {detractors} ({Math.round(segD)}%)</div>
      </div>
    </div>
  );
}

// Top Questions / Top Items list · ranking con bar fill
function TopList({ items, color = 'var(--accent-glow)', unit = '' }) {
  const max = Math.max.apply(null, items.map(i => i.value));
  return (
    <div style={{padding:'4px 16px 12px', display:'flex', flexDirection:'column', gap:7}}>
      {items.map((it, i) => {
        const pct = (it.value / max) * 100;
        return (
          <div key={i} style={{display:'grid', gridTemplateColumns:'16px 1fr 56px', gap:10, alignItems:'center'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color:'var(--ink-4)', textAlign:'right'}}>{i+1}</div>
            <div style={{position:'relative'}}>
              <div style={{fontSize:12.5, color:'var(--ink-2)', fontWeight:500, marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.text}</div>
              <div style={{height:5, background:'var(--paper-2)', borderRadius:3, overflow:'hidden'}}>
                <div style={{width: pct + '%', height:'100%', background: color, borderRadius:3, transition:'width .35s'}}/>
              </div>
            </div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color:'var(--ink)', textAlign:'right'}}>{it.value}{unit}</div>
          </div>
        );
      })}
    </div>
  );
}

// Pivot Table · cross-tab métrica × dimensión
function PivotTable({ rows, cols, data, metric = '%' }) {
  const flat = data.flat();
  const max = Math.max.apply(null, flat);
  const heat = (v) => {
    const t = max > 0 ? v / max : 0;
    return `rgba(0, 114, 190, ${0.08 + t * 0.55})`;
  };
  return (
    <div style={{padding:'4px 12px 12px', overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontFamily:'var(--sans)', fontSize:11.5}}>
        <thead>
          <tr>
            <th style={{padding:'8px 6px', textAlign:'left', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>Dimensión ↓ / Métrica →</th>
            {cols.map((c, i) => <th key={i} style={{padding:'8px 6px', textAlign:'center', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              <td style={{padding:'7px 6px', fontWeight:600, color:'var(--ink-2)', borderBottom:'1px solid var(--line-2)'}}>{r}</td>
              {cols.map((_, ci) => (
                <td key={ci} style={{padding:'7px 6px', textAlign:'center', fontFamily:'var(--mono)', fontWeight:700, fontSize:11.5, color:'var(--ink)', borderBottom:'1px solid var(--line-2)', background: heat(data[ri][ci])}}>
                  {data[ri][ci]}{metric}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Bar chart · barras horizontales (categoría → valor)
function BarChart({ data, color = 'var(--bn-blue)', height = 160 }) {
  const max = Math.max.apply(null, data.map(d => d.v));
  return (
    <div style={{padding:'8px 16px 12px', display:'flex', flexDirection:'column', gap:6, minHeight:height}}>
      {data.map((d, i) => {
        const pct = max > 0 ? (d.v / max) * 100 : 0;
        return (
          <div key={i} style={{display:'grid', gridTemplateColumns:'110px 1fr 46px', gap:10, alignItems:'center', fontSize:11.5}}>
            <div style={{color:'var(--ink-3)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.l}</div>
            <div style={{position:'relative', height:18, background:'var(--paper-2)', borderRadius:4, overflow:'hidden'}}>
              <div style={{position:'absolute', left:0, top:0, height:'100%', width: pct + '%', background: color, borderRadius:4, transition:'width .35s'}}/>
            </div>
            <div style={{fontFamily:'var(--mono)', fontWeight:700, color:'var(--ink)', textAlign:'right'}}>{d.v}</div>
          </div>
        );
      })}
    </div>
  );
}

// Line chart · puntos conectados por líneas (smooth=true para spline)
function LineChart({ data, color = 'var(--bn-blue)', height = 140, smooth = false }) {
  const W = 320, H = height, pad = 22;
  const max = Math.max.apply(null, data.map(d => d.v));
  const min = Math.min.apply(null, data.map(d => d.v));
  const range = Math.max(1, max - min);
  const xs = data.map((_, i) => pad + (i / Math.max(1, data.length - 1)) * (W - pad * 2));
  const ys = data.map(d => H - pad - ((d.v - min) / range) * (H - pad * 2));
  let path;
  if (smooth) {
    path = 'M ' + xs[0] + ',' + ys[0];
    for (let i = 1; i < xs.length; i++) {
      const cx = (xs[i-1] + xs[i]) / 2;
      path += ' C ' + cx + ',' + ys[i-1] + ' ' + cx + ',' + ys[i] + ' ' + xs[i] + ',' + ys[i];
    }
  } else {
    path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x + ',' + ys[i]).join(' ');
  }
  return (
    <div style={{padding:'6px 8px 4px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}}>
        {[0.25, 0.5, 0.75].map((p, i) => <line key={i} x1={pad} x2={W-pad} y1={pad + p*(H-pad*2)} y2={pad + p*(H-pad*2)} stroke="var(--line-2)" strokeDasharray="2,3"/>)}
        <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} stroke="var(--paper)" strokeWidth="1.5"/>)}
        {data.map((d, i) => i % Math.ceil(data.length/6) === 0 && (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)">{d.l}</text>
        ))}
      </svg>
    </div>
  );
}

// Counter · KPI único con comparación período anterior
function Counter({ label, value, prev, format = 'number', icon = '📈', color = 'var(--bn-blue)', unit = '' }) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  const pnum = typeof prev === 'number' ? prev : parseFloat(prev);
  const delta = pnum ? Math.round(((num - pnum) / pnum) * 100) : 0;
  const up = delta >= 0;
  const fmt = (v) => format === 'percent' ? v + '%' : format === 'duration' ? Math.floor(v/60) + 'h ' + (v%60) + 'm' : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + unit;
  return (
    <div style={{padding:'18px 22px', background:`linear-gradient(135deg, ${color}10 0%, transparent 100%)`, borderRadius:8, height:'100%'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700}}>{label}</div>
        <div style={{fontSize:18, opacity:0.6}}>{icon}</div>
      </div>
      <div style={{fontSize:36, fontWeight:800, letterSpacing:'-0.03em', color, lineHeight:1, marginBottom:6}}>{fmt(num)}</div>
      <div style={{display:'flex', alignItems:'center', gap:8, fontFamily:'var(--mono)', fontSize:10.5}}>
        <span style={{fontWeight:700, color: up ? 'var(--bn-green)' : 'var(--bn-red)'}}>{up ? '↑' : '↓'} {Math.abs(delta)}%</span>
        <span style={{color:'var(--ink-4)'}}>vs período anterior ({fmt(pnum)})</span>
      </div>
    </div>
  );
}

// Counter Summary · múltiples métricas con previous period
function CounterSummary({ items }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:`repeat(${items.length}, 1fr)`, gap:0, padding:'4px 0'}}>
      {items.map((it, i) => {
        const delta = it.prev ? Math.round(((it.value - it.prev) / it.prev) * 100) : 0;
        const up = delta >= 0;
        return (
          <div key={i} style={{padding:'14px 18px', borderRight: i < items.length - 1 ? '1px solid var(--line-2)' : 'none'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700, marginBottom:6}}>{it.label}</div>
            <div style={{fontSize:24, fontWeight:800, letterSpacing:'-0.025em', color: it.color || 'var(--ink)', lineHeight:1, marginBottom:4}}>{it.value}{it.unit||''}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:9.5, color: up ? 'var(--bn-green)' : 'var(--bn-red)', fontWeight:700}}>{up ? '↑' : '↓'} {Math.abs(delta)}% · prev {it.prev}{it.unit||''}</div>
          </div>
        );
      })}
    </div>
  );
}

// Tree Map · rectángulos según valor (split horizontal/vertical alternado)
function TreeMap({ nodes, height = 200 }) {
  const total = nodes.reduce((s, n) => s + n.value, 0);
  const layout = (items, x, y, w, h, horiz) => {
    if (items.length === 0) return [];
    if (items.length === 1) return [{ ...items[0], x, y, w, h }];
    const sum = items.reduce((s, n) => s + n.value, 0);
    const first = items[0];
    const ratio = first.value / sum;
    if (horiz) {
      const fw = w * ratio;
      return [{ ...first, x, y, w: fw, h }, ...layout(items.slice(1), x + fw, y, w - fw, h, !horiz)];
    } else {
      const fh = h * ratio;
      return [{ ...first, x, y, w, h: fh }, ...layout(items.slice(1), x, y + fh, w, h - fh, !horiz)];
    }
  };
  const sorted = [...nodes].sort((a, b) => b.value - a.value);
  const W = 320, H = height;
  const cells = layout(sorted, 0, 0, W, H, true);
  const palette = ['var(--bn-blue)','var(--accent-glow)','var(--bn-lime)','var(--bn-purple)','var(--bn-orange)','var(--bn-teal)','var(--repsol-red)','var(--bn-green)'];
  return (
    <div style={{padding:'4px 8px 8px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}} preserveAspectRatio="none">
        {cells.map((c, i) => {
          const pct = Math.round((c.value / total) * 100);
          const fontSize = Math.min(16, Math.sqrt(c.w * c.h) / 6);
          return (
            <g key={i}>
              <rect x={c.x+1} y={c.y+1} width={Math.max(0, c.w-2)} height={Math.max(0, c.h-2)} fill={palette[i % palette.length]} opacity="0.85" rx="3"/>
              {c.w > 60 && c.h > 30 && (
                <>
                  <text x={c.x + 8} y={c.y + 14 + fontSize/2} fontFamily="var(--sans)" fontSize={fontSize} fontWeight="700" fill="#fff" style={{textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>{c.label}</text>
                  <text x={c.x + 8} y={c.y + 14 + fontSize*1.6} fontFamily="var(--mono)" fontSize={fontSize * 0.7} fontWeight="600" fill="#fff" opacity="0.85">{c.value} · {pct}%</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Bubble chart · scatter con tamaño variable (3 variables: x, y, r)
function BubbleChart({ points, height = 200, xLabel = 'X', yLabel = 'Y' }) {
  const W = 320, H = height, pad = 28;
  const maxX = Math.max.apply(null, points.map(p => p.x));
  const maxY = Math.max.apply(null, points.map(p => p.y));
  const maxR = Math.max.apply(null, points.map(p => p.r));
  const palette = ['var(--bn-blue)','var(--accent-glow)','var(--bn-lime)','var(--bn-purple)','var(--bn-orange)','var(--bn-teal)'];
  return (
    <div style={{padding:'4px 8px 8px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}}>
        <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="var(--line)" strokeWidth="1"/>
        <line x1={pad} y1={pad/2} x2={pad} y2={H-pad} stroke="var(--line)" strokeWidth="1"/>
        {points.map((p, i) => {
          const cx = pad + (p.x / maxX) * (W - pad * 2);
          const cy = H - pad - (p.y / maxY) * (H - pad * 1.5);
          const r = 4 + (p.r / maxR) * 18;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={palette[i % palette.length]} opacity="0.65" stroke={palette[i % palette.length]} strokeWidth="1.5"/>
              {p.label && r > 10 && <text x={cx} y={cy + 3} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fontWeight="700" fill="#fff">{p.label}</text>}
            </g>
          );
        })}
        <text x={W/2} y={H-4} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)">{xLabel}</text>
        <text x={8} y={H/2} textAnchor="middle" transform={`rotate(-90 8 ${H/2})`} fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)">{yLabel}</text>
      </svg>
    </div>
  );
}

// Dual Axis · combina bar (eje izq) + línea (eje der)
function DualAxisChart({ data, height = 180, leftLabel = 'Bar', rightLabel = 'Line', leftColor = 'var(--bn-blue)', rightColor = 'var(--bn-orange)' }) {
  const W = 340, H = height, pad = 30;
  const maxL = Math.max.apply(null, data.map(d => d.l));
  const maxR = Math.max.apply(null, data.map(d => d.r));
  const bw = (W - pad * 2) / data.length;
  const xs = data.map((_, i) => pad + i * bw + bw / 2);
  const ysR = data.map(d => H - pad - (d.r / maxR) * (H - pad * 1.5));
  const linePath = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x + ',' + ysR[i]).join(' ');
  return (
    <div style={{padding:'4px 8px 8px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}}>
        <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="var(--line)"/>
        {data.map((d, i) => {
          const bh = (d.l / maxL) * (H - pad * 1.5);
          return <rect key={i} x={pad + i*bw + 4} y={H-pad-bh} width={bw - 8} height={bh} fill={leftColor} opacity="0.85" rx="2"/>;
        })}
        <path d={linePath} fill="none" stroke={rightColor} strokeWidth="2.5" strokeLinecap="round"/>
        {xs.map((x, i) => <circle key={i} cx={x} cy={ysR[i]} r="3" fill={rightColor} stroke="var(--paper)" strokeWidth="1.2"/>)}
        {data.map((d, i) => <text key={i} x={xs[i]} y={H - 8} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)">{d.l_label}</text>)}
      </svg>
      <div style={{display:'flex', gap:14, justifyContent:'center', marginTop:4, fontFamily:'var(--mono)', fontSize:9.5}}>
        <span><span style={{color:leftColor, fontWeight:700}}>■</span> {leftLabel}</span>
        <span><span style={{color:rightColor, fontWeight:700}}>●</span> {rightLabel}</span>
      </div>
    </div>
  );
}

// Quadrant Matrix · scatter dividido en 4 cuadrantes con etiquetas
function QuadrantMatrix({ points, xLabel = 'X', yLabel = 'Y', xThreshold = 50, yThreshold = 50, height = 220 }) {
  const W = 320, H = height, pad = 30;
  const tx = pad + (xThreshold / 100) * (W - pad * 2);
  const ty = H - pad - (yThreshold / 100) * (H - pad * 1.5);
  const palette = ['var(--bn-blue)','var(--accent-glow)','var(--bn-lime)','var(--bn-purple)','var(--bn-orange)','var(--bn-teal)','var(--repsol-red)'];
  return (
    <div style={{padding:'4px 8px 8px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H, display:'block'}}>
        <rect x={pad} y={pad/2} width={tx-pad} height={ty-pad/2} fill="var(--bn-red)" opacity="0.06"/>
        <rect x={tx} y={pad/2} width={W-pad-tx} height={ty-pad/2} fill="var(--bn-green)" opacity="0.08"/>
        <rect x={pad} y={ty} width={tx-pad} height={H-pad-ty} fill="var(--bn-orange)" opacity="0.06"/>
        <rect x={tx} y={ty} width={W-pad-tx} height={H-pad-ty} fill="var(--bn-purple)" opacity="0.06"/>
        <line x1={tx} y1={pad/2} x2={tx} y2={H-pad} stroke="var(--ink-4)" strokeDasharray="3,3"/>
        <line x1={pad} y1={ty} x2={W-pad} y2={ty} stroke="var(--ink-4)" strokeDasharray="3,3"/>
        <text x={(pad+tx)/2} y={pad/2 + 10} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--bn-red)" fontWeight="700">Mejorar</text>
        <text x={(tx+W-pad)/2} y={pad/2 + 10} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--bn-green)" fontWeight="700">Excelente</text>
        <text x={(pad+tx)/2} y={H-pad-4} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--bn-orange)" fontWeight="700">Bajo riesgo</text>
        <text x={(tx+W-pad)/2} y={H-pad-4} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--bn-purple)" fontWeight="700">Oportunidad</text>
        {points.map((p, i) => {
          const cx = pad + (p.x / 100) * (W - pad * 2);
          const cy = H - pad - (p.y / 100) * (H - pad * 1.5);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6" fill={palette[i % palette.length]} opacity="0.85"/>
              <text x={cx + 9} y={cy + 3} fontFamily="var(--sans)" fontSize="9.5" fontWeight="600" fill="var(--ink-2)">{p.label}</text>
            </g>
          );
        })}
        <text x={W/2} y={H-4} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--ink-4)" fontWeight="700">{xLabel} →</text>
        <text x={8} y={H/2} textAnchor="middle" transform={`rotate(-90 8 ${H/2})`} fontFamily="var(--mono)" fontSize="9" fill="var(--ink-4)" fontWeight="700">{yLabel} →</text>
      </svg>
    </div>
  );
}

// Summary Table · tabla con métricas vs previous period
function SummaryTable({ rows }) {
  return (
    <div style={{padding:'4px 12px 12px', overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontFamily:'var(--sans)', fontSize:12}}>
        <thead>
          <tr>
            <th style={{padding:'8px 6px', textAlign:'left', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>Métrica</th>
            <th style={{padding:'8px 6px', textAlign:'right', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>Actual</th>
            <th style={{padding:'8px 6px', textAlign:'right', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>Anterior</th>
            <th style={{padding:'8px 6px', textAlign:'right', fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', borderBottom:'1px solid var(--line)'}}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const delta = r.prev ? Math.round(((r.value - r.prev) / r.prev) * 100) : 0;
            const up = delta >= 0;
            return (
              <tr key={i}>
                <td style={{padding:'9px 6px', fontWeight:600, color:'var(--ink-2)', borderBottom:'1px solid var(--line-2)'}}>{r.label}</td>
                <td style={{padding:'9px 6px', textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:'var(--ink)', borderBottom:'1px solid var(--line-2)'}}>{r.value}{r.unit||''}</td>
                <td style={{padding:'9px 6px', textAlign:'right', fontFamily:'var(--mono)', color:'var(--ink-4)', borderBottom:'1px solid var(--line-2)'}}>{r.prev}{r.unit||''}</td>
                <td style={{padding:'9px 6px', textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color: up ? 'var(--bn-green)' : 'var(--bn-red)', borderBottom:'1px solid var(--line-2)'}}>{up ? '↑' : '↓'} {Math.abs(delta)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Title widget · cabecera con título + subtítulo (layout)
function TitleWidget({ title, subtitle, color = 'var(--bn-blue)' }) {
  return (
    <div style={{padding:'22px 26px', background:`linear-gradient(135deg, ${color}08 0%, transparent 80%)`, borderLeft:`3px solid ${color}`}}>
      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color, fontWeight:700, marginBottom:6}}>Section title</div>
      <h2 style={{margin:'0 0 6px', fontSize:22, fontFamily:'var(--sans)', fontWeight:700, letterSpacing:'-0.015em', color:'var(--ink)'}}>{title}</h2>
      {subtitle && <p style={{margin:0, fontSize:13, color:'var(--ink-3)', lineHeight:1.4}}>{subtitle}</p>}
    </div>
  );
}

// Text widget · texto libre customizable (layout)
function TextWidget({ text }) {
  return (
    <div style={{padding:'18px 22px', fontSize:13, lineHeight:1.6, color:'var(--ink-2)', fontFamily:'var(--sans)'}}>
      {text.split('\n').map((p, i) => <p key={i} style={{margin:'0 0 8px'}}>{p}</p>)}
    </div>
  );
}

// Categorías de visualización (estilo Sprinklr)
const WIDGET_CATEGORIES = [
  { id:'kpi',      label:'KPIs · Counters',     desc:'Métricas únicas y resúmenes numéricos' },
  { id:'column',   label:'Column · Bar',        desc:'Comparaciones entre categorías (bar, column, stacked, cluster)' },
  { id:'line',     label:'Line · Area · Spline', desc:'Tendencias temporales' },
  { id:'distribution', label:'Distribution',    desc:'Pie, donut, tree map, heatmap, word cloud' },
  { id:'table',    label:'Tables',              desc:'Pivot, summary, tabla 2D' },
  { id:'funnel',   label:'Funnel · Stages',     desc:'Conversión y etapas' },
  { id:'ai',       label:'AI · Insights',       desc:'Cluster, anomalías y resúmenes BeonAI' },
  { id:'advanced', label:'Advanced',            desc:'Bubble, quadrant, dual axis' },
  { id:'layout',   label:'Layout',              desc:'Title, text — sin datos' },
];

// Catálogo de MÉTRICAS · lo que se mide (eje y / valor)
const METRICS = [
  { id:'pills_completed',  label:'Pills completadas',       unit:'unidades',   color:'var(--bn-blue)' },
  { id:'active_users',     label:'Usuarios activos',        unit:'usuarios',   color:'var(--ok)' },
  { id:'sessions',         label:'Sesiones',                unit:'sesiones',   color:'var(--accent-glow)' },
  { id:'avg_session_time', label:'Tiempo medio · sesión',   unit:'minutos',    color:'var(--bn-purple)' },
  { id:'completion_rate',  label:'Tasa de completación',    unit:'%',          color:'var(--bn-lime)' },
  { id:'nps',              label:'NPS',                     unit:'puntos',     color:'var(--info)' },
  { id:'engagement',       label:'Engagement score',        unit:'puntos',     color:'var(--warn)' },
  { id:'drop_off',         label:'Drop-off rate',           unit:'%',          color:'var(--accent)' },
  { id:'time_invested',    label:'Tiempo invertido',        unit:'horas',      color:'var(--bn-blue)' },
  { id:'modules_started',  label:'Módulos iniciados',       unit:'módulos',    color:'var(--bn-purple-2)' },
  { id:'cert_progress',    label:'Progreso certificación',  unit:'%',          color:'var(--ok)' },
  { id:'rating_avg',       label:'Rating medio (★)',        unit:'estrellas',  color:'#F4B740' },
  { id:'rating_count',     label:'Nº puntuaciones',         unit:'votos',      color:'#F4B740' },
];

// Catálogo de DIMENSIONES · cómo se agrupa (eje x / categoría)
const DIMENSIONS = [
  { id:'day',         label:'Día' },
  { id:'week',        label:'Semana' },
  { id:'month',       label:'Mes' },
  { id:'hour',        label:'Hora del día' },
  { id:'weekday',     label:'Día de la semana' },
  { id:'role',        label:'Rol' },
  { id:'team',        label:'Equipo' },
  { id:'market',      label:'Mercado' },
  { id:'category',    label:'Categoría' },
  { id:'module',      label:'Módulo' },
  { id:'pill',        label:'Pill' },
  { id:'level',       label:'Nivel' },
  { id:'user',        label:'Usuario' },
];

// Librería completa de tipos de widget
// Cada uno: id, label, icon, cat (categoría), desc (descripción corta), defaultSpan
const WIDGET_LIBRARY = [
  // KPI
  { id:'counter',         label:'Counter',          icon:'🔢', cat:'kpi',     desc:'Métrica única + previous period' },
  { id:'counter-summary', label:'Counter Summary',  icon:'📑', cat:'kpi',     desc:'Múltiples KPIs en fila',          defaultSpan:2 },
  { id:'gauge',           label:'Gauge / Dial',     icon:'⏱',  cat:'kpi',     desc:'Engagement vs meta' },
  { id:'nps',             label:'NPS Scorecard',    icon:'🎯', cat:'kpi',     desc:'NPS + Promoters/Passives/Detractors' },
  // Column / Bar
  { id:'column',          label:'Column',           icon:'📊', cat:'column',  desc:'Barras verticales por categoría' },
  { id:'bar',             label:'Bar',              icon:'📊', cat:'column',  desc:'Barras horizontales por categoría' },
  { id:'stacked',         label:'Stacked Bar',      icon:'🟦', cat:'column',  desc:'Barras horizontales acumuladas',  defaultSpan:2 },
  { id:'stacked-column',  label:'Stacked Column',   icon:'🟫', cat:'column',  desc:'Columnas verticales acumuladas',  defaultSpan:2 },
  { id:'cluster',         label:'Clustered Column', icon:'🟪', cat:'column',  desc:'Columnas agrupadas por dimensión',defaultSpan:2 },
  // Line / Area
  { id:'line',            label:'Line',             icon:'📈', cat:'line',    desc:'Serie temporal · puntos conectados' },
  { id:'spline',          label:'Spline',           icon:'🌊', cat:'line',    desc:'Línea suavizada · curva' },
  { id:'area',            label:'Area',             icon:'📈', cat:'line',    desc:'Área bajo la línea' },
  { id:'dropoff',         label:'Drop-off',         icon:'📉', cat:'line',    desc:'Retención minuto a minuto' },
  { id:'sentiment',       label:'Sentiment',        icon:'🌡',  cat:'line',    desc:'Trend stacked pos/neu/neg' },
  // Distribution
  { id:'donut',           label:'Donut / Pie',      icon:'🥧', cat:'distribution', desc:'Distribución porcentual' },
  { id:'tree-map',        label:'Tree Map',         icon:'🧩', cat:'distribution', desc:'Rectángulos jerárquicos',     defaultSpan:2 },
  { id:'heatmap',         label:'Heatmap',          icon:'🟧', cat:'distribution', desc:'Matriz de intensidad' },
  { id:'wordcloud',       label:'Word Cloud',       icon:'☁️', cat:'distribution', desc:'Términos por peso',           defaultSpan:2 },
  // Tables
  { id:'pivot',           label:'Pivot Table',      icon:'🔢', cat:'table',   desc:'Cross-tab heatmap',                defaultSpan:2 },
  { id:'summary-table',   label:'Summary Table',    icon:'📋', cat:'table',   desc:'Métrica + previous + delta' },
  { id:'users',           label:'Tabla usuarios',   icon:'👤', cat:'table',   desc:'Listado individual',               defaultSpan:2 },
  { id:'topquestions',    label:'Top Questions',    icon:'🏆', cat:'table',   desc:'Ranking IA con bar fill' },
  // Funnel
  { id:'funnel',          label:'Funnel',           icon:'🔻', cat:'funnel',  desc:'Etapas de conversión' },
  { id:'modules',         label:'Completación',     icon:'✅', cat:'funnel',  desc:'% completado por módulo' },
  // Ratings · puntuaciones de usuarios
  { id:'ratings-overview', label:'Rating overview', icon:'★',  cat:'kpi',     desc:'★ medio global + nº de votos · datos reales' },
  { id:'ratings-dist',     label:'Rating distribution', icon:'⭐', cat:'distribution', desc:'Distribución 1-5★ sobre todas las pills', defaultSpan:2 },
  { id:'ratings-top',      label:'Top pills · rating',  icon:'🏆', cat:'table', desc:'Pills mejor puntuadas',                       defaultSpan:2 },
  // AI (cluster / insights generados con IA)
  { id:'ia-insight',      label:'AI Insight',       icon:'✨', cat:'ai',      desc:'Insight generado por BeonAI sobre la métrica', defaultSpan:2 },
  { id:'ia-cluster',      label:'AI Cluster',       icon:'🤖', cat:'ai',      desc:'Agrupación automática de usuarios por comportamiento', defaultSpan:2 },
  { id:'ia-anomaly',      label:'AI Anomaly',       icon:'⚠️', cat:'ai',      desc:'Detección de anomalías en la serie temporal' },
  // Advanced
  { id:'bubble',          label:'Bubble',           icon:'⚪', cat:'advanced', desc:'Scatter 3D (x, y, tamaño)' },
  { id:'dual-axis',       label:'Dual Axis',        icon:'⚖️', cat:'advanced', desc:'Bar + línea con 2 ejes' },
  { id:'quadrant',        label:'Quadrant Matrix',  icon:'⊞',  cat:'advanced', desc:'Scatter dividido en 4 cuadrantes' },
  { id:'activity',        label:'Activity feed',    icon:'🔔', cat:'advanced', desc:'Eventos recientes' },
  { id:'wa',              label:'WhatsApp KPIs',    icon:'💬', cat:'advanced', desc:'Compartidos · aperturas · CTR' },
  // Layout
  { id:'title',           label:'Title',            icon:'🅰️', cat:'layout',   desc:'Título de sección',                defaultSpan:2 },
  { id:'text',            label:'Text',             icon:'📝', cat:'layout',   desc:'Texto libre customizable' },
];

// TEAMS para el dashboard de analytics · genérico (antes hardcoded 'Repsol',
// 'BeonIt', 'Sprinklr CSM'). Cuando el módulo de analytics real exista,
// estos vendrán del DB scopeados al workspace activo.
const TEAMS = ['Todos', 'Equipo principal', 'Externos'];
const ROLES = ['Todos', 'Publish Agent', 'Care Agent', 'Manager', 'Analyst', 'Content Lead'];
const DATE_RANGES = [
  { id:'7d',  label:'7 días' },
  { id:'30d', label:'30 días' },
  { id:'90d', label:'90 días' },
  { id:'12m', label:'12 meses' },
  { id:'all', label:'Todo' },
];

// Helper: genera un widget nuevo con id único y configuración por defecto
function newWidget(typeId) {
  const def = WIDGET_LIBRARY.find(w => w.id === typeId);
  // Defaults sensatos de métrica/dimensión según el tipo de widget
  const defaultMetric = (def && def.cat === 'kpi') ? 'active_users'
                      : (def && def.cat === 'ai')  ? 'engagement'
                      : 'pills_completed';
  const defaultDimension = (def && (def.cat === 'line' || def.id === 'spline')) ? 'day'
                         : (def && def.cat === 'kpi') ? null
                         : 'role';
  return {
    id: 'w-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    type: typeId,
    title: def ? def.label : typeId,
    subtitle: def ? def.desc : '',
    span: def && def.defaultSpan ? def.defaultSpan : 1,
    metric: defaultMetric,
    dimension: defaultDimension,
  };
}

// Dashboard ejemplo · pre-built · showcases 8+ tipos de widget mezclados
const EXAMPLE_DASHBOARD = {
  id: 'example-learning',
  name: 'Demo · Learning Analytics Overview',
  desc: 'Dashboard de ejemplo · mezcla 9 tipos de widget para inspirarte',
  icon: '⭐',
  color: 'var(--bn-blue)',
  isExample: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  widgets: [
    { id:'ex-1', type:'title',           title:'Learning Analytics · Q4 2026', subtitle:'Datos demo · cuando integremos la analítica real estos números vendrán por workspace', span:2 },
    { id:'ex-2', type:'counter-summary', title:'KPIs principales',             subtitle:'vs período anterior',                                   span:2 },
    { id:'ex-3', type:'line',            title:'Sesiones diarias',             subtitle:'Últimas 4 semanas',                                     span:1 },
    { id:'ex-4', type:'bar',             title:'Top módulos completados',      subtitle:'Conteo de usuarios que han terminado cada módulo',      span:1 },
    { id:'ex-5', type:'donut',           title:'Distribución por rol',         subtitle:'247 usuarios',                                          span:1 },
    { id:'ex-6', type:'tree-map',        title:'Tiempo invertido por módulo',  subtitle:'Suma de minutos · todos los usuarios',                  span:2 },
    { id:'ex-7', type:'pivot',           title:'Rol × Métrica',                subtitle:'Cross-tab con heatmap',                                 span:2 },
    { id:'ex-8', type:'gauge',           title:'Engagement global',            subtitle:'Meta trimestral 80%',                                   span:1 },
    { id:'ex-9', type:'text',            title:'Notas del dashboard',          subtitle:'Insights generados automáticamente',                    span:1 },
    { id:'ex-10', type:'ratings-overview', title:'Rating medio (★)',           subtitle:'Puntuación media de los vídeos · datos reales',         span:1 },
    { id:'ex-11', type:'ratings-dist',     title:'Distribución de ★',          subtitle:'Cuántos votos de 1 a 5 estrellas',                      span:2 },
    { id:'ex-12', type:'ratings-top',      title:'Pills mejor puntuadas',      subtitle:'Top ★ media · datos reales del store de Ratings',       span:2 },
  ],
};

// ── Helpers de tabs ────────────────────────────────────────────────
// Genera un id de tab nuevo
function newTabId() { return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5); }

// Crea una tab vacía
function newTab(name) {
  return {
    id: newTabId(),
    name: name || 'Nueva pestaña',
    filters: null, // null = hereda del dashboard; objeto = overrides {team, role, range}
    widgets: [],
  };
}

// Migración · si el dashboard no tiene tabs, mete sus widgets en una tab por defecto
function ensureTabs(d) {
  if (d && Array.isArray(d.tabs) && d.tabs.length > 0) return d;
  return {
    ...d,
    tabs: [{
      id: 't-default',
      name: 'Vista general',
      filters: null,
      widgets: Array.isArray(d.widgets) ? d.widgets : [],
    }],
  };
}

// Filtro de fecha por defecto del dashboard
function defaultDateFilter() {
  const today = new Date();
  const from = new Date(today.getTime() - 29 * 86400000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { preset:'30d', from: fmt(from), to: fmt(today) };
}


// ---------- Mock data registry · datos por defecto por widget type ----------
function getMockData(type) {
  switch (type) {
    case 'counter':
      return { label:'Usuarios activos', value:247, prev:215, color:'var(--bn-blue)', icon:'👥' };
    case 'counter-summary':
      return { items: [
        { label:'Usuarios',   value:247,  prev:215,  color:'var(--bn-blue)' },
        { label:'Sesiones',   value:1842, prev:1612, color:'var(--accent-glow)' },
        { label:'Completión', value:58,   prev:54,   unit:'%', color:'var(--bn-lime)' },
        { label:'NPS',        value:58,   prev:51,   color:'var(--bn-purple)' },
      ]};
    case 'gauge':
      return { value:73, label:'Engagement global', sub:'meta trimestral 80%', target:80 };
    case 'nps':
      return { nps:58, promoters:142, passives:71, detractors:34, total:247 };
    case 'column':
      return { data:[{l:'Social P.',v:89},{l:'Aprobac.',v:76},{l:'Calendr.',v:54},{l:'Monitor.',v:38},{l:'DAM',v:22},{l:'Complian.',v:11}], color:'var(--accent-glow)', height:120 };
    case 'bar':
      return { data:[{l:'Crear campañas',v:218},{l:'Aprobación',v:189},{l:'Calendario',v:142},{l:'Monitorización',v:98},{l:'DAM',v:62},{l:'Compliance',v:31}], color:'var(--bn-blue)' };
    case 'stacked':
      return { series:[
        {label:'Completado',   values:[89,76,54,38,22,11]},
        {label:'En progreso',  values:[8,12,20,25,15,10]},
        {label:'Sin iniciar',  values:[3,12,26,37,63,79]},
      ], categories:['Social Publish','Aprobaciones','Calendario','Monitorización','DAM','Compliance'], height:160 };
    case 'stacked-column':
      return { series:[
        {label:'Completado',   values:[89,76,54,38,22,11], color:'var(--ok)' },
        {label:'En progreso',  values:[8,12,20,25,15,10],  color:'var(--accent-glow)' },
        {label:'Sin iniciar',  values:[3,12,26,37,63,79],  color:'var(--ink-4)' },
      ], categories:['Publish','Aprob.','Calend.','Monit.','DAM','Compl.'], height:200 };
    case 'cluster':
      return { groups:[
        { label:'Publish', values:[{l:'Tu equipo',v:142},{l:'Partner',v:98}, {l:'Externos',v:68}] },
        { label:'Care',    values:[{l:'Tu equipo',v:96}, {l:'Partner',v:124},{l:'Externos',v:54}] },
        { label:'Analyt.', values:[{l:'Tu equipo',v:78}, {l:'Partner',v:62}, {l:'Externos',v:112}]},
        { label:'Content', values:[{l:'Tu equipo',v:54}, {l:'Partner',v:48}, {l:'Externos',v:38}] },
      ], series:[
        { label:'Tu equipo', color:'var(--accent)' },
        { label:'Partner',   color:'var(--bn-blue)' },
        { label:'Sprinklr', color:'var(--bn-purple)' },
      ], height:200 };
    case 'line':
      return { data:[{l:'L 14',v:142},{l:'M 15',v:168},{l:'X 16',v:155},{l:'J 17',v:184},{l:'V 18',v:210},{l:'L 21',v:201},{l:'M 22',v:223},{l:'X 23',v:198},{l:'J 24',v:241},{l:'V 25',v:258}], color:'var(--bn-blue)', smooth:false };
    case 'spline':
      return { data:[{l:'L 14',v:142},{l:'M 15',v:168},{l:'X 16',v:155},{l:'J 17',v:184},{l:'V 18',v:210},{l:'L 21',v:201},{l:'M 22',v:223},{l:'X 23',v:198},{l:'J 24',v:241},{l:'V 25',v:258}], color:'var(--accent-glow)', smooth:true };
    case 'area':
      return { data:[142,168,155,184,210,96,78,201,223,198,241,258,112,247], color:'var(--accent-glow)', height:140 };
    case 'dropoff':
      return { values:[100,98,95,90,85,78,71,65,58,50,47,41,38,35,33,30,28,27,25,24,23,22,21,20] };
    case 'sentiment':
      return { data:[
        {l:'S1', pos:62, neu:28, neg:10},{l:'S2', pos:64, neu:26, neg:10},
        {l:'S3', pos:68, neu:24, neg:8}, {l:'S4', pos:71, neu:21, neg:8},
        {l:'S5', pos:69, neu:23, neg:8}, {l:'S6', pos:74, neu:19, neg:7},
        {l:'S7', pos:77, neu:17, neg:6},
      ]};
    case 'donut':
      return { segments:[{l:'Publish Agent',v:89},{l:'Care Agent',v:64},{l:'Managers',v:32},{l:'Reporting',v:28},{l:'Sin rol',v:34}] };
    case 'tree-map':
      return { nodes:[
        { label:'Social Publish', value:1820 },{ label:'Aprobaciones', value:1450 },
        { label:'Calendario',     value:980  },{ label:'DAM',           value:720 },
        { label:'Care',           value:610  },{ label:'Compliance',    value:430 },
        { label:'Listening',      value:380  },{ label:'Reporting',     value:240 },
      ]};
    case 'heatmap':
      return (() => {
        const rows = ['L','M','X','J','V','S','D'];
        const cols = Array.from({length:14}, (_,i) => i);
        const matrix = rows.map((r, ri) => cols.map((_, ci) => {
          const weekend = ri >= 5 ? 0.25 : 1;
          const peak = Math.exp(-Math.pow((ci - 6.5)/4, 2));
          const noise = 0.4 + ((ri * 7 + ci * 3) % 13) / 25;
          return Math.round(weekend * peak * noise * 100);
        }));
        return { rows, cols, matrix };
      })();
    case 'wordcloud':
      return { words:[
        { text:'¿cómo programar?', weight: 87 },{ text:'aprobación', weight: 74 },
        { text:'macros', weight: 68 },          { text:'audiencia', weight: 61 },
        { text:'inboxes', weight: 55 },         { text:'calendario editorial', weight: 49 },
        { text:'mentions', weight: 42 },        { text:'rule engine', weight: 38 },
        { text:'DAM', weight: 36 },             { text:'GDPR', weight: 30 },
        { text:'permisos', weight: 28 },        { text:'reporting', weight: 25 },
        { text:'tags', weight: 22 },            { text:'CSV bulk', weight: 19 },
        { text:'SLA', weight: 17 },             { text:'caso', weight: 14 },
      ]};
    case 'pivot':
      return {
        rows: ['Publish Agent', 'Care Agent', 'Manager', 'Analyst', 'Content Lead'],
        cols: ['Completación', 'Tests', 'NPS', 'Sesión IA'],
        data: [[62, 88, 54, 12],[48, 82, 47, 16],[78, 94, 71, 8],[55, 91, 58, 14],[70, 89, 62, 11]],
      };
    case 'summary-table':
      return { rows:[
        { label:'Usuarios activos',    value:247,  prev:215 },
        { label:'Sesiones semanales',  value:1842, prev:1612 },
        { label:'Completación media',  value:58,   prev:54,  unit:'%' },
        { label:'Tasa éxito tests',    value:94,   prev:92,  unit:'%' },
        { label:'Tiempo medio (m)',    value:182,  prev:215 },
        { label:'NPS',                 value:58,   prev:51 },
      ]};
    case 'topquestions':
      return { items:[
        { text:'¿Cómo programo un post multicanal?',             value: 87 },
        { text:'¿Qué diferencia hay entre macro y rule engine?', value: 74 },
        { text:'¿Cómo apruebo contenido sin ser admin?',          value: 68 },
        { text:'¿Dónde se configuran las audiencias?',            value: 61 },
        { text:'¿Qué inboxes están activos en mi equipo?',        value: 55 },
        { text:'¿Cómo subo activos al DAM?',                      value: 49 },
      ], color:'var(--bn-purple)' };
    case 'funnel':
      return { stages:[
        { l:'Matriculados',      v:247, c:'var(--bn-blue)' },
        { l:'Iniciaron P0',       v:231, c:'var(--accent-glow)' },
        { l:'Completan Bloque 1', v:198, c:'var(--bn-lime)' },
        { l:'Completan Bloque 4', v:142, c:'var(--bn-orange)' },
        { l:'Certificados',       v: 89, c:'var(--repsol-red)' },
      ]};
    case 'modules':
      return { items:[
        { name:'Crear y gestionar campañas', pct:89 },
        { name:'Flujo de aprobación',        pct:76 },
        { name:'Programar posts',            pct:54 },
        { name:'Monitorización y alertas',   pct:38 },
        { name:'Gestión de activos DAM',     pct:22 },
        { name:'Compliance · Gobernanza',    pct:11 },
      ]};
    case 'bubble':
      return { points:[
        { x:30, y:60, r:25, label:'Pub' },{ x:55, y:75, r:40, label:'Care' },
        { x:75, y:90, r:18, label:'Mgr' },{ x:45, y:40, r:30, label:'An' },
        { x:65, y:55, r:22, label:'CL'  },{ x:25, y:30, r:15, label:'Vw'  },
      ], xLabel:'Engagement →', yLabel:'NPS →' };
    case 'dual-axis':
      return { data:[
        { l_label:'S1', l:120, r:62 },{ l_label:'S2', l:148, r:65 },
        { l_label:'S3', l:165, r:68 },{ l_label:'S4', l:192, r:71 },
        { l_label:'S5', l:185, r:74 },{ l_label:'S6', l:215, r:77 },
      ], leftLabel:'Sesiones', rightLabel:'NPS' };
    case 'quadrant':
      return { points:[
        { x:78, y:88, label:'Pub Agent' },{ x:48, y:62, label:'Care' },
        { x:88, y:71, label:'Manager' }, { x:55, y:78, label:'Analyst' },
        { x:65, y:38, label:'Content L' },{ x:30, y:25, label:'Viewer' },
      ], xLabel:'Engagement', yLabel:'Completación', xThreshold:50, yThreshold:50 };
    case 'users':
      return { rows:[
        { name:'Amaia Ruiz',  role:'Publish Agent',  prog:58,  mods:'7/12',  last:'Hoy, 10:42' },
        { name:'Carlos Vega', role:'Publish Agent',  prog:100, mods:'12/12', last:'Ayer' },
        { name:'Sara Molina', role:'Content Lead',   prog:33,  mods:'4/12',  last:'Hace 2 días' },
        { name:'Luis Romero', role:'Analyst',        prog:75,  mods:'9/12',  last:'Hoy, 09:10' },
        { name:'Ana García',  role:'Analytics Lead', prog:17,  mods:'2/12',  last:'Hace 4 días' },
      ]};
    case 'activity':
      return { items:[
        { color:'green',  text:'Carlos Vega completó la ruta de certificación',          time:'Hace 8 min' },
        { color:'orange', text:'Amaia Ruiz superó el test de Publicación con 94%',       time:'Hace 22 min' },
        { color:'',       text:'Sara Molina vio 2 módulos de Calendario',                time:'Hace 1h' },
        { color:'red',    text:'Ana García se quedó atascada en el módulo de Analytics', time:'Hace 3h' },
        { color:'',       text:'Luis Romero descargó el certificado de DAM',             time:'Ayer, 18:30' },
      ]};
    case 'wa':
      return window.WATracker ? window.WATracker.getStats() : { totalShared:0, totalOpens:0, ctr:'0', avgWatch:0, links:[] };
    case 'title':
      return { title:'Sección del dashboard', subtitle:'Edita este título desde las opciones del widget', color:'var(--bn-blue)' };
    case 'text':
      return { text:'Texto libre del widget. Útil para documentar el contexto del dashboard, añadir notas o describir hallazgos.\nPuedes editar este contenido desde las opciones del widget.' };
    case 'ratings-overview': {
      const s = window.Ratings ? window.Ratings.globalStats() : { avg:0, count:0 };
      return { avg: s.avg, count: s.count };
    }
    case 'ratings-dist': {
      const s = window.Ratings ? window.Ratings.globalStats() : { avg:0, count:0, dist:[0,0,0,0,0] };
      return { dist: s.dist, count: s.count, avg: s.avg };
    }
    case 'ratings-top': {
      const s = window.Ratings ? window.Ratings.globalStats() : { top:[] };
      const all = (window.PILLS || []);
      const findTitle = (pid) => {
        const p = all.find(x => x.id === pid);
        return p ? (p.title || ('Pill ' + pid)) : ('Pill ' + pid);
      };
      const rows = (s.top || []).slice(0, 8).map(t => ({
        pillId: t.pillId,
        title: findTitle(t.pillId),
        avg: t.avg,
        count: t.count,
      }));
      return { rows };
    }
    case 'ia-insight':
      return { insight:'**Engagement** cae un 14% los viernes en *Care*. Posible causa: rotación de turno y solapamiento con otros equipos. Sugerencia: revisar horarios de la pill 13.', tags:['care','engagement','semanal'] };
    case 'ia-cluster':
      return { clusters:[
        { name:'High-engagement', size:62, color:'var(--ok)',     traits:['>4 sesiones/sem','≥80% completion'] },
        { name:'Steady learners',  size:124, color:'var(--bn-blue)', traits:['2-3 sesiones/sem','55-80% completion'] },
        { name:'At-risk',          size:48, color:'var(--warn)',   traits:['<1 sesión/sem','<40% completion'] },
        { name:'Dormant',          size:13, color:'var(--accent)', traits:['0 actividad 21d','progreso < 10%'] },
      ]};
    case 'ia-anomaly':
      return { points:[60,62,58,61,59,63,28,65,67,64,68,72], anomalyIdx:6, color:'var(--bn-blue)', alert:'Caída inesperada el día 7 (-49% vs baseline)' };
    default:
      return {};
  }
}

// ---------- Widget renderer · switch por type ----------
function WidgetRenderer({ widget, onRemove, onEditMeta }) {
  const def = WIDGET_LIBRARY.find(w => w.id === widget.type);
  const data = getMockData(widget.type);
  let body = null;
  switch (widget.type) {
    case 'counter':         body = <Counter {...data}/>; break;
    case 'counter-summary': body = <CounterSummary items={data.items}/>; break;
    case 'gauge':           body = <GaugeChart {...data}/>; break;
    case 'nps':             body = <NPSScorecard {...data}/>; break;
    case 'column':          body = <ColumnChart {...data}/>; break;
    case 'bar':             body = <BarChart {...data}/>; break;
    case 'stacked':         body = <StackedBarChart {...data}/>; break;
    case 'stacked-column':  body = <StackedColumnChart {...data}/>; break;
    case 'cluster':         body = <ClusterChart {...data}/>; break;
    case 'ratings-overview': body = <RatingsOverviewWidget {...data}/>; break;
    case 'ratings-dist':     body = <RatingsDistWidget {...data}/>; break;
    case 'ratings-top':      body = <RatingsTopWidget {...data}/>; break;
    case 'ia-insight':      body = <AIInsightWidget {...data} widget={widget}/>; break;
    case 'ia-cluster':      body = <AIClusterWidget {...data} widget={widget}/>; break;
    case 'ia-anomaly':      body = <AIAnomalyWidget {...data} widget={widget}/>; break;
    case 'line':            body = <LineChart {...data}/>; break;
    case 'spline':          body = <LineChart {...data}/>; break;
    case 'area':            body = <AreaChart {...data}/>; break;
    case 'dropoff':         body = (
      <>
        <div className="dropoff-chart">
          {data.values.map((v, i) => <div key={i} className={`dropoff-bar${v < 40 ? ' drop' : ''}`} style={{height: v + '%'}} title={`${Math.floor(i/6)}:${String((i%6)*10).padStart(2,'0')} — ${v}%`}/>)}
        </div>
        <div className="dropoff-axis"><span>0:00</span><span>1:00</span><span>2:00</span><span>3:00</span><span>4:00</span></div>
        <div className="dropoff-legend">
          <span><i style={{background:'var(--beonit-blue)'}}/> Retención</span>
          <span><i style={{background:'var(--repsol-red)'}}/> Drop-off (&lt;40%)</span>
        </div>
      </>
    ); break;
    case 'sentiment':       body = <SentimentTrend data={data.data}/>; break;
    case 'donut':           body = <DonutChart segments={data.segments}/>; break;
    case 'tree-map':        body = <TreeMap nodes={data.nodes}/>; break;
    case 'heatmap':         body = <HeatmapChart {...data}/>; break;
    case 'wordcloud':       body = <WordCloud words={data.words}/>; break;
    case 'pivot':           body = <PivotTable {...data}/>; break;
    case 'summary-table':   body = <SummaryTable rows={data.rows}/>; break;
    case 'topquestions':    body = <TopList items={data.items} color={data.color}/>; break;
    case 'funnel':          body = <FunnelChart stages={data.stages}/>; break;
    case 'modules':         body = (
      <div style={{padding:'12px 18px', display:'flex', flexDirection:'column', gap:10}}>
        {data.items.map((m, i) => (
          <div key={i} className="module-bar-row">
            <div className="mod-name">{m.name}</div>
            <div className="module-bar-wide"><i style={{width: m.pct + '%'}}/></div>
            <div className="mod-pct">{m.pct}%</div>
          </div>
        ))}
      </div>
    ); break;
    case 'bubble':          body = <BubbleChart {...data}/>; break;
    case 'dual-axis':       body = <DualAxisChart {...data}/>; break;
    case 'quadrant':        body = <QuadrantMatrix {...data}/>; break;
    case 'users':           body = (
      <div style={{padding:'0 20px'}}>
        <table className="user-table">
          <thead><tr><th>Usuario</th><th>Progreso</th><th>Módulos</th><th>Última actividad</th></tr></thead>
          <tbody>
            {data.rows.map((u, i) => (
              <tr key={i}>
                <td><div className="u-name">{u.name}</div><div className="u-role">{u.role}</div></td>
                <td><div className="prog-pill"><div className="prog-bar-sm"><i style={{width: u.prog + '%'}}/></div><span style={{fontFamily:'var(--mono)', fontSize:11}}>{u.prog}%</span></div></td>
                <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u.mods}</td>
                <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{u.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ); break;
    case 'activity':        body = (
      <div className="activity-feed">
        {data.items.map((a, i) => (
          <div key={i} className="activity-item">
            <div className={`activity-dot${a.color ? ' ' + a.color : ''}`}/>
            <div className="activity-main"><div className="a-text">{a.text}</div><div className="a-time">{a.time}</div></div>
          </div>
        ))}
      </div>
    ); break;
    case 'wa':              body = (
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'12px 20px 16px'}}>
        {[
          { label:'Compartidos', value: data.totalShared },{ label:'Aperturas', value: data.totalOpens },
          { label:'Ratio',       value: data.ctr+'×' },    { label:'Tiempo medio', value: (data.avgWatch||0)+'s' },
        ].map((k,i) => (
          <div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.03em', color:'var(--ink)', lineHeight:1}}>{k.value}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>
    ); break;
    case 'title':           body = <TitleWidget title={widget.titleText || data.title} subtitle={widget.subtitleText || data.subtitle}/>; break;
    case 'text':            body = <TextWidget text={widget.textContent || data.text}/>; break;
    default:                body = <div style={{padding:20, color:'var(--ink-4)', fontSize:12}}>Widget type "{widget.type}" no soportado.</div>;
  }
  const isLayout = widget.type === 'title' || widget.type === 'text';
  const metricDef = widget.metric && METRICS.find(m => m.id === widget.metric);
  const dimDef = widget.dimension && DIMENSIONS.find(dd => dd.id === widget.dimension);
  return (
    <div className="dash-panel" style={{position:'relative'}}>
      {!isLayout && (
        <div className="dash-panel-head">
          <h3>{widget.title || (def && def.label) || widget.type}</h3>
          {widget.subtitle && <span className="panel-sub">{widget.subtitle}</span>}
          <div style={{marginLeft:'auto', display:'flex', gap:4}}>
            <button onClick={() => onEditMeta(widget)} title="Editar widget · métrica, dimensión, tipo" style={{background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--ink-4)', lineHeight:1, padding:'2px 6px'}}>⚙</button>
            <button onClick={() => onRemove(widget.id)} title="Eliminar widget" style={{background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1, padding:'2px 6px'}}>×</button>
          </div>
        </div>
      )}
      {!isLayout && (metricDef || dimDef) && (
        <div style={{padding:'0 18px 6px', display:'flex', gap:6, flexWrap:'wrap'}}>
          {metricDef && <span style={{fontFamily:'var(--mono)', fontSize:9, padding:'2px 7px', background:'rgba(0,89,150,0.08)', color:'var(--bn-blue)', borderRadius:999, fontWeight:600, letterSpacing:'0.04em'}}>📏 {metricDef.label}</span>}
          {dimDef && <span style={{fontFamily:'var(--mono)', fontSize:9, padding:'2px 7px', background:'rgba(138,57,146,0.08)', color:'var(--bn-purple)', borderRadius:999, fontWeight:600, letterSpacing:'0.04em'}}>📐 por {dimDef.label}</span>}
        </div>
      )}
      {!isLayout ? <div className="dash-panel-body">{body}</div> : body}
      {isLayout && (
        <button onClick={() => onRemove(widget.id)} title="Eliminar" style={{position:'absolute', top:8, right:8, background:'rgba(255,255,255,0.7)', border:'1px solid var(--line-2)', cursor:'pointer', fontSize:11, color:'var(--ink-4)', lineHeight:1, padding:'2px 6px', borderRadius:4, backdropFilter:'blur(4px)'}}>×</button>
      )}
    </div>
  );
}

// ---------- Widget picker · gallery con categorías ----------
function WidgetPicker({ onAdd, onClose }) {
  const [activeCat, setActiveCat] = useS2('kpi');
  const inCat = WIDGET_LIBRARY.filter(w => w.cat === activeCat);
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={onClose}>
      <div style={{background:'var(--paper)', borderRadius:14, width:'min(820px, 96vw)', maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}} onClick={e => e.stopPropagation()}>
        <div style={{padding:'22px 28px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700, marginBottom:4}}>Visualization library · {WIDGET_LIBRARY.length} types</div>
            <h2 style={{margin:0, fontSize:20, fontFamily:'var(--sans)', fontWeight:700, letterSpacing:'-0.01em'}}>Añadir widget</h2>
          </div>
          <button onClick={onClose} style={{width:32, height:32, borderRadius:8, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{display:'flex', flex:1, minHeight:0}}>
          <div style={{width:200, borderRight:'1px solid var(--line)', padding:'14px 10px', overflow:'auto', background:'var(--paper-2)'}}>
            {WIDGET_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                display:'block', width:'100%', textAlign:'left', padding:'10px 12px', marginBottom:2,
                background: activeCat === c.id ? 'var(--paper)' : 'transparent',
                border: activeCat === c.id ? '1px solid var(--line)' : '1px solid transparent',
                borderRadius:8, cursor:'pointer', fontFamily:'var(--sans)', fontSize:12, fontWeight:600, color: activeCat === c.id ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: activeCat === c.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              }}>
                <div style={{marginBottom:2}}>{c.label}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', fontWeight:500, lineHeight:1.3}}>{c.desc}</div>
              </button>
            ))}
          </div>
          <div style={{flex:1, padding:'18px 22px', overflow:'auto'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {inCat.map(wt => (
                <button key={wt.id} onClick={() => { onAdd(wt.id); onClose(); }} style={{
                  display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px',
                  background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:10,
                  cursor:'pointer', fontFamily:'var(--sans)', textAlign:'left', transition:'all .12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-glow)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.transform='translateY(0)'; }}>
                  <span style={{fontSize:24, lineHeight:1, flexShrink:0}}>{wt.icon}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:13, color:'var(--ink)', marginBottom:3}}>{wt.label}</div>
                    <div style={{fontSize:11, color:'var(--ink-4)', lineHeight:1.35}}>{wt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Modal genérico (create / rename / edit widget meta) ----------
function PromptModal({ title, fields, initial, onSave, onClose, saveLabel }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  if (!saveLabel) saveLabel = T('common.save');
  const [vals, setVals] = useS2(() => initial || {});
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(480px, 96vw)', padding:26, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
        <h2 style={{margin:'0 0 18px', fontSize:18, fontFamily:'var(--sans)', fontWeight:700, letterSpacing:'-0.01em'}}>{title}</h2>
        <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:20}}>
          {fields.map(f => (
            <label key={f.key} style={{display:'flex', flexDirection:'column', gap:5}}>
              <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700}}>{f.label}</span>
              {f.type === 'textarea'
                ? <textarea value={vals[f.key] || ''} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} rows={f.rows || 3} style={{padding:'10px 12px', fontFamily:'var(--sans)', fontSize:13, border:'1px solid var(--line)', borderRadius:8, background:'var(--paper-2)', color:'var(--ink)', resize:'vertical'}}/>
                : <input type="text" value={vals[f.key] || ''} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} style={{padding:'10px 12px', fontFamily:'var(--sans)', fontSize:13, border:'1px solid var(--line)', borderRadius:8, background:'var(--paper-2)', color:'var(--ink)'}}/>}
            </label>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onClose} style={{padding:'9px 16px', background:'var(--paper-2)', color:'var(--ink-2)', border:'1px solid var(--line)', borderRadius:8, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:600, fontSize:12}}>{T('common.cancel')}</button>
          <button onClick={() => { onSave(vals); onClose(); }} style={{padding:'9px 18px', background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:12, boxShadow:'0 4px 14px rgba(0,89,150,0.25)'}}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Modal · editar widget con type/metric/dimension ----------
function WidgetEditModal({ widget, onSave, onClose }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [vals, setVals] = useS2({
    title: widget.title || '',
    subtitle: widget.subtitle || '',
    type: widget.type,
    metric: widget.metric || 'pills_completed',
    dimension: widget.dimension || 'role',
  });
  const def = WIDGET_LIBRARY.find(w => w.id === vals.type);
  const dimensionApplies = def && def.cat !== 'kpi' && def.cat !== 'layout';
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'#FFFFFF', borderRadius:14, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(15,23,42,0.25)'}}>
        <div style={{padding:'18px 22px 12px', borderBottom:'1px solid var(--line)'}}>
          <h3 style={{margin:0, fontFamily:'var(--sans)', fontSize:17, fontWeight:700, color:'var(--ink)'}}>Editar widget</h3>
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:3}}>{def ? def.icon + ' ' + def.label : vals.type}</div>
        </div>
        <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:16}}>
          {/* TÍTULO + SUBTÍTULO */}
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Título</span>
            <input value={vals.title} onChange={e => setVals(v => ({ ...v, title: e.target.value }))} placeholder="Nombre visible"
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)'}}/>
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Subtítulo (opcional)</span>
            <input value={vals.subtitle} onChange={e => setVals(v => ({ ...v, subtitle: e.target.value }))} placeholder="Descripción corta"
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)'}}/>
          </label>

          {/* TIPO DE WIDGET · swap */}
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Tipo de visualización</span>
            <select value={vals.type} onChange={e => setVals(v => ({ ...v, type: e.target.value }))}
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', background:'#fff'}}>
              {WIDGET_CATEGORIES.map(cat => (
                <optgroup key={cat.id} label={cat.label}>
                  {WIDGET_LIBRARY.filter(w => w.cat === cat.id).map(w => (
                    <option key={w.id} value={w.id}>{w.icon} {w.label} — {w.desc}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {/* MÉTRICA */}
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Métrica · qué se mide</span>
            <select value={vals.metric} onChange={e => setVals(v => ({ ...v, metric: e.target.value }))}
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', background:'#fff'}}>
              {METRICS.map(m => <option key={m.id} value={m.id}>{m.label} ({m.unit})</option>)}
            </select>
          </label>

          {/* DIMENSIÓN · solo si aplica */}
          {dimensionApplies && (
            <label style={{display:'flex', flexDirection:'column', gap:5}}>
              <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Dimensión · cómo se agrupa</span>
              <select value={vals.dimension || ''} onChange={e => setVals(v => ({ ...v, dimension: e.target.value }))}
                style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', background:'#fff'}}>
                {DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div style={{padding:'12px 22px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--paper-2)'}}>
          <button onClick={onClose} style={{padding:'8px 16px', background:'transparent', border:'1px solid var(--line-2)', color:'var(--ink-3)', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'var(--sans)', fontWeight:600}}>{T('common.cancel')}</button>
          <button onClick={() => onSave(vals)} style={{padding:'8px 18px', background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'var(--sans)', fontWeight:700, boxShadow:'0 3px 10px rgba(0,89,150,0.25)'}}>{T('common.save')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Modal · filtros propios de una pestaña ----------
function TabFiltersModal({ tab, dashboardDefaults, onSave, onClose }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const initial = tab.filters || dashboardDefaults;
  const [vals, setVals] = useS2(initial);
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'#FFFFFF', borderRadius:14, width:'100%', maxWidth:440, boxShadow:'0 24px 64px rgba(15,23,42,0.25)'}}>
        <div style={{padding:'18px 22px 12px', borderBottom:'1px solid var(--line)'}}>
          <h3 style={{margin:0, fontFamily:'var(--sans)', fontSize:17, fontWeight:700, color:'var(--ink)'}}>Filtros de "{tab.name}"</h3>
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', marginTop:3, lineHeight:1.5}}>Estos filtros sólo aplican a los widgets de esta pestaña.</div>
        </div>
        <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:14}}>
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Equipo</span>
            <select value={vals.team} onChange={e => setVals(v => ({ ...v, team: e.target.value }))}
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', background:'#fff'}}>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={{display:'flex', flexDirection:'column', gap:5}}>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Rol</span>
            <select value={vals.role} onChange={e => setVals(v => ({ ...v, role: e.target.value }))}
              style={{padding:'9px 12px', border:'1px solid var(--line-2)', borderRadius:8, fontSize:13, fontFamily:'var(--sans)', background:'#fff'}}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <div style={{padding:'12px 22px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'space-between', gap:8, background:'var(--paper-2)'}}>
          <button onClick={() => onSave(null)} style={{padding:'8px 14px', background:'transparent', border:'1px solid var(--line-2)', color:'var(--ink-4)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--sans)', fontWeight:600}}>{T('common.reset')}</button>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{padding:'8px 16px', background:'transparent', border:'1px solid var(--line-2)', color:'var(--ink-3)', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'var(--sans)', fontWeight:600}}>{T('common.cancel')}</button>
            <button onClick={() => onSave(vals)} style={{padding:'8px 18px', background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12.5, fontFamily:'var(--sans)', fontWeight:700, boxShadow:'0 3px 10px rgba(0,89,150,0.25)'}}>{T('common.apply')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Library view · grid de dashboards ----------
function DashboardLibrary({ dashboards, onOpen, onCreate, onDelete, onDuplicate }) {
  const [showCreate, setShowCreate] = useS2(false);
  const example = dashboards.find(d => d.isExample);
  const custom = dashboards.filter(d => !d.isExample);
  const palette = ['var(--bn-blue)','var(--accent-glow)','var(--bn-lime)','var(--bn-purple)','var(--bn-orange)','var(--bn-teal)','var(--repsol-red)'];
  const icons = ['📊','📈','🎯','🔥','⚡','🤖','📚','💡','🧭','🎨'];
  return (
    <div className="dash-root">
      {showCreate && (
        <PromptModal
          title="Crear nuevo dashboard"
          fields={[
            { key:'name', label:'Nombre', placeholder:'Ej: Customer Care performance' },
            { key:'desc', label:'Descripción (opcional)', placeholder:'Describe el objetivo de este dashboard', type:'textarea', rows:2 },
          ]}
          initial={{ name:'', desc:'' }}
          onSave={(vals) => {
            if (!vals.name || !vals.name.trim()) return;
            const d = {
              id: 'd-' + Date.now().toString(36),
              name: vals.name.trim(),
              desc: (vals.desc && vals.desc.trim()) || '',
              icon: icons[Math.floor(Math.random() * icons.length)],
              color: palette[custom.length % palette.length],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              tabs: [{ id: newTabId(), name:'Vista general', filters:null, widgets:[] }],
              dateFilter: defaultDateFilter(),
            };
            onCreate(d);
          }}
          onClose={() => setShowCreate(false)}
          saveLabel="Crear dashboard"
        />
      )}

      <div className="dash-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:18}}>
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot"/>Analytics · Repositorio</div>
          <h1>Mis <em>dashboards</em></h1>
          <div className="dash-sub">Repositorio de dashboards personalizados. Crea desde cero, organiza con pestañas y combina {WIDGET_LIBRARY.length} tipos de widget.</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:13.5, boxShadow:'0 4px 14px rgba(0,89,150,0.25)', marginTop:8}}>
          <span style={{fontSize:16, lineHeight:1}}>+</span> Crear dashboard desde cero
        </button>
      </div>

      {example && (
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700, marginBottom:10}}>★ Dashboard ejemplo · solo lectura</div>
          <button onClick={() => onOpen(example.id)} style={{display:'block', width:'100%', textAlign:'left', padding:0, background:'transparent', border:'none', cursor:'pointer'}}>
            <div style={{padding:'22px 26px', background:`linear-gradient(135deg, ${example.color}10 0%, var(--paper) 60%)`, border:`1px solid ${example.color}40`, borderRadius:14, display:'flex', alignItems:'center', gap:16, transition:'all .15s'}}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${example.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{fontSize:40, lineHeight:1}}>{example.icon}</div>
              <div style={{flex:1}}>
                <h3 style={{margin:'0 0 4px', fontSize:17, fontFamily:'var(--sans)', fontWeight:700, color:'var(--ink)'}}>{example.name}</h3>
                <p style={{margin:'0 0 6px', fontSize:13, color:'var(--ink-3)', lineHeight:1.4}}>{example.desc}</p>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', color:'var(--ink-4)'}}>{example.widgets.length} widgets · 9 tipos distintos · explora cómo combinar visualizaciones</div>
              </div>
              <div style={{fontFamily:'var(--mono)', fontSize:11, color:example.color, fontWeight:700, padding:'8px 14px', border:`1px solid ${example.color}40`, borderRadius:8}}>Abrir →</div>
            </div>
          </button>
        </div>
      )}

      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700, marginBottom:10}}>Tus dashboards · {custom.length}</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14}}>
          {/* Tile · crear dashboard desde cero (siempre primero) */}
          <button onClick={() => setShowCreate(true)}
            style={{padding:'24px 18px', background:'linear-gradient(135deg, rgba(0,89,150,0.04) 0%, rgba(110,80,238,0.04) 100%)', border:'1.5px dashed var(--line-2)', borderRadius:12, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, minHeight:140, transition:'all .15s', color:'var(--ink-3)', fontFamily:'var(--sans)'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--bn-blue)'; e.currentTarget.style.background='linear-gradient(135deg, rgba(0,89,150,0.08) 0%, rgba(110,80,238,0.08) 100%)'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line-2)'; e.currentTarget.style.background='linear-gradient(135deg, rgba(0,89,150,0.04) 0%, rgba(110,80,238,0.04) 100%)'; e.currentTarget.style.transform='translateY(0)'; }}>
            <div style={{width:42, height:42, borderRadius:'50%', background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, lineHeight:1, fontWeight:300, boxShadow:'0 4px 12px rgba(0,89,150,0.2)'}}>+</div>
            <div style={{fontSize:13, fontWeight:700, color:'var(--ink-2)'}}>Crear dashboard</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.4}}>desde cero · pestañas + widgets</div>
          </button>
          {custom.length === 0 && (
            <div style={{gridColumn:'span 2', padding:'24px 20px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:12, fontSize:12.5, color:'var(--ink-4)', display:'flex', alignItems:'center', gap:14}}>
              <span style={{fontSize:28, opacity:0.5}}>📁</span>
              <span>Sin dashboards aún. Empieza creando uno desde cero o duplica el ejemplo de arriba.</span>
            </div>
          )}
          {custom.map(d => (
            <div key={d.id} style={{background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', transition:'all .15s'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor=d.color; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.08)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <button onClick={() => onOpen(d.id)} style={{padding:'18px 18px 14px', background:`linear-gradient(135deg, ${d.color}12 0%, transparent 100%)`, border:'none', borderBottom:'1px solid var(--line-2)', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:12}}>
                <div style={{fontSize:28, lineHeight:1}}>{d.icon}</div>
                <div style={{flex:1, minWidth:0}}>
                  <h3 style={{margin:'0 0 4px', fontSize:14.5, fontFamily:'var(--sans)', fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</h3>
                  {d.desc && <p style={{margin:0, fontSize:11.5, color:'var(--ink-3)', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{d.desc}</p>}
                </div>
              </button>
              <div style={{padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.06em', color:'var(--ink-4)', textTransform:'uppercase', fontWeight:600}}>{((d.tabs && d.tabs.reduce((s,t) => s + (t.widgets?.length||0), 0)) || (d.widgets?.length || 0))} widgets · {(d.tabs?.length || 1)} pestaña{(d.tabs?.length||1)===1?'':'s'} · {new Date(d.updatedAt).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</div>
                <div style={{display:'flex', gap:4}}>
                  <button onClick={() => onDuplicate(d.id)} title="Duplicar" style={{background:'none', border:'none', cursor:'pointer', fontSize:13, padding:'4px 6px', color:'var(--ink-4)'}}>⎘</button>
                  <button onClick={() => { if (confirm('¿Eliminar el dashboard "' + d.name + '"? Esta acción no se puede deshacer.')) onDelete(d.id); }} title="Eliminar" style={{background:'none', border:'none', cursor:'pointer', fontSize:13, padding:'4px 6px', color:'var(--ink-4)'}}>🗑</button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ---------- Dashboard view · vista de un dashboard concreto ----------
function DashboardView({ dashboard, onUpdate, onBack, onRename }) {
  const d = ensureTabs(dashboard);
  const [showPicker, setShowPicker] = useS2(false);
  const [editingMeta, setEditingMeta] = useS2(null);
  const [showRename, setShowRename] = useS2(false);
  const [showTabFilters, setShowTabFilters] = useS2(false);
  const [tabMenu, setTabMenu] = useS2(null); // id de la tab cuyo menú está abierto
  const [activeTabId, setActiveTabId] = useS2(d.tabs[0].id);
  const [dateFilter, setDateFilter] = useS2(d.dateFilter || defaultDateFilter());

  const activeTab = d.tabs.find(t => t.id === activeTabId) || d.tabs[0];
  const effFilters = (activeTab && activeTab.filters) || { team:'Todos', role:'Todos' };

  // Persiste el dashboard con tabs
  const persist = (next) => onUpdate({ ...next, updatedAt: Date.now() });

  // ── CRUD widgets dentro de la tab activa
  const updateTabs = (mut) => persist({ ...d, tabs: d.tabs.map(t => t.id === activeTab.id ? mut(t) : t) });
  const addWidget = (typeId) => updateTabs(t => ({ ...t, widgets: [...t.widgets, newWidget(typeId)] }));
  const removeWidget = (id) => updateTabs(t => ({ ...t, widgets: t.widgets.filter(w => w.id !== id) }));
  const saveWidgetMeta = (vals) => {
    updateTabs(t => ({ ...t, widgets: t.widgets.map(w => w.id === editingMeta.id ? {
      ...w,
      title: vals.title,
      subtitle: vals.subtitle,
      type: vals.type || w.type,
      metric: vals.metric || w.metric,
      dimension: vals.dimension || w.dimension,
    } : w) }));
    setEditingMeta(null);
  };

  // ── CRUD tabs
  const addTab = () => {
    const t = newTab('Pestaña ' + (d.tabs.length + 1));
    persist({ ...d, tabs: [...d.tabs, t] });
    setActiveTabId(t.id);
  };
  const renameTab = (tabId, name) => persist({ ...d, tabs: d.tabs.map(t => t.id === tabId ? { ...t, name } : t) });
  const deleteTab = (tabId) => {
    if (d.tabs.length === 1) { alert('No puedes eliminar la última pestaña.'); return; }
    if (!confirm('¿Eliminar esta pestaña y sus widgets?')) return;
    const next = d.tabs.filter(t => t.id !== tabId);
    persist({ ...d, tabs: next });
    if (activeTabId === tabId) setActiveTabId(next[0].id);
  };
  const updateTabFilters = (filters) => persist({ ...d, tabs: d.tabs.map(t => t.id === activeTab.id ? { ...t, filters } : t) });

  // ── Date filter
  const setPreset = (preset) => {
    const today = new Date();
    const days = preset === '7d' ? 6 : preset === '30d' ? 29 : preset === '90d' ? 89 : preset === '12m' ? 364 : null;
    const fmt = (x) => x.toISOString().slice(0, 10);
    const from = days !== null ? new Date(today.getTime() - days * 86400000) : new Date(2024, 0, 1);
    const next = { preset, from: fmt(from), to: fmt(today) };
    setDateFilter(next);
    persist({ ...d, dateFilter: next });
  };
  const setCustomDate = (key, value) => {
    const next = { ...dateFilter, [key]: value, preset:'custom' };
    setDateFilter(next);
    persist({ ...d, dateFilter: next });
  };

  return (
    <div className="dash-root">
      {showPicker && <WidgetPicker onAdd={addWidget} onClose={() => setShowPicker(false)}/>}
      {editingMeta && (
        <WidgetEditModal
          widget={editingMeta}
          onSave={saveWidgetMeta}
          onClose={() => setEditingMeta(null)}
        />
      )}
      {showRename && (
        <PromptModal
          title="Renombrar dashboard"
          fields={[
            { key:'name', label:'Nombre' },
            { key:'desc', label:'Descripción', type:'textarea', rows:2 },
          ]}
          initial={{ name: d.name, desc: d.desc }}
          onSave={(vals) => { onRename(d.id, vals.name, vals.desc); setShowRename(false); }}
          onClose={() => setShowRename(false)}
        />
      )}
      {showTabFilters && (
        <TabFiltersModal
          tab={activeTab}
          dashboardDefaults={{ team:'Todos', role:'Todos' }}
          onSave={(filters) => { updateTabFilters(filters); setShowTabFilters(false); }}
          onClose={() => setShowTabFilters(false)}
        />
      )}

      <button onClick={onBack} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', background:'transparent', border:'none', cursor:'pointer', color:'var(--ink-3)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>
        ← Volver a mis dashboards
      </button>

      <div className="dash-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:14}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
          <div style={{fontSize:36, lineHeight:1, marginTop:6}}>{d.icon || '📊'}</div>
          <div>
            <div className="lms-hero-eyebrow"><span className="repsol-dot"/>{d.isExample ? 'Dashboard ejemplo' : 'Dashboard custom'}</div>
            <h1>{d.name}</h1>
            {d.desc && <div className="dash-sub">{d.desc}</div>}
            <div className="dash-sub" style={{marginTop:4, opacity:0.7}}>{d.tabs.length} pestaña{d.tabs.length === 1 ? '' : 's'} · {d.tabs.reduce((s, t) => s + t.widgets.length, 0)} widgets · {dateFilter.from} → {dateFilter.to}</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
          {!d.isExample && <button onClick={() => setShowRename(true)} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px', background:'var(--paper-2)', color:'var(--ink-2)', border:'1px solid var(--line)', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:600, fontSize:12}}>✎ Renombrar</button>}
          <button onClick={() => setShowPicker(true)} style={{display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px', background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:13, boxShadow:'0 4px 14px rgba(0,89,150,0.3)'}}>+ Añadir widget</button>
        </div>
      </div>

      {/* FILTRO DE FECHA · siempre abierto en la parte superior */}
      <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom:12, padding:'12px 14px', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10, alignItems:'center'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:700}}>📅 Fecha</div>
        <div style={{display:'flex', gap:4, alignItems:'center'}}>
          {DATE_RANGES.map(r => (
            <button key={r.id} onClick={() => setPreset(r.id)} style={{
              padding:'5px 10px', fontFamily:'var(--mono)', fontSize:10.5, fontWeight:600,
              background: dateFilter.preset === r.id ? 'var(--bn-blue)' : 'var(--paper-2)',
              color: dateFilter.preset === r.id ? '#fff' : 'var(--ink-3)',
              border: '1px solid ' + (dateFilter.preset === r.id ? 'var(--bn-blue)' : 'var(--line)'),
              borderRadius:6, cursor:'pointer',
            }}>{r.label}</button>
          ))}
        </div>
        <div style={{width:1, height:20, background:'var(--line)'}}/>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>Desde</span>
          <input type="date" value={dateFilter.from} onChange={e => setCustomDate('from', e.target.value)}
            style={{padding:'5px 8px', fontFamily:'var(--mono)', fontSize:11, background:'var(--paper-2)', color:'var(--ink-2)', border:'1px solid ' + (dateFilter.preset==='custom' ? 'var(--bn-blue)' : 'var(--line)'), borderRadius:6}}/>
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>hasta</span>
          <input type="date" value={dateFilter.to} onChange={e => setCustomDate('to', e.target.value)}
            style={{padding:'5px 8px', fontFamily:'var(--mono)', fontSize:11, background:'var(--paper-2)', color:'var(--ink-2)', border:'1px solid ' + (dateFilter.preset==='custom' ? 'var(--bn-blue)' : 'var(--line)'), borderRadius:6}}/>
        </div>
      </div>

      {/* BARRA DE TABS · pestañas + 3-dot menu por pestaña + añadir */}
      <div style={{display:'flex', alignItems:'center', gap:2, marginBottom:16, borderBottom:'1px solid var(--line)', paddingBottom:0, position:'relative'}}>
        {d.tabs.map(t => {
          const isActive = t.id === activeTabId;
          const isMenu = tabMenu === t.id;
          return (
            <div key={t.id} style={{position:'relative'}}>
              <button onClick={() => setActiveTabId(t.id)} style={{
                padding:'10px 14px 9px', background:'transparent', border:'none',
                borderBottom: '2px solid ' + (isActive ? 'var(--bn-blue)' : 'transparent'),
                color: isActive ? 'var(--ink)' : 'var(--ink-4)',
                fontFamily:'var(--sans)', fontWeight: isActive ? 700 : 500, fontSize:13.5,
                cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
                marginBottom:-1,
              }}>
                <span>{t.name}</span>
                <span style={{fontFamily:'var(--mono)', fontSize:9, padding:'1px 5px', background:'var(--paper-2)', color:'var(--ink-4)', borderRadius:999, fontWeight:600}}>{t.widgets.length}</span>
                {t.filters && <span title="Filtros propios" style={{fontSize:9, color:'var(--bn-blue)'}}>●</span>}
              </button>
              {!d.isExample && (
                <button onClick={(e) => { e.stopPropagation(); setTabMenu(isMenu ? null : t.id); }}
                  title="Opciones de pestaña"
                  style={{position:'absolute', right:-4, top:8, padding:'3px 6px', background:'transparent', border:'none', color:'var(--ink-4)', cursor:'pointer', fontSize:14, lineHeight:1, opacity: isActive ? 0.85 : 0.45}}>⋯</button>
              )}
              {isMenu && (
                <>
                  <div onClick={() => setTabMenu(null)} style={{position:'fixed', inset:0, zIndex:50}}/>
                  <div style={{position:'absolute', top:'100%', right:0, minWidth:200, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:8, boxShadow:'0 8px 24px rgba(15,23,42,0.12)', zIndex:51, padding:6, marginTop:4}}>
                    <button onClick={() => { setActiveTabId(t.id); setShowTabFilters(true); setTabMenu(null); }}
                      style={{display:'flex', width:'100%', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', borderRadius:6, fontSize:12.5, color:'var(--ink-2)', textAlign:'left'}}
                      onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      ⚙ Filtros de esta pestaña
                    </button>
                    <button onClick={() => { const n = prompt('Nuevo nombre', t.name); if (n && n.trim()) renameTab(t.id, n.trim()); setTabMenu(null); }}
                      style={{display:'flex', width:'100%', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', borderRadius:6, fontSize:12.5, color:'var(--ink-2)', textAlign:'left'}}
                      onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      ✎ Renombrar
                    </button>
                    {t.filters && (
                      <button onClick={() => { updateTabFilters(null); setTabMenu(null); }}
                        style={{display:'flex', width:'100%', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', borderRadius:6, fontSize:12.5, color:'var(--ink-2)', textAlign:'left'}}
                        onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        ↻ Quitar filtros propios
                      </button>
                    )}
                    <div style={{height:1, background:'var(--line)', margin:'4px 0'}}/>
                    <button onClick={() => { deleteTab(t.id); setTabMenu(null); }}
                      style={{display:'flex', width:'100%', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', borderRadius:6, fontSize:12.5, color:'var(--accent)', textAlign:'left'}}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(244,87,68,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      🗑 Eliminar pestaña
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {!d.isExample && (
          <button onClick={addTab} title="Añadir pestaña"
            style={{padding:'8px 12px', marginLeft:4, background:'transparent', border:'1px dashed var(--line-2)', color:'var(--ink-4)', borderRadius:6, cursor:'pointer', fontSize:13, fontFamily:'var(--sans)', fontWeight:600}}>+ Pestaña</button>
        )}
      </div>

      {/* CHIP de filtros activos de la tab */}
      {activeTab.filters && (
        <div style={{display:'inline-flex', alignItems:'center', gap:8, marginBottom:12, padding:'6px 12px', background:'rgba(0,89,150,0.06)', border:'1px solid rgba(0,89,150,0.18)', borderRadius:999, fontSize:11.5, color:'var(--ink-2)'}}>
          <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--bn-blue)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>Pestaña</span>
          <span>Equipo: <strong>{activeTab.filters.team}</strong></span>
          <span>·</span>
          <span>Rol: <strong>{activeTab.filters.role}</strong></span>
          <button onClick={() => updateTabFilters(null)} style={{background:'none', border:'none', cursor:'pointer', color:'var(--ink-4)', fontSize:13, lineHeight:1}}>×</button>
        </div>
      )}

      {activeTab.widgets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Esta pestaña está vacía</h3>
          <p>Añade tu primer widget. {WIDGET_LIBRARY.length} tipos disponibles, organizados en {WIDGET_CATEGORIES.length} categorías.</p>
          <button className="btn glow" onClick={() => setShowPicker(true)}>+ Añadir mi primer widget</button>
        </div>
      )}

      <div className="dash-grid">
        {activeTab.widgets.map(w => (
          <div key={w.id} style={{gridColumn: w.span > 1 ? `span ${w.span}` : undefined}}>
            <WidgetRenderer widget={w} onRemove={removeWidget} onEditMeta={(x) => setEditingMeta(x)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Analytics Dashboard · router (library | view) ----------
function Dashboard() {
  const STORE_KEY = window.userKey ? window.userKey('solid-analytics-v2') : 'solid-analytics-v2';
  const [state, setState] = useS2(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (s && Array.isArray(s.dashboards)) {
        // Reemplaza siempre el example por la versión actual (incluye widgets nuevos)
        s.dashboards = s.dashboards.filter(d => d.id !== EXAMPLE_DASHBOARD.id);
        s.dashboards.unshift(EXAMPLE_DASHBOARD);
        return s;
      }
    } catch(e) {}
    return { dashboards: [EXAMPLE_DASHBOARD], currentId: null };
  });
  React.useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }, [state]);

  const current = state.currentId ? state.dashboards.find(d => d.id === state.currentId) : null;
  const openDashboard = (id) => setState(s => ({ ...s, currentId: id }));
  const backToLibrary = () => setState(s => ({ ...s, currentId: null }));
  const createDashboard = (d) => setState(s => ({ ...s, dashboards: [...s.dashboards, d], currentId: d.id }));
  const updateDashboard = (d) => setState(s => ({ ...s, dashboards: s.dashboards.map(x => x.id === d.id ? d : x) }));
  const renameDashboard = (id, name, desc) => setState(s => ({ ...s, dashboards: s.dashboards.map(x => x.id === id ? { ...x, name: (name && name.trim()) || x.name, desc: (desc && desc.trim()) || '', updatedAt: Date.now() } : x) }));
  const deleteDashboard = (id) => {
    if (id === EXAMPLE_DASHBOARD.id) return;
    setState(s => ({ ...s, dashboards: s.dashboards.filter(d => d.id !== id), currentId: s.currentId === id ? null : s.currentId }));
  };
  const duplicateDashboard = (id) => setState(s => {
    const src = ensureTabs(s.dashboards.find(d => d.id === id));
    if (!src) return s;
    const copy = {
      ...src,
      id: 'd-' + Date.now().toString(36),
      name: src.name + ' (copia)',
      isExample: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      widgets: undefined,
      tabs: src.tabs.map(t => ({
        ...t,
        id: newTabId(),
        widgets: t.widgets.map(w => ({ ...w, id:'w-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6) })),
      })),
    };
    return { ...s, dashboards: [...s.dashboards, copy], currentId: copy.id };
  });

  if (!current) return <DashboardLibrary dashboards={state.dashboards} onOpen={openDashboard} onCreate={createDashboard} onDelete={deleteDashboard} onDuplicate={duplicateDashboard}/>;
  return <DashboardView key={current.id} dashboard={current} onUpdate={updateDashboard} onBack={backToLibrary} onRename={renameDashboard}/>;
}


Object.assign(window, { Player, AISidekick, Onboarding, Dashboard, LEARNING_PATHS, ColumnChart, StackedBarChart, DonutChart, AreaChart, HeatmapChart, GaugeChart, FunnelChart, StarRating });
