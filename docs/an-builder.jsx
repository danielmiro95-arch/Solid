/* ============================================================
   Solid · Analytics — WIDGET LIBRARY + WIDGET BUILDER
   ============================================================ */
const { useState } = React;

/* ── Library modal ───────────────────────────────────────── */
function LibraryModal({ onClose, onPick }){
  const [cat, setCat] = useState('kpi');
  const items = WIDGET_LIBRARY.filter(w=>w.cat===cat);
  return (
    <div className="an-overlay" onClick={onClose}>
      <div className="lib" onClick={e=>e.stopPropagation()} data-screen-label="Librería de widgets">
        <div className="lib-head">
          <Ico name="library" size={20}/>
          <h2>Añadir widget</h2>
          <button className="an-btn icon lib-x" onClick={onClose}><Ico name="close" size={16}/></button>
        </div>
        <div className="lib-body">
          <aside className="lib-cats">
            {WIDGET_CATEGORIES.map(c=>(
              <button key={c.id} className={`lib-cat ${cat===c.id?'active':''}`} onClick={()=>setCat(c.id)}>
                <span className="ico"><Ico name={c.icon} size={17}/></span>{c.label}
              </button>
            ))}
          </aside>
          <div className="lib-grid">
            {items.map(w=>(
              <button className="lib-tile" key={w.id} onClick={()=>onPick(w.id)}>
                <span className="lt-ico"><Ico name={WIDGET_CATEGORIES.find(c=>c.id===w.cat).icon} size={20}/></span>
                <span className="lt-name">{w.label}</span>
                <span className="lt-desc">{w.desc}</span>
                <span className="lt-span">{w.span===2?'fila completa':'media fila'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── viz picker options ──────────────────────────────────── */
const VIZ_PICK = [
  { viz:'counter', icon:'viz-kpi',    label:'Counter' },
  { viz:'line',    icon:'viz-line',   label:'Line' },
  { viz:'area',    icon:'viz-area',   label:'Area' },
  { viz:'spline',  icon:'viz-line',   label:'Spline' },
  { viz:'column',  icon:'viz-bar',    label:'Column' },
  { viz:'bar',     icon:'viz-hbar',   label:'Bar' },
  { viz:'donut',   icon:'viz-donut',  label:'Donut' },
  { viz:'heatmap', icon:'viz-heat',   label:'Heatmap' },
  { viz:'funnel',  icon:'viz-funnel', label:'Funnel' },
  { viz:'gauge',   icon:'viz-kpi',    label:'Gauge' },
  { viz:'pivot',   icon:'viz-table',  label:'Pivot' },
  { viz:'bubble',  icon:'viz-bubble', label:'Bubble' },
];

/* ── Builder overlay ─────────────────────────────────────── */
function BuilderModal({ initial, onClose, onSave }){
  const lib = WIDGET[initial] || WIDGET.counter;
  const [st, setSt] = useState({
    wtype: lib.id, viz: lib.viz, metric:'active_users', dim:'week',
    title: lib.label, desc: lib.desc,
  });
  const [adv, setAdv] = useState(false);
  const set = (k,v)=> setSt(s=>({ ...s, [k]:v }));

  // preview widget
  const pw = mkW(st.wtype, { metric:st.metric, dim:st.dim, title:st.title, c:12, r:2 });
  pw.viz = st.viz;

  return (
    <div className="an-overlay" onClick={onClose}>
      <div className="bld" onClick={e=>e.stopPropagation()} data-screen-label="Widget Builder">
        <div className="bld-head">
          <AIOrb size={26}/>
          <div>
            <h2>Editor de widget</h2>
            <div className="bld-sub">{lib.label} · {WIDGET_CATEGORIES.find(c=>c.id===lib.cat)?.label}</div>
          </div>
          <div className="bld-acts">
            <button className="an-btn" onClick={onClose}>Cancelar</button>
            <button className="an-btn dark" onClick={()=>onSave(pw)}><Ico name="check" size={15}/> Guardar widget</button>
          </div>
        </div>
        <div className="bld-body">
          <div className="bld-config">
            <div className="bf-group">
              <span className="bf-label">Nombre</span>
              <input className="bf-input" value={st.title} onChange={e=>set('title', e.target.value)}/>
            </div>
            <div className="bf-group">
              <span className="bf-label">Descripción</span>
              <textarea className="bf-input" value={st.desc} onChange={e=>set('desc', e.target.value)} rows={2}/>
            </div>
            <div className="bf-group">
              <span className="bf-label">Fuente de datos</span>
              <select className="bf-select" defaultValue="solid">
                <option value="solid">Solid · learning warehouse</option>
                <option value="wa">WhatsApp · envíos</option>
                <option value="beonai">BeonAI · conversaciones</option>
              </select>
            </div>
            <div className="bf-group">
              <span className="bf-label">Visualización</span>
              <div className="bf-viz">
                {VIZ_PICK.map(v=>(
                  <button key={v.viz} className={st.viz===v.viz?'active':''} title={v.label} onClick={()=>set('viz', v.viz)}>
                    <Ico name={v.icon} size={18}/>
                  </button>
                ))}
              </div>
            </div>
            <div className="bf-row">
              <div className="bf-group">
                <span className="bf-label">Métrica</span>
                <select className="bf-select" value={st.metric} onChange={e=>set('metric', e.target.value)}>
                  {METRICS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div className="bf-group">
                <span className="bf-label">Dimensión</span>
                <select className="bf-select" value={st.dim} onChange={e=>set('dim', e.target.value)}>
                  {DIMENSIONS.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="bf-group">
              <span className="bf-label">Filtros</span>
              <div className="bf-filter"><span className="k">Mercado</span> España <span className="x"><Ico name="close" size={13}/></span></div>
              <div className="bf-filter"><span className="k">Nivel</span> Intermedio <span className="x"><Ico name="close" size={13}/></span></div>
              <button className="bf-add"><Ico name="plus" size={13}/> Añadir filtro</button>
            </div>
            <div className="bf-group">
              <span className="bf-label">Orden</span>
              <select className="bf-select" defaultValue="desc">
                <option value="desc">Valor · descendente</option>
                <option value="asc">Valor · ascendente</option>
                <option value="alpha">Alfabético</option>
              </select>
            </div>
            <div className="bf-group">
              <div className="bf-adv-head" onClick={()=>setAdv(v=>!v)}>
                <Ico name={adv?'chev-down':'chev-right'} size={13}/> Avanzado
              </div>
              {adv && (
                <div style={{ display:'flex', flexDirection:'column', gap:9, marginTop:4 }}>
                  <div className="bf-row">
                    <div className="bf-group"><span className="bf-label">Límite</span><input className="bf-input" defaultValue="10"/></div>
                    <div className="bf-group"><span className="bf-label">Comparar</span><select className="bf-select"><option>Periodo anterior</option><option>Mismo periodo año -1</option><option>Sin comparación</option></select></div>
                  </div>
                  <label className="bf-filter" style={{ cursor:'pointer' }}><input type="checkbox" defaultChecked/> Mostrar leyenda</label>
                  <label className="bf-filter" style={{ cursor:'pointer' }}><input type="checkbox"/> Acumulado</label>
                </div>
              )}
            </div>
          </div>

          <div className="bld-preview">
            <div className="bld-preview-label">Vista previa en vivo</div>
            <div className="bld-canvas">
              <article className="widget" style={{ '--c':12, '--r':2 }}>
                <div className="w-head">
                  <div className="w-titles">
                    <div className="w-title">{st.title}</div>
                    <div className="w-sub">{METRIC[st.metric]?.label} <span style={{opacity:.5}}>·</span> <span className="x-dim">{DIM[st.dim]?.label}</span></div>
                  </div>
                  <div className="w-tools" style={{ opacity:1 }}><button className="w-tool"><Ico name="dots" size={14}/></button></div>
                </div>
                <div className="w-body"><Viz w={pw}/></div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryModal, BuilderModal, VIZ_PICK });
