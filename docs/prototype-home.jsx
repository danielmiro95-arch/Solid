// prototype-home.jsx — SOLID 2.0 · BeonIt Academy

const { useState, useEffect, useRef } = React;

// ---------- Data ----------
const PILLS = [
  { id: 'p1', title: 'Decir no sin decir "no"', teacher: 'Marta Alcázar', duration: '3 min', tone: 'clay', format: 'píldora', progress: 65, level: 'intermedio', rating: 4.8, enrolled: 2100, category: 'Comunicación' },
  { id: 'p2', title: 'La regla de las 2 pizzas, revisitada', teacher: 'Dan Okafor', duration: '3 min', tone: 'olive', format: 'píldora', progress: 0, level: 'principiante', rating: 4.6, enrolled: 1450, category: 'Liderazgo' },
  { id: 'p3', title: 'Feedback: actúa, no etiquetes', teacher: 'Priya Venkat', duration: '3 min', tone: 'plum', format: 'píldora', progress: 0, level: 'intermedio', rating: 4.9, enrolled: 3200, category: 'Comunicación' },
  { id: 'p4', title: 'La hora que multiplica', teacher: 'L. Tavares', duration: '3 min', tone: 'teal', format: 'píldora', progress: 38, level: 'principiante', rating: 4.7, enrolled: 1800, category: 'Trabajo profundo' },
  { id: 'p5', title: 'Reuniones que no te necesitan', teacher: 'Inés Rahman', duration: '3 min', tone: 'warm', format: 'píldora', progress: 0, level: 'avanzado', rating: 4.5, enrolled: 980, category: 'Liderazgo' },
];
const SERIES = [
  { id: 's1', title: 'El operador silencioso', teacher: '5 episodios · Varios', duration: '24 min', tone: 'noir', format: 'serie', level: 'avanzado', rating: 4.9, enrolled: 1200, category: 'Liderazgo' },
  { id: 's2', title: 'Decisiones en borrador', teacher: '4 episodios · Varios', duration: '18 min', tone: 'clay', format: 'serie', level: 'intermedio', rating: 4.7, enrolled: 890, category: 'Decisiones' },
  { id: 's3', title: 'Escribir para pensar', teacher: '7 episodios · Varios', duration: '32 min', tone: 'sand', format: 'serie', level: 'principiante', rating: 4.8, enrolled: 2400, category: 'Comunicación' },
  { id: 's4', title: 'Entrega menos, aprende más', teacher: '6 episodios · Varios', duration: '27 min', tone: 'teal', format: 'serie', level: 'intermedio', rating: 4.6, enrolled: 1100, category: 'Trabajo profundo' },
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
  { id: 'c1', title: 'El contexto largo', teacher: 'Ep. 14 · Estela Moreno', duration: '42 min', tone: 'noir', format: 'podcast', level: 'avanzado', rating: 4.8, enrolled: 650, category: 'Estrategia' },
  { id: 'c2', title: 'Cuartos propios', teacher: 'Ep. 8 · R. Bellini', duration: '38 min', tone: 'plum', format: 'podcast', level: 'intermedio', rating: 4.7, enrolled: 480, category: 'Comunicación' },
  { id: 'c3', title: 'Software lento', teacher: 'Ep. 21 · M. Delacroix', duration: '51 min', tone: 'olive', format: 'podcast', level: 'avanzado', rating: 4.9, enrolled: 720, category: 'Trabajo profundo' },
];
const PATHS = [
  { id: 'pa1', title: 'Cómo ser manager, de verdad', teacher: '8 semanas · 24 píldoras', duration: '2h 12m', tone: 'warm', format: 'ruta', level: 'intermedio', rating: 4.9, enrolled: 3800, category: 'Liderazgo' },
  { id: 'pa2', title: 'Trabajo profundo en equipo', teacher: '4 semanas · 12 píldoras', duration: '1h 06m', tone: 'teal', format: 'ruta', level: 'principiante', rating: 4.7, enrolled: 2100, category: 'Trabajo profundo' },
  { id: 'pa3', title: 'Contratar sin sesgos', teacher: '6 semanas · 18 píldoras', duration: '1h 48m', tone: 'plum', format: 'ruta', level: 'avanzado', rating: 4.8, enrolled: 1500, category: 'Contratación' },
];

const CATEGORIES = ['Todo', 'Liderazgo', 'Comunicación', 'Trabajo profundo', 'Decisiones', 'Contratación', 'Estrategia'];

// ---------- Category bar ----------
function CategoryBar({ active, setActive }) {
  return (
    <div className="cat-bar">
      {CATEGORIES.map(c => (
        <button key={c} className={`cat-pill ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
      ))}
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ view, setView }) {
  const items = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'browse', label: 'Descubrir', icon: 'compass' },
    { id: 'coach', label: 'Coach IA', icon: 'sparkle' },
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
        <span>Buscar cursos, temas…</span>
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
            <div className="sb-path-meta"><span>Semana 4 / 8</span><span>·</span><span>42%</span></div>
          </div>
          <div className="sb-path">
            <div className="sb-path-title">Trabajo profundo en equipo</div>
            <div className="sb-progress"><i style={{width: '18%'}}/></div>
            <div className="sb-path-meta"><span>Semana 1 / 4</span><span>·</span><span>18%</span></div>
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
function Home({ openDetail, openPlayer }) {
  const [activeCat, setActiveCat] = useState('Todo');
  const inProgress = PILLS.filter(p => p.progress > 0);
  const allContent = [...PILLS, ...SERIES, ...PODCASTS, ...PATHS];
  const filtered = activeCat === 'Todo' ? allContent : allContent.filter(c => c.category === activeCat);

  return (
    <div className="main-inner">

      {/* LMS Hero */}
      <section className="lms-hero">
        <div className="lms-hero-text">
          <span className="eyebrow" style={{color:'rgba(255,255,255,0.5)', letterSpacing:'0.12em'}}>Martes, 10:42 · BeonIt Academy</span>
          <h1>Continúa donde<br/>lo dejaste.</h1>
          <p>Tu próxima píldora te espera. Tres minutos ahora, o quédate el rato que quieras.</p>
          <button className="btn glow" onClick={openPlayer}><Icon name="play" size={14}/> Continuar aprendiendo</button>
        </div>
        <div className="lms-hero-cards">
          {inProgress.map(p => (
            <div key={p.id} className="hip-card" onClick={openPlayer}>
              <div className="hip-thumb"><div className={`ph ${p.tone}`}/></div>
              <div className="hip-body">
                <span className="eyebrow" style={{color:'rgba(255,255,255,0.45)'}}>{p.format} · {p.category}</span>
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
          { n: '3',   l: 'Cursos activos' },
          { n: '142', l: 'Píldoras terminadas' },
          { n: '11',  l: 'Días de racha' },
          { n: '42%', l: 'Ruta completada' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <Row title="Continúa" emTitle="donde lo dejaste" extraClass="row-continue">
        {PILLS.filter(p => p.progress > 0).map(p => (
          <Card key={p.id} {...p} onClick={openPlayer}/>
        ))}
      </Row>

      {/* Featured path banner */}
      <div className="featured-banner" onClick={() => openDetail(PATHS[0])}>
        <div className="fb-content">
          <span className="eyebrow" style={{color:'var(--accent-glow)'}}>Ruta destacada · 8 semanas</span>
          <h2>Cómo ser <em>manager</em>,<br/>de verdad.</h2>
          <p>24 PÍLDORAS · 2H 12MIN · DISEÑADO PARA BEONIT</p>
          <div style={{display:'flex', gap:12}}>
            <button className="btn glow" onClick={e => { e.stopPropagation(); openPlayer(); }}>
              <Icon name="play" size={14}/> Empezar la ruta
            </button>
            <button className="btn ghost" style={{color:'var(--paper)', borderColor:'rgba(255,255,255,0.25)'}}>
              Ver programa
            </button>
          </div>
        </div>
        <div className="fb-visual"><div className="ph warm" style={{position:'absolute', inset:0}}/></div>
      </div>

      {/* Catalog with category filter */}
      <div className="catalog-section">
        <div className="row-head">
          <h2>Catálogo <em>completo</em></h2>
          <span className="link">Ver todo →</span>
        </div>
        <CategoryBar active={activeCat} setActive={setActiveCat}/>
        <div className="catalog-grid">
          {filtered.map(item => (
            <Card key={item.id} {...item} onClick={() => openDetail(item)}/>
          ))}
        </div>
      </div>

      {/* Reels */}
      <Row title="Cortos" emTitle="menos de un minuto" extraClass="row-reels">
        {REELS.map(r => <Card key={r.id} {...r} onClick={openPlayer}/>)}
      </Row>

      {/* Coach CTA */}
      <div className="feature-strip">
        <div>
          <span className="eyebrow">Coach IA</span>
          <h2>"¿Qué debería aprender antes del 1:1 del jueves?"</h2>
          <p>Tu coach conoce tu calendario, tus rutas y lo que terminaste la semana pasada. Te responde en una píldora — o una serie corta cuando lo necesitas.</p>
          <button className="btn glow">Abrir coach →</button>
        </div>
        <div className="visual">
          <div className="ph noir" style={{position:'absolute', inset:0}}/>
        </div>
      </div>

    </div>
  );
}

window.Sidebar = Sidebar;
window.Home = Home;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
