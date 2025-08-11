import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Timer, Sparkles, Stars, Palette, Pencil, BookOpen, Wand2, PlusCircle, Play, Pause, Save, Undo2, Redo2, Image as ImageIcon, Share2, Trash2, Check, X, Gauge } from "lucide-react";

// Simple utility: seeded RNG and hash
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function rngFromSeed(seedStr) {
  const seed = cyrb128(seedStr)[0];
  return mulberry32(seed);
}
function hsl(rand, s=70, l=55) { return `hsl(${Math.floor(rand*360)}, ${s}%, ${l}%)`; }

// ----- Timer Hook -----
function useCountdown(initialSeconds=180) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  useEffect(()=>{
    if (!running) { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } return; }
    intervalRef.current = setInterval(()=> setSeconds(s=> s>0 ? s-1 : 0), 1000);
    return ()=> { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);
  const reset = (s=initialSeconds)=>{ setSeconds(s); setRunning(false); };
  return { seconds, setSeconds, running, setRunning, reset };
}

function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = (s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

// ----- Shared UI Bits -----
const Card = ({children, className=""}) => (
  <div className={`rounded-2xl bg-white/70 dark:bg-zinc-900/60 shadow-xl border border-zinc-200/60 dark:border-zinc-800/60 ${className}`}>{children}</div>
);
const SectionTitle = ({icon:Icon, title, subtitle}) => (
  <div className="flex items-center gap-3 mb-4">
    {Icon && <Icon className="w-6 h-6"/>}
    <div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
  </div>
);

// ----- Emoji Story Challenge -----
const EMOJI_BANK = ["🌊","🧊","🔥","🌪️","🌱","🌟","🕰️","🪞","🧲","🛰️","🎈","🪐","🐙","🦋","🦊","🦄","🦉","🐚","🍋","🍉","🍄","☕","🍷","🎻","🎭","🧩","🔮","💡","📦","🧵","🔧","🎨","📸","✈️","🚲","🚀","🏕️","🏙️","🏛️","🌋","🏔️","🌅","🌌","🌧️","⚡","🌈","🧭"];
function randomEmojis(n=4){
  const arr=[]; const copy=[...EMOJI_BANK];
  for(let i=0;i<n && copy.length;i++){
    const idx=Math.floor(Math.random()*copy.length); arr.push(copy.splice(idx,1)[0]);
  }
  return arr;
}
function EmojiStory({onSave}){
  const [emojis, setEmojis] = useState(randomEmojis());
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const canvasRef = useRef(null);

  const renderPoster = ()=>{
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext('2d');
    const w=c.width, h=c.height; const grad = ctx.createLinearGradient(0,0,w,h);
    const r = rngFromSeed(title + story + emojis.join(""));
    grad.addColorStop(0, hsl(r())); grad.addColorStop(0.5, hsl(r(),60,70)); grad.addColorStop(1, hsl(r(),70,40));
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
    ctx.font = '64px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.fillText(title || 'Untitled', w/2, 120);
    ctx.font = '48px system-ui';
    ctx.fillText(emojis.join(' '), w/2, 200);
    // decorative orbits
    for(let i=0;i<80;i++){
      ctx.fillStyle = i%2 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      const rr=r(); ctx.beginPath(); ctx.arc(r()*w, r()*h, 2+rr*6, 0, Math.PI*2); ctx.fill();
    }
  };
  useEffect(()=>{ renderPoster(); }, [title, story, emojis.join("")]);

  const save = ()=>{
    renderPoster();
    const url = canvasRef.current.toDataURL('image/png');
    onSave({ kind: 'poster', title: title||'Untitled', dataUrl: url });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-5">
        <SectionTitle icon={BookOpen} title="Emoji Story" subtitle="Write a tiny tale that connects these emoji."/>
        <div className="flex gap-3 items-center mb-2">
          <button className="px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800" onClick={()=>setEmojis(randomEmojis())}><RefreshCw className="w-4 h-4 inline mr-1"/>Shuffle</button>
          <div className="text-2xl">{emojis.join(' ')}</div>
        </div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Story title" className="w-full mb-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
        <textarea value={story} onChange={e=>setStory(e.target.value)} placeholder="In 3-6 sentences, weave a story that uses all the emoji in order…" className="w-full h-48 mb-3 px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
        <div className="flex gap-2 justify-end">
          <button onClick={save} className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"><Save className="w-4 h-4 inline mr-1"/>Save Poster</button>
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle icon={ImageIcon} title="Poster Preview" subtitle="Auto-generates colors and sparkles from your story."/>
        <canvas ref={canvasRef} width={900} height={600} className="w-full rounded-xl border bg-white"/>
      </Card>
    </div>
  );
}

// ----- Doodle Morph (scribble to thing) -----
function DoodleMorph({onSave}){
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [stroke, setStroke] = useState(4);
  const [history, setHistory] = useState([]);
  const [redo, setRedo] = useState([]);

  useEffect(()=>{
    const c=canvasRef.current; const ctx=c.getContext('2d');
    ctx.fillStyle='white'; ctx.fillRect(0,0,c.width,c.height);
    // random squiggle seed
    const r = rngFromSeed(String(Date.now()));
    ctx.strokeStyle='rgba(0,0,0,0.15)'; ctx.lineWidth=3; ctx.beginPath();
    let x=r()*c.width, y=r()*c.height; ctx.moveTo(x,y);
    for(let i=0;i<80;i++){ x+= (r()-0.5)*100; y+= (r()-0.5)*100; ctx.lineTo(Math.max(0,Math.min(c.width,x)), Math.max(0,Math.min(c.height,y))); }
    ctx.stroke();
  },[]);

  const ctx = ()=> canvasRef.current.getContext('2d');

  const onPointerDown = e => { setDrawing(true); const c=canvasRef.current; const rect=c.getBoundingClientRect();
    ctx().beginPath(); ctx().moveTo(e.clientX-rect.left, e.clientY-rect.top); };
  const onPointerMove = e => { if(!drawing) return; const c=canvasRef.current; const rect=c.getBoundingClientRect();
    const context = ctx(); context.strokeStyle = '#111'; context.lineWidth=stroke; context.lineCap='round';
    context.lineTo(e.clientX-rect.left, e.clientY-rect.top); context.stroke(); };
  const onPointerUp = ()=>{ if(!drawing) return; setDrawing(false); setHistory(h=>[...h, canvasRef.current.toDataURL()]); setRedo([]); };

  const undo = ()=>{ if(history.length===0) return; const last = history[history.length-1]; setRedo(r=>[...r, canvasRef.current.toDataURL()]);
    const img = new Image(); img.onload=()=>{ ctx().clearRect(0,0,canvasRef.current.width, canvasRef.current.height); ctx().drawImage(img,0,0); setHistory(h=>h.slice(0,-1)); };
    img.src = history.length>1 ? history[history.length-2] : last; };
  const redoFn = ()=>{ const r = redo[redo.length-1]; if(!r) return; const img=new Image(); img.onload=()=>{ ctx().clearRect(0,0,canvasRef.current.width, canvasRef.current.height); ctx().drawImage(img,0,0); setHistory(h=>[...h, r]); setRedo(x=>x.slice(0,-1)); }; img.src=r; };

  const save = ()=> onSave({ kind:'doodle', title:'Doodle Morph', dataUrl: canvasRef.current.toDataURL('image/png') });

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-5 md:col-span-2">
        <SectionTitle icon={Pencil} title="Doodle Morph" subtitle="Turn a random squiggle into something delightful."/>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm">Stroke</label>
          <input type="range" min={1} max={24} value={stroke} onChange={e=>setStroke(parseInt(e.target.value))} />
          <button onClick={undo} className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Undo2 className="w-4 h-4"/></button>
          <button onClick={redoFn} className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Redo2 className="w-4 h-4"/></button>
          <button onClick={save} className="ml-auto px-4 py-2 rounded-xl bg-black text-white"><Save className="w-4 h-4 inline mr-1"/>Save</button>
        </div>
        <canvas ref={canvasRef} width={1100} height={700}
          className="w-full rounded-xl border bg-white touch-none select-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </Card>
      <Card className="p-5">
        <SectionTitle icon={Wand2} title="Tip" subtitle="Name what you see, then exaggerate one feature."/>
        <ul className="list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
          <li>Switch to a thick stroke for silhouettes, thin stroke for details.</li>
          <li>Fill areas by scribbling in small circles.</li>
          <li>If you get stuck, rotate your canvas (⌘/Ctrl + R to refresh a new squiggle).</li>
        </ul>
      </Card>
    </div>
  )
}

// ----- Palette Poet: generate beautiful color sets from a feeling -----
function PalettePoet({onSave}){
  const [feeling, setFeeling] = useState("");
  const r = useMemo(()=> rngFromSeed(feeling || "palette"), [feeling]);
  const colors = useMemo(()=> Array.from({length:5}, ()=> hsl(r(), 70, 50 + r()*20 - 10)), [r]);

  const save = ()=>{
    const data = { kind:'palette', title: feeling || 'Untitled Palette', colors };
    onSave(data);
  };

  return (
    <Card className="p-5">
      <SectionTitle icon={Palette} title="Palette Poet" subtitle="Type a mood—get a palette and gradient art."/>
      <input value={feeling} onChange={e=>setFeeling(e.target.value)} placeholder="e.g., fierce calm, playful melancholy" className="w-full mb-4 px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
      <div className="grid md:grid-cols-5 gap-3">
        {colors.map((c,i)=> (
          <div key={i} className="rounded-2xl border overflow-hidden">
            <div className="h-24" style={{background:c}}/>
            <div className="p-2 text-center text-xs font-mono">{c}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-48 rounded-2xl border" style={{background:`linear-gradient(135deg, ${colors[0]}, ${colors[2]}, ${colors[4]})`}}/>
      <div className="flex justify-end mt-4">
        <button onClick={save} className="px-4 py-2 rounded-xl bg-black text-white"><Save className="w-4 h-4 inline mr-1"/>Save Palette</button>
      </div>
    </Card>
  )
}

// ----- Alternative Uses (Fluency meter) -----
function AlternativeUses({onSave}){
  const [objectName, setObjectName] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [input, setInput] = useState("");
  const {seconds, setSeconds, running, setRunning, reset} = useCountdown(180);

  const addIdea = ()=>{ if(!input.trim()) return; setIdeas(prev=>[...prev, input.trim()]); setInput(""); };
  const start = ()=> setRunning(true);
  const pause = ()=> setRunning(false);
  const clear = ()=> { setIdeas([]); setInput(""); reset(180); setObjectName(""); };
  const save = ()=> onSave({ kind:'ideas', title:`${objectName||'Object'} Uses`, payload: ideas });

  return (
    <Card className="p-5">
      <SectionTitle icon={Sparkles} title="Alternative Uses" subtitle="How many uses can you list in 3 minutes? (Fluency)"/>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <input value={objectName} onChange={e=>setObjectName(e.target.value)} placeholder="Object (e.g., paperclip, brick, umbrella)" className="px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border grow"/>
        <div className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Timer className="w-4 h-4 inline mr-2"/>{formatTime(seconds)}</div>
        {!running ? (
          <button onClick={start} className="px-3 py-2 rounded-xl bg-black text-white"><Play className="w-4 h-4"/></button>
        ) : (
          <button onClick={pause} className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700"><Pause className="w-4 h-4"/></button>
        )}
        <button onClick={()=>setSeconds(180)} className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><RefreshCw className="w-4 h-4"/></button>
        <button onClick={clear} className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><Trash2 className="w-4 h-4"/></button>
        <button onClick={save} className="ml-auto px-4 py-2 rounded-xl bg-black text-white"><Save className="w-4 h-4 inline mr-1"/>Save</button>
      </div>
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && addIdea()} placeholder="Add a use…" className="grow px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
        <button onClick={addIdea} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800"><PlusCircle className="w-4 h-4"/></button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {ideas.map((idea, i)=> (
          <div key={i} className="px-3 py-2 rounded-xl border bg-white/70 dark:bg-zinc-900/60 text-sm flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">{i+1}</span>
            <span>{idea}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <SectionTitle icon={Gauge} title="Fluency Score" subtitle="More ideas = higher fluency."/>
        <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-black" style={{width: `${Math.min(100, ideas.length*8)}%`}}/>
        </div>
        <p className="text-xs text-zinc-500 mt-1">{ideas.length} ideas</p>
      </div>
    </Card>
  )
}

// ----- Haiku Forge (quick 5-7-5 helper + wave art) -----
function estimateSyllables(word){
  word = word.toLowerCase();
  if(word.length <= 3) return 1;
  return (word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
             .match(/[aeiouy]{1,2}/g) || []).length;
}
function countSyllables(line){
  return line.split(/\s+/).filter(Boolean).reduce((sum,w)=> sum + estimateSyllables(w), 0);
}
function HaikuForge({onSave}){
  const [l1,l2,l3] = [useState(""), useState(""), useState("")];
  const line1 = l1[0], setL1 = l1[1];
  const line2 = l2[0], setL2 = l2[1];
  const line3 = l3[0], setL3 = l3[1];
  const cRef = useRef(null);
  const ok = countSyllables(line1)===5 && countSyllables(line2)===7 && countSyllables(line3)===5;

  useEffect(()=>{
    const c=cRef.current; if(!c) return; const ctx=c.getContext('2d');
    const w=c.width, h=c.height; const grad = ctx.createLinearGradient(0,0,0,h);
    const total = countSyllables(line1)+countSyllables(line2)+countSyllables(line3) || 1;
    grad.addColorStop(0, 'hsl(210,60%,90%)'); grad.addColorStop(1, 'hsl(' + (200+total*3)%360 + ',70%,50%)');
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
    ctx.lineWidth=2; ctx.strokeStyle='rgba(0,0,0,0.15)';
    const waves = 6; for(let i=0;i<waves;i++){
      ctx.beginPath(); const amp = 10 + i*6; const freq = 0.01 + i*0.005; const yBase = 80 + i*30;
      for(let x=0;x<w;x++){
        const y = yBase + Math.sin(x*freq + total*0.1 + i)*amp;
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.fillStyle='rgba(0,0,0,0.8)';
    ctx.font='28px system-ui'; ctx.textAlign='center';
    ctx.fillText(line1, w/2, h-120);
    ctx.fillText(line2, w/2, h-80);
    ctx.fillText(line3, w/2, h-40);
  }, [line1,line2,line3]);

  const save = ()=> onSave({ kind:'haiku', title:'Haiku', dataUrl: cRef.current.toDataURL('image/png') });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-5">
        <SectionTitle icon={Stars} title="Haiku Forge" subtitle="Gently checks for 5–7–5 and paints wave art."/>
        <div className="space-y-2">
          <input value={line1} onChange={e=>setL1(e.target.value)} placeholder="5 syllables" className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
          <input value={line2} onChange={e=>setL2(e.target.value)} placeholder="7 syllables" className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
          <input value={line3} onChange={e=>setL3(e.target.value)} placeholder="5 syllables" className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-zinc-800 border"/>
          <p className={`text-sm ${ok? 'text-emerald-600':'text-zinc-500'}`}>{ok? 'Looks like 5–7–5!': 'Aim for 5–7–5 (just a helpful nudge)'}</p>
          <div className="flex justify-end">
            <button onClick={save} className="px-4 py-2 rounded-xl bg-black text-white"><Save className="w-4 h-4 inline mr-1"/>Save Poster</button>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle icon={ImageIcon} title="Wave Poster"/>
        <canvas ref={cRef} width={900} height={400} className="w-full rounded-xl border bg-white"/>
      </Card>
    </div>
  )
}

// ----- Gallery -----
function Gallery({items, remove}){
  if(items.length===0) return (
    <Card className="p-6 text-center text-zinc-500">Your saved creations will appear here ✨</Card>
  );
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((it, idx)=> (
        <Card key={idx} className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-medium truncate">{it.title}</div>
            <button onClick={()=>remove(idx)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"><Trash2 className="w-4 h-4"/></button>
          </div>
          {it.dataUrl ? (
            <img src={it.dataUrl} className="w-full"/>
          ) : it.colors ? (
            <div className="p-4">
              <div className="h-36 rounded-xl border mb-3" style={{background:`linear-gradient(135deg, ${it.colors[0]}, ${it.colors[2]}, ${it.colors[4]})`}}/>
              <div className="grid grid-cols-5 gap-2">
                {it.colors.map((c,i)=>(<div key={i} className="h-8 rounded-lg border" style={{background:c}}/>))}
              </div>
            </div>
          ) : it.payload ? (
            <div className="p-4">
              <ul className="list-decimal pl-5 space-y-1 text-sm">
                {it.payload.map((x,i)=>(<li key={i}>{x}</li>))}
              </ul>
            </div>
          ) : null}
          <div className="p-4 border-t flex gap-2">
            {it.dataUrl && (
              <a download={`${it.title.replace(/\\s+/g,'_')}.png`} href={it.dataUrl} className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 inline-flex items-center gap-2"><Download className="w-4 h-4"/>Download</a>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ----- Score (self rating across 3Cs) -----
function ScorePanel({scores, setScores}){
  const K = ['Curiosity','Connections','Craft'];
  const avg = (scores.Curiosity + scores.Connections + scores.Craft)/3;
  return (
    <Card className="p-5">
      <SectionTitle icon={Gauge} title="Your Creative Signal" subtitle="Give yourself a quick, honest pulse check."/>
      <div className="grid md:grid-cols-3 gap-4">
        {K.map(k=> (
          <div key={k} className="p-4 rounded-xl border">
            <div className="mb-2 text-sm text-zinc-500">{k}</div>
            <input type="range" min={0} max={100} value={scores[k]} onChange={(e)=>setScores(s=>({...s,[k]:parseInt(e.target.value)}))} />
            <div className="text-xs text-zinc-500 mt-1">{scores[k]}%</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-black" style={{width:`${avg}%`}}/>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Average: {avg.toFixed(0)}%</p>
      </div>
    </Card>
  )
}

// ----- Main App -----
export default function CreativeSparksApp(){
  const TABS = [
    {key:'uses', label:'Alternative Uses', icon:Sparkles},
    {key:'emoji', label:'Emoji Story', icon:BookOpen},
    {key:'doodle', label:'Doodle Morph', icon:Pencil},
    {key:'haiku', label:'Haiku Forge', icon:Stars},
    {key:'palette', label:'Palette Poet', icon:Palette},
    {key:'gallery', label:'Gallery', icon:ImageIcon},
  ];
  const [tab, setTab] = useState('uses');
  const [gallery, setGallery] = useState([]);
  const [scores, setScores] = useState({Curiosity:50, Connections:50, Craft:50});

  const addToGallery = (item)=> setGallery(g=>[item, ...g]);
  const removeFromGallery = (idx)=> setGallery(g=> g.filter((_,i)=> i!==idx));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex items-start md:items-center gap-4 mb-8">
          <motion.div initial={{rotate:-8, scale:0.9}} animate={{rotate:0, scale:1}} transition={{type:'spring', stiffness:120}} className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 shadow border">
            <Sparkles className="w-7 h-7"/>
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Creative Sparks</h1>
            <p className="text-zinc-600 dark:text-zinc-400">A playful lab to test creativity and make beautiful things.</p>
          </div>
          <div className="ml-auto hidden md:flex gap-2">
            {TABS.map(t=> (
              <button key={t.key} onClick={()=>setTab(t.key)} className={`px-3 py-2 rounded-xl border backdrop-blur ${tab===t.key? 'bg-black text-white border-black':'bg-white/70 dark:bg-zinc-900/60'}`}>
                <div className="flex items-center gap-2"><t.icon className="w-4 h-4"/>{t.label}</div>
              </button>
            ))}
          </div>
        </header>

        <div className="md:hidden mb-4">
          <div className="flex gap-2 overflow-auto">
            {TABS.map(t=> (
              <button key={t.key} onClick={()=>setTab(t.key)} className={`px-3 py-2 rounded-xl border flex-shrink-0 ${tab===t.key? 'bg-black text-white border-black':'bg-white/70 dark:bg-zinc-900/60'}`}>
                <div className="flex items-center gap-2"><t.icon className="w-4 h-4"/>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {tab==='uses' && (
                <motion.div key="uses" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <AlternativeUses onSave={addToGallery}/>
                </motion.div>
              )}
              {tab==='emoji' && (
                <motion.div key="emoji" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <EmojiStory onSave={addToGallery}/>
                </motion.div>
              )}
              {tab==='doodle' && (
                <motion.div key="doodle" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <DoodleMorph onSave={addToGallery}/>
                </motion.div>
              )}
              {tab==='haiku' && (
                <motion.div key="haiku" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <HaikuForge onSave={addToGallery}/>
                </motion.div>
              )}
              {tab==='palette' && (
                <motion.div key="palette" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <PalettePoet onSave={addToGallery}/>
                </motion.div>
              )}
              {tab==='gallery' && (
                <motion.div key="gallery" initial={{opacity:0, y:6}} animate={{opacity:1,y:0}} exit={{opacity:0, y:-6}}>
                  <Gallery items={gallery} remove={removeFromGallery}/>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-6">
            <ScorePanel scores={scores} setScores={setScores}/>
            <Card className="p-5">
              <SectionTitle icon={Wand2} title="Try This" subtitle="Quick inspiration prompts"/>
              <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                <li><strong>Remix:</strong> Combine a kitchen tool with a musical instrument.</li>
                <li><strong>Constraint:</strong> Design a logo using only circles and the color you dislike.</li>
                <li><strong>Perspective:</strong> Describe your day as if you were a comet.</li>
              </ul>
            </Card>
            <Card className="p-5">
              <SectionTitle icon={Share2} title="Export Session" subtitle="Download your creations as JSON"/>
              <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={()=>{
                const blob = new Blob([JSON.stringify({createdAt: new Date().toISOString(), gallery, scores}, null, 2)], {type:'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download = 'creative_sparks_session.json'; a.click(); URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 inline mr-1"/>Download JSON
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
