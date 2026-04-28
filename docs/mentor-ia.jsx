// mentor-ia.jsx — MENTOR-IA standalone (polish pack v2)
// Llama a la serverless function /api/chat en Vercel (api/chat.js).

const { useState: useM, useEffect: useEM, useRef: useMRef } = React;

const MENTOR_USER_PROFILE = {
  name: 'Amaia Ruiz',
  role: 'Publish Agent',
  progress: 15,
  currentPill: 4,
};

async function _callAI(messages) {
  const url = window.MENTOR_IA_API_URL || '/api/chat';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content || '',
      })),
      userProfile: MENTOR_USER_PROFILE,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.status);
    console.error('[MENTOR-IA] error:', res.status, err);
    throw new Error(`${res.status}`);
  }
  const data = await res.json();
  return data.content || '';
}

// ── Avatar pulsante (logo MENTOR-IA) ────────────────────────────────────────
function MentorAvatar({ size = 'sm' }) {
  return (
    <div className={`mentor-avatar${size === 'lg' ? ' lg' : ''}`} aria-hidden="true">
      <img src={(window.MENTOR_IA_LOGO_URL || 'mentor-ia-logo.png') + '?v=20260427g'} alt="MENTOR-IA"/>
    </div>
  );
}

// ── Markdown render minimalista (con Think Pill badges) ──────────────────────
// Soporta: **negrita**, *cursiva*, `code`, listas (- / 1.), ### headers,
// > citas, líneas en blanco como párrafos, y detección de "Pill X" / "PX".
function renderInline(text, keyPrefix = '') {
  // Detecta "Pill 4", "Pill 4 de 41", "P4", "Think Pill 20" → <span class="tp-badge">P4</span>
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|(?:Think\s+)?Pills?\s+\d+(?:\s*[-–]\s*\d+)?(?:\s*de\s*\d+)?|\bP\d{1,2}\b)/gi;
  let lastIdx = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) tokens.push(text.slice(lastIdx, match.index));
    const m = match[0];
    if (m.startsWith('**')) {
      tokens.push(<strong key={keyPrefix + 'b' + (i++)}>{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('*')) {
      tokens.push(<em key={keyPrefix + 'i' + (i++)}>{m.slice(1, -1)}</em>);
    } else if (m.startsWith('`')) {
      tokens.push(<code key={keyPrefix + 'c' + (i++)}>{m.slice(1, -1)}</code>);
    } else {
      // Think Pill badge — extrae número(s)
      const numMatch = m.match(/\d+(?:\s*[-–]\s*\d+)?/);
      const num = numMatch ? numMatch[0].replace(/\s+/g, '') : '?';
      tokens.push(<span key={keyPrefix + 'p' + (i++)} className="tp-badge" title={m}>P{num}</span>);
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) tokens.push(text.slice(lastIdx));
  return tokens;
}

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split(/\n/);
  const blocks = [];
  let buf = [];
  let listType = null; // 'ul' | 'ol' | null
  let listItems = [];

  const flushBuf = (k) => {
    if (buf.length) {
      blocks.push(<p key={'p' + k}>{renderInline(buf.join(' '), 'p' + k + '-')}</p>);
      buf = [];
    }
  };
  const flushList = (k) => {
    if (listItems.length) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      blocks.push(
        <Tag key={'l' + k}>
          {listItems.map((li, idx) => <li key={idx}>{renderInline(li, 'l' + k + '-' + idx + '-')}</li>)}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((raw, k) => {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      flushBuf(k); flushList(k);
      return;
    }
    const ulMatch = line.match(/^[\s]*[-*]\s+(.*)$/);
    const olMatch = line.match(/^[\s]*\d+[.)]\s+(.*)$/);
    const hMatch  = line.match(/^(#{2,4})\s+(.*)$/);
    const qMatch  = line.match(/^>\s+(.*)$/);
    if (hMatch) {
      flushBuf(k); flushList(k);
      const Tag = hMatch[1].length >= 4 ? 'h4' : 'h3';
      blocks.push(<Tag key={'h' + k}>{renderInline(hMatch[2], 'h' + k + '-')}</Tag>);
    } else if (qMatch) {
      flushBuf(k); flushList(k);
      blocks.push(<blockquote key={'q' + k}>{renderInline(qMatch[1], 'q' + k + '-')}</blockquote>);
    } else if (ulMatch) {
      flushBuf(k);
      if (listType !== 'ul') flushList(k);
      listType = 'ul';
      listItems.push(ulMatch[1]);
    } else if (olMatch) {
      flushBuf(k);
      if (listType !== 'ol') flushList(k);
      listType = 'ol';
      listItems.push(olMatch[1]);
    } else {
      flushList(k);
      buf.push(line);
    }
  });
  flushBuf('end'); flushList('end');

  return <div className="md-text">{blocks}</div>;
}

// ── Sugerencias contextuales por vista ──────────────────────────────────────
const CTX_SUGGESTIONS = {
  home:      [
    { label:'¿Qué módulo sigue?',           q:'¿Cuál es el siguiente módulo que debería hacer?' },
    { label:'Resumen de mi progreso',       q:'Hazme un resumen breve de mi progreso y dónde estoy.' },
    { label:'Quiz de 3 preguntas',          q:'Hazme 3 preguntas de repaso sobre lo último que he visto.' },
  ],
  player:    [
    { label:'Resume este módulo',           q:'Resúmeme en 3 puntos lo más importante del módulo que estoy viendo.' },
    { label:'Da un ejemplo Repsol',         q:'Dame un ejemplo concreto de cómo aplica esto en Repsol.' },
    { label:'¿Qué Think Pill profundiza?',  q:'¿Qué Think Pill cubre esto en mayor profundidad?' },
  ],
  detail:    [
    { label:'Explícamelo simple',           q:'Explícame este tema como si fuera la primera vez que lo veo.' },
    { label:'Casos de uso',                 q:'Dame 3 casos de uso reales en Repsol.' },
  ],
  path:      [
    { label:'¿Qué me falta?',               q:'¿Qué me falta para completar la certificación?' },
    { label:'Plan para esta semana',        q:'Hazme un plan realista para esta semana.' },
  ],
  dashboard: [
    { label:'Cohortes en riesgo',           q:'¿Qué cohortes están en riesgo según el dashboard?' },
    { label:'Top 3 acciones',               q:'Sugiéreme las 3 acciones de mayor impacto ahora mismo.' },
  ],
  coach:     [
    { label:'¿Qué módulo sigue?',           q:'¿Cuál es el siguiente módulo que debería hacer?' },
    { label:'Explícame las macros',         q:'¿Qué es una macro en Sprinklr y cómo se usa en Repsol?' },
    { label:'Flujo de aprobación',          q:'¿Cómo funciona el flujo de aprobación en Social Publish?' },
    { label:'SLA en Care',                  q:'¿Qué SLA maneja Repsol en Sprinklr Care?' },
    { label:'Escalar a Salesforce',         q:'¿Cuándo y cómo transfiero un caso de Sprinklr a Salesforce?' },
    { label:'Quiz rápido',                  q:'Hazme 3 preguntas de repaso sobre lo que he visto hasta ahora.' },
  ],
};

// ── AISidekick (panel lateral) ──────────────────────────────────────────────
function AISidekick({ setAIMode, aiMode, view }) {
  const [input, setInput] = useM('');
  const [loading, setLoading] = useM(false);
  const [msgs, setMsgs] = useM([]);
  const scrollRef = useMRef(null);

  const contextLabel = {
    home: 'Vista general · tu progreso',
    player: 'Viendo módulo · Programar posts',
    detail: 'Detalle de módulo',
    path: 'Tu ruta de certificación',
    dashboard: 'Analytics · visión admin',
    coach: 'MENTOR-IA · modo completo',
  }[view] || 'Plataforma Sprinklr';

  const QUICK = CTX_SUGGESTIONS[view] || CTX_SUGGESTIONS.home;

  useEM(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading) return;
    const newMsgs = [...msgs, { role: 'user', text: q }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const reply = await _callAI(newMsgs);
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'No he podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.' }]);
    }
    setLoading(false);
  };

  return (
    <aside className="ai">
      <div className="ai-head">
        <div className="ai-head-left">
          <MentorAvatar/>
          <div>
            <div className="title">MENTOR-IA <span className="beta-badge">BETA</span></div>
            <div className="sub">{contextLabel}</div>
          </div>
        </div>
        <button className="collapse" onClick={() => setAIMode(aiMode === 'hero' ? 'companion' : 'hero')}>
          {aiMode === 'hero' ? '— Reducir' : '↔ Ampliar'}
        </button>
        <button className="collapse" onClick={() => setAIMode('collapsed')}>× Ocultar</button>
      </div>
      <div className="ai-body" ref={scrollRef}>
        {view === 'player' && (
          <div className="ai-context-card">
            <div className="thumb"><div className="ph teal"/></div>
            <div className="meta">
              <span className="eyebrow">Viendo ahora</span>
              <div className="t">Programar posts · Lección 3 de 5</div>
            </div>
          </div>
        )}
        <div className="ai-msg from-ai">
          <span className="who">MENTOR-IA</span>
          <div className="bubble">
            <MarkdownText text={`¡Hola Amaia! Llevas un **58% de tu certificación**. El siguiente módulo es *Programar posts* (cubierto en Pill 17). ¿Seguimos?`}/>
          </div>
        </div>
        <div className="ai-chip-row">
          {QUICK.map((q, i) => (
            <button key={i} className="ai-chip ctx" onClick={() => send(q.q)}>{q.label}</button>
          ))}
        </div>
        {msgs.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
            <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
            <div className="bubble">
              {m.role === 'assistant'
                ? <MarkdownText text={m.text}/>
                : <span style={{whiteSpace:'pre-wrap'}}>{m.text}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg from-ai">
            <span className="who">MENTOR-IA</span>
            <div className="bubble mentor-typing"><span/><span/><span/></div>
          </div>
        )}
      </div>
      <div className="ai-input-wrap">
        <div className="ai-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Pregunta sobre Sprinklr o tu formación…"
          />
          <button className="send" onClick={send}><Icon name="send" size={14}/></button>
        </div>
        <div className="ai-footer-row">
          <span className="hint">Contexto: módulo actual · ruta · progreso</span>
          <span className="hint">↵ enviar</span>
        </div>
      </div>
    </aside>
  );
}

// ── Coach (pantalla completa) ───────────────────────────────────────────────
function Coach() {
  const [input, setInput] = useM('');
  const [loading, setLoading] = useM(false);
  const [apiStatus, setApiStatus] = useM('live');
  const [msgs, setMsgs] = useM([
    { role: 'assistant', text: '¡Hola **Amaia**! Soy MENTOR-IA, tu asistente de formación Sprinklr.\n\nLlevas un **15% de tu certificación** — estás en el *Bloque 2*, sobre estructura y gobernanza (Pills 6-10).\n\n¿En qué te puedo ayudar hoy?' },
  ]);
  const scrollRef = useMRef(null);

  const quickActions = CTX_SUGGESTIONS.coach;

  useEM(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading) return;
    const newMsgs = [...msgs, { role: 'user', text: q }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const reply = await _callAI(newMsgs);
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
      setApiStatus('live');
    } catch (err) {
      setApiStatus('error');
      setMsgs(m => [...m, { role: 'assistant', text: `No he podido conectar (${err.message}). Comprueba tu conexión e inténtalo de nuevo.` }]);
    }
    setLoading(false);
  };

  return (
    <div className="coach-root">
      <aside className="coach-side">
        <div>
          <h3>Conversaciones de hoy</h3>
          <div className="coach-hist-item active"><div className="t">Progreso en la certificación</div><div className="d">Hace 2 min</div></div>
          <div className="coach-hist-item"><div className="t">¿Cómo programar posts recurrentes?</div><div className="d">09:15</div></div>
        </div>
        <div>
          <h3>Esta semana</h3>
          <div className="coach-hist-item"><div className="t">Diferencia entre DAM y biblioteca</div><div className="d">Lun</div></div>
          <div className="coach-hist-item"><div className="t">Flujo de aprobación urgente</div><div className="d">Dom</div></div>
          <div className="coach-hist-item"><div className="t">Quiz sobre Publish Agent</div><div className="d">Sáb</div></div>
        </div>
        <div>
          <h3 style={{fontSize:11, marginBottom:8}}>Motores IA</h3>
          {[
            { icon:'👥', label:'Cultura Repsol', sub:'Knowledge Points · Expectativas · Objetivos' },
            { icon:'📊', label:'Perfil competencial', sub:'Test competenciales · Evolución' },
            { icon:'📄', label:'Base conocimiento Repsol', sub:'Módulos Sprinklr · Procedimientos' },
          ].map((m,i) => (
            <div key={i} style={{display:'flex', gap:8, padding:'8px 12px', borderRadius:8, background:'var(--paper-2)', marginBottom:4}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <div>
                <div style={{fontSize:11, fontWeight:600, color:'var(--beonit-lime)'}}>{m.label}</div>
                <div style={{fontSize:10, color:'var(--ink-4)', fontFamily:'var(--mono)'}}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:'auto', padding:'16px 12px', borderTop:'1px solid var(--line)', fontFamily:'var(--mono)', fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase', lineHeight:1.6}}>
          Powered by Claude · Anthropic<br/>
          Contexto: formación Sprinklr · Repsol
        </div>
      </aside>
      <div className="coach-main">
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:8, padding:'14px 20px', background:'linear-gradient(135deg, var(--bn-blue) 0%, #004d8a 60%, #003a72 100%)', borderRadius:14, color:'#fff', boxShadow:'0 8px 24px rgba(0,89,150,0.25)'}}>
          <MentorAvatar size="lg"/>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, lineHeight:1, marginBottom:2}}>MENTOR-IA <span style={{fontFamily:'var(--mono)', fontStyle:'normal', fontSize:9, background:'var(--bn-lime)', color:'var(--ink)', padding:'1px 6px', borderRadius:4, letterSpacing:'0.08em', textTransform:'uppercase', verticalAlign:'middle', marginLeft:4}}>BETA</span></div>
            <div style={{fontFamily:'var(--mono)', fontSize:9, color:'rgba(255,255,255,0.65)', letterSpacing:'0.1em', textTransform:'uppercase'}}>IA contextualizada · Sprinklr Repsol</div>
          </div>
          <div style={{fontFamily:'var(--mono)', fontSize:9, color: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:5}}>
            <span style={{width:6, height:6, borderRadius:'50%', background: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.4)', display:'inline-block'}}/>
            {apiStatus === 'live' ? 'En línea' : apiStatus === 'error' ? 'Sin conexión' : 'Conectando…'}
          </div>
        </div>
        <div className="coach-actions">
          <div className="coach-action"><span className="eyebrow">Módulo siguiente · 5 min</span><div className="t">Programar posts y calendario</div><div className="d">Siguiente en tu ruta de certificación Repsol.</div></div>
          <div className="coach-action"><span className="eyebrow">Serie · 22 min</span><div className="t">Sprinklr Analytics para Repsol</div><div className="d">5 lecciones para interpretar tus campañas.</div></div>
          <div className="coach-action"><span className="eyebrow">Quiz · 90 seg</span><div className="t">Test de Publish Agent</div><div className="d">Verifica lo aprendido en los módulos 1 y 2.</div></div>
          <div className="coach-action"><span className="eyebrow">Resumen</span><div className="t">Lo que aprendí esta semana</div><div className="d">Flujo de aprobación completado · 2 módulos terminados.</div></div>
        </div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
          {quickActions.map((a, i) => (
            <button key={i} className="ai-chip ctx" onClick={() => send(a.q)} style={{fontSize:11}}>{a.label}</button>
          ))}
        </div>
        <div ref={scrollRef} style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, padding:'4px 0 16px'}}>
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
              <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
              <div className="bubble">
                {m.role === 'assistant'
                  ? <MarkdownText text={m.text}/>
                  : <span style={{whiteSpace:'pre-wrap'}}>{m.text}</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="ai-msg from-ai">
              <span className="who">MENTOR-IA</span>
              <div className="bubble mentor-typing"><span/><span/><span/></div>
            </div>
          )}
        </div>
        <div className="coach-input-shell">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Pregúntame lo que quieras sobre Sprinklr o tu formación… (↵ enviar)"
            disabled={loading}
          />
          <div className="coach-input-tools">
            <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.06em'}}>↵ enviar · Shift+↵ nueva línea</div>
            <button className="btn sm send" onClick={send} disabled={loading} style={{opacity: loading ? 0.5 : 1}}>
              {loading ? 'Pensando…' : 'Preguntar →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sobreescribir los componentes en window (después de prototype-views.jsx)
Object.assign(window, { AISidekick, Coach, MentorAvatar, MarkdownText });
console.log('[MENTOR-IA v3] polish pack cargado · markdown + Think Pill badges + sugerencias contextuales');
