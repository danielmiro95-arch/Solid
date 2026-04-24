// prototype-views.jsx — Detail, Player, Coach, Onboarding, Path, Profile, WhatsApp (es)

const { useState: useS2, useEffect: useE2 } = React;

// ---------- Detail ----------
function Detail({ item, openPlayer, back }) {
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
          <div className="detail-poster"><div className={`ph ${it.tone}`} style={{position:'absolute',inset:0}}/></div>
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
              <button className="btn ghost"><Icon name="bookmark" size={14}/> Guardar</button>
              <button className="btn ghost"><Icon name="sparkle" size={14}/> MENTOR-IA</button>
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
                  <div className="thumb"><div className={`ph ${s.tone}`}/></div>
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
                <button className="back" style={{background:'rgba(243,165,36,0.15)', border:'1px solid rgba(243,165,36,0.4)', color:'var(--accent-glow)'}}>
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
  const contextLabel = {
    home: 'Vista general · tu progreso',
    player: 'Viendo módulo · Programar posts',
    detail: 'Detalle de módulo',
    path: 'Tu ruta de certificación',
    dashboard: 'Analytics · visión admin',
    coach: 'MENTOR-IA · modo completo',
  }[view] || 'Plataforma Sprinklr';
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
          <span className="who">Agente · 10:42</span>
          <div className="bubble">
            ¡Hola Amaia! Llevas un <span className="hl">58% de tu certificación</span>. El siguiente módulo es <em>Programar posts</em>. ¿Seguimos? <span style={{fontSize:10,opacity:.6}}>· MENTOR-IA</span>
          </div>
        </div>
        <div className="ai-suggest">
          <div className="thumb"><div className="ph plum"/></div>
          <div className="meta">
            <div className="t">Programar posts y gestión de calendario</div>
            <div className="s">5 min · Carlos Vega · Calendario</div>
          </div>
        </div>
        <div className="ai-suggest">
          <div className="thumb"><div className="ph olive"/></div>
          <div className="meta">
            <div className="t">Monitorización y alertas en tiempo real</div>
            <div className="s">4 min · Ana García · Analytics</div>
          </div>
        </div>
        <div className="ai-chip-row">
          <button className="ai-chip">¿Qué módulo sigue?</button>
          <button className="ai-chip">Hazme un quiz</button>
          <button className="ai-chip">Resumen del módulo</button>
          <button className="ai-chip">Ayuda con aprobaciones</button>
        </div>
        <div className="ai-msg from-me">
          <span className="who">Tú · 10:44</span>
          <div className="bubble">¿Cómo apruebo un post urgente fuera del horario?</div>
        </div>
        <div className="ai-msg from-ai">
          <span className="who">Agente · 10:44</span>
          <div className="bubble">
            Para aprobaciones urgentes: abre el post en estado <em>"Pendiente"</em>, usa <em>"Aprobación de emergencia"</em> y notifica al manager de turno por Slack. El módulo 2 lo explica paso a paso.
            <div className="ai-chip-row" style={{marginTop:10}}>
              <button className="ai-chip">Ver módulo 2</button>
              <button className="ai-chip">Más detalles</button>
            </div>
          </div>
        </div>
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pregunta sobre Sprinklr o tu formación…"/>
          <button className="send"><Icon name="send" size={14}/></button>
        </div>
        <div className="ai-footer-row">
          <span className="hint">Contexto: módulo actual · ruta · progreso</span>
          <span className="hint">⌘ ↵</span>
        </div>
      </div>
    </aside>
  );
}

// ---------- Coach / AI Agent fullscreen ----------

// URL de la API — configurar tras desplegar en Vercel
// Producción: 'https://TU-PROYECTO.vercel.app/api/chat'
// Local dev:  'http://localhost:3000/api/chat'
const MENTOR_API = window.MENTOR_IA_API_URL || null;

const USER_PROFILE = {
  name: 'Amaia Ruiz',
  role: 'Publish Agent',
  progress: 15,
  currentPill: 4,
};

function Coach() {
  const [input, setInput] = useS2('');
  const [loading, setLoading] = useS2(false);
  const [apiStatus, setApiStatus] = useS2(MENTOR_API ? 'live' : 'demo');
  const [msgs, setMsgs] = useS2([
    { role: 'assistant', text: '¡Hola Amaia! Soy MENTOR-IA, tu asistente de formación Sprinklr. Llevas un 15% de tu certificación — estás en el Bloque 2, sobre estructura y gobernanza. ¿En qué te puedo ayudar hoy?' },
  ]);

  const messagesEndRef = useS2(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    const newMsgs = [...msgs, { role: 'user', text: q }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    if (MENTOR_API) {
      // ── Llamada real a Claude ────────────────────────────
      try {
        const res = await fetch(MENTOR_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMsgs.map(m => ({
              role: m.role === 'ai' ? 'assistant' : m.role,
              content: m.text,
            })),
            userProfile: USER_PROFILE,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setMsgs(m => [...m, { role: 'assistant', text: data.content }]);
        setApiStatus('live');
      } catch (err) {
        console.warn('[MENTOR-IA] API error:', err.message);
        setMsgs(m => [...m, { role: 'assistant', text: '⚠️ MENTOR-IA no está disponible en este momento. Respondiendo en modo demo — tus preguntas se guardan y se sincronizarán cuando se restaure la conexión.' }]);
        setApiStatus('error');
      }
    } else {
      // ── Modo demo: respuestas simuladas contextuales ─────
      await new Promise(r => setTimeout(r, 900));
      const demos = {
        'macro': 'Una macro en Sprinklr es una respuesta o acción predefinida que puedes aplicar con un solo clic. Para Repsol Care, las macros más usadas son las de acuse de recibo inicial y las de escalado a Salesforce. La Think Pill 41 "Qué es una macro" tiene el vídeo explicativo disponible en la plataforma. ¿Quieres que te indique cómo acceder a ella?',
        'aprobaci': 'El flujo de aprobación en Repsol Social Publish tiene dos variantes: el flujo estándar (el Content Lead revisa antes de publicar) y el flujo de emergencia para publicaciones urgentes. La Think Pill 20 explica exactamente cómo activar la aprobación de emergencia. ¿Es ese el caso que necesitas resolver?',
        'sla': 'Los SLA en Repsol definen el tiempo máximo de respuesta por canal: 30 min en Twitter/X, 2h en Facebook e Instagram, 4h en LinkedIn. La barra de SLA en cada caso cambia de verde a rojo conforme se acerca el límite. Lo cubre en detalle la Think Pill 37. ¿Tienes algún caso específico donde el SLA esté en riesgo?',
        'salesforce': 'La transferencia a Salesforce se usa cuando hay una reclamación formal o el cliente necesita gestión de back office. El flujo es: abrir el caso en Care → "Transferir a Salesforce" → seleccionar tipo de caso → confirmar datos. Las Think Pills 35 y 36 explican el proceso completo con ejemplos de Repsol. ¿Necesitas hacer una transferencia ahora?',
        'calendar': 'El calendario editorial en Sprinklr Social Publish te permite visualizar todos los contenidos planificados por canal, campaña y territorio. Puedes filtrar por equipo o fecha. La Think Pill 23 explica cómo configurar tu vista personalizada. ¿Quieres saber cómo filtrar por un canal concreto?',
        'default': `Entendido. En el contexto de Sprinklr para Repsol, lo que describes está relacionado con los módulos de tu ruta de certificación. Basándome en tu progreso actual (Bloque 2 · Estructura y gobernanza), te recomiendo revisar las Think Pills correspondientes en la plataforma. ¿Puedes darme más detalles sobre la situación concreta?`,
      };
      const key = Object.keys(demos).find(k => q.toLowerCase().includes(k)) || 'default';
      setMsgs(m => [...m, { role: 'assistant', text: demos[key] }]);
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
      <div className="coach-main">
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:8, padding:'14px 20px', background:'linear-gradient(135deg, var(--bn-blue) 0%, #004d8a 100%)', borderRadius:14, color:'#fff'}}>
          <div style={{width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(4px)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, lineHeight:1, marginBottom:2}}>MENTOR-IA <span style={{fontFamily:'var(--mono)', fontStyle:'normal', fontSize:9, background:'var(--bn-lime)', color:'var(--ink)', padding:'1px 6px', borderRadius:4, letterSpacing:'0.08em', textTransform:'uppercase', verticalAlign:'middle', marginLeft:4}}>BETA</span></div>
            <div style={{fontFamily:'var(--mono)', fontSize:9, color:'rgba(255,255,255,0.65)', letterSpacing:'0.1em', textTransform:'uppercase'}}>IA contextualizada · Sprinklr Repsol</div>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:9, color: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:5}}>
            <span style={{width:6, height:6, borderRadius:'50%', background: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.4)', display:'inline-block'}}/>
            {apiStatus === 'live' ? 'En línea' : apiStatus === 'error' ? 'Sin conexión' : 'Demo'}
          </div>
        </div>
        <div className="coach-actions">
          <div className="coach-action">
            <span className="eyebrow">Módulo siguiente · 5 min</span>
            <div className="t">Programar posts y calendario</div>
            <div className="d">Siguiente en tu ruta de certificación Repsol.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Serie · 22 min</span>
            <div className="t">Sprinklr Analytics para Repsol</div>
            <div className="d">5 lecciones para interpretar tus campañas.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Quiz · 90 seg</span>
            <div className="t">Test de Publish Agent</div>
            <div className="d">Verifica lo aprendido en los módulos 1 y 2.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Resumen</span>
            <div className="t">Lo que aprendí esta semana</div>
            <div className="d">Flujo de aprobación completado · 2 módulos terminados.</div>
          </div>
        </div>
        {/* Quick action chips */}
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
          {quickActions.map((a, i) => (
            <button key={i} className="ai-chip" onClick={() => { setInput(a.q); }} style={{fontSize:11}}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, padding:'4px 0 16px'}}>
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
              <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
              <div className="bubble" style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-msg from-ai">
              <span className="who">MENTOR-IA</span>
              <div className="bubble mentor-typing">
                <span/><span/><span/>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="coach-input-shell">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Pregúntame lo que quieras sobre Sprinklr o tu formación… (↵ enviar)"
            disabled={loading}
          />
          <div className="coach-input-tools">
            <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.06em'}}>
              ↵ enviar · Shift+↵ nueva línea
            </div>
            <button className="btn sm send" onClick={send} disabled={loading} style={{opacity: loading ? 0.5 : 1}}>
              {loading ? 'Pensando…' : 'Preguntar →'}
            </button>
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
            <button className="btn glow" onClick={done}>Sí — entrar en Solid →</button>
            <button className="btn ghost">Cuéntame más</button>
          </div>
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
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase'}}>SOLID Growth · BeonIt</div>
        </div>
      </div>
      <div className="onb-right">
        <div className="step-meta">{s.eyebrow}</div>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
        {s.body}
        <div className="onb-nav">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step-1)}>← Atrás</button>}
          <button className="btn" style={{background:'var(--ink)'}} onClick={() => step < 3 ? setStep(step+1) : done()}>
            {step < 3 ? 'Continuar →' : 'Entrar en Solid →'}
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
function PathView() {
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
            <button className="goto">
              {b.type === 'taller' ? 'Ver taller' : b.type === 'autodiag' ? (b.s === 'done' ? 'Ver resultado' : 'Iniciar test') : b.s === 'done' ? 'Revisar' : b.s === 'current' ? 'Continuar →' : 'Ver bloque'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Profile ----------
function Profile() {
  const cells = Array.from({length: 98}, (_, i) => {
    const r = Math.sin(i * 2.3) + Math.cos(i * 0.7);
    return r > 0.8 ? 'l3' : r > 0.2 ? 'l2' : r > -0.4 ? 'l1' : '';
  });
  return (
    <div className="profile-root">
      <header className="profile-head">
        <div className="big-av" style={{background:'var(--repsol-red)'}}>A</div>
        <div>
          <span className="role">Publish Agent · Repsol</span>
          <h1>Amaia <em>Ruiz</em></h1>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="n">7</div><div className="l">Módulos completados</div></div>
          <div className="profile-stat"><div className="n">58%</div><div className="l">Certificación</div></div>
          <div className="profile-stat"><div className="n">3h</div><div className="l">Tiempo de formación</div></div>
        </div>
      </header>
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
  const [toggles, setToggles] = useS2([true, true, false, true]);
  const toggle = (i) => setToggles(ts => ts.map((v, idx) => idx === i ? !v : v));
  const options = [
    { t: 'Módulo diario en WhatsApp, 9:00', d: 'Un mensaje cada mañana con tu próximo módulo de Sprinklr. Sin ruido.' },
    { t: 'Briefs antes de reuniones Sprinklr', d: '30 min antes de cualquier sesión del calendario relacionada con Sprinklr, te llega el módulo más relevante.' },
    { t: 'Respuestas del agente IA por WhatsApp', d: 'Pregunta al agente directamente desde WhatsApp. Solo responde cuando tú preguntas.' },
    { t: 'Resumen semanal (viernes, 17:00)', d: 'Qué módulos completaste, tu progreso en la certificación y qué viene la semana siguiente.' },
  ];
  return (
    <div className="wa-root">
      <div>
        <div className="wa-head">
          <div className="lms-hero-eyebrow" style={{marginBottom:12}}><span className="repsol-dot"/>Repsol · Formación Sprinklr</div>
          <h1>Tu formación,<br/>donde <em>estés</em>.</h1>
          <p>Solid funciona en la web y en WhatsApp. La plataforma es donde completas módulos y consultas el catálogo. WhatsApp es el recordatorio inteligente que te mantiene en el camino hacia la certificación.</p>
        </div>
        <div className="wa-toggles">
          {options.map((x, i) => (
            <div key={i} className={`wa-toggle ${toggles[i] ? 'on' : ''}`} onClick={() => toggle(i)} style={{cursor:'pointer'}}>
              <div>
                <div className="t">{x.t}</div>
                <div className="d">{x.d}</div>
              </div>
              <div className="sw"/>
            </div>
          ))}
        </div>
      </div>
      <div className="wa-phone">
        <div className="wa-screen">
          <div className="wa-bar">
            <div className="av" style={{background:'var(--accent-glow)', color:'var(--ink)'}}>S</div>
            <div>
              <div className="t">MENTOR-IA · Solid Sprinklr</div>
              <div className="s">en línea · 9:00</div>
            </div>
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
            <div className="wa-msg me">¿Cómo programo un post recurrente?
              <div className="time">9:03</div>
            </div>
            <div className="wa-msg">En Sprinklr, ve a <b>Publish → Queue</b> y activa la opción de recurrencia al crear el post. Puedes definir frecuencia diaria, semanal o personalizada.
              <div className="time">9:03</div>
            </div>
            <div className="wa-msg me">Perfecto, gracias
              <div className="time">9:04</div>
            </div>
            <div className="wa-msg">¡De nada! Cuando termines el módulo te desbloquea el de <b>Monitorización</b>. 💪
              <div className="time">9:04</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Analytics Dashboard ----------
function Dashboard() {
  const [checks, setChecks] = useS2([true, true, false, false, false, false]);
  const toggleCheck = (i) => setChecks(c => c.map((v, idx) => idx === i ? !v : v));
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

  return (
    <div className="dash-root">
      <div className="dash-header">
        <div className="lms-hero-eyebrow"><span className="repsol-dot"/>Repsol · Dashboard de formación</div>
        <h1>Analytics <em>Sprinklr</em></h1>
        <div className="dash-sub">Cohorte activa · 247 usuarios · Actualizado hace 2 min</div>
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

      <div className="dash-grid">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Drop-off por minuto · Módulo activo</h3>
            <span className="panel-sub">Crear y gestionar campañas — 4 min</span>
          </div>
          <div className="dash-panel-body">
            <div className="dropoff-chart">
              {dropoff.map((v, i) => (
                <div key={i} className={`dropoff-bar${v < 40 ? ' drop' : ''}`} style={{height: v + '%'}} title={`${Math.floor(i/6)}:${String((i%6)*10).padStart(2,'0')} — ${v}% retenidos`}/>
              ))}
            </div>
            <div className="dropoff-axis"><span>0:00</span><span>1:00</span><span>2:00</span><span>3:00</span><span>4:00</span></div>
            <div className="dropoff-legend">
              <span><i style={{background:'var(--beonit-blue)'}}/> Retención</span>
              <span><i style={{background:'var(--repsol-red)'}}/> Drop-off (&lt;40%)</span>
            </div>
          </div>
        </div>
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Completación por módulo</h3>
            <span className="panel-sub">% usuarios que terminaron</span>
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
      </div>

      <div className="dash-grid-3">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h3>Checklist de aprendizaje</h3>
            <span className="panel-sub">Amaia Ruiz</span>
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
        <div className="dash-panel" style={{gridColumn:'span 2'}}>
          <div className="dash-panel-head">
            <h3>Usuarios activos</h3>
            <span className="panel-sub">Progreso individual</span>
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
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-head">
          <h3>Actividad reciente</h3>
          <span className="panel-sub">Últimas 24 horas</span>
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
      </div>
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
      </div>
    </div>
  );
}

Object.assign(window, { Detail, Player, AISidekick, Coach, Onboarding, PathView, Profile, WhatsApp, Dashboard, Cronograma });
