export default function TranscriptPane({ lines }:{ lines:string[] }){
  return (
    <div style={{border:"1px solid #ddd", borderRadius:10, padding:12, height:180, overflow:"auto"}}>
      {lines.map((l,i)=>(<div key={i} style={{opacity:0.85}}>{l}</div>))}
    </div>
  );
}
