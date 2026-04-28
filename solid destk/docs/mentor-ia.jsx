// mentor-ia.jsx — MENTOR-IA standalone (polish pack v2)
// Llama a la serverless function /api/chat en Vercel (api/chat.js).

const { useState: useM, useEffect: useEM, useRef: useMRef } = React;

const MENTOR_USER_PROFILE = {
  name: 'Amaia Ruiz',
  role: 'Publish Agent',
  progress: 15,
  currentPill: 4,
};

// ── Demo mode fallback ──────────────────────────────────────────────────────
// Cuando la API real falla (sin ANTHROPIC_API_KEY en Vercel, sin red, etc.)
// el chat sigue siendo usable con respuestas plausibles del currículum Sprinklr.
const DEMO_RESPONSES = [
  { match: /(siguiente|próximo|qué.*módulo|qué.*pill)/i,
    text: 'Tu siguiente paso es la **Pill 4** sobre *qué posibilidades operativas presentan los distintos canales* dentro de Sprinklr. Te llevará unos 4 minutos. Cuando termines, pasamos a las Pills 5-7 sobre activos, módulos y submódulos.' },
  { match: /(macro|automatiza)/i,
    text: 'Una **macro** en Sprinklr es una acción predefinida que te permite responder, etiquetar o derivar un mensaje con un solo click. En Repsol se usan sobre todo en *Care* para respuestas frecuentes (información de gasolineras, horarios, atención al cliente). Esto lo cubre la **Pill 32**. ¿Quieres un ejemplo concreto?' },
  { match: /(aprobaci[oó]n|workflow|flujo)/i,
    text: 'En Repsol el flujo de aprobación de Social Publish tiene 3 estados:\n\n- **Draft** → el agente crea el contenido\n- **Pending review** → pasa a Content Lead para revisar (24h SLA)\n- **Approved / Rejected** → si aprobado, va al calendario; si rechazado, vuelve con comentarios\n\nLas urgencias tienen un *fast-track* que cubre la **Pill 20**.' },
  { match: /(SLA|tiempo.*respuesta|care)/i,
    text: 'En **Sprinklr Care** Repsol maneja:\n\n- **First Response** ≤ 2 h en horario laboral\n- **Resolution** ≤ 24 h para casos estándar\n- Casos críticos escalan a Salesforce vía conector nativo\n\nEsto se cubre en las Pills 33-37 (Bloque Care).' },
  { match: /(salesforce|escalad|escala)/i,
    text: 'Para escalar de Sprinklr a Salesforce: pulsa el icono **🔗** en el header del caso, selecciona "Crear caso en Salesforce", y los campos básicos viajan automáticamente. Repsol tiene un mapping personalizado que incluye `pdv_id`, `customer_segment` y `priority`. La **Pill 39** lo enseña paso a paso.' },
  { match: /(quiz|test|preg[uú]nta|repaso)/i,
    text: 'Vamos con 3 preguntas de repaso:\n\n1. ¿Cuántos módulos principales tiene Sprinklr en el despliegue Repsol?\n2. ¿Qué rol aprueba contenido antes de publicar en redes corporativas?\n3. ¿En qué módulo gestionarías un activo digital (imagen, vídeo) antes de programar un post?\n\nResponde lo que creas y te corrijo.' },
  { match: /(progreso|llevo|certifica)/i,
    text: 'Vas por **15% de la certificación Publish Agent**, en el *Bloque 2: Estructura, roles y gobernanza*. Has completado las Pills 0-3 (registro, fundamentos de Sprinklr, canales, posibilidades operativas). Te quedan 8 bloques con un total de 23h estimadas. Vas a buen ritmo.' },
  { match: /(dam|biblioteca|activo)/i,
    text: 'El **DAM (Digital Asset Management)** es donde Repsol guarda y reutiliza recursos visuales: logos, imágenes de campaña, plantillas, vídeos. Antes de programar un post, los seleccionas desde DAM en lugar de subirlos cada vez. Garantiza coherencia visual. Cubierto en **Pill 12**.' },
  { match: /(calendario|programar|publish)/i,
    text: 'El **calendario editorial** de Sprinklr es la vista central de todo lo planificado. Filtras por canal, campaña, equipo o territorio. Para programar: arrastras un draft al día/hora, eliges canales (puede ser multicanal con adaptaciones automáticas por red), y queda en *pending review*. Pills 11, 17, 23-24.' },
];

function findDemoResponse(question, allMessages) {
  const lower = question.toLowerCase();
  for (const d of DEMO_RESPONSES) {
    if (d.match.test(lower)) return d.text;
  }
  // Default fallback con contexto
  return `Buena pregunta. En el contexto de Sprinklr para Repsol, te diría que **revises los módulos del Bloque actual** (estás en el 2: Estructura y gobernanza). Específicamente, las Pills 6-10 cubren los módulos de Sprinklr, los roles (Manager/Agent/Reporting), permisos y comunicación entre módulos.\n\n*Estoy en modo demo (sin API key conectada).* Para respuestas en tiempo real con Claude, configura **\`ANTHROPIC_API_KEY\`** en Vercel → Settings → Environment Variables.\n\n¿Te interesa algo concreto: aprobaciones, macros, SLAs, escalado a Salesforce, o el flujo de publicación multicanal?`;
}

async function _callAI(messages) {
  const url = window.MENTOR_IA_API_URL || '/api/chat';
  let lastQuestion = '';
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') { lastQuestion = messages[i].text || messages[i].content || ''; break; }
  }
  try {
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
      console.warn('[MENTOR-IA] API failed (' + res.status + '), falling back to demo mode:', err);
      window._mentorIaDemoMode = true;
      // Pequeño delay para que se vea el "thinking"
      await new Promise(r => setTimeout(r, 700));
      return findDemoResponse(lastQuestion, messages);
    }
    const data = await res.json();
    window._mentorIaDemoMode = false;
    return data.content || findDemoResponse(lastQuestion, messages);
  } catch (e) {
    console.warn('[MENTOR-IA] network error, demo mode:', e.message);
    window._mentorIaDemoMode = true;
    await new Promise(r => setTimeout(r, 700));
    return findDemoResponse(lastQuestion, messages);
  }
}

// ── Avatar pulsante (logo MENTOR-IA) ────────────────────────────────────────
function MentorAvatar({ size = 'sm' }) {
  return (
    <div className={`mentor-avatar${size === 'lg' ? ' lg' : ''}`} aria-hidden="true">
      <img src={(window.MENTOR_IA_LOGO_URL || 'mentor-ia-logo.png') + '?v=20260427m'} alt="MENTOR-IA"/>
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
// Saludo inicial cuando se crea una nueva conversación
const COACH_GREETING = { role: 'assistant', text: '¡Hola **Amaia**! Soy MENTOR-IA, tu asistente de formación Sprinklr.\n\nLlevas un **15% de tu certificación** — estás en el *Bloque 2*, sobre estructura y gobernanza (Pills 6-10).\n\n¿En qué te puedo ayudar hoy?' };

// Agrupa chats por antigüedad ("Hoy", "Esta semana", "Anteriores")
function groupChatsByDate(chats) {
  const now = Date.now();
  const dayMs = 86400000;
  const groups = { hoy: [], semana: [], antes: [] };
  chats.forEach(c => {
    const age = (now - c.updatedAt) / dayMs;
    if (age < 1) groups.hoy.push(c);
    else if (age < 7) groups.semana.push(c);
    else groups.antes.push(c);
  });
  return groups;
}

function fmtRelativeTime(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + ' h';
  if (diff < 86400*7) return Math.floor(diff/86400) + ' d';
  const d = new Date(ts);
  return d.getDate() + '/' + (d.getMonth()+1);
}

function Coach() {
  const [input, setInput] = useM('');
  const [loading, setLoading] = useM(false);
  const [apiStatus, setApiStatus] = useM('live');
  const [chats, setChats] = useM(() => window.ChatHistory ? window.ChatHistory.list() : []);
  const [activeId, setActiveIdState] = useM(() => window.ChatHistory ? window.ChatHistory.activeId() : null);
  const scrollRef = useMRef(null);

  // Asegura que siempre hay un chat activo
  useEM(() => {
    if (!window.ChatHistory) return;
    if (!activeId || !window.ChatHistory.get(activeId)) {
      const c = window.ChatHistory.getOrCreate();
      if (c.messages.length === 0) {
        window.ChatHistory.appendMessage(c.id, COACH_GREETING);
      }
      setActiveIdState(c.id);
      setChats(window.ChatHistory.list());
    }
  }, []);

  // Reactivo a cambios externos (otra pestaña, otro componente)
  useEM(() => {
    if (!window.ChatHistory) return;
    const refresh = () => {
      setChats(window.ChatHistory.list());
      setActiveIdState(window.ChatHistory.activeId());
    };
    window.addEventListener('chats-changed', refresh);
    return () => window.removeEventListener('chats-changed', refresh);
  }, []);

  const activeChat = chats.find(c => c.id === activeId) || null;
  const msgs = activeChat ? activeChat.messages : [];
  const quickActions = CTX_SUGGESTIONS.coach;

  useEM(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs.length, loading]);

  const newChat = () => {
    if (!window.ChatHistory) return;
    const c = window.ChatHistory.create([COACH_GREETING]);
    setActiveIdState(c.id);
    setChats(window.ChatHistory.list());
    setInput('');
  };

  const switchChat = (id) => {
    if (!window.ChatHistory) return;
    window.ChatHistory.setActive(id);
    setActiveIdState(id);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (!window.ChatHistory) return;
    const chat = window.ChatHistory.get(id);
    const title = chat ? chat.title : 'Conversación';
    if (!confirm('¿Borrar "' + title + '"?')) return;
    window.ChatHistory.remove(id);
    const list = window.ChatHistory.list();
    setChats(list);
    if (id === activeId) {
      if (list.length > 0) switchChat(list[0].id);
      else newChat();
    }
    if (window.Toast) window.Toast.info('Conversación eliminada', { icon: '🗑' });
  };

  const send = async (overrideQ) => {
    const q = (overrideQ || input).trim();
    if (!q || loading || !activeChat || !window.ChatHistory) return;
    const userMsg = { role: 'user', text: q };
    window.ChatHistory.appendMessage(activeId, userMsg);
    setChats(window.ChatHistory.list());
    setInput('');
    setLoading(true);
    try {
      const updated = window.ChatHistory.get(activeId);
      const reply = await _callAI(updated.messages);
      window.ChatHistory.appendMessage(activeId, { role: 'assistant', text: reply });
      setChats(window.ChatHistory.list());
      setApiStatus(window._mentorIaDemoMode ? 'demo' : 'live');
    } catch (err) {
      setApiStatus('error');
      window.ChatHistory.appendMessage(activeId, { role: 'assistant', text: `No he podido conectar (${err.message}). Comprueba tu conexión e inténtalo de nuevo.` });
      setChats(window.ChatHistory.list());
      if (window.Toast) window.Toast.error('MENTOR-IA no responde · ¿API key configurada en Vercel?');
    }
    setLoading(false);
  };

  const grouped = groupChatsByDate(chats);
  const renderChatItem = (c) => (
    <div key={c.id} className={`coach-hist-item ${c.id === activeId ? 'active' : ''}`} onClick={() => switchChat(c.id)} style={{position:'relative', cursor:'pointer'}}>
      <div className="t" style={{paddingRight:22, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.title}</div>
      <div className="d">{fmtRelativeTime(c.updatedAt)} · {c.messages.length} {c.messages.length === 1 ? 'msg' : 'msgs'}</div>
      <button onClick={e => deleteChat(c.id, e)} title="Borrar conversación"
        style={{position:'absolute', top:8, right:6, width:20, height:20, border:'none', background:'transparent', cursor:'pointer', borderRadius:4, color:'var(--ink-4)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.5}}
        onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.background='rgba(235,0,41,0.1)'; e.currentTarget.style.color='var(--repsol-red)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity='0.5'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-4)'; }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );

  return (
    <div className="coach-root">
      <aside className="coach-side">
        <button onClick={newChat} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 14px', background:'var(--bn-blue)', color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontFamily:'var(--sans)', fontWeight:700, fontSize:13, marginBottom:14, width:'100%'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Nueva conversación
        </button>
        {grouped.hoy.length > 0 && (
          <div>
            <h3>Hoy</h3>
            {grouped.hoy.map(renderChatItem)}
          </div>
        )}
        {grouped.semana.length > 0 && (
          <div>
            <h3>Esta semana</h3>
            {grouped.semana.map(renderChatItem)}
          </div>
        )}
        {grouped.antes.length > 0 && (
          <div>
            <h3>Anteriores</h3>
            {grouped.antes.map(renderChatItem)}
          </div>
        )}
        {chats.length === 0 && (
          <div style={{padding:'24px 12px', textAlign:'center'}}>
            <div style={{fontSize:28, marginBottom:6, opacity:0.45}}>💬</div>
            <div style={{fontSize:13, fontWeight:600, color:'var(--ink-2)', marginBottom:4}}>Sin conversaciones aún</div>
            <div style={{fontSize:11.5, color:'var(--ink-4)', lineHeight:1.5}}>Pulsa arriba para empezar la primera. Se guardarán automáticamente y podrás retomarlas más tarde.</div>
          </div>
        )}
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
          <div style={{fontFamily:'var(--mono)', fontSize:9, color: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='demo' ? '#FCCB00' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.5)', letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:5}}>
            <span style={{width:6, height:6, borderRadius:'50%', background: apiStatus==='live' ? 'var(--bn-lime)' : apiStatus==='demo' ? '#FCCB00' : apiStatus==='error' ? '#ff8a80' : 'rgba(255,255,255,0.4)', display:'inline-block'}}/>
            {apiStatus === 'live' ? 'En línea' : apiStatus === 'demo' ? 'Modo demo' : apiStatus === 'error' ? 'Sin conexión' : 'Conectando…'}
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
          {msgs.length === 0 && !loading && (
            <div style={{padding:'24px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>Esta conversación está vacía. Pregúntame lo que quieras.</div>
          )}
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
            <button className="btn sm send" onClick={send} disabled={loading} style={{opacity: loading ? 0.7 : 1, display:'inline-flex', alignItems:'center', gap:6}}>
              {loading ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin .9s linear infinite'}}>
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Pensando…
                </>
              ) : 'Preguntar →'}
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
