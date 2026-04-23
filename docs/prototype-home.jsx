// prototype.jsx — SOLID 2.0 interactive app (es)

const { useState, useEffect, useRef } = React;

// ---------- Data ----------
const PILLS = [
  { id: 'p1', title: 'Decir no sin decir "no"', teacher: 'Marta Alcázar', duration: '3 min', tone: 'clay', format: 'píldora', progress: 65 },
  { id: 'p2', title: 'La regla de las 2 pizzas, revisitada', teacher: 'Dan Okafor', duration: '3 min', tone: 'olive', format: 'píldora', progress: 0 },
  { id: 'p3', title: 'Feedback: actúa, no etiquetes', teacher: 'Priya Venkat', duration: '3 min', tone: 'plum', format: 'píldora', progress: 0 },
  { id: 'p4', title: 'La hora que multiplica', teacher: 'L. Tavares', duration: '3 min', tone: 'teal', format: 'píldora', progress: 38 },
  { id: 'p5', title: 'Reuniones que no te necesitan', teacher: 'Inés Rahman', duration: '3 min', tone: 'warm', format: 'píldora', progress: 0 },
];
const SERIES = [
  { id: 's1', title: 'El operador silencioso', teacher: '5 episodios', duration: '24 min', tone: 'noir', format: 'serie' },
  { id: 's2', title: 'Decisiones en borrador', teacher: '4 episodios', duration: '18 min', tone: 'clay', format: 'serie' },
  { id: 's3', title: 'Escribir para pensar', teacher: '7 episodios', duration: '32 min', tone: 'sand', format: 'serie' },
  { id: 's4', title: 'Entrega menos, aprende más', teacher: '6 episodios', duration: '27 min', tone: 'teal', format: 'serie' },
];
const REELS = [
  { id: 'r1', title: 'Stand-up de una línea', teacher: '@solid', duration: ':52', tone: 'lime', format: 'reel' },
  { id: 'r2', title: 'Mata la reunión recurrente', teacher: '@solid', duration: ':38', tone: 'warm', format: 'reel' },
  { id: 'r3', title: 'El update en 3 frases', teacher: '@solid', duration: ':45', tone: 'plum', format: 'reel' },
  { id: 'r4', title: 'Bueno → Genial → Fuera', teacher: '@solid', duration: ':29', tone: 'olive', format: 'reel' },
  { id: 'r5', title: 'Nombra al elefante', teacher: '@solid', duration: ':41', tone: 'teal', format: 'reel' },
  { id: 'r6', title: 'Qué cortar primero', teacher: '@solid', duration: ':33', tone: 'clay', format: 'reel' },
];
const PODCASTS = [
  { id: 'c1', title: 'El contexto largo', teacher: 'Ep. 14 · Estela Moreno', duration: '42 min', tone: 'noir', format: 'podcast' },
  { id: 'c2', title: 'Cuartos propios', teacher: 'Ep. 8 · R. Bellini', duration: '38 min', tone: 'plum', format: 'podcast' },
  { id: 'c3', title: 'Software lento', teacher: 'Ep. 21 · M. Delacroix', duration: '51 min', tone: 'olive', format: 'podcast' },
];
const PATHS = [
  { id: 'pa1', title: 'Cómo ser manager, de verdad', teacher: '8 semanas · 24 píldoras', duration: '2h 12m', tone: 'warm', format: 'ruta' },
  { id: 'pa2', title: 'Trabajo profundo en equipo', teacher: '4 semanas · 12 píldoras', duration: '1h 06m', tone: 'teal', format: 'ruta' },
  { id: 'pa3', title: 'Contratar sin sesgos', teacher: '6 semanas · 18 píldoras', duration: '1h 48m', tone: 'plum', format: 'ruta' },
];

// ---------- Sidebar ----------
function Sidebar({ view, setView }) {
  const items = [
    { id: 'home', label: 'Hoy', icon: 'home' },
    { id: 'browse', label: 'Descubrir', icon: 'compass' },
    { id: 'coach', label: 'Coach', icon: 'sparkle' },
    { id: 'path', label: 'Mi ruta', icon: 'book' },
    { id: 'saved', label: 'Guardado', icon: 'bookmark', badge: '12' },
    { id: 'wa', label: 'WhatsApp', icon: 'chat' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
  ];
  return (
    <aside className="sb">
      <div className="sb-brand">
        <img src="beonit-logo.png" style={{height:30, width:'auto'}} alt="BeonIt"/>
        <span className="mark" style={{fontSize:20}}>Solid</span>
      </div>
      <button className="sb-search">
        <Icon name="search" size={14}/>
        <span>Buscar ideas, personas…</span>
        <span className="kbd">⌘K</span>
      </button>
      <div>
        <div className="sb-nav">
          {items.map(it => (
            <button key={it.id} className={`sb-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
              <span className="sb-icon"><Icon name={it.icon} size={15}/></span>
              {it.label}
              {it.badge && <span className="sb-badge">{it.badge}</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="sb-section-title">Rutas activas</div>
        <div className="sb-paths">
          <div className="sb-path" onClick={() => setView('path')}>
            <div className="sb-path-title">Cómo ser manager, de verdad</div>
            <div className="sb-progress"><i style={{width: '42%'}}/></div>
            <div className="sb-path-meta"><span>Semana 4 / 8</span><span>·</span><span>Sigue: Feedback</span></div>
          </div>
          <div className="sb-path">
            <div className="sb-path-title">Trabajo profundo en equipo</div>
            <div className="sb-progress"><i style={{width: '18%'}}/></div>
            <div className="sb-path-meta"><span>Semana 1 / 4</span></div>
          </div>
        </div>
      </div>
      <div className="sb-user">
        <div className="sb-avatar">A</div>
        <div>
          <div className="sb-user-name">Amaia Ruiz</div>
          <div className="sb-user-role">BeonIt · Design Lead</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Home ----------
function Home({ shape, openDetail, openPlayer }) {
  return (
    <div className={`main-inner shape-${shape}`}>
      <section className="hero">
        <div>
          <div className="hero-eye">
            <span className="chip">Martes, 10:42</span>
            <span className="chip">3 min · lista para ti</span>
          </div>
          <h1>
            Una <em>idea</em> al día.<br/>
            Una biblioteca <span className="glow">entera</span>.
          </h1>
          <p className="hero-sub">Tus próximos tres minutos te esperan. Después, quédate el rato que quieras — una serie, una ruta o un podcast tranquilo para el paseo.</p>
          <div className="hero-ctas">
            <button className="btn" onClick={openPlayer}><Icon name="play" size={14}/> Continuar · Feedback: actúa, no etiquetes</button>
            <button className="btn ghost" onClick={() => openDetail()}>Ver lo de hoy</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="ph plum"/>
          <button className="hero-play" onClick={openPlayer}><Icon name="play" size={22}/></button>
          <div className="hero-card-meta">
            <span className="eyebrow">Elegido por el editor · Píldora</span>
            <div className="title">Decir no sin<br/>decir "no".</div>
            <div className="foot"><span>Marta Alcázar</span><span>·</span><span>3 MIN</span><span>·</span><span>Comunicación</span></div>
          </div>
        </div>
      </section>

      <Row title="Continúa" emTitle="donde lo dejaste" extraClass="row-continue">
        {PILLS.filter(p => p.progress > 0).map(p => (
          <Card key={p.id} {...p} onClick={openPlayer}/>
        ))}
      </Row>

      <Row title="Tres minutos" emTitle="para hoy">
        {PILLS.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
      </Row>

      <div className="feature-strip">
        <div>
          <span className="eyebrow">Pregunta al coach</span>
          <h2>"¿Qué debería aprender antes del 1:1 del jueves?"</h2>
          <p>Tu coach conoce tu calendario, tus rutas y lo que terminaste la semana pasada. Te responde en una píldora — o una serie corta cuando lo necesitas.</p>
          <button className="btn glow">Abrir coach →</button>
        </div>
        <div className="visual">
          <div className="ph noir" style={{position: 'absolute', inset: 0}}>vista previa del coach</div>
        </div>
      </div>

      <Row title="Cortos" emTitle="menos de un minuto" extraClass="row-reels">
        {REELS.map(r => <Card key={r.id} {...r} onClick={openPlayer}/>)}
      </Row>

      <Row title="Series" emTitle="cuando una no basta">
        {SERIES.map(s => <Card key={s.id} {...s} onClick={() => openDetail(s)}/>)}
      </Row>

      <Row title="Podcasts" emTitle="formato largo">
        {PODCASTS.map(c => <Card key={c.id} {...c} onClick={() => openDetail(c)}/>)}
      </Row>

      <Row title="Rutas" emTitle="un camino completo">
        {PATHS.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
      </Row>
    </div>
  );
}

window.Sidebar = Sidebar;
window.Home = Home;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
