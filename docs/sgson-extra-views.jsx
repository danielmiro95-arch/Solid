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
function RutasView({ setView, openDetail, openPath }) {
  const D = window.SGS_DATA;
  const paths = (D && D.LEARNING_PATHS) || [];
  const go = (pathId) => { if (openPath) openPath(pathId); else setView('path'); };

  return (
    <PageShell
      eyebrow="Rutas de certificación"
      title={<>Especialízate <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>en tu rol</em></>}
      sub="Cada ruta es una secuencia curada · al completarla obtienes el certificado oficial Repsol × BeonIt">

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20,
      }}>
        {paths.map(p => (
          <article key={p.id} className="card" onClick={() => go(p.id)} style={{ cursor: 'pointer', aspectRatio: '4/5' }}>
            <div className={`card-cover ${p.accent || 'cat-publish'}`}/>
            <div className="card-grad"/>
            <span className="card-pill-num" style={{ top: 16, left: 16 }}>RUTA · {p.pills} pills · {p.hours}</span>
            <div className="card-body" style={{ left: 20, right: 20, bottom: 18 }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
                fontSize: 28, color: 'var(--fg)', margin: 0, marginBottom: 8, lineHeight: 1.1,
              }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
              <button onClick={(e) => { e.stopPropagation(); go(p.id); }} style={{
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
function MyPathView({ openDetail, setView, pathId }) {
  const D = window.SGS_DATA;
  const ALL_PILLS = (D && D.PILLS) || [];
  const PATHS = (D && D.LEARNING_PATHS) || [];
  const USER = (D && D.USER) || {};

  // Si llegamos con un pathId concreto, filtramos las pills de esa ruta. Si no, usamos todas.
  const path = pathId ? PATHS.find(p => p.id === pathId) : null;
  const PILLS = path && path.pills
    ? ALL_PILLS.filter(p => path.pills.includes(p.id))
    : ALL_PILLS;

  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1);
  const completed = PILLS.filter(p => p.progress >= 1);
  const next = PILLS.filter(p => p.progress === 0).slice(0, 6);
  const totalProgress = PILLS.length > 0 ? Math.round((completed.length / PILLS.length) * 100) : 0;

  return (
    <PageShell
      eyebrow={path ? `Ruta · ${path.label}` : `Mi ruta · ${USER.role || 'Usuario'}`}
      title={path
        ? <>{path.label}{path.badge ? <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, fontSize:24, color:'var(--accent)', marginLeft:12 }}> · {path.badge}</em> : null}</>
        : <>Tu progreso, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{USER.name?.split(' ')[0] || 'crece'}</em></>}
      sub={path
        ? `${path.desc} · ${completed.length}/${PILLS.length} pills · ${totalProgress}%`
        : `${completed.length} de ${PILLS.length} pills completadas · ${totalProgress}% del programa`}
      actions={path && setView ? <button onClick={() => setView('rutas')} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>← Todas las rutas</button> : null}>

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

      {/* MATRIZ DE NOTIFICACIONES · una columna por canal conectado · estilo Sprinklr */}
      <ChannelNotificationsMatrix chState={chState} catalog={catalog}/>

      {/* DELIVERY PREFERENCES · cuándo recibir contenido (con max/día) */}
      <DeliveryPreferencesPanel channelColor={channelColor}/>

      {/* Atajo a Ajustes para el resto de configuración */}
      <div style={{ marginTop: 32, padding:'18px 22px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>⚙️</div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>¿Quieres elegir qué contenido recibes o tus reglas de notificación?</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>Tipos de contenido, suscripciones (categorías/skills/equipos/trainers) y reglas (quiet hours, vacation, digest, prioridad) viven en <strong>Ajustes</strong>.</div>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('__go-settings'))}
          style={{ padding:'10px 16px', background: channelColor, color:'#fff', border:'none', borderRadius: 10, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, boxShadow:`0 4px 12px ${channelColor}40` }}>
          Ir a Ajustes →
        </button>
      </div>
    </PageShell>
  );
}

// ── Notification Rules Panel ────────────────────────────────────────────
function NotificationRulesPanel({ channelColor }) {
  const [rules, setRules] = useEV2(() => (window.NotificationRules ? window.NotificationRules.get() : {}));
  useEE2(() => {
    const onChange = (e) => setRules(e.detail);
    window.addEventListener('notif-rules-changed', onChange);
    return () => window.removeEventListener('notif-rules-changed', onChange);
  }, []);

  const update = (patch) => window.NotificationRules && window.NotificationRules.update(patch);
  const muted = window.NotificationRules ? window.NotificationRules.isMuted() : false;

  const DIGEST = [
    { id:'instant', label:'Instantáneo', desc:'En cuanto haya algo, te llega' },
    { id:'daily',   label:'Digest diario', desc:'Un único mensaje agrupado al día' },
    { id:'weekly',  label:'Digest semanal', desc:'Un único mensaje los lunes a las 9:00' },
  ];

  const PRIORITY = [
    { id:'all',      label:'Todo',                 desc:'Cualquier contenido nuevo' },
    { id:'relevant', label:'Solo relevante',       desc:'BeonAI filtra por tu rol y objetivos' },
    { id:'high',     label:'Solo prioridad alta',  desc:'Sólo alertas y deadlines' },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>Reglas de notificación</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color: muted ? 'var(--warn)' : 'var(--ok)', fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: muted ? 'var(--warn)' : 'var(--ok)' }}/>
          {muted ? 'En silencio ahora' : 'Activas'}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 24 }}>
        Controla cuándo y con qué prioridad te llegan las notificaciones.
      </div>

      {/* DIGEST · cómo agrupar */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>Frecuencia de envío</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10, marginBottom:28 }}>
        {DIGEST.map(d => {
          const active = rules.digest === d.id;
          return (
            <button key={d.id} onClick={() => update({ digest: d.id })}
              style={{
                padding:'12px 14px', borderRadius: 12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
              }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{d.label}</div>
              <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 3, lineHeight: 1.35 }}>{d.desc}</div>
            </button>
          );
        })}
      </div>

      {/* QUIET HOURS · franja horaria sin notificaciones */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:`1px solid ${rules.quietHours && rules.quietHours.enabled ? channelColor : 'var(--line)'}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>🌙 Horas de silencio</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>No te llegará nada en esta franja horaria. Útil para dormir o concentrarte.</div>
          </div>
          <button onClick={() => update({ quietHours: { ...rules.quietHours, enabled: !rules.quietHours.enabled } })} aria-label="Toggle quiet hours"
            style={{ width:48, height:26, background: rules.quietHours && rules.quietHours.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.quietHours && rules.quietHours.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.quietHours && rules.quietHours.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>Desde</span>
              <input type="time" value={rules.quietHours.from} onChange={e => update({ quietHours: { ...rules.quietHours, from: e.target.value } })}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>Hasta</span>
              <input type="time" value={rules.quietHours.to} onChange={e => update({ quietHours: { ...rules.quietHours, to: e.target.value } })}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', alignSelf:'center' }}>
              {(() => {
                const [fh, fm] = rules.quietHours.from.split(':').map(Number);
                const [th, tm] = rules.quietHours.to.split(':').map(Number);
                const f = fh*60+fm, t = th*60+tm;
                const diff = f === t ? 0 : (f < t ? t - f : (1440 - f) + t);
                const h = Math.floor(diff/60), m = diff % 60;
                return diff === 0 ? 'Sin franja' : (h ? h + 'h ' : '') + (m ? m + 'min' : '') + ' en silencio';
              })()}
            </div>
          </div>
        )}
      </div>

      {/* VACATION MODE · pausa con fecha de fin */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:`1px solid ${rules.vacation && rules.vacation.enabled ? channelColor : 'var(--line)'}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>🏖 Modo vacaciones</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>Pausa todas las notificaciones hasta la fecha que elijas.</div>
          </div>
          <button onClick={() => update({ vacation: { ...rules.vacation, enabled: !rules.vacation.enabled } })} aria-label="Toggle vacation"
            style={{ width:48, height:26, background: rules.vacation && rules.vacation.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.vacation && rules.vacation.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.vacation && rules.vacation.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>Hasta</span>
              <input type="date" value={rules.vacation.until || ''} onChange={e => update({ vacation: { ...rules.vacation, until: e.target.value } })}
                min={new Date().toISOString().slice(0,10)}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            {rules.vacation.until && (
              <div style={{ fontSize: 12, color:'var(--fg-muted)' }}>Te reactivamos automáticamente el {new Date(rules.vacation.until).toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'short' })}</div>
            )}
          </div>
        )}
      </div>

      {/* SMART REMINDER · evitar repetir contenido ya visto */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>🤖 Recordatorio inteligente</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>BeonAI evita recordarte contenido que ya viste.</div>
          </div>
          <button onClick={() => update({ smartReminder: !rules.smartReminder })} aria-label="Toggle smart reminder"
            style={{ width:48, height:26, background: rules.smartReminder ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.smartReminder ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
      </div>

      {/* PRIORITY */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>Filtro por prioridad</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10, marginBottom: 18 }}>
        {PRIORITY.map(p => {
          const active = rules.priority === p.id;
          return (
            <button key={p.id} onClick={() => update({ priority: p.id })}
              style={{
                padding:'12px 14px', borderRadius: 10, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
              }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{p.label}</div>
              <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.35 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.NotificationRules && window.NotificationRules.reset(); setRules(window.NotificationRules.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
        <div style={{ flex: 1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          Auto-save · {new Date(rules.updatedAt || Date.now()).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

// ── Subscriptions Panel · seguir categorías, skills, equipos, trainers ───
function SubscriptionsPanel({ channelColor }) {
  const [subs, setSubs] = useEV2(() => (window.Subscriptions ? window.Subscriptions.get() : { categories:{}, skills:{}, teams:{}, trainers:{} }));
  const [activeGroup, setActiveGroup] = useEV2('categories');
  useEE2(() => {
    const onChange = (e) => setSubs(e.detail);
    window.addEventListener('subscriptions-changed', onChange);
    return () => window.removeEventListener('subscriptions-changed', onChange);
  }, []);

  const CAT = (window.Subscriptions && window.Subscriptions.CATALOG) || { categories:[], skills:[], teams:[], trainers:[] };
  const TABS = [
    { id:'categories', label:'Categorías',  icon:'🗂', items: CAT.categories || [] },
    { id:'skills',     label:'Skills',      icon:'🧠', items: CAT.skills     || [] },
    { id:'teams',      label:'Equipos',     icon:'👥', items: CAT.teams      || [] },
    { id:'trainers',   label:'Trainers',    icon:'🎓', items: CAT.trainers   || [] },
  ];
  const active = TABS.find(t => t.id === activeGroup) || TABS[0];

  const toggle = (id) => window.Subscriptions && window.Subscriptions.toggle(activeGroup, id);
  const total = window.Subscriptions ? window.Subscriptions.totalCount() : 0;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>Lo que sigues</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {total} suscripci{total === 1 ? 'ón' : 'ones'} activa{total === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>
        Recibirás contenido nuevo de las categorías, skills, equipos y trainers que sigas.
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap: 2, marginBottom: 16, borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const sel = activeGroup === t.id;
          const c = window.Subscriptions ? window.Subscriptions.count(t.id) : 0;
          return (
            <button key={t.id} onClick={() => setActiveGroup(t.id)} style={{
              padding:'10px 14px 9px', background:'transparent', border:'none',
              borderBottom: '2px solid ' + (sel ? channelColor : 'transparent'),
              color: sel ? 'var(--fg)' : 'var(--fg-muted)',
              fontFamily:'var(--font-sans)', fontWeight: sel ? 700 : 500, fontSize: 13.5,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 8, marginBottom: -1,
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, padding:'1px 6px', background: sel ? channelColor : 'var(--bg-surface)', color: sel ? '#fff' : 'var(--fg-muted)', borderRadius: 999, fontWeight: 700 }}>{c}</span>
            </button>
          );
        })}
        <div style={{ flex:1 }}/>
        <button onClick={() => { window.Subscriptions && window.Subscriptions.reset(); setSubs(window.Subscriptions.get()); }}
          style={{ alignSelf:'center', padding:'6px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 11, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
      </div>

      {/* Items del grupo activo */}
      <div style={{ display:'grid', gridTemplateColumns: activeGroup === 'skills' ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {active.items.map(item => {
          const isActive = !!(subs[activeGroup] && subs[activeGroup][item.id]);
          const itemColor = item.color || channelColor;
          return (
            <button key={item.id} onClick={() => toggle(item.id)}
              style={{
                padding:'12px 14px', borderRadius: 10, cursor:'pointer', textAlign:'left',
                background: isActive ? `linear-gradient(135deg, ${itemColor}12 0%, ${itemColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${isActive ? itemColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'center', gap: 10, position:'relative',
              }}>
              {item.icon && <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.icon}</div>}
              {!item.icon && activeGroup === 'trainers' && (
                <div style={{ width: 32, height: 32, borderRadius:'50%', background: channelColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {item.label.split(' ').map(s => s[0]).slice(0,2).join('')}
                </div>
              )}
              <div style={{ flex:1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? itemColor : 'var(--fg)' }}>{item.label}</div>
                {item.role && <div style={{ fontSize: 11, color:'var(--fg-muted)', marginTop: 2 }}>{item.role}</div>}
                {item.members != null && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)', marginTop: 2 }}>{item.members} miembros</div>}
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${isActive ? itemColor : 'var(--line)'}`, background: isActive ? itemColor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {isActive ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chips resumen · qué sigues en total (todas las pestañas) */}
      {total > 0 && (
        <div style={{ marginTop: 18, padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 10 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700, marginBottom: 8 }}>Resumen de suscripciones</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
            {TABS.flatMap(t => t.items.filter(i => subs[t.id] && subs[t.id][i.id]).map(i => (
              <span key={t.id+':'+i.id} style={{ padding:'4px 10px', fontFamily:'var(--font-mono)', fontSize: 10.5, fontWeight: 600, background: (i.color || channelColor)+'15', color: i.color || channelColor, borderRadius: 999, border: `1px solid ${(i.color || channelColor)+'40'}` }}>
                {t.icon} {i.label}
              </span>
            )))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Content Push Panel · tipos de contenido + formato de mensaje ─────────
function ContentPushPanel({ channelColor }) {
  const [prefs, setPrefs] = useEV2(() => (window.ContentPush ? window.ContentPush.get() : {}));
  useEE2(() => {
    const onChange = (e) => setPrefs(e.detail);
    window.addEventListener('content-push-changed', onChange);
    return () => window.removeEventListener('content-push-changed', onChange);
  }, []);

  const types = (window.ContentPush && window.ContentPush.TYPES) || [];
  const enabledCount = types.filter(t => prefs.types && prefs.types[t.id]).length;

  const FLAGS = [
    { key:'autoReceive',   label:'Recibir automáticamente',  desc:'Llega solo, sin que pidas que te lo envíen.' },
    { key:'showSummary',   label:'Resumen previo del contenido', desc:'Antes del enlace, una línea con lo que vas a aprender.' },
    { key:'showThumbnail', label:'Thumbnail + CTA',          desc:'Imagen de portada con botón "Ver ahora".' },
    { key:'showDuration',  label:'Ver duración',             desc:'Muestra cuánto dura antes de que abras.' },
    { key:'openInSolid',   label:'Abrir en SolidStream',     desc:'Al hacer click, abrir dentro de la plataforma (no en web pública).' },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>Qué contenido quieres recibir</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {enabledCount}/{types.length} tipos activos
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>Activa los formatos que quieres que te lleguen por tu canal principal.</div>

      {/* Grid de tipos de contenido */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 32 }}>
        {types.map(t => {
          const active = !!(prefs.types && prefs.types[t.id]);
          return (
            <button key={t.id} onClick={() => window.ContentPush && window.ContentPush.toggleType(t.id)}
              style={{
                padding:'14px 16px', borderRadius: 12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'flex-start', gap: 10, position:'relative',
              }}>
              <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{t.label}</div>
                <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${active ? channelColor : 'var(--line)'}`, background: active ? channelColor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {active ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Opciones de formato + preview */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap: 24, alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>Formato del mensaje</div>
          {FLAGS.map(f => {
            const active = !!prefs[f.key];
            return (
              <div key={f.key} onClick={() => window.ContentPush && window.ContentPush.setFlag(f.key, !active)} style={{
                padding:'12px 14px', marginBottom: 8, background: active ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${active ? channelColor : 'var(--line)'}`, borderRadius: 10,
                cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap: 14,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color:'var(--fg)' }}>{f.label}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2 }}>{f.desc}</div>
                </div>
                <div style={{ width: 34, height: 18, background: active ? channelColor : 'rgba(15,23,42,0.18)', borderRadius: 9, position:'relative', transition:'background .2s', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, background:'#fff', borderRadius:'50%', position:'absolute', top: 2, left: active ? 18 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREVIEW dinámico del mensaje en el canal principal */}
        <div style={{ background:'#000', border:'1px solid var(--line)', borderRadius: 20, padding: 10 }}>
          <div style={{ padding:'10px 12px', background: channelColor, color:'#fff', borderRadius: 10, marginBottom: 6, fontSize: 12, fontWeight: 700, display:'flex', alignItems:'center', gap: 6 }}>
            <span>✦</span><span>SolidStream</span>
          </div>
          <div style={{ padding: 12, background:'var(--bg-canvas)', borderRadius: 10, color:'var(--fg)' }}>
            {prefs.showThumbnail && (
              <div style={{ aspectRatio:'16/9', borderRadius: 8, background:`linear-gradient(135deg, ${channelColor}, ${channelColor}99)`, marginBottom: 8, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 32 }}>▶</div>
                {prefs.showDuration && (
                  <div style={{ position:'absolute', bottom: 6, right: 6, padding:'2px 6px', background:'rgba(0,0,0,0.6)', color:'#fff', fontFamily:'var(--font-mono)', fontSize: 9, borderRadius: 4 }}>4:32</div>
                )}
              </div>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>Programar posts y calendario</div>
            {prefs.showSummary && (
              <div style={{ fontSize: 11, color:'var(--fg-muted)', lineHeight: 1.45, marginBottom: 8 }}>Aprende a agendar publicaciones en Sprinklr Publish y revisar tu calendario semanal.</div>
            )}
            <button style={{ padding:'7px 12px', background: channelColor, color:'#fff', border:'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor:'pointer', width:'100%' }}>
              {prefs.openInSolid ? '▶ Ver en SolidStream' : 'Abrir en web'}
            </button>
            <div style={{ fontSize: 9, color:'var(--fg-dim)', marginTop: 6, fontFamily:'var(--font-mono)' }}>9:00 · push automático</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.ContentPush && window.ContentPush.reset(); setPrefs(window.ContentPush.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
        <div style={{ flex: 1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          Auto-save · {new Date(prefs.updatedAt || Date.now()).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

// ── Channel Notifications Matrix · una columna por canal × tipos comunes ──
function ChannelNotificationsMatrix({ chState, catalog }) {
  const connected = (catalog || []).filter(c => chState[c.id] && chState[c.id].connected);
  const [state, setState] = useEV2(() => (window.ChannelNotifs ? window.ChannelNotifs.get() : {}));
  const [history, setHistory] = useEV2(() => (window.TestSends ? window.TestSends.list() : []));

  useEE2(() => {
    const onChange = (e) => setState(e.detail);
    window.addEventListener('channel-notifs-changed', onChange);
    return () => window.removeEventListener('channel-notifs-changed', onChange);
  }, []);
  useEE2(() => {
    const onChange = (e) => setHistory(e.detail);
    window.addEventListener('test-sends-changed', onChange);
    return () => window.removeEventListener('test-sends-changed', onChange);
  }, []);

  const TYPES = (window.ChannelNotifs && window.ChannelNotifs.TYPES) || [];

  if (connected.length === 0) {
    return (
      <section style={{ marginTop: 40, padding:'24px 22px', background:'var(--bg-surface)', border:'1px dashed var(--line)', borderRadius: 14, textAlign:'center' }}>
        <div style={{ fontSize: 32, opacity: 0.45, marginBottom: 8 }}>📱</div>
        <h3 style={{ margin:'0 0 4px', fontFamily:'var(--font-sans)', fontSize: 16, color:'var(--fg)' }}>Sin canales conectados</h3>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Conecta al menos un canal arriba para configurar tus notificaciones.</div>
      </section>
    );
  }

  const toggle = (typeId, channelId) => window.ChannelNotifs && window.ChannelNotifs.toggle(typeId, channelId);
  const setAll = (channelId, value) => window.ChannelNotifs && window.ChannelNotifs.setAll(channelId, value);
  const isOn = (typeId, channelId) => !!(state[typeId] && state[typeId][channelId]);
  const sendTest = (c) => window.TestSends && window.TestSends.send(c.id, c.label);

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>Notificaciones por canal</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {TYPES.length} tipos · {connected.length} canal{connected.length === 1 ? '' : 'es'}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 18 }}>
        Activa el mismo tipo de aviso en uno o varios canales a la vez. Cada columna se configura independientemente.
      </div>

      {/* MATRIZ · columnas por canal, filas por tipo */}
      <div style={{ display:'grid', gridTemplateColumns: `220px repeat(${connected.length}, minmax(180px, 1fr))`, gap: 0, border:'1px solid var(--line)', borderRadius: 14, overflow:'hidden', background:'var(--bg-surface)' }}>
        {/* HEADER · primera fila */}
        <div style={{ padding:'14px 16px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight: 700 }}>
          Tipo de notificación
        </div>
        {connected.map(c => {
          const channelOn = window.ChannelNotifs ? window.ChannelNotifs.countForChannel(c.id) : 0;
          const allOn = channelOn === TYPES.length;
          return (
            <div key={c.id} style={{ padding:'12px 14px', background:`linear-gradient(180deg, ${c.color}18 0%, ${c.color}06 100%)`, borderBottom:'1px solid var(--line)', borderLeft:'1px solid var(--line)', display:'flex', flexDirection:'column', gap: 8 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{channelOn}/{TYPES.length} activas</div>
                </div>
                {chState.primary === c.id && (
                  <div title="Canal principal" style={{ fontSize: 12, color: c.color, fontWeight: 800 }}>★</div>
                )}
              </div>
              <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                <button onClick={() => setAll(c.id, !allOn)} title={allOn ? 'Desactivar todas' : 'Activar todas'}
                  style={{ flex: 1, padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background:'transparent', border:`1px solid ${c.color}55`, color: c.color, borderRadius: 6, cursor:'pointer' }}>
                  {allOn ? '× Desactivar todas' : '✓ Activar todas'}
                </button>
                <button onClick={() => sendTest(c)} title={`Enviar test a ${c.label}`}
                  style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background: c.color, border:'none', color:'#fff', borderRadius: 6, cursor:'pointer' }}>
                  📨 Test
                </button>
              </div>
            </div>
          );
        })}

        {/* FILAS · tipo de notificación × cada columna */}
        {TYPES.map((t, ri) => (
          <React.Fragment key={t.id}>
            <div style={{ padding:'14px 16px', borderTop: ri > 0 ? '1px solid var(--line)' : 'none', background:'var(--bg-surface)', display:'flex', alignItems:'flex-start', gap: 10 }}>
              <div style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color:'var(--fg)' }}>{t.label}</div>
                <div style={{ fontSize: 11, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            </div>
            {connected.map(c => {
              const on = isOn(t.id, c.id);
              return (
                <div key={c.id} onClick={() => toggle(t.id, c.id)}
                  style={{
                    padding:'14px 16px', borderTop: ri > 0 ? '1px solid var(--line)' : 'none', borderLeft:'1px solid var(--line)',
                    background: on ? `${c.color}08` : 'var(--bg-surface)',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'background .12s',
                  }}>
                  <div style={{ width: 44, height: 24, background: on ? c.color : 'rgba(15,23,42,0.18)', borderRadius: 12, position:'relative', transition:'background .2s', flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, background:'#fff', borderRadius:'50%', position:'absolute', top: 3, left: on ? 23 : 3, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Resumen + historial test */}
      <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, fontSize: 11.5, color:'var(--fg-muted)' }}>
          Tip · activa la misma notificación en varios canales si quieres redundancia (ej: WhatsApp + Email para deadlines críticos).
        </div>
        <button onClick={() => { window.ChannelNotifs && window.ChannelNotifs.reset(); }}
          style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 11.5, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer matriz
        </button>
      </div>

      {/* Historial de tests · solo si hay envíos */}
      {history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight: 700, marginBottom: 8 }}>Últimos tests · {history.length}</div>
          <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} style={{ padding:'5px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 999, display:'inline-flex', alignItems:'center', gap: 6, fontSize: 11, color:'var(--fg-muted)' }}>
                <span style={{ width: 5, height: 5, borderRadius:'50%', background:'var(--ok)' }}/>
                {h.channelLabel} · {new Date(h.ts).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Channel Preview Panel · adapta el mensaje al formato real de cada canal ──
function ChannelPreviewPanel({ chState, catalog }) {
  // Canales conectados solamente
  const connected = (catalog || []).filter(c => chState[c.id] && chState[c.id].connected);
  const primary = chState.primary || (connected[0] && connected[0].id);
  const [activeId, setActiveId] = useEV2(primary || (connected[0] && connected[0].id));
  const [history, setHistory] = useEV2(() => (window.TestSends ? window.TestSends.list() : []));
  const [notifPerm, setNotifPerm] = useEV2(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  useEE2(() => {
    const onChange = (e) => setHistory(e.detail);
    window.addEventListener('test-sends-changed', onChange);
    return () => window.removeEventListener('test-sends-changed', onChange);
  }, []);

  // Si cambia el set de conectados, ajusta active
  useEE2(() => {
    if (!connected.find(c => c.id === activeId)) setActiveId(primary || (connected[0] && connected[0].id));
  }, [connected.map(c => c.id).join(',')]);

  if (connected.length === 0) {
    return (
      <section style={{ marginTop: 40, padding:'24px 22px', background:'var(--bg-surface)', border:'1px dashed var(--line)', borderRadius: 14, textAlign:'center' }}>
        <div style={{ fontSize: 32, opacity: 0.45, marginBottom: 8 }}>📱</div>
        <h3 style={{ margin:'0 0 4px', fontFamily:'var(--font-sans)', fontSize: 16, color:'var(--fg)' }}>Sin canales conectados</h3>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Conecta arriba al menos un canal para ver la vista previa del mensaje.</div>
      </section>
    );
  }

  const activeDef = connected.find(c => c.id === activeId) || connected[0];
  const channelColor = activeDef.color;
  const requestPerm = async () => {
    if (!window.TestSends) return;
    const r = await window.TestSends.requestPermission();
    setNotifPerm(r);
  };
  const sendTest = () => window.TestSends && window.TestSends.send(activeDef.id, activeDef.label);

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 8, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>Vista previa por canal</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {connected.length} canal{connected.length === 1 ? '' : 'es'} conectado{connected.length === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 18 }}>Así se verá tu mensaje en cada canal. Pulsa "Enviar test" para recibir una notificación real ahora.</div>

      {/* Channel tabs */}
      <div style={{ display:'flex', gap: 6, marginBottom: 16, flexWrap:'wrap' }}>
        {connected.map(c => {
          const sel = c.id === activeDef.id;
          return (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              style={{
                padding:'8px 14px', borderRadius: 999, cursor:'pointer',
                background: sel ? c.color : 'var(--bg-surface)',
                color: sel ? '#fff' : 'var(--fg-muted)',
                border: '1px solid ' + (sel ? c.color : 'var(--line)'),
                fontFamily:'var(--font-sans)', fontSize: 12.5, fontWeight: 700,
                display:'inline-flex', alignItems:'center', gap: 6,
              }}>
              <span>{c.icon}</span><span>{c.label}</span>
              {chState.primary === c.id && <span style={{ fontSize: 10, opacity: sel ? 1 : 0.7 }}>★</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap: 28, alignItems:'flex-start' }}>
        {/* Lado izquierdo · controles + historial */}
        <div>
          <div style={{ padding:'14px 16px', background:`linear-gradient(135deg, ${channelColor}10 0%, var(--bg-surface) 100%)`, border:`1px solid ${channelColor}40`, borderRadius: 12, marginBottom: 14 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight: 700, marginBottom: 4 }}>{activeDef.icon} {activeDef.label}</div>
            <div style={{ fontSize: 13, color:'var(--fg)', lineHeight: 1.55, marginBottom: 6 }}>
              {activeDef.id === 'whatsapp' && 'Mensaje corto con miniatura · enlace directo a la pill · ideal en móvil.'}
              {activeDef.id === 'teams'    && 'Adaptive Card con botón nativo · se ve dentro del chat del bot.'}
              {activeDef.id === 'email'    && 'HTML con asunto + resumen + CTA · si tienes digest, agrupa todas las pills del día.'}
              {activeDef.id === 'slack'    && 'Bot notification con bloques + acciones rápidas.'}
              {activeDef.id === 'push'     && 'Notificación nativa del navegador o del móvil.'}
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, color:'var(--fg-muted)' }}>Cuenta: <strong style={{ color:'var(--fg)' }}>{chState[activeDef.id] && chState[activeDef.id].account}</strong></div>
          </div>

          <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 18 }}>
            <button onClick={sendTest} style={{
              padding:'10px 16px', background: channelColor, color:'#fff', border:'none', borderRadius: 10,
              cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13,
              boxShadow:`0 4px 12px ${channelColor}40`,
            }}>📨 Enviar test a {activeDef.label}</button>
            {typeof Notification !== 'undefined' && notifPerm !== 'granted' && notifPerm !== 'denied' && notifPerm !== 'unsupported' && (
              <button onClick={requestPerm} style={{
                padding:'10px 14px', background:'transparent', border:`1px solid ${channelColor}`, color: channelColor,
                borderRadius: 10, cursor:'pointer', fontSize: 12.5, fontWeight: 700,
              }}>🔔 Activar notificaciones nativas</button>
            )}
            {notifPerm === 'denied' && (
              <span style={{ alignSelf:'center', fontSize: 11.5, color:'var(--fg-muted)' }}>⚠ Notificaciones del navegador bloqueadas</span>
            )}
            {notifPerm === 'granted' && (
              <span style={{ alignSelf:'center', fontSize: 11.5, color:'var(--ok)' }}>✓ Notificaciones nativas activas</span>
            )}
          </div>

          {/* Historial de tests */}
          {history.length > 0 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight: 700 }}>Historial de tests · {history.length}</div>
                <button onClick={() => window.TestSends && window.TestSends.clear()}
                  style={{ padding:'4px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 10.5, fontWeight: 600 }}>
                  Limpiar
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
                {history.slice(0, 6).map(h => (
                  <div key={h.id} style={{ padding:'8px 12px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8, display:'flex', alignItems:'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius:'50%', background:'var(--ok)', flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color:'var(--fg)' }}>Test → {h.channelLabel}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{new Date(h.ts).toLocaleString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · entregado</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado derecho · preview específico del canal activo */}
        <div>
          <ChannelMessagePreview channel={activeDef}/>
        </div>
      </div>
    </section>
  );
}

// ── Mensaje preview con formato específico por canal ─────────────────────
function ChannelMessagePreview({ channel }) {
  const c = channel;
  if (!c) return null;

  // WhatsApp · burbuja chat
  if (c.id === 'whatsapp') {
    return (
      <div style={{ background:'#0B141A', border:'1px solid var(--line)', borderRadius: 24, padding: 12 }}>
        <div style={{ padding:'10px 12px', background:'#1F2C33', color:'#fff', borderRadius:'12px 12px 4px 4px', marginBottom: 6, display:'flex', alignItems:'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 14, fontWeight: 800, color:'#fff' }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color:'#fff' }}>SolidStream</div>
            <div style={{ fontSize: 10, color:'rgba(255,255,255,0.6)' }}>en línea</div>
          </div>
        </div>
        <div style={{ padding:'10px 12px', background:'#0B141A', minHeight: 220 }}>
          <div style={{ maxWidth: '85%', background:'#202C33', padding:'8px 10px', borderRadius:'8px 8px 8px 0', color:'#E9EDEF', fontSize: 12.5, lineHeight: 1.45, marginBottom: 6 }}>
            <div style={{ aspectRatio:'16/9', borderRadius: 6, background:'linear-gradient(135deg, #25D366, #128C7E)', marginBottom: 8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 26, position:'relative' }}>
              ▶
              <div style={{ position:'absolute', bottom: 4, right: 6, padding:'1px 5px', background:'rgba(0,0,0,0.65)', borderRadius: 3, fontFamily:'var(--font-mono)', fontSize: 9 }}>4:32</div>
            </div>
            Buenos días ☀️ Hoy toca <b>Programar posts y calendario</b>.
            <div style={{ marginTop: 6, color:'#25D366', fontWeight: 600, fontSize: 11.5 }}>solid.app/p/p20 ↗</div>
            <div style={{ marginTop: 4, fontSize: 9.5, color:'rgba(255,255,255,0.5)', textAlign:'right' }}>9:00 ✓✓</div>
          </div>
        </div>
      </div>
    );
  }

  // Teams · adaptive card
  if (c.id === 'teams') {
    return (
      <div style={{ background:'#2D2C2C', border:'1px solid var(--line)', borderRadius: 14, padding: 14 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom:'1px solid #3F3E40' }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background:'#5059C9', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 14, fontWeight: 800 }}>S</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color:'#fff' }}>SolidStream bot</div>
            <div style={{ fontSize: 10, color:'rgba(255,255,255,0.55)' }}>Sent · 9:00 a. m.</div>
          </div>
        </div>
        <div style={{ background:'#3B3A39', border:'1px solid #4A4948', borderRadius: 8, overflow:'hidden' }}>
          <div style={{ padding:'10px 12px 4px' }}>
            <div style={{ fontSize: 11, color:'#A19F9D', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom: 4 }}>Tu pill del día</div>
            <div style={{ fontSize: 14, fontWeight: 700, color:'#fff' }}>Programar posts y calendario</div>
            <div style={{ fontSize: 11.5, color:'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.4 }}>4:32 min · Sprinklr Publish · BeonIt</div>
          </div>
          <div style={{ padding:'4px 12px 12px', display:'flex', gap: 6, flexWrap:'wrap' }}>
            <button style={{ padding:'6px 12px', background:'#5059C9', color:'#fff', border:'none', borderRadius: 4, fontSize: 11.5, fontWeight: 600, cursor:'pointer' }}>▶ Ver en SolidStream</button>
            <button style={{ padding:'6px 10px', background:'transparent', color:'#fff', border:'1px solid #4A4948', borderRadius: 4, fontSize: 11.5, fontWeight: 600, cursor:'pointer' }}>Más tarde</button>
          </div>
        </div>
        <div style={{ fontSize: 10, color:'rgba(255,255,255,0.4)', marginTop: 8, fontFamily:'var(--font-mono)' }}>Adaptive Card · v1.4</div>
      </div>
    );
  }

  // Email · cliente correo
  if (c.id === 'email') {
    return (
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius: 12, overflow:'hidden', color:'#0F172A' }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #E5E7EB', background:'#F9FAFB' }}>
          <div style={{ fontSize: 10.5, color:'#6B7280', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em' }}>De · noreply@solidstream.app</div>
          <div style={{ fontSize: 14, fontWeight: 700, color:'#0F172A', marginTop: 4 }}>📚 Hoy toca: Programar posts y calendario</div>
          <div style={{ fontSize: 11, color:'#6B7280', marginTop: 2 }}>Para: amaia.ruiz@repsol.com · 9:00 AM</div>
        </div>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ aspectRatio:'16/9', borderRadius: 6, background:'linear-gradient(135deg, #EA4335, #F4B740)', marginBottom: 12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 28, position:'relative' }}>
            ▶
            <div style={{ position:'absolute', bottom: 6, right: 8, padding:'2px 6px', background:'rgba(0,0,0,0.65)', borderRadius: 4, fontFamily:'var(--font-mono)', fontSize: 10, color:'#fff' }}>4:32</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color:'#0F172A', marginBottom: 6 }}>Programar posts y calendario</div>
          <div style={{ fontSize: 12.5, color:'#374151', lineHeight: 1.55, marginBottom: 14 }}>
            Aprende a agendar publicaciones en Sprinklr Publish y revisar tu calendario semanal. 4 min · Sprinklr · BeonIt.
          </div>
          <button style={{ padding:'10px 18px', background:'#EA4335', color:'#fff', border:'none', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor:'pointer' }}>▶ Ver en SolidStream</button>
        </div>
        <div style={{ padding:'10px 14px', background:'#F9FAFB', borderTop:'1px solid #E5E7EB', fontSize: 10, color:'#6B7280', fontFamily:'var(--font-mono)' }}>
          ¿Demasiados emails? <a href="#" onClick={(e) => { e.preventDefault(); if (window.NotificationRules) { window.NotificationRules.update({ digest:'weekly' }); window.Toast && window.Toast.success('Cambiado a digest semanal', { icon:'📅' }); } }} style={{ color:'#EA4335' }}>Cambia a digest semanal</a> · <a href="#" onClick={(e) => { e.preventDefault(); if (window.Channels) { window.Channels.disconnect('email'); } }} style={{ color:'#EA4335' }}>Darse de baja</a>
        </div>
      </div>
    );
  }

  // Slack · bot
  if (c.id === 'slack') {
    return (
      <div style={{ background:'#1A1D21', border:'1px solid var(--line)', borderRadius: 12, padding: 14, color:'#D1D2D3' }}>
        <div style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background:'#4A154B', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>S</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color:'#fff' }}>SolidStream APP <span style={{ fontSize: 10, color:'#9D9F9F', fontWeight: 400, marginLeft: 6 }}>9:00 AM</span></div>
            <div style={{ marginTop: 6, padding: 12, background:'#222529', border:'1px solid #2C2F33', borderLeft:'4px solid #4A154B', borderRadius: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color:'#fff' }}>Programar posts y calendario</div>
              <div style={{ fontSize: 12, color:'#A0A1A2', marginTop: 4, lineHeight: 1.5 }}>4:32 min · Sprinklr Publish</div>
              <button style={{ marginTop: 10, padding:'7px 12px', background:'#007A5A', color:'#fff', border:'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor:'pointer' }}>▶ Ver pill</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Push genérico
  return (
    <div style={{ background:'#1E1E1E', border:'1px solid var(--line)', borderRadius: 12, padding: 14, color:'#E5E5E5' }}>
      <div style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background:'#0EA5E9', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>S</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color:'#9CA3AF' }}>SolidStream · ahora</div>
          <div style={{ fontSize: 13, fontWeight: 700, color:'#fff', marginTop: 2 }}>Hoy toca: Programar posts y calendario</div>
          <div style={{ fontSize: 11.5, color:'#9CA3AF', marginTop: 3 }}>4 min · Sprinklr Publish · pulsa para abrir</div>
        </div>
      </div>
    </div>
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
  const [prefs, setPrefs] = useEV2(() => (window.DeliveryPrefs && window.DeliveryPrefs.get()) || {});
  const dayLabels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const dayLabelsLong = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  useEE2(() => {
    const onChange = (e) => setPrefs(e.detail || (window.DeliveryPrefs && window.DeliveryPrefs.get()));
    window.addEventListener('delivery-prefs-changed', onChange);
    return () => window.removeEventListener('delivery-prefs-changed', onChange);
  }, []);

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

      {/* MAX PER DAY · slider de límite diario */}
      <div style={{ padding:'14px 18px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 18, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>📊 Límite diario</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>Máximo de mensajes que recibirás al día por este canal.</div>
        </div>
        <input type="range" min="1" max="10" value={prefs.maxPerDay || 1} onChange={e => update({ maxPerDay: parseInt(e.target.value, 10) })}
          style={{ flex: 1, minWidth: 180, accentColor: channelColor }}/>
        <div style={{ minWidth: 64, textAlign:'right' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 22, fontWeight: 800, color: channelColor }}>{prefs.maxPerDay || 1}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)', marginLeft: 4 }}>/día</span>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.DeliveryPrefs && window.DeliveryPrefs.reset(); setPrefs(window.DeliveryPrefs.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:600 }}>
          ↻ Restablecer
        </button>
        {window.TestSends && (
          <button onClick={() => {
            const ch = window.Channels && window.Channels.get && window.Channels.get();
            const primaryId = ch && ch.primary;
            const def = primaryId && window.Channels && window.Channels.CATALOG.find(c => c.id === primaryId);
            if (def) window.TestSends.send(def.id, def.label);
            else if (window.Toast) window.Toast.info('Conecta un canal arriba para enviar test', { icon:'⚠️' });
          }}
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
   InboxView · listado de notificaciones · API real Inbox.getAll()
   ============================================================ */
function InboxView({ openDetail }) {
  const [data, setData] = useEV2(() => (window.Inbox && window.Inbox.getAll && window.Inbox.getAll()) || { messages:[], notifications:[], releases:[] });
  const [tab, setTab] = useEV2('messages');
  useEE2(() => {
    if (window.Inbox && window.Inbox.seedIfEmpty) window.Inbox.seedIfEmpty();
    setData(window.Inbox.getAll());
    const onChange = () => setData(window.Inbox.getAll());
    window.addEventListener('inbox-changed', onChange);
    return () => window.removeEventListener('inbox-changed', onChange);
  }, []);

  const items = (data[tab] || []).slice().sort((a,b) => (b.createdAt || b.ts || 0) - (a.createdAt || a.ts || 0));
  const unread = items.filter(m => !m.read);
  const read   = items.filter(m =>  m.read);
  const totalUnread = (data.messages || []).filter(m => !m.read).length
                    + (data.notifications || []).filter(m => !m.read).length
                    + (data.releases || []).filter(m => !m.read).length;

  const TABS = [
    { id:'messages',      label:'Mensajes',      icon:'💬', count:(data.messages||[]).filter(m => !m.read).length },
    { id:'notifications', label:'Notificaciones',icon:'🔔', count:(data.notifications||[]).filter(m => !m.read).length },
    { id:'releases',      label:'Novedades',     icon:'✨', count:(data.releases||[]).filter(m => !m.read).length },
  ];

  const renderItem = (m) => (
    <article key={m.id} style={{
      padding: 18, marginBottom: 10, background: m.read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
      border: `1px solid ${m.read ? 'var(--line)' : 'var(--line)'}`,
      borderLeft: m.read ? '1px solid var(--line)' : '3px solid var(--accent)',
      borderRadius: 'var(--r-2)', cursor: 'pointer',
    }} onClick={() => window.Inbox && window.Inbox.markRead && window.Inbox.markRead(tab, m.id)}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6, gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{m.title || m.subject || m.summary || 'Notificación'}</div>
        <div style={{ fontSize: 11, color:'var(--fg-dim)', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
          {m.time || (m.createdAt && new Date(m.createdAt).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })) || ''}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', lineHeight: 1.5 }}>
        {m.body || m.preview || m.message || m.description || ''}
      </div>
      {m.from && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', marginTop: 6 }}>De · {m.from}</div>}
    </article>
  );

  const totalAll = (data.messages||[]).length + (data.notifications||[]).length + (data.releases||[]).length;

  return (
    <PageShell
      eyebrow={`Bandeja · ${totalAll} elementos`}
      title={<>Tus <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>notificaciones</em></>}
      sub={totalUnread > 0 ? `${totalUnread} sin leer` : 'Todo al día'}
      actions={items.length > 0 && unread.length > 0 ? (
        <button onClick={() => window.Inbox && window.Inbox.markAllRead && window.Inbox.markAllRead(tab)}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>
          ✓ Marcar todo como leído
        </button>
      ) : null}>

      {/* TABS */}
      <div style={{ display:'flex', gap: 2, marginBottom: 24, borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 16px 9px', background:'transparent', border:'none',
              borderBottom: '2px solid ' + (sel ? 'var(--accent)' : 'transparent'),
              color: sel ? 'var(--fg)' : 'var(--fg-muted)',
              fontFamily:'var(--font-sans)', fontWeight: sel ? 700 : 500, fontSize: 13.5,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 8, marginBottom: -1,
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, padding:'1px 7px', background:'var(--accent)', color:'#fff', borderRadius: 999, fontWeight: 700 }}>{t.count}</span>}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 60, textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>Bandeja vacía</div>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Cuando recibas algo en {TABS.find(t => t.id === tab).label.toLowerCase()}, aparecerá aquí.</div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>Sin leer · {unread.length}</h2>
              {unread.map(renderItem)}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>Leídos · {read.length}</h2>
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
  const [lang, setLang] = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().language) || 'es');

  // Color de acento neutro para los paneles dentro de Settings
  const accentColor = 'var(--accent)';

  const save = (key, val) => {
    if (window.Settings && window.Settings.update) window.Settings.update({ [key]: val });
  };

  return (
    <PageShell
      eyebrow="Preferencias"
      title={<>Ajustes <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>de tu cuenta</em></>}
      sub="Personaliza qué contenido recibes, a quién sigues y cómo se comporta SolidStream">

      {/* General · tema + idioma */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>General</h2>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>Aspecto y idioma de la plataforma.</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
          {/* Tema */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <h3 style={{ fontFamily:'var(--font-sans)', fontSize:14.5, fontWeight: 700, color:'var(--fg)', margin:'0 0 4px' }}>Tema visual</h3>
            <p style={{ fontSize: 12, color:'var(--fg-muted)', margin:'0 0 12px' }}>Solo afecta vistas no cinematográficas (Analytics, perfil…). El Home siempre va en dark.</p>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              {[{k:'light', l:'Claro'}, {k:'dark', l:'Oscuro'}, {k:'auto', l:'Automático'}].map(t => (
                <button key={t.k} onClick={() => { setTheme(t.k); save('theme', t.k); }} style={{
                  padding:'8px 14px', fontFamily:'var(--font-sans)', fontSize: 12.5, fontWeight: 600,
                  background: theme === t.k ? 'var(--fg)' : 'var(--bg-elevated)',
                  color: theme === t.k ? 'var(--bg-canvas)' : 'var(--fg-muted)',
                  border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer',
                }}>{t.l}</button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div style={{ padding: 20, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12 }}>
            <h3 style={{ fontFamily:'var(--font-sans)', fontSize: 14.5, fontWeight: 700, color:'var(--fg)', margin:'0 0 4px' }}>Idioma</h3>
            <p style={{ fontSize: 12, color:'var(--fg-muted)', margin:'0 0 12px' }}>Idioma de interfaz, notificaciones y BeonAI.</p>
            <select value={lang} onChange={e => { setLang(e.target.value); save('language', e.target.value); }} style={{
              padding:'8px 12px', fontFamily:'var(--font-sans)', fontSize: 12.5,
              background:'var(--bg-elevated)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius: 6,
            }}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
      </section>

      {/* CONTENT PUSH · qué contenido recibir */}
      <ContentPushPanel channelColor={accentColor}/>

      {/* SUBSCRIPTIONS · seguir categorías, skills, equipos, trainers */}
      <SubscriptionsPanel channelColor={accentColor}/>

      {/* NOTIFICATION RULES · quiet hours, vacation, digest, smart, priority */}
      <NotificationRulesPanel channelColor={accentColor}/>
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

      {/* KPIs reales · derivados de Auth + Invitations + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(() => {
          const users   = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
          const invites = (window.Invitations && window.Invitations.list && window.Invitations.list()) || [];
          const pendingInv = invites.filter(i => i.status === 'pending' || i.status === 'invited' || !i.status).length;
          const PILLS = (D && D.PILLS) || [];
          const completedTotal = PILLS.filter(p => p.progress >= 1).length;
          const ratingsAll = (window.Ratings && window.Ratings.getAll && window.Ratings.getAll()) || {};
          const stars = Object.values(ratingsAll).map(r => r && r.stars).filter(n => n > 0);
          const avgRating = stars.length ? (stars.reduce((a,b) => a+b, 0) / stars.length) : 0;
          const adminCount = users.filter(u => u.isAdmin || u.role === 'admin').length;
          return [
            { title: 'Usuarios',            value: String(users.length),    desc: `${adminCount} admin${adminCount === 1 ? '' : 's'} · plataforma`, icon: '👥' },
            { title: 'Invitaciones pendientes', value: String(pendingInv),   desc: 'esperando aceptar', icon: '✉️' },
            { title: 'Pills completadas',   value: String(completedTotal),   desc: `de ${PILLS.length} disponibles`, icon: '✓' },
            { title: 'Valoración media',    value: avgRating ? avgRating.toFixed(1) + ' ★' : '—', desc: `${stars.length} puntuaci${stars.length === 1 ? 'ón' : 'ones'}`, icon: '★' },
          ];
        })().map((s, i) => (
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
