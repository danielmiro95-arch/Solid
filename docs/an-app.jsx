/* ============================================================
   Solid · Analytics — APP shell + DashboardStore + router
   Sustituye a la Dashboard() legacy de prototype-views.jsx.
   Mount: AnalyticsView (sgson-views.jsx) renderiza <AnalyticsApp/>.
   ============================================================ */
const { useState, useEffect } = React;

const clone = o => JSON.parse(JSON.stringify(o));

/* ── DashboardStore · persistencia localStorage per-user ──── */
(function(){
  function _key() {
    try {
      const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
      const uid = u ? (u.id || u.email || 'anon') : 'guest';
      return 'solid-an-dashboards:' + uid;
    } catch(e) { return 'solid-an-dashboards:guest'; }
  }
  function _read() {
    try { return JSON.parse(localStorage.getItem(_key()) || '[]'); }
    catch(e) { return []; }
  }
  function _write(arr) {
    try { localStorage.setItem(_key(), JSON.stringify(arr)); } catch(e) {}
    window.dispatchEvent(new Event('analytics-dashboards-changed'));
  }
  const list   = () => _read();
  const get    = (id) => _read().find(d => d.id === id) || null;
  const create = (dash) => {
    const all = _read();
    all.unshift(dash);
    _write(all);
    return dash;
  };
  const update = (id, patch) => {
    const all = _read();
    const idx = all.findIndex(d => d.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch, updated_at: Date.now() };
      _write(all);
      return all[idx];
    }
    return null;
  };
  const remove = (id) => {
    const all = _read().filter(d => d.id !== id);
    _write(all);
  };
  window.addEventListener('auth-changed', () => window.dispatchEvent(new Event('analytics-dashboards-changed')));
  window.DashboardStore = { list, get, create, update, remove };
})();

/* ── Fullscreen widget overlay ───────────────────────────── */
function FullscreenWidget({ w, onClose }){
  return (
    <div className="an-overlay" onClick={onClose}>
      <div className="bld" style={{ height:'min(620px,86vh)' }} onClick={e=>e.stopPropagation()}>
        <div className="bld-head">
          <Ico name="chart" size={20}/>
          <div><h2>{w.title}</h2><div className="bld-sub">{METRIC[w.metric]?.label} · {DIM[w.dim]?.label}</div></div>
          <div className="bld-acts">
            <button className="an-btn icon" onClick={onClose}><Ico name="close" size={16}/></button>
          </div>
        </div>
        <div style={{ flex:1, padding:32, background:'var(--paper-2)', display:'flex' }}>
          <article className="widget" style={{ flex:1, boxShadow:'0 14px 40px rgba(0,0,0,.08)' }}>
            <div className="w-body"><Viz w={w}/></div>
          </article>
        </div>
      </div>
    </div>
  );
}

/* ── Analytics app · entry point ─────────────────────────── */
function AnalyticsApp(){
  const [view, setView] = useState('manager');     // 'manager' | 'dashboard'
  const [dashId, setDashId] = useState(null);
  const [dash, setDash] = useState(null);
  const [libOpen, setLibOpen] = useState(false);
  const [builder, setBuilder] = useState(null);
  const [full, setFull] = useState(null);
  const [target, setTarget] = useState(null);
  const [editing, setEditing] = useState(false);

  // Refresh real analytics data al montar + cuando cambian filtros
  useEffect(() => {
    if (window.Analytics && window.Analytics.refresh) window.Analytics.refresh();
    const r = () => { /* re-render para que charts releean del caché */ setTick(t => t + 1); };
    window.addEventListener('analytics-data-changed', r);
    return () => window.removeEventListener('analytics-data-changed', r);
  }, []);
  const [, setTick] = useState(0);

  const openDash = (d) => {
    setDashId(d.id);
    setDash(clone(d));
    setView('dashboard');
  };
  const back = () => {
    if (dash && dashId) window.DashboardStore.update(dashId, dash);
    setView('manager');
    setDashId(null);
    setDash(null);
  };
  const createNew = () => {
    const name = prompt('Nombre del nuevo dashboard:', 'Mi dashboard');
    if (!name) return;
    const blank = blankDashboard(name);
    window.DashboardStore.create(blank);
    openDash(blank);
  };

  const addWidget = (secId) => { setTarget(secId); setLibOpen(true); };
  const pickFromLib = (libId) => { setLibOpen(false); setBuilder(libId); };
  const editWidget = (w) => { setBuilder(w.wtype); };

  const persistDash = (next) => {
    setDash(next);
    if (dashId) window.DashboardStore.update(dashId, next);
  };
  const saveWidget = (w) => {
    if (!dash) { setBuilder(null); return; }
    const next = clone(dash);
    const sec = next.sections.find(s => s.id === target) || next.sections[0];
    sec.widgets.push({ ...w, uid: 'w' + Date.now() });
    persistDash(next);
    setBuilder(null);
  };
  const deleteWidget = (w) => {
    if (!dash) return;
    const next = clone(dash);
    next.sections.forEach(s => { s.widgets = s.widgets.filter(x => x.uid !== w.uid); });
    persistDash(next);
  };

  return (
    <div className={'an-shell ' + (editing ? 'editing' : '')}>
      <div className="an-stage">
        {view === 'manager'
          ? <ManagerView onOpen={openDash} onCreate={createNew}/>
          : <DashboardView dash={dash} editing={editing}
              onBack={back}
              onEdit={editWidget}
              onAddWidget={addWidget}
              onFullscreen={setFull}
              onDelete={deleteWidget}
              onOpenLibrary={() => { if (dash) { setTarget(dash.sections[0].id); setLibOpen(true); } }}/>
        }
      </div>
      {libOpen && <LibraryModal onClose={() => setLibOpen(false)} onPick={pickFromLib}/>}
      {builder && <BuilderModal initial={builder} onClose={() => setBuilder(null)} onSave={saveWidget}/>}
      {full && <FullscreenWidget w={full} onClose={() => setFull(null)}/>}
    </div>
  );
}

window.AnalyticsApp = AnalyticsApp;
