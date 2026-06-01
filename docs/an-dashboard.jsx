/* ============================================================
   Solid · Analytics — DASHBOARD abierto
   Secciones · grid 12-col · widget shell · quick actions · filtros
   ============================================================ */
const { useState } = React;

/* Widget-instance factory · llamada por an-builder.jsx al añadir */
let _wid = 0;
function mkW(libId, opts={}){
  const lib = WIDGET[libId] || {};
  const span = lib.span || 1;
  return {
    uid: 'w'+(++_wid)+'_'+Date.now(),
    wtype: libId,
    viz: opts.viz || lib.viz,
    label: lib.label,
    metric: opts.metric || 'pills_completed',
    dim: opts.dim || 'week',
    title: opts.title || lib.label,
    c: opts.c || (span===2?12:6),
    r: opts.r || 2,
    isLayout: lib.cat === 'layout',
    text: opts.text,
    filters: opts.filters || [],
  };
}

/* Default starter dashboard · cuando user clica "Crear dashboard" en
 * el manager, esto es la plantilla en blanco · solo 1 sección vacía.
 * Sin demo data Repsol-flavor. */
function blankDashboard(name) {
  return {
    id: 'dash_' + Date.now(),
    name: name || 'Dashboard sin nombre',
    locked: false,
    starred: false,
    tags: [],
    created_at: Date.now(),
    updated_at: Date.now(),
    pat: 'abc0a0',
    sections: [
      {
        id: 's' + Date.now(),
        name: 'Resumen',
        desc: 'Añade widgets para empezar',
        filters: [],
        widgets: [],
      },
    ],
  };
}

/* quick-actions menu */
function QuickActions({ onClose, onEdit, onFullscreen, onDelete }){
  return (
    <div className="qa-menu" onClick={e=>e.stopPropagation()}>
      <button className="qa-item" onClick={onEdit}><span className="ico"><Ico name="edit" size={15}/></span>Editar widget</button>
      <button className="qa-item" onClick={onEdit}><span className="ico"><Ico name="viz-bar" size={15}/></span>Cambiar visualización</button>
      <button className="qa-item" onClick={onClose}><span className="ico"><Ico name="filter" size={15}/></span>Filtros del widget</button>
      <button className="qa-item" onClick={onFullscreen}><span className="ico"><Ico name="expand" size={15}/></span>Pantalla completa</button>
      <div className="qa-sep"/>
      <button className="qa-item" onClick={onClose}><span className="ico"><Ico name="clone" size={15}/></span>Clonar</button>
      <button className="qa-item" onClick={onClose}><span className="ico"><Ico name="export" size={15}/></span>Exportar CSV</button>
      <div className="qa-sep"/>
      <button className="qa-item danger" onClick={onDelete}><span className="ico"><Ico name="trash" size={15}/></span>Eliminar</button>
    </div>
  );
}

/* widget shell */
function Widget({ w, onEdit, onFullscreen, onDelete }){
  const [menu, setMenu] = useState(false);
  const m = METRIC[w.metric], d = DIM[w.dim];
  const showSub = !w.isLayout && m;
  return (
    <article className={`widget ${w.isLayout?'is-layout':''}`} style={{ '--c':w.c, '--r':w.r }}>
      {!w.isLayout && (
        <div className="w-head">
          <div className="w-titles" style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
            <span className="w-grip"><Ico name="grip" size={14}/></span>
            <div style={{ minWidth:0 }}>
              <div className="w-title">{w.title}</div>
              {showSub && <div className="w-sub">{m.label}{d && <> <span style={{opacity:.5}}>·</span> <span className="x-dim">{d.label}</span></>}</div>}
            </div>
          </div>
          <div className="w-tools">
            <button className="w-tool" title="Editar" onClick={()=>onEdit(w)}><Ico name="edit" size={14}/></button>
            <button className="w-tool" title="Pantalla completa" onClick={()=>onFullscreen(w)}><Ico name="expand" size={14}/></button>
            <button className="w-tool" title="Más" onClick={()=>setMenu(v=>!v)}><Ico name="dots" size={14}/></button>
          </div>
          {menu && <>
            <div style={{ position:'fixed', inset:0, zIndex:39 }} onClick={()=>setMenu(false)}/>
            <QuickActions onClose={()=>setMenu(false)} onEdit={()=>{ setMenu(false); onEdit(w); }} onFullscreen={()=>{ setMenu(false); onFullscreen(w); }} onDelete={()=>{ setMenu(false); onDelete(w); }}/>
          </>}
        </div>
      )}
      <div className="w-body"><Viz w={w}/></div>
    </article>
  );
}

/* filter bar */
function FilterBar({ range, setRange, team, setTeam, role, setRole }){
  return (
    <div className="an-filterbar">
      <div className="fb-group">
        <span className="fb-label">Rango</span>
        <div className="fb-seg">
          {DATE_RANGES.map(r=>(
            <button key={r.id} className={range===r.id?'active':''} onClick={()=>setRange(r.id)}>{r.label}</button>
          ))}
        </div>
      </div>
      <Cycler label="Equipo" options={TEAM_FILTER} value={team} set={setTeam}/>
      <Cycler label="Rol" options={ROLE_FILTER} value={role} set={setRole}/>
      <div className="fb-spacer"/>
      <span className="fb-inherit"><Ico name="layers" size={13}/> Los filtros del dashboard se <b>heredan</b> a secciones y widgets</span>
    </div>
  );
}
function Cycler({ label, options, value, set }){
  const next = ()=>{ const i=options.indexOf(value); set(options[(i+1)%options.length]); };
  return (
    <button className="fb-drop" onClick={next}>
      <span className="k">{label}</span>{value}<Ico name="chev-down" size={12}/>
    </button>
  );
}

/* section */
function Section({ sec, editing, onEdit, onFullscreen, onDelete, onAdd }){
  const [open, setOpen] = useState(true);
  return (
    <section className={`an-section ${open?'':'collapsed'}`} data-screen-label={`Sección · ${sec.name}`}>
      <div className="sec-head">
        <span className="sec-grip"><Ico name="grip" size={15}/></span>
        <button className="sec-toggle" onClick={()=>setOpen(v=>!v)}><Ico name={open?'chev-down':'chev-right'} size={16}/></button>
        <h2>{sec.name}</h2>
        {sec.desc && <span className="sec-desc">{sec.desc}</span>}
        {sec.filters.length>0 && (
          <div className="sec-filters">
            {sec.filters.map((f,i)=>(
              <span className="sec-chip" key={i}><Ico name="filter" size={10}/>{f.k}: {f.v} <span className="x"><Ico name="close" size={10}/></span></span>
            ))}
          </div>
        )}
        <div className="sec-acts">
          <button className="sec-icon-btn" title="Añadir widget" onClick={()=>onAdd(sec.id)}><Ico name="plus" size={15}/></button>
          <button className="sec-icon-btn" title="Filtros de sección"><Ico name="filter" size={15}/></button>
          <button className="sec-icon-btn" title="Más"><Ico name="dots" size={15}/></button>
        </div>
      </div>
      <div className="an-grid">
        {sec.widgets.map(w=>(
          <Widget key={w.uid} w={w} onEdit={onEdit} onFullscreen={onFullscreen} onDelete={onDelete}/>
        ))}
        {editing && (
          <button className="widget add-tile" onClick={()=>onAdd(sec.id)}>
            <Ico name="plus" size={22}/><span className="at-t">Añadir widget</span>
          </button>
        )}
      </div>
    </section>
  );
}

/* dashboard view */
function DashboardView({ dash, editing, onBack, onEdit, onAddWidget, onFullscreen, onDelete, onOpenLibrary }){
  const [range, setRange] = useState('30d');
  const [team, setTeam] = useState('Todos');
  const [role, setRole] = useState('Todos');
  const [locked, setLocked] = useState(dash.locked);
  return (
    <div className="an-dash" data-screen-label={`Dashboard · ${dash.name}`}>
      <div className="an-top">
        <div>
          <div className="crumb">
            <span style={{cursor:'pointer'}} onClick={onBack}>Analytics</span>
            <Ico name="chev-right" size={11}/>
            <b>{dash.name}</b>
          </div>
          <h1>{dash.name}</h1>
          <div className="crumb" style={{marginTop:10, textTransform:'none', letterSpacing:0}}>
            {(dash.sections||[]).reduce((s,sec)=>s+(sec.widgets||[]).length,0)} widgets · actualizado {dash.updated_at ? new Date(dash.updated_at).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}
          </div>
        </div>
        <div className="an-actions">
          <button className="an-btn icon" title="Compartir"><Ico name="share" size={16}/></button>
          <button className="an-btn icon" title="Clonar"><Ico name="clone" size={16}/></button>
          <button className="an-btn icon" title={locked?'Desbloquear':'Bloquear'} onClick={()=>setLocked(v=>!v)}><Ico name={locked?'lock':'unlock'} size={16}/></button>
          <button className="an-btn" onClick={()=>onAddWidget(dash.sections[0].id)}><Ico name="plus" size={15}/> Añadir widget</button>
          <button className="an-btn dark" onClick={()=>onOpenLibrary()}><Ico name="library" size={15}/> Librería</button>
        </div>
      </div>
      <FilterBar range={range} setRange={setRange} team={team} setTeam={setTeam} role={role} setRole={setRole}/>
      <div className="an-dash-scroll">
        {dash.sections.map(sec=>(
          <Section key={sec.id} sec={sec} editing={editing} onEdit={onEdit} onFullscreen={onFullscreen} onDelete={onDelete} onAdd={onAddWidget}/>
        ))}
        <div style={{ padding:'28px 0', textAlign:'center' }}>
          <button className="an-btn" onClick={()=>onAddWidget(dash.sections[0].id)}><Ico name="layers" size={15}/> Añadir sección</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView, Widget, DASH, mkW });
