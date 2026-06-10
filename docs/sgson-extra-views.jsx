/* ============================================================
   SolidStream · Vistas adicionales rediseñadas
   BrowseView, RutasView, MyPathView, ChannelsView, ProfileView,
   SettingsView, AdminView, InboxView, SavedView · todas con tokens
   del rediseño cinematic (sgson.css)
   ============================================================ */

const { useState: useEV2, useEffect: useEE2 } = React;

// Helper común · slug categoría
const _slug = (s) => {
  const x = String(s || '').toLowerCase().replace(/\s+/g, '-');
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

/* ============================================================
   PageShell · contenedor base para todas las vistas
   Aplica padding-top 80 para que no choque con TopNav fixed
   ============================================================ */
function PageShell({ eyebrow, title, sub, actions, children, narrow }) {
  return (
    <div style={{
      padding: '90px 64px 80px',
      maxWidth: narrow ? 1080 : 1400,
      margin: '0 auto',
      color: 'var(--fg)',
      background: 'var(--bg-canvas)',
      minHeight: '100vh',
    }} className="ssg-page">
      <header style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          {eyebrow && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)',
              marginBottom: 12,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
              {eyebrow}
            </div>
          )}
          <h1 style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(34px, 4vw, 48px)',
            letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, color: 'var(--fg)',
          }}>{title}</h1>
          {sub && <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18,
            color: 'var(--fg-muted)', marginTop: 8, marginBottom: 0,
          }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
      </header>
      {children}
    </div>
  );
}

/* ============================================================
   BrowseView · catálogo con filtro + grid de cards
   ============================================================ */
function BrowseView({ openDetail }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const pills = (D && D.PILLS) || [];
  const ALL_KEY = T('browse.all');
  const allCats = [ALL_KEY, ...Array.from(new Set(pills.map(p => p.category))).filter(Boolean)];
  const [cat, setCat] = useEV2(ALL_KEY);
  const filtered = cat === ALL_KEY ? pills : pills.filter(p => p.category === cat);

  return (
    <PageShell
      eyebrow={T('browse.eyebrow')}
      title={<>{T('browse.title')}</>}
      sub={`${pills.length} ${T('browse.sub')}`}>
      {/* Filtro categoría */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 32,
        padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-2)', width: 'fit-content',
      }}>
        {allCats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            background: c === cat ? 'var(--fg)' : 'transparent', color: c === cat ? 'var(--bg-canvas)' : 'var(--fg-muted)',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', transition: 'all .15s',
          }}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16,
      }}>
        {filtered.map(p => {
          const slug = _slug(p.category);
          return (
            <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
              <div className={`card-cover cat-${slug}`}/>
              {p.yt && <img src={`https://img.youtube.com/vi/${p.yt}/hqdefault.jpg`} alt="" style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover'}} onError={e => { e.currentTarget.style.display='none'; }}/>}
              <div className="card-grad"/>
              <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
              <div className="card-body">
                <h3 className="card-title">{p.title}</h3>
                <div className="card-meta">
                  <span>{p.duration}</span>
                  <span className="sep">·</span>
                  <span>{p.level}</span>
                </div>
              </div>
              {p.progress > 0 && p.progress < 1 && (
                <div className="card-progress"><div className="fill" style={{width: `${Math.round(p.progress*100)}%`}}/></div>
              )}
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ============================================================
   RutasView · 6 grandes path cards estilo featured
   ============================================================ */
function RutasView({ setView, openPath }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const paths = (D && D.LEARNING_PATHS) || [];
  const go = (pathId) => { if (openPath) openPath(pathId); else setView('path'); };
  // Re-render cuando cambien enrollments/bookmarks · para que el badge
  // "INSCRITO" aparezca al instante tras pulsar el CTA.
  const [, setEnrollTick] = useEV2(0);
  useEE2(() => {
    const r = () => setEnrollTick(t => t + 1);
    window.addEventListener('enrollments-changed', r);
    window.addEventListener('bookmarks-changed', r);
    return () => {
      window.removeEventListener('enrollments-changed', r);
      window.removeEventListener('bookmarks-changed', r);
    };
  }, []);

  // Filtro por categoría · chips arriba del grid. "Todos" por defecto.
  const [activeCat, setActiveCat] = useEV2('Todos');
  // Filtro por marca · chips independientes encima de las categorías. Solo
  // aparecen si hay 2+ marcas distintas en el catálogo (sub-catálogos activos).
  const [activeBrand, setActiveBrand] = useEV2('Todas');
  // Búsqueda libre · filtra por title/desc/teacher/badge/brand. Escala mejor
  // que las chips cuando el catálogo crece (50+ cursos).
  const [query, setQuery] = useEV2('');
  // Hash de contenido (badges + brands) · `paths.length` no detectaba edits
  // que no cambiaban el count (admin asigna marca a un curso · brand chip
  // no aparecía hasta recargar; mismo problema al cambiar tenant con igual nº).
  const _pathsContentKey = paths.map(p => (p.badge || '') + '|' + (p.brand || '')).join('·');
  const categories = React.useMemo(() => {
    const set = new Set();
    paths.forEach(p => { if (p.badge) set.add(p.badge); });
    return ['Todos', ...Array.from(set).sort()];
  }, [_pathsContentKey]);
  const brands = React.useMemo(() => {
    const set = new Set();
    paths.forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set).sort();
  }, [_pathsContentKey]);
  const q = query.trim().toLowerCase();
  const _matchQuery = (p) => {
    if (!q) return true;
    const hay = String((p.title || '') + ' ' + (p.desc || '') + ' ' + (p.teacher || '') + ' ' + (p.badge || '') + ' ' + (p.brand || '')).toLowerCase();
    return hay.indexOf(q) !== -1;
  };
  const _matchCat = (p) => activeCat === 'Todos' || p.badge === activeCat;
  // Set filtrado por categoría + búsqueda, SIN aplicar el filtro de marca ·
  // base para los contadores de los chips de marca (que deben reflejar
  // categoría/búsqueda activas pero no la marca seleccionada).
  const byCatNoBrand = paths.filter(p => _matchCat(p) && _matchQuery(p));
  // Set final · añade el filtro de marca seleccionado.
  const filteredPaths = activeBrand === 'Todas'
    ? byCatNoBrand
    : byCatNoBrand.filter(p => p.brand === activeBrand);

  // En modo demo el bloque de Competencias se renombra a "Catálogo" y la
  // subcabecera pasa a ser un CTA simple: "Fórmate en tu contenido".
  const _dm = window.DemoMode;
  const _label = _dm ? _dm.label : (_, f) => f;
  const _flag  = _dm ? _dm.flag  : () => undefined;
  const demoActive = _dm && _dm.isActive && _dm.isActive();
  const eyebrow = demoActive ? _label('catalog_label', 'Catálogo') : T('rutas.eyebrow');
  const title   = demoActive
    ? _label('catalog_subheader', 'Fórmate en tu contenido')
    : <>{T('rutas.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('rutas.titleEm')}</em></>;
  const sub     = demoActive ? '' : T('rutas.sub');

  // Autotest banner · si el workspace tiene `settings.autotest_url`, mostramos
  // un banner discreto arriba del catálogo invitando al test (15 min). El
  // banner se puede ocultar y queda persistido en localStorage por workspace.
  const _wsAuto = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
  const _autoUrl = (_wsAuto.settings && _wsAuto.settings.autotest_url) || null;
  const _autoKey = 'sgson:autotest-banner:' + (_wsAuto.slug || 'default');
  const [autoHide, setAutoHide] = useEV2(() => {
    try { return localStorage.getItem(_autoKey) === 'hidden'; } catch (e) { return false; }
  });
  const dismissAuto = () => {
    setAutoHide(true);
    try { localStorage.setItem(_autoKey, 'hidden'); } catch (e) {}
  };

  // Sub-catálogos por marca · si al menos un path tiene `brand` Y el user
  // está viendo "Todas", dividimos el grid en secciones. Al filtrar por marca
  // específica, el grid es plano (no tiene sentido un grupo de 1).
  const _hasBrands = filteredPaths.some(p => p.brand);
  const _brandGroups = (() => {
    if (!_hasBrands) return null;
    if (activeBrand !== 'Todas') return null;
    const groups = new Map();
    filteredPaths.forEach(p => {
      const b = p.brand || 'Catálogo general';
      if (!groups.has(b)) groups.set(b, []);
      groups.get(b).push(p);
    });
    return Array.from(groups.entries()); // [[brandName, paths[]], ...]
  })();

  return (
    <PageShell
      eyebrow={eyebrow}
      title={title}
      sub={sub}>

      {/* Autotest banner · CTA al test externo si está configurado */}
      {_autoUrl && !autoHide && (
        <div style={{
          marginBottom: 24, padding:'14px 18px',
          background:'linear-gradient(90deg, rgba(89,71,255,0.14), rgba(89,71,255,0.06))',
          border:'1px solid rgba(89,71,255,0.28)', borderRadius:12,
          display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
        }}>
          <span style={{ fontSize: 22 }}>🧭</span>
          <div style={{ flex:1, minWidth: 240 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--fg)' }}>¿No sabes por dónde empezar?</div>
            <div style={{ fontSize:12.5, color:'var(--fg-muted)', marginTop:2 }}>
              Haz el test de autodiagnóstico (15 min) y te recomendamos el itinerario que mejor encaja contigo.
            </div>
          </div>
          <a href={_autoUrl} target="_blank" rel="noopener noreferrer" style={{
            padding:'9px 16px', background:'var(--accent)', color:'#fff', textDecoration:'none',
            borderRadius:8, fontFamily:'var(--font-sans)', fontWeight:700, fontSize:12.5,
          }}>Empezar test</a>
          <button onClick={dismissAuto} title="Ocultar" style={{
            background:'transparent', border:'none', color:'var(--fg-muted)', cursor:'pointer',
            fontSize:18, lineHeight:1, padding:'4px 8px',
          }}>×</button>
        </div>
      )}

      {/* Filtro de marca · chip strip cuando hay 2+ marcas (sub-catálogos) */}
      {brands.length >= 2 && (
        <div style={{
          display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:14,
        }}>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-dim)',
            letterSpacing:'0.1em', textTransform:'uppercase', marginRight:4,
          }}>Marca</span>
          {['Todas', ...brands].map(b => {
            const active = b === activeBrand;
            // Cuenta contra el set filtrado por categoría+búsqueda (byCat ya las
            // aplica salvo el propio filtro de marca) · refleja lo que se vería.
            const count = b === 'Todas'
              ? byCatNoBrand.length
              : byCatNoBrand.filter(x => x.brand === b).length;
            return (
              <button key={b} onClick={() => setActiveBrand(b)} style={{
                padding:'6px 12px', fontFamily:'var(--font-sans)', fontSize:12, fontWeight:700,
                background: active ? 'var(--fg)' : 'transparent',
                color:      active ? 'var(--bg-canvas)' : 'var(--fg-muted)',
                border:'1px solid', borderColor: active ? 'var(--fg)' : 'var(--line)',
                borderRadius:999, cursor:'pointer', transition:'all .15s',
              }}>
                {b} <span style={{ opacity: 0.55, marginLeft: 4, fontWeight: 500 }}>· {count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Búsqueda libre · siempre visible cuando hay ≥ 6 paths */}
      {paths.length >= 6 && (
        <div style={{ marginBottom: 16, position:'relative', maxWidth: 420 }}>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar curso, profesor, marca…"
            style={{
              width:'100%', padding:'10px 14px 10px 38px',
              background:'var(--bg-surface)', border:'1px solid var(--line)',
              borderRadius:'var(--r-2, 10px)', color:'var(--fg)',
              fontFamily:'var(--font-sans)', fontSize: 13.5, boxSizing:'border-box',
              outline:'none', transition:'border-color .15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
          <span style={{
            position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)',
            color:'var(--fg-muted)', display:'inline-flex', pointerEvents:'none',
          }}>{window.Ico ? React.createElement(window.Ico, { name:'search', size:16 }) : null}</span>
          {query && (
            <button onClick={() => setQuery('')} title="Limpiar" style={{
              position:'absolute', right: 8, top:'50%', transform:'translateY(-50%)',
              background:'transparent', border:'none', color:'var(--fg-muted)',
              fontSize: 18, lineHeight: 1, cursor:'pointer', padding:'4px 8px',
            }}>×</button>
          )}
        </div>
      )}

      {/* Category chips · solo si hay más de 1 categoría distinta.
          _catBase · set filtrado por marca+búsqueda (sin la propia categoría) ·
          base para los contadores · refleja lo que se vería al pulsar el chip. */}
      {categories.length > 2 && (() => {
        const _catBase = paths.filter(p =>
          (activeBrand === 'Todas' || p.brand === activeBrand) && _matchQuery(p));
        return (
        <div style={{
          display:'flex', gap:8, flexWrap:'wrap', marginBottom:24,
          padding:'6px', background:'var(--bg-surface)', border:'1px solid var(--line)',
          borderRadius:'var(--r-2, 12px)', width:'fit-content', maxWidth:'100%',
        }}>
          {categories.map(c => {
            const active = c === activeCat;
            const count = c === 'Todos' ? _catBase.length : _catBase.filter(p => p.badge === c).length;
            return (
              <button key={c} onClick={() => setActiveCat(c)} style={{
                padding:'7px 14px', fontFamily:'var(--font-sans)', fontSize:12.5, fontWeight:700,
                background: active ? 'var(--accent)' : 'transparent',
                color:    active ? '#fff' : 'var(--fg-muted)',
                border:'none', borderRadius:'var(--r-1, 8px)', cursor:'pointer',
                transition:'all .15s',
              }}>
                {c} <span style={{opacity:0.6, marginLeft:4, fontWeight:500}}>· {count}</span>
              </button>
            );
          })}
        </div>
        );
      })()}

      {/* Empty state · búsqueda sin resultados */}
      {q && filteredPaths.length === 0 && (
        <div style={{
          padding:'48px 24px', textAlign:'center', background:'var(--bg-surface)',
          border:'1px dashed var(--line)', borderRadius:12, marginTop: 8,
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>
            Sin resultados para "{query}"
          </div>
          <div style={{ fontSize: 12.5, color:'var(--fg-muted)' }}>
            Prueba con otra palabra o limpia el filtro.
          </div>
        </div>
      )}

      {(() => {
        if (q && filteredPaths.length === 0) return null;
        const renderCard = (p, idx) => {
          const pct = Math.round((p.progress || 0) * 100);
          // En demo · ~2/3 cerrados por hash determinista. Mantenemos el
          // primer path por posición desbloqueado para que la demo se
          // sienta accesible.
          const lockEnabled = demoActive && _flag('lock_unassigned_courses') === true;
          const seed = parseInt(String(p.id || '').replace(/\D/g, ''), 10) || idx;
          const unlockedList = (_dm && _dm.unlocked) ? _dm.unlocked() : [];
          const isUnlockedById = Array.isArray(unlockedList) && unlockedList.indexOf(p.id) !== -1;
          const isLocked = lockEnabled && !(p.progress > 0) && !isUnlockedById && idx > 0 && (seed % 3) !== 0;
          const levelBadges = (_dm && _dm.flag('level_badges')) || ['Básico','Intermedio','Experto'];
          const levelTxt = demoActive ? levelBadges[seed % levelBadges.length] : null;
          const pathLabelSingular = demoActive ? _label('path_label', 'Curso').toUpperCase() : 'RUTA';
          const enrolled = window.Enrollments && window.Enrollments.has && window.Enrollments.has(p.id);
          const startLabel = isLocked ? '🔒 Bloqueado'
                           : p.isCompleted ? '✓ Completada'
                           : pct > 0 ? 'Continuar · ' + pct + '%'
                           : (enrolled ? 'Empezar curso'
                              : (demoActive ? 'Inscribirse' : T('rutas.start')));
          const handleClick = () => {
            if (isLocked) {
              if (window.Toast) window.Toast.info('🔒 Curso bloqueado · disponible próximamente');
              return;
            }
            // Al abrir el curso lo inscribimos (si no lo estaba) · así "Mi Lista"
            // refleja TODO lo que el user abre/empieza, sin importar el progreso.
            // Toast solo la primera vez para no ser repetitivo.
            if (!enrolled && window.Enrollments) {
              window.Enrollments.add(p.id);
              if (window.Toast) window.Toast.success('Inscrito en ' + p.title, { icon: '✓' });
            }
            go(p.id);
          };
          return (
          <article key={p.id} className={`card card-path${isLocked ? ' is-locked' : ''}`} onClick={handleClick} style={{ cursor: isLocked ? 'not-allowed' : 'pointer', aspectRatio: '4/5' }}>
            {/* Cover · posterUrl si design lo subió; si no, SVG generado
                inline con accentHex + título + nivel + watermark BEONIT. */}
            <img
              src={p.posterUrl || (window.coursePosterSVG && window.coursePosterSVG(p.title, p.accentHex, levelTxt))}
              alt={p.title || ''} loading="lazy"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
                       filter: isLocked ? 'grayscale(0.6) brightness(0.55)' : 'none' }}
              onError={e => { e.currentTarget.style.display='none'; }}/>
            <div className="card-grad"/>
            <span className="card-pill-num" style={{ top: 16, left: 16 }}>
              {pathLabelSingular} · {p.completedCount || 0}/{p.totalCount || p.pills} pills{!(_dm && _dm.flag('hide_durations') === true) ? ` · ${p.hours}` : ''}
            </span>
            {p.isCompleted && !isLocked && (
              <span style={{ position:'absolute', top:16, right:16, padding:'4px 10px', background:'var(--ok, #1E9E5A)', color:'#fff',
                fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, letterSpacing:'0.08em', borderRadius:999 }}>
                ✓ COMPLETADA
              </span>
            )}
            {enrolled && !p.isCompleted && !isLocked && pct === 0 && (
              <span style={{ position:'absolute', top:16, right:16, padding:'4px 10px', background:'rgba(89,71,255,0.92)', color:'#fff',
                fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, letterSpacing:'0.08em', borderRadius:999 }}>
                ✓ INSCRITO
              </span>
            )}
            {isLocked && (
              <span style={{ position:'absolute', top:16, right:16, padding:'4px 10px', background:'rgba(0,0,0,0.72)', color:'#fff',
                fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:'0.06em', borderRadius:999 }}>
                🔒 Bloqueado
              </span>
            )}
            {levelTxt && !isLocked && !p.isCompleted && (
              <span style={{ position:'absolute', top:16, right:16, padding:'4px 10px', background:'rgba(0,114,190,0.92)', color:'#fff',
                fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:'0.06em', borderRadius:999 }}>
                Nivel {levelTxt}
              </span>
            )}
            <div className="card-body" style={{ left: 20, right: 20, bottom: 18 }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
                fontSize: 28, color: 'var(--fg)', margin: 0, marginBottom: 8, lineHeight: 1.1,
              }}>{p.title}</h3>
              {/* Descripción · competencia · nivel · #pills · director del programa */}
              <p style={{ fontSize: 12.5, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>
                {(() => {
                  const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
                  const director = (ws.settings && ws.settings.program_director) || null;
                  const totalPills = p.totalCount || p.pills || 0;
                  const parts = [];
                  if (p.badge) parts.push(p.badge);
                  if (levelTxt) parts.push('Nivel ' + levelTxt);
                  if (totalPills) parts.push(totalPills + ' pills');
                  if (director) parts.push('Dirige ' + director);
                  return parts.join(' · ');
                })()}
              </p>
              {pct > 0 && pct < 100 && (
                <div style={{ height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden', marginTop:10 }}>
                  <div style={{ height:'100%', width:pct+'%', background:'var(--accent)', transition:'width .25s' }}/>
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
                <button onClick={(e) => { e.stopPropagation(); handleClick(); }} disabled={isLocked} style={{
                  padding: '8px 14px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700,
                  background: isLocked ? 'rgba(0,0,0,0.5)' : (p.isCompleted ? 'var(--ok, #1E9E5A)' : 'var(--accent)'),
                  color: '#fff', border: 'none', borderRadius: 'var(--r-1)',
                  cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.7 : 1,
                }}>{startLabel}</button>
                {/* En demo · botón de favorito en cards de curso (per spec
                    Mi Cursos agrega favoritos · necesita poder marcarlos) */}
                {demoActive && !isLocked && (() => {
                  const saved = window.Bookmarks && window.Bookmarks.has && window.Bookmarks.has(p.id);
                  return (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (window.Bookmarks) {
                        const isNow = window.Bookmarks.toggle(p.id);
                        if (window.Toast) window.Toast[isNow ? 'success' : 'info'](isNow ? 'Curso añadido a Mi Lista' : 'Curso quitado de Mi Lista', { icon: isNow ? '⭐' : '○' });
                      }
                    }}
                    title={saved ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    style={{
                      padding:'8px 12px', fontFamily:'var(--font-sans)', fontSize:14, fontWeight:700,
                      background: saved ? 'var(--accent)' : 'rgba(255,255,255,0.12)', color:'#fff',
                      border: saved ? 'none' : '1px solid rgba(255,255,255,0.2)', borderRadius:'var(--r-1)',
                      cursor:'pointer', lineHeight:1,
                    }}>{saved ? '★' : '☆'}</button>
                  );
                })()}
                {p.isCompleted && window.Certificates && !isLocked && (
                  <button onClick={(e) => {
                    e.stopPropagation();
                    const cert = window.Certificates.get(p._id || p.id);
                    if (cert) {
                      window.Certificates.download(cert);
                    } else if (window.Toast) {
                      window.Toast.info('Generando certificado…');
                      window.Certificates.create({ id: p._id || p.id, title: p.title }).then(c => {
                        if (c) window.Certificates.download(c);
                      });
                    }
                  }} style={{
                    padding: '8px 14px', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700,
                    background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
                  }}>🏆 Certificado</button>
                )}
              </div>
            </div>
          </article>
        );};

        if (!_brandGroups) {
          return (
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20,
            }}>
              {filteredPaths.map((p, idx) => renderCard(p, idx))}
            </div>
          );
        }

        // Brand-grouped · una sección por marca con header tipo "sub-catálogo".
        // El índice se calcula GLOBAL (posición en filteredPaths), no local al
        // grupo · así el candado por posición (idx > 0) deja desbloqueado solo
        // el primer curso del catálogo, no el primero de cada marca.
        const _globalIdx = new Map();
        filteredPaths.forEach((p, i) => { _globalIdx.set(p.id, i); });
        return _brandGroups.map(([brandName, brandPaths]) => (
          <section key={brandName} style={{ marginBottom: 36 }}>
            <header style={{
              display:'flex', alignItems:'baseline', gap:10, marginBottom:14,
              paddingBottom:8, borderBottom:'1px solid var(--line)',
            }}>
              <h2 style={{
                margin:0, fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400,
                fontSize:22, color:'var(--fg)', letterSpacing:'-0.01em',
              }}>{brandName}</h2>
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-dim)',
                letterSpacing:'0.08em', textTransform:'uppercase',
              }}>{brandPaths.length} {brandPaths.length === 1 ? 'curso' : 'cursos'}</span>
            </header>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20,
            }}>
              {brandPaths.map(p => renderCard(p, _globalIdx.get(p.id)))}
            </div>
          </section>
        ));
      })()}
    </PageShell>
  );
}

/* ============================================================
   MyPathView · progreso del usuario + próximas pills
   ============================================================ */
function MyPathView({ openDetail, setView, pathId, openPath }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const [showExam, setShowExam] = useEV2(false);
  // Re-render cuando SGS_DATA o bookmarks cambien (cubre boot async)
  const [, setRefreshTick] = useEV2(0);
  useEE2(() => {
    const r = () => setRefreshTick(t => t + 1);
    window.addEventListener('sgs-data-ready', r);
    window.addEventListener('bookmarks-changed', r);
    window.addEventListener('enrollments-changed', r);
    window.addEventListener('pills-changed', r);
    window.addEventListener('paths-changed', r);
    return () => {
      window.removeEventListener('sgs-data-ready', r);
      window.removeEventListener('bookmarks-changed', r);
      window.removeEventListener('enrollments-changed', r);
      window.removeEventListener('pills-changed', r);
      window.removeEventListener('paths-changed', r);
    };
  }, []);
  const D = window.SGS_DATA;
  const ALL_PILLS = (D && D.PILLS) || [];
  const PATHS = (D && D.LEARNING_PATHS) || [];
  const USER = (D && D.USER) || {};

  // Si llegamos con un pathId concreto, filtramos las pills de esa ruta. Si no, usamos todas.
  const path = pathId ? PATHS.find(p => p.id === pathId) : null;
  const pathPillIds = path && Array.isArray(path.pillIds) ? path.pillIds : (path && Array.isArray(path.pills) ? path.pills : null);
  // _isDemo · workspace de demo + DemoMode runtime · antes `/demo/i.test(href)`
  // hacía match con `?ws=demo` y sembraba progreso falso a users reales.
  const _isDemoURL = !!(typeof window !== 'undefined' && window.isDemoWorkspace && window.isDemoWorkspace());
  const _isDemo = _isDemoURL || (window.DemoMode && window.DemoMode.isActive && window.DemoMode.isActive());
  // En demo · "Mi Lista" agrega asignados + favoritos + inscritos (per spec).
  // Filtramos a las pills que tienen progreso > 0 (asignadas/en curso) o
  // están bookmarkadas (favoritas/inscritas). Bookmarks es nuestro modelo
  // de "Add to my list" + "Favorito" actualmente unificado.
  let PILLS;
  if (pathPillIds && pathPillIds.length) {
    PILLS = ALL_PILLS.filter(p => pathPillIds.includes(p.id));
  } else if (_isDemo && !path) {
    const Bm = window.Bookmarks;
    PILLS = ALL_PILLS.filter(p => (p.progress > 0) || (Bm && Bm.has && Bm.has(p.id)));
  } else {
    PILLS = ALL_PILLS;
  }

  let inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1);
  const completed = PILLS.filter(p => p.progress >= 1);
  let next = PILLS.filter(p => p.progress === 0).slice(0, 6);

  // En demo · si las secciones quedan vacías (Julio nuevo sin progreso
  // ni bookmarks), sembramos pills de muestra para que se vea contenido.
  // Sigue formándote → 2 pills de Tendencias como si estuvieran en curso.
  // Pills inscritas    → 4 pills de otras categorías.
  // Sembrado de datos de muestra · SOLO para la URL demo de HdR · garantiza
  // que la presentación al cliente se vea poblada aunque Julio no haya
  // bookmarkado nada. Para users reales (non-admin en cualquier otro
  // workspace) NUNCA mostramos datos falsos · empty state es la verdad.
  if (_isDemoURL && !path) {
    if (inProgress.length === 0) {
      let sample = ALL_PILLS.filter(p => /tendencias?/i.test(String(p.category || '')) || /^tendencia-/i.test(String(p.id || ''))).slice(0, 2);
      if (sample.length === 0) sample = ALL_PILLS.slice(0, 2);
      inProgress = sample.map(p => Object.assign({}, p, { progress: 0.35 }));
    }
    if (next.length === 0) {
      const usedIds = new Set(inProgress.map(x => x.id));
      next = ALL_PILLS.filter(p => !usedIds.has(p.id)).slice(0, 4);
    }
  }
  const totalProgress = PILLS.length > 0 ? Math.round((completed.length / PILLS.length) * 100) : 0;

  // Nombres robustos del path (adapter expone `title`/`label`, legacy expone `label`/`desc`/`badge`).
  const pTitle = path ? (path.label || path.title || 'Ruta') : '';
  const pDesc  = path ? (path.desc || path.roleTag || '') : '';
  const pBadge = path ? (path.badge || '') : '';

  // En modo demo · esta vista se renombra a "Mi Lista" y el eyebrow usa
  // la palabra "Curso" en lugar de "Ruta".
  const _dm = window.DemoMode;
  const _dmActive = _dm && _dm.isActive && _dm.isActive();
  const _myListLabel = _dm && _dm.label ? _dm.label('my_list_label', 'Mi ruta') : 'Mi ruta';
  const _pathSingular = _dm && _dm.label ? _dm.label('path_label', 'Ruta') : 'Ruta';

  return (
    <PageShell
      eyebrow={path ? `${_pathSingular} · ${pTitle}` : `${_myListLabel} · ${USER.role || 'Usuario'}`}
      title={path
        ? <>{pTitle}{pBadge ? <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, fontSize:24, color:'var(--accent)', marginLeft:12 }}> · {pBadge}</em> : null}</>
        : _dmActive
          ? <>{_myListLabel}</>
          : <>Tu progreso, <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{USER.name?.split(' ')[0] || 'crece'}</em></>}
      sub={_isDemo
        ? '' /* en demo · sin "X/N pills · N% del programa" (eliminado en reunión) */
        : (path
          ? `${pDesc} · ${completed.length}/${PILLS.length} pills · ${totalProgress}%`
          : `${completed.length} de ${PILLS.length} pills completadas · ${totalProgress}% del programa`)}
      actions={path && setView ? (
        <div style={{ display:'flex', gap: 10 }}>
          {totalProgress >= 70 && window.RouteExamModal && (
            <button onClick={() => setShowExam(true)} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, boxShadow:'0 4px 12px rgba(89,71,255,0.30)' }}>
              {T('mypath.exam')}
            </button>
          )}
          <button onClick={() => setView('rutas')} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>{T('mypath.allRoutes')}</button>
        </div>
      ) : null}>

      {/* Barra de progreso grande · oculta en demo (sin "% del programa") */}
      {!_isDemo && (
      <div style={{
        padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-2)', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{T('mypath.cert.title')}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 40, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{totalProgress}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalProgress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 4 }}/>
        </div>
      </div>
      )}

      {/* Stats row · oculto en demo (eliminados Completadas/En curso/Por empezar) */}
      {!_isDemo && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
        {[
          { label: T('mypath.completed'), value: completed.length, color: 'var(--ok)' },
          { label: T('mypath.inProgress'), value: inProgress.length, color: 'var(--accent)' },
          { label: T('mypath.toStart'), value: PILLS.length - completed.length - inProgress.length, color: 'var(--fg-muted)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'var(--font-sans)' }}>{s.value}</div>
          </div>
        ))}
      </div>
      )}

      {/* MASTER EMPTY STATE · user real sin actividad · ofrece CTA al
          Catálogo. Solo aplica en demo (Mi Lista) sin path activo, sin
          sembrado de muestra y con las 3 secciones vacías. */}
      {_isDemo && !path && inProgress.length === 0 && next.length === 0
        && (PATHS.filter(p => p.progress > 0 || (window.Bookmarks && window.Bookmarks.has && window.Bookmarks.has(p.id))).length === 0) && (
        <div style={{
          padding:'60px 32px', textAlign:'center', background:'var(--bg-surface)',
          border:'1px dashed var(--line)', borderRadius:16, marginBottom:32,
        }}>
          <div style={{ fontSize:48, marginBottom:14 }}>📚</div>
          <h3 style={{ margin:'0 0 8px', fontSize:20, fontWeight:700, color:'var(--fg)' }}>
            Tu lista está vacía
          </h3>
          <p style={{ margin:'0 auto 24px', fontSize:14, color:'var(--fg-muted)', maxWidth:420, lineHeight:1.55 }}>
            Cuando empieces un curso o guardes pills como favoritas las verás aquí.
            Explora el catálogo y empieza por el que más te interese.
          </p>
          <button onClick={() => setView && setView('rutas')} style={{
            padding:'12px 22px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:10,
            cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:700, fontSize:14,
            boxShadow:'0 6px 16px rgba(0,114,190,0.30)',
          }}>Ir al Catálogo →</button>
        </div>
      )}

      {/* En progreso · pills (sección 1/3 en demo: "Pills · continuar viendo") */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            {_isDemo ? 'Sigue formándote' : T('mypath.cont')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {inProgress.map(p => {
              const slug = _slug(p.category);
              return (
                <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                  <div className={`card-cover cat-${slug}`}/>
                  <div className="card-grad"/>
                  <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-meta">
                      <span>{p.duration}</span><span className="sep">·</span><span>{p.level}</span>
                    </div>
                  </div>
                  <div className="card-progress"><div className="fill" style={{width: `${Math.round(p.progress*100)}%`}}/></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Próximas pills sugeridas · en demo se renombra a "Pills inscritos" (sección 2/3) */}
      {next.length > 0 && (
        <section style={{ marginBottom: _isDemo ? 40 : 0 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>
            {_isDemo ? 'Pills inscritas' : T('mypath.next')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {next.map(p => {
              const slug = _slug(p.category);
              return (
                <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                  <div className={`card-cover cat-${slug}`}/>
                  <div className="card-grad"/>
                  <span className="card-pill-num">{String(p.category).toUpperCase()}{!_isDemo ? ` · ${p.pill}` : ''}</span>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-meta">
                      {!_isDemo && <><span>{p.duration}</span><span className="sep">·</span></>}
                      <span>{_isDemo ? `Nivel ${p.level}` : p.level}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Cursos a los que estás inscrito · enrolled + en progreso + bookmarked.
          Se muestra a TODOS los usuarios (antes gateado por _isDemo → los users
          reales nunca veían sus cursos inscritos pese a persistir en Supabase). */}
      {!path && (() => {
        const coursesInProgress = PATHS.filter(p => p.progress > 0 && p.progress < 1);
        const coursesEnrolled   = PATHS.filter(p => window.Enrollments && window.Enrollments.has && window.Enrollments.has(p.id));
        const coursesBookmarked = PATHS.filter(p => window.Bookmarks && window.Bookmarks.has && window.Bookmarks.has(p.id));
        // Orden · en progreso primero (más relevante), luego inscritos, luego bookmarks. Sin duplicados.
        const seen = new Set();
        const dedup = (arr) => arr.filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; });
        let coursesToShow = [...dedup(coursesInProgress), ...dedup(coursesEnrolled), ...dedup(coursesBookmarked)];
        // Sembrado SOLO en workspace de demo (slug demo o *-demo) · para users
        // reales mostramos empty state honesto en lugar de cursos falsos inscritos.
        const _seedSample = !!(typeof window !== 'undefined' && window.isDemoWorkspace && window.isDemoWorkspace());
        if (coursesToShow.length === 0 && _seedSample) {
          coursesToShow = PATHS
            .filter(p => !/tendencias?/i.test(String(p.slug || '')))
            .slice(0, 3);
        }
        return (
          <section>
            <h2 style={{ fontFamily:'var(--font-sans)', fontSize:22, fontWeight:700, color:'var(--fg)', marginBottom:16 }}>
              Cursos a los que estás inscrito
            </h2>
            {coursesToShow.length === 0 ? (
              <div style={{ padding:40, textAlign:'center', background:'var(--bg-surface)', border:'1px dashed var(--line)', borderRadius:14 }}>
                <div style={{ fontSize:32, marginBottom:8, opacity:0.5 }}>📚</div>
                <div style={{ fontSize:14, color:'var(--fg-muted)' }}>Aún no tienes cursos en Mi Lista. Inscríbete a uno desde el Catálogo.</div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {coursesToShow.map(p => {
                  const pct = Math.round((p.progress || 0) * 100);
                  return (
                    <article key={'crs-'+p.id} onClick={() => openPath ? openPath(p.id) : setView('rutas')} style={{
                      cursor:'pointer', padding:18, background:'var(--bg-surface)', border:'1px solid var(--line)',
                      borderRadius:14, display:'flex', flexDirection:'column', gap:10,
                    }}>
                      <div style={{
                        fontFamily:'var(--font-mono, monospace)', fontSize:10, letterSpacing:'0.08em',
                        textTransform:'uppercase', color:'var(--accent)', fontWeight:700,
                      }}>Curso{p.progress > 0 ? ` · ${pct}% completado` : ''}</div>
                      <h3 style={{ margin:0, fontSize:15.5, fontWeight:700, color:'var(--fg)', lineHeight:1.3 }}>{p.title}</h3>
                      {p.desc && <div style={{ fontSize:12, color:'var(--fg-muted)', lineHeight:1.4 }}>{String(p.desc).slice(0, 80)}{p.desc.length > 80 ? '…' : ''}</div>}
                      {pct > 0 && (
                        <div style={{ height:4, background:'rgba(0,0,0,0.08)', borderRadius:2, overflow:'hidden', marginTop:4 }}>
                          <div style={{ height:'100%', width:pct+'%', background:'var(--accent)' }}/>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); if (openPath) openPath(p.id); else setView('rutas'); }} style={{
                        marginTop:'auto', padding:'9px 12px', background:'var(--accent)', color:'#fff', border:'none',
                        borderRadius:8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:700, fontSize:12.5,
                      }}>{pct > 0 ? 'Continuar' : 'Empezar'}</button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {/* Examen final · solo si hay path y el modal global está disponible */}
      {showExam && path && window.RouteExamModal && (
        <window.RouteExamModal
          routeId={path.id}
          routeLabel={pTitle}
          onClose={() => setShowExam(false)}
          onPassed={() => { setShowExam(false); if (window.Toast) window.Toast.success('¡Examen aprobado! Certificado generado.', { icon:'🏆' }); }}
        />
      )}
    </PageShell>
  );
}

/* ============================================================
   ChannelsView · WhatsApp/Teams · keeps storage state
   ============================================================ */
function ChannelsView() {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  // Estado del Channel Manager (canales conectados + canal principal)
  const [chState, setChState] = useEV2(() => (window.Channels ? window.Channels.get() : {}));
  useEE2(() => {
    const onChange = (e) => setChState(e.detail);
    window.addEventListener('channels-changed', onChange);
    return () => window.removeEventListener('channels-changed', onChange);
  }, []);

  // En demo · WhatsApp + Teams + Email visibles (el user pidió que aparezca
  // WhatsApp ya que es el canal natural de Hijos de Rivera).
  const _dm = window.DemoMode;
  const _demoActive = _dm && _dm.isActive && _dm.isActive();
  const _fullCatalog = (window.Channels && window.Channels.CATALOG) || [];
  const catalog = _demoActive
    ? _fullCatalog.filter(c => ['whatsapp','teams','email'].indexOf(c.id) !== -1)
    : _fullCatalog;
  const primaryId = chState.primary || null;
  const primaryDef = primaryId ? catalog.find(c => c.id === primaryId) : null;
  const channelColor = primaryDef ? primaryDef.color : '#25D366';

  return (
    <PageShell
      eyebrow={T('channels.eyebrow')}
      title={<>{T('channels.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('channels.titleEm')}</em></>}
      sub={T('channels.sub')}>

      {/* CHANNEL MANAGER · conectar / desconectar / re-autenticar / marcar principal */}
      <ChannelManagerPanel chState={chState} catalog={catalog}/>

      {/* MATRIZ DE NOTIFICACIONES · una columna por canal conectado · estilo Sprinklr */}
      <ChannelNotificationsMatrix chState={chState} catalog={catalog}/>

      {/* DELIVERY PREFERENCES · cuándo recibir contenido (con max/día) */}
      <DeliveryPreferencesPanel channelColor={channelColor}/>

      {/* Atajo a Ajustes para el resto de configuración */}
      <div style={{ marginTop: 32, padding:'18px 22px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>⚙️</div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{T('delivery.toSettings.title')}</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('delivery.toSettings.sub')}</div>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('__go-settings'))}
          style={{ padding:'10px 16px', background: channelColor, color:'#fff', border:'none', borderRadius: 10, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, boxShadow:`0 4px 12px ${channelColor}40` }}>
          {T('delivery.toSettings.btn')}
        </button>
      </div>
    </PageShell>
  );
}

// ── Smart Scheduling Panel · BeonAI sugiere el mejor horario ─────────────
// ── Push Notifications Panel · suscripción + install prompt ──────────────
function PushNotificationsPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const supported = window.PushNotifications && window.PushNotifications.isSupported();
  const [perm, setPerm] = useEV2(() => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'));
  const [active, setActive] = useEV2(false);
  const [busy, setBusy] = useEV2(false);
  const [installPrompt, setInstallPrompt] = useEV2(null);
  const [installed, setInstalled] = useEV2(() => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone));

  // Sync active state on mount
  useEE2(() => {
    let mounted = true;
    if (!window.PushNotifications) return;
    window.PushNotifications.isActive().then(v => { if (mounted) setActive(v); });
    const onSub = () => window.PushNotifications.isActive().then(v => { if (mounted) { setActive(v); setPerm(Notification.permission); } });
    const onUnsub = () => { if (mounted) setActive(false); };
    window.addEventListener('push-subscribed', onSub);
    window.addEventListener('push-unsubscribed', onUnsub);
    return () => { mounted = false; window.removeEventListener('push-subscribed', onSub); window.removeEventListener('push-unsubscribed', onUnsub); };
  }, []);

  // Install prompt · index.html ya capturó el evento ANTES de montar el panel,
  // lo guardó en window._installPromptEvent. Lo leemos en mount + nos suscribimos
  // por si volviera a dispararse (raro pero posible si user dismiss y vuelve).
  useEE2(() => {
    if (window._installPromptEvent) setInstallPrompt(window._installPromptEvent);
    const onBefore = (e) => { e.preventDefault(); window._installPromptEvent = e; setInstallPrompt(e); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); window._installPromptEvent = null; };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBefore); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const toggle = async () => {
    setBusy(true);
    if (active) await window.PushNotifications.unsubscribe();
    else await window.PushNotifications.subscribe();
    const v = await window.PushNotifications.isActive();
    setActive(v); setPerm(Notification.permission);
    setBusy(false);
  };

  const testLocal = async () => {
    const r = await window.PushNotifications.sendTestLocal();
    if (r.error && window.Toast) window.Toast.info('Test local · ' + r.error);
  };
  const testRemote = async () => {
    const r = await window.PushNotifications.sendTestRemote();
    if (r.ok && window.Toast) window.Toast.success('Push enviada desde el servidor', { icon:'📨' });
    else if (window.Toast) window.Toast.info('Server push no configurado · usa el test local');
  };

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
    window._installPromptEvent = null;
  };

  const statusColor = active ? 'var(--ok)' : (perm === 'denied' ? 'var(--warn)' : 'var(--fg-dim)');
  const statusLabel = !supported ? T('push.notSupported')
    : perm === 'denied' ? T('push.denied')
    : active ? T('push.active')
    : T('push.inactive');

  return (
    <section style={{ marginTop: 40, marginBottom: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap: 12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>🔔 {T('push.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color: statusColor, fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: statusColor }}/>
          {statusLabel}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>{T('push.sub')}</div>

      {/* Card principal · suscripción */}
      <div style={{ padding:'18px 22px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>
              {active ? T('push.active') : T('push.enable')}
            </div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>
              {supported ? 'Permiso del navegador: ' + perm : T('push.notSupported')}
            </div>
          </div>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {supported && perm !== 'denied' && (
              <button onClick={toggle} disabled={busy}
                style={{ padding:'10px 16px', background: active ? 'transparent' : 'var(--accent)', border: active ? '1px solid var(--line)' : 'none', color: active ? 'var(--fg-muted)' : '#fff', borderRadius: 8, cursor: busy ? 'wait' : 'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12.5, opacity: busy ? 0.6 : 1 }}>
                {busy ? '…' : (active ? T('push.disable') : T('push.enable'))}
              </button>
            )}
            {active && (
              <button onClick={testLocal} style={{ padding:'10px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontWeight: 600 }}>
                📨 {T('push.testLocal')}
              </button>
            )}
            {active && (
              <button onClick={testRemote} style={{ padding:'10px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontWeight: 600 }}>
                ☁️ {T('push.testRemote')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Install banner · solo si NO está instalada y el browser ofrece prompt */}
      {!installed && installPrompt && (
        <div style={{ padding:'14px 18px', background:'linear-gradient(135deg, rgba(110,80,238,0.10), transparent)', border:'1px solid rgba(110,80,238,0.3)', borderRadius: 12, display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{T('push.install')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('push.installPromo')}</div>
          </div>
          <button onClick={triggerInstall} style={{ padding:'10px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13, boxShadow:'0 4px 12px rgba(110,80,238,0.30)' }}>
            {T('push.install')}
          </button>
        </div>
      )}
      {installed && (
        <div style={{ padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8, fontSize: 12, color:'var(--ok)' }}>
          {T('push.installed')}
        </div>
      )}
    </section>
  );
}

function SmartSchedulingPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const lang = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
  const [data, setData] = useEV2(() => (window.SmartScheduling ? window.SmartScheduling.get() : null));
  const [analyzing, setAnalyzing] = useEV2(false);
  const [applied, setApplied] = useEV2(false);
  // Días localizados para el headline
  const DAYS_LONG_BY_LANG = {
    es:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    en:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    pt:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
  };
  const daysLong = DAYS_LONG_BY_LANG[lang] || DAYS_LONG_BY_LANG.es;
  // Mapping insights id → keys i18n (en orden devuelto por SmartScheduling.analyze)
  const INSIGHT_KEYS = ['optimal','bestDay','window','avg','engagement'];

  useEE2(() => {
    const onChange = (e) => setData(e.detail || (window.SmartScheduling ? window.SmartScheduling.get() : null));
    window.addEventListener('smart-scheduling-changed', onChange);
    return () => window.removeEventListener('smart-scheduling-changed', onChange);
  }, []);

  // Detecta si DeliveryPrefs ya está en modo smart-ai
  useEE2(() => {
    const refreshApplied = () => {
      const p = window.DeliveryPrefs && window.DeliveryPrefs.get && window.DeliveryPrefs.get();
      setApplied(!!(p && p.mode === 'smart-ai'));
    };
    refreshApplied();
    window.addEventListener('delivery-prefs-changed', refreshApplied);
    return () => window.removeEventListener('delivery-prefs-changed', refreshApplied);
  }, []);

  const reAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      if (window.SmartScheduling) setData(window.SmartScheduling.analyze());
      setAnalyzing(false);
      if (window.Toast) window.Toast.success(T('smart.reAnalyze') + ' ✓', { icon:'✨' });
    }, 900);
  };

  const apply = () => {
    if (window.SmartScheduling) window.SmartScheduling.applyToDelivery();
    if (window.Toast) window.Toast.success(T('smart.appliedBtn'), { icon:'⚡' });
  };

  if (!data) return null;

  const fmtAgo = (ts) => {
    const d = Math.floor((Date.now() - ts) / 60000);
    const prefix = lang === 'en' ? '' : (lang === 'pt' ? 'há ' : 'hace ');
    const suffix = lang === 'en' ? ' ago' : '';
    if (d < 1)   return lang === 'en' ? 'just now' : (lang === 'pt' ? 'agora mesmo' : 'ahora mismo');
    if (d < 60)  return prefix + d + ' min' + suffix;
    const h = Math.floor(d / 60);
    if (h < 24)  return prefix + h + ' h' + suffix;
    const dys = Math.floor(h / 24);
    return prefix + dys + (lang === 'en' ? ' day' + (dys === 1 ? '' : 's') : (lang === 'pt' ? ' dia' + (dys === 1 ? '' : 's') : ' día' + (dys === 1 ? '' : 's'))) + suffix;
  };

  return (
    <section style={{ marginTop: 40, marginBottom: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap: 12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>
          ✨ {T('smart.eyebrow')} · <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{T('smart.title')}</em>
        </h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('smart.updatedAt','Actualizado')} {fmtAgo(data.generatedAt || Date.now())}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>
        {T('smart.sub')}
      </div>

      {/* CARD principal · gradiente accent + métricas top */}
      <div style={{
        padding:'22px 24px',
        background:'linear-gradient(135deg, rgba(89,71,255,0.10) 0%, rgba(89,71,255,0.02) 50%, var(--bg-surface) 100%)',
        border:'1px solid rgba(89,71,255,0.35)',
        borderRadius: 16,
        marginBottom: 16,
        position:'relative', overflow:'hidden',
      }}>
        {analyzing && (
          <div style={{ position:'absolute', top: 12, right: 16, fontFamily:'var(--font-mono)', fontSize: 10.5, color:'var(--accent)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
            <span className="dot-pulse" style={{ width: 8, height: 8, borderRadius:'50%', background:'var(--accent)' }}/>
            {T('smart.analyzing')}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap: 24, alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent)', fontWeight: 700, marginBottom: 8 }}>{T('smart.bestTime')}</div>
            <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize: 38, color:'var(--fg)', lineHeight: 1.1, marginBottom: 6 }}>
              {T('smart.youHeadline')} <strong style={{ color:'var(--accent)' }}>{data.time}</strong>
            </div>
            <div style={{ fontSize: 13.5, color:'var(--fg-muted)', lineHeight: 1.55, maxWidth: 560 }}>
              {T('smart.explain','Te abres con más constancia los {day}. En tu ventana de pico ({window}) el engagement es del {engagement}%.')
                .replace('{day}', daysLong[data.bestDayIdx].toLowerCase())
                .replace('{window}', data.peakWindow)
                .replace('{engagement}', data.engagement)}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            <button onClick={apply} disabled={applied} style={{
              padding:'12px 16px', background: applied ? 'var(--bg-elevated)' : 'var(--accent)',
              color: applied ? 'var(--fg-muted)' : '#fff',
              border: 'none', borderRadius: 10, cursor: applied ? 'default' : 'pointer',
              fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13,
              boxShadow: applied ? 'none' : '0 6px 18px rgba(89,71,255,0.35)',
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
            }}>
              {applied ? T('smart.appliedBtn') : T('smart.applyBtn')}
            </button>
            <button onClick={reAnalyze} disabled={analyzing} style={{
              padding:'10px 16px', background:'transparent',
              border:'1px solid var(--line)', color:'var(--fg-muted)',
              borderRadius: 10, cursor: analyzing ? 'wait' : 'pointer',
              fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12,
            }}>
              {analyzing ? T('smart.analyzing') : T('smart.reAnalyze')}
            </button>
          </div>
        </div>
      </div>

      {/* INSIGHTS · grid de métricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {data.insights.map((ins, i) => {
          const key = INSIGHT_KEYS[i] || null;
          const label = key ? T('smart.insights.' + key, ins.label) : ins.label;
          const hint  = key ? T('smart.insights.' + key + '.hint', ins.hint) : ins.hint;
          // Para `bestDay`, traducir el value (que es el nombre del día)
          let value = ins.value;
          if (key === 'bestDay' && typeof value === 'string') value = daysLong[data.bestDayIdx] || value;
          return (
            <div key={i} style={{ padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12 }}>
              <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{ins.icon}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color:'var(--fg)', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color:'var(--fg-muted)', lineHeight: 1.4 }}>{hint}</div>
            </div>
          );
        })}
      </div>

      {/* Notas · qué optimiza la IA */}
      <div style={{ marginTop: 14, padding:'12px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 10, fontSize: 12, color:'var(--fg-muted)', lineHeight: 1.55 }}>
        {T('smart.disclaimer','BeonAI también optimiza por ti · evita enviarte en quiet hours, agrupa pills en digest si superas tu límite diario, y respeta tu modo vacaciones automáticamente.')}
      </div>
    </section>
  );
}

// ── Notification Rules Panel ────────────────────────────────────────────
function NotificationRulesPanel({ channelColor }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [rules, setRules] = useEV2(() => (window.NotificationRules ? window.NotificationRules.get() : {}));
  useEE2(() => {
    const onChange = (e) => setRules(e.detail);
    window.addEventListener('notif-rules-changed', onChange);
    return () => window.removeEventListener('notif-rules-changed', onChange);
  }, []);

  const update = (patch) => window.NotificationRules && window.NotificationRules.update(patch);
  const muted = window.NotificationRules ? window.NotificationRules.isMuted() : false;

  const DIGEST = [
    { id:'instant', label:T('rules.digest.instant'), desc:T('rules.digest.instant.sub','En cuanto haya algo, te llega') },
    { id:'daily',   label:T('rules.digest.daily'),   desc:T('rules.digest.daily.sub','Un único mensaje agrupado al día') },
    { id:'weekly',  label:T('rules.digest.weekly'),  desc:T('rules.digest.weekly.sub','Un único mensaje los lunes a las 9:00') },
  ];

  const PRIORITY = [
    { id:'all',      label:T('rules.priority.all'),      desc:T('rules.priority.all.sub','Cualquier contenido nuevo') },
    { id:'relevant', label:T('rules.priority.relevant'), desc:T('rules.priority.relevant.sub','BeonAI filtra por tu rol y objetivos') },
    { id:'high',     label:T('rules.priority.high'),     desc:T('rules.priority.high.sub','Sólo alertas y deadlines') },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('rules.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color: muted ? 'var(--warn)' : 'var(--ok)', fontWeight: 700, display:'inline-flex', alignItems:'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: muted ? 'var(--warn)' : 'var(--ok)' }}/>
          {muted ? T('rules.muted') : T('rules.active')}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 24 }}>
        {T('rules.sub')}
      </div>

      {/* DIGEST · cómo agrupar */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('rules.digest.title')}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10, marginBottom:28 }}>
        {DIGEST.map(d => {
          const active = rules.digest === d.id;
          return (
            <button key={d.id} onClick={() => update({ digest: d.id })}
              style={{
                padding:'12px 14px', borderRadius: 12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
              }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{d.label}</div>
              <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 3, lineHeight: 1.35 }}>{d.desc}</div>
            </button>
          );
        })}
      </div>

      {/* QUIET HOURS · franja horaria sin notificaciones */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:`1px solid ${rules.quietHours && rules.quietHours.enabled ? channelColor : 'var(--line)'}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.quiet.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.quiet.sub','No te llegará nada en esta franja horaria. Útil para dormir o concentrarte.')}</div>
          </div>
          <button onClick={() => update({ quietHours: { ...rules.quietHours, enabled: !rules.quietHours.enabled } })} aria-label="Toggle quiet hours"
            style={{ width:48, height:26, background: rules.quietHours && rules.quietHours.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.quietHours && rules.quietHours.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.quietHours && rules.quietHours.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.quiet.from','Desde')}</span>
              <input type="time" value={rules.quietHours.from} onChange={e => update({ quietHours: { ...rules.quietHours, from: e.target.value } })}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.quiet.to','Hasta')}</span>
              <input type="time" value={rules.quietHours.to} onChange={e => update({ quietHours: { ...rules.quietHours, to: e.target.value } })}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', alignSelf:'center' }}>
              {(() => {
                const [fh, fm] = rules.quietHours.from.split(':').map(Number);
                const [th, tm] = rules.quietHours.to.split(':').map(Number);
                const f = fh*60+fm, t = th*60+tm;
                const diff = f === t ? 0 : (f < t ? t - f : (1440 - f) + t);
                const h = Math.floor(diff/60), m = diff % 60;
                return diff === 0 ? T('rules.quiet.noWindow','Sin franja') : ((h ? h + 'h ' : '') + (m ? m + 'min' : '') + ' ' + T('rules.quiet.duration','en silencio'));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* VACATION MODE · pausa con fecha de fin */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:`1px solid ${rules.vacation && rules.vacation.enabled ? channelColor : 'var(--line)'}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14, flexWrap:'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.vacation.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.vacation.sub','Pausa todas las notificaciones hasta la fecha que elijas.')}</div>
          </div>
          <button onClick={() => update({ vacation: { ...rules.vacation, enabled: !rules.vacation.enabled } })} aria-label="Toggle vacation"
            style={{ width:48, height:26, background: rules.vacation && rules.vacation.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.vacation && rules.vacation.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        {rules.vacation && rules.vacation.enabled && (
          <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('rules.vacation.until','Hasta')}</span>
              <input type="date" value={rules.vacation.until || ''} onChange={e => update({ vacation: { ...rules.vacation, until: e.target.value } })}
                min={new Date().toISOString().slice(0,10)}
                style={{ padding:'8px 12px', fontSize:13, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:8 }}/>
            </label>
            {rules.vacation.until && (() => {
              const lang2 = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
              const locale = lang2 === 'en' ? 'en-US' : lang2 === 'pt' ? 'pt-BR' : 'es-ES';
              return <div style={{ fontSize: 12, color:'var(--fg-muted)' }}>{T('rules.vacation.reactivate','Te reactivamos automáticamente el')} {new Date(rules.vacation.until).toLocaleDateString(locale, { weekday:'long', day:'numeric', month:'short' })}</div>;
            })()}
          </div>
        )}
      </div>

      {/* SMART REMINDER · evitar repetir contenido ya visto */}
      <div style={{ padding:'16px 18px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{T('rules.smart.title')}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('rules.smart.sub','BeonAI evita recordarte contenido que ya viste.')}</div>
          </div>
          <button onClick={() => update({ smartReminder: !rules.smartReminder })} aria-label="Toggle smart reminder"
            style={{ width:48, height:26, background: rules.smartReminder ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: rules.smartReminder ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
      </div>

      {/* PRIORITY */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('rules.priority.title')}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10, marginBottom: 18 }}>
        {PRIORITY.map(p => {
          const active = rules.priority === p.id;
          return (
            <button key={p.id} onClick={() => update({ priority: p.id })}
              style={{
                padding:'12px 14px', borderRadius: 10, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
              }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{p.label}</div>
              <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.35 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.NotificationRules && window.NotificationRules.reset(); setRules(window.NotificationRules.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
        <div style={{ flex: 1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          Auto-save · {new Date(rules.updatedAt || Date.now()).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

// ── Subscriptions Panel · seguir categorías, skills, equipos, trainers ───
function SubscriptionsPanel({ channelColor }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [subs, setSubs] = useEV2(() => (window.Subscriptions ? window.Subscriptions.get() : { categories:{}, skills:{}, teams:{}, trainers:{} }));
  const [activeGroup, setActiveGroup] = useEV2('categories');
  useEE2(() => {
    const onChange = (e) => setSubs(e.detail);
    window.addEventListener('subscriptions-changed', onChange);
    return () => window.removeEventListener('subscriptions-changed', onChange);
  }, []);

  const CAT = (window.Subscriptions && window.Subscriptions.CATALOG) || { categories:[], skills:[], teams:[], trainers:[] };
  const TABS = [
    { id:'categories', label:T('subs.tab.categories'), icon:'🗂', items: CAT.categories || [] },
    { id:'skills',     label:T('subs.tab.skills'),     icon:'🧠', items: CAT.skills     || [] },
    { id:'teams',      label:T('subs.tab.teams'),      icon:'👥', items: CAT.teams      || [] },
    { id:'trainers',   label:T('subs.tab.trainers'),   icon:'🎓', items: CAT.trainers   || [] },
  ];
  const active = TABS.find(t => t.id === activeGroup) || TABS[0];

  const toggle = (id) => window.Subscriptions && window.Subscriptions.toggle(activeGroup, id);
  const total = window.Subscriptions ? window.Subscriptions.totalCount() : 0;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('subs.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('subs.activeCount').replace('{n}', total)}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 20 }}>
        {T('subs.sub')}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap: 2, marginBottom: 16, borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const sel = activeGroup === t.id;
          const c = window.Subscriptions ? window.Subscriptions.count(t.id) : 0;
          return (
            <button key={t.id} onClick={() => setActiveGroup(t.id)} style={{
              padding:'10px 14px 9px', background:'transparent', border:'none',
              borderBottom: '2px solid ' + (sel ? channelColor : 'transparent'),
              color: sel ? 'var(--fg)' : 'var(--fg-muted)',
              fontFamily:'var(--font-sans)', fontWeight: sel ? 700 : 500, fontSize: 13.5,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 8, marginBottom: -1,
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, padding:'1px 6px', background: sel ? channelColor : 'var(--bg-surface)', color: sel ? '#fff' : 'var(--fg-muted)', borderRadius: 999, fontWeight: 700 }}>{c}</span>
            </button>
          );
        })}
        <div style={{ flex:1 }}/>
        <button onClick={() => { window.Subscriptions && window.Subscriptions.reset(); setSubs(window.Subscriptions.get()); }}
          style={{ alignSelf:'center', padding:'6px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 11, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
      </div>

      {/* Items del grupo activo */}
      <div style={{ display:'grid', gridTemplateColumns: activeGroup === 'skills' ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {active.items.map(item => {
          const isActive = !!(subs[activeGroup] && subs[activeGroup][item.id]);
          const itemColor = item.color || channelColor;
          return (
            <button key={item.id} onClick={() => toggle(item.id)}
              style={{
                padding:'12px 14px', borderRadius: 10, cursor:'pointer', textAlign:'left',
                background: isActive ? `linear-gradient(135deg, ${itemColor}12 0%, ${itemColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${isActive ? itemColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'center', gap: 10, position:'relative',
              }}>
              {item.icon && <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.icon}</div>}
              {!item.icon && activeGroup === 'trainers' && (
                <div style={{ width: 32, height: 32, borderRadius:'50%', background: channelColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {item.label.split(' ').map(s => s[0]).slice(0,2).join('')}
                </div>
              )}
              <div style={{ flex:1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? itemColor : 'var(--fg)' }}>{item.label}</div>
                {item.role && <div style={{ fontSize: 11, color:'var(--fg-muted)', marginTop: 2 }}>{item.role}</div>}
                {item.members != null && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)', marginTop: 2 }}>{item.members} miembros</div>}
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${isActive ? itemColor : 'var(--line)'}`, background: isActive ? itemColor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {isActive ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chips resumen · qué sigues en total (todas las pestañas) */}
      {total > 0 && (
        <div style={{ marginTop: 18, padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 10 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700, marginBottom: 8 }}>{T('subs.summary')}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
            {TABS.flatMap(t => t.items.filter(i => subs[t.id] && subs[t.id][i.id]).map(i => (
              <span key={t.id+':'+i.id} style={{ padding:'4px 10px', fontFamily:'var(--font-mono)', fontSize: 10.5, fontWeight: 600, background: (i.color || channelColor)+'15', color: i.color || channelColor, borderRadius: 999, border: `1px solid ${(i.color || channelColor)+'40'}` }}>
                {t.icon} {i.label}
              </span>
            )))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Content Push Panel · tipos de contenido + formato de mensaje ─────────
function ContentPushPanel({ channelColor }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [prefs, setPrefs] = useEV2(() => (window.ContentPush ? window.ContentPush.get() : {}));
  useEE2(() => {
    const onChange = (e) => setPrefs(e.detail);
    window.addEventListener('content-push-changed', onChange);
    return () => window.removeEventListener('content-push-changed', onChange);
  }, []);

  // Tipos de contenido · enriquecidos con traducción i18n por id
  const rawTypes = (window.ContentPush && window.ContentPush.TYPES) || [];
  const types = rawTypes.map(t => ({
    ...t,
    label: T('content.types.' + t.id, t.label),
    desc:  T('content.types.' + t.id + '.sub', t.desc),
  }));
  const enabledCount = types.filter(t => prefs.types && prefs.types[t.id]).length;

  const FLAGS = [
    { key:'autoReceive',   label:T('content.flag.auto'),     desc:T('content.flag.auto.sub','Llega solo, sin que pidas que te lo envíen.') },
    { key:'showSummary',   label:T('content.flag.summary'),  desc:T('content.flag.summary.sub','Antes del enlace, una línea con lo que vas a aprender.') },
    { key:'showThumbnail', label:T('content.flag.thumb'),    desc:T('content.flag.thumb.sub','Imagen de portada con botón "Ver ahora".') },
    { key:'showDuration',  label:T('content.flag.duration'), desc:T('content.flag.duration.sub','Muestra cuánto dura antes de que abras.') },
    { key:'openInSolid',   label:T('content.flag.openSolid'),desc:T('content.flag.openSolid.sub','Al hacer click, abrir dentro de la plataforma (no en web pública).') },
  ];

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('content.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {T('content.count').replace('{n}', enabledCount).replace('{total}', types.length)}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>{T('content.sub')}</div>

      {/* Grid de tipos de contenido */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 32 }}>
        {types.map(t => {
          const active = !!(prefs.types && prefs.types[t.id]);
          return (
            <button key={t.id} onClick={() => window.ContentPush && window.ContentPush.toggleType(t.id)}
              style={{
                padding:'14px 16px', borderRadius: 12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}12 0%, ${channelColor}04 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color:'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'flex-start', gap: 10, position:'relative',
              }}>
              <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: active ? channelColor : 'var(--fg)' }}>{t.label}</div>
                <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${active ? channelColor : 'var(--line)'}`, background: active ? channelColor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {active ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Opciones de formato + preview */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap: 24, alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('content.format.title')}</div>
          {FLAGS.map(f => {
            const active = !!prefs[f.key];
            return (
              <div key={f.key} onClick={() => window.ContentPush && window.ContentPush.setFlag(f.key, !active)} style={{
                padding:'12px 14px', marginBottom: 8, background: active ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${active ? channelColor : 'var(--line)'}`, borderRadius: 10,
                cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap: 14,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color:'var(--fg)' }}>{f.label}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2 }}>{f.desc}</div>
                </div>
                <div style={{ width: 34, height: 18, background: active ? channelColor : 'rgba(15,23,42,0.18)', borderRadius: 9, position:'relative', transition:'background .2s', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, background:'#fff', borderRadius:'50%', position:'absolute', top: 2, left: active ? 18 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREVIEW dinámico del mensaje en el canal principal */}
        <div style={{ background:'#000', border:'1px solid var(--line)', borderRadius: 20, padding: 10 }}>
          <div style={{ padding:'10px 12px', background: channelColor, color:'#fff', borderRadius: 10, marginBottom: 6, fontSize: 12, fontWeight: 700, display:'flex', alignItems:'center', gap: 6 }}>
            <span>✦</span><span>SolidStream</span>
          </div>
          <div style={{ padding: 12, background:'var(--bg-canvas)', borderRadius: 10, color:'var(--fg)' }}>
            {prefs.showThumbnail && (
              <div style={{ aspectRatio:'16/9', borderRadius: 8, background:`linear-gradient(135deg, ${channelColor}, ${channelColor}99)`, marginBottom: 8, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 32 }}>▶</div>
                {prefs.showDuration && (
                  <div style={{ position:'absolute', bottom: 6, right: 6, padding:'2px 6px', background:'rgba(0,0,0,0.6)', color:'#fff', fontFamily:'var(--font-mono)', fontSize: 9, borderRadius: 4 }}>4:32</div>
                )}
              </div>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('content.preview.title')}</div>
            {prefs.showSummary && (
              <div style={{ fontSize: 11, color:'var(--fg-muted)', lineHeight: 1.45, marginBottom: 8 }}>{T('content.preview.desc')}</div>
            )}
            <button style={{ padding:'7px 12px', background: channelColor, color:'#fff', border:'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor:'pointer', width:'100%' }}>
              {prefs.openInSolid ? T('content.preview.cta.solid') : T('content.preview.cta.web')}
            </button>
            <div style={{ fontSize: 9, color:'var(--fg-dim)', marginTop: 6, fontFamily:'var(--font-mono)' }}>{T('content.preview.pushManual')}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.ContentPush && window.ContentPush.reset(); setPrefs(window.ContentPush.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 12, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          ↻ Restablecer
        </button>
        <div style={{ flex: 1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          Auto-save · {new Date(prefs.updatedAt || Date.now()).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

// ── Channel Notifications Matrix · una columna por canal × tipos comunes ──
function ChannelNotificationsMatrix({ chState, catalog }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const connected = (catalog || []).filter(c => chState[c.id] && chState[c.id].connected);
  const [state, setState] = useEV2(() => (window.ChannelNotifs ? window.ChannelNotifs.get() : {}));
  const [history, setHistory] = useEV2(() => (window.TestSends ? window.TestSends.list() : []));

  useEE2(() => {
    const onChange = (e) => setState(e.detail);
    window.addEventListener('channel-notifs-changed', onChange);
    return () => window.removeEventListener('channel-notifs-changed', onChange);
  }, []);
  useEE2(() => {
    const onChange = (e) => setHistory(e.detail);
    window.addEventListener('test-sends-changed', onChange);
    return () => window.removeEventListener('test-sends-changed', onChange);
  }, []);

  // En modo demo · tras reunión · sólo:
  //   · daily_module → "Píldora del día"
  //   · new_workshop → "Nuevos talleres"
  //   · ai_recs reutilizado como "Recordatorio (hora específica)"
  // Eliminamos: meeting_brief, weekly_recap, beonai_chat, deadlines (y la
  // pista AI del ai_recs original).
  const _dmTypes = window.DemoMode;
  const _dmTypesActive = _dmTypes && _dmTypes.isActive && _dmTypes.isActive();
  const _rawTypes = (window.ChannelNotifs && window.ChannelNotifs.TYPES) || [];
  const TYPES = _dmTypesActive
    ? _rawTypes
        .filter(t => ['daily_module','new_workshop','ai_recs'].indexOf(t.id) !== -1)
        .map(t => {
          if (t.id === 'daily_module') return { ...t, label: 'Píldora del día',     desc: 'Tu pill del día a primera hora' };
          if (t.id === 'new_workshop') return { ...t, label: 'Nuevos talleres',     desc: 'Aviso cuando se publica un workshop' };
          if (t.id === 'ai_recs')      return { ...t, icon:'⏰', label: 'Recordatorio', desc: 'A la hora que tú elijas · una vez al día' };
          return t;
        })
    : _rawTypes;

  if (connected.length === 0) {
    return (
      <section style={{ marginTop: 40, padding:'24px 22px', background:'var(--bg-surface)', border:'1px dashed var(--line)', borderRadius: 14, textAlign:'center' }}>
        <div style={{ fontSize: 32, opacity: 0.45, marginBottom: 8 }}>📱</div>
        <h3 style={{ margin:'0 0 4px', fontFamily:'var(--font-sans)', fontSize: 16, color:'var(--fg)' }}>{T('matrix.empty.title')}</h3>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('matrix.empty.desc')}</div>
      </section>
    );
  }

  const toggle = (typeId, channelId) => window.ChannelNotifs && window.ChannelNotifs.toggle(typeId, channelId);
  const setAll = (channelId, value) => window.ChannelNotifs && window.ChannelNotifs.setAll(channelId, value);
  const isOn = (typeId, channelId) => !!(state[typeId] && state[typeId][channelId]);
  const sendTest = (c) => window.TestSends && window.TestSends.send(c.id, c.label);

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 6, gap:12, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('matrix.title')}</h2>
        <div style={{ fontFamily:'var(--font-mono)', fontSize: 10.5, letterSpacing:'0.06em', color:'var(--fg-muted)', fontWeight: 600 }}>
          {TYPES.length} · {connected.length}
        </div>
      </div>
      <div style={{ fontSize: 13, color:'var(--fg-muted)', marginBottom: 18 }}>
        {T('matrix.sub')}
      </div>

      {/* MATRIZ · columnas por canal, filas por tipo */}
      <div style={{ display:'grid', gridTemplateColumns: `220px repeat(${connected.length}, minmax(180px, 1fr))`, gap: 0, border:'1px solid var(--line)', borderRadius: 14, overflow:'hidden', background:'var(--bg-surface)' }}>
        {/* HEADER · primera fila */}
        <div style={{ padding:'14px 16px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight: 700 }}>
          {T('matrix.col.type')}
        </div>
        {connected.map(c => {
          const channelOn = window.ChannelNotifs ? window.ChannelNotifs.countForChannel(c.id) : 0;
          const allOn = channelOn === TYPES.length;
          return (
            <div key={c.id} style={{ padding:'12px 14px', background:`linear-gradient(180deg, ${c.color}18 0%, ${c.color}06 100%)`, borderBottom:'1px solid var(--line)', borderLeft:'1px solid var(--line)', display:'flex', flexDirection:'column', gap: 8 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{T('matrix.activeOfTotal').replace('{n}', channelOn).replace('{total}', TYPES.length)}</div>
                </div>
                {chState.primary === c.id && (
                  <div title="Canal principal" style={{ fontSize: 12, color: c.color, fontWeight: 800 }}>★</div>
                )}
              </div>
              <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                <button onClick={() => setAll(c.id, !allOn)} title={allOn ? 'Desactivar todas' : 'Activar todas'}
                  style={{ flex: 1, padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background:'transparent', border:`1px solid ${c.color}55`, color: c.color, borderRadius: 6, cursor:'pointer' }}>
                  {allOn ? T('matrix.deactivateAll') : T('matrix.activateAll')}
                </button>
                <button onClick={() => sendTest(c)} title={T('common.test') + ' → ' + c.label}
                  style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight: 700, background: c.color, border:'none', color:'#fff', borderRadius: 6, cursor:'pointer' }}>
                  {T('matrix.testBtn')}
                </button>
              </div>
            </div>
          );
        })}

        {/* FILAS · tipo de notificación × cada columna */}
        {TYPES.map((t, ri) => (
          <React.Fragment key={t.id}>
            <div style={{ padding:'14px 16px', borderTop: ri > 0 ? '1px solid var(--line)' : 'none', background:'var(--bg-surface)', display:'flex', alignItems:'flex-start', gap: 10 }}>
              <div style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color:'var(--fg)' }}>{t.label}</div>
                <div style={{ fontSize: 11, color:'var(--fg-muted)', marginTop: 2, lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            </div>
            {connected.map(c => {
              const on = isOn(t.id, c.id);
              return (
                <div key={c.id} onClick={() => toggle(t.id, c.id)}
                  style={{
                    padding:'14px 16px', borderTop: ri > 0 ? '1px solid var(--line)' : 'none', borderLeft:'1px solid var(--line)',
                    background: on ? `${c.color}08` : 'var(--bg-surface)',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'background .12s',
                  }}>
                  <div style={{ width: 44, height: 24, background: on ? c.color : 'rgba(15,23,42,0.18)', borderRadius: 12, position:'relative', transition:'background .2s', flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, background:'#fff', borderRadius:'50%', position:'absolute', top: 3, left: on ? 23 : 3, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Resumen + historial test */}
      <div style={{ marginTop: 14, display:'flex', gap: 14, alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, fontSize: 11.5, color:'var(--fg-muted)' }}>
          {T('matrix.tip')}
        </div>
        {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied' && (
          <button onClick={() => window.TestSends && window.TestSends.requestPermission()}
            style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--accent)', color:'var(--accent)', borderRadius: 8, cursor:'pointer', fontSize: 11.5, fontFamily:'var(--font-sans)', fontWeight: 700 }}>
            {T('matrix.activateNative')}
          </button>
        )}
        <button onClick={() => { window.ChannelNotifs && window.ChannelNotifs.reset(); }}
          style={{ padding:'7px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontSize: 11.5, fontFamily:'var(--font-sans)', fontWeight: 600 }}>
          {T('matrix.reset')}
        </button>
      </div>

      {/* Historial de tests · solo si hay envíos */}
      {history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.08em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight: 700, marginBottom: 8 }}>{T('matrix.lastTests')} · {history.length}</div>
          <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} style={{ padding:'5px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 999, display:'inline-flex', alignItems:'center', gap: 6, fontSize: 11, color:'var(--fg-muted)' }}>
                <span style={{ width: 5, height: 5, borderRadius:'50%', background:'var(--ok)' }}/>
                {h.channelLabel} · {new Date(h.ts).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


// ── Channel Manager Panel ─────────────────────────────────────────────────
function ChannelManagerPanel({ chState, catalog }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [connecting, setConnecting] = useEV2(null);

  const startConnect = (chId) => {
    setConnecting(chId);
    // mock OAuth · 800 ms de "redirección"
    setTimeout(() => {
      window.Channels && window.Channels.connect(chId);
      setConnecting(null);
    }, 800);
  };

  const connectedCount = catalog.filter(c => chState[c.id] && chState[c.id].connected).length;

  return (
    <section>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 16, gap:12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{T('channels.connected.title')}</h2>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{T('channels.connected.sub').replace('{n}', connectedCount).replace('{total}', catalog.filter(c => c.available).length)}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {catalog.map(c => {
          const state = chState[c.id];
          const connected = !!(state && state.connected);
          const primary = chState.primary === c.id && connected;
          const isConnecting = connecting === c.id;
          const since = state && state.since ? Math.floor((Date.now() - state.since) / 86400000) : null;
          return (
            <div key={c.id} style={{
              padding: '16px 18px',
              background: connected ? `linear-gradient(135deg, ${c.color}10 0%, var(--bg-surface) 100%)` : 'var(--bg-surface)',
              border: `1.5px solid ${primary ? c.color : connected ? `${c.color}55` : 'var(--line)'}`,
              borderRadius: 14,
              display:'flex', flexDirection:'column', gap: 10,
              opacity: c.available ? 1 : 0.55,
              position:'relative',
            }}>
              {primary && (
                <div style={{ position:'absolute', top: -10, left: 12, padding:'2px 8px', background: c.color, color:'#fff', fontFamily:'var(--font-mono)', fontSize: 9, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, borderRadius: 999 }}>{T('channels.primary')}</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color:'var(--fg)' }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2, lineHeight:1.4 }}>{c.desc}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius:'50%', background: connected ? '#22C55E' : 'var(--fg-dim)', boxShadow: connected ? '0 0 0 3px rgba(34,197,94,0.18)' : 'none', flexShrink:0 }} title={connected ? T('rules.active') : T('common.deactivate')}/>
              </div>

              {!c.available && (
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'0.06em', color:'var(--fg-dim)', textTransform:'uppercase', fontWeight:700 }}>{T('channels.soon')}</div>
              )}

              {connected && (
                <div style={{ padding: '8px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, letterSpacing:'0.06em', color:'var(--fg-muted)', textTransform:'uppercase', fontWeight:700 }}>{T('channels.account')}</div>
                    <div style={{ fontSize: 12.5, color:'var(--fg)', fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{state.account}</div>
                  </div>
                  {since != null && (
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', whiteSpace:'nowrap' }}>{since === 0 ? T('channels.today') : (T('channels.daysAgo','hace {n}d').replace('{n}', since))}</div>
                  )}
                </div>
              )}

              <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 'auto' }}>
                {!connected && c.available && (
                  <button onClick={() => startConnect(c.id)} disabled={isConnecting} style={{
                    flex: 1, padding:'9px 12px', background: c.color, color:'#fff', border:'none', borderRadius: 8,
                    cursor: isConnecting ? 'wait' : 'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 12,
                    opacity: isConnecting ? 0.7 : 1,
                  }}>
                    {(() => {
                      // En modo demo · botón siempre dice "Activar" (sin diferenciar OAuth/phone),
                      // alineado con spec del cliente: simplicidad por encima de precisión técnica.
                      const _dm = window.DemoMode;
                      const demoLabel = _dm && _dm.label && _dm.label('channels_action_label', null);
                      if (isConnecting) return T('channels.connecting');
                      if (demoLabel) return '🔔 ' + demoLabel;
                      return c.authType === 'oauth' ? '🔐 ' + T('channels.connect') + ' (OAuth)'
                           : c.authType === 'phone' ? '📱 ' + T('channels.connect')
                           : '🔔 ' + T('common.activate');
                    })()}
                  </button>
                )}
                {connected && !primary && (
                  <button onClick={() => window.Channels && window.Channels.setPrimary(c.id)} style={{
                    padding:'7px 10px', background:'transparent', border:`1px solid ${c.color}`, color: c.color, borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 11.5,
                  }}>{T('channels.markPrimary')}</button>
                )}
                {connected && (
                  <button onClick={() => window.Channels && window.Channels.reauth(c.id)} title="Re-authenticate OAuth" style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.reauth')}</button>
                )}
                {connected && (
                  <button onClick={() => { if (confirm(T('channels.confirmDisconnect') + ' ' + c.label + '?')) window.Channels && window.Channels.disconnect(c.id); }} style={{
                    padding:'7px 10px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.disconnect')}</button>
                )}
                {!c.available && (
                  <button disabled style={{
                    flex: 1, padding:'9px 12px', background:'var(--bg-surface)', color:'var(--fg-dim)', border:'1px dashed var(--line)', borderRadius: 8,
                    cursor:'not-allowed', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 11.5,
                  }}>{T('channels.soon')}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Delivery Preferences Panel ────────────────────────────────────────────
function DeliveryPreferencesPanel({ channelColor }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const lang = (window.I18n && window.I18n.currentLang && window.I18n.currentLang()) || 'es';
  const [prefs, setPrefs] = useEV2(() => (window.DeliveryPrefs && window.DeliveryPrefs.get()) || {});
  // Día abreviado y largo · localizado
  const DAY_NAMES = {
    es: { short:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], long:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'] },
    en: { short:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], long:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    pt: { short:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], long:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'] },
  };
  const dayLabels = (DAY_NAMES[lang] || DAY_NAMES.es).short;
  const dayLabelsLong = (DAY_NAMES[lang] || DAY_NAMES.es).long;

  useEE2(() => {
    const onChange = (e) => setPrefs(e.detail || (window.DeliveryPrefs && window.DeliveryPrefs.get()));
    window.addEventListener('delivery-prefs-changed', onChange);
    return () => window.removeEventListener('delivery-prefs-changed', onChange);
  }, []);

  const update = (patch) => {
    const next = window.DeliveryPrefs ? window.DeliveryPrefs.save({ ...prefs, ...patch }) : { ...prefs, ...patch };
    setPrefs(next);
  };

  const setMode = (mode) => update({ mode });
  const toggleDay = (i) => {
    if (prefs.mode !== 'custom') {
      // si se modifica un día y el modo no es custom, pasar a custom
      const days = [...(prefs.days || [false,false,false,false,false,false,false])];
      days[i] = !days[i];
      update({ mode:'custom', days });
    } else {
      const days = [...(prefs.days || [false,false,false,false,false,false,false])];
      days[i] = !days[i];
      update({ days });
    }
  };

  const next = window.DeliveryPrefs ? window.DeliveryPrefs.nextDelivery(prefs) : null;
  const nextLabel = window.DeliveryPrefs ? window.DeliveryPrefs.formatNext(next) : 'Sin programar';

  const MODES = [
    { id:'daily',    label:T('delivery.mode.daily'),    icon:'☀️', desc:T('delivery.mode.daily.sub') },
    { id:'weekdays', label:T('delivery.mode.weekdays'), icon:'💼', desc:T('delivery.mode.weekdays.sub') },
    { id:'weekends', label:T('delivery.mode.weekends'), icon:'🏖',  desc:T('delivery.mode.weekends.sub') },
    { id:'weekly',   label:T('delivery.mode.weekly'),   icon:'📅', desc:T('delivery.mode.weekly.sub') },
    { id:'custom',   label:T('delivery.mode.custom'),   icon:'⚙️', desc:T('delivery.mode.custom.sub') },
    { id:'smart-ai', label:T('delivery.mode.smart'),    icon:'✨', desc:T('delivery.mode.smart.sub') },
  ];

  const activeDayCount = (prefs.days || []).filter(Boolean).length;
  const isSmart = prefs.mode === 'smart-ai';

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{T('delivery.title')}</h2>
      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>{T('delivery.sub')}</div>

      {/* ENABLED toggle + Next delivery card */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom: 24 }}>
        <div style={{ padding:'18px 22px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:14.5, fontWeight:700, color:'var(--fg)' }}>{T('delivery.enabled.label')}</div>
            <div style={{ fontSize:12, color:'var(--fg-muted)', marginTop:3 }}>{prefs.enabled ? T('delivery.enabled.on') : T('delivery.enabled.off')}</div>
          </div>
          <button onClick={() => update({ enabled: !prefs.enabled })} aria-label="Toggle delivery"
            style={{ width:48, height:26, background: prefs.enabled ? channelColor : 'rgba(15,23,42,0.18)', borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:20, height:20, background:'#fff', borderRadius:'50%', position:'absolute', top:3, left: prefs.enabled ? 25 : 3, transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.18)' }}/>
          </button>
        </div>
        <div style={{ padding:'18px 22px', background:`linear-gradient(135deg, ${channelColor}14 0%, transparent 100%)`, border:`1px solid ${channelColor}40`, borderRadius:14 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:5 }}>{T('delivery.next')}</div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--fg)' }}>{prefs.enabled ? nextLabel : T('delivery.paused')}</div>
        </div>
      </div>

      {/* MODE selector */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>{T('delivery.mode.title')}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10, marginBottom:28 }}>
        {MODES.map(m => {
          const active = prefs.mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                padding:'14px 16px', borderRadius:12, cursor:'pointer', textAlign:'left',
                background: active ? `linear-gradient(135deg, ${channelColor}15 0%, ${channelColor}05 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${active ? channelColor : 'var(--line)'}`,
                color: 'var(--fg)', transition:'all .15s',
                display:'flex', alignItems:'flex-start', gap:10,
              }}>
              <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{m.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color: active ? channelColor : 'var(--fg)' }}>{m.label}</div>
                <div style={{ fontSize:11.5, color:'var(--fg-muted)', marginTop:2, lineHeight:1.35 }}>{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* DAYS picker · siempre visible, deshabilitado si smart-ai */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700, marginBottom:10 }}>
        {T('delivery.days.title')} {isSmart && <span style={{ color: channelColor }}>{T('delivery.days.byBeonai')}</span>}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom: 28, opacity: isSmart ? 0.5 : 1, pointerEvents: isSmart ? 'none' : 'auto' }}>
        {dayLabels.map((lbl, i) => {
          const active = (prefs.days || [])[i];
          return (
            <button key={i} onClick={() => toggleDay(i)} title={dayLabelsLong[i]}
              style={{
                width:54, padding:'12px 0', borderRadius:10, cursor:'pointer', textAlign:'center',
                background: active ? channelColor : 'var(--bg-surface)',
                color: active ? '#fff' : 'var(--fg-muted)',
                border: `1px solid ${active ? channelColor : 'var(--line)'}`,
                fontWeight: 700, fontSize:13, fontFamily:'var(--font-sans)',
                transition:'all .12s',
              }}>{lbl}</button>
          );
        })}
        <div style={{ flex:1, alignSelf:'center', textAlign:'right', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-muted)' }}>
          {T('delivery.days.count').replace('{n}', activeDayCount)}
        </div>
      </div>

      {/* TIME + TIMEZONE */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 200px', gap:16, marginBottom: 24, alignItems:'flex-end' }}>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>{T('delivery.time.title')}</span>
          <input type="time" value={prefs.time || '09:00'} onChange={e => update({ time: e.target.value })} disabled={isSmart}
            style={{ padding:'10px 14px', fontSize:14, fontFamily:'var(--font-mono)', background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10, opacity: isSmart ? 0.5 : 1 }}/>
        </label>
        <div style={{ alignSelf:'center', fontSize:12, color:'var(--fg-muted)', padding:'10px 14px', background:`${channelColor}08`, border:`1px solid ${channelColor}25`, borderRadius:10 }}>
          {isSmart
            ? <span>✨ <strong style={{color:channelColor}}>BeonAI</strong> {T('delivery.smartExplain','elige el horario óptimo según tu historial: cuando más interactúas, evitando bloques de reuniones y respetando tus quiet hours.').replace('✨ BeonAI ', '').replace('✨ ', '')}</span>
            : (() => {
                const limit = prefs.maxPerDay > 1
                  ? T('delivery.maxPerDayMulti','Hasta {n} mensajes/día.').replace('{n}', prefs.maxPerDay)
                  : T('delivery.maxPerDay','1 mensaje al día como máximo');
                const tpl = T('delivery.recvExplain','Recibirás el contenido a las {time}. {limit}');
                const parts = tpl.split('{time}');
                const before = parts[0];
                const afterRaw = (parts[1] || '').replace('{limit}', limit);
                return <span>{before}<strong style={{color:channelColor}}>{prefs.time || '09:00'}</strong>{afterRaw}</span>;
              })()
          }
        </div>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', fontWeight:700 }}>{T('delivery.tz.title')}</span>
          <select value={prefs.timezone || 'auto'} onChange={e => update({ timezone: e.target.value })}
            style={{ padding:'10px 14px', fontSize:13, background:'var(--bg-surface)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius:10 }}>
            <option value="auto">{T('delivery.tz.auto')} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
            <option value="Europe/Madrid">Europe/Madrid</option>
            <option value="Europe/Lisbon">Europe/Lisbon</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="America/Bogota">America/Bogota</option>
          </select>
        </label>
      </div>

      {/* MAX PER DAY · slider de límite diario */}
      <div style={{ padding:'14px 18px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 12, marginBottom: 18, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color:'var(--fg)' }}>{T('delivery.maxDaily.title')}</div>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 3 }}>{T('delivery.maxDaily.sub')}</div>
        </div>
        <input type="range" min="1" max="10" value={prefs.maxPerDay || 1} onChange={e => update({ maxPerDay: parseInt(e.target.value, 10) })}
          style={{ flex: 1, minWidth: 180, accentColor: channelColor }}/>
        <div style={{ minWidth: 64, textAlign:'right' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 22, fontWeight: 800, color: channelColor }}>{prefs.maxPerDay || 1}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)', marginLeft: 4 }}>/día</span>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={() => { window.DeliveryPrefs && window.DeliveryPrefs.reset(); setPrefs(window.DeliveryPrefs.get()); }}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:600 }}>
          ↻ Restablecer
        </button>
        {window.TestSends && (
          <button onClick={() => {
            const ch = window.Channels && window.Channels.get && window.Channels.get();
            const primaryId = ch && ch.primary;
            const def = primaryId && window.Channels && window.Channels.CATALOG.find(c => c.id === primaryId);
            if (def) window.TestSends.send(def.id, def.label);
            else if (window.Toast) window.Toast.info(T('delivery.testWarn'), { icon:'⚠️' });
          }}
            style={{ padding:'8px 14px', background: channelColor, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:700 }}>
            {T('delivery.testBtn')}
          </button>
        )}
        <div style={{ flex:1, textAlign:'right', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-dim)', letterSpacing:'0.06em' }}>
          {T('delivery.autoSave','Auto-save · last update')} {new Date(prefs.updatedAt || Date.now()).toLocaleTimeString(lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-ES', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   InboxView · listado de notificaciones · API real Inbox.getAll()
   ============================================================ */
function InboxView({ openDetail }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const [data, setData] = useEV2(() => (window.Inbox && window.Inbox.getAll && window.Inbox.getAll()) || { messages:[], notifications:[], releases:[] });
  const [tab, setTab] = useEV2('messages');
  useEE2(() => {
    if (window.Inbox && window.Inbox.seedIfEmpty) window.Inbox.seedIfEmpty();
    setData(window.Inbox.getAll());
    const onChange = () => setData(window.Inbox.getAll());
    window.addEventListener('inbox-changed', onChange);
    return () => window.removeEventListener('inbox-changed', onChange);
  }, []);

  const items = (data[tab] || []).slice().sort((a,b) => (b.createdAt || b.ts || 0) - (a.createdAt || a.ts || 0));
  const unread = items.filter(m => !m.read);
  const read   = items.filter(m =>  m.read);
  const totalUnread = (data.messages || []).filter(m => !m.read).length
                    + (data.notifications || []).filter(m => !m.read).length
                    + (data.releases || []).filter(m => !m.read).length;

  const TABS = [
    { id:'messages',      label:T('inbox.tab.messages'),  icon:'💬', count:(data.messages||[]).filter(m => !m.read).length },
    { id:'notifications', label:T('inbox.tab.notifs'),    icon:'🔔', count:(data.notifications||[]).filter(m => !m.read).length },
    { id:'releases',      label:T('inbox.tab.releases'),  icon:'✨', count:(data.releases||[]).filter(m => !m.read).length },
  ];

  // Resuelve título · cuerpo · icono según el tipo de elemento (messages/notifications/releases)
  const _titleOf = (m) => m.title || m.subject || m.summary || m.text || 'Sin asunto';
  const _bodyOf  = (m) => m.body  || m.preview || m.message || m.description || (m.title ? '' : m.text) || '';
  const _iconOf  = (m) => m.icon || (tab === 'releases' ? '✨' : tab === 'messages' ? '💬' : '🔔');

  const PILLS_BY_ID = ((D && D.PILLS) || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  const onItemClick = (m) => {
    if (window.Inbox && window.Inbox.markRead) window.Inbox.markRead(tab, m.id);
    if (!m || !m.link) return;
    // Soporta prefijos `pill:` y `path:` (con o sin `#` opcional). Admin
    // assign genera `#path:<id>`; pills viejas usan `pill:<id>`.
    const linkStr = String(m.link).replace(/^#/, '');
    if (linkStr.startsWith('path:')) {
      const pathId = linkStr.slice(5);
      if (window.__openPath) { window.__openPath(pathId); return; }
    }
    const pillId = linkStr.startsWith('pill:') ? linkStr.slice(5) : linkStr;
    const pill = PILLS_BY_ID[pillId];
    if (pill && openDetail) openDetail(pill);
  };

  const renderItem = (m) => {
    const title = _titleOf(m);
    const body  = _bodyOf(m);
    const icon  = _iconOf(m);
    const isAchievement = m.kind === 'achievement';
    return (
      <article key={m.id} style={{
        padding: 18, marginBottom: 10, background: m.read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        border: `1px solid var(--line)`,
        borderLeft: m.read ? '1px solid var(--line)' : `3px solid ${isAchievement ? 'var(--ok)' : 'var(--accent)'}`,
        borderRadius: 'var(--r-2)', cursor: 'pointer', display:'flex', gap: 12,
      }} onClick={() => onItemClick(m)}>
        <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: isAchievement ? 'rgba(34,197,94,0.16)' : 'var(--bg-elevated)', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{title}</div>
            <div style={{ fontSize: 11, color:'var(--fg-dim)', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
              {m.time || (m.createdAt && new Date(m.createdAt).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })) || ''}
            </div>
          </div>
          {body && <div style={{ fontSize: 13, color:'var(--fg-muted)', lineHeight: 1.5 }}>{body}</div>}
          {m.from && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', marginTop: 6 }}>De · {m.from}</div>}
          {m.version && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', marginTop: 6 }}>v{m.version}</div>}
        </div>
        {tab !== 'releases' && (
          <button onClick={(e) => { e.stopPropagation(); if (confirm('¿Borrar este elemento?')) { window.Inbox && window.Inbox.deleteItem && window.Inbox.deleteItem(tab, m.id); } }}
            title="Borrar" aria-label="Borrar"
            style={{ width: 28, height: 28, padding: 0, flexShrink: 0, background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 14, alignSelf:'flex-start' }}>
            ×
          </button>
        )}
      </article>
    );
  };

  const totalAll = (data.messages||[]).length + (data.notifications||[]).length + (data.releases||[]).length;

  return (
    <PageShell
      eyebrow={`Bandeja · ${totalAll} elementos`}
      title={<>Tus <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>notificaciones</em></>}
      sub={totalUnread > 0 ? `${totalUnread} ${T('inbox.unread').toLowerCase()}` : ''}
      actions={items.length > 0 && unread.length > 0 ? (
        <button onClick={() => window.Inbox && window.Inbox.markAllRead && window.Inbox.markAllRead(tab)}
          style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 8, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>
          {T('inbox.markAllRead')}
        </button>
      ) : null}>

      {/* TABS */}
      <div style={{ display:'flex', gap: 2, marginBottom: 24, borderBottom:'1px solid var(--line)', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 16px 9px', background:'transparent', border:'none',
              borderBottom: '2px solid ' + (sel ? 'var(--accent)' : 'transparent'),
              color: sel ? 'var(--fg)' : 'var(--fg-muted)',
              fontFamily:'var(--font-sans)', fontWeight: sel ? 700 : 500, fontSize: 13.5,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap: 8, marginBottom: -1,
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count > 0 && <span style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, padding:'1px 7px', background:'var(--accent)', color:'#fff', borderRadius: 999, fontWeight: 700 }}>{t.count}</span>}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 60, textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('inbox.empty')}</div>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('inbox.emptyDesc')}</div>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>{T('inbox.unread')} · {unread.length}</h2>
              {unread.map(renderItem)}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-dim)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 12 }}>{T('inbox.read')} · {read.length}</h2>
              {read.map(renderItem)}
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

/* ============================================================
   SavedView · bookmarks grid
   ============================================================ */
function SavedView({ openDetail }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const [bmIds, setBmIds] = useEV2(() => (window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get()) || []);
  useEE2(() => {
    const onChange = () => setBmIds((window.Bookmarks && window.Bookmarks.get && window.Bookmarks.get()) || []);
    window.addEventListener('bookmarks-changed', onChange);
    return () => window.removeEventListener('bookmarks-changed', onChange);
  }, []);
  const saved = PILLS.filter(p => bmIds.includes(p.id));

  return (
    <PageShell
      eyebrow={T('saved.eyebrow')}
      title={<>{T('saved.title')}</>}
      sub={`${saved.length} ${T('saved.count')}`}>

      {saved.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔖</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>{T('saved.empty')}</div>
          <div style={{ fontSize: 13.5, color: 'var(--fg-muted)' }}>{T('saved.emptyDesc')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {saved.map(p => {
            const slug = _slug(p.category);
            return (
              <article key={p.id} className="card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                <div className={`card-cover cat-${slug}`}/>
                <div className="card-grad"/>
                <span className="card-pill-num">{String(p.category).toUpperCase()} · {p.pill}</span>
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>
                  <div className="card-meta"><span>{p.duration}</span><span className="sep">·</span><span>{p.level}</span></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

/* ============================================================
   ProfileView · datos usuario + progreso resumen
   ============================================================ */
function ProfileView({ setView }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const PILLS = (D && D.PILLS) || [];
  const completed = PILLS.filter(p => p.progress >= 1).length;
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 1).length;
  const [editing, setEditing] = useEV2(false);
  const [name, setName] = useEV2(USER.name || '');
  const [role, setRole] = useEV2(USER.role || '');
  const [team, setTeam] = useEV2(USER.team || '');

  // Reset cuando el usuario cambia (login/logout)
  useEE2(() => {
    setName(USER.name || ''); setRole(USER.role || ''); setTeam(USER.team || '');
  }, [USER.id]);

  const handleLogout = () => {
    if (!confirm(T('profile.confirmLogout') + ' ' + USER.name + '?')) return;
    if (window.Auth && window.Auth.logout) window.Auth.logout();
  };

  const saveEdits = () => {
    if (window.UserProfile && window.UserProfile.update) {
      window.UserProfile.update({ name, role, team });
      if (window.Toast) window.Toast.success(T('profile.updated'), { icon:'✓' });
    }
    setEditing(false);
  };
  const cancelEdits = () => {
    setName(USER.name || ''); setRole(USER.role || ''); setTeam(USER.team || '');
    setEditing(false);
  };

  return (
    <PageShell
      eyebrow={T('profile.title')}
      title={USER.name || 'Usuario'}
      sub={[USER.role, USER.team || window.WORKSPACE_NAME].filter(Boolean).join(' · ') || 'Sin equipo asignado'}
      narrow>

      {/* Avatar + info card · oculto en demo (la cabecera de PageShell ya
          muestra el nombre/rol; el spec pide "eliminar información
          adicional innecesaria" dejando sólo Certificados) */}
      {!(window.DemoMode && window.DemoMode.flag('simplified_profile') === true) && (
      <div style={{
        display: 'flex', gap: 32, padding: 32, background: 'var(--bg-surface)',
        border: '1px solid var(--line)', borderRadius: 'var(--r-2)', marginBottom: 24, alignItems: 'center',
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, fontWeight: 800, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em',
          flexShrink: 0,
        }}>{USER.initials || 'U'}</div>
        {!editing && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700, color: 'var(--fg)', margin: 0, marginBottom: 4 }}>{USER.name}</h2>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 12 }}>{USER.role} · {USER.team}</div>
            {(USER.systemRole === 'admin' || USER.isAdmin) && <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 9px', background:'var(--warn)', color:'#fff', borderRadius:4, marginRight: 6 }}>ADMIN</span>}
            {USER.systemRole === 'manager' && <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 9px', background:'var(--accent)', color:'#fff', borderRadius:4 }}>MANAGER</span>}
          </div>
        )}
        {editing && (
          <div style={{ flex: 1, display:'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
            <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.name')}</span>
              <input value={name} onChange={e => setName(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.team')}</span>
              <input value={team} onChange={e => setTeam(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}/>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:4, gridColumn:'1 / -1' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-muted)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight: 700 }}>{T('profile.role')}</span>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ padding:'10px 12px', fontSize: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 8, color:'var(--fg)' }}>
                {['Publish Agent','Care Agent','Reporting Agent','Manager','Analyst','Content Lead','Otro'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>
      )}

      {/* Stats · ocultos en demo mode con simplified_profile · solo se ven los stats
          completed/inProgress/daysActive dentro del avatar menu */}
      {!(window.DemoMode && window.DemoMode.flag('simplified_profile') === true) && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: T('profile.stats.completed'), value: completed, color: 'var(--ok)' },
          { label: T('profile.stats.inProgress'), value: inProgress, color: 'var(--accent)' },
          { label: T('profile.stats.daysActive'), value: 14, color: 'var(--info)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'var(--font-sans)' }}>{s.value}</div>
          </div>
        ))}
      </div>
      )}

      {/* Acciones · ocultas en demo mode con simplified_profile · admin se
          ve solo si el user es admin de plataforma */}
      {!(window.DemoMode && window.DemoMode.flag('simplified_profile') === true) && (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            padding: '12px 20px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            boxShadow:'0 4px 12px rgba(89,71,255,0.30)',
          }}>{T('profile.editBtn')}</button>
        )}
        {editing && (
          <>
            <button onClick={saveEdits} style={{
              padding: '12px 20px', background: 'var(--ok)', color: '#fff',
              border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            }}>✓ {T('common.save')}</button>
            <button onClick={cancelEdits} style={{
              padding: '12px 20px', background: 'transparent', color: 'var(--fg-muted)',
              border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
            }}>{T('common.cancel')}</button>
          </>
        )}
        <button onClick={() => setView('settings')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.settings')}</button>
        <button onClick={() => setView('saved')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.saved')}</button>
        <button onClick={() => setView('path')} style={{
          padding: '12px 20px', background: 'var(--bg-elevated)', color: 'var(--fg)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
        }}>{T('nav.path')}</button>
        <button onClick={handleLogout} style={{
          padding: '12px 20px', background: 'transparent', color: 'var(--accent)',
          border: '1px solid var(--accent)', borderRadius: 'var(--r-1)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, marginLeft: 'auto',
        }}>{T('common.logout')}</button>
      </div>
      )}
      {/* En demo mode el logout sigue siendo accesible vía un botón mínimo */}
      {(window.DemoMode && window.DemoMode.flag('simplified_profile') === true) && (
        <div style={{ marginTop: 24, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', background: 'transparent', color: 'var(--fg-muted)',
            border: '1px solid var(--line)', borderRadius: 'var(--r-1)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
          }}>{T('common.logout','Cerrar sesión')}</button>
        </div>
      )}

      {/* En demo · ProfileView ya no muestra MyCertificatesSection (esa va
          al popup del avatar via CertificatesView). En su lugar mostramos
          datos de contacto editables + Canales + Ajustes básicos integrados.
          El cliente pidió que el perfil no fuera solo certificados. */}
      {(window.DemoMode && window.DemoMode.flag('simplified_profile') === true)
        ? <ProfileDemoContent USER={USER}/>
        : <MyCertificatesSection/>}
    </PageShell>
  );
}

/* ============================================================
   ProfileDemoContent · datos + canales + ajustes integrados (demo)
   Solo aparece en demo · sustituye a MyCertificatesSection en
   ProfileView. Cubre la queja del cliente "el perfil solo tiene
   certificados, hay que incluir datos de contacto, ajustes y canales".
   ============================================================ */
function ProfileDemoContent({ USER }) {
  // Datos editables · persisten via UserProfile.update (name, role, team)
  // o localStorage (phone, sin columna en schema todavía).
  const [name, setName] = useEV2(USER.name || '');
  const [role, setRole] = useEV2(USER.role || '');
  const [team, setTeam] = useEV2(USER.team || '');
  const _phoneKey = 'solid-profile-phone:' + (USER.id || 'anon');
  const [phone, setPhone] = useEV2(() => {
    try { return localStorage.getItem(_phoneKey) || ''; } catch (e) { return ''; }
  });
  const [savingField, setSavingField] = useEV2(null);
  const saveField = (field, value) => {
    if (field === 'phone') {
      try { localStorage.setItem(_phoneKey, value); } catch (e) {}
      return;
    }
    if (window.UserProfile && window.UserProfile.update) {
      setSavingField(field);
      const patch = {}; patch[field] = value;
      // Espera la confirmación REAL del backend antes de decir "Guardado" ·
      // antes mostraba éxito al instante aunque el guardado fallara (RLS/red).
      Promise.resolve(window.UserProfile.update(patch)).then((r) => {
        if (!r || r.ok !== false) {
          if (window.Toast) window.Toast.success('Guardado', { icon: '✓' });
        } else {
          if (window.Toast) window.Toast.error('No se pudo guardar · revisa tu conexión');
        }
      }).catch(() => {
        if (window.Toast) window.Toast.error('No se pudo guardar');
      }).finally(() => setSavingField(null));
    }
  };
  // Sincroniza locales si USER cambia por evento externo
  useEE2(() => {
    setName(USER.name || '');
    setRole(USER.role || '');
    setTeam(USER.team || '');
  }, [USER.name, USER.role, USER.team]);

  const [lang, setLang]   = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().language) || 'es');
  // Estado real de la suscripción push (no un boolean decorativo). Se lee del
  // servicio al montar y el toggle llama a subscribe/unsubscribe de verdad.
  const [pushOn, setPushOn] = useEV2(false);
  const [pushBusy, setPushBusy] = useEV2(false);
  useEE2(() => {
    let alive = true;
    const P = window.PushNotifications;
    if (P && P.isActive) {
      Promise.resolve(P.isActive()).then(active => { if (alive) setPushOn(!!active); }).catch(() => {});
    }
    return () => { alive = false; };
  }, []);
  const togglePush = async () => {
    const P = window.PushNotifications;
    if (!P) { if (window.Toast) window.Toast.error('Notificaciones no disponibles en este navegador'); return; }
    if (!P.isSupported || !P.isSupported()) { if (window.Toast) window.Toast.error('Tu navegador no soporta notificaciones push'); return; }
    setPushBusy(true);
    try {
      if (!pushOn) {
        const r = await P.subscribe();
        if (r && r.error) {
          if (window.Toast) window.Toast.error(r.error === 'denied' ? 'Permiso de notificaciones denegado · actívalo en el navegador' : 'No se pudo activar: ' + r.error);
        } else {
          setPushOn(true);
          if (window.Toast) window.Toast.success('Notificaciones activadas', { icon: '🔔' });
        }
      } else {
        await P.unsubscribe();
        setPushOn(false);
        if (window.Toast) window.Toast.info('Notificaciones desactivadas');
      }
    } catch (e) {
      if (window.Toast) window.Toast.error('Error con las notificaciones: ' + (e.message || e));
    } finally {
      setPushBusy(false);
    }
  };
  const [chState, setChState] = useEV2(() => (window.Channels ? window.Channels.get() : {}));
  useEE2(() => {
    const onChange = (e) => setChState(e.detail || (window.Channels ? window.Channels.get() : {}));
    window.addEventListener('channels-changed', onChange);
    return () => window.removeEventListener('channels-changed', onChange);
  }, []);
  const _fullCatalog = (window.Channels && window.Channels.CATALOG) || [];
  const catalog = _fullCatalog.filter(c => ['whatsapp','teams','email'].indexOf(c.id) !== -1);

  const fieldStyle = {
    padding:'10px 12px', fontSize:14, background:'var(--bg-elevated)',
    border:'1px solid var(--line)', borderRadius:8, color:'var(--fg)', width:'100%',
  };
  const labelStyle = {
    fontFamily:'var(--font-mono, monospace)', fontSize:10, color:'var(--fg-muted)',
    letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, marginBottom:6,
  };
  const cardStyle = {
    padding:24, background:'var(--bg-surface)', border:'1px solid var(--line)',
    borderRadius:14, marginBottom:20,
  };
  const sectionTitle = { fontSize:16, fontWeight:700, color:'var(--fg)', margin:'0 0 4px' };
  const sectionSub   = { fontSize:13, color:'var(--fg-muted)', margin:'0 0 18px' };

  return (
    <div style={{ marginTop:24 }}>
      {/* AVATAR · subida directa a Supabase Storage */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Foto de perfil</h3>
        <p style={sectionSub}>Aparecerá en la barra superior y en cualquier interacción del workspace.</p>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{
            width:84, height:84, borderRadius:'50%',
            background: USER.avatarUrl
              ? `url(${USER.avatarUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:30, fontWeight:800, fontFamily:'var(--font-sans)',
            flexShrink:0, boxShadow:'0 4px 14px rgba(0,0,0,0.25)',
            border:'2px solid var(--line)',
          }}>{!USER.avatarUrl && (USER.initials || 'U')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <label style={{
              padding:'8px 14px', background:'var(--accent)', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'var(--font-sans)', fontWeight:700, fontSize:12.5,
              display:'inline-flex', alignItems:'center', gap:6, width:'fit-content',
            }}>
              {USER.avatarUrl ? 'Cambiar foto' : 'Subir foto'}
              <input type="file" accept="image/*" style={{display:'none'}}
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  if (!window.UserProfile || !window.UserProfile.uploadAvatar) {
                    if (window.Toast) window.Toast.info('Avatar upload no disponible');
                    return;
                  }
                  setSavingField('avatar');
                  try {
                    const url = await window.UserProfile.uploadAvatar(file);
                    if (url && window.Toast) window.Toast.success('Foto actualizada', { icon:'✓' });
                  } catch (err) {
                    if (window.Toast) window.Toast.info('No se pudo subir · ' + (err.message || 'error'));
                  } finally {
                    setSavingField(null);
                    e.target.value = ''; // reset input
                  }
                }}/>
            </label>
            {USER.avatarUrl && (
              <button onClick={async () => {
                if (!confirm('¿Quitar foto de perfil?')) return;
                setSavingField('avatar');
                try {
                  if (window.UserProfile && window.UserProfile.update) {
                    window.UserProfile.update({ avatarUrl: null });
                  }
                } finally { setTimeout(() => setSavingField(null), 400); }
              }} style={{
                padding:'6px 12px', background:'transparent', color:'var(--fg-muted)',
                border:'1px solid var(--line)', borderRadius:8, cursor:'pointer',
                fontFamily:'var(--font-sans)', fontWeight:600, fontSize:11.5, width:'fit-content',
              }}>Quitar foto</button>
            )}
            {savingField === 'avatar' && <span style={{fontSize:11, color:'var(--accent)'}}>subiendo…</span>}
            <span style={{fontSize:11, color:'var(--fg-muted)'}}>JPG/PNG · máx 2MB · cuadrada recomendada</span>
          </div>
        </div>
      </div>

      {/* DATOS DE CONTACTO · editables (blur = save) */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Datos de contacto</h3>
        <p style={sectionSub}>Edita y los cambios se guardan al salir del campo. Email no editable desde aquí.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <label><div style={labelStyle}>Nombre completo {savingField === 'name' && <span style={{color:'var(--accent)'}}>· guardando…</span>}</div>
            <input style={fieldStyle} value={name}
              onChange={e => setName(e.target.value)}
              onBlur={e => { if (e.target.value !== USER.name) saveField('name', e.target.value); }}/></label>
          <label><div style={labelStyle}>Email · readonly</div>
            <input style={Object.assign({}, fieldStyle, {opacity:0.6, cursor:'not-allowed'})} value={USER.email || ''} readOnly/></label>
          <label><div style={labelStyle}>Teléfono</div>
            <input style={fieldStyle} value={phone} placeholder="+34 6XX XXX XXX"
              onChange={e => setPhone(e.target.value)}
              onBlur={e => saveField('phone', e.target.value)}/></label>
          <label><div style={labelStyle}>Cargo {savingField === 'role' && <span style={{color:'var(--accent)'}}>· guardando…</span>}</div>
            <input style={fieldStyle} value={role}
              onChange={e => setRole(e.target.value)}
              onBlur={e => { if (e.target.value !== USER.role) saveField('role', e.target.value); }}/></label>
          <label style={{ gridColumn:'1 / -1' }}><div style={labelStyle}>Equipo / Departamento {savingField === 'team' && <span style={{color:'var(--accent)'}}>· guardando…</span>}</div>
            <input style={fieldStyle} value={team}
              onChange={e => setTeam(e.target.value)}
              onBlur={e => { if (e.target.value !== USER.team) saveField('team', e.target.value); }}/></label>
        </div>
      </div>

      {/* CANALES */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Canales de notificación</h3>
        <p style={sectionSub}>Recibe las pildoras del día, recordatorios y novedades por el canal que prefieras.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
          {catalog.map(c => {
            const state = chState[c.id] || {};
            const connected = !!state.connected;
            return (
              <div key={c.id} style={{
                padding:14, background: connected ? `${c.color}10` : 'var(--bg-elevated)',
                border:`1.5px solid ${connected ? c.color : 'var(--line)'}`, borderRadius:12,
                display:'flex', flexDirection:'column', gap:8,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:10, background:c.color, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                  }}>{c.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>{c.label}</div>
                    <div style={{ fontSize:11, color:'var(--fg-muted)' }}>{connected ? 'Activado' : 'Inactivo'}</div>
                  </div>
                </div>
                <button onClick={() => {
                  if (!window.Channels) return;
                  if (connected) window.Channels.disconnect(c.id);
                  else window.Channels.connect(c.id);
                }} style={{
                  padding:'8px 10px', background: connected ? 'transparent' : c.color,
                  color: connected ? c.color : '#fff', border:`1px solid ${c.color}`,
                  borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12,
                }}>{connected ? 'Desactivar' : 'Activar'}</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AJUSTES BÁSICOS */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Ajustes</h3>
        <p style={sectionSub}>Preferencias del perfil · idioma y notificaciones push.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <label><div style={labelStyle}>Idioma</div>
            <select value={lang} onChange={e => {
              setLang(e.target.value);
              if (window.Settings && window.Settings.update) window.Settings.update({ language: e.target.value });
            }} style={fieldStyle}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select></label>
          <label><div style={labelStyle}>Notificaciones push</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0' }}>
              <button onClick={togglePush} disabled={pushBusy} style={{
                width:48, height:26, borderRadius:13, padding:0,
                background: pushOn ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                border:'none', cursor: pushBusy ? 'wait' : 'pointer', position:'relative', transition:'background .2s', opacity: pushBusy ? 0.6 : 1,
              }}>
                <span style={{
                  position:'absolute', top:3, left: pushOn ? 25 : 3,
                  width:20, height:20, borderRadius:'50%', background:'#fff',
                  transition:'left .2s',
                }}/>
              </button>
              <span style={{ fontSize:13, color:'var(--fg-muted)' }}>{pushBusy ? 'Procesando…' : (pushOn ? 'Activadas' : 'Desactivadas')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Bases legales · link discreto si el workspace lo tiene configurado */}
      {(() => {
        const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
        const legalUrl = (ws.settings && ws.settings.legal_url) || null;
        if (!legalUrl) return null;
        return (
          <div style={{
            marginTop: 18, padding:'12px 16px', background:'var(--bg-surface)',
            border:'1px solid var(--line)', borderRadius: 8,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12, flexWrap:'wrap',
          }}>
            <div style={{ fontSize: 12.5, color:'var(--fg-muted)' }}>
              Bases legales y política de privacidad del programa.
            </div>
            <a href={legalUrl} target="_blank" rel="noopener noreferrer" style={{
              padding:'6px 12px', background:'transparent', color:'var(--accent)',
              textDecoration:'none', border:'1px solid var(--line)', borderRadius: 6,
              fontFamily:'var(--font-sans)', fontWeight: 600, fontSize: 12,
            }}>Ver bases legales →</a>
          </div>
        );
      })()}
    </div>
  );
}
window.ProfileDemoContent = ProfileDemoContent;

/* ============================================================
   MyCertificatesSection · lista de certs del user en su Profile
   ============================================================ */
function MyCertificatesSection() {
  const [, setTick] = useEV2(0);
  useEE2(() => {
    const r = () => setTick(t => t + 1);
    window.addEventListener('certificates-changed', r);
    return () => window.removeEventListener('certificates-changed', r);
  }, []);
  if (!window.Certificates) return null;
  const certs = window.Certificates.list();

  if (certs.length === 0) {
    return (
      <div style={{ marginTop: 24, padding: 32, background:'var(--bg-surface)', border:'1px dashed var(--line)', borderRadius:'var(--r-2)', textAlign:'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
        <h3 style={{ fontFamily:'var(--font-sans)', fontSize: 16, fontWeight: 700, color:'var(--fg)', margin:'0 0 6px' }}>Aún sin certificados</h3>
        <p style={{ fontSize: 13, color:'var(--fg-muted)', margin: 0 }}>Completa todas las pills de una ruta para recibir tu primer certificado.</p>
      </div>
    );
  }

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e) { return iso; }
  };

  return (
    <div style={{ marginTop: 24, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily:'var(--font-sans)', fontSize: 16, fontWeight: 700, color:'var(--fg)', margin: 0 }}>🏆 Mis certificados</h3>
        <span style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-muted)', letterSpacing:'0.06em' }}>{certs.length} {certs.length === 1 ? 'certificado' : 'certificados'}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
        {certs.map(cert => (
          <div key={cert.id} style={{ display:'flex', alignItems:'center', gap: 14, padding:'14px 16px', background:'var(--paper)', border:'1px solid var(--line-2)', borderRadius: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background:'linear-gradient(135deg, var(--accent), var(--accent-deep))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18, flexShrink: 0 }}>🏆</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily:'var(--font-sans)', fontWeight: 700, fontSize: 13.5, color:'var(--fg)' }}>{cert.route_title || cert.route_id}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--fg-muted)', marginTop: 2, letterSpacing:'0.04em' }}>
                {cert.cert_number || '—'} · emitido {fmtDate(cert.completed_at)}
              </div>
            </div>
            <button onClick={() => window.Certificates.download(cert)} style={{
              padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 6, cursor:'pointer',
              fontFamily:'var(--font-sans)', fontSize: 12, fontWeight: 700,
            }}>↓ Descargar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
window.MyCertificatesSection = MyCertificatesSection;

/* ============================================================
   SettingsView · preferencias
   ============================================================ */
function SettingsView({ setView }) {
  // SaaS forzado en dark · sin selector de tema (ver theme-controller en
  // prototype-main.jsx). Solo conservamos preferencia de idioma.
  const [lang, setLang] = useEV2(() => (window.Settings && window.Settings.get && window.Settings.get().language) || 'es');

  // Color de acento neutro para los paneles dentro de Settings
  // IMPORTANTE: usar hex directo (no CSS var) porque varios panels hacen
  // concatenación como `${channelColor}12` para alpha · CSS var() rompe ahí.
  const accentColor = '#6E50EE';

  const save = (key, val) => {
    if (window.Settings && window.Settings.update) window.Settings.update({ [key]: val });
  };

  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });

  return (
    <PageShell
      eyebrow={T('settings.eyebrow')}
      title={<>{T('settings.title')} <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}/></>}
      sub="">

      {/* General · tema + idioma */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{T('settings.general')}</h2>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>{T('settings.general.sub')}</div>

        {/* SaaS en dark mode forzado · selector de tema retirado. Analytics
            tiene su propio switch a light (ver AnalyticsView). Solo dejamos
            idioma como preferencia de usuario. */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 14 }}>
          {/* Idioma */}
          <div style={{ padding: 20, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12 }}>
            <h3 style={{ fontFamily:'var(--font-sans)', fontSize: 14.5, fontWeight: 700, color:'var(--fg)', margin:'0 0 4px' }}>{T('settings.language.title')}</h3>
            <p style={{ fontSize: 12, color:'var(--fg-muted)', margin:'0 0 12px' }}>{T('settings.language.desc')}</p>
            <select value={lang} onChange={e => { setLang(e.target.value); save('language', e.target.value); }} style={{
              padding:'8px 12px', fontFamily:'var(--font-sans)', fontSize: 12.5,
              background:'var(--bg-elevated)', color:'var(--fg)', border:'1px solid var(--line)', borderRadius: 6,
            }}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
      </section>

      {/* PUSH NOTIFICATIONS · Web Push API · suscripción del dispositivo */}
      <PushNotificationsPanel/>

      {/* Paneles avanzados ocultos en demo mode con simplified_settings · solo
          Idioma + Notificaciones Push quedan visibles · el resto requiere admin */}
      {!(window.DemoMode && window.DemoMode.flag('simplified_settings') === true) && (<>
        {/* SMART SCHEDULING · IA con análisis del mejor horario */}
        <SmartSchedulingPanel/>

        {/* CONTENT PUSH · qué contenido recibir */}
        <ContentPushPanel channelColor={accentColor}/>

        {/* SUBSCRIPTIONS · seguir categorías, skills, equipos, trainers */}
        <SubscriptionsPanel channelColor={accentColor}/>

        {/* NOTIFICATION RULES · quiet hours, vacation, digest, smart, priority */}
        <NotificationRulesPanel channelColor={accentColor}/>
      </>)}
    </PageShell>
  );
}

/* ============================================================
   AdminView · panel admin · solo admins · link a legacy
   ============================================================ */
function AdminView({ setView, openLegacyAdmin }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  // Lectura directa desde Auth · evita falsos negativos si SGS_DATA todavía
  // tiene el USER del primer build (cuando Auth aún no existía).
  const _canAdmin = !!(window.Auth && window.Auth.can && window.Auth.can('admin.viewPanel'));
  if (!_canAdmin) {
    return (
      <PageShell title={T('admin.locked')} sub={T('admin.lockedDesc','Solo administradores pueden ver este panel.')}>
        <div style={{ padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔒</div>
          <button onClick={() => setView('home')} style={{
            marginTop: 16, padding: '12px 24px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700,
          }}>{T('admin.backHome','Volver al inicio')}</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={T('admin.eyebrow')}
      title={<>{T('admin.title')}</>}
      sub={T('admin.sub')}
      actions={
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 20px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>{T('admin.full')}</button>
      }>

      {/* KPIs reales · derivados de Auth + Invitations + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(() => {
          const users   = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
          const invites = (window.Invitations && window.Invitations.list && window.Invitations.list()) || [];
          const pendingInv = invites.filter(i => i.status === 'pending' || i.status === 'invited' || !i.status).length;
          const PILLS = (D && D.PILLS) || [];
          const completedTotal = PILLS.filter(p => p.progress >= 1).length;
          const ratingStats = (window.Ratings && window.Ratings.globalStats && window.Ratings.globalStats()) || { avg: 0, count: 0 };
          const avgRating = ratingStats.avg || 0;
          const ratingsCount = ratingStats.count || 0;
          const adminCount = users.filter(u => u.systemRole === 'admin' || u.isAdmin).length;
          const usersSubKey = adminCount === 1 ? 'admin.users.sub' : 'admin.users.subMulti';
          const ratingsSubKey = ratingsCount === 1 ? 'admin.rating.subOne' : 'admin.rating.sub';
          return [
            { title: T('admin.users'),     value: String(users.length),    desc: T(usersSubKey,'{n} admin · plataforma').replace('{n}', adminCount), icon: '👥' },
            { title: T('admin.pending'),   value: String(pendingInv),       desc: T('admin.pending.sub','esperando aceptar'), icon: '✉️' },
            { title: T('admin.completed'), value: String(completedTotal),   desc: T('admin.completed.sub','de {total} disponibles').replace('{total}', PILLS.length), icon: '✓' },
            { title: T('admin.rating'),    value: avgRating ? avgRating.toFixed(1) + ' ★' : '—', desc: T(ratingsSubKey,'{n} puntuaciones').replace('{n}', ratingsCount), icon: '★' },
          ];
        })().map((s, i) => (
          <div key={i} style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--fg)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginTop: 0, marginBottom: 8 }}>{T('admin.full.title','Para gestionar todo')}</h2>
        <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 14 }}>{T('admin.full.desc','El panel completo de admin incluye: invitar usuarios (CSV bulk), revisar submissions de vídeo, audit log, bulk actions, exportar reportes.')}</p>
        <button onClick={openLegacyAdmin} style={{
          padding: '12px 24px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
        }}>{T('admin.full.btn','Abrir panel admin completo →')}</button>
      </div>

      {/* Workspaces · multi-tenant management */}
      <WorkspacesPanel/>

      {/* Theme preview · 5 opciones de Niebla fría + actual · solo admins */}
      <ThemePreviewPanel/>

      {/* Pills · catálogo del workspace activo (multi-tenant content) */}
      <PillsPanel/>

      {/* Catálogo extra · rutas / bloques / quick tips / podcasts del workspace */}
      <ContentPanel kind="path"    label="Rutas de certificación" icon="🛤"/>
      <ContentPanel kind="series"  label="Bloques formativos"     icon="📚"/>
      <ContentPanel kind="reel"    label="Quick tips (reels)"     icon="⚡"/>
      <ContentPanel kind="podcast" label="Charlas / podcasts"     icon="🎙"/>

      {/* Certificados emitidos en este workspace · vista admin · uno por
          user + ruta · descarga PDF */}
      <CertificatesAdminPanel/>

      {/* BeonAI · configuración del agente (system prompt, KB, modelo) */}
      <BeonAIConfigPanel/>
    </PageShell>
  );
}

/* ============================================================
   ThemePreviewPanel · visualización solo para admins
   ============================================================
   · 5 niveles de "Niebla fría" + actual (Gris neutro b86) como comparativa.
   · Click sobre una opción inyecta sus tokens vía <style id="theme-preview-override">
     dentro de <head> · preview INSTANTÁNEO sobre la propia plataforma.
   · "Aplicar permanente" persiste la elección en localStorage (clave global
     solid-theme-override) · al recargar se reinyecta automáticamente.
   · "Revertir" elimina el override y vuelve al :root del CSS.
   · Visible solo dentro de AdminView (que ya hace el check de admin.viewPanel).
   ============================================================ */
// SOLO variantes OSCURAS · todas con texto claro legible (var contraste WCAG).
// Antes había opciones claras "Niebla" que rompían la app (164 colores #fff
// hardcodeados → texto claro sobre claro). La base es oscuro premium, así que
// el panel ofrece tonos/temperaturas de gris oscuro, no claros.
const THEME_PREVIEW_OPTIONS = [
  {
    id: 'neutro',
    label: 'Gris neutro (actual)',
    note: 'gris plataforma neutro',
    tokens: {
      '--bg-deep':        '#1A1A1A', '--bg-canvas': '#1F1F1F', '--bg-surface': '#2A2A2A', '--bg-elevated': '#353535',
      '--bg-glass':'rgba(31,31,31,0.78)', '--bg-glass-strong':'rgba(31,31,31,0.94)', '--scrim':'rgba(26,26,26,0.85)',
      '--line-faint':'rgba(255,255,255,0.05)', '--line':'rgba(255,255,255,0.09)', '--line-strong':'rgba(255,255,255,0.18)',
      '--fg':'#F2F2F1', '--fg-muted':'#B9B9B7', '--fg-dim':'#9C9C9A', '--fg-faint':'#7E7E7C',
    },
  },
  {
    id: 'negro',
    label: 'Negro Netflix',
    note: 'casi negro · máximo contraste de cards',
    tokens: {
      '--bg-deep':        '#000000', '--bg-canvas': '#0E0E0E', '--bg-surface': '#1A1A1A', '--bg-elevated': '#262626',
      '--bg-glass':'rgba(14,14,14,0.80)', '--bg-glass-strong':'rgba(14,14,14,0.96)', '--scrim':'rgba(0,0,0,0.88)',
      '--line-faint':'rgba(255,255,255,0.05)', '--line':'rgba(255,255,255,0.10)', '--line-strong':'rgba(255,255,255,0.20)',
      '--fg':'#F5F5F4', '--fg-muted':'#BDBDBB', '--fg-dim':'#9A9A98', '--fg-faint':'#7C7C7A',
    },
  },
  {
    id: 'carbon',
    label: 'Carbón (medio)',
    note: 'gris medio · más suave a la vista',
    tokens: {
      '--bg-deep':        '#202022', '--bg-canvas': '#26262A', '--bg-surface': '#313137', '--bg-elevated': '#3C3C43',
      '--bg-glass':'rgba(38,38,42,0.78)', '--bg-glass-strong':'rgba(38,38,42,0.94)', '--scrim':'rgba(32,32,34,0.85)',
      '--line-faint':'rgba(255,255,255,0.06)', '--line':'rgba(255,255,255,0.10)', '--line-strong':'rgba(255,255,255,0.20)',
      '--fg':'#F2F2F3', '--fg-muted':'#BCBCC0', '--fg-dim':'#9E9EA3', '--fg-faint':'#808085',
    },
  },
  {
    id: 'grafito-calido',
    label: 'Grafito cálido',
    note: 'gris con un punto cálido · acogedor',
    tokens: {
      '--bg-deep':        '#1B1A18', '--bg-canvas': '#211F1D', '--bg-surface': '#2C2A27', '--bg-elevated': '#383531',
      '--bg-glass':'rgba(33,31,29,0.78)', '--bg-glass-strong':'rgba(33,31,29,0.94)', '--scrim':'rgba(27,26,24,0.85)',
      '--line-faint':'rgba(255,252,245,0.05)', '--line':'rgba(255,252,245,0.09)', '--line-strong':'rgba(255,252,245,0.18)',
      '--fg':'#F3F1EE', '--fg-muted':'#BAB6B0', '--fg-dim':'#9C9892', '--fg-faint':'#7E7A74',
    },
  },
  {
    id: 'azabache',
    label: 'Azabache frío',
    note: 'gris con un punto azulado · tech',
    tokens: {
      '--bg-deep':        '#16181C', '--bg-canvas': '#1C1F24', '--bg-surface': '#272B31', '--bg-elevated': '#333841',
      '--bg-glass':'rgba(28,31,36,0.78)', '--bg-glass-strong':'rgba(28,31,36,0.94)', '--scrim':'rgba(22,24,28,0.85)',
      '--line-faint':'rgba(255,255,255,0.05)', '--line':'rgba(255,255,255,0.09)', '--line-strong':'rgba(255,255,255,0.18)',
      '--fg':'#EFF1F4', '--fg-muted':'#B4B8C0', '--fg-dim':'#959AA4', '--fg-faint':'#777C86',
    },
  },
];

const THEME_OVERRIDE_KEY = 'solid-theme-override';
const THEME_OVERRIDE_STYLE_ID = 'theme-preview-override';

function _applyThemeTokens(tokens) {
  let style = document.getElementById(THEME_OVERRIDE_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = THEME_OVERRIDE_STYLE_ID;
    document.head.appendChild(style);
  }
  // Aplica a :root Y al override demo-mode para que gane sea cual sea el modo.
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v} !important;`).join('\n');
  style.textContent = [
    ':root {\n' + lines + '\n}',
    'html[data-demo-mode="true"] {\n' + lines + '\n}',
  ].join('\n');
}

function _clearThemeTokens() {
  const style = document.getElementById(THEME_OVERRIDE_STYLE_ID);
  if (style) style.remove();
}

// Restaura al arrancar la app si hay una elección persistida. Espera a que
// document.head exista (este archivo puede compilarse antes de tener head).
function _restorePersistedTheme() {
  try {
    const saved = localStorage.getItem(THEME_OVERRIDE_KEY);
    if (!saved) return;
    const opt = THEME_PREVIEW_OPTIONS.find(o => o.id === saved);
    if (!opt) return;
    if (document.head) {
      _applyThemeTokens(opt.tokens);
    } else {
      document.addEventListener('DOMContentLoaded', () => _applyThemeTokens(opt.tokens), { once: true });
    }
  } catch (e) {}
}
_restorePersistedTheme();

function ThemePreviewPanel() {
  const [activeId, setActiveId] = useEV2(() => {
    try { return localStorage.getItem(THEME_OVERRIDE_KEY) || null; } catch (e) { return null; }
  });
  const [persistedId, setPersistedId] = useEV2(() => {
    try { return localStorage.getItem(THEME_OVERRIDE_KEY) || null; } catch (e) { return null; }
  });

  const preview = (opt) => {
    setActiveId(opt.id);
    _applyThemeTokens(opt.tokens);
  };
  const apply = () => {
    if (!activeId) return;
    try { localStorage.setItem(THEME_OVERRIDE_KEY, activeId); } catch (e) {}
    setPersistedId(activeId);
    if (window.Toast) window.Toast.success('Tema aplicado para toda la plataforma · refresca para ver el efecto completo', { icon: '🎨' });
  };
  const revert = () => {
    try { localStorage.removeItem(THEME_OVERRIDE_KEY); } catch (e) {}
    _clearThemeTokens();
    setActiveId(null);
    setPersistedId(null);
    if (window.Toast) window.Toast.info('Tema revertido al base', { icon: '↩' });
  };

  return (
    <section style={{
      marginTop: 32, padding: 24, background:'var(--bg-surface)',
      border:'1px solid var(--line)', borderRadius:'var(--r-2)',
    }}>
      <header style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap: 12, marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color:'var(--fg)', margin: 0 }}>🎨 Tema · visualización</h2>
          <p style={{ fontSize: 13, color:'var(--fg-muted)', marginTop: 6, marginBottom: 0 }}>
            Solo admins. Pulsa una opción para PREVIEW instantáneo · "Aplicar"
            la deja persistida para toda la plataforma · "Revertir" vuelve al tema base.
          </p>
        </div>
        <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Persistido: <strong style={{ color:'var(--fg)' }}>{persistedId || 'base'}</strong>
          </span>
          <button onClick={apply} disabled={!activeId || activeId === persistedId} style={{
            padding:'8px 14px', background: (!activeId || activeId === persistedId) ? 'var(--bg-elevated)' : 'var(--accent)',
            color: (!activeId || activeId === persistedId) ? 'var(--fg-muted)' : '#fff',
            border:'none', borderRadius: 6, cursor: (!activeId || activeId === persistedId) ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 12.5,
          }}>Aplicar a toda la plataforma</button>
          <button onClick={revert} disabled={!persistedId && !activeId} style={{
            padding:'8px 14px', background:'transparent', color:'var(--fg-muted)',
            border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontWeight: 600, fontSize: 12.5,
          }}>Revertir</button>
        </div>
      </header>

      {/* Grid de opciones */}
      <div style={{
        marginTop: 18, display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 12,
      }}>
        {THEME_PREVIEW_OPTIONS.map(opt => {
          const active = opt.id === activeId;
          const persisted = opt.id === persistedId;
          return (
            <button key={opt.id} onClick={() => preview(opt)} style={{
              padding: 0, background:'transparent', border:'none', cursor:'pointer',
              textAlign:'left', position:'relative',
            }}>
              <div style={{
                padding: 14, borderRadius: 10,
                background: opt.tokens['--bg-canvas'],
                border: '2px solid ' + (active ? 'var(--accent)' : 'rgba(127,127,127,0.18)'),
                boxShadow: active ? '0 0 0 4px ' + (opt.tokens['--bg-canvas']) + ', 0 0 0 6px var(--accent)' : 'none',
                transition: 'box-shadow .2s, border-color .2s',
              }}>
                {/* Mini-mockup · 3 chips simulando surfaces */}
                <div style={{ display:'flex', gap: 5, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 18, borderRadius: 4, background: opt.tokens['--bg-surface'], border: '1px solid ' + opt.tokens['--line'] }}/>
                  <div style={{ flex: 1, height: 18, borderRadius: 4, background: opt.tokens['--bg-elevated'] }}/>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background:'#EC1C24' }}/>
                </div>
                {/* Label + nombre */}
                <div style={{ fontSize: 12.5, fontWeight: 700, color: opt.tokens['--fg'], marginBottom: 4 }}>
                  {opt.label}
                  {persisted && <span style={{ marginLeft: 6, fontFamily:'var(--font-mono)', fontSize: 8.5, padding:'1px 5px', background:'rgba(0,0,0,0.18)', color: opt.tokens['--fg'], borderRadius: 3, letterSpacing:'0.06em' }}>ACTIVO</span>}
                </div>
                <div style={{ fontSize: 10.5, color: opt.tokens['--fg-muted'], lineHeight: 1.4, marginBottom: 8 }}>{opt.note}</div>
                {/* Tokens hex en monospace */}
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, color: opt.tokens['--fg-dim'], lineHeight: 1.55 }}>
                  <div>canvas {opt.tokens['--bg-canvas']}</div>
                  <div>surface {opt.tokens['--bg-surface']}</div>
                  <div>fg {opt.tokens['--fg']}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabla de tokens completos */}
      <details style={{ marginTop: 18 }}>
        <summary style={{ cursor:'pointer', fontSize: 12.5, color:'var(--fg-muted)', fontWeight: 600 }}>
          Ver tabla comparativa completa de tokens
        </summary>
        <div style={{ marginTop: 12, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 11.5, fontFamily:'var(--font-mono)' }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:'6px 10px', borderBottom:'1px solid var(--line)', color:'var(--fg-dim)' }}>Token</th>
                {THEME_PREVIEW_OPTIONS.map(o => (
                  <th key={o.id} style={{ textAlign:'left', padding:'6px 10px', borderBottom:'1px solid var(--line)', color:'var(--fg-dim)', whiteSpace:'nowrap' }}>{o.label.split(' · ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['--bg-canvas','--bg-surface','--bg-elevated','--bg-deep','--fg','--fg-muted','--fg-dim','--line'].map(tk => (
                <tr key={tk}>
                  <td style={{ padding:'6px 10px', borderBottom:'1px solid var(--line-faint)', color:'var(--fg-muted)' }}>{tk}</td>
                  {THEME_PREVIEW_OPTIONS.map(o => (
                    <td key={o.id} style={{ padding:'6px 10px', borderBottom:'1px solid var(--line-faint)', color:'var(--fg)', whiteSpace:'nowrap' }}>{o.tokens[tk] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
window.ThemePreviewPanel = ThemePreviewPanel;

window.BrowseView_New = BrowseView;
window.RutasView_New = RutasView;
window.MyPathView_New = MyPathView;
window.ChannelsView_New = ChannelsView;
window.InboxView_New = InboxView;
window.SavedView_New = SavedView;
window.ProfileView_New = ProfileView;
window.SettingsView_New = SettingsView;
window.AdminView_New = AdminView;

/* ============================================================
   CertificatesView · sección dentro del popup avatar (demo)
   Uno por cada curso. Bloqueados hasta completar el curso.
   ============================================================ */
function CertificatesView({ setView }) {
  const D = window.SGS_DATA;
  const PATHS = (D && D.LEARNING_PATHS) || [];
  const USER = (D && D.USER) || {};
  // Modal de preview · evita window.open que el browser bloquea como popup
  const [previewSrc, setPreviewSrc] = useEV2(null);

  // Re-render cuando cambian certificates en window.Certificates
  const [, setTick] = useEV2(0);
  useEE2(() => {
    const r = () => setTick(t => t + 1);
    window.addEventListener('certificates-changed', r);
    window.addEventListener('progress-changed', r);
    return () => {
      window.removeEventListener('certificates-changed', r);
      window.removeEventListener('progress-changed', r);
    };
  }, []);

  // Mapa de cert por route_id · qué cursos tienen certificado emitido
  const certByRoute = {};
  if (window.Certificates && window.Certificates.list) {
    window.Certificates.list().forEach(c => { certByRoute[c.route_id] = c; });
  }

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e) { return iso; }
  };

  return (
    <PageShell
      eyebrow="Mi formación"
      title={<>Certificados <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>· {USER.name || 'Julio'}</em></>}
      sub={`Un certificado por cada curso completado · ${PATHS.length} cursos en el catálogo`}>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16,
      }}>
        {PATHS.map(p => {
          const cert = certByRoute[p._id] || certByRoute[p.id];
          const isCompleted = p.isCompleted || (p.progress >= 1);
          const isLocked = !cert && !isCompleted;
          return (
            <article key={p.id} style={{
              position:'relative', padding:'22px 20px 18px',
              background:'var(--bg-surface)', border:'1px solid var(--line)',
              borderRadius:14, display:'flex', flexDirection:'column', gap:10,
              opacity: isLocked ? 0.7 : 1,
              filter: isLocked ? 'grayscale(0.5)' : 'none',
            }}>
              {/* Sello tipo medalla en la esquina */}
              <div style={{
                position:'absolute', top:14, right:14,
                width:48, height:48, borderRadius:'50%',
                background: isLocked ? 'rgba(13,17,23,0.08)' : 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                color: isLocked ? '#64748B' : '#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 22, fontWeight:800,
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(110,80,238,0.30)',
              }}>{isLocked ? '🔒' : '🏆'}</div>

              <div style={{
                fontFamily:'var(--font-mono, monospace)', fontSize:10, letterSpacing:'0.08em',
                textTransform:'uppercase', color: isLocked ? '#64748B' : 'var(--accent)', fontWeight:700,
              }}>Certificado oficial</div>
              <h3 style={{ margin:'2px 0 0', fontSize:16, fontWeight:700, color:'var(--fg)', lineHeight:1.3, paddingRight:60 }}>
                {p.title}
              </h3>
              <div style={{ fontSize:12, color:'var(--fg-muted)' }}>
                {p.completedCount || 0} de {p.totalCount || p.pills} pills completadas
              </div>

              {/* Barra de progreso para mostrar lo que falta */}
              <div style={{ height:4, background:'rgba(13,17,23,0.08)', borderRadius:2, overflow:'hidden', marginTop:4 }}>
                <div style={{
                  height:'100%', width: Math.round((p.progress || 0) * 100) + '%',
                  background: isLocked ? '#94A3B8' : 'var(--accent)', transition:'width .25s',
                }}/>
              </div>

              {isLocked ? (
                <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{
                    padding:'8px 10px', background:'rgba(255,255,255,0.06)',
                    border:'1px dashed rgba(255,255,255,0.15)', borderRadius:8, fontSize:11.5, color:'var(--fg-muted)',
                  }}>
                    🔒 Disponible al completar el curso
                  </div>
                  {/* Preview · permite descargar el SVG del cert aunque esté
                      "locked" · útil para el demo y para que el user vea
                      cómo será su certificado al terminar. */}
                  <button onClick={() => {
                    const userObj = (window.SGS_DATA && window.SGS_DATA.USER) || {};
                    if (window.certificateSVG) {
                      const dataUrl = window.certificateSVG(p.title, userObj.name, p.accentHex, 'CERT-2026-' + String((p.id || '').replace(/\D/g,'')).padStart(4,'0'), new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}));
                      setPreviewSrc(dataUrl);  /* abre modal inline · no popup */
                    }
                  }} style={{
                    padding:'8px 12px', background:'transparent', color:'var(--fg)',
                    border:'1px solid var(--line)', borderRadius:8, cursor:'pointer',
                    fontFamily:'var(--font-sans)', fontWeight:600, fontSize:12,
                  }}>👁 Preview certificado</button>
                </div>
              ) : (
                <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ fontFamily:'var(--font-mono, monospace)', fontSize:11, color:'var(--fg-muted)', letterSpacing:'0.04em' }}>
                    {/* cert puede ser undefined · curso completado sin fila de
                        certificado emitida todavía. Sin esta guarda, deref de
                        cert.cert_number crasheaba toda la app (pantalla blanca). */}
                    {cert
                      ? ((cert.cert_number || '—') + ' · ' + fmtDate(cert.completed_at))
                      : 'Completado · genera tu certificado'}
                  </div>
                  {/* Descarga · prioridad: certUrl (design en Storage) →
                      SVG generado inline con el accent + título + nombre
                      del user → Certificates.download legacy como último
                      recurso. El SVG se descarga como .svg y se ve perfecto
                      al abrir/imprimir desde cualquier visor. */}
                  <button onClick={() => {
                    if (p.certUrl) {
                      window.open(p.certUrl, '_blank', 'noopener');
                      return;
                    }
                    if (window.certificateSVG) {
                      const userObj = (window.SGS_DATA && window.SGS_DATA.USER) || {};
                      const dataUrl = window.certificateSVG(p.title, userObj.name, p.accentHex, cert && cert.cert_number, cert && cert.completed_at);
                      const a = document.createElement('a');
                      a.href = dataUrl;
                      a.download = 'certificado-' + (p.id || 'curso') + '.svg';
                      document.body.appendChild(a); a.click(); a.remove();
                      return;
                    }
                    if (window.Certificates && window.Certificates.download) window.Certificates.download(cert);
                  }} style={{
                    padding:'9px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:8,
                    cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:700, fontSize:13,
                    boxShadow:'0 4px 12px rgba(0,114,190,0.30)',
                  }}>↓ Descargar certificado</button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {PATHS.length === 0 && (
        <div style={{
          padding:60, textAlign:'center', background:'var(--bg-surface)',
          border:'1px dashed var(--line)', borderRadius:14, marginTop:24,
        }}>
          <div style={{ fontSize:42, marginBottom:8 }}>🏆</div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--fg)' }}>Aún no hay cursos en el catálogo</div>
        </div>
      )}

      {/* Modal de preview del certificado · render inline, no popup */}
      {previewSrc && (
        <div onClick={() => setPreviewSrc(null)} style={{
          position:'fixed', inset:0, zIndex:1500, background:'rgba(0,0,0,0.85)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
          backdropFilter:'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position:'relative', maxWidth:'min(96vw, 1240px)', width:'100%',
            background:'#FFFFFF', borderRadius:8, overflow:'hidden',
            boxShadow:'0 30px 80px rgba(0,0,0,0.6)',
          }}>
            <button onClick={() => setPreviewSrc(null)} aria-label="Cerrar" style={{
              position:'absolute', top:12, right:12, width:36, height:36,
              borderRadius:'50%', background:'rgba(0,0,0,0.06)', border:'none',
              cursor:'pointer', fontSize:16, color:'#0A0A0A', display:'flex',
              alignItems:'center', justifyContent:'center', zIndex:2,
            }}>×</button>
            <img src={previewSrc} alt="Certificado" style={{
              display:'block', width:'100%', height:'auto',
            }}/>
            <div style={{
              padding:'12px 16px', display:'flex', justifyContent:'space-between',
              alignItems:'center', borderTop:'1px solid rgba(0,0,0,0.08)',
            }}>
              <span style={{ fontSize:11.5, color:'#6B6B6B', fontFamily:'var(--font-mono, monospace)', letterSpacing:'0.04em' }}>
                Vista previa · disponible al completar el curso
              </span>
              <a href={previewSrc} download="certificado.svg" style={{
                padding:'8px 14px', background:'#0072BE', color:'#FFFFFF',
                border:'none', borderRadius:8, cursor:'pointer', textDecoration:'none',
                fontFamily:'var(--font-sans)', fontWeight:700, fontSize:12,
              }}>↓ Descargar SVG</a>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

window.CertificatesView = CertificatesView;

// ── ResourcesView · cards launcher a documentación externa (Loop, etc.) ───
// Los users ven y filtran; los admin pueden añadir/editar/borrar.
// Click en card → abre URL original en pestaña nueva.
function ResourcesView({ openLegacyAdmin }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [tick, setTick] = useEV2(0);
  const [cat, setCat] = useEV2('Todos');
  const [editing, setEditing] = useEV2(null); // null | 'new' | resource.id
  const [form, setForm] = useEV2({ title: '', description: '', url: '', category: '', source: 'loop' });

  useEE2(() => {
    const refresh = () => setTick(t => t + 1);
    window.addEventListener('resources-changed', refresh);
    window.addEventListener('workspace-changed', refresh);
    return () => {
      window.removeEventListener('resources-changed', refresh);
      window.removeEventListener('workspace-changed', refresh);
    };
  }, []);

  const isAdmin = !!(window.Auth && window.Auth.can && window.Auth.can('admin.viewPanel'));
  const items = (window.Resources && window.Resources.list && window.Resources.list()) || [];
  const cats = ['Todos', ...Array.from(new Set(items.map(r => r.category).filter(Boolean)))];
  const filtered = cat === 'Todos' ? items : items.filter(r => r.category === cat);

  const SOURCES = {
    loop:       { label: 'Microsoft Loop',  icon: '🔁', color: '#7B83EB' },
    sharepoint: { label: 'SharePoint',      icon: '📂', color: '#0078D4' },
    web:        { label: 'Web',             icon: '🌐', color: '#22C55E' },
    pdf:        { label: 'PDF',             icon: '📄', color: '#EF4444' },
    other:      { label: 'Otro',            icon: '🔗', color: '#A8A6A0' },
  };

  const openEditor = (resource) => {
    if (resource) {
      setEditing(resource.id);
      setForm({ title: resource.title, description: resource.description || '', url: resource.url, category: resource.category || '', source: resource.source || 'other' });
    } else {
      setEditing('new');
      setForm({ title: '', description: '', url: '', category: '', source: 'loop' });
    }
  };
  const closeEditor = () => { setEditing(null); setForm({ title: '', description: '', url: '', category: '', source: 'loop' }); };

  const saveForm = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    try {
      if (editing === 'new') window.Resources.create(form);
      else window.Resources.update(editing, form);
      if (window.Toast && window.Toast.show) window.Toast.show(editing === 'new' ? 'Recurso añadido' : 'Recurso actualizado', { type: 'success' });
      closeEditor();
    } catch (e) {
      if (window.Toast && window.Toast.show) window.Toast.show('Error: ' + e.message, { type: 'error' });
    }
  };
  const deleteResource = (id) => {
    if (!confirm('¿Borrar este recurso? No se puede deshacer.')) return;
    window.Resources.remove(id);
    if (window.Toast && window.Toast.show) window.Toast.show('Recurso borrado', { type: 'info' });
  };

  return (
    <PageShell
      eyebrow="Recursos · documentación"
      title={<>Documentación <em style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight:400, color:'var(--accent)' }}>{window.WORKSPACE_NAME || 'de tu workspace'}</em></>}
      sub={`${items.length} recursos · click abre el original en pestaña nueva`}
      actions={isAdmin ? (
        <button onClick={() => openEditor(null)} style={{
          padding: '10px 18px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
        }}>+ Añadir recurso</button>
      ) : null}>

      {/* Filtro por categoría */}
      {cats.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28, padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)', width: 'fit-content' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
              background: c === cat ? 'var(--fg)' : 'transparent', color: c === cat ? 'var(--bg-canvas)' : 'var(--fg-muted)',
              border: 'none', borderRadius: 'var(--r-1)', cursor: 'pointer', transition: 'all .15s',
            }}>{c}</button>
          ))}
        </div>
      )}

      {/* Grid de cards-launcher */}
      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--line)', borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📚</div>
          <h3 style={{ fontSize: 18, margin: 0, marginBottom: 6 }}>Aún no hay recursos</h3>
          <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0, marginBottom: 16 }}>
            {isAdmin ? 'Añade enlaces a documentación de Loop, SharePoint o cualquier web relevante.' : 'Pide al admin que añada recursos a este workspace.'}
          </p>
          {isAdmin && (
            <button onClick={() => openEditor(null)} style={{
              padding: '10px 20px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            }}>+ Añadir el primer recurso</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(r => {
            const src = SOURCES[r.source] || SOURCES.other;
            return (
              <div key={r.id} style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 18, transition: 'all .15s', cursor: 'pointer' }}
                onClick={() => window.open(r.url, '_blank', 'noopener,noreferrer')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {/* Source chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{src.icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: src.color, fontWeight: 700 }}>
                    {src.label}
                  </span>
                  {r.category && (
                    <>
                      <span style={{ color: 'var(--fg-dim)' }}>·</span>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                        {r.category}
                      </span>
                    </>
                  )}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 8, color: 'var(--fg)', lineHeight: 1.3 }}>{r.title}</h3>
                {r.description && <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0, marginBottom: 14, lineHeight: 1.5 }}>{r.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>Abrir →</span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEditor(r)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg-muted)', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Editar</button>
                      <button onClick={() => deleteResource(r.id)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--err, #DC2626)', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Borrar</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal editor */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }} onClick={closeEditor}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, maxWidth: 560, width: '90%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, marginBottom: 20, fontSize: 22 }}>{editing === 'new' ? 'Añadir recurso' : 'Editar recurso'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6 }}>Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Procedimiento de aprobación de campañas" autoFocus
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontSize: 14 }}/>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6 }}>URL *</label>
                <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://loop.cloud.microsoft/..."
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--font-mono, monospace)' }}/>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6 }}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Para qué sirve este recurso y cuándo usarlo"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontSize: 14, minHeight: 80, resize: 'vertical' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6 }}>Categoría</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Procedimientos / Plantillas / Care"
                    list="resource-categories-list"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontSize: 14 }}/>
                  <datalist id="resource-categories-list">
                    {Array.from(new Set(items.map(r => r.category).filter(Boolean))).map(c => <option key={c} value={c}/>)}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6 }}>Origen</label>
                  <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontSize: 14 }}>
                    <option value="loop">🔁 Microsoft Loop</option>
                    <option value="sharepoint">📂 SharePoint</option>
                    <option value="web">🌐 Web pública</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="other">🔗 Otro</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={closeEditor} style={{ padding: '10px 18px', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={saveForm} disabled={!form.title.trim() || !form.url.trim()} style={{ padding: '10px 18px', background: (!form.title.trim() || !form.url.trim()) ? 'rgba(110,80,238,0.3)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                {editing === 'new' ? 'Añadir' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
window.ResourcesView_New = ResourcesView;

// ── BeonAIConfigPanel · admin only · editor del system prompt + KB ────────
// Lee /api/beonai-config?workspaceId=... y permite editar:
//   - system_prompt (textarea grande)
//   - model · temperature · max_tokens
//   - knowledge_docs (lista de { name, content })
//   - tools_enabled (toggles · stubs)
// Guarda con el access_token del usuario para que el endpoint valide admin.
function BeonAIConfigPanel() {
  if (!window.Workspaces || !window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;
  const [config, setConfig] = useEV2(null);
  const [loading, setLoading] = useEV2(true);
  const [saving, setSaving] = useEV2(false);
  const [error, setError] = useEV2('');
  const [open, setOpen] = useEV2(true);
  const [systemPrompt, setSystemPrompt] = useEV2('');
  const [model, setModel] = useEV2('claude-sonnet-4-6');
  const [temperature, setTemperature] = useEV2(0.7);
  const [maxTokens, setMaxTokens] = useEV2(1024);
  const [docs, setDocs] = useEV2([]);
  const [newDocName, setNewDocName] = useEV2('');
  const [newDocContent, setNewDocContent] = useEV2('');
  // Modos de import: 'manual' | 'bulk' | 'files' | 'bookmarklet'
  const [addMode, setAddMode] = useEV2('manual');
  const [bulkText, setBulkText] = useEV2('');
  const [bulkSplit, setBulkSplit] = useEV2('## ');       // delimitador de troceo
  const [bulkPreview, setBulkPreview] = useEV2(null);    // array de { name, content } previsualizado
  const [dragOver, setDragOver] = useEV2(false);
  const [ingestToken, setIngestToken] = useEV2(null);
  const [ingestLoading, setIngestLoading] = useEV2(false);
  const [toolReadProgress, setToolReadProgress] = useEV2(false);
  const [toolSearchPills, setToolSearchPills] = useEV2(false);
  const [toolSearchResources, setToolSearchResources] = useEV2(false);
  const [toolWebSprinklr, setToolWebSprinklr] = useEV2(false);

  const wsId = (window.Workspaces.current() && window.Workspaces.current().id) || null;

  useEE2(() => {
    if (!wsId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/beonai-config?workspaceId=${encodeURIComponent(wsId)}`);
        if (!res.ok) {
          if (res.status === 503) { setError('Supabase no está configurado · usando defaults locales'); setLoading(false); return; }
          throw new Error(String(res.status));
        }
        const data = await res.json();
        if (cancelled) return;
        const c = data.config || {};
        setConfig(c);
        setSystemPrompt(c.system_prompt || '');
        setModel(c.model || 'claude-sonnet-4-6');
        setTemperature(typeof c.temperature === 'number' ? c.temperature : 0.7);
        setMaxTokens(c.max_tokens || 1024);
        setDocs(Array.isArray(c.knowledge_docs) ? c.knowledge_docs : []);
        const tools = c.tools_enabled || {};
        setToolReadProgress(!!tools.read_user_progress);
        setToolSearchPills(!!tools.search_pill_catalog);
        setToolSearchResources(!!tools.search_resources);
        setToolWebSprinklr(!!tools.web_search_sprinklr);
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar la configuración: ' + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [wsId]);

  const addDoc = () => {
    const name = (newDocName || '').trim();
    const content = (newDocContent || '').trim();
    if (!name || !content) return;
    setDocs(d => [...d, { name, content }]);
    setNewDocName('');
    setNewDocContent('');
  };
  const removeDoc = (i) => setDocs(d => d.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!wsId) return;
    setSaving(true);
    setError('');
    try {
      let token = '';
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data } = await window.supabaseClient.auth.getSession();
        token = data?.session?.access_token || '';
      }
      const res = await fetch('/api/beonai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          workspaceId: wsId,
          system_prompt: systemPrompt,
          model,
          temperature: Number(temperature),
          max_tokens: Number(maxTokens),
          knowledge_docs: docs,
          tools_enabled: {
            read_user_progress: toolReadProgress,
            search_pill_catalog: toolSearchPills,
            search_resources: toolSearchResources,
            web_search_sprinklr: toolWebSprinklr,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || String(res.status));
      }
      const data = await res.json();
      setConfig(data.config);
      if (window.Toast && window.Toast.show) window.Toast.show('Configuración guardada', { type: 'success' });
    } catch (e) {
      setError('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const exportJSON = () => {
    const payload = {
      system_prompt: systemPrompt, model,
      temperature: Number(temperature), max_tokens: Number(maxTokens),
      knowledge_docs: docs,
      tools_enabled: {
        read_user_progress: toolReadProgress,
        search_pill_catalog: toolSearchPills,
        search_resources: toolSearchResources,
        web_search_sprinklr: toolWebSprinklr,
      },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beonai-config-${wsId || 'workspace'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (typeof d.system_prompt === 'string') setSystemPrompt(d.system_prompt);
        if (typeof d.model === 'string') setModel(d.model);
        if (typeof d.temperature === 'number') setTemperature(d.temperature);
        if (typeof d.max_tokens === 'number') setMaxTokens(d.max_tokens);
        if (Array.isArray(d.knowledge_docs)) setDocs(d.knowledge_docs);
        if (d.tools_enabled) {
          setToolReadProgress(!!d.tools_enabled.read_user_progress);
          setToolSearchPills(!!d.tools_enabled.search_pill_catalog);
          setToolSearchResources(!!d.tools_enabled.search_resources);
          setToolWebSprinklr(!!d.tools_enabled.web_search_sprinklr);
        }
        if (window.Toast && window.Toast.show) window.Toast.show('Configuración importada · revisa y guarda', { type: 'info' });
      } catch (e) { setError('JSON inválido: ' + e.message); }
    };
    reader.readAsText(file);
  };

  if (!wsId) return null;

  const labelStyle = { fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: 6, display: 'block' };
  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 13.5 };

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>🤖 BeonAI · Configuración</h2>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg-muted)', padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {open ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 0, marginBottom: open ? 20 : 0 }}>
        Edita el system prompt, el modelo y la base de conocimiento del agente. Los cambios se aplican al instante (cache server-side de 60s).
      </p>

      {!open ? null : loading ? (
        <div style={{ padding: 24, color: 'var(--fg-muted)' }}>Cargando configuración…</div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: 'var(--err, #DC2626)', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>System prompt · instrucciones base</label>
            <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Eres BeonAI, el asistente del programa de formación…"
              style={{ ...inputStyle, minHeight: 200, fontFamily: 'var(--font-mono, monospace)', fontSize: 12.5, lineHeight: 1.5, resize: 'vertical' }}/>
            <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 4, fontFamily: 'var(--font-mono, monospace)' }}>
              {systemPrompt.length} caracteres · ~{Math.round(systemPrompt.length / 4)} tokens
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Modelo</label>
              <select value={model} onChange={e => setModel(e.target.value)} style={inputStyle}>
                <option value="claude-opus-4-7">Opus 4.7 · máxima calidad</option>
                <option value="claude-sonnet-4-6">Sonnet 4.6 · recomendado</option>
                <option value="claude-haiku-4-5-20251001">Haiku 4.5 · más rápido</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Temperature · {Number(temperature).toFixed(2)}</label>
              <input type="range" min="0" max="1" step="0.05" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }}/>
            </div>
            <div>
              <label style={labelStyle}>Max tokens</label>
              <input type="number" min="256" max="8192" step="128" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} style={inputStyle}/>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Knowledge base · documentos ({docs.length})</label>
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginBottom: 10 }}>
              Cada documento se concatena al system prompt con prompt caching. Primer hit calienta cache, siguientes pagan ~10% del coste de input.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {docs.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8 }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: 13 }}>{d.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--fg-dim)' }}>{(d.content || '').length} chars</span>
                  <button onClick={() => removeDoc(i)} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg-muted)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Quitar</button>
                </div>
              ))}
            </div>
            {/* Tabs · modo de añadir documentos */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10, padding: 4, background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, width: 'fit-content' }}>
              {[
                { k: 'manual',      label: 'Manual'      },
                { k: 'bulk',        label: 'Pegado masivo' },
                { k: 'files',       label: 'Archivos'    },
                { k: 'bookmarklet', label: 'Bookmarklet' },
              ].map(t => (
                <button key={t.k} onClick={() => setAddMode(t.k)} style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  background: addMode === t.k ? 'var(--accent)' : 'transparent',
                  color: addMode === t.k ? '#fff' : 'var(--fg-muted)',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                }}>{t.label}</button>
              ))}
            </div>

            {addMode === 'manual' && (
              <div style={{ background: 'var(--bg-canvas)', border: '1px dashed var(--line)', borderRadius: 8, padding: 12 }}>
                <input type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Nombre del documento (ej. Guía de uso interna)" style={{ ...inputStyle, marginBottom: 8 }}/>
                <textarea value={newDocContent} onChange={e => setNewDocContent(e.target.value)} placeholder="Pega aquí el texto del documento…"
                  style={{ ...inputStyle, minHeight: 100, fontFamily: 'var(--font-mono, monospace)', fontSize: 12, resize: 'vertical', marginBottom: 8 }}/>
                <button onClick={addDoc} disabled={!newDocName.trim() || !newDocContent.trim()}
                  style={{ padding: '8px 16px', background: (!newDocName.trim() || !newDocContent.trim()) ? 'rgba(110,80,238,0.3)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Añadir documento</button>
              </div>
            )}

            {addMode === 'bulk' && (
              <div style={{ background: 'var(--bg-canvas)', border: '1px dashed var(--line)', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 0, marginBottom: 8 }}>
                  Pega aquí muchas páginas de Loop/SharePoint juntas. La primera línea de cada bloque se usa como nombre. El bloque empieza con el delimitador.
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Delimitador:</label>
                  <select value={bulkSplit} onChange={e => { setBulkSplit(e.target.value); setBulkPreview(null); }} style={{ padding: '6px 10px', background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--fg)', fontSize: 12 }}>
                    <option value="## ">## (markdown H2)</option>
                    <option value="# ">#  (markdown H1)</option>
                    <option value="---">--- (línea horizontal)</option>
                    <option value="\n\n\n">Triple línea en blanco</option>
                  </select>
                </div>
                <textarea value={bulkText} onChange={e => { setBulkText(e.target.value); setBulkPreview(null); }}
                  placeholder={`## Título de la primera página\nContenido de la primera página…\n\n## Título de la segunda página\nContenido de la segunda página…`}
                  style={{ ...inputStyle, minHeight: 220, fontFamily: 'var(--font-mono, monospace)', fontSize: 12, resize: 'vertical', marginBottom: 8 }}/>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => {
                    const sep = bulkSplit === '\\n\\n\\n' ? '\n\n\n' : bulkSplit;
                    const parts = bulkText.split(new RegExp('(?:^|\\n)' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
                      .map(s => s.trim()).filter(Boolean);
                    const items = parts.map(part => {
                      const lines = part.split('\n');
                      const name = (lines.shift() || 'Sin título').trim().slice(0, 100);
                      const content = lines.join('\n').trim();
                      return { name, content };
                    }).filter(p => p.content.length > 0);
                    setBulkPreview(items);
                  }} disabled={!bulkText.trim()}
                    style={{ padding: '8px 14px', background: !bulkText.trim() ? 'rgba(110,80,238,0.3)' : 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Previsualizar troceo
                  </button>
                  {bulkPreview && bulkPreview.length > 0 && (
                    <button onClick={() => {
                      setDocs(d => [...d, ...bulkPreview]);
                      setBulkText('');
                      setBulkPreview(null);
                      if (window.Toast && window.Toast.show) window.Toast.show(`${bulkPreview.length} documentos añadidos`, { type: 'success' });
                    }} style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      + Añadir {bulkPreview.length} documentos
                    </button>
                  )}
                </div>
                {bulkPreview && (
                  <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6, fontFamily: 'var(--font-mono, monospace)' }}>
                      Preview · {bulkPreview.length} bloques detectados
                    </div>
                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {bulkPreview.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 8px', borderBottom: '1px solid var(--line-faint)', fontSize: 12 }}>
                          <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--fg-dim)', fontSize: 10 }}>{p.content.length} chars</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {addMode === 'files' && (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(false);
                  const files = Array.from(e.dataTransfer.files || []);
                  let added = 0;
                  let pending = files.length;
                  if (pending === 0) return;
                  files.forEach(f => {
                    const ext = (f.name.split('.').pop() || '').toLowerCase();
                    if (!['md', 'txt', 'markdown'].includes(ext)) {
                      pending--;
                      if (pending === 0 && window.Toast) window.Toast.show(added ? `${added} archivos añadidos` : 'Sólo .md y .txt en client-side', { type: added ? 'success' : 'warn' });
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      const name = f.name.replace(/\.(md|txt|markdown)$/i, '');
                      setDocs(d => [...d, { name, content: String(reader.result || '') }]);
                      added++;
                      pending--;
                      if (pending === 0 && window.Toast) window.Toast.show(`${added} archivos añadidos`, { type: 'success' });
                    };
                    reader.readAsText(f);
                  });
                }}
                style={{
                  background: dragOver ? 'rgba(110,80,238,0.08)' : 'var(--bg-canvas)',
                  border: '2px dashed ' + (dragOver ? 'var(--accent)' : 'var(--line)'),
                  borderRadius: 8, padding: 32, textAlign: 'center', transition: 'all .15s',
                }}>
                <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.6 }}>📁</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Arrastra archivos .md o .txt aquí</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>O usa el botón debajo para seleccionar</div>
                <label style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Seleccionar archivos
                  <input type="file" multiple accept=".md,.txt,.markdown,text/plain,text/markdown" style={{ display: 'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      let added = 0; let pending = files.length;
                      files.forEach(f => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const name = f.name.replace(/\.(md|txt|markdown)$/i, '');
                          setDocs(d => [...d, { name, content: String(reader.result || '') }]);
                          added++; pending--;
                          if (pending === 0 && window.Toast) window.Toast.show(`${added} archivos añadidos`, { type: 'success' });
                        };
                        reader.readAsText(f);
                      });
                    }}/>
                </label>
                <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 14 }}>
                  PDF/DOCX: conviértelos a .md o .txt primero (o pega el texto en el modo Manual).
                </div>
              </div>
            )}

            {addMode === 'bookmarklet' && (
              <div style={{ background: 'var(--bg-canvas)', border: '1px dashed var(--line)', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: 0, marginBottom: 8, fontSize: 14 }}>🔖 Bookmarklet · 1 click desde Loop</h4>
                <ol style={{ paddingLeft: 18, fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6, marginTop: 0, marginBottom: 14 }}>
                  <li>Pulsa <b>Generar mi bookmarklet</b> abajo</li>
                  <li>Arrastra el botón <b>"BeonAI · Importar"</b> a tu barra de favoritos del browser</li>
                  <li>Cuando estés en una página de Loop (o cualquier web), pulsa el favorito → el contenido se manda a la KB de BeonAI</li>
                  <li>Si rotas el token, el bookmarklet viejo deja de funcionar y tienes que volver a generar</li>
                </ol>
                {!ingestToken ? (
                  <button onClick={async () => {
                    setIngestLoading(true);
                    try {
                      let token = '';
                      if (window.supabaseClient && window.supabaseClient.auth) {
                        const { data } = await window.supabaseClient.auth.getSession();
                        token = data?.session?.access_token || '';
                      }
                      const res = await fetch('/api/kb/token', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
                      if (!res.ok) throw new Error('No se pudo generar el token (' + res.status + ')');
                      const data = await res.json();
                      setIngestToken(data.token);
                    } catch (e) {
                      if (window.Toast && window.Toast.show) window.Toast.show('Error: ' + e.message, { type: 'error' });
                    } finally { setIngestLoading(false); }
                  }} disabled={ingestLoading} style={{ padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {ingestLoading ? 'Generando…' : 'Generar mi bookmarklet'}
                  </button>
                ) : (
                  <>
                    {(() => {
                      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
                      const code = `javascript:(async()=>{const t=document.title.replace(/\\s*[-|·].*$/,'').trim()||'Sin título';const c=(document.body.innerText||'').replace(/\\n{3,}/g,'\\n\\n').trim().slice(0,90000);try{const r=await fetch('${origin}/api/kb/ingest',{method:'POST',headers:{'Content-Type':'application/json','X-Ingest-Token':'${ingestToken}'},body:JSON.stringify({title:t,content:c,source_url:location.href})});const d=await r.json();if(d.ok)alert('✓ Importado a BeonAI: '+d.title+(d.replaced?' (reemplazado)':' (nuevo)')+' · '+d.doc_count+' docs en total');else alert('Error: '+(d.error||r.status));}catch(e){alert('Error: '+e.message);}})();`;
                      return (
                        <div>
                          <a href={code} onClick={e => e.preventDefault()} draggable="true"
                            style={{ display: 'inline-block', padding: '10px 18px', background: '#6E50EE', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: 13, cursor: 'grab' }}>
                            🔖 BeonAI · Importar
                          </a>
                          <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--fg-muted)' }}>
                            ↑ Arrastra ESE botón a la barra de favoritos (no copies el texto, drag-drop).
                          </div>
                          <details style={{ marginTop: 14 }}>
                            <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--fg-muted)' }}>Ver código (por si tu browser no permite drag)</summary>
                            <textarea readOnly value={code} onClick={e => e.target.select()}
                              style={{ width: '100%', minHeight: 100, marginTop: 8, padding: 8, background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, resize: 'vertical' }}/>
                            <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 6 }}>
                              Click derecho en favoritos → Añadir página → Pega esto en URL.
                            </div>
                          </details>
                          <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button onClick={async () => {
                              if (!confirm('Rotar el token invalida el bookmarklet viejo. ¿Continuar?')) return;
                              setIngestLoading(true);
                              try {
                                let token = '';
                                if (window.supabaseClient && window.supabaseClient.auth) {
                                  const { data } = await window.supabaseClient.auth.getSession();
                                  token = data?.session?.access_token || '';
                                }
                                const res = await fetch('/api/kb/token', { method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {} });
                                if (!res.ok) throw new Error(String(res.status));
                                const data = await res.json();
                                setIngestToken(data.token);
                                if (window.Toast && window.Toast.show) window.Toast.show('Token rotado · re-arrastra el bookmarklet', { type: 'info' });
                              } catch (e) {
                                if (window.Toast && window.Toast.show) window.Toast.show('Error: ' + e.message, { type: 'error' });
                              } finally { setIngestLoading(false); }
                            }} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--warn, #B45309)', border: '1px solid var(--warn, #B45309)', borderRadius: 6, cursor: 'pointer', fontSize: 11.5 }}>
                              Rotar token
                            </button>
                            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, color: 'var(--fg-dim)' }}>
                              token: {ingestToken.slice(0, 8)}…
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Tools · capacidades del agente</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={toolReadProgress} onChange={e => setToolReadProgress(e.target.checked)}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Leer progreso del usuario</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>Nombre, rol, pills completadas, en curso, % global · respuestas personalizadas</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ok, #047857)' }}>Activo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={toolSearchPills} onChange={e => setToolSearchPills(e.target.checked)}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Búsqueda en el catálogo de pills</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>El agente puede buscar por tema/categoría y recomendar pills concretas</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ok, #047857)' }}>Activo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={toolWebSprinklr} onChange={e => setToolWebSprinklr(e.target.checked)}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Búsqueda web · documentación de la plataforma</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>Restringido a help.sprinklr.com vía web_search nativo de Anthropic · máx 3 búsquedas/turno</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ok, #047857)' }}>Activo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-canvas)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={toolSearchResources} onChange={e => setToolSearchResources(e.target.checked)}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Búsqueda en Recursos del workspace</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>Loop / SharePoint / PDFs que hayas añadido en la vista <code>Recursos</code> · el agente puede sugerirlos con link</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ok, #047857)' }}>Activo</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <button onClick={save} disabled={saving} style={{ padding: '10px 20px', background: saving ? 'rgba(110,80,238,0.4)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 13 }}>
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
            <button onClick={exportJSON} style={{ padding: '10px 16px', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Exportar JSON</button>
            <label style={{ padding: '10px 16px', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              Importar JSON
              <input type="file" accept="application/json" onChange={e => e.target.files[0] && importJSON(e.target.files[0])} style={{ display: 'none' }}/>
            </label>
            {config && config.updated_at && (
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, color: 'var(--fg-dim)' }}>
                Última edición · {new Date(config.updated_at).toLocaleString('es-ES')}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── WorkspacesPanel · admin only · CRUD de tenants ───────────────────────
function WorkspacesPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [, setTick] = useEV2(0);
  const [creating, setCreating] = useEV2(false);
  const [name, setName] = useEV2('');
  const [color, setColor] = useEV2('#6E50EE');
  // ── Edit mode (un card a la vez) ───────────────────────────────────────
  const [editingId, setEditingId] = useEV2(null);
  const [editName, setEditName] = useEV2('');
  const [editColor, setEditColor] = useEV2('#6E50EE');
  const [editLogoPreview, setEditLogoPreview] = useEV2(null);
  const [uploading, setUploading] = useEV2(false);
  // Settings extendidos · alimentan workspaces.settings jsonb
  const [editDefaultLang, setEditDefaultLang] = useEV2('es');
  const [editAllowSignup, setEditAllowSignup] = useEV2(false);
  const [editAllowedDomain, setEditAllowedDomain] = useEV2('');
  const [editPathLabel, setEditPathLabel] = useEV2('');
  const [editPathLabelPlural, setEditPathLabelPlural] = useEV2('');
  const [editWelcomeMsg, setEditWelcomeMsg] = useEV2('');
  const [editProgramDirector, setEditProgramDirector] = useEV2('');
  const [editLegalUrl, setEditLegalUrl] = useEV2('');
  const [editAutoTestUrl, setEditAutoTestUrl] = useEV2('');
  // ── Members management (Slice 1C) ──────────────────────────────────────
  const [addEmail, setAddEmail] = useEV2('');
  const [addRole, setAddRole] = useEV2('member');
  const [addingMember, setAddingMember] = useEV2(false);
  useEE2(() => {
    const refresh = () => setTick(x => x + 1);
    window.addEventListener('workspaces-changed', refresh);
    window.addEventListener('workspace-changed', refresh);
    return () => {
      window.removeEventListener('workspaces-changed', refresh);
      window.removeEventListener('workspace-changed', refresh);
    };
  }, []);

  if (!window.Workspaces || !window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;
  const list = window.Workspaces.list();
  const current = window.Workspaces.current();

  const create = async () => {
    if (!name.trim()) return;
    // create puede ser sync (modo demo) o async (modo Supabase). Await sirve para ambos.
    // Ambos paths emiten su propio toast internamente, no duplicamos aquí.
    await Promise.resolve(window.Workspaces.create({ name: name.trim(), primaryColor: color }));
    setName(''); setCreating(false);
  };
  const startEdit = (w) => {
    setEditingId(w.id);
    setEditName(w.name || '');
    setEditColor(w.primaryColor || '#6E50EE');
    setEditLogoPreview(w.logo || null);
    const s = w.settings || {};
    setEditDefaultLang(s.defaultLang || 'es');
    setEditAllowSignup(!!s.allowSignup);
    setEditAllowedDomain(s.allowedDomain || '');
    setEditPathLabel(s.path_label || '');
    setEditPathLabelPlural(s.path_label_plural || '');
    setEditWelcomeMsg(s.welcome_message || '');
    setEditProgramDirector(s.program_director || '');
    setEditLegalUrl(s.legal_url || '');
    setEditAutoTestUrl(s.autotest_url || '');
  };
  const cancelEdit = () => { setEditingId(null); setEditLogoPreview(null); };
  const saveEdit = async () => {
    if (!editingId) return;
    const w = window.Workspaces.get(editingId);
    const patch = {};
    if (editName.trim()) patch.name = editName.trim();
    patch.primaryColor = editColor;
    // Settings · merge no destructivo con los que ya hubiera
    const nextSettings = Object.assign({}, (w && w.settings) || {}, {
      defaultLang: editDefaultLang,
      allowSignup: !!editAllowSignup,
      allowedDomain: editAllowedDomain.trim() || null,
      path_label: editPathLabel.trim() || null,
      path_label_plural: editPathLabelPlural.trim() || null,
      welcome_message: editWelcomeMsg.trim() || null,
      program_director: editProgramDirector.trim() || null,
      legal_url: editLegalUrl.trim() || null,
      autotest_url: editAutoTestUrl.trim() || null,
    });
    // Limpia keys null para no llenar el jsonb de basura
    Object.keys(nextSettings).forEach(k => { if (nextSettings[k] == null || nextSettings[k] === '') delete nextSettings[k]; });
    patch.settings = nextSettings;
    await Promise.resolve(window.Workspaces.update(editingId, patch));
    if (window.Toast) window.Toast.success(T('workspaces.updated','Workspace actualizado'));
    cancelEdit();
  };
  const onLogoFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f || !editingId) return;
    if (f.size > 5 * 1024 * 1024) {
      if (window.Toast) window.Toast.error('El logo no puede pesar más de 5MB');
      return;
    }
    setUploading(true);
    try {
      const url = await Promise.resolve(window.Workspaces.uploadLogo(editingId, f));
      if (url) {
        setEditLogoPreview(url);
        if (window.Toast) window.Toast.success(T('workspaces.logoUploaded','Logo subido'));
      }
    } finally { setUploading(false); e.target.value = ''; }
  };

  // ── Members handlers (Slice 1C) ─────────────────────────────────────────
  const addMember = async () => {
    const email = (addEmail || '').trim().toLowerCase();
    if (!email || !editingId) return;
    const users = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
    const user = users.find(u => (u.email || '').toLowerCase() === email);
    if (!user) {
      if (window.Toast) window.Toast.error('Usuario no encontrado · que se registre primero');
      return;
    }
    setAddingMember(true);
    try {
      await Promise.resolve(window.Workspaces.addMember(editingId, user.id, addRole));
      setAddEmail('');
      if (window.Toast) window.Toast.success(user.name ? user.name + ' añadido' : 'Miembro añadido');
    } finally { setAddingMember(false); }
  };
  const changeMemberRole = async (userId, newRole) => {
    if (!editingId) return;
    await Promise.resolve(window.Workspaces.setMemberRole(editingId, userId, newRole));
  };
  const removeMemberFromWs = async (member) => {
    if (!editingId) return;
    const name = member.name || member.email || 'este miembro';
    if (!confirm('¿Quitar a ' + name + ' del workspace? Conserva su cuenta y sus datos en otros workspaces.')) return;
    await Promise.resolve(window.Workspaces.removeMember(editingId, member.id));
    if (window.Toast) window.Toast.info('Miembro retirado');
  };

  return (
    <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 14, gap: 12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color:'var(--fg)', marginTop: 0, marginBottom: 4 }}>🏢 {T('workspaces.title')}</h2>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>{T('workspaces.sub')}</div>
        </div>
        <button onClick={() => setCreating(c => !c)} style={{ padding:'10px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r-1)', cursor:'pointer', fontWeight:700, fontSize: 12.5 }}>
          {creating ? T('common.cancel') : T('workspaces.create')}
        </button>
      </div>

      {creating && (
        <div style={{ padding: 14, background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 10, marginBottom: 14, display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={T('workspaces.namePh')} autoFocus
            onKeyDown={e => { if (e.key === 'Enter') create(); }}
            style={{ flex: 1, minWidth: 180, padding:'9px 12px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8, fontSize: 13, color:'var(--fg)', outline:'none' }}/>
          <label style={{ display:'inline-flex', alignItems:'center', gap: 8, fontSize: 12, color:'var(--fg-muted)' }}>
            <span>{T('workspaces.colorLabel')}</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 36, height: 32, border:'1px solid var(--line)', borderRadius: 6, padding: 2, cursor:'pointer', background:'var(--bg-surface)' }}/>
          </label>
          <button onClick={create} disabled={!name.trim()} style={{ padding:'9px 16px', background:'var(--ok)', color:'#fff', border:'none', borderRadius: 8, cursor: name.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12.5, opacity: name.trim() ? 1 : 0.5 }}>
            {T('common.save')}
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ padding: 40, textAlign:'center', color:'var(--fg-muted)', fontSize: 13 }}>{T('workspaces.empty')}</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {list.map(w => {
            const members = window.Workspaces.membersOf(w.id);
            const isActive = current && current.id === w.id;
            const memberKey = members.length === 1 ? 'workspaces.members' : 'workspaces.membersMulti';
            const isEditing = editingId === w.id;
            const displayLogo = isEditing ? editLogoPreview : w.logo;
            return (
              <div key={w.id} style={{
                padding:'14px 16px', background: isActive ? `linear-gradient(135deg, ${w.primaryColor}14 0%, var(--bg-surface) 100%)` : 'var(--bg-surface)',
                border: `1.5px solid ${isActive ? w.primaryColor : 'var(--line)'}`,
                borderRadius: 12, position:'relative',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 10 }}>
                  {displayLogo ? (
                    <img src={displayLogo} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', background:'var(--bg-elevated)', flexShrink: 0, border:'1px solid var(--line)' }}
                         onError={e => { e.currentTarget.style.display = 'none'; }}/>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: w.primaryColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                      {w.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{w.name}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)' }}>{T(memberKey,'{n} miembros').replace('{n}', members.length)}</div>
                  </div>
                  {isActive && <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background: w.primaryColor, color:'#fff', borderRadius: 4, letterSpacing:'0.06em' }}>✓ ACTIVO</span>}
                </div>
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                  {!isActive && (
                    <button onClick={() => window.Workspaces.setCurrent(w.id)} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${w.primaryColor}`, color: w.primaryColor, borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                      Activar
                    </button>
                  )}
                  <button onClick={() => isEditing ? cancelEdit() : startEdit(w)}
                    style={{ padding:'6px 12px', background: isEditing ? 'var(--accent)' : 'transparent', border:'1px solid var(--accent)', color: isEditing ? '#fff' : 'var(--accent)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                    {isEditing ? T('common.cancel','Cancelar') : T('workspaces.edit','Editar')}
                  </button>
                  <button onClick={() => {
                      if (confirm(T('workspaces.confirmDelete').replace('{name}', w.name))) {
                        window.Workspaces.remove(w.id);
                        if (window.Toast) window.Toast.info('Workspace eliminado');
                      }
                    }}
                    style={{ padding:'6px 12px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 600 }}>
                    {T('common.delete')}
                  </button>
                </div>
                {isEditing && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop:'1px dashed var(--line)', display:'flex', flexDirection:'column', gap: 10 }}>
                    <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)' }}>
                      {T('workspaces.name','Nombre')}
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        style={{ display:'block', marginTop: 4, width:'100%', padding:'8px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)', outline:'none' }}/>
                    </label>
                    <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)', display:'flex', alignItems:'center', gap: 10 }}>
                      <span>{T('workspaces.colorLabel','Color')}</span>
                      <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                        style={{ width: 36, height: 28, border:'1px solid var(--line)', borderRadius: 4, padding: 2, cursor:'pointer', background:'var(--bg-elevated)' }}/>
                      <span style={{ fontSize: 11, color:'var(--fg-muted)' }}>{editColor}</span>
                    </label>
                    <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fg-muted)' }}>
                      {T('workspaces.logo','Logo')} ({uploading ? T('workspaces.uploading','subiendo…') : 'PNG/JPG/SVG · máx 5MB'})
                      <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={onLogoFile} disabled={uploading}
                        style={{ display:'block', marginTop: 4, width:'100%', fontSize: 11, color:'var(--fg-muted)' }}/>
                    </label>
                    {/* Settings extendidos · idioma · signup · dominio · etiqueta de ruta */}
                    <div style={{ marginTop: 6, paddingTop: 12, borderTop:'1px dashed var(--line)' }}>
                      <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)', marginBottom: 8, fontWeight: 700 }}>
                        Ajustes del workspace
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)' }}>
                          Idioma por defecto
                          <select value={editDefaultLang} onChange={e => setEditDefaultLang(e.target.value)}
                            style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 8px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)' }}>
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                          </select>
                        </label>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                          Auto-signup
                          <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 4, padding:'7px 8px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6 }}>
                            <input type="checkbox" checked={editAllowSignup} onChange={e => setEditAllowSignup(e.target.checked)}/>
                            <span style={{ fontSize: 11.5, color:'var(--fg)' }}>Permitir auto-registro</span>
                          </div>
                        </label>
                      </div>
                      <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', marginBottom: 10, display:'block' }}>
                        Dominio permitido (auto-signup)
                        <input value={editAllowedDomain} onChange={e => setEditAllowedDomain(e.target.value)}
                          placeholder="ej. @beonit.com · deja vacío para no restringir"
                          style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box' }}/>
                        <span style={{ display:'block', marginTop: 3, fontSize: 10, color:'var(--fg-muted)', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}>
                          Solo emails de este dominio podrán crear cuenta sin invitación · solo aplica si auto-signup está activo.
                        </span>
                      </label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)' }}>
                          Etiqueta "Ruta" (singular)
                          <input value={editPathLabel} onChange={e => setEditPathLabel(e.target.value)}
                            placeholder="Ruta"
                            style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box' }}/>
                        </label>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)' }}>
                          Plural
                          <input value={editPathLabelPlural} onChange={e => setEditPathLabelPlural(e.target.value)}
                            placeholder="Rutas"
                            style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box' }}/>
                        </label>
                      </div>
                      <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', marginTop: 10, display:'block' }}>
                        Mensaje de bienvenida (Home)
                        <textarea value={editWelcomeMsg} onChange={e => setEditWelcomeMsg(e.target.value)}
                          rows={2}
                          placeholder="Bienvenido a tu plataforma de formación. Aquí encontrarás contenido pensado para ti."
                          style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0, resize:'vertical' }}/>
                        <span style={{ display:'block', marginTop: 3, fontSize: 10, color:'var(--fg-muted)', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}>
                          Aparece como banner dismissible en el home. Vacío = mensaje genérico con nombre del user.
                        </span>
                      </label>
                      <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', marginTop: 10, display:'block' }}>
                        Director del programa (valor fijo en cards)
                        <input value={editProgramDirector} onChange={e => setEditProgramDirector(e.target.value)}
                          placeholder="Ej · Carmen Martínez · Directora de Formación"
                          style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}/>
                        <span style={{ display:'block', marginTop: 3, fontSize: 10, color:'var(--fg-muted)', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}>
                          Aparece en la descripción de cada curso ("Dirige · {'<nombre>'}").
                        </span>
                      </label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginTop: 10 }}>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', display:'block' }}>
                          URL Bases Legales
                          <input value={editLegalUrl} onChange={e => setEditLegalUrl(e.target.value)}
                            placeholder="https://..."
                            style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}/>
                        </label>
                        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fg-muted)', display:'block' }}>
                          URL Test autodiagnóstico
                          <input value={editAutoTestUrl} onChange={e => setEditAutoTestUrl(e.target.value)}
                            placeholder="https://forms..."
                            style={{ display:'block', marginTop: 4, width:'100%', padding:'7px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', boxSizing:'border-box', fontFamily:'var(--font-sans)', textTransform:'none', letterSpacing: 0 }}/>
                        </label>
                      </div>
                    </div>
                    {/* Demo user · crea usuario predecible para presentaciones */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop:'1px dashed var(--line)', display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap' }}>
                      <button onClick={async () => {
                          try {
                            const sb = window.supabaseClient || (typeof supabase !== 'undefined' && supabase);
                            if (!sb || !sb.rpc) { alert('Supabase no disponible'); return; }
                            const { data, error } = await sb.rpc('create_demo_user_for_workspace', { p_workspace_slug: w.slug });
                            if (error) { alert('Error: ' + error.message); return; }
                            const creds = data.email + ' / ' + data.password + '\n' + data.login_url;
                            // Copia robusta · clipboard tras await falla en algunos
                            // navegadores (pierde el user-gesture). Fallback a
                            // execCommand y, si todo falla, prompt para copia manual.
                            let copied = false;
                            try { await navigator.clipboard.writeText(creds); copied = true; } catch (e) {}
                            if (!copied) {
                              try {
                                const ta = document.createElement('textarea');
                                ta.value = creds; ta.style.position = 'fixed'; ta.style.opacity = '0';
                                document.body.appendChild(ta); ta.select();
                                copied = document.execCommand('copy');
                                document.body.removeChild(ta);
                              } catch (e) {}
                            }
                            const msg = '✓ Demo user ' + (data.status === 'created' ? 'creado' : 'reseteado') +
                                        '\n\nEmail: ' + data.email +
                                        '\nPassword: ' + data.password +
                                        '\nLogin: ' + data.login_url +
                                        (copied ? '\n\n✓ Credenciales copiadas al portapapeles.'
                                                : '\n\n(No se pudieron copiar solas · cópialas de aquí.)');
                            alert(msg);
                          } catch (e) {
                            alert('Error: ' + e.message);
                          }
                        }}
                        style={{ padding:'7px 12px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                        👤 Crear demo user
                      </button>
                      <span style={{ fontSize: 11, color:'var(--fg-muted)', fontStyle:'italic' }}>
                        demo+{w.slug}@beonit.es · pwd Demo2026!
                      </span>
                    </div>

                    {/* Starter pack · siembra 4 cursos + 12 pills universales */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop:'1px dashed var(--line)', display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap' }}>
                      <button onClick={async () => {
                          if (!confirm('Sembrar 4 cursos + 12 pills de ejemplo en "' + w.name + '"?\n\nTemas: Bienvenida · Comunicación · Liderazgo · Productividad.\nIdempotente · si ya están, hace skip.')) return;
                          try {
                            const sb = window.supabaseClient || (typeof supabase !== 'undefined' && supabase);
                            if (!sb || !sb.rpc) { alert('Supabase no disponible'); return; }
                            const { data, error } = await sb.rpc('seed_workspace_starter_pack', { p_workspace_slug: w.slug });
                            if (error) { alert('Error: ' + error.message); return; }
                            if (window.Toast) window.Toast.success('✓ Starter pack sembrado · ' + data.paths + ' cursos · ' + data.pills + ' pills');
                          } catch (e) {
                            alert('Error: ' + e.message);
                          }
                        }}
                        style={{ padding:'7px 12px', background:'transparent', color:'var(--accent)', border:'1px solid var(--accent)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                        🌱 Sembrar starter pack
                      </button>
                      <span style={{ fontSize: 11, color:'var(--fg-muted)', fontStyle:'italic' }}>
                        4 cursos + 12 pills universales · útil para workspace recién creado
                      </span>
                    </div>

                    {/* Archive · soft delete · oculta del switcher pero conserva datos */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop:'1px dashed var(--line)', display:'flex', alignItems:'center', gap: 10 }}>
                      <button onClick={async () => {
                          if (!confirm('Archivar workspace "' + (w.name) + '"? Se ocultará del switcher pero los datos se conservan. Puedes restaurarlo después.')) return;
                          await Promise.resolve(window.Workspaces.archive(w.id));
                          if (window.Toast) window.Toast.info('Workspace archivado');
                          cancelEdit();
                        }}
                        style={{ padding:'7px 12px', background:'transparent', color:'#E08A00', border:'1px solid #E08A00', borderRadius: 6, cursor:'pointer', fontSize: 11.5, fontWeight: 700 }}>
                        📦 Archivar workspace
                      </button>
                      <span style={{ fontSize: 11, color:'var(--fg-muted)', fontStyle:'italic' }}>
                        Soft delete · reversible desde el panel "Archivados"
                      </span>
                    </div>
                    {/* Members management · Slice 1C */}
                    <div style={{ marginTop: 6, paddingTop: 12, borderTop:'1px dashed var(--line)' }}>
                      <div style={{ fontSize: 11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)', marginBottom: 8, fontWeight: 700 }}>
                        Miembros ({members.length})
                      </div>
                      {members.length === 0 && (
                        <div style={{ fontSize: 12, color:'var(--fg-muted)', padding:'8px 0', fontStyle:'italic' }}>Sin miembros aún. Añade el primero abajo.</div>
                      )}
                      {members.map(m => (
                        <div key={m.id} style={{ display:'flex', alignItems:'center', gap: 8, padding:'6px 0', borderBottom:'1px solid var(--line-faint, rgba(0,0,0,0.05))' }}>
                          <div style={{ width: 26, height: 26, borderRadius:'50%', background: w.primaryColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {(m.name || m.email || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name || m.email}</div>
                            <div style={{ fontSize: 10, color:'var(--fg-muted)', fontFamily:'var(--font-mono)' }}>{m.email}</div>
                          </div>
                          <select value={m.workspaceRole || 'member'} onChange={e => changeMemberRole(m.id, e.target.value)}
                            style={{ padding:'4px 6px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 4, fontSize: 11, color:'var(--fg)' }}>
                            <option value="member">member</option>
                            <option value="admin">admin</option>
                            <option value="owner">owner</option>
                          </select>
                          <button onClick={() => removeMemberFromWs(m)} title="Quitar del workspace"
                            style={{ padding:'4px 8px', background:'transparent', border:'1px solid var(--line)', color:'var(--err, #B91C1C)', borderRadius: 4, cursor:'pointer', fontSize: 10.5, fontWeight: 600 }}>
                            Quitar
                          </button>
                        </div>
                      ))}
                      {/* Add new member */}
                      <div style={{ display:'flex', gap: 6, marginTop: 10, flexWrap:'wrap', alignItems:'center' }}>
                        <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="user@empresa.com" list={'all-users-' + w.id}
                          onKeyDown={e => { if (e.key === 'Enter') addMember(); }}
                          style={{ flex: 1, minWidth: 180, padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)', outline:'none' }}/>
                        <datalist id={'all-users-' + w.id}>
                          {((window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || []).map(u => (
                            <option key={u.id} value={u.email}>{u.name || u.email}</option>
                          ))}
                        </datalist>
                        <select value={addRole} onChange={e => setAddRole(e.target.value)}
                          style={{ padding:'7px 8px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 12, color:'var(--fg)' }}>
                          {/* Workspaces.ROLES = ['owner','admin','member'] · 'manager'
                              se coercía a 'member' en silencio (bug) · lo quito. */}
                          <option value="member">member</option>
                          <option value="admin">admin</option>
                          <option value="owner">owner</option>
                        </select>
                        <button onClick={addMember} disabled={!addEmail.trim() || addingMember}
                          style={{ padding:'7px 14px', background: addEmail.trim() ? 'var(--accent)' : 'var(--bg-elevated)', color: addEmail.trim() ? '#fff' : 'var(--fg-muted)', border:'none', borderRadius: 6, cursor: addEmail.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700 }}>
                          {addingMember ? 'Añadiendo…' : 'Añadir'}
                        </button>
                      </div>
                    </div>

                    <button onClick={saveEdit} disabled={uploading}
                      style={{ alignSelf:'flex-start', padding:'8px 16px', background:'var(--ok)', color:'#fff', border:'none', borderRadius: 6, cursor: uploading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {T('common.save','Guardar cambios')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── PillsPanel · admin only · CRUD del catálogo del workspace activo ────
function PillsPanel() {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const [, setTick] = useEV2(0);
  const [openId, setOpenId] = useEV2(null);    // pill_number editándose, o 'new' para form de creación
  const [draft, setDraft] = useEV2({});
  const [uploadingVideo, setUploadingVideo] = useEV2(false);
  const [uploadingPoster, setUploadingPoster] = useEV2(false);
  useEE2(() => {
    const r = () => setTick(x => x + 1);
    window.addEventListener('pills-changed', r);
    window.addEventListener('workspace-changed', r);
    return () => {
      window.removeEventListener('pills-changed', r);
      window.removeEventListener('workspace-changed', r);
    };
  }, []);

  if (!window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;
  if (!window.Pills) {
    return (
      <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin:'0 0 6px' }}>📚 Catálogo de pills</h2>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Necesitas el backend Supabase activo para gestionar pills desde aquí. En modo demo el catálogo está fijo en código.</div>
      </section>
    );
  }
  const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
  const wsName = ws ? ws.name : '—';
  const pills = window.Pills.list();
  const categories = Array.from(new Set(pills.map(p => p.category).filter(Boolean))).sort();

  const startEdit = (p) => { setOpenId(p.pill); setDraft({ ...p }); };
  const startNew = () => {
    const nextNum = pills.length ? Math.max.apply(null, pills.map(p => p.pill)) + 1 : 0;
    setOpenId('new');
    setDraft({ pill: nextNum, id: 'p'+nextNum, title:'', one:'', teacher:'', duration:'4 min', level:'principiante', rating: 4.7, category: categories[0] || 'Fundamentos', tone:'teal', yt:'', mp4:'', poster:'', featured:false, newBadge:false });
  };
  const cancel = () => { setOpenId(null); setDraft({}); };
  const save = async () => {
    if (!draft.title || !draft.title.trim()) { if (window.Toast) window.Toast.error('Falta el título'); return; }
    if (openId === 'new') {
      await window.Pills.create(draft);
    } else {
      await window.Pills.update(openId, draft);
      if (window.Toast) window.Toast.success('Pill actualizada');
    }
    cancel();
  };
  const removeOne = async (p) => {
    if (!confirm('¿Borrar la pill "' + p.title + '"? No se puede deshacer.')) return;
    await window.Pills.remove(p.pill);
  };
  const onVideoFile = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f || openId === 'new' || openId == null) return;
    if (f.size > 500 * 1024 * 1024) { if (window.Toast) window.Toast.error('Vídeo > 500 MB'); return; }
    setUploadingVideo(true);
    try {
      const url = await window.Pills.uploadVideo(openId, f);
      if (url) setDraft(d => ({ ...d, mp4: url }));
    } finally { setUploadingVideo(false); e.target.value = ''; }
  };
  const onPosterFile = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f || openId === 'new' || openId == null) return;
    setUploadingPoster(true);
    try {
      const url = await window.Pills.uploadPoster(openId, f);
      if (url) setDraft(d => ({ ...d, poster: url }));
    } finally { setUploadingPoster(false); e.target.value = ''; }
  };

  const editForm = (
    <div style={{ display:'flex', flexDirection:'column', gap: 10, padding: 14, marginTop: 8, background:'var(--bg-elevated)', borderRadius: 10, border:'1px solid var(--line)' }}>
      <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap: 8, alignItems:'center' }}>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Nº</label>
        <input type="number" value={draft.pill || 0} onChange={e => setDraft({ ...draft, pill: parseInt(e.target.value, 10) || 0 })} style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Título</label>
        <input value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Título de la pill" autoFocus style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Resumen</label>
        <textarea value={draft.one || ''} onChange={e => setDraft({ ...draft, one: e.target.value })} placeholder="Una línea que resuma el contenido" rows={2} style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)', fontFamily:'inherit', resize:'vertical' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Categoría</label>
        <input value={draft.category || ''} onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="ej: Gestión del tiempo" list="cat-suggest" style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <datalist id="cat-suggest">{categories.map(c => <option key={c} value={c}/>)}</datalist>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Profesor</label>
        <input value={draft.teacher || ''} onChange={e => setDraft({ ...draft, teacher: e.target.value })} style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Duración</label>
        <input value={draft.duration || ''} onChange={e => setDraft({ ...draft, duration: e.target.value })} placeholder="4 min" style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Nivel</label>
        <select value={draft.level || 'principiante'} onChange={e => setDraft({ ...draft, level: e.target.value })} style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}>
          <option value="principiante">principiante</option>
          <option value="intermedio">intermedio</option>
          <option value="avanzado">avanzado</option>
        </select>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>YouTube ID</label>
        <input value={draft.yt || ''} onChange={e => setDraft({ ...draft, yt: e.target.value })} placeholder="ej: dQw4w9WgXcQ (opcional si hay MP4)" style={{ padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Vídeo MP4</label>
        <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap' }}>
          <input value={draft.mp4 || ''} onChange={e => setDraft({ ...draft, mp4: e.target.value })} placeholder="URL pública o sube archivo →" style={{ flex: 1, minWidth: 200, padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
          {openId !== 'new' && (
            <label style={{ padding:'7px 14px', background: uploadingVideo ? 'var(--bg-elevated)' : 'var(--accent)', color: uploadingVideo ? 'var(--fg-muted)' : '#fff', borderRadius: 6, cursor: uploadingVideo ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
              {uploadingVideo ? 'Subiendo…' : 'Subir MP4'}
              <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={onVideoFile} disabled={uploadingVideo} style={{ display:'none' }}/>
            </label>
          )}
        </div>
        <label style={{ fontSize: 10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--fg-muted)' }}>Poster</label>
        <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap' }}>
          {draft.poster && <img src={draft.poster} alt="" style={{ width: 56, height: 32, objectFit:'cover', border:'1px solid var(--line)', borderRadius: 4 }} onError={e => { e.currentTarget.style.display='none'; }}/>}
          <input value={draft.poster || ''} onChange={e => setDraft({ ...draft, poster: e.target.value })} placeholder="URL imagen o sube archivo →" style={{ flex: 1, minWidth: 200, padding:'7px 10px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 6, fontSize: 13, color:'var(--fg)' }}/>
          {openId !== 'new' && (
            <label style={{ padding:'7px 14px', background: uploadingPoster ? 'var(--bg-elevated)' : 'var(--accent)', color: uploadingPoster ? 'var(--fg-muted)' : '#fff', borderRadius: 6, cursor: uploadingPoster ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
              {uploadingPoster ? 'Subiendo…' : 'Subir imagen'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onPosterFile} disabled={uploadingPoster} style={{ display:'none' }}/>
            </label>
          )}
        </div>
        <span/>
        <div style={{ display:'flex', gap: 14, fontSize: 12, color:'var(--fg)', alignItems:'center' }}>
          <label style={{ display:'inline-flex', alignItems:'center', gap: 6, cursor:'pointer' }}><input type="checkbox" checked={!!draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })}/> Featured (hero)</label>
          <label style={{ display:'inline-flex', alignItems:'center', gap: 6, cursor:'pointer' }}><input type="checkbox" checked={!!draft.newBadge} onChange={e => setDraft({ ...draft, newBadge: e.target.checked })}/> Badge "Nuevo"</label>
        </div>
      </div>
      {openId === 'new' && (
        <div style={{ fontSize: 11, color:'var(--fg-muted)', fontStyle:'italic' }}>
          Crea la pill primero (botón Guardar). Después podrás editarla para subir el vídeo y el poster.
        </div>
      )}
      <div style={{ display:'flex', gap: 8 }}>
        <button onClick={save} disabled={uploadingVideo || uploadingPoster}
          style={{ padding:'8px 18px', background:'var(--ok)', color:'#fff', border:'none', borderRadius: 6, cursor: (uploadingVideo||uploadingPoster) ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
          {openId === 'new' ? 'Crear pill' : 'Guardar cambios'}
        </button>
        <button onClick={cancel} style={{ padding:'8px 16px', background:'transparent', color:'var(--fg-muted)', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 12, fontWeight: 600 }}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 14, gap: 12, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color:'var(--fg)', marginTop: 0, marginBottom: 4 }}>📚 Pills del workspace</h2>
          <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Catálogo de <strong>{wsName}</strong> · {pills.length} pills</div>
        </div>
        {openId !== 'new' && (
          <button onClick={startNew} style={{ padding:'10px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r-1)', cursor:'pointer', fontWeight: 700, fontSize: 12.5 }}>+ Nueva pill</button>
        )}
      </div>

      {openId === 'new' && editForm}

      {pills.length === 0 ? (
        <div style={{ padding: 40, textAlign:'center', color:'var(--fg-muted)', fontSize: 13 }}>
          Sin pills en este workspace. {openId !== 'new' && <button onClick={startNew} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', textDecoration:'underline', font:'inherit', padding: 0 }}>Crea la primera</button>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {pills.map(p => (
            <div key={p.id || p.pill} style={{ padding:'10px 14px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 8 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize: 11, fontWeight: 700, color:'var(--fg-muted)', minWidth: 28, textAlign:'right' }}>{String(p.pill).padStart(2, '0')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.featured ? <span title="Featured" style={{ marginRight: 6 }}>⭐</span> : null}
                    {p.title}
                  </div>
                  <div style={{ fontSize: 10.5, color:'var(--fg-muted)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop: 2 }}>
                    {p.category} · {p.level} · {p.duration} · {p.mp4 ? 'MP4' : p.yt ? 'YT' : 'sin vídeo'}
                  </div>
                </div>
                <button onClick={() => openId === p.pill ? cancel() : startEdit(p)} style={{ padding:'5px 10px', background: openId === p.pill ? 'var(--accent)' : 'transparent', color: openId === p.pill ? '#fff' : 'var(--accent)', border:'1px solid var(--accent)', borderRadius: 5, cursor:'pointer', fontSize: 11, fontWeight: 700 }}>
                  {openId === p.pill ? 'Cancelar' : 'Editar'}
                </button>
                <button onClick={() => removeOne(p)} style={{ padding:'5px 10px', background:'transparent', color:'var(--err)', border:'1px solid var(--line)', borderRadius: 5, cursor:'pointer', fontSize: 11, fontWeight: 600 }}>Borrar</button>
              </div>
              {openId === p.pill && editForm}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── ContentPanel · admin · CRUD genérico para paths/series/reels/podcasts ─
// Una sola UI para los 4 kinds del catálogo, con kind como prop. Antes
// estos arrays vivían hardcoded en el bundle como datos de Repsol; ahora
// se gestionan por workspace_id en la tabla workspace_content.
function ContentPanel({ kind, label, icon }) {
  const [, setTick] = useEV2(0);
  const [openId, setOpenId] = useEV2(null);
  const [draft, setDraft] = useEV2({});
  // Asignación a miembros · cuando se abre, contiene el path target.
  const [assignFor, setAssignFor] = useEV2(null);

  React.useEffect(() => {
    const r = () => setTick(t => t + 1);
    const evt = kind === 'path' ? 'paths-changed' : kind === 'series' ? 'series-changed' : kind === 'reel' ? 'reels-changed' : 'podcasts-changed';
    window.addEventListener(evt, r);
    window.addEventListener('workspace-changed', r);
    return () => { window.removeEventListener(evt, r); window.removeEventListener('workspace-changed', r); };
  }, [kind]);

  if (!window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;
  if (!window.Content) {
    return (
      <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin:'0 0 6px' }}>{icon} {label}</h2>
        <div style={{ fontSize: 13, color:'var(--fg-muted)' }}>Necesitas Supabase activo para gestionar contenido del workspace.</div>
      </section>
    );
  }
  const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
  const wsName = ws ? ws.name : '—';
  const items = window.Content.list(kind);

  const startEdit = (it) => { setOpenId(it._id); setDraft({ ...it, brand: (it._meta && it._meta.brand) || '' }); };
  const startNew = () => { setOpenId('new'); setDraft({ title: '', teacher: '', duration: '', tone: 'teal', category: '', level: '', rating: 4.7, enrolled: 0, brand: '' }); };
  const cancel = () => { setOpenId(null); setDraft({}); };

  const save = async () => {
    if (!draft.title || !draft.title.trim()) { if (window.Toast) window.Toast.error('Falta el título'); return; }
    // Brand vive en metadata.brand · lo extraemos del draft plano y lo
    // pasamos como patch.metadata para que content.update haga merge.
    const { brand, ...rest } = draft;
    const payload = brand !== undefined && kind === 'path'
      ? Object.assign({}, rest, { metadata: { brand: brand.trim() || null } })
      : rest;
    if (openId === 'new') {
      await window.Content.create(kind, payload);
    } else {
      await window.Content.update(kind, openId, payload);
      if (window.Toast) window.Toast.success('Actualizado');
    }
    setOpenId(null); setDraft({});
  };
  const remove = async (id, title) => {
    if (!confirm('¿Eliminar "' + title + '"?')) return;
    await window.Content.remove(kind, id);
  };

  const showLevel    = kind !== 'reel';
  const showRating   = kind !== 'reel';
  const showEnrolled = kind !== 'reel';
  const showCategory = kind !== 'reel';

  return (
    <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8, flexWrap:'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{icon} {label} · {wsName}</h2>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 2 }}>{items.length} {items.length === 1 ? 'elemento' : 'elementos'} · scopeado al workspace activo</div>
        </div>
        <button onClick={startNew} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight: 700, fontSize: 12.5 }}>+ Nuevo</button>
      </div>

      {items.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:'var(--fg-muted)', fontSize: 13, fontStyle:'italic' }}>
          Aún no hay {label.toLowerCase()} en este workspace. Crea el primero con el botón de arriba.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
          {items.map(it => (
            <div key={it._id} style={{ padding:'12px 14px', background:'var(--paper)', border:'1px solid var(--line-2)', borderRadius: 8, display:'flex', alignItems:'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color:'var(--fg)', display:'flex', alignItems:'center', gap: 8 }}>
                  {it.title}
                  {kind === 'path' && it._meta && it._meta.brand && (
                    <span style={{ padding:'2px 8px', background:'rgba(89,71,255,0.14)', color:'var(--accent)', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing:'0.04em' }}>{it._meta.brand}</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color:'var(--fg-muted)', marginTop: 2 }}>{[it.teacher, it.duration, it.category].filter(Boolean).join(' · ') || '—'}</div>
              </div>
              {kind === 'path' && (
                <button
                  onClick={() => setAssignFor(it)}
                  title="Asignar a miembros del workspace"
                  style={{ padding:'5px 12px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, color:'var(--accent)' }}>
                  📨 Asignar
                </button>
              )}
              <button onClick={() => startEdit(it)} style={{ padding:'5px 12px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, color:'var(--fg)' }}>Editar</button>
              <button onClick={() => remove(it._id, it.title)} style={{ padding:'5px 12px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 11.5, color:'#E63946' }}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {openId && (
        <div style={{ marginTop: 18, padding: 18, background:'var(--paper)', border:'2px solid var(--accent)', borderRadius: 8 }}>
          <h3 style={{ margin:'0 0 14px', fontSize: 15, fontWeight: 700 }}>{openId === 'new' ? 'Nuevo · ' + label : 'Editar · ' + (draft.title || '')}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Título *</div>
              <input value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} autoFocus style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
            </label>
            <label>
              <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Autor / instructor</div>
              <input value={draft.teacher || ''} onChange={e => setDraft({ ...draft, teacher: e.target.value })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
            </label>
            <label>
              <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Duración</div>
              <input value={draft.duration || ''} onChange={e => setDraft({ ...draft, duration: e.target.value })} placeholder={kind === 'reel' ? ':30' : '22 min'} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
            </label>
            <label>
              <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Tone (color)</div>
              <select value={draft.tone || 'teal'} onChange={e => setDraft({ ...draft, tone: e.target.value })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13 }}>
                {['teal','plum','clay','warm','olive','noir'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            {showCategory && (
              <label>
                <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Categoría</div>
                <input value={draft.category || ''} onChange={e => setDraft({ ...draft, category: e.target.value })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
              </label>
            )}
            {kind === 'path' && (
              <label>
                <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Marca (sub-catálogo)</div>
                <input value={draft.brand || ''} onChange={e => setDraft({ ...draft, brand: e.target.value })}
                  placeholder="Ej · 1906, Estrella Galicia, Anchois Cuca"
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
                <span style={{ fontSize: 10, color:'var(--fg-muted)', marginTop: 4, display:'block' }}>
                  Agrupa el catálogo por marca. Vacío = "Catálogo general".
                </span>
              </label>
            )}
            {showLevel && (
              <label>
                <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Nivel</div>
                <select value={draft.level || ''} onChange={e => setDraft({ ...draft, level: e.target.value })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13 }}>
                  <option value="">—</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </label>
            )}
            {showRating && (
              <label>
                <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Rating (0-5)</div>
                <input type="number" min="0" max="5" step="0.1" value={draft.rating || ''} onChange={e => setDraft({ ...draft, rating: parseFloat(e.target.value) || 0 })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
              </label>
            )}
            {showEnrolled && (
              <label>
                <div style={{ fontSize: 10, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 4 }}>Inscritos</div>
                <input type="number" min="0" value={draft.enrolled || 0} onChange={e => setDraft({ ...draft, enrolled: parseInt(e.target.value, 10) || 0 })} style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--line)', borderRadius: 6, background:'var(--bg-surface)', color:'var(--fg)', fontSize: 13, boxSizing:'border-box' }}/>
              </label>
            )}
          </div>
          <div style={{ display:'flex', gap: 8, marginTop: 16, justifyContent:'flex-end' }}>
            <button onClick={cancel} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 12.5, color:'var(--fg)' }}>Cancelar</button>
            <button onClick={save} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 6, cursor:'pointer', fontWeight: 700, fontSize: 12.5 }}>{openId === 'new' ? 'Crear' : 'Guardar'}</button>
          </div>
        </div>
      )}
      {assignFor && (
        <AssignMembersModal
          path={assignFor}
          onClose={() => setAssignFor(null)}
        />
      )}
    </section>
  );
}
window.ContentPanel = ContentPanel;

// ── AssignMembersModal · picker para asignar un curso a miembros específicos ─
// Lee Workspaces.membersOf(currentId) · checkbox por user · "Seleccionar
// todos" para volver al comportamiento broadcast. Solo crea notificaciones,
// no fuerza enrollment (el user decide al hacer click en la notificación).
function AssignMembersModal({ path, onClose }) {
  const ws = (window.Workspaces && window.Workspaces.current && window.Workspaces.current()) || {};
  const members = ((window.Workspaces && window.Workspaces.membersOf) ? window.Workspaces.membersOf(ws.id) : []) || [];
  // Excluye usuarios sin id válido (defensivo)
  const valid = members.filter(m => m.user_id || m.id);
  // Selección vacía por defecto · el admin elige a quién explícitamente.
  // Antes pre-marcaba a TODOS · un click en "Asignar a N" disparaba broadcast
  // a todo el workspace sin querer (sin undo). "Seleccionar todos" sigue ahí.
  const [selected, setSelected] = useEV2(() => new Set());
  const [query, setQuery] = useEV2('');
  const [sending, setSending] = useEV2(false);

  const q = query.trim().toLowerCase();
  const filtered = q ? valid.filter(m =>
    (m.name || '').toLowerCase().indexOf(q) !== -1 ||
    (m.email || '').toLowerCase().indexOf(q) !== -1
  ) : valid;

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };
  const selectAll = () => setSelected(new Set(valid.map(m => m.user_id || m.id)));
  const selectNone = () => setSelected(new Set());

  const send = async () => {
    if (selected.size === 0) { if (window.Toast) window.Toast.error('Selecciona al menos un miembro'); return; }
    if (!window.Inbox || !window.Inbox.broadcastToWorkspace) { if (window.Toast) window.Toast.error('Inbox no disponible'); return; }
    setSending(true);
    const r = await window.Inbox.broadcastToWorkspace(
      'Tienes un nuevo curso asignado · ' + path.title,
      { kind: 'info', icon: '📚', link: '#path:' + path.id, userIds: Array.from(selected) }
    );
    setSending(false);
    if (r.ok) {
      if (window.Toast) window.Toast.success('Asignado a ' + r.count + (r.count === 1 ? ' miembro' : ' miembros'));
      onClose();
    } else {
      if (window.Toast) window.Toast.error('Error: ' + (r.error || 'desconocido'));
    }
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(13,17,23,0.65)',
      backdropFilter:'blur(4px)', zIndex: 650,
      display:'flex', alignItems:'center', justifyContent:'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 14,
        boxShadow:'0 30px 80px rgba(0,0,0,0.45)',
        width:'min(520px, 100%)', maxHeight:'80vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{ padding:'18px 22px 12px', borderBottom:'1px solid var(--line)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom: 4 }}>Asignar curso</div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color:'var(--fg)' }}>{path.title}</h3>
          <div style={{ marginTop: 6, fontSize: 12, color:'var(--fg-muted)' }}>{valid.length} {valid.length === 1 ? 'miembro' : 'miembros'} en el workspace</div>
        </div>
        <div style={{ padding:'12px 22px', borderBottom:'1px solid var(--line)', display:'flex', gap: 10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o email…"
            style={{ flex: 1, minWidth: 180, padding:'8px 10px', background:'var(--bg-elevated)', border:'1px solid var(--line)', borderRadius: 6, color:'var(--fg)', fontSize: 12.5 }}/>
          <button onClick={selectAll} style={{ padding:'6px 10px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, color:'var(--fg-muted)', fontSize: 11, cursor:'pointer' }}>Todos</button>
          <button onClick={selectNone} style={{ padding:'6px 10px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, color:'var(--fg-muted)', fontSize: 11, cursor:'pointer' }}>Ninguno</button>
        </div>
        <div style={{ flex: 1, overflowY:'auto', padding:'8px 22px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center', color:'var(--fg-muted)', fontSize: 12.5 }}>
              {q ? 'Sin resultados para "' + query + '"' : 'No hay miembros en el workspace.'}
            </div>
          ) : filtered.map(m => {
            const id = m.user_id || m.id;
            const isSel = selected.has(id);
            return (
              <label key={id} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'10px 6px',
                borderBottom:'1px solid var(--line)', cursor:'pointer',
              }}>
                <input type="checkbox" checked={isSel} onChange={() => toggle(id)}
                  style={{ width: 16, height: 16, cursor:'pointer' }}/>
                <div style={{
                  width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
                  background: m.avatar_color || 'var(--accent)', color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 12, fontWeight: 700,
                }}>{(m.name || m.email || '?').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color:'var(--fg)' }}>{m.name || (m.email ? m.email.split('@')[0] : 'Sin nombre')}</div>
                  <div style={{ fontSize: 11, color:'var(--fg-muted)' }}>{m.email || '—'}{m.workspaceRole ? ' · ' + m.workspaceRole : ''}</div>
                </div>
              </label>
            );
          })}
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center', gap: 10 }}>
          <div style={{ fontSize: 12.5, color:'var(--fg-muted)' }}>
            {selected.size} {selected.size === 1 ? 'seleccionado' : 'seleccionados'}
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            <button onClick={onClose} disabled={sending} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer', fontSize: 12.5, color:'var(--fg-muted)' }}>Cancelar</button>
            <button onClick={send} disabled={sending || selected.size === 0} style={{ padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius: 6, cursor: (sending || selected.size === 0) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12.5, opacity: (sending || selected.size === 0) ? 0.6 : 1 }}>
              {sending ? 'Asignando…' : 'Asignar a ' + selected.size}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AssignMembersModal = AssignMembersModal;

// ── CertificatesAdminPanel · admin only · todos los certs del workspace ──
function CertificatesAdminPanel() {
  const [items, setItems] = useEV2([]);
  const [loading, setLoading] = useEV2(false);
  const [error, setError] = useEV2('');

  useEE2(() => {
    if (!window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return;
    if (!window.supabaseClient) return;
    const load = async () => {
      const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
      if (!ws) { setItems([]); return; }
      setLoading(true); setError('');
      try {
        // RLS permite a admin del workspace leer todos los certs · joineamos
        // con profiles para mostrar nombre + email del titular.
        const { data, error: err } = await window.supabaseClient
          .from('certificates')
          .select('id, route_id, route_title, cert_number, completed_at, user_id, profiles(name, email, avatar_color)')
          .eq('workspace_id', ws.id)
          .order('completed_at', { ascending: false });
        if (err) { setError(err.message); return; }
        setItems(data || []);
      } finally { setLoading(false); }
    };
    load();
    window.addEventListener('workspace-changed', load);
    window.addEventListener('certificates-changed', load);
    return () => {
      window.removeEventListener('workspace-changed', load);
      window.removeEventListener('certificates-changed', load);
    };
  }, []);

  if (!window.Auth || !window.Auth.can || !window.Auth.can('admin.viewPanel')) return null;

  const ws = window.Workspaces && window.Workspaces.current && window.Workspaces.current();
  const wsName = ws ? ws.name : '—';
  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch(e) { return iso; }
  };
  const exportCSV = () => {
    if (items.length === 0) return;
    const header = 'cert_number,user_name,user_email,route_title,completed_at\n';
    const rows = items.map(c => {
      const p = c.profiles || {};
      return [c.cert_number, p.name || '', p.email || '', c.route_title || c.route_id, c.completed_at]
        .map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',');
    }).join('\n');
    const blob = new Blob([header + rows], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificados-' + (ws ? ws.slug || 'workspace' : 'workspace') + '-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };
  const downloadOne = (cert) => {
    if (!window.Certificates || !window.Certificates.generateHTML) return;
    // Para descargar el PDF de un cert ajeno necesitamos sobreescribir la
    // identidad del titular en el HTML · usamos un wrap que pasa el name
    const html = window.Certificates.generateHTML({
      ...cert,
      // El user que descarga es el admin · sobreescribimos para que el cert
      // refleje al titular real desde el join con profiles.
    });
    // Inyectamos el nombre del titular en el HTML · simple replace del
    // userName que generateHTML pone (que es el admin actual).
    const p = cert.profiles || {};
    const titularName = p.name || (p.email ? p.email.split('@')[0] : 'Titular');
    const replaced = html.replace(
      /<div class="name">[^<]*<\/div>/,
      '<div class="name">' + titularName.replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])) + '</div>'
    );
    const blob = new Blob([replaced], { type:'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = s => (s||'').toString().replace(/[^A-Za-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    a.download = 'Cert-' + safe(cert.route_title || cert.route_id) + '-' + safe(titularName) + '.html';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  return (
    <section style={{ marginTop: 32, padding: 24, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12, flexWrap:'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🏆 Certificados emitidos · {wsName}</h2>
          <div style={{ fontSize: 12, color:'var(--fg-muted)', marginTop: 2 }}>
            {loading ? 'Cargando…' : items.length === 0 ? 'Sin certificados emitidos todavía' : items.length + ' certificado' + (items.length === 1 ? '' : 's')}
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={exportCSV} style={{
            padding:'8px 14px', background:'transparent', color:'var(--fg)', border:'1px solid var(--line)', borderRadius: 8, cursor:'pointer',
            fontFamily:'var(--font-sans)', fontSize: 12, fontWeight: 700,
          }}>↓ Exportar CSV</button>
        )}
      </div>
      {error && <div style={{ padding: 10, background:'rgba(224,52,31,0.1)', border:'1px solid rgba(224,52,31,0.3)', borderRadius: 6, color:'#E0341F', fontSize: 12 }}>{error}</div>}
      {items.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {items.map(cert => {
            const p = cert.profiles || {};
            const initial = (p.name || p.email || '?').trim()[0].toUpperCase();
            return (
              <div key={cert.id} style={{ display:'flex', alignItems:'center', gap: 12, padding:'10px 14px', background:'var(--paper)', border:'1px solid var(--line-2)', borderRadius: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius:'50%', background: p.avatar_color || 'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color:'var(--fg)' }}>{p.name || (p.email ? p.email.split('@')[0] : 'Usuario')}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)' }}>{cert.route_title || cert.route_id}</div>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-muted)', letterSpacing:'0.04em', textAlign:'right' }}>
                  <div>{cert.cert_number}</div>
                  <div style={{ marginTop: 2 }}>{fmtDate(cert.completed_at)}</div>
                </div>
                <button onClick={() => downloadOne(cert)} title="Descargar certificado" style={{
                  padding:'6px 10px', background:'transparent', border:'1px solid var(--line)', borderRadius: 6, cursor:'pointer',
                  fontSize: 11.5, color:'var(--fg)',
                }}>↓</button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
window.CertificatesAdminPanel = CertificatesAdminPanel;

// ── ManagerView · panel del líder de equipo · KPIs + miembros + invitar ──
function ManagerView({ setView }) {
  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const D = window.SGS_DATA;
  const USER = (D && D.USER) || {};
  const allUsers = (window.Auth && window.Auth.listUsers && window.Auth.listUsers()) || [];
  // Miembros del equipo del manager (mismo team)
  const teamMembers = allUsers.filter(u => u.team && USER.team && u.team === USER.team && u.id !== USER.id);
  const PILLS = (D && D.PILLS) || [];
  const completedTotal = PILLS.filter(p => p.progress >= 1).length;

  const KPIS = [
    { icon:'👥', label: T('manager.kpi.team','Miembros de tu equipo'),    value: String(teamMembers.length),                                desc: USER.team || '—' },
    { icon:'📚', label: T('manager.kpi.completed','Pills completadas'),    value: String(completedTotal),                                    desc: T('manager.kpi.completedSub','total acumulado del equipo') },
    { icon:'⚡',  label: T('manager.kpi.avg','Progreso medio'),            value: PILLS.length ? Math.round((completedTotal / PILLS.length) * 100) + '%' : '—', desc: T('manager.kpi.avgSub','vs total catálogo') },
    { icon:'🎯', label: T('manager.kpi.openInvites','Invitaciones abiertas'),
      value: (() => {
        const invs = (window.Invitations && window.Invitations.list && window.Invitations.list()) || [];
        return String(invs.filter(i => (i.status === 'pending' || i.status === 'invited' || !i.status) && i.invitedBy === USER.id).length);
      })(),
      desc: T('manager.kpi.openInvitesSub','enviadas por ti') },
  ];

  return (
    <PageShell
      eyebrow={T('manager.eyebrow','Panel · Manager')}
      title={<>{T('manager.title','Tu equipo')}</>}
      sub={T('manager.sub','Visión de progreso, KPIs y gestión de los miembros de tu equipo')}
      actions={Auth.can && Auth.can('admin.viewPanel') ? (
        <button onClick={() => setView('admin')} style={{
          padding:'12px 20px', background:'transparent', border:'1px solid var(--line)', color:'var(--fg-muted)',
          borderRadius:'var(--r-1)', cursor:'pointer', fontWeight:600, fontSize:14,
        }}>{T('manager.gotoAdmin','Panel admin →')}</button>
      ) : null}>

      {/* KPIs del equipo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ padding: 20, background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--fg-dim)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color:'var(--fg)', fontFamily:'var(--font-sans)', letterSpacing:'-0.02em', marginBottom: 3 }}>{k.value}</div>
            <div style={{ fontSize: 12, color:'var(--fg-muted)' }}>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Lista de miembros */}
      <section>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 16, gap:12, flexWrap:'wrap' }}>
          <h2 style={{ fontFamily:'var(--font-sans)', fontSize: 20, fontWeight: 700, margin: 0 }}>{T('manager.members','Miembros del equipo')}</h2>
          {Auth.can && Auth.can('team.inviteUser') && (
            <button onClick={() => setView('admin')} style={{
              padding:'10px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r-1)',
              cursor:'pointer', fontWeight:700, fontSize: 12.5, boxShadow:'0 4px 12px rgba(110,80,238,0.30)',
            }}>{T('manager.invite','✉ Invitar miembro')}</button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div style={{ padding: 60, textAlign:'center', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius:'var(--r-2)' }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.45 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)', marginBottom: 4 }}>{T('manager.empty','Aún no tienes miembros en tu equipo')}</div>
            <div style={{ fontSize: 12.5, color:'var(--fg-muted)' }}>{T('manager.emptyDesc','Invita a tus colegas usando el botón superior.')}</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {teamMembers.map(m => (
              <div key={m.id} style={{ padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--line)', borderRadius: 12, display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius:'50%', background: m.avatarColor || 'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                  {(m.name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color:'var(--fg)' }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color:'var(--fg-muted)' }}>{m.role}</div>
                </div>
                {m.systemRole === 'manager' && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background:'var(--accent)', color:'#fff', borderRadius: 4, letterSpacing:'0.08em' }}>MANAGER</span>
                )}
                {m.systemRole === 'admin' && (
                  <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, fontWeight: 800, padding:'3px 7px', background:'var(--warn)', color:'#fff', borderRadius: 4, letterSpacing:'0.08em' }}>ADMIN</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

window.ManagerView_New = ManagerView;
