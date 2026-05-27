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
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const pills = (D && D.PILLS) || [];
  const ALL_KEY = T('browse.all');
  const allCats = [ALL_KEY, ...Array.from(new Set(pills.map(p => p.category))).filter(Boolean)];
  const [cat, setCat] = useEV2(ALL_KEY);
  const filtered = cat === ALL_KEY ? pills : pills.filter(p => p.category === cat);

  return (
    <PageShell
      eyebrow={T('browse.eyebrow')}
      title={<>{T('browse.title')}</>}
      sub={`${pills.length} ${T('browse.sub')}`}>
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
function RutasView({ setView, openPath }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const paths = (D && D.LEARNING_PATHS) || [];
  const go = (pathId) => { if (openPath) openPath(pathId); else setView('path'); };

  return (
    <PageShell
      eyebrow={T('rutas.eyebrow')}
      title={<>{T('rutas.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('rutas.titleEm')}</em></>}
      sub={T('rutas.sub')}>

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
              }}>{T('rutas.start')}</button>
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
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const [showExam, setShowExam] = useEV2(false);
  const D = window.SGS_DATA;
  const ALL_PILLS = (D && D.PILLS) || [];
  const PATHS = (D && D.LEARNING_PATHS) || [];
  const USER = (D && D.USER) || {};

  // Si llegamos con un pathId concreto, filtramos las pills de esa ruta. Si no, usamos todas.
  const path = pathId ? PATHS.find(p => p.id === pathId) : null;
  const pathPillIds = path && Array.isArray(path.pillIds) ? path.pillIds : (path && Array.isArray(path.pills) ? path.pills : null);
  const PILLS = pathPillIds && pathPillIds.length
    ? ALL_PILLS.filter(p => pathPillIds.includes(p.id))
    : ALL_PILLS;

  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1);
  const completed = PILLS.filter(p => p.progress >= 1);
  const next = PILLS.filter(p => p.progress === 0).slice(0, 6);
  const totalProgress = PILLS.length > 0 ? Math.round((completed.length / PILLS.length) * 100) : 0;

  // Nombres robustos del path (adapter expone `title`/`label`, legacy expone `label`/`desc`/`badge`).
  const pTitle = path ? (path.label || path.title || 'Ruta') : '';
  const pDesc  = path ? (path.desc || path.roleTag || '') : '';
  const pBadge = path ? (path.badge || '') : '';

  return (
    <PageShell
      eyebrow={path ? `Ruta · ${pTitle}` : `Mi ruta · ${USER.role || 'Usuario'}`}
      title={path
        ? <>{pTitle}{pBadge ? <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, fontSize:24, color:'var(--accent)', marginLeft:12 }}> · {pBadge}</em> : null}</>
        : <>Tu progreso, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{USER.name?.split(' ')[0] || 'crece'}</em></>}
      sub={path
        ? `${pDesc} · ${completed.length}/${PILLS.length} pills · ${totalProgress}%`
        : `${completed.length} de ${PILLS.length} pills completadas · ${totalProgress}% del programa`}
      actions={path && setView ? (
        <div style={{ display:'flex', gap: 10 }}>
          {totalProgress >= 70 && window.RouteExamModal && (
            <button onClick={() => setShowExam(true)} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, boxShadow:'0 4px 12px rgba(89,71,255,0.30)' }}>
              {T('mypath.exam')}
            </button>
          )}
          <button onClick={() => setView('rutas')} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>{T('mypath.allRoutes')}</button>
        </div>
      ) : null}>

      {/* Barra de progreso grande */}
      <div style={{
        padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-2)', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{T('mypath.cert.title')}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 40, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{totalProgress}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalProgress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 4 }}/>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
        {[
          { label: T('mypath.completed'), value: completed.length, color: 'var(--ok)' },
          { label: T('mypath.inProgress'), value: inProgress.length, color: 'var(--accent)' },
          { label: T('mypath.toStart'), value: PILLS.length - completed.length - inProgress.length, color: 'var(--fg-muted)' },
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
            {T('mypath.cont')}
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
            {T('mypath.next')}
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

      {/* Examen final · solo si hay path y el modal global está disponible */}
      {showExam && path && window.RouteExamModal && (
        <window.RouteExamModal
          routeId={path.id}
          routeLabel={pTitle}
          onClose={() => setShowExam(false)}
          onPassed={() => { setShowExam(false); if (window.Toast) window.Toast.success('¡Examen aprobado! Certificado generado.', { icon:'🏆' }); }}
        />
      )}
    </PageShell>
  );
}

/* ============================================================
   ChannelsView · WhatsApp/Teams · keeps storage state
   ============================================================ */
function ChannelsView() {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
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
      eyebrow={T('channels.eyebrow')}
      title={<>{T('channels.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('channels.titleEm')}</em></>}
      sub={T('channels.sub')}>

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
          <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{T('delivery.toSettings.title')}</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('delivery.toSettings.sub')}</div>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('__go-settings'))}
          style={{ padding:'10px 16px', background: channelColor, color:'#fff', border:'none', borderRadius: 10, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, boxShadow:`0 4px 12px ${channelColor}40` }}>
          {T('delivery.toSettings.btn')}
        </button>
      </div>
    </PageShell>
  );
}

// ── Smart Scheduling Panel · BeonAI sugiere el mejor horario ─────────────
// ── Push Notifications Panel · suscripción + install prompt ──────────────
function PushNotificationsPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const supported = window.PushNotifications && window.PushNotifications.isSupported();
  const [perm, setPerm] = useEV2(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'));
  const [active, setActive] = useEV2(false);
  const [busy, setBusy] = useEV2(false);
  const [installPrompt, setInstallPrompt] = useEV2(null);
  const [installed, setInstalled] = useEV2(() => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone));

  // Sync active state on mount
  useEE2(() => {
    let mounted = true;
    if (!window.PushNotifications) return;
    window.PushNotifications.isActive().then(v => { if (mounted) setActive(v); });
    const onSub = () => window.PushNotifications.isActive().then(v => { if (mounted) { setActive(v); setPerm(Notification.permission); } });
    const onUnsub = () => { if (mounted) setActive(false); };
    window.addEventListener('push-subscribed', onSub);
    window.addEventListener('push-unsubscribed', onUnsub);
    return () => { mounted = false; window.removeEventListener('push-subscribed', onSub); window.removeEventListener('push-unsubscribed', onUnsub); };
  }, []);

  // Install prompt · index.html ya capturó el evento ANTES de montar el panel,
  // lo guardó en window._installPromptEvent. Lo leemos en mount + nos suscribimos
  // por si volviera a dispararse (raro pero posible si user dismiss y vuelve).
  useEE2(() => {
    if (window._installPromptEvent) setInstallPrompt(window._installPromptEvent);
    const onBefore = (e) => { e.preventDefault(); window._installPromptEvent = e; setInstallPrompt(e); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); window._installPromptEvent = null; };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBefore); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const toggle = async () => {
    setBusy(true);
    if (active) await window.PushNotifications.unsubscribe();
    else await window.PushNotifications.subscribe();
    const v = await window.PushNotifications.isActive();
    setActive(v); setPerm(Notification.permission);
    setBusy(false);
  };

  const testLocal = async () => {
    const r = await window.PushNotifications.sendTestLocal();
    if (r.error && window.Toast) window.Toast.info('Test local · ' + r.error);
  };
  const testRemote = async () => {
    const r = await window.PushNotifications.sendTestRemote();
    if (r.ok && window.Toast) window.Toast.success('Push enviada desde el servidor', { icon:'📨' });
    else if (window.Toast) window.Toast.info('Server push no configurado · usa el test local');
  };

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
    window._installPromptEvent = null;
  };

  const statusColor = active ? 'var(--ok)' : (perm === 'denied' ? 'var(--warn)' : 'var(--fg-dim)');
  const statusLabel = !supported ? T('push.notSupported')
    : perm === 'denied' ? T('push.denied')
    : active ? T('push.active')
    : T('push.inactive');

  return (
    <section style={{ marginTop: 40, marginBottom: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap: 12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>🔔 {T('push.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color: statusColor, fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: statusColor }}/>
          {statusLabel}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>{T('push.sub')}</div>

      {/* Card principal · suscripción */}
      <div style={{ padding:'18px 22px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>
              {active ? T('push.active') : T('push.enable')}
            </div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>
              {supported ? 'Permiso del navegador: ' + perm : T('push.notSupported')}
            </div>
          </div>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {supported && perm !== 'denied' && (
              <button onClick={toggle} disabled={busy}
                style={{ padding:'10px 16px', background: active ? 'transparent' : 'var(--accent)', border: active ? '1px solid var(--line)' : 'none', color: active ? 'var(--fg-muted)' : '#fff', borderRadius: 8, cursor: busy ? 'wait' : 'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, opacity: busy ? 0.6 : 1 }}>
                {busy ? '…' : (active ? T('push.disable') : T('push.enable'))}
              </button>
            )}
            {active && (
              <button onClick={testLocal} style={{ padding:'10px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontWeight: 600 }}>
                📨 {T('push.testLocal')}
              </button>
            )}
            {active && (
              <button onClick={testRemote} style={{ padding:'10px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontWeight: 600 }}>
                ☁️ {T('push.testRemote')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Install banner · solo si NO está instalada y el browser ofrece prompt */}
      {!installed && installPrompt && (
        <div style={{ padding:'14px 18px', background:'linear-gradient(135deg, rgba(110,80,238,0.10), transparent)', border:'1px solid rgba(110,80,238,0.3)', borderRadius: 12, display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{T('push.install')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('push.installPromo')}</div>
          </div>
          <button onClick={triggerInstall} style={{ padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13, boxShadow:'0 4px 12px rgba(110,80,238,0.30)' }}>
            {T('push.install')}
          </button>
        </div>
      )}
      {installed && (
        <div style={{ padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8, fontSize: 12, color:'var(--ok)' }}>
          {T('push.installed')}
        </div>
      )}
    </section>
  );
}

function SmartSchedulingPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const lang = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
  const [data, setData] = useEV2(() => (window.SmartScheduling ? window.SmartScheduling.get() : null));
  const [analyzing, setAnalyzing] = useEV2(false);
  const [applied, setApplied] = useEV2(false);
  // Días localizados para el headline
  const DAYS_LONG_BY_LANG = {
    es:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    en:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    pt:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
  };
  const daysLong = DAYS_LONG_BY_LANG[lang] || DAYS_LONG_BY_LANG.es;
  // Mapping insights id → keys i18n (en orden devuelto por SmartScheduling.analyze)
  const INSIGHT_KEYS = ['optimal','bestDay','window','avg','engagement'];

  useEE2(() => {
    const onChange = (e) => setData(e.detail || (window.SmartScheduling ? window.SmartScheduling.get() : null));
    window.addEventListener('smart-scheduling-changed', onChange);
    return () => window.removeEventListener('smart-scheduling-changed', onChange);
  }, []);

  // Detecta si DeliveryPrefs ya está en modo smart-ai
  useEE2(() => {
    const refreshApplied = () => {
      const p = window.DeliveryPrefs && window.DeliveryPrefs.get && window.DeliveryPrefs.get();
      setApplied(!!(p && p.mode === 'smart-ai'));
    };
    refreshApplied();
    window.addEventListener('delivery-prefs-changed', refreshApplied);
    return () => window.removeEventListener('delivery-prefs-changed', refreshApplied);
  }, []);

  const reAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      if (window.SmartScheduling) setData(window.SmartScheduling.analyze());
      setAnalyzing(false);
      if (window.Toast) window.Toast.success(T('smart.reAnalyze') + ' ✓', { icon:'✨' });
    }, 900);
  };

  const apply = () => {
    if (window.SmartScheduling) window.SmartScheduling.applyToDelivery();
    if (window.Toast) window.Toast.success(T('smart.appliedBtn'), { icon:'⚡' });
  };

  if (!data) return null;

  const fmtAgo = (ts) => {
    const d = Math.floor((Date.now() - ts) / 60000);
    const prefix = lang === 'en' ? '' : (lang === 'pt' ? 'há ' : 'hace ');
    const suffix = lang === 'en' ? ' ago' : '';
    if (d < 1)   return lang === 'en' ? 'just now' : (lang === 'pt' ? 'agora mesmo' : 'ahora mismo');
    if (d < 60)  return prefix + d + ' min' + suffix;
    const h = Math.floor(d / 60);
    if (h < 24)  return prefix + h + ' h' + suffix;
    const dys = Math.floor(h / 24);
    return prefix + dys + (lang === 'en' ? ' day' + (dys === 1 ? '' : 's') : (lang === 'pt' ? ' dia' + (dys === 1 ? '' : 's') : ' día' + (dys === 1 ? '' : 's'))) + suffix;
  };

  return (
    <section style={{ marginTop: 40, marginBottom: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap: 12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>
          ✨ {T('smart.eyebrow')} · <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('smart.title')}</em>
        </h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('smart.updatedAt','Actualizado')} {fmtAgo(data.generatedAt || Date.now())}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>
        {T('smart.sub')}
      </div>

      {/* CARD principal · gradiente accent + métricas top */}
      <div style={{
        padding:'22px 24px',
        background:'linear-gradient(135deg, rgba(89,71,255,0.10) 0%, rgba(89,71,255,0.02) 50%, var(--bg-surface) 100%)',
        border:'1px solid rgba(89,71,255,0.35)',
        borderRadius: 16,
        marginBottom: 16,
        position:'relative', overflow:'hidden',
      }}>
        {analyzing && (
          <div style={{ position:'absolute', top: 12, right: 16, fontFamily:'var(--font-mono)', fontSize: 10.5, color:'var(--accent)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
            <span className="dot-pulse" style={{ width: 8, height: 8, borderRadius:'50%', background:'var(--accent)' }}/>
            {T('smart.analyzing')}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap: 24, alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', fontWeight: 700, marginBottom: 8 }}>{T('smart.bestTime')}</div>
            <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize: 38, color:'var(--fg)', lineHeight: 1.1, marginBottom: 6 }}>
              {T('smart.youHeadline')} <strong style={{ color:'var(--accent)' }}>{data.time}</strong>
            </div>
            <div style={{ fontSize: 13.5, color:'var(--fg-muted)', lineHeight: 1.55, maxWidth: 560 }}>
              {T('smart.explain','Te abres con más constancia los {day}. En tu ventana de pico ({window}) el engagement es del {engagement}%.')
                .replace('{day}', daysLong[data.bestDayIdx].toLowerCase())
                .replace('{window}', data.peakWindow)
                .replace('{engagement}', data.engagement)}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            <button onClick={apply} disabled={applied} style={{
              padding:'12px 16px', background: applied ? 'var(--bg-elevated)' : 'var(--accent)',
              color: applied ? 'var(--fg-muted)' : '#fff',
              border: 'none', borderRadius: 10, cursor: applied ? 'default' : 'pointer',
              fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13,
              boxShadow: applied ? 'none' : '0 6px 18px rgba(89,71,255,0.35)',
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
            }}>
              {applied ? T('smart.appliedBtn') : T('smart.applyBtn')}
            </button>
            <button onClick={reAnalyze} disabled={analyzing} style={{
              padding:'10px 16px', background:'transparent',
              border:'1px solid var(--line)', color:'var(--fg-muted)',
              borderRadius: 10, cursor: analyzing ? 'wait' : 'pointer',
              fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12,
            }}>
              {analyzing ? T('smart.analyzing') : T('smart.reAnalyze')}
            </button>
          </div>
        </div>
      </div>

      {/* INSIGHTS · grid de métricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {data.insights.map((ins, i) => {
          const key = INSIGHT_KEYS[i] || null;
          const label = key ? T('smart.insights.' + key, ins.label) : ins.label;
          const hint  = key ? T('smart.insights.' + key + '.hint', ins.hint) : ins.hint;
          // Para `bestDay`, traducir el value (que es el nombre del día)
          let value = ins.value;
          if (key === 'bestDay' && typeof value === 'string') value = daysLong[data.bestDayIdx] || value;
          return (
            <div key={i} style={{ padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12 }}>
              <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{ins.icon}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color:'var(--fg)', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color:'var(--fg-muted)', lineHeight: 1.4 }}>{hint}</div>
            </div>
          );
        })}
      </div>

      {/* Notas · qué optimiza la IA */}
      <div style={{ marginTop: 14, padding:'12px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 10, fontSize: 12, color:'var(--fg-muted)', lineHeight: 1.55 }}>
        {T('smart.disclaimer','BeonAI también optimiza por ti · evita enviarte en quiet hours, agrupa pills en digest si superas tu límite diario, y respeta tu modo vacaciones automáticamente.')}
      </div>
    </section>
  );
}

// ── Notification Rules Panel ────────────────────────────────────────────
function NotificationRulesPanel({ channelColor }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [rules, setRules] = useEV2(() => (window.NotificationRules ? window.NotificationRules.get() : {}));
  useEE2(() => {
    const onChange = (e) => setRules(e.detail);
    window.addEventListener('notif-rules-changed', onChange);
    return () => window.removeEventListener('notif-rules-changed', onChange);
  }, []);

  const update = (patch) => window.NotificationRules && window.NotificationRules.update(patch);
  const muted = window.NotificationRules ? window.NotificationRules.isMuted() : false;

  const DIGEST = [
    { id:'instant', label:T('rules.digest.instant'), desc:T('rules.digest.instant.sub','En cuanto haya algo, te llega') },
    { id:'daily',   label:T('rules.digest.daily'),   desc:T('rules.digest.daily.sub','Un único mensaje agrupado al día') },
    { id:'weekly',  label:T('rules.digest.weekly'),  desc:T('rules.digest.weekly.sub','Un único mensaje los lunes a las 9:00') },
  ];

  const PRIORITY = [
    { id:'all',      label:T('rules.priority.all'),      desc:T('rules.priority.all.sub','Cualquier contenido nuevo') },
    { id:'relevant', label:T('rules.priority.relevant'), desc:T('rules.priority.relevant.sub','BeonAI filtra por tu rol y objetivos') },
    { id:'high',     label:T('rules.priority.high'),     desc:T('rules.priority.high.sub','Sólo alertas y deadlines') },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('rules.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color: muted ? 'var(--warn)' : 'var(--ok)', fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: muted ? 'var(--warn)' : 'var(--ok)' }}/>
          {muted ? T('rules.muted') : T('rules.active')}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 24 }}>
        {T('rules.sub')}
      </div>

      {/* DIGEST · cómo agrupar */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('rules.digest.title')}</div>
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
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.quiet.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.quiet.sub','No te llegará nada en esta franja horaria. Útil para dormir o concentrarte.')}</div>
          </div>
          <button onClick={() => update({ quietHours: { ...rules.quietHours, enabled: !rules.quietHours.enabled } })} aria-label="Toggle quiet hours"
            style={{ width:48, height:26, background: rules.quietHours && rules.quietHours.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.quietHours && rules.quietHours.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.quietHours && rules.quietHours.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.quiet.from','Desde')}</span>
              <input type="time" value={rules.quietHours.from} onChange={e => update({ quietHours: { ...rules.quietHours, from: e.target.value } })}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.quiet.to','Hasta')}</span>
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
                return diff === 0 ? T('rules.quiet.noWindow','Sin franja') : ((h ? h + 'h ' : '') + (m ? m + 'min' : '') + ' ' + T('rules.quiet.duration','en silencio'));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* VACATION MODE · pausa con fecha de fin */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:`1px solid ${rules.vacation && rules.vacation.enabled ? channelColor : 'var(--line)'}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.vacation.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.vacation.sub','Pausa todas las notificaciones hasta la fecha que elijas.')}</div>
          </div>
          <button onClick={() => update({ vacation: { ...rules.vacation, enabled: !rules.vacation.enabled } })} aria-label="Toggle vacation"
            style={{ width:48, height:26, background: rules.vacation && rules.vacation.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.vacation && rules.vacation.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.vacation && rules.vacation.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.vacation.until','Hasta')}</span>
              <input type="date" value={rules.vacation.until || ''} onChange={e => update({ vacation: { ...rules.vacation, until: e.target.value } })}
                min={new Date().toISOString().slice(0,10)}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            {rules.vacation.until && (() => {
              const lang2 = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
              const locale = lang2 === 'en' ? 'en-US' : lang2 === 'pt' ? 'pt-BR' : 'es-ES';
              return <div style={{ fontSize: 12, color:'var(--fg-muted)' }}>{T('rules.vacation.reactivate','Te reactivamos automáticamente el')} {new Date(rules.vacation.until).toLocaleDateString(locale, { weekday:'long', day:'numeric', month:'short' })}</div>;
            })()}
          </div>
        )}
      </div>

      {/* SMART REMINDER · evitar repetir contenido ya visto */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.smart.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.smart.sub','BeonAI evita recordarte contenido que ya viste.')}</div>
          </div>
          <button onClick={() => update({ smartReminder: !rules.smartReminder })} aria-label="Toggle smart reminder"
            style={{ width:48, height:26, background: rules.smartReminder ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.smartReminder ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
      </div>

      {/* PRIORITY */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('rules.priority.title')}</div>
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
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [subs, setSubs] = useEV2(() => (window.Subscriptions ? window.Subscriptions.get() : { categories:{}, skills:{}, teams:{}, trainers:{} }));
  const [activeGroup, setActiveGroup] = useEV2('categories');
  useEE2(() => {
    const onChange = (e) => setSubs(e.detail);
    window.addEventListener('subscriptions-changed', onChange);
    return () => window.removeEventListener('subscriptions-changed', onChange);
  }, []);

  const CAT = (window.Subscriptions && window.Subscriptions.CATALOG) || { categories:[], skills:[], teams:[], trainers:[] };
  const TABS = [
    { id:'categories', label:T('subs.tab.categories'), icon:'🗂', items: CAT.categories || [] },
    { id:'skills',     label:T('subs.tab.skills'),     icon:'🧠', items: CAT.skills     || [] },
    { id:'teams',      label:T('subs.tab.teams'),      icon:'👥', items: CAT.teams      || [] },
    { id:'trainers',   label:T('subs.tab.trainers'),   icon:'🎓', items: CAT.trainers   || [] },
  ];
  const active = TABS.find(t => t.id === activeGroup) || TABS[0];

  const toggle = (id) => window.Subscriptions && window.Subscriptions.toggle(activeGroup, id);
  const total = window.Subscriptions ? window.Subscriptions.totalCount() : 0;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('subs.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('subs.activeCount').replace('{n}', total)}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>
        {T('subs.sub')}
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
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700, marginBottom: 8 }}>{T('subs.summary')}</div>
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
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [prefs, setPrefs] = useEV2(() => (window.ContentPush ? window.ContentPush.get() : {}));
  useEE2(() => {
    const onChange = (e) => setPrefs(e.detail);
    window.addEventListener('content-push-changed', onChange);
    return () => window.removeEventListener('content-push-changed', onChange);
  }, []);

  // Tipos de contenido · enriquecidos con traducción i18n por id
  const rawTypes = (window.ContentPush && window.ContentPush.TYPES) || [];
  const types = rawTypes.map(t => ({
    ...t,
    label: T('content.types.' + t.id, t.label),
    desc:  T('content.types.' + t.id + '.sub', t.desc),
  }));
  const enabledCount = types.filter(t => prefs.types && prefs.types[t.id]).length;

  const FLAGS = [
    { key:'autoReceive',   label:T('content.flag.auto'),     desc:T('content.flag.auto.sub','Llega solo, sin que pidas que te lo envíen.') },
    { key:'showSummary',   label:T('content.flag.summary'),  desc:T('content.flag.summary.sub','Antes del enlace, una línea con lo que vas a aprender.') },
    { key:'showThumbnail', label:T('content.flag.thumb'),    desc:T('content.flag.thumb.sub','Imagen de portada con botón "Ver ahora".') },
    { key:'showDuration',  label:T('content.flag.duration'), desc:T('content.flag.duration.sub','Muestra cuánto dura antes de que abras.') },
    { key:'openInSolid',   label:T('content.flag.openSolid'),desc:T('content.flag.openSolid.sub','Al hacer click, abrir dentro de la plataforma (no en web pública).') },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('content.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('content.count').replace('{n}', enabledCount).replace('{total}', types.length)}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>{T('content.sub')}</div>

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
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('content.format.title')}</div>
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
            <div style={{ fontSize: 12.5, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('content.preview.title')}</div>
            {prefs.showSummary && (
              <div style={{ fontSize: 11, color:'var(--fg-muted)', lineHeight: 1.45, marginBottom: 8 }}>{T('content.preview.desc')}</div>
            )}
            <button style={{ padding:'7px 12px', background: channelColor, color:'#fff', border:'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor:'pointer', width:'100%' }}>
              {prefs.openInSolid ? T('content.preview.cta.solid') : T('content.preview.cta.web')}
            </button>
            <div style={{ fontSize: 9, color:'var(--fg-dim)', marginTop: 6, fontFamily:'var(--font-mono)' }}>{T('content.preview.pushManual')}</div>
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
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
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
        <h3 style={{ margin:'0 0 4px', fontFamily:'var(--font-sans)', fontSize: 16, color:'var(--fg)' }}>{T('matrix.empty.title')}</h3>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('matrix.empty.desc')}</div>
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
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('matrix.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {TYPES.length} · {connected.length}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 18 }}>
        {T('matrix.sub')}
      </div>

      {/* MATRIZ · columnas por canal, filas por tipo */}
      <div style={{ display:'grid', gridTemplateColumns: `220px repeat(${connected.length}, minmax(180px, 1fr))`, gap: 0, border:'1px solid var(--line)', borderRadius: 14, overflow:'hidden', background:'var(--bg-surface)' }}>
        {/* HEADER · primera fila */}
        <div style={{ padding:'14px 16px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight: 700 }}>
          {T('matrix.col.type')}
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
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{T('matrix.activeOfTotal').replace('{n}', channelOn).replace('{total}', TYPES.length)}</div>
                </div>
                {chState.primary === c.id && (
                  <div title="Canal principal" style={{ fontSize: 12, color: c.color, fontWeight: 800 }}>★</div>
                )}
              </div>
              <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                <button onClick={() => setAll(c.id, !allOn)} title={allOn ? 'Desactivar todas' : 'Activar todas'}
                  style={{ flex: 1, padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background:'transparent', border:`1px solid ${c.color}55`, color: c.color, borderRadius: 6, cursor:'pointer' }}>
                  {allOn ? T('matrix.deactivateAll') : T('matrix.activateAll')}
                </button>
                <button onClick={() => sendTest(c)} title={T('common.test') + ' → ' + c.label}
                  style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background: c.color, border:'none', color:'#fff', borderRadius: 6, cursor:'pointer' }}>
                  {T('matrix.testBtn')}
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
          {T('matrix.tip')}
        </div>
        {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied' && (
          <button onClick={() => window.TestSends && window.TestSends.requestPermission()}
            style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--accent)', color:'var(--accent)', borderRadius: 8, cursor:'pointer', fontSize: 11.5, fontFamily:'var(--font-sans)', fontWeight: 700 }}>
            {T('matrix.activateNative')}
          </button>
        )}
        <button onClick={() => { window.ChannelNotifs && window.ChannelNotifs.reset(); }}
          style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 11.5, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          {T('matrix.reset')}
        </button>
      </div>

      {/* Historial de tests · solo si hay envíos */}
      {history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight: 700, marginBottom: 8 }}>{T('matrix.lastTests')} · {history.length}</div>
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


// ── Channel Manager Panel ─────────────────────────────────────────────────
function ChannelManagerPanel({ chState, catalog }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
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
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{T('channels.connected.title')}</h2>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{T('channels.connected.sub').replace('{n}', connectedCount).replace('{total}', catalog.filter(c => c.available).length)}</div>
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
                <div style={{ position:'absolute', top: -10, left: 12, padding:'2px 8px', background: c.color, color:'#fff', fontFamily:'var(--font-mono)', fontSize: 9, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, borderRadius: 999 }}>{T('channels.primary')}</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color:'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight:1.4 }}>{c.desc}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius:'50%', background: connected ? '#22C55E' : 'var(--fg-dim)', boxShadow: connected ? '0 0 0 3px rgba(34,197,94,0.18)' : 'none', flexShrink:0 }} title={connected ? T('rules.active') : T('common.deactivate')}/>
              </div>

              {!c.available && (
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.06em', color:'var(--fg-dim)', textTransform:'uppercase', fontWeight:700 }}>{T('channels.soon')}</div>
              )}

              {connected && (
                <div style={{ padding: '8px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.06em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('channels.account')}</div>
                    <div style={{ fontSize: 12.5, color:'var(--fg)', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{state.account}</div>
                  </div>
                  {since != null && (
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', whiteSpace:'nowrap' }}>{since === 0 ? T('channels.today') : (T('channels.daysAgo','hace {n}d').replace('{n}', since))}</div>
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
                    {isConnecting ? T('channels.connecting') : (c.authType === 'oauth' ? '🔐 ' + T('channels.connect') + ' (OAuth)' : c.authType === 'phone' ? '📱 ' + T('channels.connect') : '🔔 ' + T('common.activate'))}
                  </button>
                )}
                {connected && !primary && (
                  <button onClick={() => window.Channels && window.Channels.setPrimary(c.id)} style={{
                    padding:'7px 10px', background:'transparent', border:`1px solid ${c.color}`, color: c.color, borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 11.5,
                  }}>{T('channels.markPrimary')}</button>
                )}
                {connected && (
                  <button onClick={() => window.Channels && window.Channels.reauth(c.id)} title="Re-authenticate OAuth" style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.reauth')}</button>
                )}
                {connected && (
                  <button onClick={() => { if (confirm(T('channels.confirmDisconnect') + ' ' + c.label + '?')) window.Channels && window.Channels.disconnect(c.id); }} style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.disconnect')}</button>
                )}
                {!c.available && (
                  <button disabled style={{
                    flex: 1, padding:'9px 12px', background:'var(--bg-surface)', color:'var(--fg-dim)', border:'1px dashed var(--line)', borderRadius: 8,
                    cursor:'not-allowed', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.soon')}</button>
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
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const lang = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
  const [prefs, setPrefs] = useEV2(() => (window.DeliveryPrefs && window.DeliveryPrefs.get()) || {});
  // Día abreviado y largo · localizado
  const DAY_NAMES = {
    es: { short:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], long:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'] },
    en: { short:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], long:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    pt: { short:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], long:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'] },
  };
  const dayLabels = (DAY_NAMES[lang] || DAY_NAMES.es).short;
  const dayLabelsLong = (DAY_NAMES[lang] || DAY_NAMES.es).long;

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
    { id:'daily',    label:T('delivery.mode.daily'),    icon:'☀️', desc:T('delivery.mode.daily.sub') },
    { id:'weekdays', label:T('delivery.mode.weekdays'), icon:'💼', desc:T('delivery.mode.weekdays.sub') },
    { id:'weekends', label:T('delivery.mode.weekends'), icon:'🏖',  desc:T('delivery.mode.weekends.sub') },
    { id:'weekly',   label:T('delivery.mode.weekly'),   icon:'📅', desc:T('delivery.mode.weekly.sub') },
    { id:'custom',   label:T('delivery.mode.custom'),   icon:'⚙️', desc:T('delivery.mode.custom.sub') },
    { id:'smart-ai', label:T('delivery.mode.smart'),    icon:'✨', desc:T('delivery.mode.smart.sub') },
  ];

  const activeDayCount = (prefs.days || []).filter(Boolean).length;
  const isSmart = prefs.mode === 'smart-ai';

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{T('delivery.title')}</h2>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>{T('delivery.sub')}</div>

      {/* ENABLED toggle + Next delivery card */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom: 24 }}>
        <div style={{ padding:'18px 22px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:14.5, fontWeight:700, color:'var(--fg)' }}>{T('delivery.enabled.label')}</div>
            <div style={{ fontSize:12, color:'var(--fg-muted)', marginTop:3 }}>{prefs.enabled ? T('delivery.enabled.on') : T('delivery.enabled.off')}</div>
          </div>
          <button onClick={() => update({ enabled: !prefs.enabled })} aria-label="Toggle delivery"
            style={{ width:48, height:26, background: prefs.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: prefs.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        <div style={{ padding:'18px 22px', background:`linear-gradient(135deg, ${channelColor}14 0%, transparent 100%)`, border:`1px solid ${channelColor}40`, borderRadius:14 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:5 }}>{T('delivery.next')}</div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--fg)' }}>{prefs.enabled ? nextLabel : T('delivery.paused')}</div>
        </div>
      </div>

      {/* MODE selector */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('delivery.mode.title')}</div>
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
        {T('delivery.days.title')} {isSmart && <span style={{ color: channelColor }}>{T('delivery.days.byBeonai')}</span>}
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
          {T('delivery.days.count').replace('{n}', activeDayCount)}
        </div>
      </div>

      {/* TIME + TIMEZONE */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 200px', gap:16, marginBottom: 24, alignItems:'flex-end' }}>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>{T('delivery.time.title')}</span>
          <input type="time" value={prefs.time || '09:00'} onChange={e => update({ time: e.target.value })} disabled={isSmart}
            style={{ padding:'10px 14px', fontSize:14, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10, opacity: isSmart ? 0.5 : 1 }}/>
        </label>
        <div style={{ alignSelf:'center', fontSize:12, color:'var(--fg-muted)', padding:'10px 14px', background:`${channelColor}08`, border:`1px solid ${channelColor}25`, borderRadius:10 }}>
          {isSmart
            ? <span>✨ <strong style={{color:channelColor}}>BeonAI</strong> {T('delivery.smartExplain','elige el horario óptimo según tu historial: cuando más interactúas, evitando bloques de reuniones y respetando tus quiet hours.').replace('✨ BeonAI ', '').replace('✨ ', '')}</span>
            : (() => {
                const limit = prefs.maxPerDay > 1
                  ? T('delivery.maxPerDayMulti','Hasta {n} mensajes/día.').replace('{n}', prefs.maxPerDay)
                  : T('delivery.maxPerDay','1 mensaje al día como máximo');
                const tpl = T('delivery.recvExplain','Recibirás el contenido a las {time}. {limit}');
                const parts = tpl.split('{time}');
                const before = parts[0];
                const afterRaw = (parts[1] || '').replace('{limit}', limit);
                return <span>{before}<strong style={{color:channelColor}}>{prefs.time || '09:00'}</strong>{afterRaw}</span>;
              })()
          }
        </div>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>{T('delivery.tz.title')}</span>
          <select value={prefs.timezone || 'auto'} onChange={e => update({ timezone: e.target.value })}
            style={{ padding:'10px 14px', fontSize:13, background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10 }}>
            <option value="auto">{T('delivery.tz.auto')} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
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
          <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{T('delivery.maxDaily.title')}</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('delivery.maxDaily.sub')}</div>
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
            else if (window.Toast) window.Toast.info(T('delivery.testWarn'), { icon:'⚠️' });
          }}
            style={{ padding:'8px 14px', background: channelColor, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:700 }}>
            {T('delivery.testBtn')}
          </button>
        )}
        <div style={{ flex:1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          {T('delivery.autoSave','Auto-save · last update')} {new Date(prefs.updatedAt || Date.now()).toLocaleTimeString(lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   InboxView · listado de notificaciones · API real Inbox.getAll()
   ============================================================ */
function InboxView({ openDetail }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
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
    { id:'messages',      label:T('inbox.tab.messages'),  icon:'💬', count:(data.messages||[]).filter(m => !m.read).length },
    { id:'notifications', label:T('inbox.tab.notifs'),    icon:'🔔', count:(data.notifications||[]).filter(m => !m.read).length },
    { id:'releases',      label:T('inbox.tab.releases'),  icon:'✨', count:(data.releases||[]).filter(m => !m.read).length },
  ];

  // Resuelve título · cuerpo · icono según el tipo de elemento (messages/notifications/releases)
  const _titleOf = (m) => m.title || m.subject || m.summary || m.text || 'Sin asunto';
  const _bodyOf  = (m) => m.body  || m.preview || m.message || m.description || (m.title ? '' : m.text) || '';
  const _iconOf  = (m) => m.icon || (tab === 'releases' ? '✨' : tab === 'messages' ? '💬' : '🔔');

  const PILLS_BY_ID = ((D && D.PILLS) || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  const onItemClick = (m) => {
    if (window.Inbox && window.Inbox.markRead) window.Inbox.markRead(tab, m.id);
    // Si la notificación tiene `link` con pill id → abre el detalle
    if (m && m.link && openDetail) {
      const linkStr = String(m.link);
      const pillId = linkStr.startsWith('pill:') ? linkStr.slice(5) : linkStr;
      const pill = PILLS_BY_ID[pillId];
      if (pill) openDetail(pill);
    }
  };

  const renderItem = (m) => {
    const title = _titleOf(m);
    const body  = _bodyOf(m);
    const icon  = _iconOf(m);
    const isAchievement = m.kind === 'achievement';
    return (
      <article key={m.id} style={{
        padding: 18, marginBottom: 10, background: m.read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        border: `1px solid var(--line)`,
        borderLeft: m.read ? '1px solid var(--line)' : `3px solid ${isAchievement ? 'var(--ok)' : 'var(--accent)'}`,
        borderRadius: 'var(--r-2)', cursor: 'pointer', display:'flex', gap: 12,
      }} onClick={() => onItemClick(m)}>
        <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: isAchievement ? 'rgba(34,197,94,0.16)' : 'var(--bg-elevated)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{title}</div>
            <div style={{ fontSize: 11, color:'var(--fg-dim)', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
              {m.time || (m.createdAt && new Date(m.createdAt).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })) || ''}
            </div>
          </div>
          {body && <div style={{ fontSize: 13, color:'var(--fg-muted)', lineHeight: 1.5 }}>{body}</div>}
          {m.from && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', marginTop: 6 }}>De · {m.from}</div>}
          {m.version && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', marginTop: 6 }}>v{m.version}</div>}
        </div>
        {tab !== 'releases' && (
          <button onClick={(e) => { e.stopPropagation(); if (confirm('¿Borrar este elemento?')) { window.Inbox && window.Inbox.deleteItem && window.Inbox.deleteItem(tab, m.id); } }}
            title="Borrar" aria-label="Borrar"
            style={{ width: 28, height: 28, padding: 0, flexShrink: 0, background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 14, alignSelf:'flex-start' }}>
            ×
          </button>
        )}
      </article>
    );
  };

  const totalAll = (data.messages||[]).length + (data.notifications||[]).length + (data.releases||[]).length;

  return (
    <PageShell
      eyebrow={`Bandeja · ${totalAll} elementos`}
      title={<>Tus <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>notificaciones</em></>}
      sub={totalUnread > 0 ? `${totalUnread} ${T('inbox.unread').toLowerCase()}` : ''}
      actions={items.length > 0 && unread.length > 0 ? (
        <button onClick={() => window.Inbox && window.Inbox.markAllRead && window.Inbox.markAllRead(tab)}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>
          {T('inbox.markAllRead')}
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
          <div style={{ fontSize: 16, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('inbox.empty')}</div>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('inbox.emptyDesc')}</div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>{T('inbox.unread')} · {unread.length}</h2>
              {unread.map(renderItem)}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>{T('inbox.read')} · {read.length}</h2>
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
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const [bmIds, setBmIds] = useEV2(() => (window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get()) || []);
  useEE2(() => {
    const onChange = () => setBmIds((window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get()) || []);
    window.addEventListener('bookmarks-changed', onChange);
    return () => window.removeEventListener('bookmarks-changed', onChange);
  }, []);
  const saved = PILLS.filter(p => bmIds.includes(p.id));

  return (
    <PageShell
      eyebrow={T('saved.eyebrow')}
      title={<>{T('saved.title')}</>}
      sub={`${saved.length} ${T('saved.count')}`}>

      {saved.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔖</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>{T('saved.empty')}</div>
          <div style={{ fontSize: 13.5, color: 'var(--fg-muted)' }}>{T('saved.emptyDesc')}</div>
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
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const PILLS = (D && D.PILLS) || [];
  const completed = PILLS.filter(p => p.progress >= 1).length;
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1).length;
  const [editing, setEditing] = useEV2(false);
  const [name, setName] = useEV2(USER.name || '');
  const [role, setRole] = useEV2(USER.role || '');
  const [team, setTeam] = useEV2(USER.team || '');

  // Reset cuando el usuario cambia (login/logout)
  useEE2(() => {
    setName(USER.name || ''); setRole(USER.role || ''); setTeam(USER.team || '');
  }, [USER.id]);

  const handleLogout = () => {
    if (!confirm(T('profile.confirmLogout') + ' ' + USER.name + '?')) return;
    if (window.Auth && window.Auth.logout) window.Auth.logout();
  };

  const saveEdits = () => {
    if (window.UserProfile && window.UserProfile.update) {
      window.UserProfile.update({ name, role, team });
      if (window.Toast) window.Toast.success(T('profile.updated'), { icon:'✓' });
    }
    setEditing(false);
  };
  const cancelEdits = () => {
    setName(USER.name || ''); setRole(USER.role || ''); setTeam(USER.team || '');
    setEditing(false);
  };

  return (
    <PageShell
      eyebrow={T('profile.title')}
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
        {!editing && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700, color: 'var(--fg)', margin: 0, marginBottom: 4 }}>{USER.name}</h2>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 12 }}>{USER.role} · {USER.team}</div>
            {(USER.systemRole === 'admin' || USER.isAdmin) && <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 9px', background:'var(--warn)', color:'#fff', borderRadius:4, marginRight: 6 }}>ADMIN</span>}
            {USER.systemRole === 'manager' && <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 9px', background:'var(--accent)', color:'#fff', borderRadius:4 }}>MANAGER</span>}
          </div>
        )}
        {editing && (
          <div style={{ flex: 1, display:'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.name')}</span>
              <input value={name} onChange={e => setName(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.team')}</span>
              <input value={team} onChange={e => setTeam(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:4, gridColumn:'1 / -1' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.role')}</span>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}>
                {['Publish Agent','Care Agent','Reporting Agent','Manager','Analyst','Content Lead','Otro'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: T('profile.stats.completed'), value: completed, color: 'var(--ok)' },
          { label: T('profile.stats.inProgress'), value: inProgress, color: 'var(--accent)' },
          { label: T('profile.stats.daysActive'), value: 14, color: 'var(--info)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'var(--font-sans)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            padding: '12px 20px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            boxShadow:'0 4px 12px rgba(89,71,255,0.30)',
          }}>{T('profile.editBtn')}</button>
        )}
        {editing && (
          <>
            <button onClick={saveEdits} style={{
              padding: '12px 20px', background: 'var(--ok)', color: '#fff',
              border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            }}>✓ {T('common.save')}</button>
            <button onClick={cancelEdits} style={{
              padding: '12px 20px', background: 'transparent', color: 'var(--fg-muted)',
              border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
            }}>{T('common.cancel')}</button>
          </>
        )}
        <button onClick={() => setView('settings')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.settings')}</button>
        <button onClick={() => setView('saved')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.saved')}</button>
        <button onClick={() => setView('path')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.path')}</button>
        <button onClick={handleLogout} style={{
          padding: '12px 20px', background: 'transparent', color: 'var(--accent)',
          border: '1px solid var(--accent)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, marginLeft: 'auto',
        }}>{T('common.logout')}</button>
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
  // IMPORTANTE: usar hex directo (no CSS var) porque varios panels hacen
  // concatenación como `${channelColor}12` para alpha · CSS var() rompe ahí.
  const accentColor = '#6E50EE';

  const save = (key, val) => {
    if (window.Settings && window.Settings.update) window.Settings.update({ [key]: val });
  };

  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const themeLabels = { light: T('settings.theme.light'), dark: T('settings.theme.dark'), auto: T('settings.theme.auto') };

  return (
    <PageShell
      eyebrow={T('settings.eyebrow')}
      title={<>{T('settings.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}/></>}
      sub="">

      {/* General · tema + idioma */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{T('settings.general')}</h2>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>{T('settings.general.sub')}</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
          {/* Tema */}
          <div style={{ padding: 20, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <h3 style={{ fontFamily:'var(--font-sans)', fontSize:14.5, fontWeight: 700, color:'var(--fg)', margin:'0 0 4px' }}>{T('settings.theme.title')}</h3>
            <p style={{ fontSize: 12, color:'var(--fg-muted)', margin:'0 0 12px' }}>{T('settings.theme.desc')}</p>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              {[{k:'light'}, {k:'dark'}, {k:'auto'}].map(ti => (
                <button key={ti.k} onClick={() => { setTheme(ti.k); save('theme', ti.k); }} style={{
                  padding:'8px 14px', fontFamily:'var(--font-sans)', fontSize: 12.5, fontWeight: 600,
                  background: theme === ti.k ? 'var(--fg)' : 'var(--bg-elevated)',
                  color: theme === ti.k ? 'var(--bg-canvas)' : 'var(--fg-muted)',
                  border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer',
                }}>{themeLabels[ti.k]}</button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div style={{ padding: 20, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12 }}>
            <h3 style={{ fontFamily:'var(--font-sans)', fontSize: 14.5, fontWeight: 700, color:'var(--fg)', margin:'0 0 4px' }}>{T('settings.language.title')}</h3>
            <p style={{ fontSize: 12, color:'var(--fg-muted)', margin:'0 0 12px' }}>{T('settings.language.desc')}</p>
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

      {/* PUSH NOTIFICATIONS · Web Push API · suscripción del dispositivo */}
      <PushNotificationsPanel/>

      {/* SMART SCHEDULING · IA con análisis del mejor horario */}
      <SmartSchedulingPanel/>

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
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  if (!USER.isAdmin) {
    return (
      <PageShell title={T('admin.locked')} sub={T('admin.lockedDesc','Solo administradores pueden ver este panel.')}>
        <div style={{ padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔒</div>
          <button onClick={() => setView('home')} style={{
            marginTop: 16, padding: '12px 24px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700,
          }}>{T('admin.backHome','Volver al inicio')}</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={T('admin.eyebrow')}
      title={<>{T('admin.title')}</>}
      sub={T('admin.sub')}
      actions={
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 20px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>{T('admin.full')}</button>
      }>

      {/* KPIs reales · derivados de Auth + Invitations + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(() => {
          const users   = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
          const invites = (window.Invitations && window.Invitations.list && window.Invitations.list()) || [];
          const pendingInv = invites.filter(i => i.status === 'pending' || i.status === 'invited' || !i.status).length;
          const PILLS = (D && D.PILLS) || [];
          const completedTotal = PILLS.filter(p => p.progress >= 1).length;
          const ratingStats = (window.Ratings && window.Ratings.globalStats && window.Ratings.globalStats()) || { avg: 0, count: 0 };
          const avgRating = ratingStats.avg || 0;
          const ratingsCount = ratingStats.count || 0;
          const adminCount = users.filter(u => u.systemRole === 'admin' || u.isAdmin).length;
          const usersSubKey = adminCount === 1 ? 'admin.users.sub' : 'admin.users.subMulti';
          const ratingsSubKey = ratingsCount === 1 ? 'admin.rating.subOne' : 'admin.rating.sub';
          return [
            { title: T('admin.users'),     value: String(users.length),    desc: T(usersSubKey,'{n} admin · plataforma').replace('{n}', adminCount), icon: '👥' },
            { title: T('admin.pending'),   value: String(pendingInv),       desc: T('admin.pending.sub','esperando aceptar'), icon: '✉️' },
            { title: T('admin.completed'), value: String(completedTotal),   desc: T('admin.completed.sub','de {total} disponibles').replace('{total}', PILLS.length), icon: '✓' },
            { title: T('admin.rating'),    value: avgRating ? avgRating.toFixed(1) + ' ★' : '—', desc: T(ratingsSubKey,'{n} puntuaciones').replace('{n}', ratingsCount), icon: '★' },
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
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginTop: 0, marginBottom: 8 }}>{T('admin.full.title','Para gestionar todo')}</h2>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 14 }}>{T('admin.full.desc','El panel completo de admin incluye: invitar usuarios (CSV bulk), revisar submissions de vídeo, audit log, bulk actions, exportar reportes.')}</p>
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 24px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>{T('admin.full.btn','Abrir panel admin completo →')}</button>
      </div>

      {/* Workspaces · multi-tenant management */}
      <WorkspacesPanel/>
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

// ── WorkspacesPanel · admin only · CRUD de tenants ───────────────────────
function WorkspacesPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [, setTick] = useEV2(0);
  const [creating, setCreating] = useEV2(false);
  const [name, setName] = useEV2('');
  const [color, setColor] = useEV2('#6E50EE');
  useEE2(() => {
    const refresh = () => setTick(x => x + 1);
    window.addEventListener('workspaces-changed', refresh);
    window.addEventListener('workspace-changed', refresh);
    return () => {
      window.removeEventListener('workspaces-changed', refresh);
      window.removeEventListener('workspace-changed', refresh);
    };
  }, []);

  if (!window.Workspaces || !window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;
  const list = window.Workspaces.list();
  const current = window.Workspaces.current();

  const create = async () => {
    if (!name.trim()) return;
    // create puede ser sync (modo demo) o async (modo Supabase). Await sirve para ambos.
    // Ambos paths emiten su propio toast internamente, no duplicamos aquí.
    await Promise.resolve(window.Workspaces.create({ name: name.trim(), primaryColor: color }));
    setName(''); setCreating(false);
  };

  return (
    <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 14, gap: 12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color:'var(--fg)', marginTop: 0, marginBottom: 4 }}>🏢 {T('workspaces.title')}</h2>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('workspaces.sub')}</div>
        </div>
        <button onClick={() => setCreating(c => !c)} style={{ padding:'10px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r-1)', cursor:'pointer', fontWeight:700, fontSize: 12.5 }}>
          {creating ? T('common.cancel') : T('workspaces.create')}
        </button>
      </div>

      {creating && (
        <div style={{ padding: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 10, marginBottom: 14, display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={T('workspaces.namePh')} autoFocus
            onKeyDown={e => { if (e.key === 'Enter') create(); }}
            style={{ flex: 1, minWidth: 180, padding:'9px 12px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8, fontSize: 13, color:'var(--fg)', outline:'none' }}/>
          <label style={{ display:'inline-flex', alignItems:'center', gap: 8, fontSize: 12, color:'var(--fg-muted)' }}>
            <span>{T('workspaces.colorLabel')}</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 36, height: 32, border:'1px solid var(--line)', borderRadius: 6, padding: 2, cursor:'pointer', background:'var(--bg-surface)' }}/>
          </label>
          <button onClick={create} disabled={!name.trim()} style={{ padding:'9px 16px', background:'var(--ok)', color:'#fff', border:'none', borderRadius: 8, cursor: name.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12.5, opacity: name.trim() ? 1 : 0.5 }}>
            {T('common.save')}
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ padding: 40, textAlign:'center', color:'var(--fg-muted)', fontSize: 13 }}>{T('workspaces.empty')}</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {list.map(w => {
            const members = window.Workspaces.membersOf(w.id);
            const isActive = current && current.id === w.id;
            const memberKey = members.length === 1 ? 'workspaces.members' : 'workspaces.membersMulti';
            return (
              <div key={w.id} style={{
                padding:'14px 16px', background: isActive ? `linear-gradient(135deg, ${w.primaryColor}14 0%, var(--bg-surface) 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${isActive ? w.primaryColor : 'var(--line)'}`,
                borderRadius: 12, position:'relative',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: w.primaryColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {w.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{w.name}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{T(memberKey,'{n} miembros').replace('{n}', members.length)}</div>
                  </div>
                  {isActive && <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background: w.primaryColor, color:'#fff', borderRadius: 4, letterSpacing:'0.06em' }}>✓ ACTIVO</span>}
                </div>
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                  {!isActive && (
                    <button onClick={() => window.Workspaces.setCurrent(w.id)} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${w.primaryColor}`, color: w.primaryColor, borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                      Activar
                    </button>
                  )}
                  <button onClick={() => {
                      if (confirm(T('workspaces.confirmDelete').replace('{name}', w.name))) {
                        window.Workspaces.remove(w.id);
                        if (window.Toast) window.Toast.info('Workspace eliminado');
                      }
                    }}
                    style={{ padding:'6px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 600 }}>
                    {T('common.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── ManagerView · panel del líder de equipo · KPIs + miembros + invitar ──
function ManagerView({ setView }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const allUsers = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
  // Miembros del equipo del manager (mismo team)
  const teamMembers = allUsers.filter(u => u.team && USER.team && u.team === USER.team && u.id !== USER.id);
  const PILLS = (D && D.PILLS) || [];
  const completedTotal = PILLS.filter(p => p.progress >= 1).length;

  const KPIS = [
    { icon:'👥', label: T('manager.kpi.team','Miembros de tu equipo'),    value: String(teamMembers.length),                                desc: USER.team || '—' },
    { icon:'📚', label: T('manager.kpi.completed','Pills completadas'),    value: String(completedTotal),                                    desc: T('manager.kpi.completedSub','total acumulado del equipo') },
    { icon:'⚡',  label: T('manager.kpi.avg','Progreso medio'),            value: PILLS.length ? Math.round((completedTotal / PILLS.length) * 100) + '%' : '—', desc: T('manager.kpi.avgSub','vs total catálogo') },
    { icon:'🎯', label: T('manager.kpi.openInvites','Invitaciones abiertas'),
      value: (() => {
        const invs = (window.Invitations && window.Invitations.list && window.Invitations.list()) || [];
        return String(invs.filter(i => (i.status === 'pending' || i.status === 'invited' || !i.status) && i.invitedBy === USER.id).length);
      })(),
      desc: T('manager.kpi.openInvitesSub','enviadas por ti') },
  ];

  return (
    <PageShell
      eyebrow={T('manager.eyebrow','Panel · Manager')}
      title={<>{T('manager.title','Tu equipo')}</>}
      sub={T('manager.sub','Visión de progreso, KPIs y gestión de los miembros de tu equipo')}
      actions={Auth.can && Auth.can('admin.viewPanel') ? (
        <button onClick={() => setView('admin')} style={{
          padding:'12px 20px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)',
          borderRadius:'var(--r-1)', cursor:'pointer', fontWeight:600, fontSize:14,
        }}>{T('manager.gotoAdmin','Panel admin →')}</button>
      ) : null}>

      {/* KPIs del equipo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ padding: 20, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color:'var(--fg)', fontFamily:'var(--font-sans)', letterSpacing:'-0.02em', marginBottom: 3 }}>{k.value}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)' }}>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Lista de miembros */}
      <section>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 16, gap:12, flexWrap:'wrap' }}>
          <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('manager.members','Miembros del equipo')}</h2>
          {Auth.can && Auth.can('team.inviteUser') && (
            <button onClick={() => setView('admin')} style={{
              padding:'10px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r-1)',
              cursor:'pointer', fontWeight:700, fontSize: 12.5, boxShadow:'0 4px 12px rgba(110,80,238,0.30)',
            }}>{T('manager.invite','✉ Invitar miembro')}</button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div style={{ padding: 60, textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.45 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('manager.empty','Aún no tienes miembros en tu equipo')}</div>
            <div style={{ fontSize: 12.5, color:'var(--fg-muted)' }}>{T('manager.emptyDesc','Invita a tus colegas usando el botón superior.')}</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {teamMembers.map(m => (
              <div key={m.id} style={{ padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius:'50%', background: m.avatarColor || 'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                  {(m.name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)' }}>{m.role}</div>
                </div>
                {m.systemRole === 'manager' && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background:'var(--accent)', color:'#fff', borderRadius: 4, letterSpacing:'0.08em' }}>MANAGER</span>
                )}
                {m.systemRole === 'admin' && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background:'var(--warn)', color:'#fff', borderRadius: 4, letterSpacing:'0.08em' }}>ADMIN</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

window.ManagerView_New = ManagerView;
