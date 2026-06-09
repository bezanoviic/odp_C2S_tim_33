import { useEffect, useState } from "react";
import { healthApi } from "../../api_services/health/HealthAPIService";
import type { DbNodeStatus, ApiNodeStatus } from "../../api_services/health/HealthAPIService";

const ACCENT = "#ff2878";

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

function statusDot(s: string) { return ({healthy:"#4ade80",degraded:"#facc15",offline:"#f87171",unreachable:"#f87171"} as Record<string,string>)[s] ?? "#555"; }
function statusTextColor(s: string) { return ({healthy:"rgba(100,220,150,0.9)",degraded:"rgba(250,200,50,0.9)",offline:"rgba(248,113,113,0.9)",unreachable:"rgba(248,113,113,0.9)"} as Record<string,string>)[s] ?? "rgba(255,255,255,0.4)"; }

async function fetchHealth() {
  return Promise.all([healthApi.getDbHealth(), healthApi.getApiHealth()]);
}

export default function AdminHealthPage() {
  const [dbNodes, setDbNodes]         = useState<DbNodeStatus[]>([]);
  const [apiNodes, setApiNodes]       = useState<ApiNodeStatus[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing]   = useState(false);
 
  const [tick, setTick]               = useState(0);

  useEffect(() => {
    let active = true;
    fetchHealth().then(([db, api]) => {
      if (!active) return;
      if (db.success && db.data)   setDbNodes(db.data);
      if (api.success && api.data) setApiNodes(api.data);
      setLastRefresh(new Date());
      setRefreshing(false);
    });
    return () => { active = false; };
  }, [tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTick(t => t + 1);
  };

  const loading = lastRefresh === null;
  const allStatuses = [...dbNodes.map(n => n.status), ...apiNodes.map(n => n.status)];
  const systemOk = allStatuses.length > 0 && allStatuses.every(s => s === "healthy");

  return (
    <div style={{ minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      {[1,2,3,4,5,6,7].map(i => <div key={`h${i}`} style={{ position:"fixed", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {[1,2,3,4,5,6,7].map(i => <div key={`v${i}`} style={{ position:"fixed", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position:"fixed", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.35)", borderStyle:"solid", ...pos, pointerEvents:"none" }} />)}

      <div style={{ position:"relative", zIndex:1, maxWidth:"900px", margin:"0 auto", padding:"56px 32px 60px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"40px" }}>
          <div>
            <div style={{ fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.7)", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
              ADMIN / HEALTH
            </div>
            <h1 style={{ fontSize:"30px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px", margin:0 }}>
              System<br/><span style={{ color:ACCENT }}>Health.</span>
            </h1>
          </div>
          <div style={{ textAlign:"right" }}>
            <button onClick={handleRefresh} disabled={refreshing}
              style={{ padding:"10px 20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:"11px", letterSpacing:"0.14em", cursor:refreshing?"not-allowed":"pointer", fontFamily:"inherit", display:"block", width:"100%", marginBottom:"6px" }}
              onMouseEnter={e => { if(!refreshing) e.currentTarget.style.borderColor="rgba(255,40,120,0.4)"; }}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}>
              {refreshing ? "REFRESHING..." : "↺ REFRESH"}
            </button>
            {lastRefresh && <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>{lastRefresh.toLocaleTimeString()}</div>}
          </div>
        </div>

        {loading ? (
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>Loading...</p>
        ) : (
          <>
            <div style={{ padding:"16px 20px", border:`1px solid ${systemOk ? "rgba(74,222,128,0.25)" : "rgba(250,200,50,0.25)"}`, background: systemOk ? "rgba(74,222,128,0.04)" : "rgba(250,200,50,0.04)", marginBottom:"32px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: systemOk ? "#4ade80" : "#facc15", animation:"blink 2s infinite" }} />
              <span style={{ fontSize:"11px", letterSpacing:"0.18em", color: systemOk ? "rgba(100,220,150,0.9)" : "rgba(250,200,50,0.9)" }}>
                {systemOk ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED — CHECK NODES BELOW"}
              </span>
              <span style={{ marginLeft:"auto", fontFamily:"monospace", fontSize:"10px", color:"rgba(255,255,255,0.2)" }}>{dbNodes.length + apiNodes.length} nodes monitored</span>
            </div>

            {(["DATABASE NODES", "API NODES"] as const).map((title, gi) => {
              const nodes = gi === 0 ? dbNodes : apiNodes;
              return (
                <div key={title} style={{ marginBottom:"36px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginBottom:"12px" }}>{title}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                    {nodes.map((node) => (
                      <div key={node.name}
                        style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", transition:"border-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,40,120,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>
                        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:statusDot(node.status), flexShrink:0, animation: node.status === "healthy" ? "blink 2.5s infinite" : "none" }} />
                          <div>
                            <div style={{ fontSize:"14px", fontWeight:600, color:"#fff", textTransform:"capitalize" }}>{node.name}</div>
                            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2px", fontFamily:"monospace" }}>
                              {"host" in node ? `${(node as DbNodeStatus).host}:${(node as DbNodeStatus).port}` : (node as ApiNodeStatus).url}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:"12px", fontWeight:600, letterSpacing:"0.1em", color:statusTextColor(node.status) }}>{node.status.toUpperCase()}</div>
                          {"lastCheck" in node
                            ? <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginTop:"4px", fontFamily:"monospace" }}>{new Date((node as DbNodeStatus).lastCheck).toLocaleTimeString()}</div>
                            : (node as ApiNodeStatus).latency !== null && <div style={{ fontSize:"10px", fontFamily:"monospace", color:"rgba(255,255,255,0.2)", marginTop:"4px" }}>{(node as ApiNodeStatus).latency}ms</div>
                          }
                        </div>
                      </div>
                    ))}
                    {nodes.length === 0 && <div style={{ padding:"24px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:"13px" }}>No nodes found</div>}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.5;}}`}</style>
    </div>
  );
}