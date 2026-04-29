import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const EX_LABELS = ['NONE', 'LOW', 'MID', 'HIGH'];
const CALC_MSGS = [
  'Parsing biometric vectors...',
  'Cross-referencing mortality tables...',
  'Calculating screen time decay curves...',
  'Mapping sleep deprivation coefficients...',
  'Finalizing mortality index projection...',
];

function calcLife(age, sleep, screen, ex) {
  let base = 72;
  if (sleep < 5) base -= 4; else if (sleep < 6) base -= 2; else if (sleep >= 8) base += 2;
  if (screen > 10) base -= 5; else if (screen > 7) base -= 3; else if (screen <= 3) base += 1;
  if (ex === 0) base -= 6; else if (ex === 1) base -= 2; else if (ex === 2) base += 2; else base += 4;
  const life = Math.min(Math.max(base, 50), 100);
  const rem = Math.max(life - age, 1);
  const screenYrs = Math.round(rem * (screen / 24) * 0.65);
  const sleepLoss = Math.max(0, Math.round((7 - sleep) * rem * 0.04));
  return { age, sleep, screen, ex, life, rem, screenYrs, sleepLoss };
}

function useAudio() {
  const ac = useRef(null); const hbRef = useRef(null); const tkRef = useRef(null);
  const [muted, setMuted] = useState(false); const mutedR = useRef(false);
  const getAC = useCallback(() => { if (!ac.current) ac.current = new (window.AudioContext || window.webkitAudioContext)(); return ac.current; }, []);
  const playHB = useCallback(() => {
    const beat = () => { if (mutedR.current) return; try { const c = getAC(); [0,0.12].forEach(t => { const g = c.createGain(), o = c.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(55,c.currentTime+t); o.frequency.exponentialRampToValueAtTime(28,c.currentTime+t+0.1); g.gain.setValueAtTime(0,c.currentTime+t); g.gain.linearRampToValueAtTime(0.2,c.currentTime+t+0.02); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+t+0.18); o.connect(g); g.connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+0.25); }); } catch(_){} };
    beat(); hbRef.current = setInterval(beat, 900);
  }, [getAC]);
  const stopHB = useCallback(() => { clearInterval(hbRef.current); hbRef.current = null; }, []);
  const playTick = useCallback(() => {
    const t = () => { if (mutedR.current) return; try { const c=getAC(),g=c.createGain(),o=c.createOscillator(); o.type='square'; o.frequency.value=1400; g.gain.setValueAtTime(0.1,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.05); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+0.06); } catch(_){} };
    t(); tkRef.current = setInterval(t, 1000);
  }, [getAC]);
  const stopTick = useCallback(() => { clearInterval(tkRef.current); tkRef.current = null; }, []);
  const playTension = useCallback(() => { if (mutedR.current) return; try { const c=getAC(),o=c.createOscillator(),g=c.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(70,c.currentTime); o.frequency.linearRampToValueAtTime(180,c.currentTime+2.5); g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(0.05,c.currentTime+0.4); g.gain.linearRampToValueAtTime(0,c.currentTime+3); o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+3.5); } catch(_){} }, [getAC]);
  const toggleMute = useCallback(() => { mutedR.current = !mutedR.current; setMuted(m => !m); if (mutedR.current) { stopHB(); stopTick(); } }, [stopHB, stopTick]);
  return { muted, toggleMute, playHB, stopHB, playTick, stopTick, playTension };
}

function NebulaBG() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; const ctx = cv.getContext('2d'); let W, H, raf;
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length:220}, () => ({x:Math.random(),y:Math.random(),r:Math.random()*1.3+0.2,a:Math.random()*0.75+0.1,tw:Math.random()*3+1}));
    const nebulae = [{cx:0.12,cy:0.28,rx:0.32,ry:0.26,r:20,g:55,b:115,a:0.13},{cx:0.82,cy:0.72,rx:0.36,ry:0.29,r:18,g:48,b:108,a:0.11},{cx:0.5,cy:0.18,rx:0.22,ry:0.16,r:155,g:58,b:18,a:0.09},{cx:0.72,cy:0.08,rx:0.26,ry:0.19,r:185,g:82,b:18,a:0.08},{cx:0.08,cy:0.82,rx:0.21,ry:0.21,r:0,g:145,b:165,a:0.07}];
    const particles = Array.from({length:65}, () => ({x:Math.random()*100,y:Math.random()*100,vx:(Math.random()-0.5)*0.012,vy:(Math.random()-0.5)*0.012,r:Math.random()*1.6+0.3,a:Math.random()*0.28+0.04,c:Math.random()<0.55?'cyan':'orange'}));
    let t = 0;
    const draw = () => {
      t += 0.004; ctx.clearRect(0,0,W,H); ctx.fillStyle='#000008'; ctx.fillRect(0,0,W,H);
      nebulae.forEach(n => { const grd=ctx.createRadialGradient(n.cx*W,n.cy*H,0,n.cx*W,n.cy*H,Math.max(n.rx*W,n.ry*H)); grd.addColorStop(0,`rgba(${n.r},${n.g},${n.b},${n.a})`); grd.addColorStop(0.5,`rgba(${n.r},${n.g},${n.b},${n.a*0.35})`); grd.addColorStop(1,'rgba(0,0,0,0)'); ctx.save(); ctx.scale(1,n.ry/n.rx); ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(n.cx*W,n.cy*H*(n.rx/n.ry),n.rx*W,0,Math.PI*2); ctx.fill(); ctx.restore(); });
      stars.forEach(s => { const f=0.55+0.45*Math.sin(t*s.tw*2+s.x*100); ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(180,220,255,${s.a*f})`; ctx.fill(); });
      particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=100; if(p.x>100)p.x=0; if(p.y<0)p.y=100; if(p.y>100)p.y=0; ctx.beginPath(); ctx.arc(p.x/100*W,p.y/100*H,p.r,0,Math.PI*2); ctx.fillStyle=p.c==='cyan'?`rgba(0,200,255,${p.a})`:`rgba(255,107,53,${p.a})`; ctx.fill(); });
      [0,1,2].forEach(i => { ctx.beginPath(); ctx.arc(W/2,H/2,55+i*52,0,Math.PI*2); const a=0.035+0.02*Math.sin(t*2+i); ctx.strokeStyle=i===1?`rgba(255,107,53,${a})`:`rgba(0,200,255,${a})`; ctx.lineWidth=0.8; ctx.stroke(); });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} id="bgCanvas" />;
}

function OrbitalRing({ children, size = '250px' }) {
  return (
    <div className="orbital-wrap" style={{width:`min(${size},54vw)`,height:`min(${size},54vw)`}}>
      <div className="ring ring1"><div className="ring-dot"/></div>
      <div className="ring ring2"><div className="ring-dot"/></div>
      <div className="ring ring3"><div className="ring-dot"/></div>
      <div className="ring-center">{children}</div>
    </div>
  );
}

function useCountUp(target, dur=1800, active=false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return; setVal(0);
    const s = performance.now();
    const tick = n => { const t=Math.min((n-s)/dur,1); setVal(Math.round((1-Math.pow(1-t,3))*target)); if(t<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [target, active, dur]);
  return val;
}

function S1Hook({ onNext }) {
  return (
    <div className="scene visible" id="s1">
      <div className="orb-title a1">LIFE-2-VEC // MORTALITY ENGINE v4.1</div>
      <OrbitalRing>
        <div className="ring-tag">SYSTEM READY</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:'clamp(14px,3.5vw,26px)',color:'#00e5ff',lineHeight:1,margin:'4px 0',fontWeight:900}}>LIFE<br/>2<br/>VEC</div>
      </OrbitalRing>
      <div className="main-text a3" style={{fontSize:'clamp(15px,3.5vw,34px)'}}>Every life has an end.</div>
      <div className="main-text cyan a4" style={{fontSize:'clamp(15px,3.5vw,34px)',marginTop:8}}>Do you know yours?</div>
      <div className="sub-text pulse-anim a5" style={{cursor:'pointer',marginTop:30}} onClick={onNext}>[ INITIALIZE SEQUENCE ]</div>
    </div>
  );
}

function SliderRow({ label, val, onChange, min, max, isEx }) {
  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="sl-label">{label}</span>
        <span className="sl-val">{isEx ? EX_LABELS[val] : val}</span>
      </div>
      <input type="range" min={min} max={max} value={val} step={1} onChange={e=>onChange(Number(e.target.value))}/>
    </div>
  );
}

function S2Input({ onPredict }) {
  const [age, setAge] = useState(22);
  const [sleep, setSleep] = useState(6);
  const [screen, setScreen] = useState(7);
  const [ex, setEx] = useState(1);
  return (
    <div className="scene hidden" id="s2">
      <div className="orb-title a1">BIOMETRIC DATA INPUT</div>
      <div className="main-text a2" style={{fontSize:'clamp(14px,3vw,24px)',marginBottom:14}}>ENTER YOUR PARAMETERS</div>
      <div className="input-panel a3">
        <SliderRow label="Age (years)"     val={age}    onChange={setAge}    min={5}  max={90}/>
        <SliderRow label="Sleep hrs/night" val={sleep}  onChange={setSleep}  min={3}  max={12}/>
        <SliderRow label="Screen hrs/day"  val={screen} onChange={setScreen} min={0}  max={18}/>
        <SliderRow label="Exercise level"  val={ex}     onChange={setEx}     min={0}  max={3}  isEx/>
        <div className="demo-box">
          <div className="demo-label">DEMO PRESET</div>
          <div className="demo-vals">AGE: 22 | SLEEP: 6h | SCREEN: 7h | EXERCISE: LOW</div>
        </div>
        <button className="btn" onClick={()=>onPredict(age,sleep,screen,ex)}>[ PREDICT MY FUTURE ]</button>
      </div>
    </div>
  );
}

function S3Calc({ onDone }) {
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState(CALC_MSGS[0]);
  useEffect(() => {
    let step = 0;
    const advance = () => { step++; setMsg(CALC_MSGS[Math.min(step,CALC_MSGS.length-1)]); setPct(step*20); if(step<5) setTimeout(advance,500+Math.random()*400); else setTimeout(onDone,900); };
    setTimeout(advance, 700);
  }, [onDone]);
  return (
    <div className="scene hidden" id="s3">
      <div className="orb-title">PROCESSING BIOMETRIC VECTORS</div>
      <OrbitalRing size="180px">
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:700,color:'#00e5ff'}}>{pct}%</div>
      </OrbitalRing>
      <div className="progress-wrap">
        <div className="prog-label">{msg}</div>
        <div className="prog-bar"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setGo(true),400); return ()=>clearTimeout(t); }, []);
  const bars = [
    {name:'LIFE',    val:data.life,      pct:data.life/100*100,       color:'#00e5ff'},
    {name:'LIVED',   val:data.age,       pct:data.age/100*100,        color:'#4a7a8a'},
    {name:'SCREENS', val:data.screenYrs, pct:data.screenYrs/100*100,  color:'#ff2d55'},
    {name:'SLEEP?',  val:data.sleepLoss, pct:data.sleepLoss/100*100,  color:'#ff6b35'},
  ];
  return (
    <div className="bar-chart a4">
      {bars.map(b=>(
        <div className="bar-row" key={b.name}>
          <div className="bar-name">{b.name}</div>
          <div className="bar-track"><div className="bar-fill" style={{width:go?`${b.pct}%`:'0%',background:b.color}}/></div>
          <div className="bar-val">{b.val}</div>
        </div>
      ))}
    </div>
  );
}

function S4Result({ data, onNext }) {
  const [phase, setPhase] = useState(0);
  const life = useCountUp(data.life, 1800, phase>=1);
  useEffect(() => { setTimeout(()=>setPhase(1),200); setTimeout(onNext,6500); }, [onNext]);
  return (
    <div className="scene hidden" id="s4">
      <div className="orb-title a1">ANALYSIS COMPLETE // MORTALITY PROJECTION</div>
      <OrbitalRing>
        <div className="ring-tag">LIFE EXP.</div>
        <div className="ring-big-num">{life}</div>
        <div className="ring-unit">YEARS</div>
      </OrbitalRing>
      <div className="dashboard a3">
        {[
          {cl:'',    lbl:'Remaining',   num:data.rem,       nc:'cyan',   sub:'YRS LEFT'},
          {cl:'red-card',   lbl:'On Screens',  num:data.screenYrs, nc:'red-c',  sub:'YRS WASTED'},
          {cl:'orange-card',lbl:'Sleep Loss',  num:data.sleepLoss, nc:'orange', sub:'YRS LOST'},
          {cl:'',    lbl:'Already Gone', num:data.age,      nc:'',       sub:'YRS LIVED'},
        ].map(c=>(
          <div className={`dash-card ${c.cl}`} key={c.lbl}>
            <div className="dash-dl">{c.lbl}</div>
            <div className={`dash-num ${c.nc}`}>{c.num}</div>
            <div className="dash-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <BarChart data={data}/>
    </div>
  );
}

function S5Wait({ onNext }) {
  const [step, setStep] = useState(0);
  useEffect(() => { setTimeout(()=>setStep(1),350); setTimeout(()=>setStep(2),2000); setTimeout(()=>setStep(3),3500); setTimeout(onNext,6000); }, [onNext]);
  return (
    <div className="scene hidden" id="s5">
      <div className={`wait-text${step>=1?' show':''}`}>WAIT.</div>
      {step>=2&&<div style={{marginTop:16}}><div className="main-text a1" style={{color:'#2a5a6a',fontSize:'clamp(14px,3vw,28px)'}}>This is not exact.</div></div>}
      {step>=3&&<div style={{marginTop:10}}><div className="main-text cyan a1" style={{fontSize:'clamp(14px,3vw,28px)'}}>But it's close enough.</div></div>}
    </div>
  );
}

function S6Final({ onNext }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => { const t=setInterval(()=>setSecs(s=>s+1),1000); const timer=setTimeout(onNext,8000); return ()=>{clearInterval(t);clearTimeout(timer);}; }, [onNext]);
  const h=String(Math.floor(secs/3600)).padStart(2,'0');
  const m=String(Math.floor((secs%3600)/60)).padStart(2,'0');
  const s=String(secs%60).padStart(2,'0');
  return (
    <div className="scene hidden" id="s6">
      <div className="main-text a1" style={{color:'#2a5a6a',fontSize:'clamp(16px,4vw,40px)'}}>Time is limited.</div>
      <div className="main-text red-c a2" style={{marginTop:16,fontSize:'clamp(18px,5vw,50px)',textShadow:'0 0 24px rgba(255,45,85,0.5)'}}>And it's already counting.</div>
      <div className="counter-disp a3" style={{marginTop:34}}>{h}:{m}:{s}</div>
      <div className="sub-text a4" style={{fontSize:10,letterSpacing:4,animation:'shimmer 2s infinite',marginTop:14}}>SECONDS YOU WILL NEVER GET BACK</div>
    </div>
  );
}

function S7End({ onRestart }) {
  return (
    <div className="scene hidden" id="s7">
      <div className="a2" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:8,color:'#0a2030',marginBottom:48}}>SESSION TERMINATED</div>
      <div className="main-text a3" style={{color:'#1a4050',fontSize:'clamp(16px,3.5vw,32px)'}}>What will you do next?</div>
      <button className="btn orange-btn a4" style={{marginTop:24}} onClick={onRestart}>[ REINITIALIZE ]</button>
      <div className="a5" style={{marginTop:52,fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'#0a2030',letterSpacing:2,maxWidth:360,lineHeight:2}}>
        FOR AWARENESS PURPOSES ONLY. CONSULT A HEALTHCARE PROFESSIONAL FOR MEDICAL ADVICE.
      </div>
    </div>
  );
}

export default function App() {
  const [scene, setScene] = useState('s1');
  const [data,  setData]  = useState(null);
  const audio = useAudio();

  useEffect(() => {
    ['s1','s2','s3','s4','s5','s6','s7'].forEach(id => {
      const el = document.getElementById(id); if (!el) return;
      if (id===scene){el.classList.remove('hidden');el.classList.add('visible');}
      else{el.classList.remove('visible');el.classList.add('hidden');}
    });
  }, [scene]);

  useEffect(() => { setTimeout(()=>audio.playHB(),900); }, []); // eslint-disable-line

  const go = useCallback(id=>setScene(id), []);

  return (
    <div style={{width:'100vw',height:'100vh',background:'#000',overflow:'hidden',position:'relative'}}>
      <NebulaBG/>
      <div className="grid-overlay"/>
      <div className="vignette"/>
      <div className="scan-line"/>
      <button className="mute-btn" onClick={audio.toggleMute}>{audio.muted?'✕ MUTED':'♪ AUDIO'}</button>

      <S1Hook onNext={()=>{go('s2');audio.stopHB();setTimeout(()=>audio.playHB(),200);}}/>
      <S2Input onPredict={(age,sleep,screen,ex)=>{setData(calcLife(age,sleep,screen,ex));go('s3');audio.stopHB();audio.playTick();}}/>
      <S3Calc onDone={()=>{go('s4');audio.stopTick();audio.playTension();}}/>
      {data&&<S4Result data={data} onNext={()=>{go('s5');audio.playTick();}}/>}
      <S5Wait onNext={()=>go('s6')}/>
      <S6Final onNext={()=>{go('s7');audio.stopTick();}}/>
      <S7End onRestart={()=>{audio.stopHB();audio.stopTick();setData(null);go('s1');setTimeout(()=>audio.playHB(),500);}}/>
    </div>
  );
}
