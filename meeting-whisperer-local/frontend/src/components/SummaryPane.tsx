export default function SummaryPane({ items }:{ items:{ts:number, summary:string}[] }){
  return (
    <div style={{border:"1px solid #ddd", borderRadius:10, padding:12, height:180, overflow:"auto"}}>
      {items.map((it,i)=>(
        <div key={i} style={{marginBottom:12}}>
          <div style={{fontSize:12, opacity:0.7}}>{new Date(it.ts*1000).toLocaleTimeString()}</div>
          <pre style={{whiteSpace:"pre-wrap", margin:0}}>{it.summary || "(no content)"}</pre>
        </div>
      ))}
    </div>
  );
}
