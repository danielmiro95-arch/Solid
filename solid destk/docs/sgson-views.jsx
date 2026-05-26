/* ============================================================
   SGS|on · Redesign Sidebar overlay + Detail modal
   Wrapper de los componentes del mockup adaptado al SaaS actual.
   Datos vía window.SGS_DATA (alimentado por sgson-adapter.jsx).
   ============================================================ */

const { useState: useSV, useEffect: useEV } = React;

// Slug helper · convierte "Social Publish" → "social-publish"
const catSlug = (s) => String(s || '').toLowerCase().replace(/\s+/g, '-');
// Para Analytics y Care el slug colisiona con tonalidades del rediseño; usamos -real para diferenciar
const catSlugFix = (s) => {
  const x = catSlug(s);
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

/* ============================================================
   Sidebar overlay
   ============================================================ */
function SidebarOverlay({ open, onClose, view, onView }) {
  if (!open) return null;
  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  if (!D) return null;
  const { SIDEBAR_LINKS, USER } = D;
  const isAdmin = !!(USER && USER.isAdmin);

  // ESC para cerrar
  useEV(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <React.Fragment>
      <div className="sb-backdrop" onClick={onClose}/>
      <aside className="sb-overlay" data-screen-label="Sidebar overlay">
        <div className="sb-head">
          {window.Wordmark ? <Wordmark variant="v1"/> : <span className="wordmark v1"><span className="sgs">SGS</span><span className="pipe">|</span><span className="on">on</span></span>}
          <button className="sb-close" onClick={onClose} aria-label="Cerrar"><Ico name="close" size={16}/></button>
        </div>

        <div className="sb-section">
          <div className="sb-section-label">Navegación</div>
          {SIDEBAR_LINKS.filter(l => !l.admin || isAdmin).map(l => (
            <button
              key={l.key}
              className={`sb-link ${view === l.key ? 'active' : ''}`}
              onClick={() => { onView(l.key); onClose(); }}>
              <span className="icon"><Ico name={l.icon} size={16}/></span>
              {l.label}
              {l.count ? <span className="count">{l.count}</span> : null}
            </button>
          ))}
        </div>

        <div className="sb-foot">
          <span className="avatar">{USER.initials}</span>
          <div className="who">
            <div className="n">{USER.name}</div>
            <div className="r">{USER.role}</div>
          </div>
          <button className="sb-close" aria-label="Opciones"><Ico name="dots" size={16}/></button>
        </div>
      </aside>
    </React.Fragment>
  );
}

/* ============================================================
   Detail modal · slide-up cinematográfico
   ============================================================ */
function DetailModal({ pill, onClose, openPlayer }) {
  if (!pill) return null;
  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const PILLS = (D && D.PILLS) || [];
  const CATS  = (D && D.CATS) || {};
  const cat = CATS[pill.category] || { label: pill.category || 'Módulo' };
  const slug = catSlugFix(pill.category);
  const related = PILLS.filter(p => p.category === pill.category && p.id !== pill.id).slice(0, 4);

  // ESC + lock body scroll
  useEV(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const goPlay = () => { onClose(); openPlayer && openPlayer(pill); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} data-screen-label="Detail modal">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Ico name="close" size={18}/></button>

        <div className="modal-media">
          <div className={`modal-media-inner cover-${slug}`}/>
          <div className="hero-overlay"/>
          <div className="modal-hero-body">
            <div className="hero-eyebrow" style={{ marginBottom: 14 }}>
              <span className="pillmark">Think Pill · {pill.pill}</span>
              <span className="sep"/>
              <span className="meta">{cat.label}</span>
            </div>
            <h2 className="h">{pill.title}</h2>
            <p className="q">"{pill.one}."</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={goPlay}><Ico name="play" size={16}/> Reproducir</button>
              <button className="btn btn-icon btn-ghost" aria-label="Añadir"><Ico name="plus" size={18}/></button>
              <button className="btn btn-icon btn-ghost" aria-label="Me gusta"><Ico name="thumb" size={16}/></button>
              <button className="btn btn-icon btn-ghost" aria-label="Sonido"><Ico name="mute" size={16}/></button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div>
            <div className="meta-row">
              <span className="match">{Math.round(78 + (pill.id * 17) % 22)}% afinidad</span>
              <span>2026</span>
              <span className="lvl">{pill.level}</span>
              <span>{pill.duration}</span>
              <span>★ {pill.rating && pill.rating.toFixed ? pill.rating.toFixed(1) : pill.rating}</span>
            </div>
            <p>
              {pill.one}. En esta pill de {pill.duration} vas a dominar el flujo completo dentro de Sprinklr:
              desde la configuración inicial hasta el caso real con métricas. Pensado para perfiles {String(pill.level).toLowerCase()},
              con ejemplos del día a día en Repsol y plantillas listas para clonar.
            </p>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>
              Aplica directamente en tu cuenta de Sprinklr. Materiales descargables incluidos.
            </p>
          </div>
          <aside className="modal-side">
            <div className="lbl">Profesor / Mentora</div>
            <div className="val">{pill.teacher}</div>

            <div className="lbl">Etiquetas</div>
            <div className="val" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['sprinklr', String(cat.label).toLowerCase(), String(pill.level).toLowerCase(), 'repsol'].map(t => (
                <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 8px', border:'1px solid var(--line)', borderRadius: 'var(--r-pill)', color: 'var(--fg-muted)' }}>
                  #{t}
                </span>
              ))}
            </div>

            <div className="lbl">Personas matriculadas</div>
            <div className="val">{(pill.enrolled || 0).toLocaleString('es-ES')}</div>

            <div className="lbl">Ruta sugerida</div>
            <div className="val">{cat.label} · ruta del módulo</div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="modal-related">
            <h3>Más pills de {cat.label}</h3>
            <div className="grid">
              {related.map(p => {
                const ps = catSlugFix(p.category);
                return (
                  <article key={p.id} className="mini" onClick={(e) => e.stopPropagation()}>
                    <div className={`thumb cover-${ps}`}/>
                    <div className="info">
                      <div className="t">{p.title}</div>
                      <div className="m">Pill {p.pill} · {p.duration} · {p.level}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.SidebarOverlay = SidebarOverlay;
window.DetailModal = DetailModal;
window.catSlugFix = catSlugFix;
