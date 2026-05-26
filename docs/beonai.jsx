/* ============================================================
   beonAI · React components
   Load: <script type="text/babel" src="beonai.jsx"></script>
   Depends on beonai.css for styling.
   ============================================================ */

/**
 * <BeonAIChar size={64} mood="neutral" float interactive/>
 *
 * Props:
 * - size:        px diameter (default 64)
 * - mood:        'neutral' | 'thinking' | 'happy' | 'curious' | 'idle'
 * - float:       boolean — adds idle floating animation
 * - interactive: boolean — adds cursor:pointer + hover blink (default true)
 * - onClick:     handler
 */

const BeonAIChar = ({ size = 64, mood = 'neutral', float = false, interactive = true, onClick, className = '', style }) => {
  const classes = [
    'bai',
    float && 'float',
    !interactive && 'static',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      data-mood={mood}
      onClick={onClick}
      style={{ '--bai-size': `${size}px`, ...style }}
    >
      <div className="bai-eyes">
        <span className="bai-eye"></span>
        <span className="bai-eye r"></span>
      </div>
    </div>
  );
};

/**
 * <BeonAIWordmark size={30}/>
 * Just the "beonAI" text wordmark — independent of the character.
 */

const BeonAIWordmark = ({ size = 30, className = '' }) => {
  const cls = `wm-bai wm-bai-${size === 46 ? '46' : size === 30 ? '30' : '18'} ${className}`.trim();
  return (
    <span className={cls}>
      beon<span className="ai">AI</span>
    </span>
  );
};

/**
 * <BeonAILockup size={30}/>
 * Character + wordmark side-by-side.
 */

const BeonAILockup = ({ size = 30 }) => {
  const iconSize = size === 46 ? 56 : size === 30 ? 38 : 24;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size === 46 ? 16 : 10 }}>
      <BeonAIChar size={iconSize} interactive={false}/>
      <BeonAIWordmark size={size}/>
    </div>
  );
};

/* Make available globally for non-module Babel setup */
Object.assign(window, { BeonAIChar, BeonAIWordmark, BeonAILockup });

/* ============================================================
   Usage in SaaS — examples
   ============================================================

   // Coach header
   <header className="coach-header">
     <BeonAIChar size={38} float/>
     <div>
       <div className="title">beonAI</div>
       <div className="status">● en línea · Claude 4.5</div>
     </div>
   </header>

   // While AI is responding
   <BeonAIChar size={32} mood="thinking"/>

   // Sidebar item (small, no animation)
   <BeonAIChar size={16} interactive={false}/>

   // Welcome screen (big, animated)
   <BeonAIChar size={200} float onClick={() => focusInput()}/>

   // After successful response (transient state)
   <BeonAIChar size={32} mood="happy"/>

   ============================================================ */
