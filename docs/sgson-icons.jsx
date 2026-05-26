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
    case 'volume':     return (<svg {...p}><path d="M4 10v4h3l5 4V6L7 10H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>);
    case 'mute':       return (<svg {...p}><path d="M4 10v4h3l5 4V6L7 10H4zM17 10l4 4M21 10l-4 4"/></svg>);
    case 'send':       return (<svg {...p}><path d="M3 12l18-8-8 18-2-7z"/></svg>);
    case 'attach':     return (<svg {...p}><path d="M17 8l-7 7a3 3 0 0 0 4 4l8-8a5 5 0 0 0-7-7L7 12a7 7 0 0 0 10 10"/></svg>);
    case 'dots':       return (<svg {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></svg>);
    case 'sliders':    return (<svg {...p}><path d="M3 6h13M19 6h2M3 12h6M12 12h9M3 18h13M19 18h2"/><circle cx="17" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>);
    case 'sparkle':    return (<svg {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>);
    case 'star':       return (<svg {...p}><path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor"/></svg>);
    default: return null;
  }
};

window.Ico = Ico;

/* ============================================================
   Wordmark — two treatments
   ============================================================ */

const Wordmark = ({ variant='v1', size, withLogo = true }) => (
  <span className={`wordmark ${variant}`} style={Object.assign({display:'inline-flex', alignItems:'center', gap:10}, size ? {fontSize:size} : {})}>
    {withLogo && (
      <img src={`beonit-logo.png?v=${(typeof window !== 'undefined' && window.SOLID_VERSION) || 'init'}`}
           alt=""
           style={{height: size ? size * 1.15 : 30, width:'auto', flexShrink:0}}/>
    )}
    <span style={{fontFamily:'Inter, sans-serif', fontWeight:700, letterSpacing:'-0.025em', color:'inherit'}}>
      Solid<span style={{fontFamily:'Instrument Serif, Georgia, serif', fontStyle:'italic', fontWeight:400, letterSpacing:'0.02em'}}>Stream</span>
    </span>
  </span>
);

window.Wordmark = Wordmark;
