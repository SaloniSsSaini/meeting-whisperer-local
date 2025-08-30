export function startSpeechRecognition(onResult: (text:string)=>void) {
  const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SR) { alert("SpeechRecognition not supported. Use Chrome desktop."); throw new Error("SpeechRecognition not supported."); }
  const rec = new SR();
  rec.interimResults = true;
  rec.continuous = true;
  rec.lang = "en-US";
  rec.onresult = (e: any) => {
    let finalText = "";
    for (let i=e.resultIndex;i<e.results.length;i++){
      const res = e.results[i];
      const txt = res[0].transcript;
      if (res.isFinal) finalText += txt + " ";
    }
    if (finalText.trim()) onResult(finalText.trim());
  };
  rec.start();
  return rec;
}
