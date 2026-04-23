// prototype-views.jsx — Detail, Player, Coach, Onboarding, Path, Profile, WhatsApp (es)

const { useState: useS2, useEffect: useE2 } = React;

// ---------- Detail ----------
function Detail({ item, openPlayer, back }) {
  const it = item || PILLS[0];
  const chapters = [
    { n: 1, t: 'Por qué decir "no" duele en el trabajo', d: 'El modelo mental tras la evitación.', done: true },
    { n: 2, t: 'Tres plantillas de no-suave', d: 'Redirige, replantea, reprograma.', done: true },
    { n: 3, t: 'Cuando la petición sí es buena', d: 'Distinguir encaje de volumen.', current: true },
    { n: 4, t: 'Escríbelo una sola vez', d: 'Tu canon personal del no.' },
    { n: 5, t: 'El seguimiento que se queda', d: '24 horas después, ¿qué dices?' },
  ];
  return (
    <>
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-poster"><div className="ph plum">portada</div></div>
          <div className="detail-head">
            <span className="eyebrow eye">Serie · Comunicación</span>
            <h1>Decir no sin<br/>decir "no".</h1>
            <p className="lead">Una serie de cinco píldoras sobre el arte silencioso de declinar — sin la disculpa, sin el email de 200 palabras, sin quemar la relación.</p>
            <div className="detail-meta-row">
              <span>5 PÍLDORAS</span><span className="sep">·</span>
              <span>14 MIN EN TOTAL</span><span className="sep">·</span>
              <span>MARTA ALCÁZAR</span><span className="sep">·</span>
              <span>★ 4.8 · 2.1K TERMINADAS</span>
            </div>
            <div className="detail-cta-row">
              <button className="btn glow" onClick={openPlayer}><Icon name="play" size={14}/> Empezar · 3 min</button>
              <button className="btn ghost"><Icon name="bookmark" size={14}/> Guardar</button>
              <button className="btn ghost"><Icon name="sparkle" size={14}/> Pregunta al coach</button>
            </div>
          </div>
        </div>
      </section>
      <div className="detail-body">
        <div className="detail-outline">
          <h3>Qué hay dentro</h3>
          {chapters.map(c => (
            <div key={c.n} className={`outline-item ${c.done ? 'done' : ''} ${c.current ? 'current' : ''}`} onClick={openPlayer}>
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
              <div className="av"><div className="ph sand" style={{position:'absolute',inset:0,borderRadius:'50%'}}/></div>
              <div>
                <div className="name">Marta Alcázar</div>
                <div className="bio">Ex-COO. Imparte más de 40 píldoras sobre comunicación y decisiones.</div>
              </div>
            </div>
          </div>
          <div>
            <h3>El coach dice</h3>
            <div style={{padding:'14px 16px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, lineHeight:1.5}}>
              "Con tu 1:1 del jueves con Pablo en mente, el capítulo 3 — 'Cuando la petición sí es buena' — es probablemente el más útil para terminar primero."
            </div>
          </div>
          <div>
            <h3>Si te gustó esto</h3>
            <div className="related-list">
              {SERIES.slice(0,3).map(s => (
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
function Player({ back }) {
  const [playing, setPlaying] = useS2(true);
  const chapters = [
    { n: 1, t: 'Por qué duele decir "no"', d: '0:00 · 3:02', tone: 'plum' },
    { n: 2, t: 'Tres plantillas', d: '3:02 · 2:48', tone: 'clay' },
    { n: 3, t: 'Peticiones buenas', d: '5:50 · 3:11', tone: 'warm', active: true },
    { n: 4, t: 'Escribirlo', d: '9:01 · 2:30', tone: 'olive' },
    { n: 5, t: 'El seguimiento', d: '11:31 · 2:29', tone: 'teal' },
  ];
  return (
    <div className="player-root">
      <div className="player-stage">
        <div className="ph plum">vídeo</div>
        <div className="player-overlay-top">
          <button className="back" onClick={back}><Icon name="back" size={12}/> Volver a la serie</button>
          <div style={{display:'flex', gap:8}}>
            <button className="back"><Icon name="caption" size={12}/> SUB</button>
            <button className="back">Notas IA activas</button>
          </div>
        </div>
        <div className="player-overlay-bottom">
          <div className="title-row">
            <div>
              <div className="t-eyebrow">Capítulo 3 de 5 · Decir no sin decir "no"</div>
              <div className="title">Cuando la petición sí es buena.</div>
              <div className="sub">MARTA ALCÁZAR · 03:11 · QUEDAN 00:52 EN EL CAPÍTULO</div>
            </div>
          </div>
          <div className="scrubber"><i style={{width:'38%'}}/><b/></div>
          <div className="player-controls">
            <button><Icon name="skip" size={18} /></button>
            <button className="play" onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play'} size={20}/></button>
            <button><Icon name="next" size={18}/></button>
            <button className="pill-btn">1.0×</button>
            <button className="pill-btn active">Pregunta IA</button>
            <button><Icon name="vol" size={18}/></button>
            <span className="time">06:42 / 14:00</span>
          </div>
        </div>
      </div>
      <div className="player-chapter-bar">
        {chapters.map(c => (
          <div key={c.n} className={`pchap ${c.active ? 'active' : ''}`}>
            <div className="thumb"><div className={`ph ${c.tone}`}/></div>
            <div>
              <div className="n">CAPÍTULO {String(c.n).padStart(2,'0')}</div>
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
function AISidekick({ setAIMode, aiMode, view, currentPill }) {
  const [input, setInput] = useS2('');
  return (
    <aside className="ai">
      <div className="ai-head">
        <div className="ai-head-left">
          <span className="orb"/>
          <div>
            <div className="title">Coach</div>
            <div className="sub">Leyendo capítulo 3</div>
          </div>
        </div>
        <button className="collapse" onClick={() => setAIMode(aiMode === 'hero' ? 'companion' : 'hero')} title="Ampliar / reducir">
          {aiMode === 'hero' ? '— Reducir' : '↔ Ampliar'}
        </button>
        <button className="collapse" onClick={() => setAIMode('collapsed')}>× Ocultar</button>
      </div>
      <div className="ai-body">
        {view === 'player' && (
          <div className="ai-context-card">
            <div className="thumb"><div className="ph plum"/></div>
            <div className="meta">
              <span className="eyebrow">Viendo</span>
              <div className="t">Cuando la petición sí es buena.</div>
            </div>
          </div>
        )}
        <div className="ai-msg from-ai">
          <span className="who">Coach · 10:42</span>
          <div className="bubble">
            Buenos días, Amaia. Terminaste <em>Feedback: actúa, no etiquetes</em> el viernes.
            Te preparé <span className="hl">tres píldoras</span> que encajan con tu 1:1 del jueves con Pablo.
          </div>
        </div>
        <div className="ai-suggest">
          <div className="thumb"><div className="ph clay"/></div>
          <div className="meta">
            <div className="t">Decir no sin decir "no"</div>
            <div className="s">3 min · Marta Alcázar · Comunicación</div>
          </div>
        </div>
        <div className="ai-suggest">
          <div className="thumb"><div className="ph olive"/></div>
          <div className="meta">
            <div className="t">La hora que multiplica</div>
            <div className="s">3 min · L. Tavares · Foco</div>
          </div>
        </div>
        <div className="ai-chip-row">
          <button className="ai-chip">Resume lo que acabo de ver</button>
          <button className="ai-chip">Dame el TL;DR</button>
          <button className="ai-chip">Hazme un quiz de 3 preguntas</button>
          <button className="ai-chip">Convierte esto en un playbook</button>
        </div>
        <div className="ai-msg from-me">
          <span className="who">Tú · 10:44</span>
          <div className="bubble">¿Qué debería preparar para el 1:1 del jueves con Pablo?</div>
        </div>
        <div className="ai-msg from-ai">
          <span className="who">Coach · 10:44</span>
          <div className="bubble">
            Tres minutos ahora, tres el miércoles. Empieza con <em>Feedback: actúa, no etiquetes</em> — la guardaste la semana pasada. Luego el capítulo 3 que tienes abierto. El miércoles te mando un recordatorio de una línea por WhatsApp.
            <div className="ai-chip-row" style={{marginTop:10}}>
              <button className="ai-chip">Añadir a la ruta</button>
              <button className="ai-chip">Programar recordatorio</button>
            </div>
          </div>
        </div>
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pregúntale al coach lo que sea…"/>
          <button className="send"><Icon name="send" size={14}/></button>
        </div>
        <div className="ai-footer-row">
          <span className="hint">Contexto: píldora actual · tu ruta · últimos 7 días</span>
          <span className="hint">⌘ ↵</span>
        </div>
      </div>
    </aside>
  );
}

// ---------- Coach fullscreen ----------
function Coach() {
  return (
    <div className="coach-root">
      <aside className="coach-side">
        <div>
          <h3>Hoy</h3>
          <div className="coach-hist-item active">
            <div className="t">Preparar el 1:1 del jueves</div>
            <div className="d">HACE 2 MIN</div>
          </div>
          <div className="coach-hist-item">
            <div className="t">Resumen de la píldora "Feedback"</div>
            <div className="d">09:12</div>
          </div>
        </div>
        <div>
          <h3>Esta semana</h3>
          <div className="coach-hist-item">
            <div className="t">¿Qué es un buen OKR de Q2?</div>
            <div className="d">LUN</div>
          </div>
          <div className="coach-hist-item">
            <div className="t">Quiz sobre Trabajo Profundo</div>
            <div className="d">DOM</div>
          </div>
          <div className="coach-hist-item">
            <div className="t">Convierte esto en plantilla</div>
            <div className="d">SÁB</div>
          </div>
        </div>
      </aside>
      <div className="coach-main">
        <div className="eyebrow">Coach · 10:44</div>
        <div className="coach-greeting">
          Buenos días, <em>Amaia</em>.<br/>
          Tienes <span className="glow">tres minutos</span> antes del stand-up.
        </div>
        <div style={{fontFamily:'var(--serif)', fontSize:17, lineHeight:1.55, color:'var(--ink-3)', maxWidth:'60ch'}}>
          Seleccioné una píldora que encaja con tu 1:1 del jueves, y una serie corta para la próxima semana. Elige una — o dime en qué quieres trabajar.
        </div>
        <div className="coach-actions">
          <div className="coach-action">
            <span className="eyebrow">Píldora · 3 min</span>
            <div className="t">Decir no sin decir "no"</div>
            <div className="d">Porque señalaste "feedback difícil" en el onboarding.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Serie · 14 min</span>
            <div className="t">El operador silencioso</div>
            <div className="d">Cuatro de cinco ya vistos por tus compañeros de BeonIt.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Resumen</span>
            <div className="t">Qué aprendí la semana pasada</div>
            <div className="d">Un resumen de una página con las siete píldoras que terminaste.</div>
          </div>
          <div className="coach-action">
            <span className="eyebrow">Quiz · 90 seg</span>
            <div className="t">Tres preguntas sobre Feedback</div>
            <div className="d">Chequeo de retención — tu racha es de 11 días.</div>
          </div>
        </div>
        <div className="coach-input-shell">
          <textarea placeholder="¿Qué tienes en mente hoy?"/>
          <div className="coach-input-tools">
            <button className="tool">＋ Adjuntar píldora</button>
            <button className="tool">＋ Mi calendario</button>
            <button className="tool">＋ Voz</button>
            <button className="btn sm send">Preguntar al coach →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Onboarding ----------
function Onboarding({ done = () => {} }) {
  const [step, setStep] = useS2(0);
  const [selected, setSelected] = useS2(new Set(['Liderazgo', 'Comunicación']));
  const [cadence, setCadence] = useS2(5);
  const topics = ['Liderazgo', 'Comunicación', 'Toma de decisiones', 'Contratación', 'Trabajo profundo', 'Estrategia', 'Feedback', 'Escritura', 'Reuniones', 'Producto', 'Fluidez en IA', 'Negociación'];
  const toggle = (t) => { const n = new Set(selected); n.has(t) ? n.delete(t) : n.add(t); setSelected(n); };
  const steps = [
    {
      eyebrow: '01 · De 04', title: <>¿Qué quieres <em>afilar</em> primero?</>,
      lead: 'Elige tres o más. Tu coach los usa para traerte las primeras píldoras — puedes cambiarlos cuando quieras.',
      body: (
        <div className="onb-chips">
          {topics.map(t => (
            <button key={t} className={`onb-chip ${selected.has(t) ? 'sel' : ''}`} onClick={() => toggle(t)}>
              <span className="mark"/>{t}
            </button>
          ))}
        </div>
      )
    },
    {
      eyebrow: '02 · De 04', title: <>¿Cuántos <em>minutos</em> al día?</>,
      lead: 'Una píldora son tres minutos. Responder con honestidad te da una ruta realista, no una culpa.',
      body: (
        <div className="cadence-grid">
          {[{n:3, t:'Una píldora', d:'Lun–Vie · 3 min / día'}, {n:5, t:'Una + cortos', d:'Lun–Vie · 5 min / día'}, {n:15, t:'Modo maratón', d:'Cualquier día · 15 min'}].map(c => (
            <div key={c.n} className={`cadence-card ${cadence === c.n ? 'sel' : ''}`} onClick={() => setCadence(c.n)}>
              <span className="n">{c.n}<span style={{fontSize:14, marginLeft:4}}>min</span></span>
              <span className="t">{c.t}</span>
              <span className="d">{c.d}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      eyebrow: '03 · De 04', title: <>¿Dónde te <em>buscamos</em>?</>,
      lead: 'La app es la biblioteca. WhatsApp es el empujón. Apaga cualquiera cuando quieras.',
      body: (
        <div style={{display:'flex', flexDirection:'column', gap:12, maxWidth:520}}>
          {[
            {t:'Píldora diaria en WhatsApp, 9:00', d:'Un solo mensaje. Tres minutos. Sin ruido.', on:true},
            {t:'Abrir la app cuando tenga tiempo', d:'Sin push, sin email, sin culpa.', on:true},
            {t:'Resumen semanal por email, domingo', d:'Qué aprendiste, qué viene ahora.', on:false},
            {t:'Recordatorios del coach antes de reuniones', d:'Desde tu calendario, nunca automático.', on:false},
          ].map((x,i) => (
            <div key={i} className={`wa-toggle ${x.on ? 'on' : ''}`}>
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
      eyebrow: '04 · De 04', title: <>Conoce a tu <em>coach</em>.</>,
      lead: 'Lee lo que terminas, escucha cuando preguntas y no sermonea. Dile hola.',
      body: (
        <div style={{border:'1px solid var(--line)', borderRadius:16, padding:24, maxWidth:560, background:'var(--paper-2)'}}>
          <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.3, marginBottom:14}}>
            "Hola Amaia. A partir de <em>Liderazgo</em> y <em>Comunicación</em>, te abro una ruta de 4 semanas: <span style={{background:'linear-gradient(180deg,transparent 62%,var(--accent-glow) 62%)', padding:'0 2px'}}>Cómo ser manager, de verdad</span>. ¿Te encaja?"
          </div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn glow">Sí — empieza</button>
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
        <span className="tag">SOLID · 01 / 2026</span>
        <div>
          <div className="big-mark">"</div>
          <h2>Una idea,<br/>dominada<br/>en tres<br/>minutos.</h2>
        </div>
        <span className="tag">bienvenida, Amaia</span>
      </div>
      <div className="onb-right">
        <div className="step-meta">{s.eyebrow}</div>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
        {s.body}
        <div className="onb-nav">
          {step > 0 && <button className="btn ghost" onClick={() => setStep(step-1)}>Atrás</button>}
          <button className="btn" onClick={() => step < 3 ? setStep(step+1) : done()}>
            {step < 3 ? 'Continuar' : 'Entrar en Solid'} →
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
    { n: 1, t: 'Nombra las expectativas', d: 'Por qué los managers que nombran el trabajo ganan — dos píldoras para abrir.', dur: '2 PÍLDORAS · 6 MIN', s: 'done' },
    { n: 2, t: 'El 1:1 semanal', d: 'Una agenda que sí funciona. Plantillas incluidas.', dur: '3 PÍLDORAS · 9 MIN', s: 'done' },
    { n: 3, t: 'Feedback: actúa, no etiquetes', d: 'De la serie "El operador silencioso". Ya lo tenías guardado.', dur: '4 PÍLDORAS · 12 MIN', s: 'current' },
    { n: 4, t: 'Conversaciones difíciles', d: 'Decir lo incómodo, a propósito, a tiempo.', dur: '3 PÍLDORAS · 9 MIN' },
    { n: 5, t: 'Delegar sin desviarse', d: 'Cómo soltar algo y no volver a agarrarlo el viernes.', dur: '3 PÍLDORAS · 9 MIN' },
    { n: 6, t: 'Dirigir una decisión', d: 'Memo, reunión, voto — y cuándo usar cuál.', dur: '4 PÍLDORAS · 12 MIN' },
    { n: 7, t: 'Contratar sin sesgos', d: 'Una ruta lateral corta — promocionable a su propio itinerario.', dur: '3 PÍLDORAS · 9 MIN' },
    { n: 8, t: 'El manager silencioso', d: 'Píldora de graduación. Escrita por tu coach a partir de tu ruta.', dur: '1 PÍLDORA · 3 MIN' },
  ];
  return (
    <div className="path-root">
      <section className="path-hero">
        <div>
          <span className="eyebrow">Ruta · Semana 4 / 8</span>
          <h1>Cómo ser<br/><em>manager, de verdad</em>.</h1>
          <p>Un viaje de 24 píldoras sobre management que no dora la píldora. Construido con la biblioteca de SOLID y las elecciones de tu coach — editable, pausable y tuyo.</p>
          <div className="path-stats">
            <div className="path-stat"><div className="n">24</div><div className="l">Píldoras</div></div>
            <div className="path-stat"><div className="n">2h 12m</div><div className="l">Tiempo total</div></div>
            <div className="path-stat"><div className="n">8</div><div className="l">Semanas</div></div>
            <div className="path-stat"><div className="n">42%</div><div className="l">Completado</div></div>
          </div>
        </div>
        <div className="path-visual">
          <div className="ph warm">portada de ruta</div>
          <div className="path-visual-badge">En curso</div>
        </div>
      </section>
      <div className="path-map">
        {nodes.map(node => (
          <div key={node.n} className={`path-node ${node.s || ''}`} data-n={node.n}>
            <div>
              <h3>{node.t}</h3>
              <p className="d">{node.d}</p>
              <div className="meta-row"><span>{node.dur}</span>{node.s === 'current' && <span style={{color:'var(--ink)'}}>· ▶ LO SIGUIENTE</span>}</div>
            </div>
            <button className="goto">{node.s === 'done' ? 'Revisar' : node.s === 'current' ? 'Continuar' : 'Ver avance'}</button>
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
    const l = r > 0.8 ? 'l3' : r > 0.2 ? 'l2' : r > -0.4 ? 'l1' : '';
    return l;
  });
  return (
    <div className="profile-root">
      <header className="profile-head">
        <div className="big-av">A</div>
        <div>
          <span className="role">Design Lead · BeonIt</span>
          <h1>Amaia <em>Ruiz</em></h1>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="n">11</div><div className="l">Días de racha</div></div>
          <div className="profile-stat"><div className="n">142</div><div className="l">Píldoras terminadas</div></div>
          <div className="profile-stat"><div className="n">3</div><div className="l">Rutas activas</div></div>
        </div>
      </header>
      <div className="profile-grid">
        <section className="profile-section">
          <h2>Últimas 14 semanas</h2>
          <div className="streak-viz">
            {cells.map((l,i) => <div key={i} className={`streak-cell ${l}`}/>)}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:10, fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
            <span>12 ene</span><span>20 abr</span>
          </div>
          <h2 style={{marginTop:36}}>Lo que terminaste</h2>
          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {[
              {t:'Feedback: actúa, no etiquetes', d:'Vie · 3 min'},
              {t:'La regla de las 2 pizzas, revisitada', d:'Jue · 3 min'},
              {t:'Stand-up de una línea', d:'Mié · :52'},
              {t:'Cuartos propios (podcast)', d:'Mar · 38 min'},
              {t:'Entrega menos, aprende más · Ep. 3', d:'Lun · 5 min'},
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
              {t:'Primera píldora', d:'12 ene', e:true, em:'①'},
              {t:'Racha de 10 días', d:'01 abr', e:true, em:'⚡'},
              {t:'Primera ruta', d:'20 feb', e:true, em:'◇'},
              {t:'Maratón nocturno', d:'14 mar', e:true, em:'◐'},
              {t:'Ave nocturna', d:'Bloqueada', em:'☾'},
              {t:'Charla con coach', d:'Bloqueada', em:'✦'},
              {t:'Racha de 30 días', d:'19 / 30', em:'⚡⚡'},
              {t:'Fin de serie', d:'Bloqueada', em:'▦'},
            ].map((b,i) => (
              <div key={i} className={`badge ${b.e ? 'earned' : ''}`}>
                <div className="em">{b.em}</div>
                <div className="t">{b.t}</div>
                <div className="d">{b.d}</div>
              </div>
            ))}
          </div>
          <h2 style={{marginTop:32}}>Tu canon</h2>
          <div style={{padding:18, border:'1px solid var(--line)', borderRadius:14, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, lineHeight:1.55, color:'var(--ink-2)'}}>
            "Las reuniones terminan cuando se toma la decisión, no cuando acaba la hora."<br/>
            <span style={{fontFamily:'var(--mono)', fontStyle:'normal', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>Guardado de · El operador silencioso, Ep. 2</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- WhatsApp handoff ----------
function WhatsApp() {
  return (
    <div className="wa-root">
      <div>
        <div className="wa-head">
          <span className="eyebrow">Multi-canal</span>
          <h1>Tu <em>empujón</em>, no tu biblioteca.</h1>
          <p>Solid empezó en WhatsApp — y seguimos ahí. La app es donde descubres, maratoneas y buscas. WhatsApp se queda con lo que mejor hace: una píldora de tres minutos en el momento justo.</p>
        </div>
        <div className="wa-toggles">
          {[
            {t:'Píldora diaria, 9:00', d:'Un mensaje. Tres minutos. Basado en tu ruta.', on:true},
            {t:'Briefs antes de reuniones', d:'30 min antes de una coincidencia del calendario, una píldora relacionada.', on:true},
            {t:'Pings del coach', d:'Solo cuando preguntas. Nunca automáticos.', on:false},
            {t:'Resumen semanal', d:'Domingo por la tarde. Qué aprendiste, qué viene.', on:true},
          ].map((x,i) => (
            <div key={i} className={`wa-toggle ${x.on ? 'on' : ''}`}>
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
            <div className="av">S</div>
            <div>
              <div className="t">Solid Coach</div>
              <div className="s">en línea · 9:00</div>
            </div>
          </div>
          <div className="wa-chat">
            <div className="wa-msg">Buenos días, Amaia ☀️ ¿Tres minutos antes del stand-up?
              <div className="time">9:00</div>
            </div>
            <div className="wa-msg" style={{padding:6}}>
              <div className="pill-card">
                <div className="thumb"><div className="ph plum">píldora</div></div>
                <div className="meta">
                  <div className="t">Decir no sin decir "no"</div>
                  <div className="s">Píldora · 3 min · M. Alcázar</div>
                </div>
              </div>
              <span className="wa-cta">▶ Ver en Solid</span>
              <div className="time">9:00</div>
            </div>
            <div className="wa-msg me">Mándame mejor el TL;DR
              <div className="time">9:02</div>
            </div>
            <div className="wa-msg">Tres plantillas para decir no sin quemar la relación:
              <br/>· <b>Redirige</b> — "Yo no, pero Pablo es el indicado."
              <br/>· <b>Replantea</b> — "Sí, si recortamos X."
              <br/>· <b>Reprograma</b> — "Este sprint no. El siguiente."
              <div className="time">9:02</div>
            </div>
            <div className="wa-msg me">Guárdalo en mi canon
              <div className="time">9:03</div>
            </div>
            <div className="wa-msg">Guardado ✓ Lo verás en <b>Perfil → Tu canon</b>.
              <div className="time">9:03</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Detail, Player, AISidekick, Coach, Onboarding, PathView, Profile, WhatsApp });
