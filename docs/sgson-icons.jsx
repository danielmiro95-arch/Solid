/* ============================================================
   SGS|on · Icons (stroke-based, original)
   ============================================================ */

const Ico = ({ name, size=18, stroke=1.7 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch(name) {
    case 'menu':       return (<svg {...p}><path d="M3 7h18M3 12h12M3 17h18"/></svg>);
    case 'search':     return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'bell':       return (<svg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7zM10 19a2 2 0 0 0 4 0"/></svg>);
    case 'play':       return (<svg {...p}><path d="M7 5l11 7-11 7z" fill="currentColor"/></svg>);
    case 'play-stroke':return (<svg {...p}><path d="M7 5l11 7-11 7z"/></svg>);
    case 'info':       return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7.5v.1"/></svg>);
    case 'plus':       return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case 'check':      return (<svg {...p}><path d="M5 12l5 5L20 7"/></svg>);
    case 'thumb':      return (<svg {...p}><path d="M7 11h2v9H4l3-9zM9 11l4-7c1 0 2 1 2 2v3h5c1 0 2 1 1.7 2.2l-1.5 6.6c-.3 1.2-1.3 2-2.5 2H9z"/></svg>);
    case 'close':      return (<svg {...p}><path d="M6 6l12 12M18 6l-12 12"/></svg>);
    case 'chev-left':  return (<svg {...p}><path d="M15 6l-6 6 6 6"/></svg>);
    case 'chev-right': return (<svg {...p}><path d="M9 6l6 6-6 6"/></svg>);
    case 'chev-down':  return (<svg {...p}><path d="M6 9l6 6 6-6"/></svg>);
    case 'home':       return (<svg {...p}><path d="M3 12l9-8 9 8M5 10v10h14V10"/></svg>);
    case 'inbox':      return (<svg {...p}><path d="M3 13l3-9h12l3 9M3 13v6h18v-6M3 13h6l1 2h4l1-2h6"/></svg>);
    case 'grid':       return (<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
    case 'route':      return (<svg {...p}><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6h-6a3 3 0 0 1 0-6h7"/></svg>);
    case 'compass':    return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-5 2 2-5z"/></svg>);
    case 'chart':      return (<svg {...p}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>);
    case 'spark':      return (<svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M6 18l4-4M14 10l4-4"/></svg>);
    case 'broadcast': return (<svg {...p}><circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/></svg>);
    case 'bookmark':   return (<svg {...p}><path d="M6 3h12v18l-6-4-6 4z"/></svg>);
    case 'user':       return (<svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>);
    case 'gear':       return (<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>);
    case 'shield':     return (<svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>);
    case 'users':      return (<svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M14 20c0-2.5 2-4 4.5-4"/></svg>);
    case 'volume':     return (<svg {...p}><path d="M4 10v4h3l5 4V6L7 10H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>);
    case 'mute':       return (<svg {...p}><path d="M4 10v4h3l5 4V6L7 10H4zM17 10l4 4M21 10l-4 4"/></svg>);
    case 'send':       return (<svg {...p}><path d="M3 12l18-8-8 18-2-7z"/></svg>);
    case 'attach':     return (<svg {...p}><path d="M17 8l-7 7a3 3 0 0 0 4 4l8-8a5 5 0 0 0-7-7L7 12a7 7 0 0 0 10 10"/></svg>);
    case 'dots':       return (<svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></svg>);
    case 'sliders':    return (<svg {...p}><path d="M3 6h13M19 6h2M3 12h6M12 12h9M3 18h13M19 18h2"/><circle cx="17" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>);
    case 'sparkle':    return (<svg {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>);
    case 'star':       return (<svg {...p}><path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor"/></svg>);
    case 'star-o':     return (<svg {...p}><path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>);
    case 'chev-up':    return (<svg {...p}><path d="M6 15l6-6 6 6"/></svg>);
    case 'dots-v':     return (<svg {...p}><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>);
    // ── glyphs del set analytics · replicados aquí para que el Ico léxico
    //    (resuelto por bare <Ico> en algunos modos de babel) sea completo ──
    case 'award':      return (<svg {...p}><circle cx="12" cy="9" r="6"/><path d="M9 14l-1.5 7L12 18l4.5 3L15 14"/></svg>);
    case 'book':       return (<svg {...p}><path d="M5 4h12a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2z"/><path d="M5 17h13"/></svg>);
    case 'caption':    return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 11h3M14 11h3M7 15h6"/></svg>);
    case 'back':       return (<svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
    case 'next':       return (<svg {...p}><path d="M6 5l8 7-8 7zM18 5v14"/></svg>);
    case 'skip':       return (<svg {...p}><path d="M18 5l-8 7 8 7zM6 5v14"/></svg>);
    case 'vol':        return (<svg {...p}><path d="M4 10v4h3l5 4V6L7 10H4zM16 9a4 4 0 0 1 0 6"/></svg>);
    case 'folder':     return (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>);
    case 'tag':        return (<svg {...p}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/></svg>);
    case 'clock':      return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>);
    case 'share':      return (<svg {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/></svg>);
    case 'people':     return (<svg {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6M17 14.5a6 6 0 0 1 4 5.5"/></svg>);
    case 'lock':       return (<svg {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    case 'unlock':     return (<svg {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>);
    case 'clone':      return (<svg {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/></svg>);
    case 'edit':       return (<svg {...p}><path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4"/></svg>);
    case 'trash':      return (<svg {...p}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13h10l1-13"/></svg>);
    case 'export':     return (<svg {...p}><path d="M12 3v12M8 7l4-4 4 4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>);
    case 'download':   return (<svg {...p}><path d="M12 3v12M8 11l4 4 4-4M5 19h14"/></svg>);
    case 'expand':     return (<svg {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>);
    case 'eye':        return (<svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'filter':     return (<svg {...p}><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>);
    case 'grip':       return (<svg {...p}><circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/></svg>);
    case 'layers':     return (<svg {...p}><path d="M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 8v0"/></svg>);
    case 'library':    return (<svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/></svg>);
    case 'refresh':    return (<svg {...p}><path d="M20 11a8 8 0 0 0-14-4l-2 2M4 13a8 8 0 0 0 14 4l2-2M16 5h4V1M8 19H4v4"/></svg>);
    case 'calendar':   return (<svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case 'globe':      return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>);
    case 'check-circle': return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>);
    case 'arrow-up':   return (<svg {...p}><path d="M12 19V5M6 11l6-6 6 6"/></svg>);
    case 'arrow-down': return (<svg {...p}><path d="M12 5v14M6 13l6 6 6-6"/></svg>);
    case 'arrow-right':return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'drag-h':     return (<svg {...p}><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M5 12h14"/></svg>);
    case 'viz-kpi':    return (<svg {...p}><path d="M4 14h3M9 9v5M14 6v8M19 11v3" strokeWidth="2.4"/></svg>);
    case 'viz-line':   return (<svg {...p}><path d="M3 16l5-5 4 3 6-8" /><path d="M3 20h18" opacity="0.4"/></svg>);
    case 'viz-area':   return (<svg {...p}><path d="M3 16l5-5 4 3 6-7v9H3z" fill="currentColor" fillOpacity="0.18"/><path d="M3 16l5-5 4 3 6-7"/></svg>);
    case 'viz-bar':    return (<svg {...p}><path d="M6 20v-8M12 20V6M18 20v-5" strokeWidth="2.4"/><path d="M3 20h18" opacity="0.4"/></svg>);
    case 'viz-hbar':   return (<svg {...p}><path d="M4 6h12M4 12h8M4 18h15" strokeWidth="2.4"/></svg>);
    case 'viz-donut':  return (<svg {...p}><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'viz-table':  return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/></svg>);
    case 'viz-heat':   return (<svg {...p}><rect x="3" y="4" width="4" height="4"/><rect x="9" y="4" width="4" height="4"/><rect x="15" y="4" width="4" height="4"/><rect x="3" y="10" width="4" height="4"/><rect x="9" y="10" width="4" height="4"/><rect x="15" y="10" width="4" height="4"/><rect x="3" y="16" width="4" height="4"/><rect x="9" y="16" width="4" height="4"/><rect x="15" y="16" width="4" height="4"/></svg>);
    case 'viz-funnel': return (<svg {...p}><path d="M3 5h18l-5 6v6l-8 2v-8z"/></svg>);
    case 'viz-bubble': return (<svg {...p}><circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="14" r="2.2"/><circle cx="17" cy="7" r="1.4"/></svg>);
    default: return null;
  }
};

window.Ico = Ico;

/* ============================================================
   Wordmark — two treatments
   ============================================================ */

const Wordmark = ({ variant='v1', size, withLogo = true }) => {
  // Re-render cuando el branding del workspace activo cambia (logo, color).
  const [, _force] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => _force(x => x + 1);
    window.addEventListener('workspace-branding-changed', onChange);
    return () => window.removeEventListener('workspace-branding-changed', onChange);
  }, []);
  const wsLogo = (typeof window !== 'undefined' && window.WORKSPACE_LOGO_URL) || null;
  const beonitLogo = `beonit-logo.png?v=${(typeof window !== 'undefined' && window.SOLID_VERSION) || 'init'}`;
  const _h = size ? size * 1.15 : 30;
  // (b177) Branding nuevo · "Solid Growth By beonit". Si el workspace
  // tiene su logo · mostramos AMBOS · logo del cliente + logo beonit
  // pequeño al lado. Si no hay logo del cliente · solo beonit.
  return (
    <span className={`wordmark ${variant}`} style={Object.assign({display:'inline-flex', alignItems:'center', gap:10}, size ? {fontSize:size} : {})}>
      {withLogo && wsLogo && (
        <>
          <img src={wsLogo}
               alt=""
               onError={e => { e.currentTarget.style.display = 'none'; }}
               style={{height: _h, width:'auto', flexShrink:0}}/>
          <span style={{width:1, height:_h*0.65, background:'rgba(11,18,38,0.18)', flexShrink:0}}/>
          <img src={beonitLogo}
               alt="beonit"
               style={{height: _h * 0.78, width:'auto', flexShrink:0, opacity:0.85}}/>
        </>
      )}
      {withLogo && !wsLogo && (
        <img src={beonitLogo}
             alt="beonit"
             style={{height: _h, width:'auto', flexShrink:0}}/>
      )}
      <span style={{fontFamily:'Inter, sans-serif', fontWeight:700, letterSpacing:'-0.025em', color:'inherit', display:'inline-flex', alignItems:'baseline', gap:6}}>
        <span>Solid <span style={{fontFamily:'Instrument Serif, Georgia, serif', fontStyle:'italic', fontWeight:400, letterSpacing:'0.02em'}}>Growth</span></span>
        <span style={{fontFamily:'Inter, sans-serif', fontWeight:400, fontSize:'0.6em', letterSpacing:'0.01em', opacity:0.6}}>By beonit</span>
      </span>
    </span>
  );
};

window.Wordmark = Wordmark;
