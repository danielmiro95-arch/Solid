/* ============================================================
   SolidStream · Redesign Sidebar overlay + Detail modal
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
   Detail modal · slide-up cinematográfico
   ============================================================ */
function DetailModal({ pill, onClose, openPlayer, openPill }) {
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

  // Bookmark + Like (Ratings 5★) reactivos al state global
  const [saved, setSaved] = useSV(() => window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
  const [liked, setLiked] = useSV(() => {
    const r = window.Ratings && window.Ratings.get && window.Ratings.get(pill.id);
    return typeof r === 'number' ? r >= 4 : !!(r && r.stars >= 4);
  });
  // muted del video del modal media (controla iframe via key change si hubiera; aquí no hay iframe)
  const [muted, setMuted] = useSV(true);
  useEV(() => {
    const onB = () => setSaved(window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
    const onR = (e) => { if (e && e.detail && e.detail.pillId === pill.id) setLiked(e.detail.stars >= 4); };
    window.addEventListener('bookmarks-changed', onB);
    window.addEventListener('ratings-changed', onR);
    return () => { window.removeEventListener('bookmarks-changed', onB); window.removeEventListener('ratings-changed', onR); };
  }, [pill.id]);
  const toggleSave = () => {
    if (!window.Bookmarks) return;
    const isNow = window.Bookmarks.toggle(pill.id);
    if (window.Toast) window.Toast[isNow ? 'success' : 'info'](isNow ? 'Añadido a tu lista' : 'Quitado de tu lista', { icon: isNow ? '➕' : '➖' });
  };
  const toggleLike = () => {
    if (!window.Ratings) return;
    window.Ratings.set(pill.id, liked ? 0 : 5);
    if (window.Toast) window.Toast[liked ? 'info' : 'success'](liked ? 'Sin valoración' : '👍 Me gusta', { icon: liked ? '○' : '👍' });
  };

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
              <button className={`btn btn-icon btn-ghost${saved ? ' is-active' : ''}`} aria-label={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} title={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} onClick={toggleSave}><Ico name={saved ? 'check' : 'plus'} size={18}/></button>
              <button className={`btn btn-icon btn-ghost${liked ? ' is-active' : ''}`} aria-label={liked ? 'Quitar Me gusta' : 'Me gusta'} title={liked ? 'Quitar Me gusta' : 'Me gusta'} onClick={toggleLike}><Ico name="thumb" size={16}/></button>
              <button className="btn btn-icon btn-ghost" aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'} onClick={() => setMuted(m => !m)}><Ico name={muted ? 'mute' : 'volume'} size={16}/></button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div>
            <div className="meta-row">
              <span className="match">{Math.round(78 + ((parseInt(String(pill.id).replace(/\D/g, ''), 10) || 0) * 17) % 22)}% afinidad</span>
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
                  <article key={p.id} className="mini" style={{ cursor: openPill ? 'pointer' : 'default' }} onClick={(e) => { e.stopPropagation(); if (openPill) openPill(p); }}>
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

        {/* Examen práctico · entrega de vídeo Sprinklr (si el módulo lo pide) */}
        {window.VideoSubmissionForm && (
          <div className="modal-submission" style={{ marginTop: 24, padding:'0 32px 28px' }}>
            <window.VideoSubmissionForm pillId={pill.id} pillTitle={pill.title}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Coach view (BeonAI) · usa callMentorAPI real
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
  const [activeChatId, setActiveChatId] = useSV(null);
  const [input, setInput] = useSV('');
  const [loading, setLoading] = useSV(false);
  const [threadsTick, setThreadsTick] = useSV(0);
  const feedRef = React.useRef(null);

  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const userName = (D && D.USER && D.USER.name) || 'tú';
  const userRole = (D && D.USER && D.USER.role) || 'Publish Agent';
  const firstName = String(userName).split(/\s+/)[0];

  // Sync de threads cuando cambia ChatHistory en otra pestaña o vía evento
  useEV(() => {
    const onChange = () => setThreadsTick(t => t + 1);
    window.addEventListener('chats-changed', onChange);
    return () => window.removeEventListener('chats-changed', onChange);
  }, []);

  // Threads desde ChatHistory real · si no hay ninguno mostramos hint
  const threads = React.useMemo(() => {
    const ch = window.ChatHistory && window.ChatHistory.list ? window.ChatHistory.list() : [];
    return ch.slice(0, 12).map(c => ({
      id: c.id,
      title: c.title || (c.messages && c.messages[0] && c.messages[0].text && c.messages[0].text.slice(0, 50)) || 'Conversación',
      time: c.updatedAt ? new Date(c.updatedAt).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '',
    }));
  }, [threadsTick, hasConv]);

  useEV(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs.length, loading]);

  const send = async (q) => {
    const text = (q || input).trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', text, ts: Date.now() };

    // Asegura un chat en historial
    let chatId = activeChatId;
    if (!chatId && window.ChatHistory && window.ChatHistory.create) {
      const chat = window.ChatHistory.create([]);
      chatId = chat.id;
      setActiveChatId(chatId);
    }

    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setHasConv(true);

    if (chatId && window.ChatHistory && window.ChatHistory.appendMessage) {
      try { window.ChatHistory.appendMessage(chatId, userMsg); } catch(e) {}
    }

    try {
      const reply = await (typeof callMentorAPI === 'function'
        ? callMentorAPI([...msgs, userMsg])
        : Promise.resolve('BeonAI no disponible · revisa la conexión.'));
      const aiMsg = { role: 'assistant', text: reply, ts: Date.now() };
      setMsgs(m => [...m, aiMsg]);
      if (chatId && window.ChatHistory && window.ChatHistory.appendMessage) {
        try { window.ChatHistory.appendMessage(chatId, aiMsg); } catch(e) {}
      }
    } catch (e) {
      const errMsg = { role: 'assistant', text: 'No he podido procesar la consulta. Inténtalo de nuevo en unos segundos.', ts: Date.now() };
      setMsgs(m => [...m, errMsg]);
      if (chatId && window.ChatHistory && window.ChatHistory.appendMessage) {
        try { window.ChatHistory.appendMessage(chatId, errMsg); } catch(e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setHasConv(false);
    setMsgs([]);
    setActiveChatId(null);
    if (window.ChatHistory && window.ChatHistory.setActive) window.ChatHistory.setActive(null);
  };

  return (
    <div className="coach" data-screen-label="Coach · BeonAI">
      <aside className="coach-sidebar">
        <button className="coach-new" onClick={reset}>
          Nueva conversación <Ico name="plus" size={14}/>
        </button>

        <div className="sb-section-label" style={{ padding:'0 4px', marginBottom:8 }}>Hoy</div>
        {threads.length === 0 && (
          <div style={{ padding:'18px 8px', fontSize: 12, color:'var(--fg-muted)', textAlign:'center', lineHeight: 1.5 }}>
            Aún no tienes conversaciones.<br/>Empieza una preguntando algo abajo.
          </div>
        )}
        {threads.map(t => (
          <button key={t.id} className={`coach-thread ${activeChatId === t.id ? 'active' : ''}`} onClick={() => {
            const chat = window.ChatHistory && window.ChatHistory.get && window.ChatHistory.get(t.id);
            if (chat && Array.isArray(chat.messages)) {
              setMsgs(chat.messages);
              setActiveChatId(chat.id);
              if (window.ChatHistory && window.ChatHistory.setActive) window.ChatHistory.setActive(chat.id);
              setHasConv(true);
            }
          }}>
            {t.title}
            <span className="when">{t.time}</span>
          </button>
        ))}
      </aside>

      <main className="coach-main">
        <header className="coach-header">
          {window.BeonAIChar ? <BeonAIChar size={42} mood={loading ? 'thinking' : 'neutral'} float interactive={false}/> : <div className="avatar-lg">B</div>}
          <div>
            <div className="title">BeonAI</div>
            <div className="status">en línea · Claude 4.5 · contexto Repsol</div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Limpiar conversación" title="Limpiar conversación" onClick={reset}><Ico name="sliders" size={16}/></button>
            <button className="icon-btn" aria-label="Más opciones" title="Más opciones" onClick={() => window.Toast && window.Toast.info('Configuración del asistente próximamente', { icon:'⚙️' })}><Ico name="dots" size={16}/></button>
          </div>
        </header>

        <div className="coach-feed" ref={feedRef}>
          {!hasConv ? (
            <React.Fragment>
              <div className="coach-welcome">
                {window.BeonAIChar && (
                  <div style={{display:'flex', justifyContent:'center', marginBottom:24}}>
                    <BeonAIChar size={140} mood="happy" float interactive={false}/>
                  </div>
                )}
                <div className="eyebrow"><span className="dot"/>BeonAI · mentor para tu rol de {userRole}</div>
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
                    {window.BeonAIChar ? <div className="ai-mark" style={{padding:0, background:'transparent', boxShadow:'none'}}><BeonAIChar size={32} interactive={false}/></div> : <div className="ai-mark">B</div>}
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
                  {window.BeonAIChar ? <div className="ai-mark" style={{padding:0, background:'transparent', boxShadow:'none'}}><BeonAIChar size={32} mood="thinking" interactive={false}/></div> : <div className="ai-mark">B</div>}
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
              <button className="coach-chip" onClick={() => send('Resume mi semana de aprendizaje en SolidStream.')}>Resumir mi semana</button>
            </div>
            <div className="coach-input">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Pregunta a BeonAI…"
              />
              <button className="icon-btn" aria-label="Adjuntar archivo" title="Adjuntar archivo" onClick={() => window.Toast && window.Toast.info('Adjuntar archivos · próximamente', { icon:'📎' })}><Ico name="attach" size={16}/></button>
              <button className="coach-send" aria-label="Enviar" onClick={() => send()} disabled={!input.trim() || loading}><Ico name="send" size={14}/></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AnalyticsView() {
  // Analytics renderiza directamente el Dashboard creator.
  if (window.Dashboard) {
    return (
      <div className="main-inner" data-screen-label="Analytics" style={{padding:'24px 32px'}}>
        <window.Dashboard/>
      </div>
    );
  }
  return (
    <div className="main-inner" data-screen-label="Analytics" style={{padding:'48px 32px'}}>
      <div style={{ padding: 60, textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>📊</div>
        <h3 style={{ margin:'0 0 6px', color:'var(--fg)' }}>Dashboard no disponible</h3>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Recarga la página para cargar el módulo de analítica.</div>
      </div>
    </div>
  );
}

window.DetailModal = DetailModal;
window.CoachView = CoachView;
window.AnalyticsView = AnalyticsView;
window.catSlugFix = catSlugFix;
