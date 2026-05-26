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
  const [channel, setChannel] = useEV2(() => localStorage.getItem('solid-channel') || 'whatsapp');
  const [toggles, setToggles] = useEV2([true, true, false, true]);
  useEE2(() => { localStorage.setItem('solid-channel', channel); }, [channel]);
  const toggle = (i) => setToggles(t => t.map((v, idx) => idx === i ? !v : v));
  const isTeams = channel === 'teams';
  const channelColor = isTeams ? '#5059C9' : '#25D366';

  const opts = isTeams ? [
    { t: 'Módulo diario en Teams · 9:00', d: 'Cada mañana, un mensaje en Teams con tu próximo módulo de Sprinklr.' },
    { t: 'Briefs antes de reuniones', d: '30 min antes de cualquier reunión Sprinklr en tu calendario.' },
    { t: 'Respuestas de BeonAI en Teams', d: 'Pregunta al bot directamente desde Teams.' },
    { t: 'Resumen semanal · viernes 17:00', d: 'Tu progreso de la semana, en un mensaje.' },
  ] : [
    { t: 'Módulo diario en WhatsApp · 9:00', d: 'Un mensaje cada mañana con tu próximo módulo.' },
    { t: 'Briefs antes de reuniones', d: '30 min antes de cualquier sesión relacionada con Sprinklr.' },
    { t: 'Respuestas de BeonAI por WhatsApp', d: 'Pregunta al agente directamente.' },
    { t: 'Resumen semanal · viernes 17:00', d: 'Lo completado, tu progreso y qué viene la semana siguiente.' },
  ];

  return (
    <PageShell
      eyebrow="Canales de comunicación"
      title={<>Tu formación, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>donde estés</em></>}
      sub="SolidStream llega a ti por el canal corporativo que prefieras">

      {/* Selector */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
        {[
          { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', desc: 'Equipo Repsol y partners externos' },
          { id: 'teams', label: 'Microsoft Teams', color: '#5059C9', desc: 'Empleados internos Repsol' },
        ].map(c => (
          <button key={c.id} onClick={() => setChannel(c.id)} style={{
            flex: 1, minWidth: 280, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14,
            background: channel === c.id ? c.color : 'var(--bg-surface)',
            color: channel === c.id ? '#fff' : 'var(--fg)',
            border: `1px solid ${channel === c.id ? c.color : 'var(--line)'}`,
            borderRadius: 'var(--r-2)', cursor: 'pointer', textAlign: 'left',
            boxShadow: channel === c.id ? `0 8px 24px ${c.color}40` : 'none', transition: 'all .2s',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: channel === c.id ? 'rgba(255,255,255,0.2)' : c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
              {c.id === 'teams' ? 'T' : 'W'}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 12.5, opacity: 0.8 }}>{c.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Toggles + Phone preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Notificaciones</h2>
          {opts.map((o, i) => (
            <div key={i} onClick={() => toggle(i)} style={{
              padding: 18, marginBottom: 10, background: toggles[i] ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: `1px solid ${toggles[i] ? channelColor : 'var(--line)'}`, borderRadius: 'var(--r-2)',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{o.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{o.d}</div>
              </div>
              <div style={{ width: 36, height: 20, background: toggles[i] ? channelColor : 'rgba(255,255,255,0.1)', borderRadius: 10, position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: toggles[i] ? 18 : 2, transition: 'left .2s' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Phone preview */}
        <div style={{ background: '#000', border: '1px solid var(--line)', borderRadius: 24, padding: 12, height: 480 }}>
          <div style={{ background: channelColor, padding: 12, borderRadius: 12, color: '#fff', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{isTeams ? 'SolidStream bot · Teams' : 'BeonAI · SolidStream'}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{isTeams ? 'Disponible · 9:00' : 'en línea · 9:00'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-canvas)', borderRadius: 8, color: 'var(--fg)', fontSize: 12.5, lineHeight: 1.5 }}>
            Buenos días ☀️ Hoy toca <b>Programar posts y calendario</b>. ¿Lo vemos ahora?
            <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6 }}>9:00</div>
          </div>
        </div>
      </div>
    </PageShell>
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
