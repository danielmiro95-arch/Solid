/* ============================================================
   SolidStream · Vistas adicionales rediseñadas
   BrowseView, RutasView, MyPathView, ChannelsView, ProfileView,
   SettingsView, AdminView, InboxView, SavedView · todas con tokens
   del rediseño cinematic (sgson.css)
   ============================================================ */

const { useState: useEV2, useEffect: useEE2 } = React;

// Helper común · slug categoría
const _slug = (s) => {
  const x = String(s || '').toLowerCase().replace(/\s+/g, '-');
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

/* ============================================================
   PageShell · contenedor base para todas las vistas
   Aplica padding-top 80 para que no choque con TopNav fixed
   ============================================================ */
function PageShell({ eyebrow, title, sub, actions, children, narrow }) {
  return (
    <div style={{
      padding: '90px 64px 80px',
      maxWidth: narrow ? 1080 : 1400,
      margin: '0 auto',
      color: 'var(--fg)',
      background: 'var(--bg-canvas)',
      minHeight: '100vh',
    }} className="ssg-page">
      <header style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          {eyebrow && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)',
              marginBottom: 12,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
              {eyebrow}
            </div>
          )}
          <h1 style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(34px, 4vw, 48px)',
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, color: 'var(--fg)',
          }}>{title}</h1>
          {sub && <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18,
            color: 'var(--fg-muted)', marginTop: 8, marginBottom: 0,
          }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
      </header>
      {children}
    </div>
  );
}

/* ============================================================
   BrowseView · catálogo con filtro + grid de cards
   ============================================================ */
function BrowseView({ openDetail }) {
  const D = window.SGS_DATA;
  const pills = (D && D.PILLS) || [];
  const allCats = ['Todos', ...Array.from(new Set(pills.map(p => p.category))).filter(Boolean)];
  const [cat, setCat] = useEV2('Todos');
  const filtered = cat === 'Todos' ? pills : pills.filter(p => p.category === cat);

  return (
    <PageShell
      eyebrow="Catálogo completo"
      title={<>Todos los <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>módulos</em></>}
      sub={`${pills.length} Think Pills · BeonIt × Repsol`}>
      {/* Filtro categoría */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32,
        padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-2)', width: 'fit-content',
      }}>
        {allCats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            background: c === cat ? 'var(--fg)' : 'transparent', color: c === cat ? 'var(--bg-canvas)' : 'var(--fg-muted)',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', transition: 'all .15s',
          }}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16,
      }}>
        {filtered.map(p => {
          const slug = _slug(p.category);
          return (
            <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
              <div className={`card-cover cat-${slug}`}/>
              {p.yt && <img src={`https://img.youtube.com/vi/${p.yt}/hqdefault.jpg`} alt="" style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover'}} onError={e => { e.currentTarget.style.display='none'; }}/>}
              <div className="card-grad"/>
              <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
              <div className="card-body">
                <h3 className="card-title">{p.title}</h3>
                <div className="card-meta">
                  <span>{p.duration}</span>
                  <span className="sep">·</span>
                  <span>{p.level}</span>
                </div>
              </div>
              {p.progress > 0 && p.progress < 1 && (
                <div className="card-progress"><div className="fill" style={{width: `${Math.round(p.progress*100)}%`}}/></div>
              )}
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ============================================================
   RutasView · 6 grandes path cards estilo featured
   ============================================================ */
function RutasView({ setView, openDetail }) {
  const D = window.SGS_DATA;
  const paths = (D && D.LEARNING_PATHS) || [];

  return (
    <PageShell
      eyebrow="Rutas de certificación"
      title={<>Especialízate <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>en tu rol</em></>}
      sub="Cada ruta es una secuencia curada · al completarla obtienes el certificado oficial Repsol × BeonIt">

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20,
      }}>
        {paths.map(p => (
          <article key={p.id} className="card" onClick={() => setView('path')} style={{ cursor: 'pointer', aspectRatio: '4/5' }}>
            <div className={`card-cover ${p.accent || 'cat-publish'}`}/>
            <div className="card-grad"/>
            <span className="card-pill-num" style={{ top: 16, left: 16 }}>RUTA · {p.pills} pills · {p.hours}</span>
            <div className="card-body" style={{ left: 20, right: 20, bottom: 18 }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
                fontSize: 28, color: 'var(--fg)', margin: 0, marginBottom: 8, lineHeight: 1.1,
              }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
              <button style={{
                marginTop: 14, padding: '8px 14px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700,
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer',
              }}>Empezar ruta →</button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

/* ============================================================
   MyPathView · progreso del usuario + próximas pills
   ============================================================ */
function MyPathView({ openDetail, setView }) {
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const USER = (D && D.USER) || {};
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1);
  const completed = PILLS.filter(p => p.progress >= 1);
  const next = PILLS.filter(p => p.progress === 0).slice(0, 6);
  const totalProgress = PILLS.length > 0 ? Math.round((completed.length / PILLS.length) * 100) : 0;

  return (
    <PageShell
      eyebrow={`Mi ruta · ${USER.role || 'Usuario'}`}
      title={<>Tu progreso, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{USER.name?.split(' ')[0] || 'crece'}</em></>}
      sub={`${completed.length} de ${PILLS.length} pills completadas · ${totalProgress}% del programa`}>

      {/* Barra de progreso grande */}
      <div style={{
        padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-2)', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Certificación global</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 40, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{totalProgress}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalProgress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 4 }}/>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
        {[
          { label: 'Pills completadas', value: completed.length, color: 'var(--ok)' },
          { label: 'En progreso', value: inProgress.length, color: 'var(--accent)' },
          { label: 'Por empezar', value: PILLS.length - completed.length - inProgress.length, color: 'var(--fg-muted)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'var(--font-sans)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* En progreso */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            Continúa aquí
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {inProgress.map(p => {
              const slug = _slug(p.category);
              return (
                <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                  <div className={`card-cover cat-${slug}`}/>
                  <div className="card-grad"/>
                  <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-meta">
                      <span>{p.duration}</span><span className="sep">·</span><span>{p.level}</span>
                    </div>
                  </div>
                  <div className="card-progress"><div className="fill" style={{width: `${Math.round(p.progress*100)}%`}}/></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Próximas pills sugeridas */}
      {next.length > 0 && (
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            Próximas pills recomendadas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {next.map(p => {
              const slug = _slug(p.category);
              return (
                <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                  <div className={`card-cover cat-${slug}`}/>
                  <div className="card-grad"/>
                  <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-meta">
                      <span>{p.duration}</span><span className="sep">·</span><span>{p.level}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}

/* ============================================================
   ChannelsView · WhatsApp/Teams · keeps storage state
   ============================================================ */
function ChannelsView() {
  // Estado del Channel Manager (canales conectados + canal principal)
  const [chState, setChState] = useEV2(() => (window.Channels ? window.Channels.get() : {}));
  useEE2(() => {
    const onChange = (e) => setChState(e.detail);
    window.addEventListener('channels-changed', onChange);
    return () => window.removeEventListener('channels-changed', onChange);
  }, []);

  const catalog = (window.Channels && window.Channels.CATALOG) || [];
  const primaryId = chState.primary || null;
  const primaryDef = primaryId ? catalog.find(c => c.id === primaryId) : null;
  const channelColor = primaryDef ? primaryDef.color : '#25D366';

  return (
    <PageShell
      eyebrow="Canales de comunicación"
      title={<>Tu formación, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>donde estés</em></>}
      sub="Conecta los canales corporativos por los que quieres recibir contenido. Puedes activar varios a la vez.">

      {/* CHANNEL MANAGER · conectar / desconectar / re-autenticar / marcar principal */}
      <ChannelManagerPanel chState={chState} catalog={catalog}/>

      {/* PREVIEW · cómo se ve el mensaje en tu canal principal */}
      {primaryDef && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap: 32, alignItems:'flex-start', marginTop: 40 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Vista previa en {primaryDef.label}</h2>
            <div style={{ fontSize: 13.5, color:'var(--fg-muted)', lineHeight: 1.55, padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:12 }}>
              Así se verá un mensaje típico de SolidStream en tu canal principal. Configura abajo cuándo lo quieres recibir.
            </div>
          </div>
          <div style={{ background: '#000', border: '1px solid var(--line)', borderRadius: 24, padding: 12, minHeight: 240 }}>
            <div style={{ background: channelColor, padding: 12, borderRadius: 12, color: '#fff', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{primaryId === 'teams' ? 'SolidStream bot · Teams' : primaryId === 'email' ? 'SolidStream · Digest' : 'BeonAI · SolidStream'}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{primaryId === 'teams' ? 'Disponible · 9:00' : primaryId === 'email' ? 'Asunto · Tu pill del día' : 'en línea · 9:00'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-canvas)', borderRadius: 8, color: 'var(--fg)', fontSize: 12.5, lineHeight: 1.5 }}>
              Buenos días ☀️ Hoy toca <b>Programar posts y calendario</b>. ¿Lo vemos ahora?
              <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6 }}>9:00</div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY PREFERENCES · cuándo recibir contenido */}
      <DeliveryPreferencesPanel channelColor={channelColor}/>
    </PageShell>
  );
}

// ── Channel Manager Panel ─────────────────────────────────────────────────
function ChannelManagerPanel({ chState, catalog }) {
  const [connecting, setConnecting] = useEV2(null);

  const startConnect = (chId) => {
    setConnecting(chId);
    // mock OAuth · 800 ms de "redirección"
    setTimeout(() => {
      window.Channels && window.Channels.connect(chId);
      setConnecting(null);
    }, 800);
  };

  const connectedCount = catalog.filter(c => chState[c.id] && chState[c.id].connected).length;

  return (
    <section>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 16, gap:12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Canales conectados</h2>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{connectedCount} de {catalog.filter(c => c.available).length} canales disponibles activos · puedes conectar varios a la vez.</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {catalog.map(c => {
          const state = chState[c.id];
          const connected = !!(state && state.connected);
          const primary = chState.primary === c.id && connected;
          const isConnecting = connecting === c.id;
          const since = state && state.since ? Math.floor((Date.now() - state.since) / 86400000) : null;
          return (
            <div key={c.id} style={{
              padding: '16px 18px',
              background: connected ? `linear-gradient(135deg, ${c.color}10 0%, var(--bg-surface) 100%)` : 'var(--bg-surface)',
              border: `1.5px solid ${primary ? c.color : connected ? `${c.color}55` : 'var(--line)'}`,
              borderRadius: 14,
              display:'flex', flexDirection:'column', gap: 10,
              opacity: c.available ? 1 : 0.55,
              position:'relative',
            }}>
              {primary && (
                <div style={{ position:'absolute', top: -10, left: 12, padding:'2px 8px', background: c.color, color:'#fff', fontFamily:'var(--font-mono)', fontSize: 9, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, borderRadius: 999 }}>★ Principal</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color:'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight:1.4 }}>{c.desc}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius:'50%', background: connected ? '#22C55E' : 'var(--fg-dim)', boxShadow: connected ? '0 0 0 3px rgba(34,197,94,0.18)' : 'none', flexShrink:0 }} title={connected ? 'Conectado' : 'Desconectado'}/>
              </div>

              {!c.available && (
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.06em', color:'var(--fg-dim)', textTransform:'uppercase', fontWeight:700 }}>Próximamente</div>
              )}

              {connected && (
                <div style={{ padding: '8px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.06em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>Cuenta</div>
                    <div style={{ fontSize: 12.5, color:'var(--fg)', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{state.account}</div>
                  </div>
                  {since != null && (
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', whiteSpace:'nowrap' }}>{since === 0 ? 'hoy' : 'hace ' + since + 'd'}</div>
                  )}
                </div>
              )}

              <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 'auto' }}>
                {!connected && c.available && (
                  <button onClick={() => startConnect(c.id)} disabled={isConnecting} style={{
                    flex: 1, padding:'9px 12px', background: c.color, color:'#fff', border:'none', borderRadius: 8,
                    cursor: isConnecting ? 'wait' : 'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12,
                    opacity: isConnecting ? 0.7 : 1,
                  }}>
                    {isConnecting ? '⏳ Conectando…' : (c.authType === 'oauth' ? '🔐 Conectar (OAuth)' : c.authType === 'phone' ? '📱 Conectar' : '🔔 Activar permiso')}
                  </button>
                )}
                {connected && !primary && (
                  <button onClick={() => window.Channels && window.Channels.setPrimary(c.id)} style={{
                    padding:'7px 10px', background:'transparent', border:`1px solid ${c.color}`, color: c.color, borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 11.5,
                  }}>⭐ Marcar principal</button>
                )}
                {connected && (
                  <button onClick={() => window.Channels && window.Channels.reauth(c.id)} title="Re-autenticar OAuth" style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>🔄 Reauth</button>
                )}
                {connected && (
                  <button onClick={() => { if (confirm('¿Desconectar ' + c.label + '?')) window.Channels && window.Channels.disconnect(c.id); }} style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>Desconectar</button>
                )}
                {!c.available && (
                  <button disabled style={{
                    flex: 1, padding:'9px 12px', background:'var(--bg-surface)', color:'var(--fg-dim)', border:'1px dashed var(--line)', borderRadius: 8,
                    cursor:'not-allowed', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>Próximamente</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Delivery Preferences Panel ────────────────────────────────────────────
function DeliveryPreferencesPanel({ channelColor }) {
  const initial = (window.DeliveryPrefs && window.DeliveryPrefs.get()) || {};
  const [prefs, setPrefs] = useEV2(initial);
  const dayLabels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const dayLabelsLong = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const update = (patch) => {
    const next = window.DeliveryPrefs ? window.DeliveryPrefs.save({ ...prefs, ...patch }) : { ...prefs, ...patch };
    setPrefs(next);
  };

  const setMode = (mode) => update({ mode });
  const toggleDay = (i) => {
    if (prefs.mode !== 'custom') {
      // si se modifica un día y el modo no es custom, pasar a custom
      const days = [...(prefs.days || [false,false,false,false,false,false,false])];
      days[i] = !days[i];
      update({ mode:'custom', days });
    } else {
      const days = [...(prefs.days || [false,false,false,false,false,false,false])];
      days[i] = !days[i];
      update({ days });
    }
  };

  const next = window.DeliveryPrefs ? window.DeliveryPrefs.nextDelivery(prefs) : null;
  const nextLabel = window.DeliveryPrefs ? window.DeliveryPrefs.formatNext(next) : 'Sin programar';

  const MODES = [
    { id:'daily',    label:'Diario',         icon:'☀️', desc:'Todos los días' },
    { id:'weekdays', label:'Solo laborales', icon:'💼', desc:'Lunes a viernes' },
    { id:'weekends', label:'Fines de semana',icon:'🏖',  desc:'Sábado y domingo' },
    { id:'weekly',   label:'Semanal',        icon:'📅', desc:'Un día a la semana' },
    { id:'custom',   label:'Personalizado',  icon:'⚙️', desc:'Elige tus días' },
    { id:'smart-ai', label:'Smart · IA',     icon:'✨', desc:'BeonAI elige el mejor momento' },
  ];

  const activeDayCount = (prefs.days || []).filter(Boolean).length;
  const isSmart = prefs.mode === 'smart-ai';

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Preferencias de entrega</h2>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>Define cuándo y con qué frecuencia recibes contenido en tu canal.</div>

      {/* ENABLED toggle + Next delivery card */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom: 24 }}>
        <div style={{ padding:'18px 22px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:14.5, fontWeight:700, color:'var(--fg)' }}>Recibir contenido</div>
            <div style={{ fontSize:12, color:'var(--fg-muted)', marginTop:3 }}>{prefs.enabled ? 'Activo · recibirás contenido según tu programación' : 'Pausado · no se enviará nada hasta reactivar'}</div>
          </div>
          <button onClick={() => update({ enabled: !prefs.enabled })} aria-label="Toggle delivery"
            style={{ width:48, height:26, background: prefs.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: prefs.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        <div style={{ padding:'18px 22px', background:`linear-gradient(135deg, ${channelColor}14 0%, transparent 100%)`, border:`1px solid ${channelColor}40`, borderRadius:14 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:5 }}>📨 Próximo envío</div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--fg)' }}>{prefs.enabled ? nextLabel : 'En pausa'}</div>
        </div>
      </div>

      {/* MODE selector */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>Modo de programación</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10, marginBottom:28 }}>
        {MODES.map(m => {
          const active = prefs.mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                padding:'14px 16px', borderRadius:12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}15 0%, ${channelColor}05 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color: 'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'flex-start', gap:10,
              }}>
              <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{m.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color: active ? channelColor : 'var(--fg)' }}>{m.label}</div>
                <div style={{ fontSize:11.5, color:'var(--fg-muted)', marginTop:2, lineHeight:1.35 }}>{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* DAYS picker · siempre visible, deshabilitado si smart-ai */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>
        Días de la semana {isSmart && <span style={{ color: channelColor }}>· gestionado por BeonAI</span>}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 28, opacity: isSmart ? 0.5 : 1, pointerEvents: isSmart ? 'none' : 'auto' }}>
        {dayLabels.map((lbl, i) => {
          const active = (prefs.days || [])[i];
          return (
            <button key={i} onClick={() => toggleDay(i)} title={dayLabelsLong[i]}
              style={{
                width:54, padding:'12px 0', borderRadius:10, cursor:'pointer', textAlign:'center',
                background: active ? channelColor : 'var(--bg-surface)',
                color: active ? '#fff' : 'var(--fg-muted)',
                border: `1px solid ${active ? channelColor : 'var(--line)'}`,
                fontWeight: 700, fontSize:13, fontFamily:'var(--font-sans)',
                transition:'all .12s',
              }}>{lbl}</button>
          );
        })}
        <div style={{ flex:1, alignSelf:'center', textAlign:'right', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-muted)' }}>
          {activeDayCount} día{activeDayCount === 1 ? '' : 's'} a la semana
        </div>
      </div>

      {/* TIME + TIMEZONE */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 200px', gap:16, marginBottom: 24, alignItems:'flex-end' }}>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>Hora exacta</span>
          <input type="time" value={prefs.time || '09:00'} onChange={e => update({ time: e.target.value })} disabled={isSmart}
            style={{ padding:'10px 14px', fontSize:14, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10, opacity: isSmart ? 0.5 : 1 }}/>
        </label>
        <div style={{ alignSelf:'center', fontSize:12, color:'var(--fg-muted)', padding:'10px 14px', background:`${channelColor}08`, border:`1px solid ${channelColor}25`, borderRadius:10 }}>
          {isSmart
            ? <span>✨ <strong style={{color:channelColor}}>BeonAI</strong> elige el horario óptimo según tu historial: cuando más interactúas, evitando bloques de reuniones y respetando tus quiet hours.</span>
            : <span>Recibirás el contenido a las <strong style={{color:channelColor}}>{prefs.time || '09:00'}</strong>. {prefs.maxPerDay > 1 ? `Hasta ${prefs.maxPerDay} mensajes/día.` : '1 mensaje al día como máximo.'}</span>
          }
        </div>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>Zona horaria</span>
          <select value={prefs.timezone || 'auto'} onChange={e => update({ timezone: e.target.value })}
            style={{ padding:'10px 14px', fontSize:13, background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10 }}>
            <option value="auto">Automática · {Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
            <option value="Europe/Madrid">Europe/Madrid</option>
            <option value="Europe/Lisbon">Europe/Lisbon</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="America/Bogota">America/Bogota</option>
          </select>
        </label>
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.DeliveryPrefs && window.DeliveryPrefs.reset(); setPrefs(window.DeliveryPrefs.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:600 }}>
          ↻ Restablecer
        </button>
        {window.Toast && (
          <button onClick={() => window.Toast.success('Test enviado · revisa tu canal', { icon:'📨' })}
            style={{ padding:'8px 14px', background: channelColor, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:700 }}>
            📨 Enviar test ahora
          </button>
        )}
        <div style={{ flex:1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          Guardado automático · última actualización {new Date(prefs.updatedAt || Date.now()).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   InboxView · listado de notificaciones
   ============================================================ */
function InboxView({ openDetail }) {
  const inbox = (window.Inbox && window.Inbox.list && window.Inbox.list()) || [];
  const unread = inbox.filter(m => !m.read);
  const read = inbox.filter(m => m.read);

  const renderItem = (m) => (
    <article key={m.id} style={{
      padding: 18, marginBottom: 10, background: m.read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
      border: `1px solid ${m.read ? 'var(--line)' : 'var(--line-strong)'}`,
      borderLeft: m.read ? '1px solid var(--line)' : '3px solid var(--accent)',
      borderRadius: 'var(--r-2)', cursor: 'pointer',
    }} onClick={() => window.Inbox && window.Inbox.markRead && window.Inbox.markRead(m.id)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{m.title || m.subject || 'Notificación'}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>{m.time || (m.createdAt && new Date(m.createdAt).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})) || ''}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{m.body || m.preview || m.message || ''}</div>
    </article>
  );

  return (
    <PageShell
      eyebrow={`Bandeja · ${inbox.length} mensajes`}
      title={<>Tus <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>notificaciones</em></>}
      sub={unread.length > 0 ? `${unread.length} sin leer` : 'Todo al día'}
      narrow>

      {inbox.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>Bandeja vacía</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Cuando recibas notificaciones, aparecerán aquí.</div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Sin leer · {unread.length}</h2>
              {unread.map(renderItem)}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Leídos</h2>
              {read.map(renderItem)}
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

/* ============================================================
   SavedView · bookmarks grid
   ============================================================ */
function SavedView({ openDetail }) {
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const bmIds = (window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get()) || [];
  const saved = PILLS.filter(p => bmIds.includes(p.id) || bmIds.includes('pill-' + p.pill));

  return (
    <PageShell
      eyebrow="Mi lista"
      title={<>Pills <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>guardadas</em></>}
      sub={`${saved.length} módulos en tu colección`}>

      {saved.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔖</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>Tu lista está vacía</div>
          <div style={{ fontSize: 13.5, color: 'var(--fg-muted)' }}>Cuando hagas hover en una card y pulses el botón <strong>+</strong>, la pill aparece aquí.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {saved.map(p => {
            const slug = _slug(p.category);
            return (
              <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                <div className={`card-cover cat-${slug}`}/>
                <div className="card-grad"/>
                <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>
                  <div className="card-meta"><span>{p.duration}</span><span className="sep">·</span><span>{p.level}</span></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

/* ============================================================
   ProfileView · datos usuario + progreso resumen
   ============================================================ */
function ProfileView({ setView }) {
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const PILLS = (D && D.PILLS) || [];
  const completed = PILLS.filter(p => p.progress >= 1).length;
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1).length;

  const handleLogout = () => {
    if (!confirm('¿Cerrar sesión de ' + USER.name + '?')) return;
    if (window.Auth && window.Auth.logout) window.Auth.logout();
  };

  return (
    <PageShell
      eyebrow="Mi perfil"
      title={USER.name || 'Usuario'}
      sub={`${USER.role || 'Publish Agent'} · ${USER.team || 'Repsol'}`}
      narrow>

      {/* Avatar + info card */}
      <div style={{
        display: 'flex', gap: 32, padding: 32, background: 'var(--bg-surface)',
        border: '1px solid var(--line)', borderRadius: 'var(--r-2)', marginBottom: 24, alignItems: 'center',
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, fontWeight: 800, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em',
          flexShrink: 0,
        }}>{USER.initials || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700, color: 'var(--fg)', margin: 0, marginBottom: 4 }}>{USER.name}</h2>
          <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 12 }}>{USER.role} · {USER.team}</div>
          {USER.isAdmin && <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 9px', background:'var(--accent)', color:'#fff', borderRadius:4 }}>ADMIN</span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Pills completadas', value: completed, color: 'var(--ok)' },
          { label: 'En curso', value: inProgress, color: 'var(--accent)' },
          { label: 'Días activo', value: 14, color: 'var(--info)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'var(--font-sans)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => setView('settings')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>Ajustes</button>
        <button onClick={() => setView('saved')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>Mi lista</button>
        <button onClick={() => setView('path')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>Mi ruta</button>
        <button onClick={handleLogout} style={{
          padding: '12px 20px', background: 'transparent', color: 'var(--accent)',
          border: '1px solid var(--accent)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, marginLeft: 'auto',
        }}>Cerrar sesión</button>
      </div>
    </PageShell>
  );
}

/* ============================================================
   SettingsView · preferencias
   ============================================================ */
function SettingsView({ setView }) {
  const [theme, setTheme] = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().theme) || 'auto');
  const [lang, setLang] = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().lang) || 'es');
  const [pushEnabled, setPushEnabled] = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().push) || false);

  const save = (key, val) => {
    if (window.Settings && window.Settings.set) window.Settings.set({ [key]: val });
  };

  return (
    <PageShell
      eyebrow="Preferencias"
      title={<>Ajustes <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>de tu cuenta</em></>}
      sub="Personaliza cómo se comporta SolidStream para ti"
      narrow>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Tema */}
        <section style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 6, marginTop: 0 }}>Tema visual</h2>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 14px' }}>Solo afecta vistas no cinematográficas (Analytics, perfil…). El Home siempre va en dark.</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{k:'light', l:'Claro'}, {k:'dark', l:'Oscuro'}, {k:'auto', l:'Automático'}].map(t => (
              <button key={t.k} onClick={() => { setTheme(t.k); save('theme', t.k); }} style={{
                padding: '10px 18px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                background: theme === t.k ? 'var(--fg)' : 'var(--bg-elevated)', color: theme === t.k ? 'var(--bg-canvas)' : 'var(--fg-muted)',
                border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
              }}>{t.l}</button>
            ))}
          </div>
        </section>

        {/* Idioma */}
        <section style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 6, marginTop: 0 }}>Idioma de interfaz</h2>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 14px' }}>Idioma para textos, notificaciones y BeonAI.</p>
          <select value={lang} onChange={e => { setLang(e.target.value); save('lang', e.target.value); }} style={{
            padding: '10px 14px', fontFamily: 'var(--font-sans)', fontSize: 13,
            background: 'var(--bg-elevated)', color: 'var(--fg)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-1)',
          }}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </section>

        {/* Notificaciones push */}
        <section style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h2 style={{ fontFamily:'var(--font-sans)', fontSize:16, fontWeight:700, color:'var(--fg)', marginBottom:6, marginTop:0 }}>Notificaciones push</h2>
              <p style={{ fontSize:13, color:'var(--fg-muted)', margin:0 }}>Recibe avisos cuando tengas un nuevo módulo disponible.</p>
            </div>
            <button onClick={() => { setPushEnabled(p => !p); save('push', !pushEnabled); }} style={{
              width: 50, height: 28, background: pushEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              borderRadius: 14, position: 'relative', border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0,
            }}>
              <div style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: pushEnabled ? 25 : 3, transition: 'left .2s' }}/>
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/* ============================================================
   AdminView · panel admin · solo admins · link a legacy
   ============================================================ */
function AdminView({ setView, openLegacyAdmin }) {
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  if (!USER.isAdmin) {
    return (
      <PageShell title="Acceso restringido" sub="Solo administradores pueden ver este panel.">
        <div style={{ padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔒</div>
          <button onClick={() => setView('home')} style={{
            marginTop: 16, padding: '12px 24px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700,
          }}>Volver al inicio</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Admin · Repsol"
      title={<>Panel <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>de administración</em></>}
      sub="Gestiona usuarios, invitaciones y métricas de la plataforma"
      actions={
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 20px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>Panel completo →</button>
      }>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { title: 'Usuarios', value: '247', desc: 'usuarios activos', icon: '👥' },
          { title: 'Invitaciones pendientes', value: '8', desc: 'esperando aceptar', icon: '✉️' },
          { title: 'Completaciones esta semana', value: '142', desc: '+18% vs anterior', icon: '✓' },
          { title: 'NPS', value: '+58', desc: 'sobre 100', icon: '★' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--fg)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginTop: 0, marginBottom: 8 }}>Para gestionar todo</h2>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 14 }}>El panel completo de admin incluye: invitar usuarios (CSV bulk), revisar submissions de vídeo, audit log, bulk actions, exportar reportes.</p>
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 24px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>Abrir panel admin completo →</button>
      </div>
    </PageShell>
  );
}

window.BrowseView_New = BrowseView;
window.RutasView_New = RutasView;
window.MyPathView_New = MyPathView;
window.ChannelsView_New = ChannelsView;
window.InboxView_New = InboxView;
window.SavedView_New = SavedView;
window.ProfileView_New = ProfileView;
window.SettingsView_New = SettingsView;
window.AdminView_New = AdminView;
