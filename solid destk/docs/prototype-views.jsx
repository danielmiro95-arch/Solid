// prototype-views.jsx — Detail, Player, Coach, Onboarding, Path, Profile, WhatsApp (es)

const { useState: useS2, useEffect: useE2 } = React;

const CAT_COLORS = {
  'Fundamentos': '#0072BE', 'Estructura': '#005a96', 'Gobernanza': '#3d31cc',
  'Social Publish': '#EB0029', 'Activos': '#036837', 'Aprobaciones': '#8A3992',
  'Compliance': '#1a1a2e', 'Calendario': '#0072BE', 'Analytics': '#004d8a',
  'Care': '#B8001F', 'Integraciones': '#3d31cc',
};

const RepsolDetailCover = ({ pill, category, title }) => {
  const accent = CAT_COLORS[category] || '#0D1117';
  return (
    <div style={{position:'absolute', inset:0, background:`linear-gradient(160deg, ${accent} 0%, #080e1a 100%)`, overflow:'hidden'}}>
      <div style={{position:'absolute', top:0, left:0, right:0, height:4, background:'#EB0029'}}/>
      <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 28px)'}}/>
      <div style={{position:'absolute', right:-20, bottom:-20, fontSize:160, fontWeight:800, fontFamily:'var(--mono)', color:'rgba(255,255,255,0.04)', lineHeight:1, letterSpacing:'-0.05em', userSelect:'none'}}>
        {pill != null ? String(pill).padStart(2,'0') : ''}
      </div>
      <div style={{position:'absolute', bottom:24, left:24, right:24}}>
        <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:8}}>Repsol × Sprinklr</div>
        {category && <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', fontWeight:700, marginBottom:8}}>{category}</div>}
        <div style={{fontFamily:'var(--sans)', fontSize:18, fontWeight:600, color:'#fff', lineHeight:1.25, letterSpacing:'-0.01em'}}>{title}</div>
      </div>
    </div>
  );
};

// ---------- Detail ----------
function Detail({ item, openPlayer, back, setView, setAIMode }) {
  const [bookmarked, setBookmarked] = useS2(window.Bookmarks ? window.Bookmarks.has(item?.id) : false);
  const toggleBookmark = () => {
    if (!item || !window.Bookmarks) return;
    const now = window.Bookmarks.toggle(item.id);
    setBookmarked(now);
    if (window.Toast) {
      if (now) window.Toast.success('Módulo guardado en tu biblioteca', { icon: '✓', action: { label: 'Ver', onClick: () => setView && setView('saved') }});
      else window.Toast.info('Módulo quitado de la biblioteca', { icon: '×' });
    }
  };
  const askMentor = () => {
    if (setAIMode) setAIMode('hero');
    else if (setView) setView('coach');
  };
  const it = item || PILLS[0];
  const chapsByFormat = {
    módulo: [
      { n: 1, t: 'Introducción y contexto en Repsol', d: 'Por qué este módulo importa.', done: true },
      { n: 2, t: 'Interfaz y accesos en Sprinklr', d: 'Dónde está cada cosa.', done: true },
      { n: 3, t: 'Flujo de trabajo paso a paso', d: 'El proceso completo.', current: true },
      { n: 4, t: 'Casos reales del equipo Repsol', d: 'Ejemplos del día a día.' },
      { n: 5, t: 'Errores comunes y cómo evitarlos', d: 'Lo que falla al principio.' },
    ],
    serie: [
      { n: 1, t: 'Fundamentos', d: 'Base conceptual.', done: true },
      { n: 2, t: 'Configuración inicial', d: 'Setup en entorno Repsol.', done: true },
      { n: 3, t: 'Flujo principal', d: 'El proceso completo.', current: true },
      { n: 4, t: 'Casos avanzados', d: 'Escenarios complejos.' },
      { n: 5, t: 'Integración con otros sistemas', d: 'Herramientas Repsol.' },
      { n: 6, t: 'Evaluación final', d: 'Verifica lo aprendido.' },
    ],
  };
  const chapters = chapsByFormat[it.format] || chapsByFormat['módulo'];
  return (
    <>
      <section className="detail-hero">
        <div style={{position:'relative', padding:'14px 56px 8px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={back} style={{display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'rgba(245,241,232,0.6)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', padding:'4px 0'}}>
            <Icon name="back" size={11}/> Volver al catálogo
          </button>
        </div>
        <div className="detail-hero-inner">
          <div className="detail-poster">
            {it.yt
              ? <img src={`https://img.youtube.com/vi/${it.yt}/hqdefault.jpg`} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt={it.title}/>
              : <RepsolDetailCover pill={it.pill} category={it.category} title={it.title}/>
            }
          </div>
          <div className="detail-head">
            <span className="eyebrow eye">{it.format} · {it.category}</span>
            <h1>{it.title}</h1>
            <p className="lead">Módulo diseñado para el equipo Publish Agent de Repsol. Aprende con flujos y ejemplos reales de las operaciones de comunicación de Repsol en Sprinklr.</p>
            <div className="detail-meta-row">
              <span>{chapters.length} LECCIONES</span><span className="sep">·</span>
              <span>{it.duration}</span><span className="sep">·</span>
              <span style={{textTransform:'uppercase'}}>{it.teacher}</span><span className="sep">·</span>
              <span>★ {it.rating || '4.8'} · {it.enrolled || '220'} COMPLETADAS</span>
            </div>
            <div className="detail-cta-row">
              <button className="btn glow" onClick={() => openPlayer(it)}>
                <Icon name="play" size={14}/>
                {it.yt ? 'Ver vídeo' : 'Empezar'} · {it.duration}
              </button>
              <button className="btn ghost" onClick={toggleBookmark} style={bookmarked ? {background:'var(--accent-glow)', borderColor:'var(--accent-glow)', color:'#fff'} : {}}>
                <Icon name="bookmark" size={14}/> {bookmarked ? 'Guardado ✓' : 'Guardar'}
              </button>
              <button className="btn ghost" onClick={() => window.WATracker && window.WATracker.shareLink(it.id, it.title, it.duration)} style={{background:'#25D366', borderColor:'#25D366', color:'#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.186-.007-.397-.007-.603-.007-.21 0-.547.074-.83.375-.28.3-1.089 1.06-1.089 2.595 0 1.535 1.114 3.021 1.27 3.231.149.195 2.185 3.344 5.298 4.692.742.315 1.319.504 1.77.646.746.24 1.423.206 1.96.127.598-.089 1.84-.752 2.098-1.482.26-.72.26-1.336.18-1.466-.075-.135-.276-.21-.574-.346zM11.997 1.903c-5.569 0-10.097 4.524-10.097 10.097 0 1.782.465 3.447 1.282 4.892l-1.413 5.16 5.285-1.385a10.037 10.037 0 004.944 1.296h.004c5.57 0 10.095-4.524 10.095-10.097C22.097 6.427 17.567 1.903 11.997 1.903z"/>
                </svg>
                Compartir por WhatsApp
              </button>
              <button className="btn ghost" onClick={askMentor}><Icon name="sparkle" size={14}/> Preguntar a MENTOR-IA</button>
            </div>
          </div>
        </div>
      </section>
      <div className="detail-body">
        <div className="detail-outline">
          <h3>Qué hay dentro</h3>
          {chapters.map(c => (
            <div key={c.n} className={`outline-item ${c.done ? 'done' : ''} ${c.current ? 'current' : ''}`} onClick={() => openPlayer(it)}>
              <span className="n">{String(c.n).padStart(2,'0')}</span>
              <div className="t">{c.t}<em>{c.d}</em></div>
              <span className="d">3 MIN</span>
            </div>
          ))}
        </div>
        <aside className="detail-side">
          <div>
            <h3>Impartido por</h3>
            <div className="teacher">
              <div className="av" style={{position:'relative', overflow:'hidden'}}><div className={`ph ${it.tone}`} style={{position:'absolute',inset:0,borderRadius:'50%'}}/></div>
              <div>
                <div className="name">{it.teacher}</div>
                <div className="bio">Equipo de formación Repsol × BeonIt. Especialista en Sprinklr y gestión de contenidos digitales.</div>
              </div>
            </div>
          </div>
          <div>
            <h3>MENTOR-IA dice <span className="beta-badge">BETA</span></h3>
            <div style={{padding:'14px 16px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, lineHeight:1.5}}>
              "Amaia, completar este módulo te acerca al test final de certificación. El nivel de dificultad encaja con tu progreso actual."
            </div>
          </div>
          <div>
            <h3>Otros módulos</h3>
            <div className="related-list">
              {PILLS.filter(p => p.id !== it.id).slice(0,3).map(s => (
                <div className="related" key={s.id}>
                  <div className="thumb" style={{position:'relative', overflow:'hidden'}}>
                    {s.yt
                      ? <img src={`https://img.youtube.com/vi/${s.yt}/hqdefault.jpg`} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt={s.title}/>
                      : <RepsolDetailCover pill={s.pill} category={s.category} title=""/>
                    }
                  </div>
                  <div className="meta">
                    <div className="t">{s.title}</div>
                    <div className="s">{s.teacher} · {s.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

// ---------- Player ----------
function Player({ back, item }) {
  const [playing, setPlaying] = useS2(true);
  const it = item || PILLS.find(p => p.yt) || PILLS[0];
  const hasVideo = !!it.yt;

  const chapters = [
    { n: 1, t: 'Introducción y contexto en Repsol', d: '0:00 · 0:52', tone: 'teal' },
    { n: 2, t: 'Interfaz y accesos en Sprinklr', d: '0:52 · 1:10', tone: 'plum' },
    { n: 3, t: 'Flujo de trabajo paso a paso', d: '2:02 · 1:18', tone: 'clay', active: true },
    { n: 4, t: 'Casos reales del equipo Repsol', d: '3:20 · 0:45', tone: 'olive' },
    { n: 5, t: 'Errores comunes y cómo evitarlos', d: '4:05 · 0:55', tone: 'warm' },
  ];

  return (
    <div className="player-root">
      <div className="player-stage">
        {hasVideo ? (
          <>
            <iframe
              key={it.yt}
              src={`https://www.youtube.com/embed/${it.yt}?autoplay=1&rel=0&modestbranding=1&color=white`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', zIndex:1}}
            />
            <div className="player-overlay-top" style={{zIndex:2, pointerEvents:'none'}}>
              <button onClick={back} style={{pointerEvents:'all'}} className="back">
                <Icon name="back" size={12}/> Volver al módulo
              </button>
              <div style={{display:'flex', gap:8, pointerEvents:'all'}}>
                <button className="back" style={{background:'rgba(108,95,252,0.15)', border:'1px solid rgba(108,95,252,0.4)', color:'var(--accent-glow)'}}>
                  ✦ MENTOR-IA activo
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{position:'absolute',inset:0, background:`linear-gradient(135deg, var(--bn-blue) 0%, #001f3d 100%)`}}/>
            <div style={{position:'absolute',inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, zIndex:1}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:4}}>Think Pill {it.pill ?? ''} · {it.category}</div>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:700, fontSize:'clamp(22px,3vw,36px)', color:'#fff', textAlign:'center', maxWidth:480, lineHeight:1.2, padding:'0 32px'}}>{it.title}</div>
              <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4}}>{it.teacher} · {it.duration}</div>
            </div>
            <div className="player-overlay-top">
              <button className="back" onClick={back}><Icon name="back" size={12}/> Volver al módulo</button>
              <div style={{display:'flex', gap:8}}>
                <button className="back"><Icon name="caption" size={12}/> SUB</button>
                <button className="back">MENTOR-IA activo</button>
              </div>
            </div>
            <div className="player-overlay-bottom">
              <div className="title-row">
                <div>
                  <div className="t-eyebrow">{it.category} · {it.duration}</div>
                  <div className="title">{it.title}</div>
                  <div className="sub">{(it.teacher || 'BeonIt').toUpperCase()} · {it.duration}</div>
                </div>
              </div>
              <div className="scrubber"><i style={{width:'56%'}}/><b/></div>
              <div className="player-controls">
                <button><Icon name="skip" size={18}/></button>
                <button className="play" onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play'} size={20}/></button>
                <button><Icon name="next" size={18}/></button>
                <button className="pill-btn">1.0×</button>
                <button className="pill-btn active">Pregunta IA</button>
                <button><Icon name="vol" size={18}/></button>
                <span className="time">02:18 / {it.duration || '05:00'}</span>
              </div>
            </div>
          </>
        )}
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
          <div key={c.id} className="pchap" onClick={() => { window.__playerItem = c; back(); setTimeout(() => window.dispatchEvent(new CustomEvent('__openPlayer', {detail: c})), 50); }}>
            <div className="thumb"><div className={`ph ${c.tone}`}/></div>
            <div>
              <div className="n">CON VÍDEO</div>
              <div className="t">{c.title}</div>
              <div className="d">{c.teacher} · {c.duration}</div>
            </div>
          </div>
        ))}
        {!hasVideo && chapters.map(c => (
          <div key={c.n} className={`pchap ${c.active ? 'active' : ''}`} onClick={() => setPlaying(true)}>
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

  const contextLabel = {
    home: 'Vista general · tu progreso',
    player: 'Viendo módulo · Programar posts',
    detail: 'Detalle de módulo',
    path: 'Tu ruta de certificación',
    dashboard: 'Analytics · visión admin',
    coach: 'MENTOR-IA · modo completo',
  }[view] || 'Plataforma Sprinklr';

  const QUICK = [
    { label: '¿Qué módulo sigue?', q: '¿Cuál es el siguiente módulo que debería hacer?' },
    { label: 'Hazme un quiz', q: 'Hazme 3 preguntas de repaso sobre lo que he visto.' },
    { label: 'Flujo de aprobación', q: '¿Cómo funciona el flujo de aprobación urgente en Social Publish?' },
    { label: 'Ayuda con macros', q: '¿Qué es una macro en Sprinklr y cómo se usa?' },
  ];

  const SIDE_DEMOS = {
    'macro': 'En Sprinklr, una macro es una acción predefinida (texto, etiqueta, reasignación) que se aplica con un clic. Para Repsol Care las más usadas son: acuse de recibo, escalado a Salesforce y cierre de caso. Think Pill 41 tiene el vídeo explicativo.',
    'aprobaci': 'Para aprobaciones urgentes: abre el post → "Aprobación de emergencia" → notifica al Content Lead por Slack. El flujo estándar requiere revisión previa del Content Lead. Think Pill 20 lo detalla con ejemplos Repsol.',
    'quiz': '1. ¿Cuántos días tienes para responder un caso en Twitter/X según el SLA de Repsol?\n2. ¿Qué módulo de Sprinklr usas para programar posts?\n3. ¿Para qué sirve el DAM en Social Publish?\nResponde y te doy feedback.',
    'siguiente': 'Tu siguiente módulo es Think Pill 5 · "Qué activos se gestionan a través de Sprinklr". Duración: 4 min. Tema: Activos DAM. ¿Lo abrimos ahora?',
    'default': 'Entendido. Puedo ayudarte con Social Publish, Care, Analytics, aprobaciones y tu certificación Sprinklr × Repsol. ¿Qué necesitas?',
  };

  const sendMsg = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading) return;
    setDynMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await callMentorAPI([{ role: 'user', text: q }]);
      setDynMsgs(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      await new Promise(r => setTimeout(r, 600));
      const key = Object.keys(SIDE_DEMOS).find(k => q.toLowerCase().includes(k)) || 'default';
      setDynMsgs(m => [...m, { role: 'assistant', text: SIDE_DEMOS[key] }]);
    }
    setLoading(false);
  };

  return (
    <aside className="ai">
      <div className="ai-head">
        <div className="ai-head-left">
          <span className="orb"/>
          <div>
            <div className="title">MENTOR-IA <span className="beta-badge">BETA</span></div>
            <div className="sub">{contextLabel}</div>
          </div>
        </div>
        <button className="collapse" onClick={() => setAIMode(aiMode === 'hero' ? 'companion' : 'hero')}>
          {aiMode === 'hero' ? '— Reducir' : '↔ Ampliar'}
        </button>
        <button className="collapse" onClick={() => setAIMode('collapsed')}>× Ocultar</button>
      </div>
      <div className="ai-body">
        {view === 'player' && (
          <div className="ai-context-card">
            <div className="thumb"><div className="ph teal"/></div>
            <div className="meta">
              <span className="eyebrow">Viendo ahora</span>
              <div className="t">Programar posts · Lección 3 de 5</div>
            </div>
          </div>
        )}
        <div className="ai-msg from-ai">
          <span className="who">MENTOR-IA</span>
          <div className="bubble">
            ¡Hola Amaia! Llevas un <span className="hl">58% de tu certificación</span>. El siguiente módulo es <em>Programar posts</em>. ¿Seguimos?
          </div>
        </div>
        <div className="ai-chip-row">
          {QUICK.map((q, i) => (
            <button key={i} className="ai-chip" onClick={() => sendMsg(q.q)}>{q.label}</button>
          ))}
        </div>
        {dynMsgs.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
            <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
            <div className="bubble" style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg from-ai">
            <span className="who">MENTOR-IA</span>
            <div className="bubble mentor-typing"><span/><span/><span/></div>
          </div>
        )}
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Pregunta sobre Sprinklr o tu formación…"
          />
          <button className="send" onClick={sendMsg}><Icon name="send" size={14}/></button>
        </div>
        <div className="ai-footer-row">
          <span className="hint">Contexto: módulo actual · ruta · progreso</span>
          <span className="hint">↵ enviar</span>
        </div>
      </div>
    </aside>
  );
}

// ---------- Coach / AI Agent fullscreen ----------

const USER_PROFILE = {
  name: 'Amaia Ruiz',
  role: 'Publish Agent',
  progress: 15,
  currentPill: 4,
};

async function callMentorAPI(messages) {
  const url = window.MENTOR_IA_API_URL || '/api/chat';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content || '',
      })),
      userProfile: USER_PROFILE,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.status);
    console.error('[MENTOR-IA] error:', res.status, err);
    throw new Error(`${res.status}`);
  }
  const data = await res.json();
  return data.content || '';
}

function Coach() {
  const [input, setInput] = useS2('');
  const [loading, setLoading] = useS2(false);
  const [apiStatus, setApiStatus] = useS2('live');
  const [msgs, setMsgs] = useS2([
    { role: 'assistant', text: '¡Hola Amaia! Soy MENTOR-IA, tu asistente de formación Sprinklr. Llevas un 15% de tu certificación — estás en el Bloque 2, sobre estructura y gobernanza. ¿En qué te puedo ayudar hoy?' },
  ]);

  const DEMOS = {
    'macro': 'Una macro en Sprinklr es una respuesta o acción predefinida que puedes aplicar con un solo clic. Para Repsol Care, las macros más usadas son las de acuse de recibo inicial y las de escalado a Salesforce. La Think Pill 41 "Qué es una macro" tiene el vídeo explicativo disponible en la plataforma.',
    'aprobaci': 'El flujo de aprobación en Repsol Social Publish tiene dos variantes: el flujo estándar (el Content Lead revisa antes de publicar) y el flujo de emergencia para publicaciones urgentes. La Think Pill 20 explica exactamente cómo activar la aprobación de emergencia.',
    'sla': 'Los SLA en Repsol definen el tiempo máximo de respuesta por canal: 30 min en Twitter/X, 2h en Facebook e Instagram, 4h en LinkedIn. La barra de SLA en cada caso cambia de verde a rojo conforme se acerca el límite. Think Pill 37.',
    'salesforce': 'La transferencia a Salesforce se usa cuando hay una reclamación formal. El flujo es: abrir el caso en Care → "Transferir a Salesforce" → seleccionar tipo de caso → confirmar datos. Las Think Pills 35 y 36 explican el proceso completo.',
    'calendar': 'El calendario editorial en Sprinklr Social Publish te permite visualizar todos los contenidos planificados por canal y campaña. La Think Pill 23 explica cómo configurar tu vista personalizada.',
    'certif': 'Tu progreso actual es del 15% — estás en el Bloque 2. Los siguientes hitos: completar los módulos de Estructura (6 pills) y hacer el mini-test de Gobernanza.',
    'default': 'En el contexto de Sprinklr para Repsol, puedo ayudarte con Social Publish, Care, Analytics, flujos de aprobación y certificación. ¿Puedes darme más detalles sobre lo que necesitas?',
  };

  const send = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading) return;
    const newMsgs = [...msgs, { role: 'user', text: q }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const reply = await callMentorAPI(newMsgs);
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
      setApiStatus('live');
    } catch (err) {
      console.warn('[MENTOR-IA] modo demo:', err.message);
      setApiStatus('demo');
      await new Promise(r => setTimeout(r, 800));
      const demoKey = Object.keys(DEMOS).find(k => q.toLowerCase().includes(k)) || 'default';
      setMsgs(m => [...m, { role: 'assistant', text: DEMOS[demoKey] }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { label: '¿Qué módulo sigue?', q: '¿Cuál es el siguiente módulo que debería hacer?' },
    { label: 'Explícame las macros', q: '¿Qué es una macro en Sprinklr y cómo se usa en Repsol?' },
    { label: 'Flujo de aprobación', q: '¿Cómo funciona el flujo de aprobación en Social Publish?' },
    { label: 'SLA en Care', q: '¿Qué SLA maneja Repsol en Sprinklr Care?' },
    { label: 'Escalar a Salesforce', q: '¿Cuándo y cómo transfiero un caso de Sprinklr a Salesforce?' },
    { label: 'Quiz rápido', q: 'Hazme 3 preguntas de repaso sobre lo que he visto hasta ahora.' },
  ];

  return (
    <div className="coach-root">
      <aside className="coach-side">
        <div>
          <h3>Conversaciones de hoy</h3>
          <div className="coach-hist-item active"><div className="t">Progreso en la certificación</div><div className="d">Hace 2 min</div></div>
          <div className="coach-hist-item"><div className="t">¿Cómo programar posts recurrentes?</div><div className="d">09:15</div></div>
        </div>
        <div>
          <h3>Esta semana</h3>
          <div className="coach-hist-item"><div className="t">Diferencia entre DAM y biblioteca</div><div className="d">Lun</div></div>
          <div className="coach-hist-item"><div className="t">Flujo de aprobación urgente</div><div className="d">Dom</div></div>
          <div className="coach-hist-item"><div className="t">Quiz sobre Publish Agent</div><div className="d">Sáb</div></div>
        </div>
        <div>
          <h3 style={{fontSize:11, marginBottom:8}}>Motores IA</h3>
          {[
            { icon:'👥', label:'Cultura Repsol', sub:'Knowledge Points · Expectativas · Objetivos' },
            { icon:'📊', label:'Perfil competencial', sub:'Test competenciales · Evolución' },
            { icon:'📄', label:'Base conocimiento Repsol', sub:'Módulos Sprinklr · Procedimientos' },
          ].map((m,i) => (
            <div key={i} style={{display:'flex', gap:8, padding:'8px 12px', borderRadius:8, background:'var(--paper-2)', marginBottom:4}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <div>
                <div style={{fontSize:11, fontWeight:600, color:'var(--beonit-lime)'}}>{m.label}</div>
                <div style={{fontSize:10, color:'var(--ink-4)', fontFamily:'var(--mono)'}}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:'auto', padding:'16px 12px', borderTop:'1px solid var(--line)', fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', lineHeight:1.6}}>
          Powered by Claude · Anthropic<br/>
          Contexto: formación Sprinklr · Repsol
        </div>
      </aside>
      <div className="coach-main" style={{background:'#0d1117', borderRadius:0, display:'flex', flexDirection:'column'}}>
        {/* AI header */}
        <div style={{padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:14, background:'rgba(0,0,0,0.3)'}}>
          {/* Animated orb */}
          <div style={{position:'relative', width:44, height:44, flexShrink:0}}>
            <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, #0af, #005996 60%, #001a30)', boxShadow:'0 0 20px rgba(0,150,255,0.4)', animation:'none'}}/>
            <div style={{position:'absolute', inset:3, borderRadius:'50%', background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(150,220,255,0.9)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/>
              </svg>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--sans)', fontWeight:800, fontSize:16, letterSpacing:'-0.02em', color:'#fff', lineHeight:1.1}}>
              MENTOR-IA
              <span style={{marginLeft:8, fontFamily:'var(--mono)', fontWeight:400, fontSize:9, background:'#BCD630', color:'#0d1117', padding:'2px 7px', borderRadius:4, letterSpacing:'0.1em', textTransform:'uppercase', verticalAlign:'middle'}}>BETA</span>
            </div>
            <div style={{fontFamily:'var(--mono)', fontSize:9, color:'rgba(150,200,255,0.55)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2}}>IA contextualizada · Sprinklr × Repsol</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:5, fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color: apiStatus==='live' ? '#BCD630' : 'rgba(255,255,255,0.3)'}}>
            <span style={{width:5, height:5, borderRadius:'50%', background: apiStatus==='live' ? '#BCD630' : 'rgba(255,255,255,0.25)', display:'inline-block', boxShadow: apiStatus==='live' ? '0 0 6px #BCD630' : 'none'}}/>
            {apiStatus === 'live' ? 'En línea' : 'Demo'}
          </div>
        </div>

        {/* Context cards */}
        <div style={{display:'flex', gap:8, padding:'12px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)', overflowX:'auto'}}>
          {[
            {icon:'📊', label:'15% progreso', sub:'Bloque 2 activo'},
            {icon:'📚', label:'Módulo siguiente', sub:'Programar posts'},
            {icon:'🏆', label:'Certificación', sub:'Publish Agent'},
          ].map((c,i) => (
            <div key={i} style={{flexShrink:0, padding:'8px 12px', background:'rgba(255,255,255,0.05)', borderRadius:8, border:'1px solid rgba(255,255,255,0.08)', minWidth:110}}>
              <div style={{fontSize:14, marginBottom:2}}>{c.icon}</div>
              <div style={{fontSize:11, fontWeight:700, color:'rgba(200,230,255,0.9)', lineHeight:1.2}}>{c.label}</div>
              <div style={{fontFamily:'var(--mono)', fontSize:9, color:'rgba(150,180,255,0.5)', letterSpacing:'0.06em'}}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div style={{display:'flex', gap:6, flexWrap:'wrap', padding:'10px 24px 0'}}>
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => send(a.q)} style={{
              padding:'6px 12px', background:'rgba(0,89,150,0.3)', border:'1px solid rgba(0,150,255,0.25)',
              borderRadius:20, cursor:'pointer', fontFamily:'var(--sans)', fontSize:11, fontWeight:600,
              color:'rgba(180,220,255,0.85)', transition:'all .12s', whiteSpace:'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,89,150,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(0,89,150,0.3)'; }}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, padding:'16px 24px'}}>
          {msgs.map((m, i) => (
            <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start', flexDirection: m.role==='assistant' ? 'row' : 'row-reverse'}}>
              {/* Avatar */}
              <div style={{
                width:28, height:28, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: m.role==='assistant' ? 'radial-gradient(circle at 35% 35%, #0af, #005996)' : 'rgba(255,255,255,0.15)',
                boxShadow: m.role==='assistant' ? '0 0 10px rgba(0,150,255,0.3)' : 'none',
                fontSize:11, fontWeight:800, color:'#fff',
              }}>
                {m.role==='assistant' ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,230,255,0.9)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></svg> : 'A'}
              </div>
              <div style={{
                maxWidth:'72%', padding:'10px 14px', borderRadius: m.role==='assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                background: m.role==='assistant' ? 'rgba(0,89,150,0.25)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${m.role==='assistant' ? 'rgba(0,150,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
                color: 'rgba(220,235,255,0.9)', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap',
              }}>
                {m.role==='assistant' && <div style={{fontFamily:'var(--mono)', fontSize:9, color:'rgba(0,180,255,0.6)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4}}>MENTOR-IA</div>}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
              <div style={{width:28, height:28, borderRadius:'50%', flexShrink:0, background:'radial-gradient(circle at 35% 35%, #0af, #005996)', boxShadow:'0 0 10px rgba(0,150,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,230,255,0.9)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></svg>
              </div>
              <div style={{padding:'12px 16px', borderRadius:'4px 14px 14px 14px', background:'rgba(0,89,150,0.25)', border:'1px solid rgba(0,150,255,0.2)', display:'flex', gap:6, alignItems:'center'}}>
                <span className="mentor-dot" style={{width:7, height:7, borderRadius:'50%', background:'rgba(0,150,255,0.7)', display:'inline-block'}}/>
                <span className="mentor-dot" style={{width:7, height:7, borderRadius:'50%', background:'rgba(0,150,255,0.7)', display:'inline-block'}}/>
                <span className="mentor-dot" style={{width:7, height:7, borderRadius:'50%', background:'rgba(0,150,255,0.7)', display:'inline-block'}}/>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{padding:'12px 20px 20px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex', gap:8, alignItems:'flex-end', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'8px 8px 8px 16px', transition:'border-color .15s'}}
            onFocus={e => e.currentTarget.style.borderColor='rgba(0,150,255,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Pregúntame sobre Sprinklr, tu certificación o cualquier módulo… (↵ enviar)"
              disabled={loading}
              rows={1}
              style={{flex:1, background:'transparent', border:'none', outline:'none', resize:'none', fontFamily:'var(--sans)', fontSize:13, color:'rgba(220,235,255,0.85)', lineHeight:1.5, maxHeight:100, overflow:'auto'}}
            />
            <button onClick={send} disabled={loading} style={{
              width:36, height:36, borderRadius:10, border:'none', cursor: loading ? 'default' : 'pointer',
              background: loading ? 'rgba(0,89,150,0.3)' : 'var(--accent-glow)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0,89,150,0.4)',
            }}>
              {loading
                ? <div style={{width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'rgba(255,255,255,0.8)', animation:'spin .7s linear infinite'}}/>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M2 21l21-9L2 3l4.5 9L2 21z"/></svg>
              }
            </button>
          </div>
          <div style={{marginTop:6, fontFamily:'var(--mono)', fontSize:9, color:'rgba(150,180,255,0.35)', letterSpacing:'0.08em', textAlign:'center', textTransform:'uppercase'}}>
            Powered by Claude · Anthropic · Contexto: Sprinklr × Repsol
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Onboarding ----------
function Onboarding({ done = () => {} }) {
  const [step, setStep] = useS2(0);
  const [selectedAreas, setSelectedAreas] = useS2(new Set(['Publicación', 'Aprobaciones']));
  const [role, setRole] = useS2('publish');
  const [notifs, setNotifs] = useS2([true, true, false, false]);
  const [showMentorInfo, setShowMentorInfo] = useS2(false);

  // Persistir progreso paso a paso para que el anillo del shell se vaya llenando
  useE2(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('solid-onboarding') || '{}');
      if (!existing.completedAt) {
        localStorage.setItem('solid-onboarding', JSON.stringify({ ...existing, step, totalSteps: 4 }));
        window.dispatchEvent(new CustomEvent('onboarding-progress', { detail: { step, totalSteps: 4 }}));
      }
    } catch(e) {}
  }, [step]);

  const persistOnboarding = () => {
    localStorage.setItem('solid-onboarding', JSON.stringify({
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
    if (window.Toast) window.Toast.success('Onboarding completado · Bienvenido a SGS|on', { icon: '🎉' });
    done();
  };

  const areas = ['Social Publish', 'Aprobaciones', 'Calendario editorial', 'Analytics y Reporting', 'Activos DAM', 'Compliance', 'Care y Atención al cliente', 'Integraciones Salesforce', 'Gobernanza y roles', 'Sprinklr Fundamentals'];
  const toggleArea = (t) => { const n = new Set(selectedAreas); n.has(t) ? n.delete(t) : n.add(t); setSelectedAreas(n); };
  const toggleNotif = (i) => setNotifs(ns => ns.map((v, idx) => idx === i ? !v : v));

  const roles = [
    { id: 'publish',   label: 'Publish Agent',   desc: 'Publico y apruebo contenido en Sprinklr' },
    { id: 'content',   label: 'Content Lead',     desc: 'Lidero la estrategia de contenidos' },
    { id: 'analytics', label: 'Analytics Lead',   desc: 'Analizo rendimiento de campañas' },
    { id: 'it',        label: 'IT / Integraciones', desc: 'Gestiono la integración con sistemas Repsol' },
    { id: 'direccion', label: 'Dirección',         desc: 'Necesito visión global de la plataforma' },
  ];

  const notifOptions = [
    { t: 'Recordatorio diario en WhatsApp, 9:00', d: 'Un módulo cada mañana. Sin ruido extra.' },
    { t: 'Acceso libre desde la app', d: 'Entro cuando tengo tiempo, sin notificaciones.' },
    { t: 'Resumen semanal por email (viernes)', d: 'Qué aprendiste, qué viene la próxima semana.' },
    { t: 'Alertas antes de reuniones Sprinklr', d: 'El agente te manda un módulo relevante 30 min antes.' },
  ];

  const steps = [
    {
      eyebrow: '01 · De 04',
      title: <>¿En qué área de Sprinklr<br/>quieres <em>certificarte</em>?</>,
      lead: 'Selecciona las áreas prioritarias. Tu ruta de formación se construirá en torno a ellas — puedes cambiarlas después.',
      body: (
        <div className="onb-chips">
          {areas.map(t => (
            <button key={t} className={`onb-chip ${selectedAreas.has(t) ? 'sel' : ''}`} onClick={() => toggleArea(t)}>
              <span className="mark"/>{t}
            </button>
          ))}
        </div>
      )
    },
    {
      eyebrow: '02 · De 04',
      title: <>¿Cuál es tu <em>rol</em><br/>en Repsol?</>,
      lead: 'Personalizamos el orden de los módulos y los casos prácticos según tu función en el equipo de comunicación.',
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
      eyebrow: '03 · De 04',
      title: <>¿Cómo quieres <em>aprender</em>?</>,
      lead: 'Elige cómo quieres recibir tu formación. Puedes activar o desactivar cada canal en cualquier momento desde tu perfil.',
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
      eyebrow: '04 · De 04',
      title: <>Tu agente IA <em>te espera</em>.</>,
      lead: 'Conoce los flujos de Repsol, tu progreso y las guías de Sprinklr. Pregúntale cualquier cosa — en cualquier momento.',
      body: (
        <div style={{border:'1px solid var(--line)', borderRadius:16, padding:24, maxWidth:560, background:'var(--paper-2)'}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
            <div style={{width:40, height:40, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #FCCB00, var(--accent-glow) 60%, #b06800)', boxShadow:'0 0 18px rgba(243,165,36,0.4)', flexShrink:0}}/>
            <div>
              <div style={{fontWeight:600, fontSize:14}}>MENTOR-IA <span className="beta-badge">BETA</span></div>
              <div style={{fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>IA contextualizada · Maximiza el aprendizaje</div>
            </div>
          </div>
          <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, lineHeight:1.4, marginBottom:16, color:'var(--ink)'}}>
            "Hola. Basándome en tu rol de <em>Publish Agent</em> y las áreas que has elegido, te preparo una ruta de <span style={{background:'linear-gradient(180deg,transparent 62%,var(--accent-glow) 62%)', padding:'0 2px'}}>4 semanas y 10 módulos</span>. ¿Empezamos?"
          </div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn glow" onClick={persistOnboarding}>Sí — entrar en SGS|on →</button>
            <button className="btn ghost" onClick={() => setShowMentorInfo(s => !s)}>{showMentorInfo ? 'Ocultar' : 'Cuéntame más'}</button>
          </div>
          {showMentorInfo && (
            <div style={{marginTop:16, padding:'14px 16px', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10, fontSize:13, lineHeight:1.55, color:'var(--ink-2)'}}>
              <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:6}}>Qué hace MENTOR-IA</div>
              <ul style={{margin:0, paddingLeft:18}}>
                <li>Resuelve dudas sobre Sprinklr en el contexto Repsol con respuestas accionables</li>
                <li>Te recomienda el próximo módulo basándose en tu progreso y rol</li>
                <li>Genera quizzes personalizados para repasar lo aprendido</li>
                <li>Conoce las 41 Think Pills del currículum y sabe cuál cubre cada tema</li>
                <li>Funciona desde la barra lateral, en pantalla completa o por WhatsApp</li>
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
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginLeft:4}}>× Repsol</span>
        </div>
        <div style={{position:'relative'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:16}}>Certificación Sprinklr</div>
          <h2 style={{fontSize:'clamp(40px,5vw,62px)', fontWeight:700, fontStyle:'normal', lineHeight:1.05}}>Domina<br/>Sprinklr<br/>como<br/><em style={{fontStyle:'italic', color:'var(--bn-lime)'}}>experto</em>.</h2>
          <div style={{marginTop:24, display:'flex', flexWrap:'wrap', gap:8}}>
            {['41 Think Pills', '3 Talleres', 'MENTOR-IA', 'Certificado Repsol'].map(t => (
              <span key={t} style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 10px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:999, color:'rgba(255,255,255,0.7)'}}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'var(--bn-lime)'}}/>
            <span style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Certificación oficial · 2026</span>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase'}}>SGS|on · BeonIt × Repsol</div>
        </div>
      </div>
      <div className="onb-right">
        <div className="step-meta">{s.eyebrow}</div>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
        {s.body}
        <div className="onb-nav">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step-1)}>← Atrás</button>}
          <button className="btn" style={{background:'var(--ink)'}} onClick={() => step < 3 ? setStep(step+1) : persistOnboarding()}>
            {step < 3 ? 'Continuar →' : 'Entrar en SGS|on →'}
          </button>
          <div style={{marginLeft:'auto'}} className="onb-progress">
            {[0,1,2,3].map(i => <span key={i} className={i <= step ? 'on' : ''}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Path ----------
function PathView({ openPlayer, setView }) {
  const goToNext = () => {
    const PILLS = window.PILLS || [];
    let completed = [];
    try { completed = JSON.parse(localStorage.getItem('solid-completed') || '["p0","p1","p2"]'); } catch(e) {}
    const next = PILLS.find(p => !completed.includes(p.id));
    if (next && openPlayer) openPlayer(next);
    else if (setView) setView('browse');
  };
  const nodes = [
    {
      type: 'autodiag', s: 'done',
      t: 'Autodiagnóstico Inicial',
      d: 'Evaluación de partida: conocimientos previos en Sprinklr, perfil competencial y expectativas de la formación.',
      pills: 'Test competencial · ~20 min',
      dur: '20 min',
      tag: 'Know it',
    },
    {
      type: 'bloque', n: '1+2', s: 'done',
      t: 'Bloque 1+2 · Sprinklr en Repsol · Fundamentos',
      d: 'Importancia del programa, registro SSO, Sprinklr como plataforma unificada, canales, posibilidades operativas y activos gestionados.',
      pills: 'Think Pills 0–5 · 6 módulos',
      dur: '22 min',
      tag: 'Think it',
    },
    {
      type: 'bloque', n: '2', s: 'current',
      t: 'Bloque 2 · Estructura, roles y modelo de gobernanza',
      d: 'Módulos y submódulos de Sprinklr, impacto por negocio, comunicación entre módulos, roles (Manager / Agent / Reporting) y estructura de equipos.',
      pills: 'Think Pills 6–10 · 5 módulos',
      dur: '18 min',
      tag: 'Think it',
    },
    {
      type: 'taller',
      t: 'Taller 1 · Sprinklr Fundamentals',
      d: 'Sesión experiencial de 2 horas. Puesta en común, resolución de dudas y consolidación del aprendizaje de los fundamentos de Sprinklr en el contexto Repsol.',
      pills: '2 h · 15–20 asistentes · Presencial / Virtual',
      dur: '2 h',
      tag: 'Explore it',
    },
    {
      type: 'bloque', n: '3',
      t: 'Bloque 3 · Gestión estructural de campañas en Social Publish',
      d: 'Calendario editorial, DAM y reutilización de recursos, campañas y subcampañas, gobernanza operativa y etiquetado de campañas.',
      pills: 'Think Pills 11–16 · 6 módulos',
      dur: '22 min',
      tag: 'Think it',
    },
    {
      type: 'bloque', n: '4',
      t: 'Bloque 4 · Operativa editorial y control de contenidos',
      d: 'Publicación multicanal, adaptación por red social, gestión multicanal optimizada, flujos de aprobación, revisión y validación, mecanismos de control y reducción de riesgos.',
      pills: 'Think Pills 17–22 · 6 módulos',
      dur: '25 min',
      tag: 'Think it',
    },
    {
      type: 'bloque', n: '5',
      t: 'Bloque 5 · Calendario editorial',
      d: 'Visualización y planificación del contenido a través del calendario. Filtrado y organización de campañas por equipo y territorio.',
      pills: 'Think Pills 23–24 · 2 módulos',
      dur: '7 min',
      tag: 'Think it',
    },
    {
      type: 'bloque', n: '6',
      t: 'Bloque 6 · Reporting de campañas y performance',
      d: 'Visualización del rendimiento de campañas y publicaciones. Métricas clave para evaluar la performance del contenido publicado.',
      pills: 'Think Pills 25–26 · 2 módulos',
      dur: '9 min',
      tag: 'Think it',
    },
    {
      type: 'taller',
      t: 'Taller 2 · Rol Publish Agent y Transversal',
      d: 'Sesión práctica con flujos reales de publicación en Sprinklr. Resolución de casos del día a día, aprobaciones y gestión multicanal en el entorno Repsol.',
      pills: '2 h · 15–20 asistentes · Presencial / Virtual',
      dur: '2 h',
      tag: 'Explore it',
    },
    {
      type: 'bloque', n: '7',
      t: 'Bloque 7 · Operativa Community Manager · Care',
      d: 'Diferencia entre mensaje y caso, agrupación en casos, gestión de conversaciones entrantes, Care Console, Engagement Dashboard, etiquetado, tipos de mensajes, líneas de negocio, escalado a Salesforce.',
      pills: 'Think Pills 27–36 · 10 módulos',
      dur: '40 min',
      tag: 'Think it',
    },
    {
      type: 'bloque', n: '8',
      t: 'Bloque 8 · SLA y paneles de atención al cliente',
      d: 'Qué son los SLA y su impacto. Indicadores de SLA para priorizar mensajes. Visualización e interpretación de paneles de Care para priorizar la operativa.',
      pills: 'Think Pills 37–40 · 4 módulos',
      dur: '16 min',
      tag: 'Think it',
    },
    {
      type: 'taller',
      t: 'Taller 3 · Rol Care Agent y Transversal',
      d: 'Sesión práctica con gestión de conversaciones en Care. Casos reales de atención al cliente, SLA, escalado a Salesforce y operativa de Community Manager.',
      pills: '2 h · 15–20 asistentes · Presencial / Virtual',
      dur: '2 h',
      tag: 'Explore it',
    },
    {
      type: 'autodiag',
      t: 'Autodiagnóstico Final · Certificación',
      d: 'Evaluación de cierre: evolución del conocimiento, impacto de la formación y transferencia al puesto. Necesitas un 80% para obtener la certificación oficial Repsol × BeonIt.',
      pills: 'Test final competencial · ~30 min',
      dur: '30 min',
      tag: 'Own it',
    },
  ];
  return (
    <div className="path-root">
      <section className="path-hero">
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot"/>SOLID GROWTH · Ruta certificada</div>
          <h1>Rol Publish Agent<br/><em>Certificación Repsol</em>.</h1>
          <p>41 Think Pills organizadas en 8 bloques formativos + 3 Talleres experienciales. Diseñada para el equipo de comunicación de Repsol. Certificación oficial avalada por Repsol × BeonIt.</p>
          <div className="path-stats">
            <div className="path-stat"><div className="n">41</div><div className="l">Think Pills</div></div>
            <div className="path-stat"><div className="n">8</div><div className="l">Bloques</div></div>
            <div className="path-stat"><div className="n">3</div><div className="l">Talleres</div></div>
            <div className="path-stat"><div className="n">15%</div><div className="l">Tu progreso</div></div>
          </div>
          <div style={{display:'flex', gap:10, marginTop:20, flexWrap:'wrap'}}>
            <button className="btn glow" onClick={goToNext}><Icon name="play" size={14}/> Continuar formación →</button>
            {setView && <button className="btn ghost" onClick={() => setView('coach')}><Icon name="sparkle" size={14}/> Preguntar a MENTOR-IA</button>}
          </div>
        </div>
        <div className="path-visual">
          <div className="ph teal" style={{position:'absolute',inset:0}}/>
          <div className="path-visual-badge">En curso · Bloque 2/8</div>
        </div>
      </section>

      {/* SOLID GROWTH 5-phase strip */}
      <div className="sg-strip">
        {[
          { phase:'Autodiagnóstico', sub:'Know it',    icon:'◎', color:'var(--beonit-orange)', active:true, done:true },
          { phase:'Think Pills',      sub:'Think it',   icon:'💊', color:'var(--beonit-blue)', active:true },
          { phase:'Taller',           sub:'Explore it', icon:'👥', color:'var(--beonit-purple)' },
          { phase:'MENTOR-IA',        sub:'Do it',      icon:'✦', color:'var(--beonit-lime)' },
          { phase:'Certificación',    sub:'Own it',     icon:'🏆', color:'var(--repsol-red)' },
        ].map((p, i, arr) => (
          <React.Fragment key={i}>
            <div className={`sg-phase ${p.active ? 'active' : ''} ${p.done ? 'done' : ''}`} style={{'--sg-color': p.color}}>
              <div className="sg-icon">{p.icon}</div>
              <div className="sg-phase-name">{p.phase}</div>
              <div className="sg-phase-sub">{p.sub}</div>
            </div>
            {i < arr.length - 1 && <div className="sg-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="path-map">
        {nodes.map((b, i) => (
          <div key={i} className={`path-node ${b.s || ''} path-node-${b.type}`} data-n={b.n}>
            <div>
              {b.tag && <span className="path-tag">{b.tag}</span>}
              <h3>{b.t}</h3>
              <p className="d">{b.d}</p>
              <div className="meta-row">
                <span>{b.pills}</span>
                <span>·</span>
                <span>{b.dur}</span>
                {b.s === 'current' && <span style={{color:'var(--ink)', fontWeight:600}}>· ▶ CONTINUAR</span>}
                {b.s === 'done' && <span style={{color:'var(--beonit-lime)', fontWeight:600}}>· ✓ COMPLETADO</span>}
              </div>
            </div>
            <button className="goto" onClick={goToNext}>
              {b.type === 'taller' ? 'Ver taller' : b.type === 'autodiag' ? (b.s === 'done' ? 'Ver resultado' : 'Iniciar test') : b.s === 'done' ? 'Revisar' : b.s === 'current' ? 'Continuar →' : 'Ver bloque'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Profile ----------
function Profile({ setView }) {
  const [profile, setProfileState] = useS2(window.UserProfile ? window.UserProfile.get() : { name:'Amaia Ruiz', role:'Publish Agent', team:'Repsol', avatarColor:'var(--repsol-red)', email:'amaia.ruiz@repsol.com' });
  const [editing, setEditing] = useS2(false);
  const [showCert, setShowCert] = useS2(false);
  const [draft, setDraft] = useS2(profile);

  React.useEffect(() => {
    const h = () => setProfileState(window.UserProfile.get());
    window.addEventListener('user-profile-changed', h);
    return () => window.removeEventListener('user-profile-changed', h);
  }, []);

  const cells = Array.from({length: 98}, (_, i) => {
    const r = Math.sin(i * 2.3) + Math.cos(i * 0.7);
    return r > 0.8 ? 'l3' : r > 0.2 ? 'l2' : r > -0.4 ? 'l1' : '';
  });

  const initials = profile.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
  const firstName = profile.name.split(/\s+/)[0] || profile.name;
  const surnames = profile.name.split(/\s+/).slice(1).join(' ');
  const avatarSwatches = ['var(--repsol-red)', 'var(--bn-blue)', 'var(--bn-lime)', 'var(--bn-orange)', 'var(--bn-purple)', 'var(--ink)'];

  const openEdit = () => { setDraft(profile); setEditing(true); };
  const saveEdit = () => {
    if (window.UserProfile) window.UserProfile.update(draft);
    setProfileState(draft);
    setEditing(false);
    if (window.Toast) window.Toast.success('Perfil actualizado', { icon: '✓' });
  };

  const downloadCert = () => {
    const today = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificado · ${profile.name}</title>
<style>
@page { size: A4 landscape; margin: 0; }
body { font-family: 'Manrope', system-ui, sans-serif; margin:0; padding:60px; min-height:100vh; box-sizing:border-box;
  background: linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%); display:flex; flex-direction:column; }
.frame { border:6px double #005996; padding:50px 60px; flex:1; display:flex; flex-direction:column; background:#fff; }
.kicker { font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#94A3B8; margin-bottom:8px; }
h1 { font-size:42px; margin:0 0 32px; color:#0D1117; letter-spacing:-0.02em; }
.lead { font-size:14px; color:#4A5568; max-width:560px; margin:0 0 36px; line-height:1.55; }
.name { font-family:'Manrope', sans-serif; font-style:italic; font-weight:700; font-size:62px; color:#005996; margin:0 0 12px; letter-spacing:-0.025em; }
.role { font-size:18px; color:#0D1117; margin-bottom:36px; }
.cert-line { height:2px; background:linear-gradient(90deg,#005996, #BCD630, #005996); margin: 28px 0; }
.foot { display:flex; justify-content:space-between; align-items:flex-end; margin-top:auto; font-size:12px; color:#4A5568; }
.sig { font-family:'Manrope', sans-serif; font-style:italic; font-size:20px; color:#0D1117; border-top:1px solid #ccc; padding-top:6px; margin-top:24px; }
</style></head><body><div class="frame">
<div class="kicker">SGS|on · BeonIt × Repsol · Certificación oficial</div>
<h1>Certificado de formación</h1>
<div class="lead">Por la presente certificamos que la persona reseñada a continuación ha completado satisfactoriamente la formación oficial Sprinklr del programa SOLID GROWTH dentro del entorno Repsol, superando todos los autodiagnósticos, talleres y módulos requeridos.</div>
<div class="name">${profile.name}</div>
<div class="role">${profile.role} · ${profile.team}</div>
<div class="cert-line"></div>
<div class="foot">
  <div><strong>Fecha de emisión</strong><br/>${today}</div>
  <div><strong>Programa</strong><br/>SOLID GROWTH · Sprinklr Fundamentals</div>
  <div><div class="sig">BeonIt × Repsol</div><div style="font-family:monospace;font-size:10px;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Equipo de formación</div></div>
</div>
</div></body></html>`;
    const blob = new Blob([html], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado-Sprinklr-${profile.name.replace(/\s+/g,'-')}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    setShowCert(false);
    if (window.Toast) window.Toast.success('Certificado descargado', { icon: '↓' });
  };

  const shareProfile = async () => {
    const text = `${profile.name} · ${profile.role} en ${profile.team}\n\nProgreso en certificación Sprinklr SGS|on: 58%`;
    if (navigator.share) {
      try { await navigator.share({ title:`Perfil ${profile.name}`, text }); return; } catch(e) {}
    }
    try {
      await navigator.clipboard.writeText(text);
      if (window.Toast) window.Toast.success('Resumen del perfil copiado al portapapeles', { icon: '📋' });
      else alert('Resumen del perfil copiado al portapapeles.');
    } catch(e) {
      if (window.Toast) window.Toast.error('No se pudo copiar el perfil');
      else alert(text);
    }
  };

  return (
    <div className="profile-root">
      <header className="profile-head" style={{flexWrap:'wrap', gap:16}}>
        <div className="big-av" style={{background:profile.avatarColor}}>{initials}</div>
        <div style={{flex:1, minWidth:200}}>
          <span className="role">{profile.role} · {profile.team}</span>
          <h1>{firstName} {surnames && <em>{surnames}</em>}</h1>
          <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', letterSpacing:'0.06em', marginTop:4}}>{profile.email}</div>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="n">7</div><div className="l">Módulos completados</div></div>
          <div className="profile-stat"><div className="n">58%</div><div className="l">Certificación</div></div>
          <div className="profile-stat"><div className="n">3h</div><div className="l">Tiempo de formación</div></div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', flexBasis:'100%'}}>
          <button className="btn ghost" onClick={openEdit}><Icon name="user" size={13}/> Editar perfil</button>
          <button className="btn ghost" onClick={() => setShowCert(true)}><Icon name="bookmark" size={13}/> Descargar certificado</button>
          <button className="btn ghost" onClick={shareProfile}><Icon name="send" size={13}/> Compartir perfil</button>
          {setView && <button className="btn ghost" onClick={() => setView('coach')}><Icon name="sparkle" size={13}/> Hablar con MENTOR-IA</button>}
        </div>
      </header>

      {editing && (
        <div style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={() => setEditing(false)}>
          <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(480px, 96vw)', padding:24, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
            <h2 style={{margin:'0 0 18px', fontSize:20, fontFamily:'var(--sans)'}}>Editar perfil</h2>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Nombre completo</div>
              <input value={draft.name} onChange={e => setDraft({...draft, name:e.target.value})} style={{width:'100%', padding:'9px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14}}/>
            </label>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Email</div>
              <input value={draft.email} onChange={e => setDraft({...draft, email:e.target.value})} style={{width:'100%', padding:'9px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14}}/>
            </label>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Rol</div>
              <select value={draft.role} onChange={e => setDraft({...draft, role:e.target.value})} style={{width:'100%', padding:'9px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, background:'var(--paper)'}}>
                {['Publish Agent','Content Lead','Analytics Lead','Care Agent','IT / Integraciones','Dirección'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6}}>Color del avatar</div>
              <div style={{display:'flex', gap:8}}>
                {avatarSwatches.map(c => (
                  <button key={c} onClick={() => setDraft({...draft, avatarColor:c})} style={{width:32, height:32, borderRadius:'50%', background:c, border:draft.avatarColor === c ? '3px solid var(--ink)' : '1px solid var(--line)', cursor:'pointer'}}/>
                ))}
              </div>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button className="btn ghost" onClick={() => setEditing(false)}>Cancelar</button>
              <button className="btn glow" onClick={saveEdit}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {showCert && (
        <div style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={() => setShowCert(false)}>
          <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(520px, 96vw)', padding:28, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:6}}>Certificación · 58% completado</div>
            <h2 style={{margin:'0 0 14px', fontSize:22}}>Certificado en preparación</h2>
            <p style={{fontSize:14, lineHeight:1.55, color:'var(--ink-3)', marginBottom:18}}>El certificado oficial se emite tras completar el 100% de la ruta. Puedes descargar ahora una <strong>versión preliminar</strong> con tu progreso actual para tu archivo personal.</p>
            <div style={{padding:14, background:'var(--paper-2)', borderRadius:10, marginBottom:20, fontSize:13, color:'var(--ink-2)'}}>
              <div><strong>{profile.name}</strong> · {profile.role}</div>
              <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', marginTop:4}}>SGS|on · BeonIt × Repsol</div>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button className="btn ghost" onClick={() => setShowCert(false)}>Cerrar</button>
              <button className="btn glow" onClick={downloadCert}>Descargar (HTML / imprimible)</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-grid">
        <section className="profile-section">
          <h2>Actividad últimas 14 semanas</h2>
          <div className="streak-viz">
            {cells.map((l,i) => <div key={i} className={`streak-cell ${l}`}/>)}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:10, fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
            <span>12 ene</span><span>20 abr</span>
          </div>
          <h2 style={{marginTop:36}}>Módulos completados</h2>
          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {[
              {t:'Crear y gestionar campañas en Sprinklr', d:'Hoy · 4 min'},
              {t:'Flujo de aprobación de contenido', d:'Ayer · 3 min'},
              {t:'Aproba un post en 30 segundos (tip)', d:'Lun · :30'},
              {t:'Crear una cola de publicación (tip)', d:'Lun · :45'},
              {t:'Estrategia digital Repsol 2025 (charla)', d:'Dom · 22 min'},
            ].map((x,i) => (
              <div key={i} className="outline-item done" style={{gridTemplateColumns:'32px 1fr auto'}}>
                <span className="n">✓</span>
                <div className="t">{x.t}</div>
                <span className="d">{x.d}</span>
              </div>
            ))}
          </div>
        </section>
        <aside className="profile-section">
          <h2>Insignias</h2>
          <div className="badge-row">
            {[
              {t:'Primer módulo', d:'12 ene', e:true, em:'①'},
              {t:'7 módulos completados', d:'20 abr', e:true, em:'⚡'},
              {t:'Certificación iniciada', d:'15 feb', e:true, em:'◇'},
              {t:'Test superado', d:'01 mar', e:true, em:'✓'},
              {t:'Certificación Repsol', d:'Bloqueada', em:'🏆'},
              {t:'Racha 30 días', d:'Bloqueada', em:'⚡⚡'},
              {t:'Analytics experto', d:'Bloqueada', em:'📊'},
              {t:'Compliance ok', d:'Bloqueada', em:'✦'},
            ].map((b,i) => (
              <div key={i} className={`badge ${b.e ? 'earned' : ''}`}>
                <div className="em">{b.em}</div>
                <div className="t">{b.t}</div>
                <div className="d">{b.d}</div>
              </div>
            ))}
          </div>
          <h2 style={{marginTop:32}}>Certificación en curso</h2>
          <div style={{padding:18, border:'1px solid var(--line)', borderRadius:14, background:'var(--paper-2)'}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:8}}>Publish Agent · Repsol × BeonIt</div>
            <div style={{height:6, background:'var(--line)', borderRadius:3, overflow:'hidden', marginBottom:8}}>
              <div style={{width:'58%', height:'100%', background:'var(--accent-glow)', borderRadius:3}}/>
            </div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-3)'}}>7 de 10 módulos · 58% completado</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- WhatsApp handoff ----------
function WhatsApp() {
  const [tab, setTab] = useS2('notif'); // 'notif' | 'metrics'
  const [toggles, setToggles] = useS2([true, true, false, true]);
  const [links, setLinks] = useS2([]);
  const toggle = (i) => setToggles(ts => ts.map((v, idx) => idx === i ? !v : v));

  useE2(() => {
    if (tab === 'metrics' && window.WATracker) setLinks(window.WATracker.getLinks());
  }, [tab]);

  const options = [
    { t: 'Módulo diario en WhatsApp, 9:00', d: 'Un mensaje cada mañana con tu próximo módulo de Sprinklr. Sin ruido.' },
    { t: 'Briefs antes de reuniones Sprinklr', d: '30 min antes de cualquier sesión del calendario relacionada con Sprinklr, te llega el módulo más relevante.' },
    { t: 'Respuestas del agente IA por WhatsApp', d: 'Pregunta al agente directamente desde WhatsApp. Solo responde cuando tú preguntas.' },
    { t: 'Resumen semanal (viernes, 17:00)', d: 'Qué módulos completaste, tu progreso en la certificación y qué viene la semana siguiente.' },
  ];

  const stats = window.WATracker ? window.WATracker.getStats() : { totalShared:0, totalOpens:0, ctr:'0', avgWatch:0 };
  const fmtDate = (ts) => { const d = new Date(ts); return d.toLocaleDateString('es-ES', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}); };
  const fmtSec = (s) => s >= 60 ? Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s' : s+'s';

  return (
    <div className="main-inner" style={{maxWidth:980}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <div className="lms-hero-eyebrow" style={{marginBottom:8}}><span className="repsol-dot"/>Repsol · Formación Sprinklr</div>
        <h1 style={{fontFamily:'var(--serif)', fontWeight:700, fontSize:'clamp(32px,4vw,52px)', letterSpacing:'-0.025em', margin:'0 0 6px'}}>
          Tu formación, <em style={{fontStyle:'italic', color:'var(--accent-glow)'}}>donde estés</em>.
        </h1>
        <p style={{fontSize:14, color:'var(--ink-3)', maxWidth:560, lineHeight:1.6}}>
          Solid funciona en la web y en WhatsApp. Comparte módulos con un enlace rastreado y consulta cuántas personas los abrieron y cuánto tiempo vieron.
        </p>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:4, marginBottom:28, borderBottom:'1px solid var(--line)', paddingBottom:0}}>
        {[{id:'notif', label:'Notificaciones'}, {id:'metrics', label:'Métricas de enlaces'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer',
            fontFamily:'var(--sans)', fontSize:13, fontWeight: tab===t.id ? 700 : 500,
            color: tab===t.id ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: tab===t.id ? '2px solid var(--accent-glow)' : '2px solid transparent',
            marginBottom:-1, transition:'all .12s',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'notif' && (
        <div className="wa-root" style={{padding:0}}>
          <div>
            <div className="wa-toggles" style={{marginBottom:0}}>
              {options.map((x, i) => (
                <div key={i} className={`wa-toggle ${toggles[i] ? 'on' : ''}`} onClick={() => toggle(i)} style={{cursor:'pointer'}}>
                  <div><div className="t">{x.t}</div><div className="d">{x.d}</div></div>
                  <div className="sw"/>
                </div>
              ))}
            </div>
          </div>
          <div className="wa-phone">
            <div className="wa-screen">
              <div className="wa-bar">
                <div className="av" style={{background:'var(--accent-glow)', color:'#fff'}}>S</div>
                <div><div className="t">MENTOR-IA · Solid Sprinklr</div><div className="s">en línea · 9:00</div></div>
              </div>
              <div className="wa-chat">
                <div className="wa-msg">
                  Buenos días, Amaia ☀️ Hoy toca el módulo de <b>Programar posts y calendario</b>. ¿Lo vemos ahora? (5 min)
                  <div className="time">9:00</div>
                </div>
                <div className="wa-msg" style={{padding:6}}>
                  <div className="pill-card">
                    <div className="thumb"><div className="ph plum">módulo</div></div>
                    <div className="meta">
                      <div className="t">Programar posts y gestión de calendario</div>
                      <div className="s">Módulo · 5 min · Carlos Vega</div>
                    </div>
                  </div>
                  <span className="wa-cta">▶ Ver en Solid</span>
                  <div className="time">9:00</div>
                </div>
                <div className="wa-msg me">¿Cómo programo un post recurrente?<div className="time">9:03</div></div>
                <div className="wa-msg">En Sprinklr, ve a <b>Publish → Queue</b> y activa la opción de recurrencia. Puedes definir frecuencia diaria, semanal o personalizada.<div className="time">9:03</div></div>
                <div className="wa-msg me">Perfecto, gracias<div className="time">9:04</div></div>
                <div className="wa-msg">¡De nada! Cuando termines, se desbloquea el módulo de <b>Monitorización</b>. 💪<div className="time">9:04</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div>
          {/* KPI row */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28}}>
            {[
              { label:'Enlaces compartidos', value: stats.totalShared, icon:'📤', color:'var(--accent-glow)' },
              { label:'Aperturas totales',   value: stats.totalOpens,  icon:'👁', color:'var(--bn-green)' },
              { label:'Aperturas / enlace',  value: stats.ctr,         icon:'📊', color:'var(--bn-orange)' },
              { label:'Tiempo medio visto',  value: fmtSec(stats.avgWatch||0), icon:'⏱', color:'var(--repsol-red)' },
            ].map((k,i) => (
              <div key={i} style={{background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, padding:'16px 18px', boxShadow:'var(--shadow-sm)'}}>
                <div style={{fontSize:20, marginBottom:6}}>{k.icon}</div>
                <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:k.color, lineHeight:1}}>{k.value}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Links table */}
          <div style={{background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)'}}>
            <div style={{padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{fontWeight:700, fontSize:14}}>Historial de enlaces</div>
              <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>{links.length} enlaces</div>
            </div>
            {links.length === 0 ? (
              <div style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>
                Aún no has compartido ningún módulo por WhatsApp.<br/>
                <span style={{fontFamily:'var(--mono)', fontSize:11}}>Abre un módulo y pulsa "Compartir por WhatsApp".</span>
              </div>
            ) : (
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
                <thead>
                  <tr style={{background:'var(--paper-2)'}}>
                    {['Módulo','Compartido por','Fecha','Aperturas','Tiempo visto','Acción'].map(h => (
                      <th key={h} style={{padding:'10px 16px', textAlign:'left', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', fontWeight:600, borderBottom:'1px solid var(--line)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {links.map((l,i) => (
                    <tr key={i} style={{borderBottom:'1px solid var(--line-2)'}}>
                      <td style={{padding:'12px 16px', fontWeight:600, maxWidth:240}}>
                        <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:220}}>{l.pillTitle}</div>
                        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', marginTop:2}}>{l.duration||'—'}</div>
                      </td>
                      <td style={{padding:'12px 16px', color:'var(--ink-3)'}}>{l.sharedBy||'—'}</td>
                      <td style={{padding:'12px 16px', fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', whiteSpace:'nowrap'}}>{fmtDate(l.sharedAt)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{display:'inline-flex', alignItems:'center', gap:5, fontWeight:700, color: l.opens>0 ? 'var(--bn-green)' : 'var(--ink-4)'}}>
                          {l.opens>0 ? '●' : '○'} {l.opens||0}
                        </span>
                      </td>
                      <td style={{padding:'12px 16px', fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-3)'}}>{fmtSec(l.watchSeconds||0)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(l.url); }} style={{background:'none', border:'1px solid var(--line)', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-3)', letterSpacing:'0.06em'}}>
                          Copiar URL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* How it works */}
          <div style={{marginTop:24, padding:'16px 20px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:10}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:8}}>Cómo funciona</div>
            <div style={{display:'flex', gap:24, flexWrap:'wrap'}}>
              {[
                { n:'1', t:'Comparte', d:'Pulsa "Compartir por WhatsApp" en cualquier módulo. Se genera un enlace único rastreado.' },
                { n:'2', t:'Recibe métricas', d:'Cada vez que alguien abre el enlace, se registra una apertura. El tiempo de vídeo también se mide.' },
                { n:'3', t:'Analiza', d:'Consulta aquí cuántas personas vieron el módulo y cuánto tiempo estuvieron.' },
              ].map(s => (
                <div key={s.n} style={{flex:'1 1 160px', display:'flex', gap:10, alignItems:'flex-start'}}>
                  <div style={{width:24, height:24, borderRadius:'50%', background:'var(--accent-glow)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, flexShrink:0}}>{s.n}</div>
                  <div>
                    <div style={{fontWeight:700, fontSize:13, marginBottom:2}}>{s.t}</div>
                    <div style={{fontSize:12, color:'var(--ink-3)', lineHeight:1.5}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Rutas de aprendizaje ----------
const useS3 = React.useState;
const useE3 = React.useEffect;

const LEARNING_PATHS = [
  {
    id: 'fundamentals', label: 'Fundamentals', roleTag: 'Base · Todos los roles',
    desc: 'El punto de partida obligatorio antes de cualquier especialización. Cubre los fundamentos de Sprinklr y la estructura de Repsol.',
    color: '#0072BE', bg: 'linear-gradient(135deg,#0072BE,#004d8a)', icon: '🎓',
    pills: ['p0','p1','p2','p3','p4','p5','p6','p7'], duration: '28 min', badge: 'obligatoria',
  },
  {
    id: 'managers', label: 'Managers', roleTag: 'Liderazgo y gobernanza',
    desc: 'Para líderes de equipo. Gobernanza, estructura de roles, flujos de aprobación y visión estratégica de Sprinklr.',
    color: '#8A3992', bg: 'linear-gradient(135deg,#8A3992,#5a1f6e)', icon: '👑',
    pills: ['p0','p1','p6','p7','p8','p9','p10','p15','p22'], duration: '34 min', badge: 'rol',
  },
  {
    id: 'publish-agent', label: 'Publish Agent', roleTag: 'Publicación y contenido',
    desc: 'Operativa de publicación multicanal, gestión de campañas, aprobaciones y calendario editorial en Social Publish.',
    color: '#EB0029', bg: 'linear-gradient(135deg,#EB0029,#9b0018)', icon: '📢',
    pills: ['p0','p11','p13','p14','p17','p18','p19','p20','p21','p22','p23','p24'], duration: '52 min', badge: 'rol',
  },
  {
    id: 'care-agent', label: 'Care Agent', roleTag: 'Atención al cliente',
    desc: 'Gestión de conversaciones entrantes, SLA, Care Console, escalado a Salesforce y operativa de Community Manager.',
    color: '#036837', bg: 'linear-gradient(135deg,#036837,#024024)', icon: '💬',
    pills: ['p0','p1','p27','p28','p29','p30','p31','p32','p33','p37','p38','p39','p40'], duration: '55 min', badge: 'rol',
  },
  {
    id: 'reporting', label: 'Reporting Agent', roleTag: 'Analytics y métricas',
    desc: 'Visualización del rendimiento de campañas, métricas clave y dashboards analíticos para evaluar la performance del contenido.',
    color: '#004d8a', bg: 'linear-gradient(135deg,#004d8a,#001a30)', icon: '📊',
    pills: ['p0','p1','p25','p26','p31','p39','p40'], duration: '28 min', badge: 'rol',
  },
  {
    id: 'campaign-global', label: 'Campaign Global', roleTag: 'Campañas multi-territorio',
    desc: 'Ruta avanzada para gestión de campañas a escala global. Gobernanza, DAM, compliance y publicación en múltiples territorios.',
    color: '#c87800', bg: 'linear-gradient(135deg,#F3A524,#a36200)', icon: '🌍',
    pills: ['p0','p11','p13','p15','p16','p22','p23','p24','p25','p26'], duration: '43 min', badge: 'avanzado',
  },
];

function Rutas({ openPlayer }) {
  const [selected, setSelected] = useS3(null);
  const [completed, setCompleted] = useS3(() => {
    try { return JSON.parse(localStorage.getItem('solid-completed') || '["p0","p1","p2"]'); }
    catch { return ['p0','p1','p2']; }
  });

  const getPill = (id) => (window.PILLS || []).find(p => p.id === id);
  const isUnlocked = (pills, i) => i === 0 || completed.includes(pills[i - 1]);
  const markDone = (pillId) => {
    const u = [...new Set([...completed, pillId])];
    setCompleted(u);
    localStorage.setItem('solid-completed', JSON.stringify(u));
  };

  if (selected) {
    const path = LEARNING_PATHS.find(p => p.id === selected);
    const doneCount = path.pills.filter(id => completed.includes(id)).length;
    const pct = Math.round(doneCount / path.pills.length * 100);
    const nextIdx = path.pills.findIndex(id => !completed.includes(id));

    return (
      <div className="main-inner" style={{maxWidth:820}}>
        <button onClick={() => setSelected(null)} style={{display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'var(--ink-4)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', padding:'0 0 20px', textDecoration:'none'}}>
          ← Todas las rutas
        </button>

        {/* Path header */}
        <div style={{borderRadius:16, overflow:'hidden', marginBottom:28, background:path.bg, color:'#fff', padding:'28px 32px', position:'relative'}}>
          <div style={{position:'absolute', right:24, top:16, fontSize:56, opacity:0.15}}>{path.icon}</div>
          <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', opacity:0.6, marginBottom:6}}>{path.roleTag}</div>
          <h2 style={{fontFamily:'var(--sans)', fontWeight:800, fontSize:28, letterSpacing:'-0.025em', margin:'0 0 6px'}}>{path.label}</h2>
          <p style={{fontSize:13, opacity:0.75, maxWidth:480, lineHeight:1.6, margin:'0 0 20px'}}>{path.desc}</p>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <div style={{flex:1, height:6, background:'rgba(255,255,255,0.2)', borderRadius:3, overflow:'hidden'}}>
              <div style={{width:pct+'%', height:'100%', background:'rgba(255,255,255,0.85)', borderRadius:3, transition:'width .4s'}}/>
            </div>
            <span style={{fontFamily:'var(--mono)', fontSize:11, fontWeight:700, whiteSpace:'nowrap'}}>{pct}% · {doneCount}/{path.pills.length} módulos</span>
          </div>
        </div>

        {/* Module list */}
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {path.pills.map((pillId, i) => {
            const pill = getPill(pillId);
            if (!pill) return null;
            const unlocked = isUnlocked(path.pills, i);
            const done = completed.includes(pillId);
            const isCurrent = i === nextIdx;
            return (
              <div key={pillId} style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
                background: done ? 'rgba(3,104,55,0.06)' : isCurrent ? '#fff' : 'var(--paper)',
                border: `1px solid ${done ? '#03683722' : isCurrent ? path.color+'44' : 'var(--line)'}`,
                borderLeft: isCurrent ? `4px solid ${path.color}` : done ? '4px solid #036837' : '4px solid transparent',
                borderRadius:12, opacity: !unlocked ? 0.45 : 1,
                boxShadow: isCurrent ? '0 4px 16px rgba(0,0,0,0.07)' : 'none',
                transition:'all .15s',
              }}>
                {/* Step badge */}
                <div style={{
                  width:32, height:32, borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:800, fontSize:13,
                  background: done ? '#036837' : isCurrent ? path.color : 'var(--paper-3)',
                  color: done || isCurrent ? '#fff' : unlocked ? 'var(--ink-3)' : 'var(--ink-4)',
                  border: !unlocked ? '2px dashed var(--line)' : 'none',
                }}>
                  {done ? '✓' : !unlocked ? '🔒' : i+1}
                </div>

                {/* Content */}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight: isCurrent ? 700 : 600, color: !unlocked ? 'var(--ink-4)' : 'var(--ink)', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{pill.title}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>
                    {pill.category} · {pill.duration} · {pill.teacher}
                    {!unlocked && <span style={{color:'var(--ink-4)', marginLeft:6}}>— Completa el módulo anterior</span>}
                  </div>
                </div>

                {/* Actions */}
                {done && <span style={{fontFamily:'var(--mono)', fontSize:10, color:'#036837', fontWeight:700, flexShrink:0}}>COMPLETADO</span>}
                {isCurrent && !done && (
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    <button onClick={() => openPlayer && openPlayer(pill)} style={{background:path.color, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:12}}>
                      ▶ Ver
                    </button>
                    <button onClick={() => markDone(pillId)} style={{background:'var(--paper-2)', color:'var(--ink-3)', border:'1px solid var(--line)', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--sans)', fontWeight:600, fontSize:12}}>
                      ✓ Marcar
                    </button>
                  </div>
                )}
                {unlocked && !done && !isCurrent && (
                  <button onClick={() => markDone(pillId)} style={{background:'var(--paper-2)', color:'var(--ink-3)', border:'1px solid var(--line)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, flexShrink:0}}>
                    Marcar ✓
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Path grid
  return (
    <div className="main-inner">
      <div style={{marginBottom:28}}>
        <div className="lms-hero-eyebrow" style={{marginBottom:8}}><span className="repsol-dot"/>SOLID GROWTH · Repsol × BeonIt</div>
        <h1 style={{fontFamily:'var(--serif)', fontWeight:700, fontSize:'clamp(32px,4vw,52px)', letterSpacing:'-0.025em', margin:'0 0 6px'}}>
          Rutas de <em style={{fontStyle:'italic', color:'var(--accent-glow)'}}>aprendizaje</em>.
        </h1>
        <p style={{fontSize:14, color:'var(--ink-3)', maxWidth:520, lineHeight:1.6}}>
          Cada ruta está diseñada para tu rol. Los módulos están ordenados y debes completar uno para desbloquear el siguiente.
        </p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16}}>
        {LEARNING_PATHS.map(path => {
          const doneCount = path.pills.filter(id => completed.includes(id)).length;
          const pct = Math.round(doneCount / path.pills.length * 100);
          const nextIdx = path.pills.findIndex(id => !completed.includes(id));
          const nextPill = nextIdx >= 0 ? getPill(path.pills[nextIdx]) : null;
          return (
            <div key={path.id} onClick={() => setSelected(path.id)} style={{
              background:'var(--paper)', border:'1px solid var(--line)', borderRadius:16,
              overflow:'hidden', cursor:'pointer', transition:'all .18s',
              boxShadow:'var(--shadow-sm)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}>
              {/* Colored header */}
              <div style={{background:path.bg, padding:'20px 22px', color:'#fff', position:'relative', overflow:'hidden'}}>
                <div style={{position:'absolute', right:12, top:8, fontSize:40, opacity:0.15}}>{path.icon}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.65, marginBottom:4}}>{path.roleTag}</div>
                <div style={{fontWeight:800, fontSize:18, letterSpacing:'-0.02em'}}>{path.label}</div>
                {path.badge === 'obligatoria' && (
                  <span style={{display:'inline-block', marginTop:6, fontFamily:'var(--mono)', fontSize:9, background:'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:999, letterSpacing:'0.08em', textTransform:'uppercase'}}>Obligatoria</span>
                )}
              </div>
              {/* Body */}
              <div style={{padding:'16px 22px'}}>
                <p style={{fontSize:12, color:'var(--ink-3)', lineHeight:1.6, marginBottom:14, minHeight:48}}>{path.desc}</p>
                {/* Progress */}
                <div style={{height:4, background:'var(--paper-3)', borderRadius:2, overflow:'hidden', marginBottom:8}}>
                  <div style={{width:pct+'%', height:'100%', background:path.color, borderRadius:2, transition:'width .4s'}}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>
                    {doneCount}/{path.pills.length} módulos · {path.duration}
                  </div>
                  <div style={{fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color:path.color}}>{pct}%</div>
                </div>
                {nextPill && pct < 100 && (
                  <div style={{marginTop:10, padding:'8px 12px', background:'var(--paper-2)', borderRadius:8, fontSize:11, color:'var(--ink-3)'}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)'}}>Siguiente → </span>
                    {nextPill.title}
                  </div>
                )}
                {pct === 100 && (
                  <div style={{marginTop:10, padding:'8px 12px', background:'#03683710', borderRadius:8, fontSize:11, color:'#036837', fontWeight:700, textAlign:'center'}}>
                    ✓ Ruta completada · Certificación disponible
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const colors = ['var(--accent-glow)', 'var(--bn-lime)', 'var(--bn-orange)', 'var(--repsol-red)', 'var(--bn-purple)'];
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

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.v, 0) || 1;
  const r = 42, cx = size/2, cy = size/2, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const colors = ['var(--accent-glow)', 'var(--bn-orange)', 'var(--bn-lime)', 'var(--repsol-red)', 'var(--bn-purple)', 'var(--beonit-blue)'];
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

const WIDGET_TYPES = [
  { id:'dropoff',  label:'Drop-off (línea)',   icon:'📉' },
  { id:'column',   label:'Barras verticales',  icon:'📊' },
  { id:'stacked',  label:'Stacked Bar',        icon:'🟦' },
  { id:'donut',    label:'Pastel / Donut',      icon:'🥧' },
  { id:'area',     label:'Tendencia (área)',   icon:'📈' },
  { id:'heatmap',  label:'Heatmap actividad',  icon:'🟧' },
  { id:'gauge',    label:'Gauge / KPI dial',   icon:'⏱' },
  { id:'funnel',   label:'Funnel conversión',  icon:'🔻' },
  { id:'modules',  label:'Completación',       icon:'✅' },
  { id:'users',    label:'Tabla usuarios',     icon:'👤' },
  { id:'activity', label:'Actividad reciente', icon:'🔔' },
  { id:'wa',       label:'WhatsApp analytics', icon:'💬' },
];

function WidgetPicker({ onAdd, onClose }) {
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'var(--paper)', borderRadius:16, padding:24, width:380, boxShadow:'var(--shadow-lg)'}} onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontWeight:800, fontSize:16}}>Añadir widget</div>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--ink-4)'}}>×</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {WIDGET_TYPES.map(wt => (
            <button key={wt.id} onClick={() => { onAdd(wt.id); onClose(); }} style={{
              display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
              background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:10,
              cursor:'pointer', fontFamily:'var(--sans)', fontSize:12, fontWeight:600, color:'var(--ink)',
              transition:'all .12s', textAlign:'left',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent-glow)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--line)'}>
              <span style={{fontSize:18}}>{wt.icon}</span>{wt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Analytics Dashboard ----------
function Dashboard() {
  const [checks, setChecks] = useS2([true, true, false, false, false, false]);
  const toggleCheck = (i) => setChecks(c => c.map((v, idx) => idx === i ? !v : v));
  const DASH_KEY = 'solid-dash-widgets';
  const DEFAULT_WIDGETS = ['dropoff', 'column', 'gauge', 'area', 'funnel', 'modules', 'heatmap', 'users', 'activity', 'wa'];
  const [activeWidgets, setActiveWidgets] = useS2(() => {
    try { const s = JSON.parse(localStorage.getItem(DASH_KEY) || 'null'); return Array.isArray(s) ? s : DEFAULT_WIDGETS; }
    catch(e) { return DEFAULT_WIDGETS; }
  });
  React.useEffect(() => { localStorage.setItem(DASH_KEY, JSON.stringify(activeWidgets)); }, [activeWidgets]);
  const [showPicker, setShowPicker] = useS2(false);
  const addWidget = (id) => setActiveWidgets(w => w.includes(id) ? w : [...w, id]);
  const removeWidget = (id) => setActiveWidgets(w => w.filter(x => x !== id));
  const waStats = window.WATracker ? window.WATracker.getStats() : { totalShared:0, totalOpens:0, ctr:'0', avgWatch:0, links:[] };
  const fmtSec = (s) => s >= 60 ? Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s' : (s||0)+'s';
  const kpis = [
    { label: 'Usuarios activos', value: '247', delta: '+12%', up: true, color: 'var(--beonit-blue)' },
    { label: 'Completación media', value: '58%', delta: '+4%', up: true, color: 'var(--beonit-lime)' },
    { label: 'Tiempo / semana', value: '3h 2m', delta: '-8m', up: false, color: 'var(--accent-glow)' },
    { label: 'Tasa éxito tests', value: '94%', delta: '+2%', up: true, color: 'var(--repsol-red)' },
  ];

  const dropoff = [100,98,95,90,85,78,71,65,58,50,47,41,38,35,33,30,28,27,25,24,23,22,21,20];

  const users = [
    { name: 'Amaia Ruiz',    role: 'Publish Agent',  prog: 58,  mods: '7/12',  last: 'Hoy, 10:42' },
    { name: 'Carlos Vega',   role: 'Publish Agent',  prog: 100, mods: '12/12', last: 'Ayer' },
    { name: 'Sara Molina',   role: 'Content Lead',   prog: 33,  mods: '4/12',  last: 'Hace 2 días' },
    { name: 'Luis Romero',   role: 'Analyst',        prog: 75,  mods: '9/12',  last: 'Hoy, 09:10' },
    { name: 'Ana García',    role: 'Analytics Lead', prog: 17,  mods: '2/12',  last: 'Hace 4 días' },
  ];

  const checklistItems = [
    'Crear y gestionar campañas en Sprinklr',
    'Flujo de aprobación de contenido',
    'Programar posts y gestión de calendario',
    'Monitorización y alertas en tiempo real',
    'Gestión de activos digitales en DAM',
    'Compliance y gobernanza de contenido',
  ];

  const modules = [
    { name: 'Crear y gestionar campañas', pct: 89 },
    { name: 'Flujo de aprobación', pct: 76 },
    { name: 'Programar posts · Calendario', pct: 54 },
    { name: 'Monitorización y alertas', pct: 38 },
    { name: 'Gestión de activos DAM', pct: 22 },
    { name: 'Compliance · Gobernanza', pct: 11 },
  ];

  const activity = [
    { color: 'green',  text: 'Carlos Vega completó la ruta de certificación',           time: 'Hace 8 min' },
    { color: 'orange', text: 'Amaia Ruiz superó el test de Publicación con 94%',        time: 'Hace 22 min' },
    { color: '',       text: 'Sara Molina vio 2 módulos de Calendario',                 time: 'Hace 1h' },
    { color: 'red',    text: 'Ana García se quedó atascada en el módulo de Analytics',  time: 'Hace 3h' },
    { color: '',       text: 'Luis Romero descargó el certificado de DAM',              time: 'Ayer, 18:30' },
  ];

  const colData = [
    {l:'Social P.',v:89},{l:'Aprobac.',v:76},{l:'Calendr.',v:54},{l:'Monitor.',v:38},{l:'DAM',v:22},{l:'Complian.',v:11},
  ];
  const stackData = {
    series: [
      {label:'Completado', values:[89,76,54,38,22,11]},
      {label:'En progreso', values:[8,12,20,25,15,10]},
      {label:'Sin iniciar', values:[3,12,26,37,63,79]},
    ],
    categories: ['Social Publish','Aprobaciones','Calendario','Monitorización','DAM','Compliance'],
  };
  const donutData = [
    {l:'Publish Agent',v:89},{l:'Care Agent',v:64},{l:'Managers',v:32},{l:'Reporting',v:28},{l:'Sin rol',v:34},
  ];

  // Datos para nuevos widgets
  const trendData = [
    {l:'L 14',v:142},{l:'M 15',v:168},{l:'X 16',v:155},{l:'J 17',v:184},{l:'V 18',v:210},
    {l:'S 19',v:96},{l:'D 20',v:78},{l:'L 21',v:201},{l:'M 22',v:223},{l:'X 23',v:198},
    {l:'J 24',v:241},{l:'V 25',v:258},{l:'S 26',v:112},{l:'D 27',v:247},
  ];
  const heatData = (() => {
    const rows = ['L','M','X','J','V','S','D'];
    const cols = Array.from({length:14}, (_,i) => i);
    const matrix = rows.map((r, ri) => cols.map((_, ci) => {
      // patrón realista: más actividad lunes-viernes 9-17h, menos finde
      const weekend = ri >= 5 ? 0.25 : 1;
      const peak = Math.exp(-Math.pow((ci - 6.5)/4, 2));
      const noise = 0.4 + Math.random() * 0.6;
      return Math.round(weekend * peak * noise * 100);
    }));
    return { rows, cols, matrix };
  })();
  const gaugeData = { value: 73, label:'Engagement global', sub:'meta trimestral 80%', target: 80 };
  const funnelData = [
    { l:'Matriculados',     v:247, c:'var(--bn-blue)' },
    { l:'Iniciaron P0',      v:231, c:'var(--accent-glow)' },
    { l:'Completan Bloque 1',v:198, c:'var(--bn-lime)' },
    { l:'Completan Bloque 4',v:142, c:'var(--bn-orange)' },
    { l:'Certificados',      v: 89, c:'var(--repsol-red)' },
  ];

  return (
    <div className="dash-root">
      {showPicker && <WidgetPicker onAdd={addWidget} onClose={() => setShowPicker(false)}/>}
      <div className="dash-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot"/>Repsol · Dashboard de formación</div>
          <h1>Analytics <em>Sprinklr</em></h1>
          <div className="dash-sub">Cohorte activa · 247 usuarios · Actualizado hace 2 min</div>
        </div>
        <button onClick={() => setShowPicker(true)} style={{
          display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px',
          background:'var(--accent-glow)', color:'#fff', border:'none', borderRadius:10,
          cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:13,
          boxShadow:'0 4px 14px rgba(0,89,150,0.3)', marginTop:8,
        }}>
          + Añadir widget
        </button>
      </div>

      <div className="dash-kpis">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card" style={{'--kpi-color': k.color}}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.up ? '↑' : '↓'} {k.delta} vs mes anterior</div>
          </div>
        ))}
      </div>

      {activeWidgets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Tu dashboard está vacío</h3>
          <p>Añade tus primeros widgets para empezar a ver métricas. Puedes elegir entre 12 tipos: drop-off, completación, gauge, funnel, heatmap, WhatsApp analytics y más.</p>
          <button className="btn glow" onClick={() => setShowPicker(true)}>+ Añadir mi primer widget</button>
        </div>
      )}

      {/* Dynamic widget grid */}
      <div className="dash-grid">
        {activeWidgets.includes('dropoff') && (
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h3>Drop-off por minuto</h3>
              <span className="panel-sub">Crear y gestionar campañas — 4 min</span>
              <button onClick={() => removeWidget('dropoff')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body">
              <div className="dropoff-chart">
                {dropoff.map((v, i) => (
                  <div key={i} className={`dropoff-bar${v < 40 ? ' drop' : ''}`} style={{height: v + '%'}} title={`${Math.floor(i/6)}:${String((i%6)*10).padStart(2,'0')} — ${v}%`}/>
                ))}
              </div>
              <div className="dropoff-axis"><span>0:00</span><span>1:00</span><span>2:00</span><span>3:00</span><span>4:00</span></div>
              <div className="dropoff-legend">
                <span><i style={{background:'var(--beonit-blue)'}}/> Retención</span>
                <span><i style={{background:'var(--repsol-red)'}}/> Drop-off (&lt;40%)</span>
              </div>
            </div>
          </div>
        )}
        {activeWidgets.includes('column') && (
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h3>Completación por módulo</h3>
              <span className="panel-sub">Barras verticales · % completado</span>
              <button onClick={() => removeWidget('column')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:8}}>
              <ColumnChart data={colData} color="var(--accent-glow)" height={100}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('stacked') && (
          <div className="dash-panel" style={{gridColumn:'span 2'}}>
            <div className="dash-panel-head">
              <h3>Stacked Bar · Estado por módulo</h3>
              <span className="panel-sub">Completado · En progreso · Sin iniciar</span>
              <button onClick={() => removeWidget('stacked')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:8}}>
              <StackedBarChart series={stackData.series} categories={stackData.categories} height={150}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('donut') && (
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h3>Pastel · Distribución por rol</h3>
              <span className="panel-sub">247 usuarios activos</span>
              <button onClick={() => removeWidget('donut')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:8, paddingBottom:12}}>
              <DonutChart segments={donutData}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('area') && (
          <div className="dash-panel" style={{gridColumn:'span 2'}}>
            <div className="dash-panel-head">
              <h3>Tendencia · Sesiones diarias</h3>
              <span className="panel-sub">Últimas 2 semanas · MENTOR-IA + módulos</span>
              <button onClick={() => removeWidget('area')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:8}}>
              <AreaChart data={trendData} color="var(--accent-glow)" height={120}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('heatmap') && (
          <div className="dash-panel" style={{gridColumn:'span 2'}}>
            <div className="dash-panel-head">
              <h3>Heatmap · Actividad por día y franja</h3>
              <span className="panel-sub">Densidad de uso · 7 días × 14 franjas horarias</span>
              <button onClick={() => removeWidget('heatmap')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:10, paddingBottom:14}}>
              <HeatmapChart rows={heatData.rows} cols={heatData.cols} matrix={heatData.matrix} color="var(--bn-blue)"/>
            </div>
          </div>
        )}
        {activeWidgets.includes('gauge') && (
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h3>KPI · Engagement</h3>
              <span className="panel-sub">vs meta trimestral</span>
              <button onClick={() => removeWidget('gauge')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:6, paddingBottom:14, display:'flex', justifyContent:'center'}}>
              <GaugeChart value={gaugeData.value} label={gaugeData.label} sub={gaugeData.sub} target={gaugeData.target}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('funnel') && (
          <div className="dash-panel" style={{gridColumn:'span 2'}}>
            <div className="dash-panel-head">
              <h3>Funnel · Matriculación → Certificación</h3>
              <span className="panel-sub">Conversión por etapa · cohorte completa</span>
              <button onClick={() => removeWidget('funnel')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body" style={{paddingTop:10, paddingBottom:14}}>
              <FunnelChart stages={funnelData}/>
            </div>
          </div>
        )}
        {activeWidgets.includes('modules') && (
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h3>Completación por módulo</h3>
              <span className="panel-sub">% usuarios que terminaron</span>
              <button onClick={() => removeWidget('modules')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
            </div>
            <div className="dash-panel-body">
              {modules.map((m, i) => (
                <div key={i} className="module-bar-row">
                  <div className="mod-name">{m.name}</div>
                  <div className="module-bar-wide"><i style={{width: m.pct + '%'}}/></div>
                  <div className="mod-pct">{m.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-grid-3">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Checklist de aprendizaje</h3>
            <span className="panel-sub">Amaia Ruiz</span>
            <button onClick={() => removeWidget('checklist')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
          </div>
          <div className="dash-panel-body">
            <div className="check-list">
              {checklistItems.map((t, i) => (
                <div key={i} className={`check-item${checks[i] ? ' done' : ''}`} onClick={() => toggleCheck(i)}>
                  <div className="check-box">{checks[i] ? '✓' : ''}</div>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        {activeWidgets.includes('users') && <div className="dash-panel" style={{gridColumn:'span 2'}}>
          <div className="dash-panel-head">
            <h3>Usuarios activos</h3>
            <span className="panel-sub">Progreso individual</span>
            <button onClick={() => removeWidget('users')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
          </div>
          <div className="dash-panel-body" style={{padding:'0 20px'}}>
            <table className="user-table">
              <thead>
                <tr><th>Usuario</th><th>Progreso</th><th>Módulos</th><th>Última actividad</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td><div className="u-name">{u.name}</div><div className="u-role">{u.role}</div></td>
                    <td>
                      <div className="prog-pill">
                        <div className="prog-bar-sm"><i style={{width: u.prog + '%'}}/></div>
                        <span style={{fontFamily:'var(--mono)', fontSize:11}}>{u.prog}%</span>
                      </div>
                    </td>
                    <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u.mods}</td>
                    <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{u.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </div>

      {activeWidgets.includes('activity') && <div className="dash-panel">
        <div className="dash-panel-head">
          <h3>Actividad reciente</h3>
          <span className="panel-sub">Últimas 24 horas</span>
          <button onClick={() => removeWidget('activity')} style={{marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-4)', lineHeight:1}}>×</button>
        </div>
        <div className="dash-panel-body">
          <div className="activity-feed">
            {activity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot${a.color ? ' ' + a.color : ''}`}/>
                <div className="activity-main">
                  <div className="a-text">{a.text}</div>
                  <div className="a-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* WhatsApp link analytics */}
      {activeWidgets.includes('wa') && <div className="dash-panel">
        <div className="dash-panel-head">
          <h3 style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', background:'#25D366', flexShrink:0}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.186-.007-.397-.007-.603-.007-.21 0-.547.074-.83.375-.28.3-1.089 1.06-1.089 2.595 0 1.535 1.114 3.021 1.27 3.231.149.195 2.185 3.344 5.298 4.692.742.315 1.319.504 1.77.646.746.24 1.423.206 1.96.127.598-.089 1.84-.752 2.098-1.482.26-.72.26-1.336.18-1.466-.075-.135-.276-.21-.574-.346zM11.997 1.903c-5.569 0-10.097 4.524-10.097 10.097 0 1.782.465 3.447 1.282 4.892l-1.413 5.16 5.285-1.385a10.037 10.037 0 004.944 1.296h.004c5.57 0 10.095-4.524 10.095-10.097C22.097 6.427 17.567 1.903 11.997 1.903z"/>
              </svg>
            </span>
            Analytics WhatsApp
          </h3>
          <span className="panel-sub">{waStats.totalShared} enlaces compartidos</span>
        </div>
        <div className="dash-panel-body">
          {/* mini KPI row */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 20px 16px', borderBottom:'1px solid var(--line-2)'}}>
            {[
              { label:'Compartidos', value: waStats.totalShared },
              { label:'Aperturas',   value: waStats.totalOpens },
              { label:'Ratio apertura', value: waStats.ctr+'×' },
              { label:'Tiempo medio', value: fmtSec(waStats.avgWatch||0) },
            ].map((k,i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.03em', color:'var(--ink)', lineHeight:1}}>{k.value}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:3}}>{k.label}</div>
              </div>
            ))}
          </div>
          {/* top 3 links */}
          <div style={{padding:'12px 20px'}}>
            {waStats.links.slice(0,3).map((l,i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom: i<2 ? '1px solid var(--line-2)' : 'none'}}>
                <div style={{width:28, height:28, borderRadius:8, background:'#25D36618', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:800, fontSize:12, color:'#25D366'}}>{i+1}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.pillTitle}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', marginTop:1}}>por {l.sharedBy||'—'} · {fmtSec(l.watchSeconds||0)} visto</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', flexShrink:0}}>
                  <div style={{fontWeight:700, fontSize:14, color: l.opens>0 ? 'var(--bn-green)' : 'var(--ink-4)'}}>{l.opens||0}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em'}}>aperturas</div>
                </div>
              </div>
            ))}
            {waStats.links.length === 0 && (
              <div style={{textAlign:'center', color:'var(--ink-4)', fontSize:12, padding:'12px 0'}}>Ningún enlace compartido aún.</div>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
}

// ---------- Cronograma POC ----------
function Cronograma() {
  const W = 14; // semanas S-0 … S-13
  const col = (s, e) => ({ gridColumn: `${s + 2} / ${e + 3}` }); // +2: skip label col; +1: inclusive end

  const phases = [
    {
      label: 'VERIFICACIÓN', bg: '#d4edda', tc: '#1a7a3a',
      rows: [[{ label: 'Verificación Itinerario y Th1ngs', s: 1, e: 2, bg: '#28a745' }]],
    },
    {
      label: 'CREACIÓN', bg: '#fde8e8', tc: '#b71c1c',
      rows: [[{ label: 'Creación de contenidos POC', s: 1, e: 6, bg: '#e53935' }]],
    },
    {
      label: 'ARRANQUE', bg: '#ede7f6', tc: '#4527a0',
      rows: [
        [{ label: 'Kick-off', s: 4, e: 4, bg: '#5c35cc' }],
        [{ label: 'Comunicación y lanzamiento', s: 4, e: 5, bg: '#7c4dff' }, { label: 'Píldora bienvenida', s: 5, e: 5, bg: '#9575cd' }],
      ],
    },
    {
      label: 'AUTODIAGNÓSTICO', bg: '#fff8e1', tc: '#e65100',
      rows: [
        [{ label: 'Inicial', s: 8, e: 8, bg: '#F3A524' }, { label: 'Final', s: 13, e: 13, bg: '#c87800' }],
      ],
    },
    {
      label: 'EXP. APRENDIZAJE', bg: '#e3f2fd', tc: '#0d47a1',
      rows: [
        [{ label: 'Think Pills · Sprinklr Fundamentals', s: 6, e: 8, bg: '#1565c0' }, { label: 'Taller Fundamentals', s: 8, e: 9, bg: '#0071BE' }],
        [{ label: 'Think Pills · Publish (Rol y Transversal)', s: 9, e: 12, bg: '#1976d2' }, { label: 'Taller Publish', s: 12, e: 12, bg: '#0071BE' }],
        [{ label: 'Think Pills · Care (Rol y Transversal)', s: 9, e: 12, bg: '#2196f3' }, { label: 'Taller Care', s: 12, e: 12, bg: '#0071BE' }],
      ],
    },
    {
      label: 'GOBERNANZA', bg: '#f5f5f5', tc: '#444',
      rows: [[
        { label: 'Seg. Op.', s: 4, e: 4, bg: '#999' },
        { label: 'Seg. Op.', s: 6, e: 6, bg: '#999' },
        { label: 'Seg. Op.', s: 8, e: 8, bg: '#999' },
        { label: 'Seg. Op.', s: 10, e: 10, bg: '#999' },
        { label: 'Seg. Op.', s: 12, e: 12, bg: '#999' },
      ]],
    },
  ];

  return (
    <div className="cron-root">
      <div className="lms-hero-eyebrow" style={{marginBottom:8}}><span className="repsol-dot"/>SOLID GROWTH · Repsol × BeonIt</div>
      <h1 style={{fontFamily:'var(--serif)', fontWeight:700, fontSize:'clamp(32px,3.5vw,48px)', letterSpacing:'-0.025em', margin:'0 0 4px'}}>Cronograma <em style={{fontStyle:'italic', color:'var(--accent-glow)'}}>POC</em></h1>
      <p style={{fontSize:13, color:'var(--ink-3)', marginBottom:28}}>Prueba de concepto · 163 personas · S-0 a S-13 · 14 semanas</p>

      {/* Milestone flags */}
      <div className="cron-milestones">
        <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--beonit-lime)', fontWeight:700}}>🚩 Inicio POC → S-6</div>
        <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--repsol-red)', fontWeight:700}}>🏁 Fin POC → S-13</div>
      </div>

      {/* Gantt */}
      <div className="cron-gantt">
        {/* Header */}
        <div className="cron-header">
          <div className="cron-label-cell" style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em', textTransform:'uppercase'}}>FASE</div>
          {Array.from({length: W}, (_, i) => (
            <div key={i} className={`cron-week ${i === 6 ? 'milestone-start' : i === 13 ? 'milestone-end' : ''}`}>S-{i}</div>
          ))}
        </div>

        {/* Phase rows */}
        {phases.map((ph, pi) => (
          <div key={pi} className="cron-phase-block">
            {ph.rows.map((row, ri) => (
              <div key={ri} className="cron-row">
                {ri === 0 && (
                  <div className="cron-label-cell" style={{background: ph.bg, color: ph.tc, rowSpan: ph.rows.length}}>
                    {ph.label}
                  </div>
                )}
                {ri > 0 && <div className="cron-label-cell" style={{background: ph.bg}}/>}
                <div className="cron-track">
                  {Array.from({length: W}, (_, wi) => <div key={wi} className="cron-cell"/>)}
                  {row.map((bar, bi) => (
                    <div key={bi} className="cron-bar" style={{
                      left: (bar.s / (W - 1) * 100) + '%',
                      width: Math.max(((bar.e - bar.s + 1) / W * 100), 4) + '%',
                      background: bar.bg,
                    }}>{bar.label}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{display:'flex', gap:20, flexWrap:'wrap', marginTop:20, fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>
        {[
          {c:'#28a745', l:'Verificación'}, {c:'#e53935', l:'Creación'}, {c:'#5c35cc', l:'Arranque'},
          {c:'#F3A524', l:'Autodiagnóstico'}, {c:'#1565c0', l:'Think Pills'}, {c:'#0071BE', l:'Taller'},
          {c:'#999', l:'Gobernanza'},
        ].map((leg, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:5}}>
            <div style={{width:12, height:12, borderRadius:2, background:leg.c}}/>
            <span>{leg.l}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

Object.assign(window, { Detail, Player, AISidekick, Coach, Onboarding, PathView, Profile, WhatsApp, Dashboard, Cronograma, Rutas, LEARNING_PATHS, ColumnChart, StackedBarChart, DonutChart, AreaChart, HeatmapChart, GaugeChart, FunnelChart });
