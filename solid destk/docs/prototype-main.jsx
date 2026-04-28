// prototype-main.jsx — orchestrator

const { useState: useSM, useEffect: useEM } = React;

// ── WhatsApp Link Tracker ──────────────────────────────────────────────────
const WATracker = (function() {
  const KEY = 'solid-wa-links';

  function getLinks() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function save(links) { localStorage.setItem(KEY, JSON.stringify(links)); }

  function seedIfEmpty() {
    if (getLinks().length > 0) return;
    const now = Date.now();
    const d = 86400000;
    save([
      { token:'wt_demo1', pillId:'p20', pillTitle:'Cómo son los flujos de aprobación dentro de la operativa de publicación', sharedAt: now-7*d, opens:15, watchSeconds:210, sharedBy:'Sara Molina' },
      { token:'wt_demo2', pillId:'p0',  pillTitle:'Importancia de este programa',                                           sharedAt: now-3*d, opens:12, watchSeconds:145, sharedBy:'Amaia Ruiz' },
      { token:'wt_demo3', pillId:'p41', pillTitle:'Qué es una macro',                                                       sharedAt: now-1*d, opens:8,  watchSeconds:98,  sharedBy:'Carlos Vega' },
      { token:'wt_demo4', pillId:'p3',  pillTitle:'Qué canales hay dentro de Sprinklr',                                    sharedAt: now-2*3600000, opens:3, watchSeconds:45, sharedBy:'Amaia Ruiz' },
    ]);
  }

  function shareLink(pillId, pillTitle, duration) {
    const token = 'wt_' + Math.random().toString(36).substr(2,6) + '_' + Date.now().toString(36);
    const base = window.location.href.split('?')[0].split('#')[0];
    const url = base + '?pill=' + pillId + '&wtrack=' + token;
    const links = getLinks();
    links.unshift({ token, pillId, pillTitle, duration: duration || '3 min', url, sharedAt: Date.now(), opens: 0, watchSeconds: 0, sharedBy: 'Amaia Ruiz' });
    save(links);
    const msg = '📚 *SGS|on · Formación Sprinklr*\nTe comparto este módulo: *' + pillTitle + '*\nDuración: ' + (duration||'3–5 min') + ' ⚡\n\nVer ahora → ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    if (window.Toast) window.Toast.success('Enlace de WhatsApp generado', { icon: '💬' });
    return token;
  }

  function trackOpen(token) {
    const links = getLinks();
    const l = links.find(x => x.token === token);
    if (l) { l.opens = (l.opens||0) + 1; l.lastOpenAt = Date.now(); save(links); }
  }

  function addWatchTime(token, seconds) {
    const links = getLinks();
    const l = links.find(x => x.token === token);
    if (l) { l.watchSeconds = (l.watchSeconds||0) + seconds; save(links); }
  }

  function getStats() {
    const links = getLinks();
    const totalShared = links.length;
    const totalOpens = links.reduce((s,l) => s+(l.opens||0), 0);
    const totalWatch = links.reduce((s,l) => s+(l.watchSeconds||0), 0);
    const ctr = totalShared > 0 ? (totalOpens / totalShared).toFixed(1) : '0';
    const avgWatch = totalOpens > 0 ? Math.round(totalWatch / totalOpens) : 0;
    return { totalShared, totalOpens, totalWatch, ctr, avgWatch, links };
  }

  return { getLinks, shareLink, trackOpen, addWatchTime, getStats, seedIfEmpty };
})();
window.WATracker = WATracker;

// ── Auth · gestor de sesión multi-usuario con rol admin ────────────────────
// Modelo "demo auth": guarda usuarios en localStorage, sesión local. Sin backend
// ni passwords reales — pensado para enseñar el flujo SaaS multi-usuario hoy
// y poderlo sustituir por Supabase / Auth0 / Azure AD en una sola capa.
const Auth = (function() {
  const USERS_KEY = 'sgson-users';
  const SESSION_KEY = 'sgson-session';
  const COLORS = ['var(--repsol-red)', 'var(--bn-blue)', 'var(--bn-lime)', 'var(--bn-orange)', 'var(--bn-purple)', 'var(--bn-turquoise)', 'var(--ink)'];

  function _load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (e) { return fallback; }
  }

  function listUsers() { return _load(USERS_KEY, []); }
  function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('auth-users-changed'));
  }

  function _genId() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function currentUserId() { return localStorage.getItem(SESSION_KEY); }
  function currentUser() {
    const id = currentUserId();
    if (!id) return null;
    return listUsers().find(function(u){ return u.id === id; }) || null;
  }
  function isAuthenticated() { return !!currentUser(); }
  function isAdmin() { var u = currentUser(); return !!(u && u.isAdmin); }

  function signup(data) {
    var users = listUsers();
    if (!data.email || !data.email.includes('@')) throw new Error('Email no válido');
    if (!data.name || data.name.trim().length < 2) throw new Error('Nombre demasiado corto');
    var existing = users.find(function(u){ return u.email === data.email.toLowerCase(); });
    if (existing) throw new Error('Ya existe un usuario con ese email');
    var user = {
      id: _genId(),
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      role: data.role || 'Publish Agent',
      team: data.team || 'Repsol',
      avatarColor: data.avatarColor || COLORS[users.length % COLORS.length],
      // El primer usuario registrado es admin por defecto.
      // Si el email contiene 'admin' o termina en @beonit, también es admin.
      isAdmin: !!data.isAdmin || users.length === 0 || /admin/i.test(data.email) || /@beonit\./i.test(data.email),
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    users.push(user);
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    window.dispatchEvent(new Event('auth-changed'));
    return user;
  }

  function login(email) {
    var users = listUsers();
    var user = users.find(function(u){ return u.email === (email || '').toLowerCase(); });
    if (!user) throw new Error('No existe un usuario con ese email');
    user.lastLoginAt = Date.now();
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    window.dispatchEvent(new Event('auth-changed'));
    return user;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('auth-changed'));
  }

  function updateUser(id, patch) {
    var users = listUsers();
    var idx = users.findIndex(function(u){ return u.id === id; });
    if (idx < 0) return null;
    users[idx] = Object.assign({}, users[idx], patch);
    _saveUsers(users);
    if (users[idx].id === currentUserId()) {
      window.dispatchEvent(new Event('auth-changed'));
    }
    return users[idx];
  }

  function deleteUser(id) {
    var users = listUsers().filter(function(u){ return u.id !== id; });
    _saveUsers(users);
    // Borrar también su storage namespaced
    Object.keys(localStorage).forEach(function(k){
      if (k.endsWith(':' + id)) localStorage.removeItem(k);
    });
    if (currentUserId() === id) logout();
  }

  function setAdmin(id, value) { return updateUser(id, { isAdmin: !!value }); }

  // Seed: si no hay usuarios, crea un admin demo para arrancar la primera vez
  function seedIfEmpty() {
    if (listUsers().length === 0) {
      signup({
        email: 'admin@beonit.com',
        name: 'Admin BeonIt',
        role: 'Administrador',
        team: 'BeonIt',
        avatarColor: 'var(--ink)',
        isAdmin: true,
      });
      // Loguea como demo Repsol también
      var current = currentUserId();
      signup({
        email: 'amaia.ruiz@repsol.com',
        name: 'Amaia Ruiz',
        role: 'Publish Agent',
        team: 'Repsol',
        avatarColor: 'var(--bn-purple)',
      });
      // Vuelve a la sesión que tenía
      if (current) localStorage.setItem(SESSION_KEY, current);
    }
  }

  return {
    listUsers, currentUser, currentUserId, isAuthenticated, isAdmin,
    signup, login, logout, updateUser, deleteUser, setAdmin, seedIfEmpty,
    USERS_KEY, SESSION_KEY,
  };
})();
window.Auth = Auth;

// ── InviteUsersModal · UI de invitación bulk ────────────────────────────────
function InviteUsersModal({ onClose }) {
  const [tab, setTab] = useSM('single'); // 'single' | 'bulk'
  const [email, setEmail] = useSM('');
  const [name, setName] = useSM('');
  const [role, setRole] = useSM('Publish Agent');
  const [team, setTeam] = useSM('Repsol');
  const [csv, setCsv] = useSM('');
  const [result, setResult] = useSM(null);
  const [error, setError] = useSM('');

  const submitSingle = (e) => {
    e && e.preventDefault();
    setError('');
    try {
      const inv = Invitations.create({ email, name, role, team });
      if (inv.duplicate) {
        setError('Ya existe un usuario o invitación pendiente con ese email.');
      } else {
        setResult({ created: [inv], skipped: [], errors: [] });
        if (window.Toast) window.Toast.success('Invitación creada · ' + inv.email, { icon: '✉' });
        setEmail(''); setName('');
      }
    } catch (err) { setError(err.message); }
  };
  const submitBulk = () => {
    setError('');
    if (!csv.trim()) { setError('Pega los emails primero.'); return; }
    const r = Invitations.bulkCreate(csv);
    setResult(r);
    if (window.Toast) {
      if (r.created.length > 0) window.Toast.success(r.created.length + ' invitaciones creadas', { icon: '✉' });
      if (r.errors.length > 0) window.Toast.error(r.errors.length + ' errores en el CSV');
    }
  };

  const copyInvite = (token) => {
    const url = Invitations.inviteUrl(token);
    navigator.clipboard.writeText(url).then(() => {
      if (window.Toast) window.Toast.success('Link copiado al portapapeles', { icon: '📋' });
    }).catch(() => {});
  };

  const csvSample = 'email,name,role,team\nana.lopez@repsol.com,Ana López,Publish Agent,Repsol\njuan.perez@repsol.com,Juan Pérez,Care Agent,Repsol\nlaura.gomez@repsol.com,Laura Gómez,Content Lead,Repsol';

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(640px, 96vw)', maxHeight:'92vh', overflowY:'auto', padding:28, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16}}>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-blue)', fontWeight:700, marginBottom:4}}>ADMIN · INVITAR USUARIOS</div>
            <h2 style={{margin:0, fontSize:22, fontFamily:'var(--sans)', letterSpacing:'-0.01em'}}>Añadir gente a la plataforma</h2>
            <p style={{fontSize:13, color:'var(--ink-3)', marginTop:8, marginBottom:0, lineHeight:1.5}}>
              Crea cuentas de antemano y comparte el link de invitación con cada persona. Cuando lo abran, harán signup con un click sin crear password.
            </p>
          </div>
          <button onClick={onClose} style={{flexShrink:0, width:32, height:32, borderRadius:8, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{display:'flex', gap:4, marginBottom:18, padding:4, background:'var(--paper-2)', borderRadius:10, width:'fit-content'}}>
          {[{id:'single', label:'Una a una'}, {id:'bulk', label:'Bulk (CSV)'}].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(''); }}
              style={{padding:'7px 14px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600,
                background: tab === t.id ? 'var(--paper)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none'}}>{t.label}</button>
          ))}
        </div>

        {tab === 'single' && (
          <form onSubmit={submitSingle}>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Email *</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ana.lopez@repsol.com" autoFocus
                style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
            </label>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Nombre</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ana López" style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
            </label>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14}}>
              <label>
                <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Rol</div>
                <select value={role} onChange={e => setRole(e.target.value)} style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, background:'var(--paper)', boxSizing:'border-box'}}>
                  {['Publish Agent','Content Lead','Analytics Lead','Care Agent','IT / Integraciones','Dirección','Administrador'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>
                <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Equipo</div>
                <input value={team} onChange={e => setTeam(e.target.value)} style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
              </label>
            </div>
            {error && <div style={{padding:'9px 12px', background:'rgba(235,0,41,0.08)', border:'1px solid rgba(235,0,41,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5, marginBottom:12}}>{error}</div>}
            <button type="submit" className="btn glow" style={{width:'100%', justifyContent:'center'}}>Crear invitación →</button>
          </form>
        )}

        {tab === 'bulk' && (
          <div>
            <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>CSV · una línea por usuario</div>
            <div style={{fontSize:12, color:'var(--ink-3)', marginBottom:8}}>Formato: <code style={{fontFamily:'var(--mono)', fontSize:11, background:'var(--paper-2)', padding:'1px 5px', borderRadius:3}}>email,name,role,team</code> · primera línea cabecera opcional · separador coma o punto y coma</div>
            <textarea value={csv} onChange={e => setCsv(e.target.value)} rows="10" placeholder={csvSample} spellCheck={false}
              style={{width:'100%', padding:'12px 14px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--mono)', fontSize:12, outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.5}}/>
            <div style={{display:'flex', gap:8, marginTop:10, alignItems:'center'}}>
              <button type="button" onClick={() => setCsv(csvSample)} style={{padding:'6px 12px', border:'1px solid var(--line)', borderRadius:8, background:'var(--paper-2)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-3)'}}>Pegar ejemplo</button>
              <button type="button" onClick={submitBulk} className="btn glow" style={{marginLeft:'auto'}}>Importar CSV →</button>
            </div>
            {error && <div style={{marginTop:12, padding:'9px 12px', background:'rgba(235,0,41,0.08)', border:'1px solid rgba(235,0,41,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5}}>{error}</div>}
          </div>
        )}

        {result && (
          <div style={{marginTop:18, padding:'14px 16px', background:'var(--paper-2)', borderRadius:10, border:'1px solid var(--line)'}}>
            <div style={{display:'flex', gap:18, marginBottom:12, fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase'}}>
              {result.created.length > 0 && <span style={{color:'var(--bn-lime-dark)', fontWeight:700}}>✓ {result.created.length} creadas</span>}
              {result.skipped.length > 0 && <span style={{color:'var(--bn-orange)'}}>↷ {result.skipped.length} duplicadas</span>}
              {result.errors.length > 0 && <span style={{color:'var(--repsol-red)'}}>✗ {result.errors.length} errores</span>}
            </div>
            {result.created.length > 0 && (
              <div style={{display:'flex', flexDirection:'column', gap:6, maxHeight:240, overflowY:'auto'}}>
                {result.created.map(inv => (
                  <div key={inv.token} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'var(--paper)', borderRadius:7, border:'1px solid var(--line)'}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12.5, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{inv.email}</div>
                      <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{inv.role} · {inv.team}</div>
                    </div>
                    <button onClick={() => copyInvite(inv.token)} title="Copiar link de invitación"
                      style={{padding:'5px 10px', border:'1px solid var(--bn-blue)', borderRadius:6, background:'rgba(0,114,190,0.06)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-blue-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                      Copiar link →
                    </button>
                  </div>
                ))}
              </div>
            )}
            {result.errors.length > 0 && (
              <div style={{marginTop:10, fontSize:11.5, color:'var(--repsol-red)', fontFamily:'var(--mono)'}}>
                {result.errors.map((e, i) => <div key={i}>L{i+1}: {e.error} → "{e.line}"</div>)}
              </div>
            )}
            {window.SGSON_BACKEND !== 'supabase' && (
              <div style={{marginTop:12, padding:'8px 10px', background:'rgba(243,165,37,0.1)', border:'1px solid rgba(243,165,37,0.3)', borderRadius:6, fontSize:11.5, color:'#7a4400', lineHeight:1.5}}>
                ⚠ <strong>Modo demo</strong>: los emails NO se envían realmente. Copia los links y compártelos manualmente. Activa Supabase + Resend para envío automático.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
window.InviteUsersModal = InviteUsersModal;

// ── SupabaseAuth · adapter Phase 2 ────────────────────────────────────────── · invitaciones masivas a la cohorte (CSV bulk + tokens) ────
// Modelo: el admin importa una lista de emails, cada uno se convierte en una
// pre-cuenta con status='invited' + token único. El usuario abre /?invite=<tok>
// y completa registro con un click. Funciona en demo mode (localStorage) y
// queda preparado para mandar emails reales (Resend/Postmark) cuando se active
// Supabase + función serverless con service_role en commit G.
const Invitations = (function() {
  const KEY = 'sgson-invitations'; // global a la plataforma (admin las gestiona)

  function _load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; } }
  function _save(invs) { localStorage.setItem(KEY, JSON.stringify(invs)); window.dispatchEvent(new Event('invitations-changed')); }

  function _genToken() { return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function list() { return _load(); }
  function getByToken(token) { return _load().find(i => i.token === token); }
  function getByEmail(email) { return _load().find(i => i.email === (email || '').toLowerCase()); }

  // Crea una invitación · idempotente sobre email
  function create(data) {
    if (!data.email || !data.email.includes('@')) throw new Error('Email inválido: ' + data.email);
    const email = data.email.toLowerCase().trim();

    // Si el email ya tiene cuenta activa, no se invita
    if (window.Auth && window.Auth.listUsers().find(u => u.email === email)) {
      return { duplicate: true, email };
    }
    // Si ya tiene invitación pendiente, devolver la existente
    const existing = getByEmail(email);
    if (existing && existing.status === 'pending') return existing;

    const inv = {
      token: _genToken(),
      email,
      name: (data.name || '').trim() || email.split('@')[0],
      role: data.role || 'Publish Agent',
      team: data.team || 'Repsol',
      status: 'pending', // 'pending' | 'accepted' | 'expired'
      createdAt: Date.now(),
      acceptedAt: null,
      sentBy: window.Auth && window.Auth.currentUser() ? window.Auth.currentUser().email : null,
    };
    const all = _load();
    all.unshift(inv);
    _save(all);
    return inv;
  }

  // Procesa CSV: una línea por usuario · `email[,name][,role][,team]`
  function bulkCreate(csvText) {
    const results = { created: [], skipped: [], errors: [] };
    const lines = csvText.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      // Soporta cabecera "email,name,role,team" — la salta
      if (idx === 0 && /^email/i.test(line)) return;
      const parts = line.split(/[;,\t]/).map(p => p.trim());
      const data = { email: parts[0], name: parts[1], role: parts[2], team: parts[3] };
      try {
        const inv = create(data);
        if (inv.duplicate) results.skipped.push({ email: inv.email, reason: 'ya tiene cuenta o invitación' });
        else results.created.push(inv);
      } catch (err) {
        results.errors.push({ line, error: err.message });
      }
    });
    return results;
  }

  function inviteUrl(token) {
    const base = window.location.href.split('?')[0].split('#')[0];
    return base + '?invite=' + token;
  }

  function markAccepted(token) {
    const all = _load();
    const idx = all.findIndex(i => i.token === token);
    if (idx < 0) return null;
    all[idx].status = 'accepted';
    all[idx].acceptedAt = Date.now();
    _save(all);
    return all[idx];
  }

  function remove(token) { _save(_load().filter(i => i.token !== token)); }

  function resend(token) {
    const inv = getByToken(token);
    if (!inv) return null;
    // En demo mode no se envía email real, sólo mostramos el link.
    // En Supabase mode → llamará a /api/send-invite (commit G)
    if (window.SGSON_BACKEND === 'supabase') {
      // TODO commit G: fetch('/api/send-invite', {body: JSON.stringify({email: inv.email, token})})
    }
    return inv;
  }

  return { list, getByToken, getByEmail, create, bulkCreate, inviteUrl, markAccepted, remove, resend };
})();
window.Invitations = Invitations;

// ── SupabaseAuth adapter Phase 2 ────────────────────────────────────────────
function _activateSupabaseAuth() {
  if (!window.supabaseClient) return;
  const sb = window.supabaseClient;

  let cachedProfile = null;
  let usersCache = [];

  async function _loadProfile(userId) {
    if (!userId) return null;
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) { console.warn('[supa] loadProfile', error.message); return null; }
    if (!data) return null;
    return _mapProfileRow(data);
  }

  function _mapProfileRow(row) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role || 'Publish Agent',
      team: row.team || 'Repsol',
      avatarColor: row.avatar_color || 'var(--bn-blue)',
      isAdmin: !!row.is_admin,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).getTime() : Date.now(),
    };
  }

  async function _loadAllUsers() {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: true });
    if (error) { console.warn('[supa] loadAllUsers', error.message); return []; }
    usersCache = (data || []).map(_mapProfileRow);
    return usersCache;
  }

  // Sobreescribir métodos de Auth
  Auth.listUsers = function() { return usersCache; };
  Auth.currentUser = function() { return cachedProfile; };
  Auth.currentUserId = function() { return cachedProfile ? cachedProfile.id : null; };
  Auth.isAuthenticated = function() { return !!cachedProfile; };
  Auth.isAdmin = function() { return !!(cachedProfile && cachedProfile.isAdmin); };

  Auth.signup = async function(data) {
    if (!data.password || data.password.length < 6) throw new Error('Password de al menos 6 caracteres');
    const { data: authData, error } = await sb.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role || 'Publish Agent',
          team: data.team || 'Repsol',
          avatar_color: data.avatarColor || 'var(--bn-blue)',
        },
      },
    });
    if (error) throw new Error(error.message);
    // El trigger handle_new_user crea el profile automáticamente
    if (authData.user) {
      cachedProfile = await _loadProfile(authData.user.id);
      await _loadAllUsers();
      window.dispatchEvent(new Event('auth-changed'));
      window.dispatchEvent(new Event('auth-users-changed'));
    }
    return cachedProfile;
  };

  Auth.login = async function(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    cachedProfile = await _loadProfile(data.user.id);
    await sb.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id);
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-changed'));
    return cachedProfile;
  };

  Auth.logout = async function() {
    await sb.auth.signOut();
    cachedProfile = null;
    window.dispatchEvent(new Event('auth-changed'));
  };

  Auth.updateUser = async function(id, patch) {
    const dbPatch = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.role !== undefined) dbPatch.role = patch.role;
    if (patch.team !== undefined) dbPatch.team = patch.team;
    if (patch.avatarColor !== undefined) dbPatch.avatar_color = patch.avatarColor;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.isAdmin !== undefined) dbPatch.is_admin = !!patch.isAdmin;
    const { data, error } = await sb.from('profiles').update(dbPatch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    const mapped = _mapProfileRow(data);
    if (cachedProfile && cachedProfile.id === id) cachedProfile = mapped;
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-users-changed'));
    return mapped;
  };

  Auth.deleteUser = async function(id) {
    // En Supabase, borrar de auth.users requiere service_role. Desde el cliente
    // anon solo podemos borrar el profile (cascade limpia bookmarks/chats/etc).
    const { error } = await sb.from('profiles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    if (cachedProfile && cachedProfile.id === id) await Auth.logout();
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-users-changed'));
  };

  Auth.setAdmin = async function(id, value) { return Auth.updateUser(id, { isAdmin: !!value }); };

  Auth.seedIfEmpty = async function() {
    // Recupera la sesión activa de Supabase (si la hay)
    const { data: { session } } = await sb.auth.getSession();
    if (session && session.user) {
      cachedProfile = await _loadProfile(session.user.id);
    }
    await _loadAllUsers();
    window.dispatchEvent(new Event('auth-changed'));
    window.dispatchEvent(new Event('auth-users-changed'));

    // Listener de cambios de sesión (login/logout/token refresh)
    sb.auth.onAuthStateChange(async (event, sess) => {
      if (sess && sess.user) {
        cachedProfile = await _loadProfile(sess.user.id);
      } else {
        cachedProfile = null;
      }
      window.dispatchEvent(new Event('auth-changed'));
    });
  };

  console.log('[SGS|on] Auth → Supabase backend activo');
}

// ── SupabaseData adapter Phase 2 · Bookmarks/ChatHistory/Submissions/Inbox/RouteExams ──
// Cuando Supabase está activo, monkey-patcheamos todos los stores para que lean
// y escriban en la DB. Mantenemos los métodos síncronos para no tocar la UI:
// usamos un cache en memoria + sync background. Los eventos
// (bookmarks-changed, chats-changed, etc) siguen disparándose igual.
function _activateSupabaseData() {
  const sb = window.supabaseClient;
  if (!sb) return;
  const _uid = function(){ return window.Auth && window.Auth.currentUser() ? window.Auth.currentUser().id : null; };

  // ── Bookmarks ────────────────────────────────────────────
  let bmCache = [];
  async function _loadBookmarks() {
    const u = _uid(); if (!u) { bmCache = []; return; }
    const { data, error } = await sb.from('bookmarks').select('pill_id').eq('user_id', u);
    if (error) { console.warn('[supa] bookmarks', error.message); return; }
    bmCache = (data || []).map(r => r.pill_id);
    window.dispatchEvent(new Event('bookmarks-changed'));
  }
  Bookmarks.get = function() { return bmCache.slice(); };
  Bookmarks.has = function(id) { return bmCache.indexOf(id) >= 0; };
  Bookmarks.toggle = function(id) {
    const u = _uid(); if (!u || !id) return false;
    const exists = bmCache.indexOf(id) >= 0;
    if (exists) {
      bmCache = bmCache.filter(x => x !== id);
      sb.from('bookmarks').delete().eq('user_id', u).eq('pill_id', id).then(()=>{});
    } else {
      bmCache = [id].concat(bmCache);
      sb.from('bookmarks').insert({ user_id: u, pill_id: id }).then(()=>{});
    }
    window.dispatchEvent(new Event('bookmarks-changed'));
    return !exists;
  };
  Bookmarks.clear = function() {
    const u = _uid(); if (!u) return;
    bmCache = [];
    sb.from('bookmarks').delete().eq('user_id', u).then(()=>{});
    window.dispatchEvent(new Event('bookmarks-changed'));
  };

  // ── RouteExams ────────────────────────────────────────────
  let reCache = {};
  async function _loadRouteExams() {
    const u = _uid(); if (!u) { reCache = {}; return; }
    const { data, error } = await sb.from('route_exams').select('*').eq('user_id', u);
    if (error) { console.warn('[supa] route_exams', error.message); return; }
    reCache = {};
    (data || []).forEach(r => {
      reCache[r.route_id] = { score: r.score, total: r.total, passed: r.passed, completedAt: new Date(r.completed_at).getTime() };
    });
    window.dispatchEvent(new Event('exams-changed'));
  }
  RouteExams.get = function(routeId) { return reCache[routeId] || null; };
  RouteExams.getAll = function() { return Object.assign({}, reCache); };
  RouteExams.record = function(routeId, score, total, passed) {
    const u = _uid(); if (!u) return;
    reCache[routeId] = { score, total, passed, completedAt: Date.now() };
    sb.from('route_exams').upsert({ user_id: u, route_id: routeId, score, total, passed, completed_at: new Date().toISOString() }).then(()=>{});
    window.dispatchEvent(new Event('exams-changed'));
  };
  RouteExams.reset = function(routeId) {
    const u = _uid(); if (!u) return;
    delete reCache[routeId];
    sb.from('route_exams').delete().eq('user_id', u).eq('route_id', routeId).then(()=>{});
    window.dispatchEvent(new Event('exams-changed'));
  };

  // ── ChatHistory ────────────────────────────────────────────
  let chatsCache = [];
  let activeIdCache = null;
  async function _loadChats() {
    const u = _uid(); if (!u) { chatsCache = []; return; }
    const { data: convs, error } = await sb.from('conversations').select('*').eq('user_id', u).order('updated_at', { ascending: false });
    if (error) { console.warn('[supa] conversations', error.message); return; }
    if (!convs || convs.length === 0) { chatsCache = []; window.dispatchEvent(new Event('chats-changed')); return; }
    // Carga mensajes de todas las conversaciones en una sola query
    const ids = convs.map(c => c.id);
    const { data: msgs } = await sb.from('messages').select('*').in('conversation_id', ids).order('created_at', { ascending: true });
    const byConv = {};
    (msgs || []).forEach(m => { (byConv[m.conversation_id] = byConv[m.conversation_id] || []).push({ role: m.role, text: m.content }); });
    chatsCache = convs.map(c => ({
      id: c.id, title: c.title,
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.updated_at).getTime(),
      messages: byConv[c.id] || [],
    }));
    window.dispatchEvent(new Event('chats-changed'));
  }
  ChatHistory.list = function() { return chatsCache.slice(); };
  ChatHistory.get = function(id) { return chatsCache.find(c => c.id === id) || null; };
  ChatHistory.activeId = function() { return activeIdCache; };
  ChatHistory.setActive = function(id) { activeIdCache = id || null; window.dispatchEvent(new Event('chats-changed')); };
  ChatHistory.create = function(initial) {
    const u = _uid(); if (!u) return null;
    const localId = 'tmp_' + Date.now().toString(36); // se reemplaza por el real
    const chat = { id: localId, title: 'Nueva conversación', createdAt: Date.now(), updatedAt: Date.now(), messages: initial || [] };
    chatsCache = [chat].concat(chatsCache);
    activeIdCache = localId;
    window.dispatchEvent(new Event('chats-changed'));
    sb.from('conversations').insert({ user_id: u, title: 'Nueva conversación' }).select().single().then(async ({ data, error }) => {
      if (error) { console.warn('[supa] create conv', error.message); return; }
      const realId = data.id;
      // mover mensajes locales si los hay
      const idx = chatsCache.findIndex(c => c.id === localId);
      if (idx >= 0) {
        chatsCache[idx].id = realId;
        chatsCache[idx].createdAt = new Date(data.created_at).getTime();
        chatsCache[idx].updatedAt = new Date(data.updated_at).getTime();
      }
      if (activeIdCache === localId) activeIdCache = realId;
      // si tenía mensajes iniciales, insertarlos
      if (initial && initial.length > 0) {
        await sb.from('messages').insert(initial.map(m => ({ conversation_id: realId, role: m.role, content: m.text })));
      }
      window.dispatchEvent(new Event('chats-changed'));
    });
    return chat;
  };
  ChatHistory.appendMessage = function(id, msg) {
    const idx = chatsCache.findIndex(c => c.id === id);
    if (idx < 0) return;
    chatsCache[idx].messages = (chatsCache[idx].messages || []).concat([msg]);
    chatsCache[idx].updatedAt = Date.now();
    if (chatsCache[idx].title === 'Nueva conversación' && msg.role === 'user') {
      chatsCache[idx].title = msg.text.slice(0, 50) + (msg.text.length > 50 ? '…' : '');
      sb.from('conversations').update({ title: chatsCache[idx].title, updated_at: new Date().toISOString() }).eq('id', id).then(()=>{});
    } else {
      sb.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id).then(()=>{});
    }
    sb.from('messages').insert({ conversation_id: id, role: msg.role, content: msg.text }).then(()=>{});
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.update = function(id, patch) {
    const idx = chatsCache.findIndex(c => c.id === id);
    if (idx < 0) return;
    chatsCache[idx] = Object.assign({}, chatsCache[idx], patch, { updatedAt: Date.now() });
    const dbPatch = {};
    if (patch.title) dbPatch.title = patch.title;
    dbPatch.updated_at = new Date().toISOString();
    sb.from('conversations').update(dbPatch).eq('id', id).then(()=>{});
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.remove = function(id) {
    chatsCache = chatsCache.filter(c => c.id !== id);
    if (activeIdCache === id) activeIdCache = null;
    sb.from('conversations').delete().eq('id', id).then(()=>{});
    window.dispatchEvent(new Event('chats-changed'));
  };
  ChatHistory.getOrCreate = function() {
    if (activeIdCache && chatsCache.find(c => c.id === activeIdCache)) return chatsCache.find(c => c.id === activeIdCache);
    if (chatsCache.length > 0) { activeIdCache = chatsCache[0].id; return chatsCache[0]; }
    return ChatHistory.create();
  };

  // ── Submissions ────────────────────────────────────────────
  let subsCache = [];
  async function _loadSubmissions() {
    const u = _uid(); if (!u) { subsCache = []; return; }
    const me = window.Auth.currentUser();
    const isAdmin = me && me.isAdmin;
    let q = sb.from('submissions').select('*, profiles!submissions_user_id_fkey(name, email, avatar_color)').order('submitted_at', { ascending: false });
    if (!isAdmin) q = q.eq('user_id', u);
    const { data, error } = await q;
    if (error) { console.warn('[supa] submissions', error.message); return; }
    subsCache = (data || []).map(r => ({
      id: r.id, userId: r.user_id,
      userName: (r.profiles && r.profiles.name) || '—',
      userEmail: (r.profiles && r.profiles.email) || '—',
      userAvatarColor: (r.profiles && r.profiles.avatar_color) || 'var(--ink)',
      pillId: r.pill_id, pillTitle: r.pill_title,
      fileName: r.file_name, fileSize: r.file_size, durationSec: r.duration_sec,
      thumbDataUrl: r.thumb_url,
      filePath: r.file_path,
      status: r.status, feedback: r.feedback,
      submittedAt: new Date(r.submitted_at).getTime(),
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).getTime() : null,
      reviewedBy: r.reviewed_by ? { id: r.reviewed_by } : null,
    }));
    window.dispatchEvent(new Event('submissions-changed'));
  }
  Submissions.listAll = function() { return subsCache.slice(); };
  Submissions.listByUser = function(uid) { return subsCache.filter(s => s.userId === uid); };
  Submissions.listByPill = function(pid) { return subsCache.filter(s => s.pillId === pid); };
  Submissions.listPending = function() { return subsCache.filter(s => s.status === 'pending'); };
  Submissions.get = function(id) { return subsCache.find(s => s.id === id) || null; };
  Submissions.getForUserAndPill = function(uid, pid) { return subsCache.find(s => s.userId === uid && s.pillId === pid) || null; };
  Submissions.submit = async function({ pillId, pillTitle, file, durationSec, thumbDataUrl, fileName, fileSize }) {
    const u = _uid(); if (!u) throw new Error('Necesitas iniciar sesión');
    if (durationSec > 600) throw new Error('Vídeo demasiado largo · máx 10 min');
    let filePath = null;
    if (file) {
      const ext = (fileName || file.name || 'video.mp4').split('.').pop();
      filePath = u + '/' + pillId + '_' + Date.now() + '.' + ext;
      const { error: upErr } = await sb.storage.from('submissions').upload(filePath, file, { upsert: true });
      if (upErr) throw new Error('Error subiendo vídeo: ' + upErr.message);
    }
    const existing = subsCache.find(s => s.userId === u && s.pillId === pillId);
    const payload = {
      user_id: u, pill_id: pillId, pill_title: pillTitle,
      file_path: filePath || (existing && existing.filePath) || '',
      file_name: fileName, file_size: fileSize, duration_sec: durationSec,
      thumb_url: thumbDataUrl,
      status: 'pending', feedback: null, reviewed_at: null, reviewed_by: null,
      submitted_at: new Date().toISOString(),
    };
    let res;
    if (existing) res = await sb.from('submissions').update(payload).eq('id', existing.id).select().single();
    else res = await sb.from('submissions').insert(payload).select().single();
    if (res.error) throw new Error(res.error.message);
    await _loadSubmissions();
    return res.data;
  };
  Submissions.review = async function(id, status, feedback) {
    const me = window.Auth.currentUser();
    if (!me || !me.isAdmin) throw new Error('Solo admins pueden revisar');
    const { error } = await sb.from('submissions').update({
      status, feedback: feedback || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: me.id,
    }).eq('id', id);
    if (error) throw new Error(error.message);
    // Notificar al user
    const sub = subsCache.find(s => s.id === id);
    if (sub) {
      await sb.from('inbox_notifications').insert({
        user_id: sub.userId,
        text: 'Tu entrega de "' + sub.pillTitle + '" ha sido ' + (status === 'approved' ? 'APROBADA ✓' : 'rechazada — revisa el feedback'),
        kind: status, icon: status === 'approved' ? '✓' : '✗',
      });
    }
    await _loadSubmissions();
  };
  Submissions.remove = async function(id) {
    const sub = subsCache.find(s => s.id === id);
    if (sub && sub.filePath) {
      await sb.storage.from('submissions').remove([sub.filePath]).catch(()=>{});
    }
    await sb.from('submissions').delete().eq('id', id);
    await _loadSubmissions();
  };

  // ── Inbox ────────────────────────────────────────────
  let inboxCache = { messages: [], notifications: [], releases: [] };
  async function _loadInbox() {
    const u = _uid(); if (!u) { inboxCache = { messages:[], notifications:[], releases:[] }; return; }
    const [msgsRes, notifsRes, releasesRes] = await Promise.all([
      sb.from('inbox_messages').select('*').eq('user_id', u).order('created_at', { ascending: false }),
      sb.from('inbox_notifications').select('*').eq('user_id', u).order('created_at', { ascending: false }),
      sb.from('releases').select('*').order('created_at', { ascending: false }),
    ]);
    inboxCache.messages = (msgsRes.data || []).map(r => ({
      id: r.id, from: r.from_name, subject: r.subject, body: r.body,
      createdAt: new Date(r.created_at).getTime(), read: r.read,
      fromAdmin: r.is_admin, fromAvatarColor: r.avatar_color,
    }));
    inboxCache.notifications = (notifsRes.data || []).map(r => ({
      id: r.id, text: r.text, kind: r.kind, icon: r.icon, link: r.link,
      createdAt: new Date(r.created_at).getTime(), read: r.read,
    }));
    inboxCache.releases = (releasesRes.data || []).map(r => ({
      id: r.id, version: r.version, title: r.title, body: r.body,
      kind: r.kind, createdAt: new Date(r.created_at).getTime(), read: false, // releases no tienen read por usuario en este modelo simple
    }));
    window.dispatchEvent(new Event('inbox-changed'));
  }
  Inbox.getAll = function() { return Object.assign({}, inboxCache); };
  Inbox.unreadCount = function(category) {
    if (category) return (inboxCache[category] || []).filter(i => !i.read).length;
    return inboxCache.messages.filter(i => !i.read).length + inboxCache.notifications.filter(i => !i.read).length;
  };
  Inbox.markRead = function(category, id) {
    if (category === 'releases') return; // release reads no se persisten en este modelo
    const list = inboxCache[category] || [];
    const item = list.find(x => x.id === id);
    if (item) {
      item.read = true;
      const table = category === 'messages' ? 'inbox_messages' : 'inbox_notifications';
      sb.from(table).update({ read: true }).eq('id', id).then(()=>{});
      window.dispatchEvent(new Event('inbox-changed'));
    }
  };
  Inbox.markAllRead = function(category) {
    const u = _uid(); if (!u) return;
    if (category === 'releases') return;
    (inboxCache[category] || []).forEach(it => it.read = true);
    const table = category === 'messages' ? 'inbox_messages' : 'inbox_notifications';
    sb.from(table).update({ read: true }).eq('user_id', u).then(()=>{});
    window.dispatchEvent(new Event('inbox-changed'));
  };
  Inbox.addNotification = function(text, opts) {
    const u = _uid(); if (!u) return;
    opts = opts || {};
    sb.from('inbox_notifications').insert({
      user_id: u, text, kind: opts.kind || 'info',
      icon: opts.icon || '🔔', link: opts.link || null,
    }).then(() => _loadInbox());
  };
  Inbox.addMessage = function(from, subject, body, opts) {
    const u = _uid(); if (!u) return;
    opts = opts || {};
    sb.from('inbox_messages').insert({
      user_id: u, from_name: from, subject, body,
      is_admin: !!opts.fromAdmin, avatar_color: opts.fromAvatarColor,
    }).then(() => _loadInbox());
  };
  Inbox.deleteItem = function(category, id) {
    if (category === 'releases') return;
    inboxCache[category] = (inboxCache[category] || []).filter(x => x.id !== id);
    const table = category === 'messages' ? 'inbox_messages' : 'inbox_notifications';
    sb.from(table).delete().eq('id', id).then(()=>{});
    window.dispatchEvent(new Event('inbox-changed'));
  };
  Inbox.seedIfEmpty = function() { _loadInbox(); /* el seed real viene del schema.sql */ };

  // ── Sync inicial cuando hay sesión + en cada cambio de auth ──
  async function _syncAll() {
    if (!_uid()) return;
    await Promise.all([
      _loadBookmarks(), _loadRouteExams(), _loadChats(), _loadSubmissions(), _loadInbox(),
    ]);
  }
  window.addEventListener('auth-changed', _syncAll);
  if (_uid()) _syncAll();

  console.log('[SGS|on] Datos → Supabase backend activo');
}

// Activa adapters cuando el bootstrap del HTML termina
if (typeof window !== 'undefined') {
  function _activateAll() {
    if (window.SGSON_BACKEND === 'supabase') {
      _activateSupabaseAuth();
      _activateSupabaseData();
    }
  }
  if (window.SGSON_BACKEND_READY) _activateAll();
  else window.addEventListener('sgson-backend-ready', _activateAll);
}

// Helper: namespacing de localStorage por usuario actual
// Para keys que dependen del usuario (bookmarks, chats, progreso, etc.)
function _userScopedKey(baseKey) {
  var id = Auth.currentUserId();
  return id ? baseKey + ':' + id : baseKey;
}
window.userKey = _userScopedKey;

// ── Bookmarks (Saved library) por usuario ──────────────────────────────────
const Bookmarks = (function() {
  function _key() { return _userScopedKey('solid-bookmarks'); }
  function get() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch(e) { return []; } }
  function save(ids) { localStorage.setItem(_key(), JSON.stringify(ids)); window.dispatchEvent(new Event('bookmarks-changed')); }
  function has(id) { return get().includes(id); }
  function toggle(id) {
    const ids = get();
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1); else ids.unshift(id);
    save(ids);
    return idx < 0;
  }
  function clear() { save([]); }
  return { get, has, toggle, clear };
})();
window.Bookmarks = Bookmarks;

// ── User profile (editable) — derivado del usuario autenticado ────────────
// Lee del Auth.currentUser() y guarda los cambios en el registro de usuarios.
const UserProfile = (function() {
  const DEFAULT = { name: 'Sin sesión', role: '—', team: '—', avatarColor: 'var(--ink-3)', email: '' };
  function get() {
    var u = window.Auth ? window.Auth.currentUser() : null;
    if (!u) return Object.assign({}, DEFAULT);
    return {
      name: u.name, role: u.role, team: u.team,
      avatarColor: u.avatarColor, email: u.email,
      isAdmin: !!u.isAdmin, id: u.id,
    };
  }
  function update(patch) {
    var u = window.Auth ? window.Auth.currentUser() : null;
    if (!u) return DEFAULT;
    var fields = ['name', 'role', 'team', 'avatarColor', 'email'];
    var clean = {};
    fields.forEach(function(f){ if (patch[f] !== undefined) clean[f] = patch[f]; });
    var updated = window.Auth.updateUser(u.id, clean);
    var profileShape = {
      name: updated.name, role: updated.role, team: updated.team,
      avatarColor: updated.avatarColor, email: updated.email,
      isAdmin: !!updated.isAdmin, id: updated.id,
    };
    window.dispatchEvent(new CustomEvent('user-profile-changed', { detail: profileShape }));
    return profileShape;
  }
  function reset() {/* legacy noop */}
  return { get, update, reset, DEFAULT };
})();
window.UserProfile = UserProfile;

// ── CommandPalette (global search ⌘K) ──────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate, openDetail }) {
  const [q, setQ] = useSM('');
  const inputRef = React.useRef(null);

  useEM(() => {
    if (open && inputRef.current) {
      setQ('');
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  useEM(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const all = (window.PILLS || []).concat(window.SERIES || []).concat(window.PODCASTS || []);
  const ql = q.trim().toLowerCase();
  const items = ql.length === 0
    ? all.slice(0, 8)
    : all.filter(it => (it.title || '').toLowerCase().includes(ql) || (it.category || '').toLowerCase().includes(ql) || (it.teacher || '').toLowerCase().includes(ql)).slice(0, 12);

  const navItems = [
    { id:'home', label:'Inicio' },
    { id:'browse', label:'Catálogo' },
    { id:'rutas', label:'Rutas de certificación' },
    { id:'path', label:'Mi ruta' },
    { id:'dashboard', label:'Dashboard' },
    { id:'coach', label:'MENTOR-IA' },
    { id:'cronograma', label:'Cronograma' },
    { id:'wa', label:'WhatsApp' },
    { id:'saved', label:'Guardados' },
    { id:'profile', label:'Mi perfil' },
  ].filter(n => ql.length === 0 || n.label.toLowerCase().includes(ql));

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10vh'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', width:'min(640px, 92vw)', borderRadius:14, boxShadow:'0 30px 80px rgba(0,0,0,0.25)', overflow:'hidden', border:'1px solid var(--line)'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:10}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--ink-4)'}}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.6-4.6"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar módulos, vistas, profesores…"
            style={{flex:1, border:'none', outline:'none', fontFamily:'var(--sans)', fontSize:15, background:'transparent', color:'var(--ink)'}}
          />
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', padding:'2px 6px', border:'1px solid var(--line)', borderRadius:4}}>ESC</span>
        </div>
        <div style={{maxHeight:'55vh', overflowY:'auto'}}>
          {navItems.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Navegación</div>
              {navItems.map(n => (
                <button key={n.id} onClick={() => { onNavigate(n.id); onClose(); }} style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)'}} onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.08em'}}>IR A</span> {n.label}
                </button>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <div>
              <div style={{padding:'10px 18px 4px', fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Módulos {ql && `· ${items.length} resultados`}</div>
              {items.map(it => (
                <button key={it.id} onClick={() => { openDetail(it); onClose(); }} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)'}} onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-4)', flexShrink:0, width:36}}>{it.format || 'módulo'}</span>
                  <span style={{flex:1, fontSize:13, color:'var(--ink)', fontWeight:500}}>{it.title}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{it.duration}</span>
                </button>
              ))}
            </div>
          )}
          {items.length === 0 && navItems.length === 0 && (
            <div style={{padding:'24px 18px', textAlign:'center', fontSize:13, color:'var(--ink-4)'}}>Sin resultados para "{q}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const saved = JSON.parse(localStorage.getItem('solid-proto') || '{}');
  const [view, setView] = useSM(saved.view || 'home');
  const [aiMode, setAIMode] = useSM(saved.aiMode || 'companion'); // hero | companion | collapsed
  const [shape, setShape] = useSM(saved.shape || 'mixed');
  const [accent, setAccent] = useSM(saved.accent || '#F3A524');
  const [detailItem, setDetailItem] = useSM(null);

  // Auth state — re-render cuando cambia el usuario
  const [authUser, setAuthUser] = useSM(() => Auth.currentUser());
  useEM(() => {
    Auth.seedIfEmpty();
    setAuthUser(Auth.currentUser());
    const refresh = () => {
      setAuthUser(Auth.currentUser());
      // cuando cambia de usuario, re-sembrar el inbox del nuevo
      if (window.Inbox) window.Inbox.seedIfEmpty();
    };
    window.addEventListener('auth-changed', refresh);
    return () => window.removeEventListener('auth-changed', refresh);
  }, []);
  useEM(() => { if (authUser && window.Inbox) window.Inbox.seedIfEmpty(); }, [authUser && authUser.id]);

  // Initialize tracker and handle tracked URL opens
  useEM(() => {
    WATracker.seedIfEmpty();
    const params = new URLSearchParams(window.location.search);
    const wtrack = params.get('wtrack');
    const pillId = params.get('pill');
    if (wtrack) {
      WATracker.trackOpen(wtrack);
      if (pillId && window.PILLS) {
        const pill = window.PILLS.find(p => p.id === pillId);
        if (pill) { setDetailItem(pill); setView('player'); }
      }
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEM(() => {
    localStorage.setItem('solid-proto', JSON.stringify({ view, aiMode, shape, accent }));
    document.documentElement.style.setProperty('--accent-glow', accent);
  }, [view, aiMode, shape, accent]);

  // Tweaks protocol
  useEM(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') window.__tweaksOn = true, window.dispatchEvent(new Event('__tweaks'));
      if (e.data?.type === '__deactivate_edit_mode') window.__tweaksOn = false, window.dispatchEvent(new Event('__tweaks'));
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [tweaksOn, setTweaksOn] = useSM(false);
  useEM(() => {
    const h = () => setTweaksOn(!!window.__tweaksOn);
    window.addEventListener('__tweaks', h);
    return () => window.removeEventListener('__tweaks', h);
  }, []);

  // Mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useSM(false);

  // Command palette (⌘K / Ctrl+K)
  const [paletteOpen, setPaletteOpen] = useSM(false);
  useEM(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', h);
    window.__openPalette = () => setPaletteOpen(true);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const openDetail = (it) => { setDetailItem(it); setView('detail'); };
  const openPlayer = (it) => { if (it) setDetailItem(it); setView('player'); };

  const rootClass = `proto-root ai-${aiMode}${mobileMenuOpen ? ' mobile-menu-open' : ''}`;

  // Cierra el menú móvil al cambiar de vista
  useEM(() => { setMobileMenuOpen(false); }, [view]);

  if (!authUser) return <LoginScreen/>;

  return (
    <div className={rootClass} data-screen-label={`Prototype · ${view}`}>
      {view !== 'onboarding' && (
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Abrir menú">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 6h18M3 12h18M3 18h18"/></>}
          </svg>
        </button>
      )}
      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}/>}
      {view !== 'onboarding' && <Sidebar view={view} setView={(v) => { setView(v); if (v === 'wa') setView('wa'); }}/>}
      <main className="main" style={view === 'onboarding' ? {gridColumn:'1 / -1'} : {}}>
        {view === 'home' && <Home openDetail={openDetail} openPlayer={openPlayer} setView={setView}/>}
        {view === 'detail' && <Detail item={detailItem} openPlayer={openPlayer} back={() => setView('home')} setView={setView} setAIMode={setAIMode}/>}
        {view === 'player' && <Player back={() => setView('detail')} item={detailItem}/>}
        {view === 'coach' && <Coach/>}
        {view === 'dashboard' && <Dashboard/>}
        {view === 'rutas' && <Rutas openPlayer={openPlayer}/>}
        {view === 'path' && <PathView openPlayer={openPlayer} setView={setView}/>}
        {view === 'profile' && <Profile setView={setView}/>}
        {view === 'wa' && <WhatsApp/>}
        {view === 'cronograma' && <div className="main-inner"><Cronograma/></div>}
        {view === 'saved' && <SavedView openDetail={openDetail} setView={setView}/>}
        {view === 'admin' && (Auth.isAdmin() ? <AdminPanel setView={setView}/> : <div className="main-inner"><div className="empty-state"><div className="empty-icon">🔒</div><h3>Acceso restringido</h3><p>Solo los administradores pueden acceder a este panel.</p></div></div>)}
        {view === 'inbox' && <InboxView openDetail={openDetail} setView={setView}/>}
        {view === 'browse' && <div className="main-inner"><Home openDetail={openDetail} openPlayer={openPlayer} setView={setView}/></div>}
        {view === 'onboarding' && <Onboarding done={() => setView('home')}/>}
      </main>
      {view !== 'onboarding' && aiMode !== 'collapsed' && (
        <AISidekick setAIMode={setAIMode} aiMode={aiMode} view={view}/>
      )}
      {aiMode === 'collapsed' && view !== 'onboarding' && (
        <button className="ai-rail-btn" onClick={() => setAIMode('companion')} title="Abrir MENTOR-IA" aria-label="Abrir MENTOR-IA">
          <svg className="mentor-mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="railGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FCCB00"/>
                <stop offset="20%" stopColor="#F45744"/>
                <stop offset="45%" stopColor="#BD2882"/>
                <stop offset="70%" stopColor="#0072BE"/>
                <stop offset="100%" stopColor="#BCD630"/>
              </linearGradient>
            </defs>
            {/* Wave M shape — eco del logo MENTOR-IA */}
            <path d="M 12 78 Q 16 60 24 56 Q 33 52 38 64 Q 42 74 46 50 Q 50 26 54 50 Q 58 74 62 64 Q 67 52 76 56 Q 84 60 88 78"
              stroke="url(#railGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Punto luminoso */}
            <circle cx="50" cy="22" r="3" fill="#BCD630"/>
          </svg>
        </button>
      )}

      {view !== 'onboarding' && <OnboardingRing onClick={() => setView('onboarding')}/>}

      {tweaksOn && (
        <TweaksPanel
          shape={shape} setShape={setShape}
          accent={accent} setAccent={setAccent}
          aiMode={aiMode} setAIMode={setAIMode}
        />
      )}

      <Toaster/>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(v) => setView(v)}
        openDetail={openDetail}
      />
    </div>
  );
}

// ── Saved view (bookmarks) ─────────────────────────────────────────────────
function SavedView({ openDetail, setView }) {
  const [tick, setTick] = useSM(0);
  useEM(() => {
    const h = () => setTick(t => t + 1);
    window.addEventListener('bookmarks-changed', h);
    return () => window.removeEventListener('bookmarks-changed', h);
  }, []);
  const ids = (window.Bookmarks ? window.Bookmarks.get() : []);
  const all = (window.PILLS || []).concat(window.SERIES || []).concat(window.PODCASTS || []);
  const items = ids.map(id => all.find(x => x.id === id)).filter(Boolean);
  return (
    <div className="main-inner">
      <div className="lms-hero-eyebrow" style={{marginBottom:8}}><span className="repsol-dot"/>Módulos guardados</div>
      <h1 style={{fontFamily:'var(--serif)', fontWeight:700, fontSize:'clamp(36px, 4vw, 52px)', letterSpacing:'-0.025em', margin:'0 0 8px'}}>Tu <em style={{fontStyle:'italic', color:'var(--accent-glow)'}}>biblioteca</em>.</h1>
      <p style={{fontSize:14, color:'var(--ink-3)', marginBottom:32}}>{items.length} {items.length === 1 ? 'módulo guardado' : 'módulos guardados'}</p>
      {items.length === 0 ? (
        <div style={{padding:'48px 24px', textAlign:'center', border:'1px dashed var(--line)', borderRadius:14, background:'var(--paper-2)'}}>
          <div style={{fontSize:32, marginBottom:8}}>📑</div>
          <div style={{fontSize:15, fontWeight:600, marginBottom:6, color:'var(--ink)'}}>Aún no has guardado ningún módulo</div>
          <div style={{fontSize:13, color:'var(--ink-3)', marginBottom:16}}>Pulsa <em style={{fontStyle:'italic'}}>Guardar</em> en cualquier módulo para añadirlo aquí.</div>
          <button className="btn glow" onClick={() => setView('browse')}>Explorar catálogo →</button>
        </div>
      ) : (
        <div className="catalog-grid">{items.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}</div>
      )}
    </div>
  );
}

// ── Onboarding ring · botón flotante que se va llenando con el progreso ───
function OnboardingRing({ onClick }) {
  const computeProgress = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(window.userKey('solid-onboarding')) || '{}');
      if (raw.completedAt) return { value: 1, label: 'Completado', completed: true };
      const total = raw.totalSteps || 4;
      const step = Math.max(0, Math.min(total, raw.step || 0));
      // step va de 0..3 mientras está en onboarding; 0 = sin empezar, 4 = completado
      return { value: step / total, label: 'Onboarding · ' + step + '/' + total, completed: false };
    } catch (e) {
      return { value: 0, label: 'Onboarding', completed: false };
    }
  };
  const [prog, setProg] = useSM(computeProgress());
  useEM(() => {
    const refresh = () => setProg(computeProgress());
    window.addEventListener('onboarding-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('onboarding-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const size = 36, stroke = 3.5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dash = c * prog.value;

  const button = (
    <button onClick={onClick} title={prog.label} aria-label={prog.label}
      style={{position:'relative', width:size, height:size, borderRadius:'50%', border:'none',
        background:'rgba(255,255,255,0.85)', boxShadow:'0 2px 6px rgba(0,89,150,0.12), 0 0 0 1px rgba(0,114,190,0.1)',
        cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', padding:0,
        transition:'transform .14s, box-shadow .14s'}}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,114,190,0.28), 0 0 0 1px var(--bn-blue)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 6px rgba(0,89,150,0.12), 0 0 0 1px rgba(0,114,190,0.1)'; }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position:'absolute', inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--paper-3)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={prog.completed ? 'var(--bn-lime)' : 'var(--bn-blue)'}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{transition:'stroke-dasharray .35s ease'}}/>
      </svg>
      {prog.completed ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bn-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:'relative'}}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      ) : (
        <span style={{position:'relative', fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em'}}>
          {Math.round(prog.value * 100)}<span style={{fontSize:8, color:'var(--ink-4)'}}>%</span>
        </span>
      )}
    </button>
  );

  // Portal al slot del shell-tabs si existe; si no, fallback flotante
  const slot = typeof document !== 'undefined' ? document.getElementById('onboarding-ring-slot') : null;
  if (slot) return ReactDOM.createPortal(button, slot);
  return <div style={{position:'fixed', top:14, right:18, zIndex:500}}>{button}</div>;
}

// ── Toast notifications (global) ──────────────────────────────────────────
const Toast = (function() {
  let listeners = [];
  let counter = 0;
  function show(message, opts) {
    opts = opts || {};
    const id = 't_' + (++counter) + '_' + Date.now().toString(36);
    const toast = {
      id, message,
      type: opts.type || 'info',
      icon: opts.icon,
      duration: opts.duration != null ? opts.duration : 3500,
      action: opts.action || null,
    };
    listeners.forEach(function(fn){ fn({ type: 'add', toast: toast }); });
    if (toast.duration > 0) {
      setTimeout(function(){ listeners.forEach(function(fn){ fn({ type: 'remove', id: id }); }); }, toast.duration);
    }
    return id;
  }
  return {
    show: show,
    dismiss: function(id){ listeners.forEach(function(fn){ fn({ type: 'remove', id: id }); }); },
    subscribe: function(fn){
      listeners.push(fn);
      return function(){ listeners = listeners.filter(function(x){ return x !== fn; }); };
    },
    success: function(m, opts){ return show(m, Object.assign({type:'success'}, opts || {})); },
    error:   function(m, opts){ return show(m, Object.assign({type:'error',   duration: 5000}, opts || {})); },
    info:    function(m, opts){ return show(m, Object.assign({type:'info'},    opts || {})); },
  };
})();
window.Toast = Toast;

function Toaster() {
  const [toasts, setToasts] = useSM([]);
  useEM(function(){
    return Toast.subscribe(function(ev){
      if (ev.type === 'add')    setToasts(function(t){ return t.concat([ev.toast]); });
      if (ev.type === 'remove') setToasts(function(t){ return t.filter(function(x){ return x.id !== ev.id; }); });
    });
  }, []);
  return (
    <div style={{position:'fixed', bottom:20, right:20, zIndex:700, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none'}}>
      {toasts.map(function(t){
        const colors = {
          success: { bg: 'var(--bn-lime)', fg: 'var(--ink)', border: 'var(--bn-lime-dark)' },
          error:   { bg: 'var(--repsol-red)', fg: '#fff', border: 'var(--repsol-red-dark)' },
          info:    { bg: 'var(--ink)', fg: 'var(--paper)', border: 'var(--ink-2)' },
        }[t.type] || { bg: 'var(--ink)', fg: 'var(--paper)', border: 'var(--ink-2)' };
        return (
          <div key={t.id} className="toast-item" style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'12px 16px', borderRadius:10,
            background:colors.bg, color:colors.fg,
            boxShadow:'0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
            fontFamily:'var(--sans)', fontSize:13, fontWeight:500,
            minWidth:240, maxWidth:380,
            pointerEvents:'auto',
            border:'1px solid ' + colors.border,
          }}>
            {t.icon && <span style={{fontSize:16, flexShrink:0}}>{t.icon}</span>}
            <span style={{flex:1, lineHeight:1.4}}>{t.message}</span>
            {t.action && (
              <button onClick={function(){ t.action.onClick(); Toast.dismiss(t.id); }} style={{
                background:'rgba(255,255,255,0.18)', color:colors.fg, border:'none',
                padding:'5px 10px', borderRadius:6, cursor:'pointer',
                fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700,
              }}>{t.action.label}</button>
            )}
            <button onClick={function(){ Toast.dismiss(t.id); }} title="Cerrar" style={{
              background:'transparent', color:colors.fg, opacity:0.6, border:'none',
              cursor:'pointer', padding:0, display:'flex', alignItems:'center', justifyContent:'center',
              width:18, height:18, flexShrink:0,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Chat history (MENTOR-IA conversaciones persistentes) ──────────────────
const ChatHistory = (function() {
  function _key() { return _userScopedKey('solid-chats'); }
  function _activeKey() { return _userScopedKey('solid-active-chat'); }
  function list() { try { return JSON.parse(localStorage.getItem(_key()) || '[]'); } catch(e) { return []; } }
  function save(chats) { localStorage.setItem(_key(), JSON.stringify(chats)); window.dispatchEvent(new Event('chats-changed')); }
  function activeId() { return localStorage.getItem(_activeKey()) || null; }
  function setActive(id) { if (id) localStorage.setItem(_activeKey(), id); else localStorage.removeItem(_activeKey()); window.dispatchEvent(new Event('chats-changed')); }
  function get(id) { return list().find(c => c.id === id); }
  function create(initial) {
    const id = 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
    const chat = { id, title: 'Nueva conversación', createdAt: Date.now(), updatedAt: Date.now(), messages: initial || [] };
    const chats = list();
    chats.unshift(chat);
    save(chats);
    setActive(id);
    return chat;
  }
  function update(id, patch) {
    const chats = list();
    const idx = chats.findIndex(c => c.id === id);
    if (idx < 0) return;
    chats[idx] = Object.assign({}, chats[idx], patch, { updatedAt: Date.now() });
    save(chats);
  }
  function appendMessage(id, msg) {
    const chats = list();
    const idx = chats.findIndex(c => c.id === id);
    if (idx < 0) return;
    chats[idx].messages = (chats[idx].messages || []).concat([msg]);
    chats[idx].updatedAt = Date.now();
    // Auto-titular desde el primer mensaje del usuario
    if (chats[idx].title === 'Nueva conversación' && msg.role === 'user') {
      chats[idx].title = msg.text.slice(0, 50) + (msg.text.length > 50 ? '…' : '');
    }
    save(chats);
  }
  function remove(id) {
    save(list().filter(c => c.id !== id));
    if (activeId() === id) setActive(null);
  }
  function getOrCreate() {
    const id = activeId();
    if (id) {
      const c = get(id);
      if (c) return c;
    }
    return create();
  }
  return { list, get, create, update, appendMessage, remove, activeId, setActive, getOrCreate };
})();
window.ChatHistory = ChatHistory;

// ── Inbox · 3 pestañas (DM · Notificaciones · Releases) ─────────────────────
// Releases son globales (mismo changelog para todos), notificaciones se generan
// del propio uso, y mensajes son por usuario (admin puede mandarlos).
const Inbox = (function() {
  function _userKey() { return _userScopedKey('sgson-inbox'); }
  const RELEASES_KEY = 'sgson-releases-global'; // compartidos entre todos los usuarios

  function _loadUser() {
    try { return JSON.parse(localStorage.getItem(_userKey()) || '{"messages":[],"notifications":[]}'); }
    catch(e) { return { messages: [], notifications: [] }; }
  }
  function _saveUser(data) { localStorage.setItem(_userKey(), JSON.stringify(data)); window.dispatchEvent(new Event('inbox-changed')); }

  function _loadReleases() {
    try { return JSON.parse(localStorage.getItem(RELEASES_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function _saveReleases(rs) { localStorage.setItem(RELEASES_KEY, JSON.stringify(rs)); window.dispatchEvent(new Event('inbox-changed')); }

  function getAll() {
    const u = _loadUser();
    return {
      messages: u.messages || [],
      notifications: u.notifications || [],
      releases: _loadReleases(),
    };
  }

  function unreadCount(category) {
    const all = getAll();
    if (category) return (all[category] || []).filter(i => !i.read).length;
    return (all.messages || []).filter(i => !i.read).length
         + (all.notifications || []).filter(i => !i.read).length
         + (all.releases || []).filter(i => !i.read).length;
  }

  function markRead(category, id) {
    if (category === 'releases') {
      const rs = _loadReleases();
      const r = rs.find(x => x.id === id);
      if (r) { r.read = true; _saveReleases(rs); }
      return;
    }
    const u = _loadUser();
    const list = u[category] || [];
    const item = list.find(x => x.id === id);
    if (item) { item.read = true; _saveUser(u); }
  }

  function markAllRead(category) {
    if (category === 'releases') {
      const rs = _loadReleases();
      rs.forEach(r => r.read = true);
      _saveReleases(rs);
      return;
    }
    const u = _loadUser();
    (u[category] || []).forEach(it => it.read = true);
    _saveUser(u);
  }

  function addNotification(text, opts) {
    opts = opts || {};
    const u = _loadUser();
    const n = {
      id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      text, kind: opts.kind || 'info', icon: opts.icon || '🔔',
      createdAt: Date.now(), read: false, link: opts.link || null,
    };
    u.notifications = [n].concat(u.notifications || []).slice(0, 50);
    _saveUser(u);
    return n;
  }

  function addMessage(from, subject, body, opts) {
    opts = opts || {};
    const u = _loadUser();
    const m = {
      id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      from, subject, body,
      createdAt: Date.now(), read: false, fromAdmin: !!opts.fromAdmin, fromAvatarColor: opts.fromAvatarColor,
    };
    u.messages = [m].concat(u.messages || []).slice(0, 100);
    _saveUser(u);
    return m;
  }

  function deleteItem(category, id) {
    if (category === 'releases') {
      _saveReleases(_loadReleases().filter(x => x.id !== id));
      return;
    }
    const u = _loadUser();
    u[category] = (u[category] || []).filter(x => x.id !== id);
    _saveUser(u);
  }

  function seedIfEmpty() {
    // Releases globales: solo se siembran una vez en toda la plataforma
    if (_loadReleases().length === 0) {
      const now = Date.now();
      const d = 86400000;
      _saveReleases([
        { id:'r_1', version:'2.4', title:'Examen final por ruta · Genera tu certificado', body:'Ahora cada ruta de certificación termina con un examen rápido de 3 preguntas. Al superarlo, descargas tu certificado oficial Repsol × BeonIt.', createdAt: now - 1*3600000, read:false, kind:'feature' },
        { id:'r_2', version:'2.3', title:'Bandeja de entrada unificada', body:'Mensajes directos, notificaciones de actividad y releases ahora viven en un único lugar. Marcadas como leídas, eliminables, todo persistente.', createdAt: now - 6*3600000, read:false, kind:'feature' },
        { id:'r_3', version:'2.2', title:'MENTOR-IA con historial de chats persistente', body:'Tus conversaciones con MENTOR-IA se guardan automáticamente. Crea nuevas, retoma anteriores. Modo nocturno en el panel lateral.', createdAt: now - 2*d, read:false, kind:'feature' },
        { id:'r_4', version:'2.1', title:'Multi-usuario y panel de administración', body:'Nuevo flujo de login/registro con rol admin. Cada usuario tiene sus propios bookmarks, chats y progreso.', createdAt: now - 4*d, read:false, kind:'feature' },
        { id:'r_5', version:'2.0', title:'SGS|on · nuevo branding', body:'La plataforma se rebautiza como SGS|on, manteniendo la metodología SOLID GROWTH. Logos y paleta actualizados.', createdAt: now - 9*d, read:true, kind:'announcement' },
      ]);
    }

    // Notificaciones por usuario: solo se siembran si está vacío para este usuario
    const u = _loadUser();
    if (!u.notifications || u.notifications.length === 0) {
      const now = Date.now();
      const me = window.Auth && window.Auth.currentUser();
      u.notifications = [
        { id:'n_1', text:'Bienvenido a SGS|on. Completa tu primer pill para empezar.', kind:'welcome', icon:'👋', createdAt: now - 5*60000, read: false },
        { id:'n_2', text:'Tu próxima Pill recomendada: P4 · Posibilidades operativas de los canales', kind:'recommendation', icon:'💡', createdAt: now - 30*60000, read: false, link:'p4' },
        { id:'n_3', text:'MENTOR-IA está listo para responder tus dudas', kind:'info', icon:'✦', createdAt: now - 2*3600000, read: true },
      ];
    }

    if (!u.messages || u.messages.length === 0) {
      const now = Date.now();
      u.messages = [
        { id:'m_1', from:'Equipo BeonIt', subject:'Sesión de bienvenida', body:'Hola, gracias por unirte a la formación. El próximo lunes tenemos el taller introductorio en la sala virtual. Te llegará el link 30 minutos antes. ¡Bienvenido!', createdAt: now - 24*3600000, read:false, fromAdmin:true, fromAvatarColor:'var(--bn-blue)' },
        { id:'m_2', from:'MENTOR-IA', subject:'Tu plan personalizado', body:'He preparado tu plan de las próximas 4 semanas basado en tu rol Publish Agent. Empieza por las Pills 0-5 (Bloque 1) esta semana. Pregúntame si dudas en algún concepto.', createdAt: now - 3*3600000, read:false, fromAvatarColor:'var(--bn-purple)' },
      ];
    }
    _saveUser(u);
  }

  return { getAll, unreadCount, markRead, markAllRead, addNotification, addMessage, deleteItem, seedIfEmpty };
})();
window.Inbox = Inbox;

// ── RouteExams · examen final de cada ruta + emisión de certificado ─────────
// Banco de preguntas por id de ruta (3 por ruta). Pasar = todas correctas.
const ROUTE_EXAM_BANK = {
  fundamentals: {
    title: 'Examen final · Fundamentals',
    questions: [
      { q: '¿Cuál es el rol que aprueba contenido antes de publicar en redes corporativas?', options: ['Publish Agent', 'Content Lead', 'Care Agent', 'Analytics Lead'], answer: 1 },
      { q: '¿Cuántas Think Pills cubre el bloque 1+2 (Fundamentos)?', options: ['3 pills', '6 pills', '10 pills', '12 pills'], answer: 1 },
      { q: '¿Qué módulo de Sprinklr se usa para gestionar activos digitales reutilizables?', options: ['Social Publish', 'DAM (Digital Asset Management)', 'Care', 'Reporting'], answer: 1 },
    ],
  },
  managers: {
    title: 'Examen final · Managers',
    questions: [
      { q: '¿Qué rol tiene permisos para aprobar publicación en producción?', options: ['Agent', 'Manager', 'Reporting', 'Viewer'], answer: 1 },
      { q: 'En el flujo de aprobación urgente ("fast-track"), ¿qué SLA de revisión aplica en Repsol?', options: ['2 horas', '4 horas', '24 horas', '48 horas'], answer: 0 },
      { q: '¿Qué herramienta usa Repsol para escalar casos de Sprinklr?', options: ['HubSpot', 'Zendesk', 'Salesforce', 'ServiceNow'], answer: 2 },
    ],
  },
  publish: {
    title: 'Examen final · Publish Agent',
    questions: [
      { q: '¿Desde dónde se programa una publicación multicanal?', options: ['Care', 'Calendario editorial de Social Publish', 'DAM', 'Reporting'], answer: 1 },
      { q: '¿Qué permite Sprinklr en publicación multicanal sin reescribir el copy?', options: ['Adaptación automática por red social', 'Solo Twitter', 'Solo LinkedIn', 'Programación manual canal a canal'], answer: 0 },
      { q: '¿Qué hace una macro en Sprinklr?', options: ['Genera reportes', 'Aplica una acción predefinida con un click', 'Borra contenido programado', 'Cambia idioma'], answer: 1 },
    ],
  },
  care: {
    title: 'Examen final · Care Agent',
    questions: [
      { q: '¿Cuál es el First Response SLA estándar de Repsol Care en horario laboral?', options: ['1 h', '2 h', '4 h', '8 h'], answer: 1 },
      { q: '¿Qué acción ejecuta una macro al recibir un mensaje recurrente?', options: ['Borra el caso', 'Responde, etiqueta y/o deriva con un click', 'Notifica solo al admin', 'Bloquea al usuario'], answer: 1 },
      { q: '¿A qué sistema escala Care un caso crítico?', options: ['HubSpot', 'Salesforce', 'Slack', 'Excel'], answer: 1 },
    ],
  },
  analytics: {
    title: 'Examen final · Analytics Lead',
    questions: [
      { q: '¿Qué módulo usarías para monitorización en tiempo real?', options: ['Sprinklr Insights', 'Sprinklr DAM', 'Sprinklr Publish', 'Sprinklr Print'], answer: 0 },
      { q: '¿Qué dimensión NO es típica de un dashboard Repsol?', options: ['Engagement por canal', 'Coste por punto de venta', 'Reach por país', 'Sentimiento agregado'], answer: 1 },
      { q: '¿Qué tipo de gráfica usarías para visualizar drop-off de un funnel formativo?', options: ['Pastel', 'Línea descendente', 'Mapa de calor', 'Treemap'], answer: 1 },
    ],
  },
};

const RouteExams = (function() {
  function _key() { return _userScopedKey('sgson-route-exams'); }
  function getAll() { try { return JSON.parse(localStorage.getItem(_key()) || '{}'); } catch(e) { return {}; } }
  function saveAll(d) { localStorage.setItem(_key(), JSON.stringify(d)); window.dispatchEvent(new Event('exams-changed')); }
  function get(routeId) { return getAll()[routeId] || null; }
  function record(routeId, score, total, passed) {
    const all = getAll();
    all[routeId] = { score, total, passed, completedAt: Date.now() };
    saveAll(all);
  }
  function reset(routeId) { const all = getAll(); delete all[routeId]; saveAll(all); }
  function bank(routeId) { return ROUTE_EXAM_BANK[routeId] || null; }
  return { getAll, get, record, reset, bank };
})();
window.RouteExams = RouteExams;

// ── Submissions · entregas de video por módulo, revisadas por admin ──────────
// Para no llenar localStorage con binarios pesados, guardamos METADATOS de la
// entrega + thumbnail base64 + duración. El video real no se persiste — en el
// modelo SaaS real iría a S3/Vercel Blob/Supabase Storage. Aquí basta para la
// demo del flujo.
const Submissions = (function() {
  const ALL_KEY = 'sgson-submissions-global'; // todas, accesibles por admin
  function _load() { try { return JSON.parse(localStorage.getItem(ALL_KEY) || '[]'); } catch(e) { return []; } }
  function _save(s) { localStorage.setItem(ALL_KEY, JSON.stringify(s)); window.dispatchEvent(new Event('submissions-changed')); }

  function listAll() { return _load(); }
  function listByUser(userId) { return _load().filter(s => s.userId === userId); }
  function listByPill(pillId) { return _load().filter(s => s.pillId === pillId); }
  function listPending() { return _load().filter(s => s.status === 'pending'); }
  function get(id) { return _load().find(s => s.id === id); }

  function getForUserAndPill(userId, pillId) {
    return _load().find(s => s.userId === userId && s.pillId === pillId) || null;
  }

  function submit({ pillId, pillTitle, fileName, fileSize, durationSec, thumbDataUrl }) {
    var u = window.Auth && window.Auth.currentUser();
    if (!u) throw new Error('Necesitas iniciar sesión');
    if (durationSec > 600) throw new Error('Vídeo demasiado largo · máximo 10 minutos');
    var existing = getForUserAndPill(u.id, pillId);
    var sub = {
      id: existing ? existing.id : 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2,4),
      userId: u.id, userName: u.name, userEmail: u.email, userAvatarColor: u.avatarColor,
      pillId, pillTitle,
      fileName, fileSize, durationSec, thumbDataUrl,
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      submittedAt: Date.now(),
      reviewedAt: null, reviewedBy: null, feedback: null,
    };
    var all = _load();
    if (existing) { all = all.map(s => s.id === existing.id ? sub : s); }
    else { all.unshift(sub); }
    _save(all);
    // Notificar a todos los admins
    if (window.Auth) {
      // No tenemos tabla de notifs por admin individual, dejamos un toast al usuario
    }
    return sub;
  }

  function review(id, status, feedback) {
    var u = window.Auth && window.Auth.currentUser();
    if (!u || !u.isAdmin) throw new Error('Solo admins pueden revisar');
    var all = _load();
    var idx = all.findIndex(s => s.id === id);
    if (idx < 0) return null;
    all[idx].status = status; // 'approved' | 'rejected'
    all[idx].reviewedAt = Date.now();
    all[idx].reviewedBy = { id: u.id, name: u.name };
    all[idx].feedback = feedback || null;
    _save(all);
    // Notificar al usuario que entregó
    var sub = all[idx];
    var users = window.Auth.listUsers();
    var owner = users.find(x => x.id === sub.userId);
    if (owner) {
      // Inyectar notificación en el inbox del owner
      var key = 'sgson-inbox:' + owner.id;
      try {
        var ib = JSON.parse(localStorage.getItem(key) || '{"messages":[],"notifications":[]}');
        ib.notifications = [{
          id: 'n_' + Date.now().toString(36),
          text: 'Tu entrega de "' + sub.pillTitle + '" ha sido ' + (status === 'approved' ? 'APROBADA ✓' : 'rechazada — revisa el feedback'),
          kind: status, icon: status === 'approved' ? '✓' : '✗',
          createdAt: Date.now(), read: false,
        }].concat(ib.notifications || []);
        localStorage.setItem(key, JSON.stringify(ib));
      } catch(e) {}
    }
    return all[idx];
  }

  function remove(id) { _save(_load().filter(s => s.id !== id)); }

  return { listAll, listByUser, listByPill, listPending, get, getForUserAndPill, submit, review, remove };
})();
window.Submissions = Submissions;

function TweaksPanel({ shape, setShape, accent, setAccent, aiMode, setAIMode }) {
  const persist = (edits) => window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
  return (
    <div style={{position:'fixed', right:20, top:76, width:280, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:14, padding:18, zIndex:600, boxShadow:'0 20px 60px rgba(0,0,0,0.12)'}}>
      <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17, marginBottom:4}}>Tweaks</div>
      <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:16}}>Live · saved to file</div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Pill card shape</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
          {['mixed','capsule','square','vertical'].map(s => (
            <button key={s} onClick={() => { setShape(s); persist({shape:s}); }}
              style={{padding:'7px 10px', borderRadius:8, border:`1px solid ${shape===s?'var(--ink)':'var(--line)'}`, background: shape===s?'var(--ink)':'transparent', color: shape===s?'var(--paper)':'var(--ink)', fontSize:11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em', cursor:'pointer'}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Accent</div>
        <div style={{display:'flex', gap:8}}>
          {['#c8ff3d', '#ff5a1f', '#6d5efc', '#00d4a8', '#ffc93d'].map(c => (
            <button key={c} onClick={() => { setAccent(c); persist({accent:c}); }}
              style={{width:28, height:28, borderRadius:'50%', background:c, border: accent===c ? '2px solid var(--ink)':'1px solid var(--line)', cursor:'pointer'}}/>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontSize:12, fontWeight:600, marginBottom:6}}>Coach prominence</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
          {['collapsed','companion','hero'].map(m => (
            <button key={m} onClick={() => { setAIMode(m); persist({aiMode:m}); }}
              style={{padding:'7px 6px', borderRadius:8, border:`1px solid ${aiMode===m?'var(--ink)':'var(--line)'}`, background: aiMode===m?'var(--ink)':'transparent', color: aiMode===m?'var(--paper)':'var(--ink)', fontSize:10, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.04em', cursor:'pointer'}}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Login / Signup screen ─────────────────────────────────────────────────
function LoginScreen() {
  const isSupabase = (typeof window !== 'undefined' && window.SGSON_BACKEND === 'supabase');

  // Detectar invite token en la URL (?invite=inv_xxx)
  const inviteToken = (() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  })();
  const invitation = inviteToken && window.Invitations ? window.Invitations.getByToken(inviteToken) : null;

  const [mode, setMode] = useSM(invitation ? 'signup' : 'login'); // si llega por invite, vamos directo a signup
  const [email, setEmail] = useSM(invitation ? invitation.email : '');
  const [password, setPassword] = useSM('');
  const [name, setName] = useSM(invitation ? invitation.name : '');
  const [role, setRole] = useSM(invitation ? invitation.role : 'Publish Agent');
  const [team, setTeam] = useSM(invitation ? invitation.team : 'Repsol');
  const [error, setError] = useSM('');
  const [submitting, setSubmitting] = useSM(false);

  const submit = async (e) => {
    e && e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const u = await Promise.resolve(Auth.login(email, password));
        if (window.Toast && u) window.Toast.success('Bienvenido de vuelta, ' + (u.name || '').split(' ')[0], { icon: '👋' });
      } else {
        const u = await Promise.resolve(Auth.signup({ email, password, name, role, team }));
        if (invitation && window.Invitations) {
          window.Invitations.markAccepted(invitation.token);
          // limpia el query param para no procesarlo otra vez en reloads
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
        if (window.Toast && u) window.Toast.success(invitation ? 'Bienvenido · invitación aceptada' : 'Cuenta creada · Bienvenido a SGS|on', { icon: '✓' });
      }
    } catch (err) {
      setError((err && err.message) || 'Error desconocido');
    }
    setSubmitting(false);
  };

  const quickLogin = async (em) => {
    setEmail(em);
    setError('');
    try {
      const u = await Promise.resolve(Auth.login(em));
      if (window.Toast && u) window.Toast.success('Sesión iniciada', { icon: '✓' });
    } catch(e) { setError(e.message); }
  };

  const users = Auth.listUsers ? Auth.listUsers() : [];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000, display:'flex',
      background:'linear-gradient(135deg, #0D1117 0%, #1a2940 50%, #2a1f4d 100%)',
      overflow:'auto',
    }}>
      {/* Lado visual izquierdo */}
      <div style={{flex:1, padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', color:'#fff', minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <img src={"sgs-on-logo.png?v=" + (window.SOLID_VERSION || 'init')} style={{height:36, filter:'brightness(1.6) saturate(1.2)'}} alt="SGS|on"/>
        </div>
        <div>
          <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:18}}>Plataforma de formación · 2026</div>
          <h1 style={{fontFamily:'var(--sans)', fontSize:'clamp(40px, 5.5vw, 68px)', fontWeight:300, lineHeight:1.05, letterSpacing:'-0.02em', margin:0}}>
            Domina<br/>Sprinklr<br/>como <em style={{fontStyle:'italic', fontWeight:600, background:'linear-gradient(135deg, #BCD630, #66C7C2)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>experto</em>.
          </h1>
          <div style={{marginTop:32, display:'flex', gap:10, flexWrap:'wrap'}}>
            {['41 Think Pills', '3 Talleres', 'MENTOR-IA', 'Certificado Repsol'].map(t => (
              <span key={t} style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 11px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:999, color:'rgba(255,255,255,0.75)'}}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
          BeonIt × Repsol · Powered by Claude
        </div>
      </div>

      {/* Form lado derecho */}
      <div style={{flex:'0 0 460px', maxWidth:'100%', background:'var(--paper)', padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'auto'}}>
        <div style={{maxWidth:380, width:'100%', margin:'auto 0'}}>
          {invitation && (
            <div style={{padding:'14px 16px', background:'rgba(188,214,48,0.1)', border:'1px solid rgba(188,214,48,0.4)', borderRadius:10, marginBottom:20}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-lime-dark)', fontWeight:700, marginBottom:4}}>✉ Invitación recibida</div>
              <div style={{fontSize:13, color:'var(--ink-2)', lineHeight:1.5}}>Hola <strong>{invitation.name}</strong>, te han invitado a SGS|on como <strong>{invitation.role}</strong>. Completa tu cuenta y accede.</div>
            </div>
          )}
          <div style={{display:'flex', gap:6, marginBottom:32, padding:4, background:'var(--paper-2)', borderRadius:10, width:'fit-content'}}>
            <button onClick={() => { setMode('login'); setError(''); }}
              style={{padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600,
                background: mode==='login' ? 'var(--paper)' : 'transparent', color: mode==='login' ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: mode==='login' ? 'var(--shadow-sm)' : 'none'}}>Iniciar sesión</button>
            <button onClick={() => { setMode('signup'); setError(''); }}
              style={{padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600,
                background: mode==='signup' ? 'var(--paper)' : 'transparent', color: mode==='signup' ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: mode==='signup' ? 'var(--shadow-sm)' : 'none'}}>Crear cuenta</button>
          </div>
          <h2 style={{margin:'0 0 8px', fontSize:24, letterSpacing:'-0.01em'}}>{mode === 'login' ? 'Entrar a tu cuenta' : 'Crear nueva cuenta'}</h2>
          <p style={{fontSize:13.5, color:'var(--ink-3)', marginBottom:24, lineHeight:1.5}}>{mode === 'login' ? 'Introduce el email con el que te registraste.' : 'Te llevará 30 segundos. Sin password — versión demo.'}</p>

          <form onSubmit={submit}>
            <label style={{display:'block', marginBottom:12}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Email</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@repsol.com" autoFocus
                style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
            </label>
            {isSupabase && (
              <label style={{display:'block', marginBottom:12}}>
                <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Password</div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '············'}
                  style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
              </label>
            )}
            {mode === 'signup' && (
              <>
                <label style={{display:'block', marginBottom:12}}>
                  <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Nombre completo</div>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Amaia Ruiz"
                    style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                </label>
                <label style={{display:'block', marginBottom:12}}>
                  <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Rol</div>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, background:'var(--paper)', boxSizing:'border-box'}}>
                    {['Publish Agent','Content Lead','Analytics Lead','Care Agent','IT / Integraciones','Dirección','Administrador'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label style={{display:'block', marginBottom:12}}>
                  <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4}}>Equipo</div>
                  <input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="Repsol"
                    style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:14, outline:'none', boxSizing:'border-box'}}/>
                </label>
              </>
            )}
            {error && (
              <div style={{padding:'9px 12px', background:'rgba(235,0,41,0.08)', border:'1px solid rgba(235,0,41,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5, marginBottom:12}}>
                {error}
              </div>
            )}
            <button type="submit" disabled={submitting} className="btn glow" style={{width:'100%', justifyContent:'center', marginTop:6, opacity: submitting ? 0.6 : 1}}>
              {submitting ? 'Cargando…' : mode === 'login' ? 'Entrar →' : 'Crear cuenta →'}
            </button>
          </form>

          <div style={{marginTop:18, fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:6, height:6, borderRadius:'50%', background: isSupabase ? 'var(--bn-lime)' : 'var(--bn-orange)', display:'inline-block'}}/>
            Backend: {isSupabase ? 'Supabase · Conectado' : 'Demo · LocalStorage'}
          </div>

          {!isSupabase && users.length > 0 && mode === 'login' && (
            <div style={{marginTop:28, paddingTop:20, borderTop:'1px solid var(--line)'}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>Acceso rápido (demo)</div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {users.slice(0, 4).map(u => (
                  <button key={u.id} onClick={() => quickLogin(u.email)} type="button"
                    style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', border:'1px solid var(--line)', borderRadius:8, background:'var(--paper)', cursor:'pointer', textAlign:'left', fontFamily:'var(--sans)'}}>
                    <div style={{width:28, height:28, borderRadius:'50%', background:u.avatarColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                      {u.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:500, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{u.name}</div>
                      <div style={{fontSize:10.5, color:'var(--ink-4)', fontFamily:'var(--mono)'}}>{u.email}</div>
                    </div>
                    {u.isAdmin && <span style={{fontFamily:'var(--mono)', fontSize:9, padding:'2px 6px', background:'var(--ink)', color:'#fff', borderRadius:4, letterSpacing:'0.06em'}}>ADMIN</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin panel · vista exclusiva para admins ──────────────────────────────
function AdminPanel({ setView }) {
  const [users, setUsers] = useSM(Auth.listUsers());
  const [filter, setFilter] = useSM('');
  const [showInvite, setShowInvite] = useSM(false);
  const [invitations, setInvitations] = useSM(window.Invitations ? window.Invitations.list() : []);
  useEM(() => {
    const refresh = () => setInvitations(window.Invitations ? window.Invitations.list() : []);
    window.addEventListener('invitations-changed', refresh);
    return () => window.removeEventListener('invitations-changed', refresh);
  }, []);
  useEM(() => {
    const refresh = () => setUsers(Auth.listUsers());
    window.addEventListener('auth-users-changed', refresh);
    return () => window.removeEventListener('auth-users-changed', refresh);
  }, []);

  const filtered = users.filter(u => !filter || (u.name + ' ' + u.email + ' ' + u.role + ' ' + u.team).toLowerCase().includes(filter.toLowerCase()));
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.isAdmin).length;
  const totalActive7d = users.filter(u => Date.now() - (u.lastLoginAt || 0) < 7*86400000).length;

  // Métricas agregadas: cuentos los completados/chats/bookmarks por usuario
  const userMetrics = users.map(u => {
    let bookmarks = 0, chats = 0, completed = 0;
    try { bookmarks = JSON.parse(localStorage.getItem('solid-bookmarks:' + u.id) || '[]').length; } catch(e) {}
    try { chats = JSON.parse(localStorage.getItem('solid-chats:' + u.id) || '[]').length; } catch(e) {}
    try { completed = JSON.parse(localStorage.getItem('solid-completed:' + u.id) || '[]').length; } catch(e) {}
    return { ...u, _bookmarks: bookmarks, _chats: chats, _completed: completed };
  });
  const totalCompletions = userMetrics.reduce((s,u) => s + u._completed, 0);
  const totalChats = userMetrics.reduce((s,u) => s + u._chats, 0);

  const filteredMetrics = userMetrics.filter(u => !filter || (u.name + ' ' + u.email + ' ' + u.role + ' ' + u.team).toLowerCase().includes(filter.toLowerCase()));

  const fmtRel = (ts) => {
    if (!ts) return '—';
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    return Math.floor(d/86400) + ' d';
  };

  const toggleAdmin = (u) => {
    if (u.id === Auth.currentUserId() && u.isAdmin) {
      if (!confirm('¿Quitarte el rol admin a TI mismo? Perderás acceso a este panel.')) return;
    }
    Auth.setAdmin(u.id, !u.isAdmin);
    if (window.Toast) window.Toast.success((u.isAdmin ? 'Quitado admin a ' : 'Hecho admin a ') + u.name);
  };
  const removeUser = (u) => {
    if (u.id === Auth.currentUserId()) { alert('No puedes borrar tu propio usuario.'); return; }
    if (!confirm('¿Borrar definitivamente a ' + u.name + ' y todos sus datos (bookmarks, chats, progreso)?')) return;
    Auth.deleteUser(u.id);
    if (window.Toast) window.Toast.info('Usuario eliminado · ' + u.name);
  };

  return (
    <div className="main-inner" style={{padding:'32px 48px', maxWidth:'none'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24}}>
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot" style={{background:'var(--ink)'}}/>Panel de administración</div>
          <h1 style={{fontFamily:'var(--sans)', fontWeight:800, fontSize:'clamp(28px,3vw,38px)', letterSpacing:'-0.02em', margin:'4px 0 0'}}>Usuarios y métricas</h1>
          <p style={{fontSize:13.5, color:'var(--ink-3)', margin:'8px 0 0', maxWidth:580}}>Gestiona los usuarios de la plataforma, sus roles y revisa métricas agregadas en tiempo real.</p>
          <div style={{marginTop:10, display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', borderRadius:999, background: window.SGSON_BACKEND === 'supabase' ? 'rgba(188,214,48,0.12)' : 'rgba(243,165,37,0.12)', border: '1px solid ' + (window.SGSON_BACKEND === 'supabase' ? 'rgba(188,214,48,0.4)' : 'rgba(243,165,37,0.4)')}}>
            <span style={{width:7, height:7, borderRadius:'50%', background: window.SGSON_BACKEND === 'supabase' ? 'var(--bn-lime)' : 'var(--bn-orange)'}}/>
            <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, color: window.SGSON_BACKEND === 'supabase' ? 'var(--bn-lime-dark)' : '#7a4400'}}>
              {window.SGSON_BACKEND === 'supabase' ? 'Supabase backend conectado · datos reales en DB' : 'Demo mode · datos en localStorage de este navegador'}
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Buscar usuario, email, rol…"
            style={{padding:'10px 14px', border:'1px solid var(--line)', borderRadius:10, fontFamily:'var(--sans)', fontSize:13, minWidth:280, outline:'none'}}/>
          <button onClick={() => setShowInvite(true)} className="btn glow" style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Invitar usuarios
          </button>
        </div>
      </div>

      {showInvite && <InviteUsersModal onClose={() => setShowInvite(false)}/>}

      {/* KPIs admin */}
      <div className="dash-kpis" style={{marginBottom:28}}>
        {[
          { label:'Usuarios totales', value: totalUsers, color:'var(--bn-blue)' },
          { label:'Activos últimos 7d', value: totalActive7d, color:'var(--bn-lime)' },
          { label:'Administradores', value: totalAdmins, color:'var(--ink)' },
          { label:'Conversaciones MENTOR-IA', value: totalChats, color:'var(--bn-purple)' },
          { label:'Módulos completados', value: totalCompletions, color:'var(--bn-orange)' },
        ].map((k, i) => (
          <div key={i} className="kpi-card" style={{'--kpi-color': k.color}}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla de usuarios */}
      <div className="dash-panel" style={{padding:0, overflow:'hidden'}}>
        <div className="dash-panel-head" style={{padding:'16px 22px'}}>
          <h3>Usuarios ({filtered.length})</h3>
          <span className="panel-sub">Click en cualquier fila para ver acciones</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="user-table" style={{width:'100%'}}>
            <thead>
              <tr><th>Usuario</th><th>Rol · Equipo</th><th>Progreso</th><th>Chats</th><th>Bookmarks</th><th>Última conexión</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredMetrics.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:30, height:30, borderRadius:'50%', background:u.avatarColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                        {u.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="u-name">{u.name} {u.isAdmin && <span style={{fontFamily:'var(--mono)', fontSize:8.5, padding:'1px 5px', background:'var(--ink)', color:'#fff', borderRadius:3, letterSpacing:'0.06em', marginLeft:4}}>ADMIN</span>}</div>
                        <div className="u-role">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{fontSize:12.5}}>{u.role}</div><div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)'}}>{u.team}</div></td>
                  <td>
                    <div className="prog-pill">
                      <div className="prog-bar-sm"><i style={{width: Math.min(100, (u._completed/(window.PILLS||[]).length || 1) * 100) + '%'}}/></div>
                      <span style={{fontFamily:'var(--mono)', fontSize:11}}>{u._completed} pills</span>
                    </div>
                  </td>
                  <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u._chats}</td>
                  <td style={{fontFamily:'var(--mono)', fontSize:12}}>{u._bookmarks}</td>
                  <td style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{fmtRel(u.lastLoginAt)}</td>
                  <td>
                    <div style={{display:'flex', gap:6}}>
                      <button onClick={() => toggleAdmin(u)} title={u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                        style={{padding:'5px 10px', borderRadius:6, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer', fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em'}}>
                        {u.isAdmin ? '− admin' : '+ admin'}
                      </button>
                      <button onClick={() => removeUser(u)} title="Borrar usuario"
                        style={{padding:'5px 10px', borderRadius:6, border:'1px solid rgba(235,0,41,0.3)', background:'transparent', cursor:'pointer', fontSize:11, color:'var(--repsol-red)', fontFamily:'var(--mono)', letterSpacing:'0.06em'}}>
                        × borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMetrics.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center', padding:32, color:'var(--ink-4)', fontSize:13}}>Sin usuarios que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitaciones pendientes */}
      <PendingInvitationsBlock invitations={invitations}/>

      {/* Cola de revisión de entregas prácticas */}
      <AdminSubmissionsQueue/>
    </div>
  );
}

function PendingInvitationsBlock({ invitations }) {
  const pending = (invitations || []).filter(i => i.status === 'pending');
  const accepted = (invitations || []).filter(i => i.status === 'accepted');
  if (!invitations || invitations.length === 0) return null;

  const fmtRel = (ts) => {
    if (!ts) return '—';
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    return Math.floor(d/86400) + ' d';
  };

  const copyInvite = (token) => {
    navigator.clipboard.writeText(window.Invitations.inviteUrl(token)).then(() => {
      if (window.Toast) window.Toast.success('Link copiado', { icon: '📋' });
    }).catch(() => {});
  };

  const remove = (token, email) => {
    if (!confirm('¿Borrar la invitación a ' + email + '?')) return;
    window.Invitations.remove(token);
    if (window.Toast) window.Toast.info('Invitación eliminada');
  };

  return (
    <div className="dash-panel" style={{padding:0, marginTop:24, overflow:'hidden'}}>
      <div className="dash-panel-head" style={{padding:'16px 22px'}}>
        <h3>Invitaciones · {pending.length} pendientes · {accepted.length} aceptadas</h3>
        <span className="panel-sub">Comparte el link con cada persona — al abrirlo crean cuenta con un click</span>
      </div>
      {pending.length === 0 ? (
        <div style={{padding:'28px 20px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>Sin invitaciones pendientes. Pulsa "Invitar usuarios" arriba para añadir más.</div>
      ) : (
        <div style={{padding:'8px 14px 16px'}}>
          {pending.map(inv => (
            <div key={inv.token} style={{display:'flex', gap:10, padding:'12px 14px', border:'1px solid var(--line)', borderRadius:10, background:'var(--paper)', marginBottom:6, alignItems:'center'}}>
              <div style={{width:30, height:30, borderRadius:'50%', background:'var(--bn-orange)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>
                {(inv.name || inv.email).split(/\s+|@|\./)[0][0].toUpperCase() + ((inv.name || inv.email).split(/\s+|@|\./)[1] || '')[0]?.toUpperCase()}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:2}}>
                  <span style={{fontSize:13, fontWeight:600}}>{inv.name || '—'}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>· {inv.email}</span>
                  <span style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:9, padding:'2px 8px', borderRadius:999, background:'var(--bn-orange)', color:'#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>Pendiente</span>
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)'}}>{inv.role} · {inv.team} · creada {fmtRel(inv.createdAt)}</div>
              </div>
              <button onClick={() => copyInvite(inv.token)} title="Copiar link"
                style={{padding:'6px 12px', border:'1px solid var(--bn-blue)', borderRadius:6, background:'rgba(0,114,190,0.06)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--bn-blue-dark)', fontWeight:700, letterSpacing:'0.06em'}}>
                Copiar link
              </button>
              <button onClick={() => remove(inv.token, inv.email)} title="Borrar invitación"
                style={{padding:'6px 10px', border:'1px solid rgba(235,0,41,0.3)', borderRadius:6, background:'transparent', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, color:'var(--repsol-red)', fontWeight:700, letterSpacing:'0.06em'}}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSubmissionsQueue() {
  const [subs, setSubs] = useSM(Submissions.listAll());
  const [filter, setFilter] = useSM('pending'); // 'pending' | 'all' | 'approved' | 'rejected'
  const [reviewing, setReviewing] = useSM(null);
  const [feedback, setFeedback] = useSM('');

  useEM(() => {
    const refresh = () => setSubs(Submissions.listAll());
    window.addEventListener('submissions-changed', refresh);
    return () => window.removeEventListener('submissions-changed', refresh);
  }, []);

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);
  const counts = {
    pending: subs.filter(s => s.status === 'pending').length,
    approved: subs.filter(s => s.status === 'approved').length,
    rejected: subs.filter(s => s.status === 'rejected').length,
    all: subs.length,
  };

  const review = (status) => {
    if (!reviewing) return;
    Submissions.review(reviewing.id, status, feedback || null);
    if (window.Toast) window.Toast.success('Entrega ' + (status === 'approved' ? 'aprobada' : 'rechazada'));
    setReviewing(null);
    setFeedback('');
  };

  const fmtDur = (s) => Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0');
  const fmtSize = (b) => b < 1024*1024 ? (b/1024).toFixed(0) + ' KB' : (b/1024/1024).toFixed(1) + ' MB';

  return (
    <div className="dash-panel" style={{padding:0, marginTop:24, overflow:'hidden'}}>
      <div className="dash-panel-head" style={{padding:'16px 22px'}}>
        <h3>Entregas prácticas · revisión</h3>
        <span className="panel-sub">Vídeos enviados por los usuarios — revisa y da feedback</span>
      </div>
      <div style={{padding:'12px 22px', borderBottom:'1px solid var(--line-2)', display:'flex', gap:6, flexWrap:'wrap'}}>
        {[
          { id:'pending', label:'Pendientes', count: counts.pending, color:'var(--bn-orange)' },
          { id:'approved', label:'Aprobadas', count: counts.approved, color:'var(--bn-lime)' },
          { id:'rejected', label:'Rechazadas', count: counts.rejected, color:'var(--repsol-red)' },
          { id:'all', label:'Todas', count: counts.all, color:'var(--ink-3)' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{padding:'6px 12px', borderRadius:8, border:'1px solid ' + (filter === f.id ? f.color : 'var(--line)'), background: filter === f.id ? f.color : 'var(--paper)', color: filter === f.id ? (f.id === 'approved' ? 'var(--ink)' : '#fff') : 'var(--ink-3)', cursor:'pointer', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700}}>
            {f.label} {f.count > 0 && <span style={{marginLeft:4, opacity:0.85}}>· {f.count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-4)', fontSize:13}}>
          {filter === 'pending' ? 'Sin entregas pendientes de revisión.' : 'Sin entregas en este estado.'}
        </div>
      ) : (
        <div style={{padding:'8px 14px 16px'}}>
          {filtered.map(s => {
            const statusColor = { pending:'var(--bn-orange)', approved:'var(--bn-lime)', rejected:'var(--repsol-red)' }[s.status];
            return (
              <div key={s.id} style={{display:'flex', gap:12, padding:'14px', border:'1px solid var(--line)', borderRadius:10, background:'var(--paper)', marginBottom:8, alignItems:'flex-start'}}>
                {s.thumbDataUrl && <img src={s.thumbDataUrl} style={{width:120, borderRadius:6, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <div style={{width:24, height:24, borderRadius:'50%', background:s.userAvatarColor || 'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0}}>
                      {(s.userName || '?').split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <span style={{fontSize:12.5, fontWeight:600}}>{s.userName}</span>
                    <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>· {s.userEmail}</span>
                    <span style={{marginLeft:'auto', fontFamily:'var(--mono)', fontSize:9.5, padding:'2px 8px', borderRadius:999, background: statusColor, color: s.status === 'approved' ? 'var(--ink)' : '#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:13.5, fontWeight:600, marginBottom:3, color:'var(--ink)'}}>{s.pillTitle}</div>
                  <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{s.fileName} · {fmtDur(s.durationSec)} · {fmtSize(s.fileSize)} · enviado {new Date(s.submittedAt).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'})}</div>
                  {s.feedback && (
                    <div style={{marginTop:8, padding:'7px 10px', background:'var(--paper-2)', borderLeft:'3px solid ' + statusColor, borderRadius:'0 6px 6px 0', fontSize:12, color:'var(--ink-3)'}}>
                      <strong style={{color:'var(--ink-4)', fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase'}}>Feedback</strong> · {s.feedback}
                    </div>
                  )}
                  {s.status === 'pending' && (
                    <div style={{display:'flex', gap:6, marginTop:10}}>
                      <button className="btn ghost" style={{padding:'6px 12px', fontSize:12}} onClick={() => { setReviewing(s); setFeedback(''); }}>Revisar →</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de revisión */}
      {reviewing && (
        <div onClick={() => setReviewing(null)} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
          <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(540px, 96vw)', padding:28}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:6}}>Revisar entrega</div>
            <h2 style={{margin:'0 0 4px', fontSize:18}}>{reviewing.pillTitle}</h2>
            <div style={{fontSize:12.5, color:'var(--ink-3)', marginBottom:16}}>de <strong>{reviewing.userName}</strong> · {reviewing.userEmail}</div>
            {reviewing.thumbDataUrl && <img src={reviewing.thumbDataUrl} style={{width:'100%', maxHeight:240, objectFit:'cover', borderRadius:8, marginBottom:14, border:'1px solid var(--line)'}} alt=""/>}
            <label style={{display:'block', marginBottom:14}}>
              <div style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--mono)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:5}}>Feedback (opcional)</div>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comenta la entrega · qué hizo bien, qué mejorar…" rows="4"
                style={{width:'100%', padding:'10px 12px', border:'1px solid var(--line)', borderRadius:8, fontFamily:'var(--sans)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box'}}/>
            </label>
            <div style={{display:'flex', gap:8, justifyContent:'space-between'}}>
              <button className="btn ghost" onClick={() => setReviewing(null)}>Cancelar</button>
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => review('rejected')} style={{padding:'8px 14px', borderRadius:8, border:'1px solid rgba(235,0,41,0.3)', background:'rgba(235,0,41,0.06)', color:'var(--repsol-red)', cursor:'pointer', fontFamily:'var(--sans)', fontSize:13, fontWeight:600}}>Rechazar</button>
                <button onClick={() => review('approved')} className="btn glow" style={{background:'var(--bn-lime)', color:'var(--ink)'}}>Aprobar ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inbox view · 3 pestañas ────────────────────────────────────────────────
function InboxView({ openDetail, setView }) {
  const [tab, setTab] = useSM('messages'); // 'messages' | 'notifications' | 'releases'
  const [inbox, setInboxState] = useSM(Inbox.getAll());
  const [selected, setSelected] = useSM(null);

  useEM(() => {
    const refresh = () => setInboxState(Inbox.getAll());
    window.addEventListener('inbox-changed', refresh);
    return () => window.removeEventListener('inbox-changed', refresh);
  }, []);

  const list = (inbox[tab] || []).slice();
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const fmtRel = (ts) => {
    if (!ts) return '—';
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return 'ahora';
    if (d < 3600) return Math.floor(d/60) + ' min';
    if (d < 86400) return Math.floor(d/3600) + ' h';
    if (d < 86400*7) return Math.floor(d/86400) + ' d';
    const dd = new Date(ts);
    return dd.getDate() + '/' + (dd.getMonth()+1);
  };

  const openItem = (item) => {
    setSelected(item);
    if (!item.read) {
      Inbox.markRead(tab, item.id);
      // refrescar local sin esperar al evento
      setInboxState(Inbox.getAll());
    }
  };

  const tabs = [
    { id: 'messages',      label: 'Mensajes',      icon: '✉' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'releases',      label: 'Novedades',      icon: '✨' },
  ];

  const unread = (cat) => Inbox.unreadCount(cat);

  return (
    <div className="main-inner" style={{padding:'32px 32px 48px', maxWidth:'none'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24}}>
        <div>
          <div className="lms-hero-eyebrow"><span className="repsol-dot"/>Bandeja de entrada</div>
          <h1 style={{fontFamily:'var(--sans)', fontWeight:800, fontSize:'clamp(28px,3vw,38px)', letterSpacing:'-0.02em', margin:'4px 0 0'}}>Tu actividad</h1>
        </div>
        {list.some(x => !x.read) && (
          <button className="btn ghost" onClick={() => { Inbox.markAllRead(tab); setInboxState(Inbox.getAll()); }}>
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Pestañas */}
      <div style={{display:'flex', gap:4, marginBottom:20, padding:4, background:'var(--paper-2)', borderRadius:12, width:'fit-content', maxWidth:'100%', overflowX:'auto'}}>
        {tabs.map(t => {
          const u = unread(t.id);
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
              style={{display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, border:'none', cursor:'pointer',
                background: tab === t.id ? 'var(--paper)' : 'transparent',
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                fontFamily:'var(--sans)', fontSize:13, fontWeight:600,
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
                whiteSpace:'nowrap'}}>
              <span style={{fontSize:14}}>{t.icon}</span>
              {t.label}
              {u > 0 && <span style={{fontFamily:'var(--mono)', fontSize:9.5, padding:'2px 6px', background:'var(--bn-blue)', color:'#fff', borderRadius:999, fontWeight:700}}>{u}</span>}
            </button>
          );
        })}
      </div>

      {/* Lista + detalle */}
      <div style={{display:'grid', gridTemplateColumns:'minmax(280px, 380px) 1fr', gap:20, alignItems:'flex-start'}}>
        <div className="dash-panel" style={{padding:0, overflow:'hidden', maxHeight:'70vh', overflowY:'auto'}}>
          {list.length === 0 ? (
            <div style={{padding:'40px 20px', textAlign:'center'}}>
              <div style={{fontSize:32, marginBottom:8, opacity:0.5}}>{tabs.find(t => t.id === tab).icon}</div>
              <div style={{fontSize:14, fontWeight:600, color:'var(--ink-2)', marginBottom:4}}>Sin {tabs.find(t => t.id === tab).label.toLowerCase()}</div>
              <div style={{fontSize:12.5, color:'var(--ink-4)'}}>No hay nada nuevo por aquí.</div>
            </div>
          ) : list.map(item => (
            <button key={item.id} onClick={() => openItem(item)} style={{
              display:'block', width:'100%', textAlign:'left', padding:'14px 16px',
              border:'none', borderBottom:'1px solid var(--line-2)',
              background: selected && selected.id === item.id ? 'rgba(0,114,190,0.06)' : item.read ? 'transparent' : 'rgba(0,114,190,0.025)',
              cursor:'pointer', fontFamily:'var(--sans)',
              borderLeft: selected && selected.id === item.id ? '3px solid var(--bn-blue)' : '3px solid transparent',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                {!item.read && <span style={{width:7, height:7, borderRadius:'50%', background:'var(--bn-blue)', flexShrink:0}}/>}
                {tab === 'messages' && (
                  <div style={{width:24, height:24, borderRadius:'50%', background:item.fromAvatarColor || 'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0}}>
                    {(item.from || '?').split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                )}
                {tab !== 'messages' && <span style={{fontSize:14, flexShrink:0}}>{item.icon || (tab === 'releases' ? '✨' : '🔔')}</span>}
                <span style={{fontSize:12.5, fontWeight: item.read ? 500 : 700, color:'var(--ink)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {tab === 'messages' ? item.from : tab === 'releases' ? ('v' + (item.version || '?')) : (item.kind || 'Aviso')}
                </span>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', flexShrink:0}}>{fmtRel(item.createdAt)}</span>
              </div>
              <div style={{fontSize:13, fontWeight: item.read ? 400 : 600, color: item.read ? 'var(--ink-3)' : 'var(--ink)', lineHeight:1.4, paddingLeft: tab === 'messages' ? 32 : 22}}>
                {tab === 'messages' ? item.subject : tab === 'releases' ? item.title : item.text}
              </div>
            </button>
          ))}
        </div>

        {/* Panel detalle */}
        <div className="dash-panel" style={{padding:'24px 28px', minHeight:300}}>
          {!selected ? (
            <div style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-4)'}}>
              <div style={{fontSize:36, marginBottom:8, opacity:0.4}}>{tabs.find(t => t.id === tab).icon}</div>
              <div style={{fontSize:14}}>Selecciona un elemento para verlo aquí</div>
            </div>
          ) : (
            <>
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14}}>
                <div style={{flex:1, minWidth:0}}>
                  {tab === 'releases' && <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-blue)', fontWeight:700, marginBottom:4}}>VERSIÓN {selected.version}</div>}
                  {tab === 'messages' && (
                    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                      <div style={{width:36, height:36, borderRadius:'50%', background:selected.fromAvatarColor || 'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0}}>
                        {(selected.from || '?').split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{selected.from}{selected.fromAdmin && <span style={{fontFamily:'var(--mono)', fontSize:8.5, padding:'1px 5px', background:'var(--ink)', color:'#fff', borderRadius:3, letterSpacing:'0.06em', marginLeft:6}}>ADMIN</span>}</div>
                        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)'}}>{new Date(selected.createdAt).toLocaleString('es-ES', {dateStyle:'medium', timeStyle:'short'})}</div>
                      </div>
                    </div>
                  )}
                  <h2 style={{margin:0, fontSize: tab === 'messages' ? 20 : 22, fontFamily:'var(--sans)', letterSpacing:'-0.01em', lineHeight:1.25}}>
                    {tab === 'messages' ? selected.subject : tab === 'releases' ? selected.title : selected.text}
                  </h2>
                </div>
                <button onClick={() => { Inbox.deleteItem(tab, selected.id); setSelected(null); setInboxState(Inbox.getAll()); if (window.Toast) window.Toast.info('Eliminado'); }}
                  title="Eliminar"
                  style={{flexShrink:0, width:32, height:32, borderRadius:8, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-3)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>
                </button>
              </div>
              <div style={{fontSize:14, lineHeight:1.6, color:'var(--ink-2)', whiteSpace:'pre-wrap'}}>
                {tab === 'messages' ? selected.body : tab === 'releases' ? selected.body : null}
              </div>
              {tab === 'notifications' && selected.link && window.PILLS && (
                <button className="btn glow" style={{marginTop:14}} onClick={() => {
                  const pill = window.PILLS.find(p => p.id === selected.link);
                  if (pill && openDetail) openDetail(pill);
                }}>Ver módulo →</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
window.InboxView = InboxView;

// ── Examen final de ruta · modal con 3 preguntas + cert al pasar ──────────
function RouteExamModal({ routeId, routeLabel, onClose, onPassed }) {
  const bank = RouteExams.bank(routeId);
  const [answers, setAnswers] = useSM({}); // {qIdx: optionIdx}
  const [submitted, setSubmitted] = useSM(false);
  const [result, setResult] = useSM(null); // { score, total, passed }

  if (!bank) {
    return (
      <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, padding:32, maxWidth:420}}>
          <h2 style={{margin:'0 0 12px'}}>Examen no disponible</h2>
          <p style={{color:'var(--ink-3)', marginBottom:18}}>Esta ruta aún no tiene examen final configurado.</p>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  const submit = () => {
    let score = 0;
    bank.questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });
    const total = bank.questions.length;
    const passed = score === total;
    setResult({ score, total, passed });
    setSubmitted(true);
    RouteExams.record(routeId, score, total, passed);
    if (passed) {
      if (window.Toast) window.Toast.success('¡Aprobado! Generando certificado…', { icon: '🎉' });
      if (window.Inbox) {
        window.Inbox.addNotification('Has superado el examen final de la ruta "' + (routeLabel || routeId) + '"', { kind:'achievement', icon:'🏆' });
      }
      if (onPassed) onPassed({ score, total });
    } else {
      if (window.Toast) window.Toast.error('Has fallado · ' + score + '/' + total + ' correctas. Repasa y vuelve a intentarlo.');
    }
  };

  const downloadCert = () => {
    var u = (window.Auth && window.Auth.currentUser()) || { name: 'Alumno', role: 'Sprinklr', team: 'Repsol' };
    const today = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>Certificado · ' + u.name + '</title>' +
'<style>@page{size:A4 landscape;margin:0}body{font-family:Manrope,system-ui,sans-serif;margin:0;padding:60px;min-height:100vh;box-sizing:border-box;background:linear-gradient(135deg,#fafbfc 0%,#f0f4f8 100%);display:flex;flex-direction:column}.frame{border:6px double #005996;padding:50px 60px;flex:1;display:flex;flex-direction:column;background:#fff}.kicker{font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#94A3B8;margin-bottom:8px}h1{font-size:38px;margin:0 0 20px;color:#0D1117}.lead{font-size:14px;color:#4A5568;max-width:560px;margin:0 0 28px;line-height:1.55}.name{font-style:italic;font-weight:700;font-size:58px;color:#005996;margin:0 0 8px;letter-spacing:-.025em}.role{font-size:16px;color:#0D1117;margin-bottom:28px}.cert-line{height:2px;background:linear-gradient(90deg,#005996,#BCD630,#8A3992,#005996);margin:24px 0}.foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;font-size:11px;color:#4A5568}.sig{font-style:italic;font-size:18px;color:#0D1117;border-top:1px solid #ccc;padding-top:6px;margin-top:18px}</style></head><body>' +
'<div class="frame"><div class="kicker">SGS|on · BeonIt × Repsol · Certificación oficial</div>' +
'<h1>Certificado de ruta · ' + (routeLabel || routeId) + '</h1>' +
'<div class="lead">Por la presente certificamos que la persona reseñada ha completado y aprobado el examen final de esta ruta dentro de la formación oficial Sprinklr del programa SOLID GROWTH para Repsol.</div>' +
'<div class="name">' + u.name + '</div>' +
'<div class="role">' + u.role + ' · ' + u.team + '</div>' +
'<div class="cert-line"></div>' +
'<div class="foot"><div><strong>Fecha</strong><br/>' + today + '</div><div><strong>Resultado</strong><br/>Aprobado · ' + (result ? result.score + '/' + result.total : '?') + '</div><div><div class="sig">BeonIt × Repsol</div><div style="font-family:monospace;font-size:9px;color:#94A3B8;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">Equipo de formación</div></div></div></div></body></html>';
    const blob = new Blob([html], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Certificado-' + (routeId || 'ruta') + '-' + (u.name || '').replace(/\s+/g,'-') + '.html';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  };

  const allAnswered = bank.questions.every((_, i) => answers[i] !== undefined);

  return (
    <div onClick={!submitted ? onClose : null} style={{position:'fixed', inset:0, background:'rgba(13,17,23,0.55)', backdropFilter:'blur(4px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'var(--paper)', borderRadius:14, width:'min(620px, 96vw)', maxHeight:'90vh', overflowY:'auto', padding:32, boxShadow:'0 30px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--bn-blue)', fontWeight:700}}>EXAMEN FINAL</span>
          {submitted && result && (
            <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'3px 10px', borderRadius:999, background: result.passed ? 'var(--bn-lime)' : 'rgba(235,0,41,0.12)', color: result.passed ? 'var(--ink)' : 'var(--repsol-red)', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>
              {result.passed ? '✓ Aprobado' : '✗ No aprobado'}
            </span>
          )}
        </div>
        <h2 style={{margin:'0 0 16px', fontSize:22, fontFamily:'var(--sans)', letterSpacing:'-0.01em'}}>{bank.title}</h2>
        {!submitted && <p style={{fontSize:13.5, color:'var(--ink-3)', marginBottom:20}}>Responde las 3 preguntas. Necesitas <strong>todas correctas</strong> para superar el examen y descargar tu certificado oficial.</p>}

        {bank.questions.map((q, qi) => {
          const userAns = answers[qi];
          const isCorrect = submitted && userAns === q.answer;
          return (
            <div key={qi} style={{marginBottom:20, padding:'16px 18px', border:'1px solid var(--line)', borderRadius:12, background: submitted ? (isCorrect ? 'rgba(188,214,48,0.08)' : 'rgba(235,0,41,0.06)') : 'var(--paper-2)'}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:12}}>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', fontWeight:700, marginTop:3}}>P{qi + 1}</span>
                <div style={{flex:1, fontSize:14, fontWeight:600, color:'var(--ink)', lineHeight:1.4}}>{q.q}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {q.options.map((opt, oi) => {
                  const isUserChoice = userAns === oi;
                  const showCorrect = submitted && oi === q.answer;
                  const showWrong = submitted && isUserChoice && oi !== q.answer;
                  return (
                    <button key={oi} disabled={submitted} onClick={() => setAnswers(a => ({...a, [qi]: oi}))}
                      style={{display:'flex', alignItems:'center', gap:10, padding:'9px 12px', border:'1px solid ' + (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : isUserChoice ? 'var(--bn-blue)' : 'var(--line)'), borderRadius:8, background: showCorrect ? 'rgba(188,214,48,0.15)' : showWrong ? 'rgba(235,0,41,0.08)' : isUserChoice ? 'rgba(0,114,190,0.06)' : 'var(--paper)', cursor: submitted ? 'default' : 'pointer', textAlign:'left', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)'}}>
                      <span style={{width:18, height:18, borderRadius:'50%', border:'2px solid ' + (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : isUserChoice ? 'var(--bn-blue)' : 'var(--line)'), background: (isUserChoice || showCorrect) ? (showCorrect ? 'var(--bn-lime)' : showWrong ? 'var(--repsol-red)' : 'var(--bn-blue)') : 'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700}}>
                        {showCorrect ? '✓' : showWrong ? '✗' : isUserChoice ? '●' : ''}
                      </span>
                      <span style={{flex:1}}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!submitted ? (
          <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
            <button className="btn ghost" onClick={onClose}>Cancelar</button>
            <button className="btn glow" onClick={submit} disabled={!allAnswered} style={{opacity: allAnswered ? 1 : 0.5}}>Enviar respuestas →</button>
          </div>
        ) : (
          <div style={{marginTop:18, padding:'18px 20px', background: result.passed ? 'rgba(188,214,48,0.1)' : 'var(--paper-2)', borderRadius:12, border:'1px solid ' + (result.passed ? 'var(--bn-lime)' : 'var(--line)')}}>
            <div style={{fontSize:14, fontWeight:600, marginBottom:6, color:'var(--ink)'}}>
              {result.passed ? '🎉 Has aprobado con ' + result.score + '/' + result.total : 'Has obtenido ' + result.score + '/' + result.total + ' · necesitas las 3 correctas para aprobar'}
            </div>
            <div style={{fontSize:12.5, color:'var(--ink-3)', marginBottom:14, lineHeight:1.5}}>
              {result.passed ? 'Tu certificado oficial está listo para descargar.' : 'Repasa el material y vuelve a intentarlo cuando quieras.'}
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              {!result.passed && <button className="btn ghost" onClick={() => { setAnswers({}); setSubmitted(false); setResult(null); }}>Reintentar</button>}
              <button className="btn ghost" onClick={onClose}>Cerrar</button>
              {result.passed && <button className="btn glow" onClick={downloadCert}>↓ Descargar certificado</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.RouteExamModal = RouteExamModal;

// ── Video submission · entrega de examen práctico por módulo ───────────────
function VideoSubmissionForm({ pillId, pillTitle, onClose }) {
  const [file, setFile] = useSM(null);
  const [duration, setDuration] = useSM(0);
  const [thumb, setThumb] = useSM(null);
  const [error, setError] = useSM('');
  const [submitting, setSubmitting] = useSM(false);
  const [existing, setExisting] = useSM(null);

  useEM(() => {
    var u = window.Auth && window.Auth.currentUser();
    if (u && window.Submissions) {
      setExisting(window.Submissions.getForUserAndPill(u.id, pillId));
    }
    const refresh = () => {
      var u2 = window.Auth && window.Auth.currentUser();
      if (u2) setExisting(window.Submissions.getForUserAndPill(u2.id, pillId));
    };
    window.addEventListener('submissions-changed', refresh);
    return () => window.removeEventListener('submissions-changed', refresh);
  }, [pillId]);

  const onPick = (e) => {
    setError('');
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('El archivo debe ser un vídeo (.mp4, .mov, .webm…)'); return; }
    if (f.size > 200 * 1024 * 1024) { setError('Vídeo demasiado grande · máximo 200MB'); return; }

    setFile(f);

    // Extraer duración + thumbnail del primer frame
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.src = URL.createObjectURL(f);
    v.onloadedmetadata = () => {
      const sec = Math.round(v.duration);
      setDuration(sec);
      if (sec > 600) {
        setError('Vídeo demasiado largo · ' + Math.floor(sec/60) + ':' + (sec%60).toString().padStart(2,'0') + ' · máximo 10:00');
      }
      v.currentTime = Math.min(2, sec / 4);
    };
    v.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = (240 / v.videoWidth) * v.videoHeight || 135;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        setThumb(canvas.toDataURL('image/jpeg', 0.7));
      } catch(e) {}
      URL.revokeObjectURL(v.src);
    };
  };

  const submit = async () => {
    if (!file || error) return;
    setSubmitting(true);
    try {
      const sub = await Promise.resolve(Submissions.submit({
        pillId, pillTitle,
        file, // necesario para el upload a Supabase Storage cuando está activo
        fileName: file.name,
        fileSize: file.size,
        durationSec: duration,
        thumbDataUrl: thumb,
      }));
      setExisting(sub);
      if (window.Toast) window.Toast.success('Entrega enviada · pendiente de revisión por admin', { icon: '↑' });
      if (onClose) setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const fmtSize = (b) => b < 1024*1024 ? (b/1024).toFixed(0) + ' KB' : (b/1024/1024).toFixed(1) + ' MB';
  const fmtDur = (s) => Math.floor(s/60) + ':' + (s%60).toString().padStart(2,'0');

  if (existing) {
    const statusColor = { pending:'var(--bn-orange)', approved:'var(--bn-lime)', rejected:'var(--repsol-red)' }[existing.status];
    const statusLabel = { pending:'Pendiente de revisión', approved:'Aprobado', rejected:'Rechazado' }[existing.status];
    return (
      <div style={{padding:'18px 20px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-4)'}}>Entrega práctica</span>
          <span style={{fontFamily:'var(--mono)', fontSize:10, padding:'3px 10px', borderRadius:999, background: statusColor, color: existing.status === 'approved' ? 'var(--ink)' : '#fff', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase'}}>{statusLabel}</span>
        </div>
        <div style={{display:'flex', gap:14, alignItems:'flex-start'}}>
          {existing.thumbDataUrl && <img src={existing.thumbDataUrl} style={{width:120, borderRadius:8, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{existing.fileName}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)'}}>{fmtDur(existing.durationSec)} · {fmtSize(existing.fileSize)}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10.5, color:'var(--ink-4)', marginTop:6}}>Enviado: {new Date(existing.submittedAt).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'})}</div>
            {existing.feedback && (
              <div style={{marginTop:10, padding:'8px 10px', background: existing.status === 'approved' ? 'rgba(188,214,48,0.1)' : 'rgba(235,0,41,0.06)', borderLeft:'3px solid ' + statusColor, borderRadius:'0 6px 6px 0', fontSize:12.5, color:'var(--ink-2)', lineHeight:1.5}}>
                <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:3}}>Feedback {existing.reviewedBy ? '· ' + existing.reviewedBy.name : ''}</div>
                {existing.feedback}
              </div>
            )}
          </div>
        </div>
        {existing.status !== 'pending' && (
          <button className="btn ghost" style={{marginTop:14}} onClick={() => { Submissions.remove(existing.id); setExisting(null); setFile(null); setThumb(null); setDuration(0); }}>↺ Reenviar entrega</button>
        )}
      </div>
    );
  }

  return (
    <div style={{padding:'18px 20px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
        <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--bn-purple)', fontWeight:700}}>Examen práctico · entrega obligatoria</span>
      </div>
      <div style={{fontSize:13.5, color:'var(--ink-2)', marginBottom:14, lineHeight:1.55}}>
        Para superar este módulo, sube un vídeo donde demuestres haber realizado <strong>algo real en Sprinklr</strong> aplicando lo aprendido. Los admins lo revisarán y darán feedback.
      </div>
      <div style={{fontSize:12, color:'var(--ink-4)', marginBottom:14, fontFamily:'var(--mono)'}}>
        Requisitos · Vídeo de máximo <strong>10:00</strong> · MP4/MOV/WEBM · 200 MB max
      </div>

      <label style={{display:'block', padding:'24px', border:'2px dashed var(--line)', borderRadius:10, background:'var(--paper)', cursor:'pointer', textAlign:'center', transition:'border-color .14s'}}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--bn-blue)'} onMouseLeave={e => e.currentTarget.style.borderColor='var(--line)'}>
        <div style={{fontSize:24, marginBottom:6, opacity:0.5}}>📹</div>
        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:3}}>{file ? 'Cambiar vídeo' : 'Selecciona o arrastra tu vídeo'}</div>
        <div style={{fontSize:11, color:'var(--ink-4)'}}>Click para abrir el explorador</div>
        <input type="file" accept="video/*" onChange={onPick} style={{display:'none'}}/>
      </label>

      {file && (
        <div style={{marginTop:14, display:'flex', gap:12, alignItems:'flex-start', padding:'10px 12px', background:'var(--paper)', borderRadius:8, border:'1px solid var(--line)'}}>
          {thumb && <img src={thumb} style={{width:90, borderRadius:6, flexShrink:0, border:'1px solid var(--line)'}} alt=""/>}
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{file.name}</div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, color: error ? 'var(--repsol-red)' : 'var(--ink-4)', marginTop:3}}>{duration > 0 ? fmtDur(duration) : 'analizando…'} · {fmtSize(file.size)}</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{marginTop:12, padding:'9px 12px', background:'rgba(235,0,41,0.08)', border:'1px solid rgba(235,0,41,0.25)', borderRadius:8, color:'var(--repsol-red)', fontSize:12.5}}>{error}</div>
      )}

      <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:14}}>
        {onClose && <button className="btn ghost" onClick={onClose}>Cancelar</button>}
        <button className="btn glow" onClick={submit} disabled={!file || !!error || submitting} style={{opacity: !file || error || submitting ? 0.5 : 1}}>
          {submitting ? 'Enviando…' : 'Enviar entrega →'}
        </button>
      </div>
    </div>
  );
}
window.VideoSubmissionForm = VideoSubmissionForm;

window.LoginScreen = LoginScreen;
window.AdminPanel = AdminPanel;
window.PrototypeApp = App;
