// deck.jsx — SOLID 2.0 strategy deck

// Each slide is a <section>. deck-stage handles scaling + nav.

function DeckSlide({ bg = 'paper', children, label, num, total }) {
  const palette = {
    paper: { bg: 'var(--paper)', fg: 'var(--ink)' },
    dark:  { bg: 'var(--dark)',  fg: 'var(--paper)' },
    cream: { bg: 'var(--paper-2)', fg: 'var(--ink)' },
    lime:  { bg: 'var(--accent-glow)', fg: 'var(--ink)' },
  }[bg] || { bg: 'var(--paper)', fg: 'var(--ink)' };

  return (
    <section data-screen-label={label} style={{background: palette.bg, color: palette.fg, padding: '80px 96px', width: '100%', height: '100%', position: 'relative', display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.5, marginBottom:32}}>
        <span>Solid · 2.0 · Strategy</span>
        <span>{num} / {total}</span>
      </div>
      {children}
    </section>
  );
}

const N = 12;

function Deck() {
  return (
    <>
    {/* 01 Cover */}
    <DeckSlide label="01 Cover" bg="dark" num="01" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:12, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--accent-glow)', marginBottom:24}}>Product strategy · Q2 2026</div>
        <h1 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:160, lineHeight:0.88, letterSpacing:'-0.04em', margin:'0 0 24px'}}>
          Solid<span style={{color:'var(--accent-glow)'}}>,</span><br/>
          <em style={{fontStyle:'italic'}}>premium.</em>
        </h1>
        <div style={{fontFamily:'var(--serif)', fontSize:26, lineHeight:1.3, maxWidth:'18ch', color:'rgba(245,241,232,0.7)'}}>
          From a WhatsApp microlearning tool to a centralized, AI-powered learning experience.
        </div>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(245,241,232,0.5)'}}>
        <span>Prepared for BeonIt</span>
        <span>Consultant deck · read 9 min</span>
      </div>
    </DeckSlide>

    {/* 02 Today */}
    <DeckSlide label="02 Today" num="02" total={N}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:96, margin:'auto 0'}}>
        <div>
          <div className="eyebrow">Today</div>
          <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:88, lineHeight:0.98, letterSpacing:'-0.03em', margin:'16px 0 28px'}}>
            Solid is a <em style={{fontStyle:'italic'}}>message.</em>
          </h2>
          <p style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.45, color:'var(--ink-3)', maxWidth:'34ch'}}>
            Training delivered as 3-minute pills on WhatsApp. One idea. One pill. Done.
          </p>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:20, marginTop:60}}>
          {[
            ['Fragmented', 'Lives inside WhatsApp, alongside groceries and memes.'],
            ['Undiscoverable', 'The only content you see is the one pushed today.'],
            ['Not immersive', 'No library, no serendipity, no depth.'],
            ['Feels free', 'Not premium. Not a destination.'],
          ].map(([t,d], i) => (
            <div key={i} style={{borderTop:'1px solid var(--line)', paddingTop:14, display:'grid', gridTemplateColumns:'40px 1fr', gap:14}}>
              <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--ink-4)', letterSpacing:'0.1em'}}>0{i+1}</span>
              <div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, lineHeight:1.1}}>{t}</div>
                <div style={{fontSize:15, color:'var(--ink-3)', marginTop:4, lineHeight:1.4}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 03 The bet */}
    <DeckSlide label="03 The bet" bg="cream" num="03" total={N}>
      <div style={{margin:'auto 0', maxWidth:'20ch'}}>
        <div className="eyebrow">The bet</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:130, lineHeight:0.92, letterSpacing:'-0.035em', margin:'16px 0 0'}}>
          Keep the <em style={{fontStyle:'italic'}}>pill</em>.<br/>
          Build the <span style={{background:'linear-gradient(180deg, transparent 64%, var(--accent-glow) 64%)', padding:'0 4px'}}>library</span>.<br/>
          Add a <em style={{fontStyle:'italic'}}>coach</em>.
        </h2>
        <p style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.45, color:'var(--ink-3)', margin:'40px 0 0', maxWidth:'44ch'}}>
          Don't replace what works. Surround it with a premium, cinematic experience — and an AI that makes the whole library feel like it was made for each learner.
        </p>
      </div>
    </DeckSlide>

    {/* 04 Vision */}
    <DeckSlide label="04 Vision" num="04" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Product vision · Solid 2.0</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px', maxWidth:'26ch'}}>
          A premium learning library that answers <em style={{fontStyle:'italic'}}>"what should I learn today?"</em> — in three minutes.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:32, borderTop:'1px solid var(--line)', paddingTop:32}}>
          {[
            ['Target', <>Mid-career professionals inside modern companies — <em>B2B primary</em>. Curious self-directed learners — <em>B2C secondary</em>.</>],
            ['Value', <>Three minutes of <em>signal</em> a day. A library when you want more. A coach when you're stuck.</>],
            ['Position', <>Between an LMS (too heavy) and TikTok (too light). <em>Editorial, not encyclopedic.</em></>],
          ].map(([t, d], i) => (
            <div key={i}>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)', marginBottom:12}}>0{i+1} · {t}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:22, lineHeight:1.35}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 05 Content model */}
    <DeckSlide label="05 Content model" bg="cream" num="05" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Content model</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 56px'}}>
          Five formats. One <em style={{fontStyle:'italic'}}>idea</em> at the center.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:20}}>
          {[
            ['Pill', '3 min', 'One idea. The atom. Always the first thing we ship.', 'clay', '◉'],
            ['Reel', ':30–:60', 'A pill compressed to a hook. Discovery fuel.', 'lime', '▶'],
            ['Series', '5–7 pills', 'A topic binged in a single sitting.', 'plum', '▦'],
            ['Podcast', '30–50 min', 'Depth. For commutes and dog walks.', 'olive', '◐'],
            ['Path', '2–8 weeks', 'A guided journey. Pills + reflection + quiz.', 'warm', '◇'],
          ].map(([t,d,x,tone,g], i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', gap:12, padding:'24px 20px', borderRadius:16, background:'var(--paper)', minHeight:280}}>
              <div style={{fontFamily:'var(--serif)', fontSize:56, fontStyle:'italic', lineHeight:0.9, color:'var(--ink)'}}>{g}</div>
              <div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:30, lineHeight:1}}>{t}</div>
                <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-4)', marginTop:4}}>{d}</div>
              </div>
              <div style={{fontSize:15, lineHeight:1.4, color:'var(--ink-3)', marginTop:'auto'}}>{x}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, color:'var(--ink-3)', textAlign:'center'}}>
          Microlearning ≠ binge learning — they compose. Snack on a pill, stay for a series, disappear into a podcast.
        </div>
      </div>
    </DeckSlide>

    {/* 06 Home screen anatomy */}
    <DeckSlide label="06 Home anatomy" bg="dark" num="06" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent-glow)', marginBottom:12}}>Home screen · anatomy</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'0 0 40px'}}>
          Editorial, not <em style={{fontStyle:'italic'}}>endless</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:56, alignItems:'start'}}>
          <div style={{border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:20, background:'rgba(255,255,255,0.03)'}}>
            {[
              {n:1, t:'Hero · Today', d:'One editor\'s pick + one resume-where-you-left.', h: 90},
              {n:2, t:'Continue', d:'Pills and series you started this week.', h: 60},
              {n:3, t:'Today\'s three minutes', d:'Coach-chosen, based on path & calendar.', h: 70},
              {n:4, t:'Coach strip', d:'"What should I learn before Thursday?"', h: 45},
              {n:5, t:'Shorts · Series · Podcasts · Paths', d:'Distinct rows, distinct shapes per format.', h: 80},
            ].map(r => (
              <div key={r.n} style={{display:'grid', gridTemplateColumns:'30px 1fr', gap:14, padding:'10px 0', borderBottom:'1px dashed rgba(255,255,255,0.1)', alignItems:'center'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--accent-glow)'}}>0{r.n}</span>
                <div>
                  <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:20}}>{r.t}</div>
                  <div style={{fontSize:13, color:'rgba(245,241,232,0.6)'}}>{r.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(245,241,232,0.5)', marginBottom:14}}>Visual hierarchy rules</div>
            {[
              'One hero, always. Never two.',
              'Pills = round. Reels = vertical. Series = rectangle. Podcasts = circle.',
              'Editor picks over algorithm, 1 row in 5.',
              'No infinite scroll. Six rows. That\'s the day.',
              'Coach lives on the right. Never in the middle of content.',
            ].map((r,i) => (
              <div key={i} style={{display:'flex', gap:14, padding:'12px 0', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:12, color:'var(--accent-glow)', width:20}}>→</span>
                <span style={{fontFamily:'var(--serif)', fontSize:18, lineHeight:1.3, color:'rgba(245,241,232,0.85)'}}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DeckSlide>

    {/* 07 Coach */}
    <DeckSlide label="07 AI coach" num="07" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">AI coach</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:88, lineHeight:0.95, letterSpacing:'-0.03em', margin:'16px 0 48px', maxWidth:'20ch'}}>
          A <em style={{fontStyle:'italic'}}>companion</em>, not a feature.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:56}}>
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {[
              ['Recommend', 'Based on role, path, calendar and what you just finished. "What\'s the one pill for today?"'],
              ['Summarize', 'TL;DR of any video. Turn a series into a one-page playbook.'],
              ['Answer', 'Ask questions about a specific chapter. Cites the pill by timestamp.'],
              ['Coach', 'Nudges before meetings. Prompts after. Never shames.'],
              ['Suggest next', 'Builds your next path, in your cadence, from the library.'],
            ].map(([t,d], i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:20, paddingBottom:16, borderBottom:'1px solid var(--line)'}}>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, lineHeight:1}}>{t}</div>
                <div style={{fontFamily:'var(--serif)', fontSize:17, lineHeight:1.45, color:'var(--ink-3)'}}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--dark)', color:'var(--paper)', borderRadius:16, padding:28, display:'flex', flexDirection:'column', gap:14}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <div style={{width:28, height:28, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent-glow), #7fa820)', boxShadow:'0 0 18px rgba(200,255,61,0.45)'}}/>
              <span style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--accent-glow)'}}>Coach · live</span>
            </div>
            <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4}}>
              "You have a 1:1 with Pablo on Thursday. Based on last week's notes, <span style={{background:'linear-gradient(180deg, transparent 62%, var(--accent-glow) 62%)', padding:'0 2px'}}>'Feedback: act, don't label'</span> is 3 minutes well spent. Add to today?"
            </div>
            <div style={{display:'flex', gap:8, marginTop:'auto'}}>
              <button style={{padding:'8px 14px', borderRadius:999, background:'var(--accent-glow)', color:'var(--ink)', border:'none', fontSize:13, fontWeight:500}}>Add to today</button>
              <button style={{padding:'8px 14px', borderRadius:999, background:'transparent', color:'var(--paper)', border:'1px solid rgba(255,255,255,0.3)', fontSize:13}}>Send on WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </DeckSlide>

    {/* 08 User journey */}
    <DeckSlide label="08 User journey" bg="cream" num="08" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">User journey</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px'}}>
          One day, <em style={{fontStyle:'italic'}}>across channels</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16}}>
          {[
            ['09:00', 'WhatsApp', 'Morning pill. 3 min. One idea.', 'lime'],
            ['10:42', 'Desktop', 'Open the library. Today\'s row. Editor\'s pick.', 'warm'],
            ['13:30', 'Coach', '"What should I read before the 1:1?"', 'plum'],
            ['18:00', 'Player', 'A series on the commute, played in the app.', 'olive'],
            ['21:14', 'WhatsApp', 'One-line recap. "Saved to your canon."', 'teal'],
          ].map(([time, ch, d, tone], i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', gap:10}}>
              <div style={{aspectRatio:'4/3', borderRadius:12, overflow:'hidden', position:'relative'}}>
                <div className={`ph ${tone}`} style={{position:'absolute', inset:0}}>{ch}</div>
              </div>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', color:'var(--ink-4)'}}>{time} · {ch.toUpperCase()}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', lineHeight:1.2}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:48, padding:24, border:'1px solid var(--line)', borderRadius:14, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, lineHeight:1.4, color:'var(--ink-2)'}}>
          <span className="eyebrow" style={{display:'block', marginBottom:8, fontStyle:'normal'}}>The design principle</span>
          WhatsApp is the <em>nudge</em>. The app is the <em>library</em>. The coach is the <em>thread</em> that ties them together.
        </div>
      </div>
    </DeckSlide>

    {/* 09 MVP */}
    <DeckSlide label="09 MVP" num="09" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">MVP · ship in 12 weeks</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 48px'}}>
          Ship the <em style={{fontStyle:'italic'}}>smallest library</em> that is already a <em style={{fontStyle:'italic'}}>destination</em>.
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
          {[
            {ph:'Now · Weeks 1–12', t:'The destination', items:['Home with 4 rows','Pill + Series detail + Player','Coach in companion mode','Mobile-web + desktop web','WhatsApp daily pill stays on']},
            {ph:'Next · Q3', t:'The library', items:['Reels + Podcasts','Search with semantic AI','Paths (guided 4–8 week)','Save to canon','Team dashboards (B2B)']},
            {ph:'Later · Q4+', t:'The ecosystem', items:['Native iOS + Android','Editor marketplace','Live cohort events','Enterprise SSO + SCIM','Coach in pre-meeting briefs']},
          ].map((col, i) => (
            <div key={i} style={{padding:'24px 20px', borderRadius:14, background: i===0?'var(--ink)':'var(--paper-2)', color: i===0?'var(--paper)':'var(--ink)', display:'flex', flexDirection:'column', gap:12}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color: i===0?'var(--accent-glow)':'var(--ink-4)'}}>{col.ph}</div>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:30, lineHeight:1}}>{col.t}</div>
              <ul style={{listStyle:'none', padding:0, margin:'10px 0 0', display:'flex', flexDirection:'column', gap:8}}>
                {col.items.map((it,j) => (
                  <li key={j} style={{fontFamily:'var(--serif)', fontSize:16, lineHeight:1.4, display:'flex', gap:10}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:11, color: i===0?'var(--accent-glow)':'var(--ink-4)'}}>→</span>{it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 10 Differentiation */}
    <DeckSlide label="10 Differentiation" bg="cream" num="10" total={N}>
      <div style={{margin:'auto 0'}}>
        <div className="eyebrow">Differentiation</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:72, lineHeight:1, letterSpacing:'-0.025em', margin:'16px 0 40px'}}>
          Not an LMS. Not a feed. A <em style={{fontStyle:'italic'}}>learning library</em>.
        </h2>
        <div style={{background:'var(--paper)', borderRadius:14, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1fr', padding:'16px 24px', background:'var(--ink)', color:'var(--paper)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span></span><span>Traditional LMS</span><span>Microlearning apps</span><span>Udacity-likes</span><span style={{color:'var(--accent-glow)'}}>Solid 2.0</span>
          </div>
          {[
            ['Unit of content', 'Course (hours)', 'Tip / flashcard', 'Nanodegree', <><em>3-min pill</em></>],
            ['Feel', 'Institutional', 'Gamified', 'Academic', <><em>Editorial</em></>],
            ['AI', 'Bolted-on', 'None', 'Tutor bot', <><em>Companion</em></>],
            ['When you use it', 'Annual compliance', 'Any minute', 'Weekends', <><em>Every day, briefly</em></>],
            ['What you finish', 'Certificate', 'Streak', 'Project', <><em>A shorter canon</em></>],
          ].map((row, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1fr 1fr', padding:'18px 24px', borderBottom:'1px solid var(--line)', alignItems:'center'}}>
              {row.map((c, j) => (
                <span key={j} style={{
                  fontFamily: j === 0 ? 'var(--mono)' : 'var(--serif)',
                  fontSize: j === 0 ? 11 : 18,
                  letterSpacing: j === 0 ? '0.08em' : 0,
                  textTransform: j === 0 ? 'uppercase' : 'none',
                  color: j === 0 ? 'var(--ink-4)' : j === 4 ? 'var(--ink)' : 'var(--ink-3)',
                  fontWeight: j === 4 ? 500 : 400,
                }}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>

    {/* 11 Positioning quote */}
    <DeckSlide label="11 Positioning" bg="lime" num="11" total={N}>
      <div style={{margin:'auto 0', maxWidth:'22ch'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:24}}>How we talk about it</div>
        <div style={{fontFamily:'var(--serif)', fontWeight:400, fontStyle:'italic', fontSize:130, lineHeight:0.92, letterSpacing:'-0.04em', color:'var(--ink)'}}>
          "The three&#8209;minute library for people who read one book at a time."
        </div>
        <div style={{marginTop:48, fontFamily:'var(--mono)', fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ink-3)'}}>
          — Solid 2.0, working tagline
        </div>
      </div>
    </DeckSlide>

    {/* 12 Close */}
    <DeckSlide label="12 Close" bg="dark" num="12" total={N}>
      <div style={{margin:'auto 0'}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent-glow)', marginBottom:20}}>Next</div>
        <h2 style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:120, lineHeight:0.92, letterSpacing:'-0.035em', margin:'0 0 48px'}}>
          Let's ship a <em style={{fontStyle:'italic'}}>destination.</em>
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:32, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.15)'}}>
          {[
            ['This week', 'Approve the content model (5 formats) and the editorial principle.'],
            ['Next 2 weeks', 'Design sprint: home + detail + player + coach. Use the prototype in this deck.'],
            ['Then', 'Engineering spike on the content hub + coach API. Soft launch to 100 internal users at 12w.'],
          ].map(([t,d],i) => (
            <div key={i}>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent-glow)', marginBottom:10}}>0{i+1} · {t}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:20, lineHeight:1.4, color:'rgba(245,241,232,0.85)'}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </DeckSlide>
    </>
  );
}

window.Deck = Deck;
