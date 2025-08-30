import { useEffect, useRef, useState } from "react";
import { startSpeechRecognition } from "../lib/audio";

export default function ControlsBar({ onLine, onSummarize, speaking, setLang }:{
  onLine: (t:string)=>void, onSummarize: ()=>void, speaking: boolean, setLang: (l:"en"|"hi")=>void
}){
  const recRef = useRef<any>(null);
  const [live, setLive] = useState(false);
  const [lang, setLangState] = useState<"en"|"hi">("en");

  function start(){
    const rec = startSpeechRecognition((t)=> onLine(t));
    recRef.current = rec; setLive(true);
  }
  function stop(){ recRef.current?.stop?.(); setLive(false); }

  useEffect(()=>{ setLang(lang); },[lang]);

  return (
    <div style={{display:"flex", gap:8, alignItems:"center"}}>
      {!live ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
      <button onClick={onSummarize} disabled={speaking}>Summarize last 60s</button>
      <select value={lang} onChange={e=>setLangState(e.target.value as any)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
      </select>
    </div>
  );
}
