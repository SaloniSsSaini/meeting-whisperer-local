export async function speakREST(text: string, voice_id = import.meta.env.VITE_DEFAULT_VOICE || "en_female_01", language="en") {
  const r = await fetch("/api/tts", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ text, voice_id, language })
  });
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
}

export function speakStream(text: string, voice_id="en_female_01", language="en"){
  return new Promise<void>((resolve)=>{
    const ws = new WebSocket((location.protocol==="https:"?"wss":"ws")+"://"+location.host+"/ws/tts");
    const chunks: ArrayBuffer[] = [];
    ws.binaryType = "arraybuffer";
    ws.onopen = () => ws.send(JSON.stringify({text, voice_id, language}));
    ws.onmessage = async (e) => {
      if (typeof e.data !== "string") chunks.push(e.data);
      else {
        const msg = JSON.parse(e.data);
        if (msg.event === "end"){
          const blob = new Blob(chunks, { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => resolve();
          audio.play();
          ws.close();
        }
      }
    };
  });
}
