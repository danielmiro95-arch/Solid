// components.jsx — shared editorial UI atoms for SOLID 2.0

const fmt = { icon: {
  pill: '◉', reel: '▶', series: '▦', podcast: '◐', path: '◇', course: '▧'
}};

const Card = ({ kind = 'pill', tone = 'noir', title, teacher, duration, progress = 0, onClick, format }) => (
  <div className={`card ${kind}`} onClick={onClick}>
    <div className="card-img">
      <div className={`ph ${tone}`}>{format || kind}</div>
      <span className="format-tag">{format || kind}</span>
      {duration && <span className="dur-tag">{duration}</span>}
      {progress > 0 && <div className="progress-bar"><i style={{width: progress+'%'}}/></div>}
    </div>
    <div className="card-title">{title}</div>
    <div className="card-meta">
      <span>{teacher}</span>
      {duration && <><span className="dot"/><span>{duration}</span></>}
    </div>
  </div>
);

const Row = ({ title, emTitle, children, extraClass = '' }) => (
  <section className={`row ${extraClass}`}>
    <div className="row-head">
      <h2>{title}{emTitle && <> <em>{emTitle}</em></>}</h2>
      <span className="link">Browse all →</span>
    </div>
    <div className="row-scroll">{children}</div>
  </section>
);

const Icon = ({ name, size = 16 }) => {
  const paths = {
    home: 'M3 12L12 4l9 8M5 10v10h14V10',
    compass: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8.5 15.5L10 10l5.5-1.5L14 14z',
    sparkle: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4',
    bookmark: 'M6 3h12v18l-6-4-6 4z',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1',
    play: 'M8 5v14l11-7z',
    search: 'M11 4a7 7 0 104.9 12l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0011 4z',
    chat: 'M21 12c0 4.97-4.03 9-9 9-1.5 0-2.9-.37-4.13-1.02L3 21l1.04-4.87A8.95 8.95 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z',
    send: 'M2 21l21-9L2 3l4.5 9L2 21z',
    clock: 'M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z',
    heart: 'M12 21s-7-4.5-9.5-9.5A5 5 0 0112 5a5 5 0 019.5 6.5C19 16.5 12 21 12 21z',
    trend: 'M3 17l6-6 4 4 7-8M14 7h7v7',
    book: 'M4 4h7a3 3 0 013 3v13H7a3 3 0 01-3-3V4zM20 4h-7a3 3 0 00-3 3v13h7a3 3 0 003-3V4z',
    mic: 'M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v4M8 22h8',
    close: 'M6 6l12 12M6 18L18 6',
    back: 'M20 12H4M10 6l-6 6 6 6',
    next: 'M4 12h16M14 6l6 6-6 6',
    menu: 'M3 6h18M3 12h18M3 18h18',
    skip: 'M5 4l10 8-10 8V4zM19 5v14',
    vol: 'M5 9v6h4l5 4V5L9 9H5zM16 8a5 5 0 010 8',
    caption: 'M2 6h20v12H2zM6 12h4M14 12h4',
    check: 'M5 12l4 4L19 6',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
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
