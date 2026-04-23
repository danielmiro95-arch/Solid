// prototype-home.jsx — SOLID · Repsol × BeonIt

const { useState } = React;

// ── Repsol / Sprinklr training data ──────────────────────────────────────
const PILLS = [
  { id: 'p1', title: 'Crear y gestionar campañas en Sprinklr', teacher: 'Carlos Vega', duration: '4 min', tone: 'teal', format: 'módulo', progress: 100, level: 'principiante', rating: 4.9, enrolled: 247, category: 'Publicación' },
  { id: 'p2', title: 'Flujo de aprobación de contenido', teacher: 'Sara Molina', duration: '3 min', tone: 'clay', format: 'módulo', progress: 75, level: 'principiante', rating: 4.8, enrolled: 247, category: 'Publicación' },
  { id: 'p3', title: 'Programar posts y gestión de calendario', teacher: 'Carlos Vega', duration: '5 min', tone: 'plum', format: 'módulo', progress: 40, level: 'intermedio', rating: 4.7, enrolled: 210, category: 'Calendario' },
  { id: 'p4', title: 'Monitorización y alertas en tiempo real', teacher: 'Ana García', duration: '4 min', tone: 'olive', format: 'módulo', progress: 0, level: 'intermedio', rating: 4.6, enrolled: 190, category: 'Analytics' },
  { id: 'p5', title: 'Gestión de activos digitales en DAM', teacher: 'Luis Romero', duration: '3 min', tone: 'warm', format: 'módulo', progress: 0, level: 'principiante', rating: 4.5, enrolled: 175, category: 'Activos' },
  { id: 'p6', title: 'Compliance y gobernanza de contenido', teacher: 'Equipo Legal', duration: '5 min', tone: 'noir', format: 'módulo', progress: 0, level: 'avanzado', rating: 4.8, enrolled: 220, category: 'Compliance' },
];
const SERIES = [
  { id: 's1', title: 'Publish Agent: flujo completo de publicación', teacher: '6 lecciones · Carlos Vega', duration: '28 min', tone: 'teal', format: 'serie', level: 'principiante', rating: 4.9, enrolled: 247, category: 'Publicación' },
  { id: 's2', title: 'Sprinklr Analytics para Repsol', teacher: '5 lecciones · Ana García', duration: '22 min', tone: 'plum', format: 'serie', level: 'avanzado', rating: 4.8, enrolled: 160, category: 'Analytics' },
  { id: 's3', title: 'Gestión de crisis en redes sociales', teacher: '3 lecciones · Sara Molina', duration: '14 min', tone: 'clay', format: 'serie', level: 'avanzado', rating: 4.9, enrolled: 200, category: 'Crisis' },
  { id: 's4', title: 'Integración Sprinklr + herramientas Repsol', teacher: '4 lecciones · IT Team', duration: '18 min', tone: 'olive', format: 'serie', level: 'avanzado', rating: 4.7, enrolled: 130, category: 'Integración' },
];
const REELS = [
  { id: 'r1', title: 'Aprobar un post en 30 segundos', teacher: '@solid', duration: ':30', tone: 'teal', format: 'tip' },
  { id: 'r2', title: 'Crear una cola de publicación', teacher: '@solid', duration: ':45', tone: 'plum', format: 'tip' },
  { id: 'r3', title: 'Filtrar activos en el DAM', teacher: '@solid', duration: ':38', tone: 'olive', format: 'tip' },
  { id: 'r4', title: 'Configurar una alerta de mención', teacher: '@solid', duration: ':52', tone: 'clay', format: 'tip' },
  { id: 'r5', title: 'Ver métricas de una campaña', teacher: '@solid', duration: ':41', tone: 'warm', format: 'tip' },
  { id: 'r6', title: 'Etiquetar contenido correctamente', teacher: '@solid', duration: ':29', tone: 'noir', format: 'tip' },
];
const PODCASTS = [
  { id: 'c1', title: 'Estrategia digital de Repsol 2025', teacher: 'Dirección Comms · 22 min', duration: '22 min', tone: 'noir', format: 'charla', level: 'avanzado', rating: 4.8, enrolled: 247, category: 'Estrategia' },
  { id: 'c2', title: 'Cómo Sprinklr transforma el equipo', teacher: 'Carlos Vega · 18 min', duration: '18 min', tone: 'teal', format: 'charla', level: 'principiante', rating: 4.7, enrolled: 220, category: 'Publicación' },
];
const PATHS = [
  { id: 'pa1', title: 'Publish Agent · Certificación completa', teacher: '4 semanas · 12 módulos', duration: '3h 20m', tone: 'teal', format: 'ruta', level: 'principiante', rating: 4.9, enrolled: 247, category: 'Certificación' },
  { id: 'pa2', title: 'Sprinklr Avanzado para Repsol', teacher: '3 semanas · 9 módulos', duration: '2h 15m', tone: 'plum', format: 'ruta', level: 'avanzado', rating: 4.8, enrolled: 120, category: 'Avanzado' },
  { id: 'pa3', title: 'Crisis y compliance en RRSS', teacher: '2 semanas · 6 módulos', duration: '1h 30m', tone: 'clay', format: 'ruta', level: 'avanzado', rating: 4.7, enrolled: 98, category: 'Crisis' },
];

const CATEGORIES = ['Todo', 'Publicación', 'Analytics', 'Calendario', 'Compliance', 'Activos', 'Crisis', 'Certificación'];

// ── Components ────────────────────────────────────────────────────────────
function CategoryBar({ active, setActive }) {
  return (
    <div className="cat-bar">
      {CATEGORIES.map(c => (
        <button key={c} className={`cat-pill ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
      ))}
    </div>
  );
}

function Sidebar({ view, setView }) {
  const items = [
    { id: 'home',      label: 'Inicio',      icon: 'home' },
    { id: 'browse',    label: 'Catálogo',    icon: 'compass' },
    { id: 'path',      label: 'Mi ruta',     icon: 'book' },
    { id: 'dashboard', label: 'Dashboard',   icon: 'trend', badge: 'NEW' },
    { id: 'coach',     label: 'Agente IA',   icon: 'sparkle' },
    { id: 'saved',     label: 'Guardado',    icon: 'bookmark' },
    { id: 'profile',   label: 'Mi perfil',   icon: 'user' },
  ];
  return (
    <aside className="sb">
      <div className="sb-brand">
        <img src="beonit-logo.png" style={{height:28, width:'auto'}} alt="BeonIt"/>
        <span className="mark">Solid</span>
      </div>

      <div className="sb-org">
        <div className="sb-org-logo">R</div>
        <div>
          <div className="sb-org-name">Repsol</div>
          <div className="sb-org-sub">Formación Sprinklr</div>
        </div>
      </div>

      <button className="sb-search">
        <Icon name="search" size={14}/>
        <span>Buscar módulos…</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="sb-nav">
        {items.map(it => (
          <button key={it.id} className={`sb-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
            <span className="sb-icon"><Icon name={it.icon} size={15}/></span>
            {it.label}
            {it.badge && <span className="sb-badge sb-badge-new">{it.badge}</span>}
          </button>
        ))}
      </div>

      <div>
        <div className="sb-section-title">Mi progreso</div>
        <div className="sb-paths">
          <div className="sb-path" onClick={() => setView('path')}>
            <div className="sb-path-title">Publish Agent · Certificación</div>
            <div className="sb-progress"><i style={{width:'58%'}}/></div>
            <div className="sb-path-meta"><span>Módulo 7 / 12</span><span>·</span><span>58%</span></div>
          </div>
        </div>
      </div>

      <div className="sb-user">
        <div className="sb-avatar" style={{background:'var(--repsol-red)'}}>A</div>
        <div>
          <div className="sb-user-name">Amaia Ruiz</div>
          <div className="sb-user-role">Publish Agent · Repsol</div>
        </div>
      </div>
    </aside>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────
function Home({ openDetail, openPlayer, setView }) {
  const [activeCat, setActiveCat] = useState('Todo');
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 100);
  const allContent = [...PILLS, ...SERIES, ...PODCASTS, ...PATHS];
  const filtered = activeCat === 'Todo' ? allContent : allContent.filter(c => c.category === activeCat);

  return (
    <div className="main-inner">

      {/* Hero */}
      <section className="lms-hero">
        <div className="lms-hero-text">
          <div className="lms-hero-eyebrow">
            <span className="repsol-dot"/>Repsol · Formación Sprinklr
          </div>
          <h1>Domina Sprinklr<br/>como <em>Publish Agent</em>.</h1>
          <p>Aprende a gestionar campañas, aprobar contenido y publicar en todos los canales de Repsol — a tu ritmo, con soporte de IA.</p>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <button className="btn glow" onClick={openPlayer}><Icon name="play" size={14}/> Continuar formación</button>
            <button className="btn ghost hero-ghost" onClick={() => setView('path')}>Ver mi ruta →</button>
          </div>
        </div>
        <div className="lms-hero-cards">
          {inProgress.map(p => (
            <div key={p.id} className="hip-card" onClick={openPlayer}>
              <div className="hip-thumb"><div className={`ph ${p.tone}`}/></div>
              <div className="hip-body">
                <span className="hip-cat">{p.category}</span>
                <div className="hip-title">{p.title}</div>
                <div className="hip-bar"><i style={{width: p.progress+'%'}}/></div>
                <div className="hip-meta">{p.progress}% completado · {p.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="lms-stats">
        {[
          { n: '7/12', l: 'Módulos completados', icon: 'check', color: 'var(--beonit-lime)' },
          { n: '58%',  l: 'Progreso en ruta',    icon: 'trend', color: 'var(--accent-glow)' },
          { n: '3h',   l: 'Tiempo de formación', icon: 'clock', color: 'var(--beonit-blue)' },
          { n: '94%',  l: 'Tasa de éxito tests', icon: 'bolt',  color: 'var(--repsol-red)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background: s.color + '18', color: s.color}}>
              <Icon name={s.icon} size={16}/>
            </div>
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Continue */}
      {inProgress.length > 0 && (
        <Row title="Continúa" emTitle="donde lo dejaste" extraClass="row-continue">
          {inProgress.map(p => <Card key={p.id} {...p} onClick={openPlayer}/>)}
        </Row>
      )}

      {/* Featured path */}
      <div className="featured-banner" onClick={() => setView('path')}>
        <div className="fb-content">
          <span className="eyebrow" style={{color:'var(--accent-glow)'}}>Ruta certificada · 4 semanas</span>
          <h2>Publish Agent<br/><em>Certificación Repsol</em>.</h2>
          <p>12 MÓDULOS · 3H 20MIN · AVALADA POR REPSOL & BEONIT</p>
          <div style={{display:'flex', gap:12}}>
            <button className="btn glow" onClick={e => { e.stopPropagation(); setView('path'); }}>
              <Icon name="book" size={14}/> Ver programa completo
            </button>
            <button className="btn ghost" style={{color:'var(--paper)', borderColor:'rgba(255,255,255,0.2)'}}>
              Certificado al terminar
            </button>
          </div>
        </div>
        <div className="fb-visual">
          <div className="ph teal" style={{position:'absolute', inset:0}}/>
          <div className="fb-badge">58% completado</div>
        </div>
      </div>

      {/* Catalog */}
      <div className="catalog-section">
        <div className="row-head">
          <h2>Todos los <em>módulos</em></h2>
          <button className="link-btn" onClick={() => setView('browse')}>Ver catálogo completo →</button>
        </div>
        <CategoryBar active={activeCat} setActive={setActiveCat}/>
        <div className="catalog-grid">
          {filtered.map(item => <Card key={item.id} {...item} onClick={() => openDetail(item)}/>)}
        </div>
      </div>

      {/* Quick tips */}
      <Row title="Tips rápidos" emTitle="menos de 1 minuto" extraClass="row-reels">
        {REELS.map(r => <Card key={r.id} {...r} onClick={openPlayer}/>)}
      </Row>

      {/* AI CTA */}
      <div className="ai-cta-banner">
        <div className="ai-cta-orb"/>
        <div className="ai-cta-content">
          <span className="eyebrow" style={{color:'var(--accent-glow)'}}>Agente IA · Powered by Claude</span>
          <h2>"¿Cómo apruebo un post urgente fuera del horario habitual?"</h2>
          <p>Tu agente conoce los flujos de Repsol, tu progreso y las guías de Sprinklr. Pregúntale cualquier cosa.</p>
          <button className="btn glow" onClick={() => setView('coach')}>
            <Icon name="sparkle" size={14}/> Abrir agente IA
          </button>
        </div>
        <div className="ai-cta-visual">
          <div className="ai-cta-chat">
            {[
              { role: 'ai', text: '¡Hola Amaia! Llevas un 58% de tu certificación. ¿Seguimos con el módulo de calendario hoy?' },
              { role: 'user', text: '¿Cuánto me falta para terminar?' },
              { role: 'ai', text: 'Te quedan 5 módulos: Calendario, Analytics, Activos, Compliance y el test final. Unos 90 min en total.' },
            ].map((m, i) => (
              <div key={i} className={`ai-cta-msg ${m.role}`}>{m.text}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

window.Sidebar = Sidebar;
window.Home = Home;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
