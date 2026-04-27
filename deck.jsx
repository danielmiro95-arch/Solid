// deck.jsx — Solid 2.0 · Strategy deck (es) · beonit spin-off

function DeckSlide({ bg = 'paper', children, label, num, total }) {
  const palette = {
    paper: { bg: 'var(--paper)', fg: 'var(--ink)' },
    dark:  { bg: 'var(--dark)',  fg: 'var(--paper)' },
    cream: { bg: 'var(--paper-2)', fg: 'var(--ink)' },
    accent:{ bg: 'var(--accent)', fg: 'var(--ink)' },
  }[bg] || { bg: 'var(--paper)', fg: 'var(--ink)' };

  return (
    <section data-screen-label={label} style={{background: palette.bg, color: palette.fg, padding: '80px 96px', width: '100%', height: '100%', position: 'relative', display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.5, marginBottom:32}}>
        <span>Solid · by beonit · Estrategia</span>
        <span>{num} / {total}</span>
      </div>
      {children}
    </section>
  );
}

const N = 12;

function Deck() {
  return (
    <>
    {/* 01 Portada */}
    <DeckSlide label="01 Portada" bg="dark" num="01" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:12, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--accent)', marginBottom:24}}>Estrategia de producto · Q2 2026</div>
        <h1 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:160, lineHeight:0.88, letterSpacing:'-0.04em', margin:'0 0 24px'}}>
          Solid<span style={{color:'var(--accent)'}}>,</span><br/>
          <em style={{fontStyle:'italic'}}>premium.</em>
        </h1>
        <div style={{fontFamily:'var(--serif)', fontSize:26, lineHeight:1.3, maxWidth:'22ch', color:'rgba(255,255,255,0.7)'}}>
          De una herramienta de microlearning en WhatsApp a una experiencia de aprendizaje centralizada, premium y con IA.
        </div>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)'}}>
        <span>Preparado por <b style={{fontWeight:600}}>beonit</b></span>
        <span>Deck consultor · 9 min de lectura</span>
      </div>
    </DeckSlide>

    {/* 02 Hoy */}
    <DeckSlide label="02 Hoy" num="02" total={N}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:96, margin:'auto 0'}}>
        <div>
          <div className="eyebrow">Hoy</div>
          <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:88, lineHeight:0.98, letterSpacing:'-0.03em', margin:'16px 0 28px'}}>
            Solid es un <em style={{fontStyle:'italic'}}>mensaje.</em>
          </h2>
          <p style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.45, color:'var(--ink-3)', maxWidth:'34ch'}}>
            Formación entregada como píldoras de tres minutos en WhatsApp. Una idea. Una píldora. Listo.
          </p>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:20, marginTop:60}}>
          {[
            ['Fragmentado', 'Vive dentro de WhatsApp, junto a la lista de la compra y los memes.'],
            ['Sin descubrimiento', 'El único contenido que ves es el que se empuja hoy.'],
            ['No inmersivo', 'Sin biblioteca, sin serendipia, sin profundidad.'],
            ['Sabe a gratis', 'No premium. No es un destino.'],
          ].map(([t,d], i) => (
            <div key={i} style={{borderTop:'1px solid var(--line)', paddingTop:14, display:'grid', gridTemplateColumns:'40px 1fr', gap:14}}>
              <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', letterSpacing:'0.1em'}}>0{i+1}</span>
              <div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, lineHeight:1.1}}>{t}</div>
                <div style={{fontSize:15, color:'var(--ink-3)', marginTop:4, lineHeight:1.4}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 03 La apuesta */}
    <DeckSlide label="03 La apuesta" bg="cream" num="03" total={N}>
      <div style={{margin:'auto 0', maxWidth:'22ch'}}>
        <div className="eyebrow">La apuesta</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:130, lineHeight:0.92, letterSpacing:'-0.035em', margin:'16px 0 0'}}>
          Conserva la <em style={{fontStyle:'italic'}}>píldora</em>.<br/>
          Construye la <span style={{background:'linear-gradient(180deg, transparent 64%, var(--accent) 64%)', padding:'0 4px'}}>biblioteca</span>.<br/>
          Añade un <em style={{fontStyle:'italic'}}>coach</em>.
        </h2>
        <p style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.45, color:'var(--ink-3)', margin:'40px 0 0', maxWidth:'48ch'}}>
          No reemplaces lo que funciona. Rodéalo de una experiencia premium, cinematográfica — y de una IA que haga sentir que toda la biblioteca fue hecha para cada persona.
        </p>
      </div>
    </DeckSlide>

    {/* 04 Visión */}
    <DeckSlide label="04 Vision" num="04" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Visión de producto · Solid 2.0</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px', maxWidth:'28ch'}}>
          Una biblioteca premium de aprendizaje que responde <em style={{fontStyle:'italic'}}>"¿qué debería aprender hoy?"</em> — en tres minutos.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:32, borderTop:'1px solid var(--line)', paddingTop:32}}>
          {[
            ['Público', <>Profesionales en su mid-career dentro de empresas modernas — <em>B2B principal</em>. Curiosos autodirigidos — <em>B2C secundario</em>.</>],
            ['Valor', <>Tres minutos de <em>señal</em> al día. Una biblioteca cuando quieres más. Un coach cuando te atascas.</>],
            ['Posición', <>Entre un LMS (demasiado pesado) y TikTok (demasiado ligero). <em>Editorial, no enciclopédico.</em></>],
          ].map(([t, d], i) => (
            <div key={i}>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:12}}>0{i+1} · {t}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.35}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 05 Modelo de contenido */}
    <DeckSlide label="05 Modelo de contenido" bg="cream" num="05" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Modelo de contenido</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 56px'}}>
          Cinco formatos. Una <em style={{fontStyle:'italic'}}>idea</em> en el centro.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:20}}>
          {[
            ['Píldora', '3 min', 'Una idea. El átomo. Siempre lo primero que enviamos.', '◉'],
            ['Reel', ':30–:60', 'Una píldora comprimida en un gancho. Combustible de descubrimiento.', '▶'],
            ['Serie', '5–7 píldoras', 'Un tema para una sentada. Para maratonear.', '▦'],
            ['Podcast', '30–50 min', 'Profundidad. Para el coche y el paseo.', '◐'],
            ['Ruta', '2–8 semanas', 'Un viaje guiado. Píldoras + reflexión + quiz.', '◇'],
          ].map(([t,d,x,g], i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', gap:12, padding:'24px 20px', borderRadius:16, background:'var(--paper)', minHeight:280}}>
              <div style={{fontFamily:'var(--serif)', fontSize:56, fontStyle:'italic', lineHeight:0.9, color:'var(--ink)'}}>{g}</div>
              <div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:30, lineHeight:1}}>{t}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:4}}>{d}</div>
              </div>
              <div style={{fontSize:15, lineHeight:1.4, color:'var(--ink-3)', marginTop:'auto'}}>{x}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, color:'var(--ink-3)', textAlign:'center'}}>
          Microlearning ≠ binge learning — se componen. Picas una píldora, te quedas con una serie, desapareces en un podcast.
        </div>
      </div>
    </DeckSlide>

    {/* 06 Anatomía Home */}
    <DeckSlide label="06 Anatomia Home" bg="dark" num="06" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12}}>Pantalla Home · anatomía</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'0 0 40px'}}>
          Editorial, no <em style={{fontStyle:'italic'}}>infinito</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:56, alignItems:'start'}}>
          <div style={{border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:20, background:'rgba(255,255,255,0.03)'}}>
            {[
              {n:1, t:'Hero · Hoy', d:'Una elección del editor + una píldora a continuar.'},
              {n:2, t:'Continúa', d:'Píldoras y series que empezaste esta semana.'},
              {n:3, t:'Tres minutos para hoy', d:'Elegidas por el coach desde tu ruta y tu calendario.'},
              {n:4, t:'Tira del coach', d:'"¿Qué debería aprender antes del jueves?"'},
              {n:5, t:'Cortos · Series · Podcasts · Rutas', d:'Filas distintas, formas distintas por formato.'},
            ].map(r => (
              <div key={r.n} style={{display:'grid', gridTemplateColumns:'30px 1fr', gap:14, padding:'10px 0', borderBottom:'1px dashed rgba(255,255,255,0.1)', alignItems:'center'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--accent)'}}>0{r.n}</span>
                <div>
                  <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:20}}>{r.t}</div>
                  <div style={{fontSize:13, color:'rgba(255,255,255,0.6)'}}>{r.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:14}}>Reglas de jerarquía visual</div>
            {[
              'Un solo hero. Nunca dos.',
              'Píldoras = redondas. Reels = verticales. Series = rectángulos. Podcasts = círculos.',
              'Elección del editor sobre algoritmo, una fila de cada cinco.',
              'Sin scroll infinito. Seis filas. Eso es el día.',
              'El coach vive a la derecha. Nunca en medio del contenido.',
            ].map((r,i) => (
              <div key={i} style={{display:'flex', gap:14, padding:'12px 0', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:12, color:'var(--accent)', width:20}}>→</span>
                <span style={{fontFamily:'var(--serif)', fontSize:18, lineHeight:1.3, color:'rgba(255,255,255,0.85)'}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DeckSlide>

    {/* 07 Coach */}
    <DeckSlide label="07 Coach IA" num="07" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Coach IA</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:88, lineHeight:0.95, letterSpacing:'-0.03em', margin:'16px 0 48px', maxWidth:'22ch'}}>
          Un <em style={{fontStyle:'italic'}}>compañero</em>, no una funcionalidad.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:56}}>
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {[
              ['Recomendar', 'Según tu rol, tu ruta, tu calendario y lo que acabas de terminar. "¿Cuál es la píldora de hoy?"'],
              ['Resumir', 'TL;DR de cualquier vídeo. Convierte una serie en un playbook de una página.'],
              ['Responder', 'Pregunta sobre un capítulo concreto. Cita la píldora con marca de tiempo.'],
              ['Acompañar', 'Empuja antes de las reuniones. Refuerza después. Nunca culpa.'],
              ['Sugerir lo siguiente', 'Construye tu próxima ruta, a tu cadencia, desde la biblioteca.'],
            ].map(([t,d], i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'160px 1fr', gap:20, paddingBottom:16, borderBottom:'1px solid var(--line)'}}>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, lineHeight:1}}>{t}</div>
                <div style={{fontFamily:'var(--serif)', fontSize:17, lineHeight:1.45, color:'var(--ink-3)'}}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--dark)', color:'var(--paper)', borderRadius:16, padding:28, display:'flex', flexDirection:'column', gap:14}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <div style={{width:28, height:28, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent), #B8780E 75%, #5C3A07)', boxShadow:'0 0 18px rgba(243,165,37,0.45)'}}/>
              <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)'}}>Coach · en vivo</span>
            </div>
            <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4}}>
              "Tienes un 1:1 con Pablo el jueves. Según las notas de la semana pasada, <span style={{background:'linear-gradient(180deg, transparent 62%, var(--accent) 62%)', padding:'0 2px'}}>'Feedback: actúa, no etiquetes'</span> son tres minutos bien gastados. ¿Lo añado a hoy?"
            </div>
            <div style={{display:'flex', gap:8, marginTop:'auto'}}>
              <button style={{padding:'8px 14px', borderRadius:999, background:'var(--accent)', color:'var(--ink)', border:'none', fontSize:13, fontWeight:500}}>Añadir a hoy</button>
              <button style={{padding:'8px 14px', borderRadius:999, background:'transparent', color:'var(--paper)', border:'1px solid rgba(255,255,255,0.3)', fontSize:13}}>Enviar por WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </DeckSlide>

    {/* 08 Customer journey */}
    <DeckSlide label="08 Journey" bg="cream" num="08" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Customer journey</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px'}}>
          Un día, <em style={{fontStyle:'italic'}}>entre canales</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16}}>
          {[
            ['09:00', 'WhatsApp', 'Píldora de la mañana. 3 min. Una idea.', 'lime'],
            ['10:42', 'Escritorio', 'Abre la biblioteca. Fila de hoy. Elección del editor.', 'warm'],
            ['13:30', 'Coach', '"¿Qué debería leer antes del 1:1?"', 'plum'],
            ['18:00', 'Player', 'Una serie en el trayecto, dentro de la app.', 'olive'],
            ['21:14', 'WhatsApp', 'Recap de una línea. "Guardado en tu canon."', 'teal'],
          ].map(([time, ch, d, tone], i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', gap:10}}>
              <div style={{aspectRatio:'4/3', borderRadius:12, overflow:'hidden', position:'relative'}}>
                <div className={`ph ${tone}`} style={{position:'absolute', inset:0}}>{ch}</div>
              </div>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', color:'var(--ink-4)'}}>{time} · {ch.toUpperCase()}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', lineHeight:1.2}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:48, padding:24, border:'1px solid var(--line)', borderRadius:14, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4, color:'var(--ink-2)'}}>
          <span className="eyebrow" style={{display:'block', marginBottom:8, fontStyle:'normal'}}>El principio de diseño</span>
          WhatsApp es el <em>empujón</em>. La app es la <em>biblioteca</em>. El coach es el <em>hilo</em> que las une.
        </div>
      </div>
    </DeckSlide>

    {/* 09 MVP */}
    <DeckSlide label="09 MVP" num="09" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">MVP · 12 semanas</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px'}}>
          Lanza la <em style={{fontStyle:'italic'}}>biblioteca más pequeña</em> que ya sea un <em style={{fontStyle:'italic'}}>destino</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
          {[
            {ph:'Ahora · Semanas 1–12', t:'El destino', items:['Home con 4 filas','Ficha de píldora + serie + Player','Coach en modo compañero','Web móvil + escritorio','La píldora diaria de WhatsApp se mantiene']},
            {ph:'Siguiente · Q3', t:'La biblioteca', items:['Reels y podcasts','Búsqueda semántica con IA','Rutas guiadas (4–8 semanas)','Guarda en tu canon','Dashboards de equipo (B2B)']},
            {ph:'Después · Q4+', t:'El ecosistema', items:['iOS + Android nativas','Marketplace de editores','Eventos en cohorte','SSO empresarial + SCIM','Coach en briefings previos a reunión']},
          ].map((col, i) => (
            <div key={i} style={{padding:'24px 20px', borderRadius:14, background: i===0?'var(--ink)':'var(--paper-2)', color: i===0?'var(--paper)':'var(--ink)', display:'flex', flexDirection:'column', gap:12}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color: i===0?'var(--accent)':'var(--ink-4)'}}>{col.ph}</div>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:30, lineHeight:1}}>{col.t}</div>
              <ul style={{listStyle:'none', padding:0, margin:'10px 0 0', display:'flex', flexDirection:'column', gap:8}}>
                {col.items.map((it,j) => (
                  <li key={j} style={{fontFamily:'var(--serif)', fontSize:16, lineHeight:1.4, display:'flex', gap:10}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:11, color: i===0?'var(--accent)':'var(--ink-4)'}}>→</span>{it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 10 Diferenciación */}
    <DeckSlide label="10 Diferenciacion" bg="cream" num="10" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Diferenciación</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 40px'}}>
          Ni un LMS. Ni un feed. Una <em style={{fontStyle:'italic'}}>biblioteca de aprendizaje</em>.
        </h2>
        <div style={{background:'var(--paper)', borderRadius:14, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1fr', padding:'16px 24px', background:'var(--ink)', color:'var(--paper)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span></span><span>LMS clásico</span><span>Microlearning apps</span><span>Tipo Udacity</span><span style={{color:'var(--accent)'}}>Solid 2.0</span>
          </div>
          {[
            ['Unidad de contenido', 'Curso (horas)', 'Tip / flashcard', 'Nanodegree', <><em>Píldora 3 min</em></>],
            ['Sensación', 'Institucional', 'Gamificado', 'Académico', <><em>Editorial</em></>],
            ['IA', 'Añadida', 'Ninguna', 'Tutor bot', <><em>Compañero</em></>],
            ['Cuándo se usa', 'Compliance anual', 'Cualquier minuto', 'Findes', <><em>A diario, brevemente</em></>],
            ['Qué te llevas', 'Certificado', 'Racha', 'Proyecto', <><em>Un canon más corto</em></>],
          ].map((row, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1fr', padding:'18px 24px', borderBottom:'1px solid var(--line)', alignItems:'center'}}>
              {row.map((c, j) => (
                <span key={j} style={{
                  fontFamily: j === 0 ? 'var(--mono)' : 'var(--serif)',
                  fontSize: j === 0 ? 11 : 18,
                  letterSpacing: j === 0 ? '0.08em' : 0,
                  textTransform: j === 0 ? 'uppercase' : 'none',
                  color: j === 0 ? 'var(--ink-4)' : j === 4 ? 'var(--ink)' : 'var(--ink-3)',
                  fontWeight: j === 4 ? 500 : 400,
                }}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 11 Posicionamiento */}
    <DeckSlide label="11 Posicionamiento" bg="accent" num="11" total={N}>
      <div style={{margin:'auto 0', maxWidth:'24ch'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:24}}>Cómo lo contamos</div>
        <div style={{fontFamily:'var(--serif)', fontWeight:400, fontStyle:'italic', fontSize:120, lineHeight:0.92, letterSpacing:'-0.04em', color:'var(--ink)'}}>
          "La biblioteca de tres minutos, para quien lee un libro a la vez."
        </div>
        <div style={{marginTop:48, fontFamily:'var(--mono)', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)'}}>
          — Solid 2.0, claim de trabajo
        </div>
      </div>
    </DeckSlide>

    {/* 12 Cierre */}
    <DeckSlide label="12 Cierre" bg="dark" num="12" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', marginBottom:20}}>Lo que sigue</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:120, lineHeight:0.92, letterSpacing:'-0.035em', margin:'0 0 48px'}}>
          Construyamos un <em style={{fontStyle:'italic'}}>destino.</em>
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:32, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.15)'}}>
          {[
            ['Esta semana', 'Aprobar el modelo de contenido (5 formatos) y el principio editorial.'],
            ['Próximas 2 semanas', 'Sprint de diseño: home + ficha + player + coach. Usando este prototipo.'],
            ['Después', 'Spike de ingeniería del hub de contenido + API del coach. Soft launch a 100 personas internas en 12 semanas.'],
          ].map(([t,d],i) => (
            <div key={i}>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent)', marginBottom:10}}>0{i+1} · {t}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:20, lineHeight:1.4, color:'rgba(255,255,255,0.85)'}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>
    </>
  );
}

window.Deck = Deck;
