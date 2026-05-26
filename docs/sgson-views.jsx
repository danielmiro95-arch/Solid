/* ============================================================
   SGS|on · Redesign Sidebar overlay + Detail modal
   Wrapper de los componentes del mockup adaptado al SaaS actual.
   Datos vía window.SGS_DATA (alimentado por sgson-adapter.jsx).
   ============================================================ */

const { useState: useSV, useEffect: useEV } = React;

// Slug helper · convierte "Social Publish" → "social-publish"
const catSlug = (s) => String(s || '').toLowerCase().replace(/\s+/g, '-');
// Para Analytics y Care el slug colisiona con tonalidades del rediseño; usamos -real para diferenciar
const catSlugFix = (s) => {
  const x = catSlug(s);
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

/* ============================================================
   Sidebar overlay
   ============================================================ */
function SidebarOverlay({ open, onClose, view, onView }) {
  if (!open) return null;
  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  if (!D) return null;
  const { SIDEBAR_LINKS, USER } = D;
  const isAdmin = !!(USER && USER.isAdmin);

  // ESC para cerrar
  useEV(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <React.Fragment>
      <div className="sb-backdrop" onClick={onClose}/>
      <aside className="sb-overlay" data-screen-label="Sidebar overlay">
        <div className="sb-head">
          {window.Wordmark ? <Wordmark variant="v1"/> : <span className="wordmark v1"><span className="sgs">SGS</span><span className="pipe">|</span><span className="on">on</span></span>}
          <button className="sb-close" onClick={onClose} aria-label="Cerrar"><Ico name="close" size={16}/></button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">Navegación</div>
          {SIDEBAR_LINKS.filter(l => !l.admin || isAdmin).map(l => (
            <button
              key={l.key}
              className={`sb-link ${view === l.key ? 'active' : ''}`}
              onClick={() => { onView(l.key); onClose(); }}>
              <span className="icon"><Ico name={l.icon} size={16}/></span>
              {l.label}
              {l.count ? <span className="count">{l.count}</span> : null}
            </button>
          ))}
        </div>

        <div className="sb-foot">
          <span className="avatar">{USER.initials}</span>
          <div className="who">
            <div className="n">{USER.name}</div>
            <div className="r">{USER.role}</div>
          </div>
          <button className="sb-close" aria-label="Opciones"><Ico name="dots" size={16}/></button>
        </div>
      </aside>
    </React.Fragment>
  );
}

/* ============================================================
   Detail modal · slide-up cinematográfico
   ============================================================ */
function DetailModal({ pill, onClose, openPlayer }) {
  if (!pill) return null;
  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const PILLS = (D && D.PILLS) || [];
  const CATS  = (D && D.CATS) || {};
  const cat = CATS[pill.category] || { label: pill.category || 'Módulo' };
  const slug = catSlugFix(pill.category);
  const related = PILLS.filter(p => p.category === pill.category && p.id !== pill.id).slice(0, 4);

  // ESC + lock body scroll
  useEV(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const goPlay = () => { onClose(); openPlayer && openPlayer(pill); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} data-screen-label="Detail modal">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Ico name="close" size={18}/></button>

        <div className="modal-media">
          <div className={`modal-media-inner cover-${slug}`}/>
          <div className="hero-overlay"/>
          <div className="modal-hero-body">
            <div className="hero-eyebrow" style={{ marginBottom: 14 }}>
              <span className="pillmark">Think Pill · {pill.pill}</span>
              <span className="sep"/>
              <span className="meta">{cat.label}</span>
            </div>
            <h2 className="h">{pill.title}</h2>
            <p className="q">"{pill.one}."</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={goPlay}><Ico name="play" size={16}/> Reproducir</button>
              <button className="btn btn-icon btn-ghost" aria-label="Añadir"><Ico name="plus" size={18}/></button>
              <button className="btn btn-icon btn-ghost" aria-label="Me gusta"><Ico name="thumb" size={16}/></button>
              <button className="btn btn-icon btn-ghost" aria-label="Sonido"><Ico name="mute" size={16}/></button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div>
            <div className="meta-row">
              <span className="match">{Math.round(78 + (pill.id * 17) % 22)}% afinidad</span>
              <span>2026</span>
              <span className="lvl">{pill.level}</span>
              <span>{pill.duration}</span>
              <span>★ {pill.rating && pill.rating.toFixed ? pill.rating.toFixed(1) : pill.rating}</span>
            </div>
            <p>
              {pill.one}. En esta pill de {pill.duration} vas a dominar el flujo completo dentro de Sprinklr:
              desde la configuración inicial hasta el caso real con métricas. Pensado para perfiles {String(pill.level).toLowerCase()},
              con ejemplos del día a día en Repsol y plantillas listas para clonar.
            </p>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>
              Aplica directamente en tu cuenta de Sprinklr. Materiales descargables incluidos.
            </p>
          </div>
          <aside className="modal-side">
            <div className="lbl">Profesor / Mentora</div>
            <div className="val">{pill.teacher}</div>

            <div className="lbl">Etiquetas</div>
            <div className="val" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['sprinklr', String(cat.label).toLowerCase(), String(pill.level).toLowerCase(), 'repsol'].map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 8px', border:'1px solid var(--line)', borderRadius: 'var(--r-pill)', color: 'var(--fg-muted)' }}>
                  #{t}
                </span>
              ))}
            </div>

            <div className="lbl">Personas matriculadas</div>
            <div className="val">{(pill.enrolled || 0).toLocaleString('es-ES')}</div>

            <div className="lbl">Ruta sugerida</div>
            <div className="val">{cat.label} · ruta del módulo</div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="modal-related">
            <h3>Más pills de {cat.label}</h3>
            <div className="grid">
              {related.map(p => {
                const ps = catSlugFix(p.category);
                return (
                  <article key={p.id} className="mini" onClick={(e) => e.stopPropagation()}>
                    <div className={`thumb cover-${ps}`}/>
                    <div className="info">
                      <div className="t">{p.title}</div>
                      <div className="m">Pill {p.pill} · {p.duration} · {p.level}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Coach view (MENTOR-IA) · usa callMentorAPI real
   ============================================================ */
const SUGG = [
  { ico:'spark',  t:'Resume las 3 pills más críticas para mi rol esta semana', s:'Curado por rol y nivel actual', q:'¿Cuáles son las 3 pills más importantes que debería hacer esta semana para mi rol?' },
  { ico:'chart',  t:'¿Cómo construyo un dashboard de share-of-voice?',         s:'Pasos en Sprinklr, en orden',  q:'Explícame paso a paso cómo construir un dashboard de share-of-voice en Sprinklr.' },
  { ico:'route',  t:'Diseña mi ruta de certificación en 4 semanas',           s:'Calendario realista a 30 min/día', q:'Diseña un plan de ruta de certificación en 4 semanas, 30 min al día. Indica qué pill hacer cada día.' },
  { ico:'search', t:'Busca pills sobre flujo de aprobación urgente',          s:'Filtra por nivel intermedio',  q:'¿Qué pills me recomiendas sobre flujo de aprobación urgente de contenido?' },
];

function CoachView() {
  const [hasConv, setHasConv] = useSV(false);
  const [msgs, setMsgs] = useSV([]);
  const [input, setInput] = useSV('');
  const [loading, setLoading] = useSV(false);
  const feedRef = React.useRef(null);

  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const userName = (D && D.USER && D.USER.name) || 'tú';
  const userRole = (D && D.USER && D.USER.role) || 'Publish Agent';
  const firstName = String(userName).split(/\s+/)[0];

  // Threads desde ChatHistory si existe (placeholder si no)
  const threads = React.useMemo(() => {
    const ch = window.ChatHistory && window.ChatHistory.list ? window.ChatHistory.list() : [];
    if (ch.length === 0) {
      return [
        { id:'t1', title:'Configurar listening de campaña', time:'hace 12 min' },
        { id:'t2', title:'Plantilla de respuesta a queja recurrente', time:'hace 1 h' },
      ];
    }
    return ch.slice(0, 8).map(c => ({ id: c.id, title: c.title || c.firstMessage || 'Conversación', time: c.updatedAt ? new Date(c.updatedAt).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '' }));
  }, [hasConv]);

  useEV(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs.length, loading]);

  const send = async (q) => {
    const text = (q || input).trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', text };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setHasConv(true);
    try {
      const reply = await (typeof callMentorAPI === 'function'
        ? callMentorAPI([...msgs, userMsg])
        : Promise.resolve('MENTOR-IA no disponible · revisa la conexión.'));
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', text: 'No he podido procesar la consulta. Inténtalo de nuevo en unos segundos.' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setHasConv(false); setMsgs([]); };

  return (
    <div className="coach" data-screen-label="Coach · MENTOR-IA">
      <aside className="coach-sidebar">
        <button className="coach-new" onClick={reset}>
          Nueva conversación <Ico name="plus" size={14}/>
        </button>

        <div className="sb-section-label" style={{ padding:'0 4px', marginBottom:8 }}>Hoy</div>
        {threads.map((t, i) => (
          <button key={t.id} className={`coach-thread ${i === 0 && hasConv ? 'active' : ''}`} onClick={() => setHasConv(true)}>
            {t.title}
            <span className="when">{t.time}</span>
          </button>
        ))}
      </aside>

      <main className="coach-main">
        <header className="coach-header">
          <div className="avatar-lg">M</div>
          <div>
            <div className="title">MENTOR-IA</div>
            <div className="status">en línea · Claude 4.5 · contexto Repsol</div>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Ico name="sliders" size={16}/></button>
            <button className="icon-btn"><Ico name="dots" size={16}/></button>
          </div>
        </header>

        <div className="coach-feed" ref={feedRef}>
          {!hasConv ? (
            <React.Fragment>
              <div className="coach-welcome">
                <div className="eyebrow"><span className="dot"/>Mentor para tu rol de {userRole}</div>
                <h1>Hola, {firstName}. <span className="you">¿qué quieres dominar hoy?</span></h1>
                <p>Pregunta sobre Sprinklr, tu ruta, métricas de Care, flujos de aprobación o cualquier pill. Cito siempre la fuente.</p>
              </div>

              <div className="coach-suggestions">
                {SUGG.map((s, i) => (
                  <button key={i} className="coach-suggest" onClick={() => send(s.q)}>
                    <div className="ico"><Ico name={s.ico} size={18}/></div>
                    <div className="t">{s.t}</div>
                    <div className="s">{s.s}</div>
                  </button>
                ))}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {msgs.map((m, i) => (
                m.role === 'user' ? (
                  <div key={i} className="msg-user">{m.text}</div>
                ) : (
                  <div key={i} className="msg-ai">
                    <div className="ai-mark">M</div>
                    <div className="body">
                      {String(m.text).split('\n\n').map((p, j) => (
                        <p key={j} style={{margin: j===0 ? '0 0 8px' : '8px 0'}}>{p}</p>
                      ))}
                    </div>
                  </div>
                )
              ))}
              {loading && (
                <div className="msg-ai">
                  <div className="ai-mark">M</div>
                  <div className="body" style={{display:'flex', gap:6, alignItems:'center', padding:'4px 0'}}>
                    <span style={{width:6, height:6, borderRadius:'50%', background:'var(--fg-muted)', animation:'mentorDot 1.4s ease-in-out infinite both'}}/>
                    <span style={{width:6, height:6, borderRadius:'50%', background:'var(--fg-muted)', animation:'mentorDot 1.4s ease-in-out .15s infinite both'}}/>
                    <span style={{width:6, height:6, borderRadius:'50%', background:'var(--fg-muted)', animation:'mentorDot 1.4s ease-in-out .3s infinite both'}}/>
                  </div>
                </div>
              )}
            </React.Fragment>
          )}
        </div>

        <div className="coach-composer">
          <div className="coach-composer-inner">
            <div className="coach-chips">
              <button className="coach-chip" onClick={() => send('Busca pills relacionadas con lo que estoy haciendo ahora.')}>Buscar en pills</button>
              <button className="coach-chip" onClick={() => send('Cita la fuente exacta de tu última respuesta.')}>Citar fuente</button>
              <button className="coach-chip" onClick={() => send('Convierte tu respuesta en un plan en pasos numerados.')}>Plan en pasos</button>
              <button className="coach-chip" onClick={() => send('Genera el layout de un dashboard sobre el tema.')}>Generar dashboard</button>
              <button className="coach-chip" onClick={() => send('Resume mi semana de aprendizaje en SGS|on.')}>Resumir mi semana</button>
            </div>
            <div className="coach-input">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Pregunta a MENTOR-IA…"
              />
              <button className="icon-btn" aria-label="Adjuntar"><Ico name="attach" size={16}/></button>
              <button className="coach-send" aria-label="Enviar" onClick={() => send()} disabled={!input.trim() || loading}><Ico name="send" size={14}/></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Analytics view · KPIs + line + donut + bar + table + heatmap
   Mantiene acceso al Dashboard library legacy vía botón "Mis dashboards"
   ============================================================ */
const _Spark = ({ data, color = 'var(--accent)', height = 30 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / ((max - min) || 1)) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const _LineChart = ({ series, height = 220 }) => {
  const all = series.flatMap(s => s.data);
  const max = Math.max(...all), min = 0;
  const w = 100, h = 100;
  return (
    <div style={{ position: 'relative', height, marginTop: 8 }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        {[0.25,0.5,0.75].map(g => <line key={g} x1="0" y1={h*g} x2={w} y2={h*g} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>)}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => {
            const x = (i / (s.data.length - 1)) * w;
            const y = h - ((v - min) / (max - min)) * h;
            return `${x},${y}`;
          }).join(' ');
          return <polyline key={si} points={pts} fill="none" stroke={s.color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>;
        })}
      </svg>
    </div>
  );
};

const _Donut = ({ data, size = 180 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 40, stroke = 14;
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * 2 * Math.PI * r;
        const offset = -acc * 2 * Math.PI * r;
        acc += frac;
        return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={d.color} strokeWidth={stroke} strokeDasharray={`${dash} ${2 * Math.PI * r}`} strokeDashoffset={offset} transform="rotate(-90 50 50)"/>;
      })}
      <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--fg)" fontFamily="Inter">{total.toLocaleString('es-ES')}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="6" letterSpacing="1.5" fill="var(--fg-dim)" fontFamily="JetBrains Mono">PILLS COMPLETADAS</text>
    </svg>
  );
};

const _Bars = ({ data, color = 'var(--accent)', height = 200 }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 6, height, alignItems: 'end', marginTop: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}>
          <div style={{ width: '100%', height: `${(d.value / max) * 85}%`, background: color, borderRadius: 'var(--r-1) var(--r-1) 0 0', opacity: 0.85 }}/>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.06em' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

const _Heatmap = ({ rows = 7, cols = 24 }) => {
  const seed = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };
  const days = ['L','M','X','J','V','S','D'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${cols}, 1fr)`, gap: 3, marginTop: 8 }}>
      <div/>
      {Array.from({ length: cols }).map((_, c) => (
        <div key={c} style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-dim)', textAlign:'center', letterSpacing:'0.04em' }}>
          {c % 3 === 0 ? String(c).padStart(2,'0') : ''}
        </div>
      ))}
      {Array.from({ length: rows }).map((_, r) => (
        <React.Fragment key={r}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-dim)', alignSelf:'center' }}>{days[r]}</div>
          {Array.from({ length: cols }).map((_, c) => {
            const v = seed(r, c);
            const intensity = v ** 1.5;
            return <div key={c} style={{ height: 22, background: `rgba(236, 28, 36, ${0.06 + intensity * 0.7})`, borderRadius: 2 }}/>;
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

function AnalyticsView({ openLegacyDashboard }) {
  const [active, setActive] = useSV('global');
  const dashboards = [
    { id:'global',  name:'Sprinklr Adoption · Global' },
    { id:'care',    name:'Care Operations · IB' },
    { id:'crisis',  name:'Crisis-mode response · Q1 2026' },
    { id:'lead',    name:'Publish Lead Squad' },
    { id:'onboard', name:'Onboarding 2026 (new joiners)' },
    { id:'mkt',     name:'Mercados — comparativa' },
  ];

  return (
    <div className="analytics" data-screen-label="Analytics">
      <aside className="analytics-sidebar">
        <div className="sb-section-label" style={{ padding:'0 4px 14px' }}>Dashboards</div>
        {dashboards.map(d => (
          <button key={d.id} className={`coach-thread ${active === d.id ? 'active' : ''}`} onClick={() => setActive(d.id)}>
            {d.name}
          </button>
        ))}
        <button className="coach-new" style={{ marginTop: 16 }} onClick={openLegacyDashboard}>
          Mis dashboards (creador) <Ico name="plus" size={14}/>
        </button>

        <div className="sb-section-label" style={{ padding:'24px 4px 8px' }}>Vistas guardadas</div>
        <button className="coach-thread">Q1 acumulado</button>
        <button className="coach-thread">Comparativa rol</button>
        <button className="coach-thread">Engagement orgánico</button>
      </aside>

      <main className="analytics-main">
        <header className="an-pagehead">
          <div>
            <h1>{dashboards.find(d => d.id === active).name}</h1>
            <div className="sub">cómo aprende Repsol esta semana</div>
          </div>
          <div className="an-filters">
            <button className="an-filter"><span className="k">RANGO</span> Últimos 30 días <Ico name="chev-down" size={12}/></button>
            <button className="an-filter"><span className="k">EQUIPO</span> Todos <Ico name="chev-down" size={12}/></button>
            <button className="an-filter"><span className="k">ROL</span> Todos <Ico name="chev-down" size={12}/></button>
            <button className="an-filter"><Ico name="sliders" size={12}/> 12 widgets</button>
          </div>
        </header>

        <div className="an-grid">
          {[
            { title:'Usuarios activos · esta semana', value:'1,847', delta:'↑ 14.2% vs. semana anterior', up:true, spark:[12,18,15,22,28,25,33,42], color:'var(--ok)' },
            { title:'Pills completadas · 7d',         value:'3,210', delta:'↑ 22.8%',                     up:true, spark:[8,14,12,20,18,28,32,38] },
            { title:'Tiempo medio · sesión',          value:'7m 24s', delta:'↓ 0.6%',                     up:false, spark:[28,24,22,20,18,24,26,22], color:'var(--fg-muted)' },
            { title:'NPS plataforma',                 value:'+58',   delta:'↑ 4 pts',                     up:true, spark:[42,48,50,53,54,57,55,58], color:'var(--info)' },
          ].map((k, i) => (
            <div key={i} className="widget kpi">
              <div className="w-head"><div className="w-title">{k.title}</div><button className="w-menu"><Ico name="dots" size={14}/></button></div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-delta ${k.up ? 'up' : 'dn'}`}>{k.delta}</div>
              <div className="kpi-spark"><_Spark data={k.spark} color={k.color}/></div>
            </div>
          ))}

          <div className="widget line">
            <div className="w-head">
              <div>
                <div className="w-title">Adopción por categoría · últimos 30 días</div>
                <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:13, color:'var(--fg-dim)', marginTop:2 }}>completions por día</div>
              </div>
              <button className="w-menu"><Ico name="dots" size={14}/></button>
            </div>
            <_LineChart series={[
              { name:'Publish',   color:'var(--cat-publish)',   data:[12,14,18,22,28,32,30,38,42,45,48,46,52,55,58,62,60,64,68,72,70,75,78,82,80,84,88,92,90,94] },
              { name:'Care',      color:'var(--cat-care)',      data:[8,10,12,16,20,24,28,30,32,28,34,38,40,42,46,48,50,54,56,58,60,62,64,68,70,72,74,76,78,80] },
              { name:'Analytics', color:'var(--cat-analytics)', data:[20,22,26,28,30,28,32,36,38,40,42,44,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82] },
              { name:'Content',   color:'var(--cat-content)',   data:[6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64] },
            ]}/>
            <div className="legend">
              <span><span className="sw" style={{background:'var(--cat-publish)'}}/>Publish</span>
              <span><span className="sw" style={{background:'var(--cat-care)'}}/>Care</span>
              <span><span className="sw" style={{background:'var(--cat-analytics)'}}/>Analytics</span>
              <span><span className="sw" style={{background:'var(--cat-content)'}}/>Content</span>
            </div>
          </div>

          <div className="widget donut">
            <div className="w-head"><div className="w-title">Completions por rol</div><button className="w-menu"><Ico name="dots" size={14}/></button></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1 }}>
              <_Donut data={[
                { label:'Publish Agent', value: 480, color:'var(--cat-publish)' },
                { label:'Care Agent',    value: 620, color:'var(--cat-care)' },
                { label:'Manager',       value: 280, color:'var(--cat-manage)' },
                { label:'Analyst',       value: 340, color:'var(--cat-analytics)' },
                { label:'Content Lead',  value: 220, color:'var(--cat-content)' },
                { label:'Reporting',     value: 180, color:'var(--info)' },
              ]}/>
            </div>
            <div className="legend" style={{ marginTop: 16 }}>
              <span><span className="sw" style={{background:'var(--cat-publish)'}}/>Publish 22%</span>
              <span><span className="sw" style={{background:'var(--cat-care)'}}/>Care 29%</span>
              <span><span className="sw" style={{background:'var(--cat-analytics)'}}/>Analyst 16%</span>
              <span><span className="sw" style={{background:'var(--cat-content)'}}/>Content 10%</span>
              <span><span className="sw" style={{background:'var(--cat-manage)'}}/>Manager 13%</span>
              <span><span className="sw" style={{background:'var(--info)'}}/>Reporting 8%</span>
            </div>
          </div>

          <div className="widget bar">
            <div className="w-head">
              <div>
                <div className="w-title">Top 10 pills · esta semana</div>
                <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:13, color:'var(--fg-dim)', marginTop:2 }}>completions absolutas</div>
              </div>
              <button className="w-menu"><Ico name="dots" size={14}/></button>
            </div>
            <_Bars data={[
              {label:'P04', value:320},{label:'P01', value:280},{label:'P30', value:240},{label:'P13', value:210},{label:'P03', value:190},
              {label:'P10', value:170},{label:'P16', value:150},{label:'P22', value:130},{label:'P02', value:110},{label:'P25', value:95},
            ]}/>
          </div>

          <div className="widget table">
            <div className="w-head">
              <div>
                <div className="w-title">Mercados — adopción comparada</div>
                <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:13, color:'var(--fg-dim)', marginTop:2 }}>cuántos completan al menos su ruta de rol</div>
              </div>
              <button className="w-menu"><Ico name="dots" size={14}/></button>
            </div>
            <table className="an-table">
              <thead>
                <tr><th>Mercado</th><th className="num">Activos</th><th className="num">Pills/usr</th><th className="num">Ruta %</th><th className="num">NPS</th></tr>
              </thead>
              <tbody>
                {[['España',624,4.2,78,62],['Portugal',218,3.8,71,58],['Italia',312,3.6,64,54],['Francia',198,3.1,58,49],['UK',142,2.8,51,44],['LATAM',353,4.0,66,60]].map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="num">{r[1].toLocaleString('es-ES')}</td>
                    <td className="num">{r[2]}</td>
                    <td className="num">{r[3]}%</td>
                    <td className="num" style={{ color: r[4] >= 55 ? 'var(--ok)' : r[4] >= 45 ? 'var(--warn)' : 'var(--accent)' }}>+{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="widget heatmap">
            <div className="w-head">
              <div>
                <div className="w-title">Heatmap de actividad · 7 días × 24 horas</div>
                <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:13, color:'var(--fg-dim)', marginTop:2 }}>cuándo aprende Repsol</div>
              </div>
              <button className="w-menu"><Ico name="dots" size={14}/></button>
            </div>
            <_Heatmap/>
          </div>
        </div>
      </main>
    </div>
  );
}

window.SidebarOverlay = SidebarOverlay;
window.DetailModal = DetailModal;
window.CoachView = CoachView;
window.AnalyticsView = AnalyticsView;
window.catSlugFix = catSlugFix;
