/* ============================================================
   Solid · Analytics — DASHBOARD MANAGER (home)
   Buscador · carpetas · tags · favoritos · recientes · compartidos
   ============================================================ */
const { useState } = React;

/* Dashboards persistidos · cada user tiene los suyos en localStorage.
 * window.DashboardStore (definido en an-app.jsx) los gestiona. */
const FOLDERS = [
  { id:'all',     label:'Todos los dashboards', icon:'grid'   },
  { id:'mine',    label:'Míos',                 icon:'user'   },
  { id:'fav',     label:'Favoritos',            icon:'star'   },
];
const MGR_TAGS = [];        // El user añade sus propios tags al editar un dashboard

const mini = (p)=> p.split('').map(c=> c==='a'?'a':c==='b'?'b':c==='c'?'c':'');

function MiniPrev({ pat }){
  const cls = pat.split('');
  return (
    <div className="dc-mini">
      {cls.map((c,i)=><i key={i} className={c==='0'?'':c}/>)}
    </div>
  );
}
function fmtAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60000) return 'ahora';
  if (diff < 3600000) return Math.floor(diff/60000) + ' min';
  if (diff < 86400000) return 'hoy · ' + new Date(ts).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
  if (diff < 172800000) return 'ayer';
  if (diff < 604800000) return 'hace ' + Math.floor(diff/86400000) + ' días';
  return new Date(ts).toLocaleDateString('es-ES');
}
function widgetCount(d) {
  return (d.sections || []).reduce((sum, s) => sum + (s.widgets || []).length, 0);
}
function toggleStar(d) {
  if (window.DashboardStore) window.DashboardStore.update(d.id, { starred: !d.starred });
}
function DashCard({ d, onOpen }){
  return (
    <article className="dash-card" onClick={()=>onOpen(d)}>
      <div className="dc-prev">
        <MiniPrev pat={d.pat || 'abc0a0'}/>
        <button className={`dc-star ${d.starred?'on':''}`} onClick={e=>{ e.stopPropagation(); toggleStar(d); }}>
          <Ico name={d.starred?'star':'star-o'} size={13}/>
        </button>
      </div>
      <div className="dc-body">
        <div className="dc-name">{d.name}</div>
        <div className="dc-meta"><span>{widgetCount(d)} widgets</span><span className="sep">·</span><span>{fmtAgo(d.updated_at)}</span></div>
        {d.tags && d.tags.length > 0 && (
          <div className="dc-tags">{d.tags.map(t=><span key={t}>#{t}</span>)}</div>
        )}
      </div>
    </article>
  );
}
function DashRow({ d, onOpen }){
  return (
    <div className="dash-row" onClick={()=>onOpen(d)}>
      <div className="dr-name">
        <button className={`dr-star ${d.starred?'on':''}`} onClick={e=>{ e.stopPropagation(); toggleStar(d); }} style={{ border:'none', background:'transparent', cursor:'pointer', display:'flex' }}>
          <Ico name={d.starred?'star':'star-o'} size={14}/>
        </button>
        {d.name}
      </div>
      <div className="dr-m">{widgetCount(d)} widgets</div>
      <div className="dr-m">{(d.tags||[]).map(t=>'#'+t).join(' ') || '—'}</div>
      <div className="dr-m" style={{ textAlign:'right' }}>{fmtAgo(d.updated_at)}</div>
    </div>
  );
}

function ManagerView({ onOpen, onCreate, onDelete }){
  const [filter, setFilter] = useState('all');
  const [layout, setLayout] = useState('grid');
  const [query, setQuery] = useState('');
  const [, setTick] = useState(0);
  // Re-render cuando DashboardStore añade/elimina dashboards
  useEffect(() => {
    const r = () => setTick(t => t+1);
    window.addEventListener('analytics-dashboards-changed', r);
    return () => window.removeEventListener('analytics-dashboards-changed', r);
  }, []);

  const all = (window.DashboardStore && window.DashboardStore.list()) || [];
  const fav = all.filter(d=>d.starred);
  const recent = all.slice().sort((a,b)=> (b.updated_at||0) - (a.updated_at||0));

  let list = filter==='fav' ? fav : recent;
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(d => (d.name||'').toLowerCase().includes(q) || (d.tags||[]).some(t => t.toLowerCase().includes(q)));
  }

  const empty = all.length === 0;

  return (
    <div className="an-mgr" data-screen-label="Analytics · Dashboard Manager">
      <aside className="an-mgr-nav">
        <div>
          <div className="grp-t">Biblioteca</div>
          {FOLDERS.map(f=>(
            <button key={f.id} className={`mgr-link ${filter===f.id?'active':''}`} onClick={()=>setFilter(f.id)}>
              <Ico name={f.icon} size={15}/>{f.label}
              <span className="cnt">{f.id==='fav' ? fav.length : f.id==='all' ? all.length : all.length}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="an-mgr-main">
        <div className="an-top" style={{ padding:'0 0 22px', borderBottom:'1px solid var(--line)', marginBottom:24 }}>
          <div>
            <div className="crumb"><span className="dot" style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--accent)', marginRight:2 }}/>Analytics</div>
            <h1>Tus <em>dashboards</em></h1>
          </div>
          <div className="an-actions">
            <button className="an-btn dark" onClick={onCreate}><Ico name="plus" size={15}/> Crear dashboard</button>
          </div>
        </div>

        <div className="mgr-search-row">
          <label className="mgr-search">
            <Ico name="search" size={15}/>
            <input placeholder="Buscar dashboards…" value={query} onChange={e=>setQuery(e.target.value)}/>
          </label>
          <div className="mgr-seg">
            <button className={layout==='grid'?'active':''} onClick={()=>setLayout('grid')}><Ico name="grid" size={15}/></button>
            <button className={layout==='list'?'active':''} onClick={()=>setLayout('list')}><Ico name="menu" size={15}/></button>
          </div>
        </div>

        {empty ? (
          <div className="mgr-empty">
            <div className="me-icon">○</div>
            <h3>Sin dashboards todavía</h3>
            <p>Crea tu primer dashboard para empezar a montar métricas y widgets de tu workspace.</p>
            <button className="an-btn dark" onClick={onCreate}><Ico name="plus" size={15}/> Crear primer dashboard</button>
          </div>
        ) : (
          <>
            {filter==='all' && fav.length > 0 && (
              <>
                <div className="mgr-sec-head"><h2>Favoritos</h2><span className="n">{fav.length}</span></div>
                <div className="mgr-grid">
                  {fav.map(d=><DashCard key={d.id} d={d} onOpen={onOpen}/>)}
                </div>
                <div className="mgr-sec-head"><h2>Recientes</h2><span className="n">{recent.length}</span></div>
              </>
            )}
            {layout==='grid' ? (
              <div className="mgr-grid">
                {list.map(d=><DashCard key={d.id} d={d} onOpen={onOpen}/>)}
              </div>
            ) : (
              <div className="mgr-list">
                {list.map(d=><DashRow key={d.id} d={d} onOpen={onOpen}/>)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

Object.assign(window, { ManagerView });
