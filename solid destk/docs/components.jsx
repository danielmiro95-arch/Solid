// components.jsx — SOLID 2.0 · Udacity-style cards

const LEVEL_LABELS = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };

const CATEGORY_COLORS = {
  'Fundamentos':    '#0072BE',
  'Estructura':     '#005a96',
  'Gobernanza':     '#3d31cc',
  'Social Publish': '#EB0029',
  'Activos':        '#036837',
  'Aprobaciones':   '#8A3992',
  'Compliance':     '#1a1a2e',
  'Calendario':     '#0072BE',
  'Analytics':      '#004d8a',
  'Care':           '#B8001F',
  'Integraciones':  '#3d31cc',
};

const RepsolCover = ({ pill, category }) => {
  const accent = CATEGORY_COLORS[category] || '#0D1117';
  return (
    <div style={{position:'absolute', inset:0, background:'#080e1a', overflow:'hidden'}}>
      <div style={{position:'absolute', top:0, left:0, right:0, height:3, background:'#EB0029'}}/>
      <div style={{position:'absolute', top:3, left:0, bottom:0, width:3, background:accent, opacity:0.7}}/>
      <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 22px)'}}/>
      <div style={{position:'absolute', right:-6, bottom:-10, fontSize:76, fontWeight:800, fontFamily:'var(--mono)', color:'rgba(235,0,41,0.06)', lineHeight:1, letterSpacing:'-0.05em', userSelect:'none', pointerEvents:'none'}}>
        {pill != null ? String(pill).padStart(2,'0') : ''}
      </div>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'10px 12px', gap:2}}>
        <div style={{fontFamily:'var(--mono)', fontSize:7.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)'}}>Repsol × Sprinklr</div>
        {category && <div style={{fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:accent === '#EB0029' || accent === '#B8001F' ? '#ff6b6b' : '#6C8EFF', fontWeight:700}}>{category}</div>}
      </div>
    </div>
  );
};

const Card = ({ tone = 'noir', pill, title, one, teacher, duration, progress = 0, onClick, format, level, rating, enrolled, category, yt }) => (
  <div className="card" onClick={onClick}>
    <div className="card-thumb">
      {yt
        ? <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt={title}/>
        : <RepsolCover pill={pill} category={category}/>
      }
      <div className="card-hover-overlay">
        <div className="card-play-btn"><Icon name="play" size={16}/></div>
      </div>
      {format && <span className="card-format-tag">{format}</span>}
      {progress > 0 && <div className="card-progress-bar"><i style={{width: progress+'%'}}/></div>}
    </div>
    <div className="card-body">
      {category && <span className="card-category">{category}</span>}
      <div className="card-title">{title}</div>
      {one && (
        <div className="card-th1ng">
          <span className="th1ng-label">TH1NG</span>
          <span className="th1ng-text">{one}</span>
        </div>
      )}
      <div className="card-instructor">{teacher}</div>
      {rating && (
        <div className="card-rating">
          <span className="card-stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>
          <span className="card-score">{rating}</span>
          {enrolled && <span className="card-count">({enrolled >= 1000 ? (enrolled/1000).toFixed(1)+'K' : enrolled})</span>}
        </div>
      )}
      <div className="card-footer">
        {duration && <span className="card-duration"><Icon name="clock" size={11}/> {duration}</span>}
        {level && <span className={`card-level level-${level}`}>{LEVEL_LABELS[level]}</span>}
      </div>
    </div>
  </div>
);

const Row = ({ title, emTitle, children, extraClass = '' }) => (
  <section className={`row ${extraClass}`}>
    <div className="row-head">
      <h2>{title}{emTitle && <> <em>{emTitle}</em></>}</h2>
      <span className="link">Ver todo →</span>
    </div>
    <div className="row-scroll">{children}</div>
  </section>
);

const Icon = ({ name, size = 16 }) => {
  const paths = {
    home:     'M3 12L12 4l9 8M5 10v10h14V10',
    compass:  'M12 2a10 10 0 100 20 10 10 0 000-20zM8.5 15.5L10 10l5.5-1.5L14 14z',
    sparkle:  'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4',
    bookmark: 'M6 3h12v18l-6-4-6 4z',
    user:     'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1',
    play:     'M8 5v14l11-7z',
    pause:    'M6 4h4v16H6zM14 4h4v16h-4z',
    search:   'M11 4a7 7 0 104.9 12l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0011 4z',
    chat:     'M21 12c0 4.97-4.03 9-9 9-1.5 0-2.9-.37-4.13-1.02L3 21l1.04-4.87A8.95 8.95 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z',
    send:     'M2 21l21-9L2 3l4.5 9L2 21z',
    clock:    'M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z',
    trend:    'M3 17l6-6 4 4 7-8M14 7h7v7',
    book:     'M4 4h7a3 3 0 013 3v13H7a3 3 0 01-3-3V4zM20 4h-7a3 3 0 00-3 3v13h7a3 3 0 003-3V4z',
    mic:      'M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v4M8 22h8',
    close:    'M6 6l12 12M6 18L18 6',
    back:     'M20 12H4M10 6l-6 6 6 6',
    next:     'M4 12h16M14 6l6 6-6 6',
    skip:     'M5 4l10 8-10 8V4zM19 5v14',
    vol:      'M5 9v6h4l5 4V5L9 9H5zM16 8a5 5 0 010 8',
    caption:  'M2 6h20v12H2zM6 12h4M14 12h4',
    check:    'M5 12l4 4L19 6',
    bolt:     'M13 2L4 14h7l-1 8 9-12h-7z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ''} />
    </svg>
  );
};

window.Card = Card;
window.Row = Row;
window.Icon = Icon;
