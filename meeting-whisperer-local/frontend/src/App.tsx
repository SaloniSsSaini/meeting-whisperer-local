import { useEffect, useRef, useState } from "react";
import ControlsBar from "./components/ControlsBar";
import TranscriptPane from "./components/TranscriptPane";
import SummaryPane from "./components/SummaryPane";
import AnalyticsPanel from "./components/AnalyticsPanel";
import { speakREST, speakStream } from "./lib/tts";

export default function App(){
  const [lines,setLines] = useState<string[]>([]);
  const [items,setItems] = useState<{ts:number, summary:string}[]>([]);
  const [speaking,setSpeaking] = useState(false);
  const [lang, setLang] = useState<"en"|"hi">("en");
  const timerRef = useRef<number|undefined>(undefined);

  async function pushLine(t:string){
    setLines(prev=>[...prev, t]);
    await fetch("/api/transcript", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ text: t })});
  }

  async function summarizeOnce(){
    const r = await fetch("/api/summary");
    const j = await r.json();
    if (j.summary){
      setItems(prev=>[...prev, { ts: j.ts, summary: j.summary }]);
      setSpeaking(true);
      const text = (lang==="hi") ? await translate(j.summary) : j.summary;
      try { await speakStream(text, "en_female_01", lang); }
      catch { await speakREST(text, "en_female_01", lang); }
      setSpeaking(false);
    }
  }

  async function translate(text:string){
    if (lang!=="hi") return text;
    return "हिंदी सारांश: " + text;
  }

  useEffect(()=>{
    timerRef.current = window.setInterval(()=> summarizeOnce(), 60000);
    return ()=> { if (timerRef.current) window.clearInterval(timerRef.current); }
  },[lang]);

  async function downloadDigest(){
    const r = await fetch("/api/digest");
    const j = await r.json();
    const text = (lang==="hi") ? await translate(j.voice_script) : j.voice_script;
    const res = await fetch("/api/tts", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ text, voice_id:"en_female_01", language: lang })});
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "meeting-digest.mp3"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{maxWidth:900, margin:"20px auto", display:"grid", gap:14}}>
      <h2>Meeting Whisperer</h2>
      <ControlsBar onLine={pushLine} onSummarize={summarizeOnce} speaking={speaking} setLang={setLang}/>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div>
          <div style={{fontWeight:600, marginBottom:6}}>Live Transcript</div>
          <TranscriptPane lines={lines}/>
        </div>
        <div>
          <div style={{fontWeight:600, marginBottom:6}}>Interval Summaries</div>
          <SummaryPane items={items}/>
        </div>
      </div>
      <AnalyticsPanel lines={lines}/>
      <div style={{display:"flex", gap:8}}>
        <button onClick={downloadDigest} disabled={speaking}>Download Voice Digest</button>
      </div>
      <div style={{fontSize:12, opacity:0.7}}>
        Tip: Works immediately with Chrome’s Web Speech (STT) and Murf REST (TTS). Later, swap real-time STT + Murf Streaming.
      </div>
    </div>
  );
}
