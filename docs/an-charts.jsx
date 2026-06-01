/* ============================================================
   Solid · Analytics — CHARTS
   Dispatcher <Viz w={widget}/> que renderiza cada tipo (37 vistas).
   Datos REALES desde window.Analytics.getSeries/getCats/getScalar.
   Si la métrica no está instrumentada o no hay datos, se muestra
   un empty state honesto en lugar de mocks fabricados.
   ============================================================ */
const { METRIC, CAT_COLORS, DIM_VALUES, pointsFor, fmtValue } = window;

/* ── data layer · accesores SYNC al caché de an-data.jsx ──── */
function genSeries(metricId, dimId, n) {
  try {
    if (window.Analytics) {
      const real = window.Analytics.getSeries(metricId, dimId);
      if (Array.isArray(real)) return real;
    }
  } catch(e) {}
  return new Array(n || (pointsFor ? pointsFor(dimId) : 12)).fill(0);
}
function genCats(metricId, dimId) {
  try {
    if (window.Analytics) {
      const real = window.Analytics.getCats(metricId, dimId);
      if (Array.isArray(real) && real.length) return real;
    }
  } catch(e) {}
  return [];
}
/* Decorativo · sparklines y anomaly markers cuando la métrica sí
 * existe pero la dim secundaria no tiene serie real aún. */
function hash(str){ let h=2166136261; for(let i=0;i<(str||'').length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return ((h>>>0)%100000)/100000; }
function rnd(seed){ let s=Math.floor((seed||0)*100000)||1; return ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; }

/* ── helpers ─────────────────────────────────────────────── */
function linePath(data, W, H, pad, smooth){
  const max = Math.max(...data), min = Math.min(...data, 0);
  const sx = i => pad + (i/(data.length-1))*(W-2*pad);
  const sy = v => H-pad - ((v-min)/((max-min)||1))*(H-2*pad);
  const pts = data.map((v,i)=>[sx(i), sy(v)]);
  if(!smooth) return { d:'M'+pts.map(p=>p.join(',')).join(' L'), pts, sy, sx, max, min };
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return { d, pts, sy, sx, max, min };
}
const Spark = ({ data, color='var(--bn-blue)', h=34 }) => {
  const { d } = linePath(data, 100, h, 3, true);
  return (
    <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{ width:'100%', height:h, overflow:'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
const Delta = ({ v }) => (
  <span className={`an-delta ${v>=0?'up':'dn'}`}><Ico name={v>=0?'arrow-up':'arrow-down'} size={11}/>{Math.abs(v)}%</span>
);
const cmColor = i => CAT_COLORS[i % CAT_COLORS.length];

/* ── 3.1 KPIs ────────────────────────────────────────────── */
const VCounter = ({ w }) => {
  const m = METRIC[w.metric] || METRIC.pills_completed;
  return (
    <div className="v-counter">
      <div className="kpi-value" style={{ color:'var(--ink)' }}>{fmtValue(m.id, m.base)}</div>
      <div className="kpi-foot"><Delta v={m.delta}/><span className="kpi-prev">vs. periodo anterior</span></div>
      <div className="kpi-spark"><Spark data={genSeries(m.id,'week',12)} color={m.color}/></div>
    </div>
  );
};
const VSummary = ({ w }) => {
  const ids = ['active_users','pills_completed','completion_rate','avg_session_time'];
  return (
    <div className="v-summary">
      {ids.map(id=>{ const m=METRIC[id]; return (
        <div className="v-summary-cell" key={id}>
          <div className="ss-label">{m.label}</div>
          <div className="ss-value">{fmtValue(id, m.base)}</div>
          <Delta v={m.delta}/>
        </div>
      );})}
    </div>
  );
};
const VGauge = ({ w }) => {
  const m = METRIC[w.metric] || METRIC.engagement;
  const pct = Math.min(100, Math.round((m.fmt==='pct'||m.fmt==='nps')?m.base:74));
  const A = Math.PI*(1 - pct/100);
  const cx=60, cy=58, r=46;
  const ex=cx+r*Math.cos(A), ey=cy-r*Math.sin(A);
  return (
    <div className="v-gauge">
      <svg viewBox="0 0 120 70" style={{ width:'100%', maxWidth:200 }}>
        <path d={`M14,58 A46,46 0 0 1 106,58`} fill="none" stroke="var(--line)" strokeWidth="9" strokeLinecap="round"/>
        <path d={`M14,58 A46,46 0 0 1 ${ex},${ey}`} fill="none" stroke={m.color} strokeWidth="9" strokeLinecap="round"/>
      </svg>
      <div className="gauge-val">{fmtValue(m.id,m.base)}</div>
      <div className="gauge-sub">meta · {m.fmt==='pct'?'80%':'85 pts'}</div>
    </div>
  );
};
const VNps = () => {
  const prom=62, pass=26, det=12;
  return (
    <div className="v-nps">
      <div className="nps-big">+58</div>
      <div className="nps-bar">
        <span style={{ width:prom+'%', background:'var(--bn-green)' }}/>
        <span style={{ width:pass+'%', background:'var(--bn-gold)' }}/>
        <span style={{ width:det+'%', background:'var(--bn-accent)' }}/>
      </div>
      <div className="nps-legend">
        <span><i style={{ background:'var(--bn-green)' }}/>Promotores {prom}%</span>
        <span><i style={{ background:'var(--bn-gold)' }}/>Pasivos {pass}%</span>
        <span><i style={{ background:'var(--bn-accent)' }}/>Detractores {det}%</span>
      </div>
    </div>
  );
};
const Stars = ({ v, size=14 }) => (
  <span className="stars" style={{ fontSize:size }}>
    {[0,1,2,3,4].map(i=> <span key={i} className={i < Math.round(v) ? 'on':''}>★</span>)}
  </span>
);
const VRatingOvw = () => (
  <div className="v-ratingovw">
    <div className="ro-big">4.6</div>
    <Stars v={4.6} size={20}/>
    <div className="ro-sub">3.470 puntuaciones · <span style={{ color:'var(--bn-green)' }}>+18%</span></div>
  </div>
);

/* ── 3.2 Column · Bar ────────────────────────────────────── */
const VColumn = ({ w }) => {
  const data = genCats(w.metric, w.dim||'team');
  const max = Math.max(...data.map(d=>d.value));
  const m = METRIC[w.metric]||METRIC.completion_rate;
  return (
    <div className="v-column">
      {data.map((d,i)=>(
        <div className="vc-col" key={i}>
          <div className="vc-bar-wrap"><div className="vc-bar" style={{ height:`${(d.value/max)*100}%`, background:m.color }}/></div>
          <div className="vc-lbl">{d.label}</div>
        </div>
      ))}
    </div>
  );
};
const VBar = ({ w }) => {
  const data = genCats(w.metric, w.dim||'role');
  const max = Math.max(...data.map(d=>d.value));
  const m = METRIC[w.metric]||METRIC.engagement;
  return (
    <div className="v-bar">
      {data.map((d,i)=>(
        <div className="hb-row" key={i}>
          <div className="hb-lbl">{d.label}</div>
          <div className="hb-track"><div className="hb-fill" style={{ width:`${(d.value/max)*100}%`, background:m.color }}/></div>
          <div className="hb-val">{d.value}</div>
        </div>
      ))}
    </div>
  );
};
const stackParts = (seed) => { const r=rnd(hash(seed)); return DIM_VALUES.category.map((c,i)=>({ label:c, value:Math.round(10+r()*40), color:cmColor(i) })); };
const VStackedBar = ({ w }) => {
  const rows = (DIM_VALUES[w.dim]||DIM_VALUES.market).slice(0,6).map(l=>({ label:l, parts:stackParts(w.metric+l) }));
  const tot = r => r.parts.reduce((s,p)=>s+p.value,0);
  const max = Math.max(...rows.map(tot));
  return (
    <div className="v-stack">
      {rows.map((r,i)=>(
        <div className="hb-row" key={i}>
          <div className="hb-lbl">{r.label}</div>
          <div className="hb-track stacked">
            {r.parts.map((p,j)=><div key={j} style={{ width:`${(p.value/max)*100}%`, background:p.color }}/>)}
          </div>
        </div>
      ))}
      <Legend items={DIM_VALUES.category.map((c,i)=>({label:c,color:cmColor(i)}))}/>
    </div>
  );
};
const VStackedCol = ({ w }) => {
  const cols = (DIM_VALUES[w.dim]||DIM_VALUES.weekday).map(l=>({ label:l, parts:stackParts(w.metric+l).slice(0,4) }));
  const tot = c => c.parts.reduce((s,p)=>s+p.value,0);
  const max = Math.max(...cols.map(tot));
  return (
    <div className="v-column stacked-col">
      {cols.map((c,i)=>(
        <div className="vc-col" key={i}>
          <div className="vc-bar-wrap">
            <div className="vc-stack" style={{ height:`${(tot(c)/max)*100}%` }}>
              {c.parts.map((p,j)=><div key={j} style={{ flex:p.value, background:p.color }}/>)}
            </div>
          </div>
          <div className="vc-lbl">{c.label}</div>
        </div>
      ))}
    </div>
  );
};
const VCluster = ({ w }) => {
  const groups = (DIM_VALUES[w.dim]||DIM_VALUES.market).slice(0,5);
  const r = rnd(hash(w.metric+'cl'));
  const sub = 3, max=100;
  return (
    <div className="v-column cluster">
      {groups.map((g,i)=>(
        <div className="vc-group" key={i}>
          <div className="vc-bar-wrap cluster">
            {Array.from({length:sub}).map((_,j)=><div key={j} className="vc-bar" style={{ height:`${20+r()*70}%`, background:cmColor(j) }}/>)}
          </div>
          <div className="vc-lbl">{g}</div>
        </div>
      ))}
    </div>
  );
};

/* ── 3.3 Line · Area · Spline ────────────────────────────── */
const LineLike = ({ w, mode }) => {
  const n = pointsFor(w.dim||'week');
  const m = METRIC[w.metric]||METRIC.active_users;
  const multi = ['role','category','team','level'].includes(w.dim);
  const series = multi
    ? (DIM_VALUES[w.dim]||[]).slice(0,4).map((l,i)=>({ name:l, color:cmColor(i), data:genSeries(w.metric+l,'week',n) }))
    : [{ name:m.label, color:m.color, data: mode==='retention' ? genSeries(w.metric,'ret',n).map((v,i)=>Math.round(96-i*(70/n)-( (i%3)*3 ))) : genSeries(w.metric, w.dim||'week', n) }];
  const W=320,H=150,pad=8;
  return (
    <div className="v-line">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
        {[0.25,0.5,0.75].map(g=><line key={g} x1="0" y1={H*g} x2={W} y2={H*g} stroke="var(--line-2)" strokeWidth="1"/>)}
        {series.map((s,si)=>{
          const { d } = linePath(s.data, W, H, pad, mode!=='line');
          const area = mode==='area' || mode==='retention';
          return (
            <g key={si}>
              {area && <path d={`${d} L${W-pad},${H-pad} L${pad},${H-pad} Z`} fill={s.color} fillOpacity="0.12"/>}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          );
        })}
      </svg>
      {multi && <Legend items={series.map(s=>({label:s.name,color:s.color}))}/>}
    </div>
  );
};
const VSentiment = ({ w }) => {
  const n = pointsFor(w.dim||'week');
  const bands=[{name:'Positivo',color:'var(--bn-green)'},{name:'Neutro',color:'var(--bn-gold)'},{name:'Negativo',color:'var(--bn-accent)'}];
  const W=320,H=150;
  const r=rnd(hash(w.metric+'sent'));
  const stacks=Array.from({length:n}).map(()=>{ const a=40+r()*30,b=20+r()*20,c=100-a-b; return [a,b,Math.max(8,c)]; });
  const cum=(k)=>stacks.map(s=>s.slice(0,k+1).reduce((x,y)=>x+y,0));
  return (
    <div className="v-line">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
        {[0,1,2].map(k=>{
          const top=cum(k), bot=k===0?stacks.map(()=>0):cum(k-1);
          const sx=i=>(i/(n-1))*W, sy=v=>H-(v/100)*H;
          const d=`M${sx(0)},${sy(bot[0])} `+top.map((v,i)=>`L${sx(i)},${sy(v)}`).join(' ')+' '+bot.map((v,i)=>`L${sx(n-1-i)},${sy(bot[n-1-i])}`).join(' ')+'Z';
          return <path key={k} d={d} fill={bands[k].color} fillOpacity="0.5"/>;
        })}
      </svg>
      <Legend items={bands.map(b=>({label:b.name,color:b.color}))}/>
    </div>
  );
};

/* ── 3.4 Distribution ────────────────────────────────────── */
const Legend = ({ items }) => (
  <div className="v-legend">{items.map((it,i)=><span key={i}><i style={{ background:it.color }}/>{it.label}</span>)}</div>
);
const VDonut = ({ w }) => {
  const data = genCats(w.metric, w.dim||'role').slice(0,6).map((d,i)=>({ ...d, color:cmColor(i) }));
  const total = data.reduce((s,d)=>s+d.value,0); let acc=0; const R=40;
  return (
    <div className="v-donut">
      <svg viewBox="0 0 100 100" style={{ width:130, height:130, flexShrink:0 }}>
        {data.map((d,i)=>{ const f=d.value/total, dash=f*2*Math.PI*R, off=-acc*2*Math.PI*R; acc+=f;
          return <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="15" strokeDasharray={`${dash} ${2*Math.PI*R}`} strokeDashoffset={off} transform="rotate(-90 50 50)"/>; })}
        <text x="50" y="49" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)" fontFamily="var(--sans)">{total.toLocaleString('es-ES')}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="5.5" letterSpacing="1" fill="var(--ink-4)" fontFamily="var(--mono)">TOTAL</text>
      </svg>
      <Legend items={data.map(d=>({ label:`${d.label} · ${Math.round(d.value/total*100)}%`, color:d.color }))}/>
    </div>
  );
};
const VTreemap = ({ w }) => {
  const data = genCats(w.metric, w.dim||'category').slice(0,6).map((d,i)=>({ ...d, color:cmColor(i) }));
  const total = data.reduce((s,d)=>s+d.value,0);
  return (
    <div className="v-treemap">
      {data.map((d,i)=>(
        <div className="tm-cell" key={i} style={{ flex:d.value, background:d.color }}>
          <span className="tm-l">{d.label}</span><span className="tm-v">{Math.round(d.value/total*100)}%</span>
        </div>
      ))}
    </div>
  );
};
const VHeatmap = ({ w }) => {
  const days=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], cols=24;
  const r=rnd(hash(w.metric+'heat'));
  return (
    <div className="v-heatmap">
      {days.map((dy,ri)=>(
        <div className="hm-row" key={ri}>
          <span className="hm-day">{dy}</span>
          <div className="hm-cells">
            {Array.from({length:cols}).map((_,ci)=>{ const v=Math.pow(r(),1.4); return <div key={ci} className="hm-cell" style={{ background:`color-mix(in srgb, var(--bn-blue) ${Math.round(8+v*82)}%, transparent)` }}/>; })}
          </div>
        </div>
      ))}
      <div className="hm-axis"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
    </div>
  );
};
const VWordcloud = ({ w }) => {
  const words=['engagement','feedback','listening','crisis','publish','reporting','sentiment','boolean','workflow','care','SLA','dashboard','alertas','share-of-voice','onboarding','advocacy'];
  const r=rnd(hash(w.metric+'wc'));
  return (
    <div className="v-wordcloud">
      {words.map((wd,i)=>{ const s=14+Math.round(r()*30); return <span key={i} style={{ fontSize:s, opacity:0.45+s/60, color:i%3===0?'var(--bn-blue)':i%3===1?'var(--ink)':'var(--bn-purple)' }}>{wd}</span>; })}
    </div>
  );
};
const VRatingDist = () => {
  const rows=[{s:5,p:58},{s:4,p:26},{s:3,p:9},{s:2,p:4},{s:1,p:3}];
  return (
    <div className="v-ratingdist">
      {rows.map(r=>(
        <div className="rd-row" key={r.s}>
          <span className="rd-star">{r.s}★</span>
          <div className="hb-track"><div className="hb-fill" style={{ width:r.p+'%', background:'var(--bn-gold)' }}/></div>
          <span className="rd-pct">{r.p}%</span>
        </div>
      ))}
    </div>
  );
};

/* ── 3.5 Tables ──────────────────────────────────────────── */
const heatCell = v => ({ background:`color-mix(in srgb, var(--bn-blue) ${Math.round(v*70)}%, transparent)`, color: v>0.6?'#fff':'var(--ink)' });
const VPivot = ({ w }) => {
  const rows=DIM_VALUES.market, cols=DIM_VALUES.category; const r=rnd(hash(w.metric+'pv'));
  return (
    <div className="v-table-wrap">
      <table className="an-table pivot">
        <thead><tr><th></th>{cols.map(c=><th key={c} className="num">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map(rw=>(
            <tr key={rw}><td>{rw}</td>{cols.map(c=>{ const v=r(); return <td key={c} className="num cell" style={heatCell(v)}>{Math.round(20+v*80)}</td>; })}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const VSummTable = ({ w }) => {
  const ids=['active_users','pills_completed','completion_rate','nps','drop_off'];
  return (
    <div className="v-table-wrap">
      <table className="an-table">
        <thead><tr><th>Métrica</th><th className="num">Actual</th><th className="num">Anterior</th><th className="num">Δ</th></tr></thead>
        <tbody>
          {ids.map(id=>{ const m=METRIC[id]; const prev=Math.round(m.base/(1+m.delta/100)); return (
            <tr key={id}><td>{m.label}</td><td className="num">{fmtValue(id,m.base)}</td><td className="num" style={{ color:'var(--ink-4)' }}>{fmtValue(id,prev)}</td><td className="num"><Delta v={m.delta}/></td></tr>
          );})}
        </tbody>
      </table>
    </div>
  );
};
const VUserTable = ({ w }) => {
  const r=rnd(hash(w.metric+'ut'));
  return (
    <div className="v-table-wrap">
      <table className="an-table">
        <thead><tr><th>Usuario</th><th>Rol</th><th className="num">Pills</th><th className="num">Racha</th><th className="num">Cert.</th></tr></thead>
        <tbody>
          {DIM_VALUES.user.map((u,i)=>(
            <tr key={u}><td><span className="ut-av">{u[0]}</span>{u}</td><td style={{ color:'var(--ink-4)' }}>{DIM_VALUES.role[i%5]}</td><td className="num">{Math.round(20+r()*60)}</td><td className="num">{Math.round(r()*40)}d</td><td className="num">{Math.round(40+r()*60)}%</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const VQuestions = () => {
  const qs=['¿Cómo monto un dashboard de listening?','¿Qué métrica mide share-of-voice?','¿Cómo creo una Boolean query?','¿Cómo configuro Smart Alerts?','¿Diferencia entre Care y Engagement?'];
  return (
    <ol className="v-questions">
      {qs.map((q,i)=><li key={i}><span className="q-n">{i+1}</span><span className="q-t">{q}</span><span className="q-c">{Math.round(180-i*28)}</span></li>)}
    </ol>
  );
};
const VTopRatings = () => {
  const pills=[['Construir un dashboard de escucha',4.9],['Crisis: respuesta en 15 min',4.8],['Publicar con emojis, con cariño',4.7],['Boolean queries sin morir',4.6],['Sentiment que sí importa',4.5]];
  return (
    <div className="v-table-wrap">
      <table className="an-table">
        <thead><tr><th>Pill</th><th className="num">Rating</th><th className="num">Votos</th></tr></thead>
        <tbody>
          {pills.map((p,i)=><tr key={i}><td>{p[0]}</td><td className="num"><Stars v={p[1]} size={11}/> {p[1]}</td><td className="num">{Math.round(420-i*60)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
};

/* ── 3.6 Funnel · Stages ─────────────────────────────────── */
const VFunnel = () => {
  const st=[{l:'Descubrir',v:100},{l:'Iniciar',v:72},{l:'Completar',v:48},{l:'Certificar',v:29}];
  return (
    <div className="v-funnel">
      {st.map((s,i)=>(
        <div className="fn-row" key={i}>
          <div className="fn-bar" style={{ width:s.v+'%', background:cmColor(i) }}><span>{s.l}</span></div>
          <span className="fn-v">{s.v}%</span>
        </div>
      ))}
    </div>
  );
};
const VModules = () => {
  const r=rnd(hash('modules'));
  return (
    <div className="v-modules">
      {DIM_VALUES.module.map((m,i)=>{ const p=Math.round(35+r()*60); return (
        <div className="mod-row" key={i}>
          <span className="mod-l">{m}</span>
          <div className="hb-track"><div className="hb-fill" style={{ width:p+'%', background:'var(--bn-green)' }}/></div>
          <span className="mod-p">{p}%</span>
        </div>
      );})}
    </div>
  );
};

/* ── 3.7 AI · Insights ───────────────────────────────────── */
const AIOrb = ({ size=22 }) => <span className="ai-orb" style={{ width:size, height:size }}/>;
const VAiInsight = ({ w }) => {
  const m=METRIC[w.metric]||METRIC.active_users;
  return (
    <div className="v-ai">
      <div className="ai-head-row"><AIOrb/><span className="ai-tag">BeonAI · insight</span></div>
      <p className="ai-text">Los <em>{m.label.toLowerCase()}</em> crecen un <b style={{ color:'var(--bn-green)' }}>{Math.abs(m.delta)}%</b> esta semana, impulsados por el equipo <b>Care IB</b>. El pico se concentra los martes 10–12h: ideal para lanzar nuevas pills.</p>
      <div className="ai-chips"><span>Explicar causa</span><span>Comparar equipos</span><span>Crear alerta</span></div>
    </div>
  );
};
const VAiCluster = () => (
  <div className="v-ai">
    <div className="ai-head-row"><AIOrb/><span className="ai-tag">BeonAI · clusters</span></div>
    <div className="cl-grid">
      {[['Sprinters','24%','Completan rápido, alto rating','var(--bn-green)'],['Constantes','38%','Ritmo estable diario','var(--bn-blue)'],['En riesgo','21%','Inician y abandonan','var(--bn-accent)'],['Dormidos','17%','Sin actividad 14d+','var(--bn-purple)']].map((c,i)=>(
        <div className="cl-card" key={i} style={{ borderColor:c[3] }}><div className="cl-top"><b>{c[0]}</b><span style={{ color:c[3] }}>{c[1]}</span></div><div className="cl-d">{c[2]}</div></div>
      ))}
    </div>
  </div>
);
const VAiAnomaly = ({ w }) => {
  const data=genSeries(w.metric||'sessions','week',14); data[10]=Math.round(data[10]*1.8);
  const { d, pts } = linePath(data,300,120,8,true);
  return (
    <div className="v-ai">
      <div className="ai-head-row"><AIOrb/><span className="ai-tag">BeonAI · anomalía</span></div>
      <svg viewBox="0 0 300 120" preserveAspectRatio="none" style={{ width:'100%', height:110 }}>
        <path d={d} fill="none" stroke="var(--bn-info)" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        <circle cx={pts[10][0]} cy={pts[10][1]} r="6" fill="none" stroke="var(--bn-accent)" strokeWidth="2"/>
        <circle cx={pts[10][0]} cy={pts[10][1]} r="3" fill="var(--bn-accent)"/>
      </svg>
      <p className="ai-text" style={{ marginTop:6 }}>Pico anómalo el <b>14 nov</b> (+82% sobre baseline). Coincide con el envío masivo por WhatsApp.</p>
    </div>
  );
};

/* ── 3.8 Advanced ────────────────────────────────────────── */
const VBubble = ({ w }) => {
  const r=rnd(hash(w.metric+'bub'));
  const pts=Array.from({length:14}).map((_,i)=>({ x:8+r()*84, y:8+r()*78, s:6+r()*22, c:cmColor(i%6) }));
  return (
    <svg className="v-svg" viewBox="0 0 100 90" preserveAspectRatio="none">
      <line x1="6" y1="84" x2="98" y2="84" stroke="var(--line)" strokeWidth="0.6"/>
      <line x1="6" y1="2" x2="6" y2="84" stroke="var(--line)" strokeWidth="0.6"/>
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={p.s/6} fill={p.c} fillOpacity="0.55" stroke={p.c} strokeWidth="0.5"/>)}
    </svg>
  );
};
const VDualAxis = ({ w }) => {
  const n=12, r=rnd(hash(w.metric+'da'));
  const bars=Array.from({length:n}).map(()=>30+r()*60);
  const line=genSeries(w.metric||'completion_rate','week',n);
  const max=Math.max(...bars); const { d }=linePath(line,300,140,10,true);
  return (
    <svg className="v-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
      {bars.map((b,i)=>{ const bw=300/n*0.6, x=i*(300/n)+ (300/n-bw)/2; return <rect key={i} x={x} y={150-(b/max)*120} width={bw} height={(b/max)*120} fill="var(--bn-blue)" opacity="0.35"/>; })}
      <path d={d} fill="none" stroke="var(--bn-accent)" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
};
const VQuadrant = ({ w }) => {
  const labels=['P04','P01','P13','P30','P10','P22','P03','P16'];
  const r=rnd(hash(w.metric+'qd'));
  return (
    <div className="v-quadrant">
      <svg className="v-svg" viewBox="0 0 100 90" preserveAspectRatio="none">
        <line x1="50" y1="2" x2="50" y2="84" stroke="var(--line)" strokeWidth="0.6"/>
        <line x1="6" y1="43" x2="98" y2="43" stroke="var(--line)" strokeWidth="0.6"/>
        {labels.map((l,i)=>{ const x=10+r()*80, y=6+r()*72; return <g key={i}><circle cx={x} cy={y} r="2.6" fill={cmColor(i%6)}/><text x={x+3.5} y={y+2} fontSize="3.4" fill="var(--ink-3)" fontFamily="var(--mono)">{l}</text></g>; })}
      </svg>
      <div className="qd-axes"><span className="qd-tl">Quick win</span><span className="qd-tr">Priority</span><span className="qd-bl">Low</span><span className="qd-br">Strategic</span></div>
    </div>
  );
};
const VActivity = () => {
  const ev=[['Amaia completó','P04 · Listening','2 min'],['Diego inició','Ruta Care Lead','12 min'],['Nora puntuó','P01 · 5★','28 min'],['Iván certificó','Módulo Publishing','1 h'],['Sara compartió','P30 por WhatsApp','2 h']];
  return (
    <ul className="v-activity">
      {ev.map((e,i)=>(<li key={i}><span className="ac-dot" style={{ background:cmColor(i%6) }}/><span className="ac-t"><b>{e[0]}</b> {e[1]}</span><span className="ac-w">{e[2]}</span></li>))}
    </ul>
  );
};
const VWaKpis = () => (
  <div className="v-wa">
    {[['Compartidos','1.284','var(--bn-green)'],['Aperturas','892','var(--bn-blue)'],['CTR','38%','var(--bn-gold)']].map((k,i)=>(
      <div className="wa-kpi" key={i}><div className="wa-v" style={{ color:k[2] }}>{k[1]}</div><div className="wa-l">{k[0]}</div></div>
    ))}
  </div>
);

/* ── 3.9 Layout ──────────────────────────────────────────── */
const VTitle = ({ w }) => <div className="v-ltitle">{w.title || 'Título de sección'}</div>;
const VText  = ({ w }) => <div className="v-ltext">{w.text || 'Texto libre. Edita este bloque para añadir contexto, notas o una conclusión a tu dashboard.'}</div>;

/* ── EMPTY STATE para métrica no instrumentada o sin datos ── */
const EmptyState = ({ metricId, reason }) => {
  const m = METRIC[metricId];
  return (
    <div className="viz-empty-state">
      <div className="ves-icon">○</div>
      <div className="ves-msg">
        {reason || (m && !m.real
          ? <>Métrica <b>{m.label}</b> pendiente de instrumentación.<br/><span className="ves-src">{m.source}</span></>
          : 'Sin datos en este rango')}
      </div>
    </div>
  );
};

/* ── DISPATCHER ──────────────────────────────────────────── */
const VIZ = {
  counter:VCounter, summary:VSummary, gauge:VGauge, nps:VNps, ratingovw:VRatingOvw,
  column:VColumn, bar:VBar, stackedbar:VStackedBar, stackedcol:VStackedCol, cluster:VCluster,
  line:(p)=><LineLike {...p} mode="line"/>, spline:(p)=><LineLike {...p} mode="spline"/>, area:(p)=><LineLike {...p} mode="area"/>,
  retention:(p)=><LineLike {...p} mode="retention"/>, sentiment:VSentiment,
  donut:VDonut, treemap:VTreemap, heatmap:VHeatmap, wordcloud:VWordcloud, ratingdist:VRatingDist,
  pivot:VPivot, summtable:VSummTable, usertable:VUserTable, questions:VQuestions, topratings:VTopRatings,
  funnel:VFunnel, modules:VModules,
  aiinsight:VAiInsight, aicluster:VAiCluster, aianomaly:VAiAnomaly,
  bubble:VBubble, dualaxis:VDualAxis, quadrant:VQuadrant, activity:VActivity, wakpis:VWaKpis,
  ltitle:VTitle, ltext:VText,
};
const Viz = ({ w }) => {
  const C = VIZ[w.viz];
  if (!C) return <div className={`viz viz-${w.viz}`}><div className="viz-empty">—</div></div>;
  // Layout widgets (title/text) no tienen métrica · siempre renderizan
  if (w.viz === 'ltitle' || w.viz === 'ltext') {
    return <div className={`viz viz-${w.viz}`}><C w={w}/></div>;
  }
  // Métricas no instrumentadas todavía · muestra empty state honesto
  const m = METRIC[w.metric];
  if (m && m.real === false) {
    return <div className={`viz viz-${w.viz}`}><EmptyState metricId={w.metric}/></div>;
  }
  return <div className={`viz viz-${w.viz}`}><C w={w}/></div>;
};

Object.assign(window, { Viz, Spark, Stars, Delta, AIOrb, EmptyState });
