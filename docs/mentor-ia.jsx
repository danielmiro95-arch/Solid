// mentor-ia.jsx — MENTOR-IA standalone
// Llama a la serverless function /api/chat en Vercel (api/chat.js).

const { useState: useM, useEffect: useEM } = React;

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

// ── AISidekick (panel lateral) ──────────────────────────────────────────────
function AISidekick({ setAIMode, aiMode, view }) {
  const [input, setInput] = useM('');
  const [loading, setLoading] = useM(false);
  const [msgs, setMsgs] = useM([]);

  const contextLabel = {
    home: 'Vista general · tu progreso',
    player: 'Viendo módulo · Programar posts',
    detail: 'Detalle de módulo',
    path: 'Tu ruta de certificación',
    dashboard: 'Analytics · visión admin',
    coach: 'MENTOR-IA · modo completo',
  }[view] || 'Plataforma Sprinklr';

  const QUICK = [
    { label: '¿Qué módulo sigue?', q: '¿Cuál es el siguiente módulo que debería hacer?' },
    { label: 'Hazme un quiz', q: 'Hazme 3 preguntas de repaso sobre lo que he visto.' },
    { label: 'Flujo de aprobación', q: '¿Cómo funciona el flujo de aprobación urgente en Social Publish?' },
    { label: 'Ayuda con macros', q: '¿Qué es una macro en Sprinklr y cómo se usa?' },
  ];

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
          <span className="orb"/>
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
      <div className="ai-body">
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
            ¡Hola Amaia! Llevas un <span className="hl">58% de tu certificación</span>. El siguiente módulo es <em>Programar posts</em>. ¿Seguimos?
          </div>
        </div>
        <div className="ai-chip-row">
          {QUICK.map((q, i) => (
            <button key={i} className="ai-chip" onClick={() => send(q.q)}>{q.label}</button>
          ))}
        </div>
        {msgs.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
            <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
            <div className="bubble" style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
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
    { role: 'assistant', text: '¡Hola Amaia! Soy MENTOR-IA, tu asistente de formación Sprinklr. Llevas un 15% de tu certificación — estás en el Bloque 2, sobre estructura y gobernanza. ¿En qué te puedo ayudar hoy?' },
  ]);

  const quickActions = [
    { label: '¿Qué módulo sigue?', q: '¿Cuál es el siguiente módulo que debería hacer?' },
    { label: 'Explícame las macros', q: '¿Qué es una macro en Sprinklr y cómo se usa en Repsol?' },
    { label: 'Flujo de aprobación', q: '¿Cómo funciona el flujo de aprobación en Social Publish?' },
    { label: 'SLA en Care', q: '¿Qué SLA maneja Repsol en Sprinklr Care?' },
    { label: 'Escalar a Salesforce', q: '¿Cuándo y cómo transfiero un caso de Sprinklr a Salesforce?' },
    { label: 'Quiz rápido', q: 'Hazme 3 preguntas de repaso sobre lo que he visto hasta ahora.' },
  ];

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
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:8, padding:'14px 20px', background:'linear-gradient(135deg, var(--bn-blue) 0%, #004d8a 100%)', borderRadius:14, color:'#fff'}}>
          <div style={{width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, backdropFilter:'blur(4px)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></svg>
          </div>
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
            <button key={i} className="ai-chip" onClick={() => send(a.q)} style={{fontSize:11}}>{a.label}</button>
          ))}
        </div>
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14, padding:'4px 0 16px'}}>
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role === 'assistant' ? 'from-ai' : 'from-me'}`}>
              <span className="who">{m.role === 'assistant' ? 'MENTOR-IA' : 'Tú'}</span>
              <div className="bubble" style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
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
Object.assign(window, { AISidekick, Coach });
console.log('[MENTOR-IA v2] componentes cargados y registrados en window');
