/* ============================================================
   LandingView · Pre-login landing de SolidStream · paleta beonit
   ----------------------------------------------------------------
   Inspirado en el handoff de Claude Design (Landing SGS|on estilo
   beonit.es) · adaptado a la paleta y tipografía de NUESTRA
   plataforma:
     · navy oscuro #0B1226 · titulos y body
     · verde beonit #006241 · acento (en lugar del rojo de la
       referencia · alinea con la app interior)
     · Inter (sans) + Instrument Serif (italic em en h1)
     · Logo real beonit (beonit-logo.png) · no texto
     · Fotos reales del bucket HdR ya subidas (Talento, Tecnología,
       Innovación, Colaboración, Teletrabajo, IA · b148+)

   Renderiza ANTES del LoginScreen · el CTA "Iniciar sesión" hace
   onEnterLogin() · prototype-main.jsx setea showLogin=true y
   pasa al login normal. Si el user ya tiene sesión, la app salta
   directo al home (este componente no se renderiza).
   ============================================================ */

function LandingView({ onEnterLogin }) {
  const HDR = 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/hijos-de-rivera/';
  const photo = {
    hero:     HDR + 'Talento_Diversidad_01.jpg',
    feature1: HDR + 'Tecnologia_Digital_01.jpg',
    feature2: HDR + 'Innovacion_01.jpg',
    feature3: HDR + 'Inteligencia_Artificial_01.jpg',
    split1:   HDR + 'Colaboracion_Digital_01.jpg',
    split2:   HDR + 'Teletrabajo_01.jpg',
  };
  const logo = 'beonit-logo.png?v=' + (window.SOLID_VERSION || 'init');
  const goLogin = (e) => { if (e) e.preventDefault(); onEnterLogin && onEnterLogin(); };
  const goDemo  = (e) => {
    if (e) e.preventDefault();
    // En esta versión el "demo" es entrar como visitante a la URL demo
    // del workspace HdR · el cliente ya tiene esa URL en docs.
    if (window.Toast) window.Toast.info('Contacta a beonit para programar una demo guiada');
    onEnterLogin && onEnterLogin();
  };

  // Estilos inline · self-contained · NO dependen de styles.css ni
  // sgson.css para evitar overrides accidentales. La landing tiene su
  // propia estética que NO debe contaminar con la app.
  const css = `
    .lnd { font-family: 'Inter', system-ui, sans-serif; color: #0B1226; background: #FFFFFF;
           line-height: 1.5; -webkit-font-smoothing: antialiased; }
    .lnd * { box-sizing: border-box; }
    .lnd-wrap { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
    .lnd-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500;
                    letter-spacing: 0.16em; text-transform: uppercase; color: #006241; }
    .lnd a { color: inherit; text-decoration: none; }
    .lnd .em-serif { font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
                      font-weight: 400; letter-spacing: 0.01em; color: #006241; }

    /* Buttons */
    .lnd-btn { font-family: inherit; font-weight: 600; font-size: 15px; border: none; cursor: pointer;
               border-radius: 10px; height: 50px; padding: 0 26px; display: inline-flex;
               align-items: center; justify-content: center; gap: 9px;
               transition: transform .14s ease, background .14s ease, box-shadow .14s ease, border-color .14s ease;
               letter-spacing: -0.01em; white-space: nowrap; }
    .lnd-btn-primary { background: #006241; color: #fff; box-shadow: 0 8px 22px rgba(0,98,65,0.28); }
    .lnd-btn-primary:hover { background: #00472F; transform: translateY(-2px); }
    .lnd-btn-outline { background: transparent; color: #0B1226; border: 1px solid rgba(11,18,38,0.18); }
    .lnd-btn-outline:hover { border-color: #0B1226; transform: translateY(-2px); }
    .lnd-btn-sm { height: 42px; padding: 0 20px; font-size: 14px; }
    .lnd-btn-lg { height: 56px; padding: 0 34px; font-size: 16px; }
    .lnd-btn-white { background: #fff; color: #0B1226; }
    .lnd-btn-white:hover { background: #f0f0ee; transform: translateY(-2px); }
    .lnd-btn-ghost-w { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.22); }
    .lnd-btn-ghost-w:hover { background: rgba(255,255,255,0.16); transform: translateY(-2px); }

    /* Nav */
    .lnd-nav { position: sticky; top: 0; z-index: 60; background: rgba(255,255,255,0.86);
               backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%);
               border-bottom: 1px solid rgba(11,18,38,0.05); }
    .lnd-nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; height: 70px;
                      display: flex; align-items: center; gap: 40px; }
    .lnd-logo { display: inline-flex; align-items: center; gap: 10px; }
    .lnd-logo img { height: 32px; width: auto; }
    .lnd-logo-text { display: inline-flex; align-items: baseline; gap: 3px; font-family: 'Inter', sans-serif;
                      font-weight: 800; font-size: 18px; letter-spacing: -0.025em; color: #0B1226; }
    .lnd-logo-text .stream { font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
                              font-weight: 400; letter-spacing: 0.02em; color: #44454C; }
    .lnd-nav-links { display: flex; gap: 6px; }
    .lnd-nav-links a { font-size: 15px; font-weight: 500; color: #44454C;
                        padding: 8px 14px; border-radius: 8px; transition: background .14s, color .14s; }
    .lnd-nav-links a:hover { background: #F6F6F4; color: #0B1226; }
    .lnd-nav-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
    .lnd-nav-locale { font-family: 'JetBrains Mono', monospace; font-size: 11px;
                       letter-spacing: 0.1em; color: #76777F; }
    .lnd-nav-login { font-size: 15px; font-weight: 600; color: #0B1226; padding: 8px 12px; cursor: pointer; }
    .lnd-nav-login:hover { color: #006241; }

    /* Hero */
    .lnd-hero { padding: 88px 0 96px; background: #FFFFFF; }
    .lnd-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 72px; align-items: center; }
    .lnd-hero-ws { display: inline-flex; align-items: center; gap: 9px; font-family: 'JetBrains Mono', monospace;
                    font-size: 11px; letter-spacing: 0.08em; color: #44454C;
                    background: #F6F6F4; border: 1px solid rgba(11,18,38,0.09);
                    padding: 7px 14px; border-radius: 999px; margin-bottom: 26px; }
    .lnd-hero-ws .dot { width: 7px; height: 7px; border-radius: 50%; background: #006241; }
    .lnd-hero h1 { font-size: 64px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
                    color: #0B1226; margin: 0 0 24px; text-wrap: balance; }
    .lnd-hero p.lede { font-size: 20px; line-height: 1.6; color: #44454C; max-width: 480px; margin: 0 0 38px; }
    .lnd-hero-cta { display: flex; gap: 14px; align-items: center; margin-bottom: 30px; flex-wrap: wrap; }
    .lnd-hero-note { font-size: 14px; color: #76777F; display: flex; align-items: center; gap: 8px; }
    .lnd-hero-note b { color: #44454C; font-weight: 600; }
    .lnd-hero-photo-wrap { position: relative; }
    .lnd-hero-photo { aspect-ratio: 4 / 4.4; border-radius: 20px; width: 100%;
                       box-shadow: 0 2px 4px rgba(11,18,38,.06), 0 24px 56px rgba(11,18,38,.12);
                       background-size: cover; background-position: center; }
    .lnd-hero-float { position: absolute; bottom: 26px; left: -26px; background: #fff;
                       border: 1px solid rgba(11,18,38,0.09); border-radius: 14px; padding: 16px 18px;
                       box-shadow: 0 2px 4px rgba(11,18,38,.04), 0 12px 32px rgba(11,18,38,.10);
                       display: flex; align-items: center; gap: 14px; min-width: 250px; }
    .lnd-hero-float .ring { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
                             background: conic-gradient(#006241 78%, #EFEFEC 0);
                             display: flex; align-items: center; justify-content: center; }
    .lnd-hero-float .ring::after { content: '78%'; font-family: 'JetBrains Mono', monospace; font-size: 10px;
                                    font-weight: 600; color: #0B1226; background: #fff; width: 30px; height: 30px;
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .lnd-hero-float .hf-text strong { display: block; font-size: 14px; font-weight: 700; letter-spacing: -0.01em;
                                       white-space: nowrap; margin-bottom: 2px; color: #0B1226; }
    .lnd-hero-float .hf-text span { font-size: 12px; color: #76777F; }

    /* Trust */
    .lnd-trust { padding: 40px 0 56px; border-top: 1px solid rgba(11,18,38,0.05); }
    .lnd-trust-lbl { text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px;
                      letter-spacing: 0.14em; text-transform: uppercase; color: #76777F; margin-bottom: 28px; }
    .lnd-trust-logos { display: flex; align-items: center; justify-content: center;
                        gap: 56px; flex-wrap: wrap; }
    .lnd-trust-logos span { font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
                             color: #76777F; opacity: 0.72; transition: opacity .2s, color .2s; }
    .lnd-trust-logos span:hover { opacity: 1; color: #0B1226; }

    /* Features */
    .lnd-features { background: #F6F6F4; padding: 100px 0; }
    .lnd-sec-head { max-width: 620px; margin-bottom: 52px; }
    .lnd-sec-head .lnd-eyebrow { margin-bottom: 16px; display: inline-block; }
    .lnd-sec-head h2 { font-size: 44px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.05;
                        color: #0B1226; margin: 0 0 18px; text-wrap: balance; }
    .lnd-sec-head p { font-size: 18px; line-height: 1.6; color: #44454C; margin: 0; }
    .lnd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .lnd-card { background: #fff; border: 1px solid rgba(11,18,38,0.05); border-radius: 18px;
                 overflow: hidden;
                 box-shadow: 0 2px 4px rgba(11,18,38,.04), 0 12px 32px rgba(11,18,38,.07);
                 transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; }
    .lnd-card:hover { transform: translateY(-5px);
                       box-shadow: 0 4px 8px rgba(11,18,38,.06), 0 24px 56px rgba(11,18,38,.12); }
    .lnd-card-photo { height: 188px; background-size: cover; background-position: center;
                       border-bottom: 1px solid rgba(11,18,38,0.05); }
    .lnd-card-body { padding: 26px 26px 28px; }
    .lnd-card-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
                     color: #006241; margin-bottom: 12px; }
    .lnd-card-body h3 { font-size: 21px; font-weight: 700; letter-spacing: -0.02em;
                         margin: 0 0 9px; color: #0B1226; }
    .lnd-card-body p { font-size: 15px; line-height: 1.6; color: #44454C; margin: 0; }
    .lnd-card-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 18px;
                      font-size: 14px; font-weight: 600; color: #006241; transition: gap .15s; }
    .lnd-card:hover .lnd-card-link { gap: 11px; }

    /* Split */
    .lnd-split { padding: 104px 0; background: #FFFFFF; }
    .lnd-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
    .lnd-split.reverse .lnd-split-grid { direction: rtl; }
    .lnd-split.reverse .lnd-split-grid > * { direction: ltr; }
    .lnd-split-photo { aspect-ratio: 4 / 3.2; border-radius: 20px;
                        box-shadow: 0 2px 4px rgba(11,18,38,.06), 0 24px 56px rgba(11,18,38,.10);
                        background-size: cover; background-position: center; }
    .lnd-split h2 { font-size: 40px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.08;
                     margin: 16px 0 20px; color: #0B1226; text-wrap: balance; }
    .lnd-split p { font-size: 18px; line-height: 1.65; color: #44454C; margin: 0 0 26px; max-width: 460px; }
    .lnd-split-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
    .lnd-split-item { display: flex; gap: 13px; align-items: flex-start; }
    .lnd-split-item .tick { width: 22px; height: 22px; border-radius: 50%; background: rgba(0,98,65,0.10);
                             color: #006241; flex-shrink: 0; display: flex; align-items: center;
                             justify-content: center; font-size: 12px; font-weight: 700; margin-top: 1px; }
    .lnd-split-item .it-text { font-size: 16px; color: #44454C; line-height: 1.5; }
    .lnd-split-item .it-text b { color: #0B1226; font-weight: 600; }

    /* Stats */
    .lnd-stats { background: #F6F6F4; padding: 80px 0; }
    .lnd-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .lnd-stat { text-align: center; }
    .lnd-stat .num { font-size: 56px; font-weight: 800; letter-spacing: -0.04em; color: #0B1226; line-height: 1; }
    .lnd-stat .num .ac { color: #006241; }
    .lnd-stat .lbl { font-size: 15px; color: #44454C; margin-top: 12px; }

    /* CTA box */
    .lnd-cta { padding: 110px 0; background: #FFFFFF; }
    .lnd-cta-box { background: #0B1226; border-radius: 28px; padding: 72px 64px;
                    position: relative; overflow: hidden; display: flex; align-items: center;
                    justify-content: space-between; gap: 48px; flex-wrap: wrap; }
    .lnd-cta-box::after { content: ''; position: absolute; top: -40%; right: -8%; width: 50%; height: 180%;
                          background: radial-gradient(circle, rgba(0,98,65,0.32), transparent 62%);
                          pointer-events: none; }
    .lnd-cta-box .cta-text { position: relative; z-index: 2; }
    .lnd-cta-box h2 { font-size: 44px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.05;
                       color: #fff; margin: 0 0 14px; text-wrap: balance; }
    .lnd-cta-box p { font-size: 18px; color: rgba(255,255,255,0.72); max-width: 440px; margin: 0; }
    .lnd-cta-box .cta-actions { position: relative; z-index: 2; display: flex; gap: 14px; flex-shrink: 0; flex-wrap: wrap; }

    /* Footer */
    .lnd-footer { border-top: 1px solid rgba(11,18,38,0.05); padding: 64px 0 40px; background: #FFFFFF; }
    .lnd-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
    .lnd-footer-brand .lnd-logo { margin-bottom: 16px; }
    .lnd-footer-brand p { font-size: 14px; color: #76777F; line-height: 1.6; max-width: 280px; margin: 0; }
    .lnd-footer-col h4 { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.12em;
                          text-transform: uppercase; color: #76777F; margin: 0 0 18px; }
    .lnd-footer-col a { display: block; font-size: 14px; color: #44454C; margin-bottom: 11px;
                         transition: color .14s; }
    .lnd-footer-col a:hover { color: #006241; }
    .lnd-footer-bot { display: flex; justify-content: space-between; align-items: center;
                       padding-top: 28px; border-top: 1px solid rgba(11,18,38,0.05);
                       flex-wrap: wrap; gap: 12px; }
    .lnd-footer-bot span { font-size: 13px; color: #76777F; }
    .lnd-footer-bot .langs { display: flex; gap: 16px; font-family: 'JetBrains Mono', monospace;
                              font-size: 12px; letter-spacing: 0.06em; }
    .lnd-footer-bot .langs a.active { color: #0B1226; font-weight: 600; }

    @media (max-width: 980px) {
      .lnd-hero-grid, .lnd-split-grid, .lnd-footer-grid { grid-template-columns: 1fr; gap: 40px; }
      .lnd-cards, .lnd-stats-grid { grid-template-columns: 1fr; }
      .lnd-nav-links { display: none; }
      .lnd-hero h1 { font-size: 46px; }
      .lnd-hero-photo, .lnd-split-photo { aspect-ratio: 16/10; }
      .lnd-cta-box { padding: 48px 32px; }
      .lnd-cta-box h2 { font-size: 32px; }
    }
  `;

  return (
    <div className="lnd">
      <style>{css}</style>

      {/* NAV */}
      <header className="lnd-nav">
        <div className="lnd-nav-inner">
          <a href="#" className="lnd-logo" onClick={(e) => e.preventDefault()}>
            <img src={logo} alt="beonit"/>
            <span className="lnd-logo-text">Solid<span className="stream">Stream</span></span>
          </a>
          <nav className="lnd-nav-links">
            <a href="#features">Plataforma</a>
            <a href="#how">Cómo funciona</a>
            <a href="#clientes">Clientes</a>
            <a href="#cta">Demo</a>
          </nav>
          <div className="lnd-nav-right">
            <span className="lnd-nav-locale">ES</span>
            <a className="lnd-nav-login" onClick={goLogin}>Iniciar sesión</a>
            <a className="lnd-btn lnd-btn-primary lnd-btn-sm" onClick={goDemo}>Solicitar demo</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lnd-hero">
        <div className="lnd-wrap lnd-hero-grid">
          <div>
            <div className="lnd-hero-ws"><span className="dot"></span>Plataforma de formación · beonit</div>
            <h1>La formación de tu equipo,<br/>centrada en las <span className="em-serif">personas</span>.</h1>
            <p className="lede">Cursos en vídeo, rutas de certificación y un mentor con IA. Aprendizaje corporativo moderno, medible y a tu ritmo.</p>
            <div className="lnd-hero-cta">
              <a className="lnd-btn lnd-btn-primary lnd-btn-lg" onClick={goLogin}>Iniciar sesión</a>
              <a className="lnd-btn lnd-btn-outline lnd-btn-lg" onClick={goDemo}>Ver una demo</a>
            </div>
            <div className="lnd-hero-note">Acceso con tu cuenta corporativa · <b>SSO corporativo</b></div>
          </div>
          <div className="lnd-hero-photo-wrap">
            <div className="lnd-hero-photo" style={{ backgroundImage: `url(${photo.hero})` }}/>
            <div className="lnd-hero-float">
              <div className="ring"></div>
              <div className="hf-text">
                <strong>Ruta · Liderazgo</strong>
                <span>8 de 12 cursos completados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="lnd-trust" id="clientes">
        <div className="lnd-wrap">
          <div className="lnd-trust-lbl">Equipos que ya aprenden con SolidStream</div>
          <div className="lnd-trust-logos">
            <span>Repsol</span>
            <span>BBVA</span>
            <span>Estrella Galicia</span>
            <span>Hijos de Rivera</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lnd-features" id="features">
        <div className="lnd-wrap">
          <div className="lnd-sec-head">
            <span className="lnd-eyebrow">La plataforma</span>
            <h2>Todo lo que tu gente necesita para crecer.</h2>
            <p>Un mismo espacio para aprender, certificarse y resolver dudas — en formato corto y con la tecnología de beonit por debajo.</p>
          </div>
          <div className="lnd-cards">
            <article className="lnd-card">
              <div className="lnd-card-photo" style={{ backgroundImage: `url(${photo.feature1})` }}/>
              <div className="lnd-card-body">
                <div className="lnd-card-num">01</div>
                <h3>Cursos en vídeo</h3>
                <p>Contenido en piezas cortas que se ven en minutos. Aprendizaje que encaja en el día a día, no al revés.</p>
                <span className="lnd-card-link">Ver catálogo →</span>
              </div>
            </article>
            <article className="lnd-card">
              <div className="lnd-card-photo" style={{ backgroundImage: `url(${photo.feature2})` }}/>
              <div className="lnd-card-body">
                <div className="lnd-card-num">02</div>
                <h3>Rutas de certificación</h3>
                <p>Itinerarios guiados con exámenes y certificados oficiales. Progreso medible para cada persona y equipo.</p>
                <span className="lnd-card-link">Explorar rutas →</span>
              </div>
            </article>
            <article className="lnd-card">
              <div className="lnd-card-photo" style={{ backgroundImage: `url(${photo.feature3})` }}/>
              <div className="lnd-card-body">
                <div className="lnd-card-num">03</div>
                <h3>Mentor con IA · beonAI</h3>
                <p>Un asistente que responde dudas con la fuente al lado de cada respuesta. Disponible siempre, dentro del flujo.</p>
                <span className="lnd-card-link">Conocer beonAI →</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SPLIT 1 */}
      <section className="lnd-split" id="how">
        <div className="lnd-wrap lnd-split-grid">
          <div className="lnd-split-photo" style={{ backgroundImage: `url(${photo.split1})` }}/>
          <div>
            <span className="lnd-eyebrow">Para managers</span>
            <h2>Visibilidad real del progreso de tu equipo.</h2>
            <p>Sin hojas de cálculo. Cada manager ve en un vistazo qué rutas avanzan, dónde hay bloqueos y qué certificaciones caducan.</p>
            <div className="lnd-split-list">
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text"><b>Paneles por equipo</b> con avance, ranking y alertas.</span></div>
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text"><b>Asignación de rutas</b> a personas o grupos en un clic.</span></div>
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text"><b>Certificados</b> y recordatorios automáticos de renovación.</span></div>
            </div>
            <a className="lnd-btn lnd-btn-outline" onClick={goLogin}>Ver el panel de manager</a>
          </div>
        </div>
      </section>

      {/* SPLIT 2 (reverse) */}
      <section className="lnd-split reverse" style={{ paddingTop: 0 }}>
        <div className="lnd-wrap lnd-split-grid">
          <div className="lnd-split-photo" style={{ backgroundImage: `url(${photo.split2})` }}/>
          <div>
            <span className="lnd-eyebrow">Para tu gente</span>
            <h2>Multi-idioma, multi-dispositivo, sin fricción.</h2>
            <p>Cada workspace con su propia marca. Tus equipos entran con SSO y aprenden en español, inglés o portugués, desde donde estén.</p>
            <div className="lnd-split-list">
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text">Disponible en <b>ES · EN · PT</b>.</span></div>
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text"><b>Branding por workspace</b> — Repsol, BBVA, Estrella Galicia…</span></div>
              <div className="lnd-split-item"><span className="tick">✓</span><span className="it-text">Acceso seguro con el <b>SSO corporativo</b>.</span></div>
            </div>
            <a className="lnd-btn lnd-btn-outline" onClick={goLogin}>Cómo funciona</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lnd-stats">
        <div className="lnd-wrap lnd-stats-grid">
          <div className="lnd-stat"><div className="num">+<span className="ac">4</span></div><div className="lbl">workspaces corporativos activos</div></div>
          <div className="lnd-stat"><div className="num">3</div><div className="lbl">idiomas · ES · EN · PT</div></div>
          <div className="lnd-stat"><div className="num"><span className="ac">94</span>%</div><div className="lbl">de cursos completados</div></div>
        </div>
      </section>

      {/* CTA */}
      <section className="lnd-cta" id="cta">
        <div className="lnd-wrap">
          <div className="lnd-cta-box">
            <div className="cta-text">
              <h2>Empieza a aprender hoy.</h2>
              <p>Entra con tu cuenta corporativa y retoma tu ruta donde la dejaste.</p>
            </div>
            <div className="cta-actions">
              <a className="lnd-btn lnd-btn-white lnd-btn-lg" onClick={goLogin}>Iniciar sesión</a>
              <a className="lnd-btn lnd-btn-ghost-w lnd-btn-lg" onClick={goDemo}>Solicitar demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lnd-footer">
        <div className="lnd-wrap">
          <div className="lnd-footer-grid">
            <div className="lnd-footer-brand">
              <a href="#" className="lnd-logo" onClick={(e) => e.preventDefault()}>
                <img src={logo} alt="beonit"/>
                <span className="lnd-logo-text">Solid<span className="stream">Stream</span></span>
              </a>
              <p>Personas cuidando de personas. Tecnología y metodología para el talento de negocio.</p>
            </div>
            <div className="lnd-footer-col">
              <h4>Plataforma</h4>
              <a onClick={goLogin}>Catálogo</a>
              <a onClick={goLogin}>Rutas</a>
              <a onClick={goLogin}>Certificados</a>
              <a onClick={goLogin}>BeonAI</a>
            </div>
            <div className="lnd-footer-col">
              <h4>Empresa</h4>
              <a href="https://beonit.es" target="_blank" rel="noopener noreferrer">Quiénes somos</a>
              <a href="https://beonit.es" target="_blank" rel="noopener noreferrer">Clientes</a>
              <a href="https://beonit.es/contacto" target="_blank" rel="noopener noreferrer">Contacto</a>
            </div>
            <div className="lnd-footer-col">
              <h4>Legal</h4>
              <a href="https://beonit.es" target="_blank" rel="noopener noreferrer">Privacidad</a>
              <a href="https://beonit.es" target="_blank" rel="noopener noreferrer">Cookies</a>
              <a href="https://beonit.es" target="_blank" rel="noopener noreferrer">Aviso legal</a>
            </div>
          </div>
          <div className="lnd-footer-bot">
            <span>© 2026 beonit · SolidStream · Plataforma de formación corporativa</span>
            <div className="langs">
              <a className="active">ES</a>
              <a>EN</a>
              <a>PT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.LandingView = LandingView;
