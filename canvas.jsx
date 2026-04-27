// canvas.jsx — explorador de variaciones lado a lado (es)

function Canvas() {
  return (
    <DesignCanvas>
      <DCSection id="home" title="Home · Descubrimiento" subtitle="Mismo sistema editorial, distinto énfasis">
        <DCArtboard id="h1" label="A · Hero editorial" width={900} height={600}>
          <div style={{background:'var(--paper)', height:'100%', padding:40, display:'flex', flexDirection:'column', gap:20}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-4)'}}>HOY · MAR 10:42</div>
            <div style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:58, lineHeight:0.98, letterSpacing:'-0.025em'}}>
              Una <em style={{fontStyle:'italic'}}>idea</em> al día.<br/>
              Una biblioteca <span style={{background:'linear-gradient(180deg,transparent 62%,var(--accent) 62%)', padding:'0 3px'}}>entera.</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginTop:'auto'}}>
              {['warm','plum','olive','teal'].map((t,i) => (
                <div key={i} style={{aspectRatio:'3/5', borderRadius:999, background:'var(--ink)', position:'relative', overflow:'hidden'}}>
                  <div className={`ph ${t}`} style={{position:'absolute', inset:0, borderRadius:999}}>píldora</div>
                </div>
              ))}
            </div>
          </div>
        </DCArtboard>

        <DCArtboard id="h2" label="B · Cinematográfico oscuro" width={900} height={600}>
          <div style={{background:'var(--dark)', color:'var(--paper)', height:'100%', padding:40, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 22px)'}}/>
            <div style={{position:'relative', display:'flex', flexDirection:'column', height:'100%', gap:16}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)'}}>ELECCIÓN DEL EDITOR · PÍLDORA</div>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:400, fontSize:72, lineHeight:0.95, letterSpacing:'-0.03em'}}>Decir no sin<br/>decir "no".</div>
              <div style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)'}}>M. ALCÁZAR · 3 MIN</div>
              <div style={{marginTop:'auto', display:'flex', gap:10}}>
                <button style={{padding:'12px 20px', borderRadius:999, background:'var(--accent)', border:'none', color:'var(--ink)', fontWeight:500, fontSize:13}}>▶ Reproducir</button>
                <button style={{padding:'12px 20px', borderRadius:999, background:'transparent', color:'var(--paper)', border:'1px solid rgba(255,255,255,0.3)', fontSize:13}}>Guardar</button>
              </div>
            </div>
          </div>
        </DCArtboard>

        <DCArtboard id="h3" label="C · Liderado por el coach" width={900} height={600}>
          <div style={{background:'var(--paper)', height:'100%', padding:40, display:'grid', gridTemplateRows:'auto 1fr'}}>
            <div style={{display:'flex', alignItems:'center', gap:14, paddingBottom:18, borderBottom:'1px solid var(--line)', marginBottom:24}}>
              <div style={{width:36, height:36, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent), #8b5a0a)'}}/>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22}}>Buenos días, Amaia.</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:44, lineHeight:1.05, letterSpacing:'-0.02em', maxWidth:'22ch'}}>
                Tienes <span style={{background:'linear-gradient(180deg,transparent 62%,var(--accent) 62%)', padding:'0 3px'}}>tres minutos</span> antes del stand-up.
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
                {['Empezar la píldora de hoy','Hazme un quiz de la semana pasada','Resume lo que me perdí','Llévame al 1:1 del jueves'].map((x,i) => (
                  <div key={i} style={{padding:14, border:'1px solid var(--line)', borderRadius:12, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:16}}>{x}</div>
                ))}
              </div>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="card" title="Forma de la tarjeta" subtitle="Identidad visual por formato">
        <DCArtboard id="c1" label="Cápsula (píldora literal)" width={280} height={420}>
          <div style={{background:'var(--paper)', padding:20, height:'100%', display:'flex', flexDirection:'column', gap:12}}>
            <div style={{aspectRatio:'3/5', borderRadius:999, position:'relative', overflow:'hidden'}}>
              <div className="ph plum" style={{position:'absolute', inset:0, borderRadius:999}}>píldora</div>
            </div>
            <div style={{fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', lineHeight:1.2}}>Decir no sin decir "no"</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>3 MIN · M. ALCÁZAR</div>
          </div>
        </DCArtboard>

        <DCArtboard id="c2" label="Póster cuadrado" width={280} height={420}>
          <div style={{background:'var(--paper)', padding:20, height:'100%', display:'flex', flexDirection:'column', gap:12}}>
            <div style={{aspectRatio:'1/1', borderRadius:14, position:'relative', overflow:'hidden'}}>
              <div className="ph clay" style={{position:'absolute', inset:0}}>píldora</div>
              <span style={{position:'absolute', top:10, left:10, fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(0,0,0,0.5)', color:'var(--paper)', padding:'3px 7px', borderRadius:999}}>PÍLDORA</span>
              <span style={{position:'absolute', bottom:10, right:10, fontFamily:'var(--mono)', fontSize:10, background:'rgba(0,0,0,0.6)', color:'var(--paper)', padding:'3px 7px', borderRadius:6}}>3:00</span>
            </div>
            <div style={{fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', lineHeight:1.2}}>Decir no sin decir "no"</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>3 MIN · M. ALCÁZAR</div>
          </div>
        </DCArtboard>

        <DCArtboard id="c3" label="Vertical (reel)" width={280} height={420}>
          <div style={{background:'var(--paper)', padding:20, height:'100%', display:'flex', flexDirection:'column', gap:12}}>
            <div style={{aspectRatio:'9/16', borderRadius:20, position:'relative', overflow:'hidden'}}>
              <div className="ph lime" style={{position:'absolute', inset:0}}>reel</div>
            </div>
            <div style={{fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', lineHeight:1.2}}>El update en 3 frases</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>:45 · @solid</div>
          </div>
        </DCArtboard>

        <DCArtboard id="c4" label="Círculo (podcast)" width={280} height={420}>
          <div style={{background:'var(--paper)', padding:20, height:'100%', display:'flex', flexDirection:'column', gap:12, alignItems:'center', textAlign:'center'}}>
            <div style={{aspectRatio:'1/1', width:'100%', borderRadius:'50%', position:'relative', overflow:'hidden'}}>
              <div className="ph noir" style={{position:'absolute', inset:0, borderRadius:'50%'}}>podcast</div>
            </div>
            <div style={{fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', lineHeight:1.2}}>El contexto largo</div>
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.08em', textTransform:'uppercase'}}>EP. 14 · 42 MIN</div>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="coach" title="Coach IA · presencia" subtitle="Ambiente vs compañero vs hero">
        <DCArtboard id="co1" label="A · Ambiente (inline)" width={700} height={420}>
          <div style={{background:'var(--paper)', padding:32, height:'100%', display:'flex', flexDirection:'column', gap:16}}>
            <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)'}}>COACH INLINE · APARECE EN MEDIO DEL CONTENIDO</div>
            <div style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:30, lineHeight:1.1}}>Píldoras de hoy</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
              {['warm','plum','olive','teal'].map((t,i) => (
                <div key={i} style={{aspectRatio:'3/4', borderRadius:14, position:'relative', overflow:'hidden'}}>
                  <div className={`ph ${t}`} style={{position:'absolute', inset:0}}>píldora</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12, padding:'14px 18px', border:'1px solid var(--line)', borderRadius:12, background:'var(--paper-2)', display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:20, height:20, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent), #8b5a0a)'}}/>
              <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, lineHeight:1.3}}>La píldora del medio encaja con tu 1:1 del jueves. ¿La añado a hoy?</div>
              <button style={{marginLeft:'auto', padding:'6px 12px', borderRadius:999, background:'var(--ink)', color:'var(--paper)', border:'none', fontSize:11, fontFamily:'var(--mono)', letterSpacing:'0.06em', textTransform:'uppercase'}}>Añadir</button>
            </div>
          </div>
        </DCArtboard>

        <DCArtboard id="co2" label="B · Compañero (sidebar)" width={700} height={420}>
          <div style={{height:'100%', display:'grid', gridTemplateColumns:'1fr 280px'}}>
            <div style={{background:'var(--paper)', padding:28, display:'flex', flexDirection:'column', gap:12}}>
              <div style={{fontFamily:'var(--serif)', fontSize:26, fontWeight:400}}>Píldoras de hoy</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                {['warm','plum','olive'].map((t,i) => (
                  <div key={i} style={{aspectRatio:'3/4', borderRadius:12, position:'relative', overflow:'hidden'}}>
                    <div className={`ph ${t}`} style={{position:'absolute', inset:0}}>píldora</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{borderLeft:'1px solid var(--line)', padding:20, background:'var(--paper)', display:'flex', flexDirection:'column', gap:12}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:20, height:20, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent), #8b5a0a)'}}/>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic'}}>Coach</div>
              </div>
              <div style={{background:'var(--paper-2)', padding:10, borderRadius:12, fontSize:12.5, lineHeight:1.4}}>Prueba la píldora "Tres plantillas". Encaja con el jueves.</div>
              <div style={{background:'var(--ink)', color:'var(--paper)', padding:10, borderRadius:12, alignSelf:'flex-end', fontSize:12.5}}>Añadir a hoy</div>
            </div>
          </div>
        </DCArtboard>

        <DCArtboard id="co3" label="C · Hero (el coach es la home)" width={700} height={420}>
          <div style={{background:'var(--paper)', padding:40, height:'100%', display:'flex', flexDirection:'column', gap:18}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:36, height:36, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, var(--accent), #8b5a0a)', boxShadow:'0 0 18px rgba(243,165,37,0.3)'}}/>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ink-4)'}}>COACH · 10:42</div>
            </div>
            <div style={{fontFamily:'var(--serif)', fontWeight:400, fontSize:44, lineHeight:1.02, letterSpacing:'-0.02em', maxWidth:'18ch'}}>
              Buenos días, <em style={{fontStyle:'italic'}}>Amaia</em>. ¿Qué <em style={{fontStyle:'italic'}}>aprendemos</em> hoy?
            </div>
            <div style={{marginTop:'auto', border:'1px solid var(--line)', borderRadius:18, padding:'14px 18px', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17, color:'var(--ink-4)'}}>
              Pregúntame lo que sea — o elige una píldora para que te abra.
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="player" title="Estado del player" subtitle="Con Q&A del coach, transcripción, playbook">
        <DCArtboard id="p1" label="Player + sidebar IA" width={1100} height={620}>
          <div style={{background:'var(--dark)', height:'100%', display:'grid', gridTemplateColumns:'1fr 340px'}}>
            <div style={{position:'relative', overflow:'hidden'}}>
              <div className="ph plum" style={{position:'absolute', inset:0}}>vídeo</div>
              <div style={{position:'absolute', left:28, right:28, bottom:28, color:'var(--paper)'}}>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)'}}>CAPÍTULO 3 DE 5</div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:400, fontSize:34, letterSpacing:'-0.02em', marginTop:6}}>Cuando la petición sí es buena.</div>
                <div style={{height:3, background:'rgba(255,255,255,0.2)', borderRadius:2, marginTop:20, position:'relative'}}>
                  <div style={{height:'100%', width:'42%', background:'var(--accent)', borderRadius:2}}/>
                </div>
              </div>
            </div>
            <div style={{borderLeft:'1px solid rgba(255,255,255,0.08)', background:'var(--dark-2)', color:'var(--paper)', padding:18, display:'flex', flexDirection:'column', gap:12}}>
              <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)'}}>COACH · VIENDO CONTIGO</div>
              <div style={{background:'rgba(255,255,255,0.06)', padding:12, borderRadius:12, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, lineHeight:1.4}}>
                Marta acaba de definir "encaje" — ¿quieres la explicación de 20 seg o que rebobine 30s?
              </div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {['Resume hasta aquí','Rebobina 30s','Hazme un quiz','Guardar cita'].map((x,i) => (
                  <button key={i} style={{padding:'6px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'var(--paper)', fontSize:11, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.06em'}}>{x}</button>
                ))}
              </div>
              <div style={{marginTop:'auto', padding:'10px 14px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:999, fontSize:13, color:'rgba(255,255,255,0.5)'}}>Pregunta sobre este capítulo…</div>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="color" title="Dirección de acento" subtitle="Ancla negra, un acento vivo · paleta beonit">
        {[
          {id:'a1', label:'Servicios · gota', bg:'var(--dark)', fg:'var(--paper)', ac:'#F3A525', acDark:true},
          {id:'a2', label:'All in one · alerta', bg:'var(--dark)', fg:'var(--paper)', ac:'#FC220D', acDark:false},
          {id:'a3', label:'Healthcare · calma', bg:'var(--dark)', fg:'var(--paper)', ac:'#66C7C2', acDark:true},
          {id:'a4', label:'Negro sobre papel', bg:'var(--paper)', fg:'var(--ink)', ac:'#000000', acDark:false},
        ].map(v => (
          <DCArtboard key={v.id} id={v.id} label={v.label} width={320} height={420}>
            <div style={{background:v.bg, color:v.fg, height:'100%', padding:28, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
              <div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', opacity:0.6}}>SELECCIÓN EDITORIAL</div>
                <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:36, letterSpacing:'-0.02em', lineHeight:0.95, marginTop:10}}>Decir no sin decir "no".</div>
              </div>
              <div>
                <div style={{width:54, height:54, borderRadius:'50%', background:v.ac, display:'flex', alignItems:'center', justifyContent:'center', color: v.acDark ? '#000' : 'var(--paper)', fontSize:22}}>▶</div>
                <div style={{marginTop:14, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.6}}>SOLID · PÍLDORA · 3 MIN</div>
              </div>
            </div>
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}

window.Canvas = Canvas;
