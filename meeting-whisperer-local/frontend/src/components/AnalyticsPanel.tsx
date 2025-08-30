export default function AnalyticsPanel({ lines }:{ lines:string[] }){
  const text = lines.join(" ").toLowerCase();
  const fillers = ["um","uh","like","you know","basically"];
  const counts = fillers.map(f=>({f, c:(text.match(new RegExp(`\\b${f}\\b`, "g"))||[]).length}));
  return (
    <div style={{border:"1px solid #ddd", borderRadius:10, padding:12}}>
      <div style={{fontWeight:600, marginBottom:8}}>Quick Analytics</div>
      {counts.map(x=> <div key={x.f}>{x.f}: {x.c}</div>)}
      <div style={{fontSize:12, opacity:0.7, marginTop:8}}>(basic filler-word counter)</div>
    </div>
  );
}
