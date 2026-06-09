import { useEffect, useState } from "react";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { AuditLogDto } from "../../api_services/audit/AuditAPIService";

const ACCENT = "#ff2878";
const LIMIT = 20;

const ACTION_COLOR: Record<string, string> = {
  CREATE_GAME:       "rgba(100,220,150,0.85)",
  UPDATE_GAME:       "rgba(100,180,255,0.85)",
  DELETE_GAME:       "rgba(255,80,80,0.85)",
  LOGIN:             "rgba(255,210,80,0.85)",
  LOGOUT:            "rgba(180,180,180,0.6)",
  CREATE_TOURNAMENT: "rgba(180,120,255,0.85)",
  UPDATE_TOURNAMENT: "rgba(100,180,255,0.85)",
  DELETE_TOURNAMENT: "rgba(255,80,80,0.85)",
};

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

function actionColor(action: string) {
  return ACTION_COLOR[action] ?? "rgba(255,255,255,0.5)";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
    + "  " + d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}

export default function AdminAuditPage() {
  const [logs, setLogs]       = useState<AuditLogDto[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let active = true;
  auditApi.getLogs(page, LIMIT).then((res) => {
    if (!active) return;
    if (res.success && res.data) setLogs(res.data);
    if (res.total !== undefined) setTotal(res.total);
    setLoading(false);
  });
  return () => { active = false; };
}, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div style={{ minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      {[1,2,3,4,5,6,7].map(i => <div key={`h${i}`} style={{ position:"fixed", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {[1,2,3,4,5,6,7].map(i => <div key={`v${i}`} style={{ position:"fixed", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position:"fixed", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.35)", borderStyle:"solid", ...pos, pointerEvents:"none" }} />)}

      <div style={{ position:"relative", zIndex:1, maxWidth:"960px", margin:"0 auto", padding:"56px 32px 60px" }}>
        <div style={{ marginBottom:"40px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.7)", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
            ADMIN / AUDIT
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <h1 style={{ fontSize:"30px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px", margin:0 }}>
              Audit<br/><span style={{ color:ACCENT }}>Log.</span>
            </h1>
            <div style={{ fontFamily:"monospace", fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>{total} events total</div>
          </div>
        </div>

        <div style={{ height:"1px", background:"rgba(255,40,120,0.15)", marginBottom:"28px" }} />

        <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", marginBottom:"24px" }}>
          {Object.entries(ACTION_COLOR).map(([action, color]) => (
            <div key={action} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:color, display:"inline-block" }} />
              <span style={{ fontSize:"10px", letterSpacing:"0.1em", color:"rgba(255,255,255,0.3)" }}>{action}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 110px 80px 1fr 140px", gap:"0 16px", padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", marginBottom:"4px" }}>
          {["#","ACTION","ENTITY","ID","DETAILS / USER","TIME"].map(col => (
            <span key={col} style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>{col}</span>
          ))}
        </div>

        {loading && <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px", padding:"24px 0" }}>Loading...</p>}
        {!loading && logs.length === 0 && <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"13px" }}>No logs yet.</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
          {logs.map((log, idx) => (
            <div key={log.id}
              style={{ display:"grid", gridTemplateColumns:"36px 1fr 110px 80px 1fr 140px", gap:"0 16px", padding:"12px 16px", background:"rgba(255,255,255,0.015)", borderLeft:"2px solid transparent", transition:"border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,40,120,0.04)"; e.currentTarget.style.borderLeftColor="rgba(255,40,120,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.015)"; e.currentTarget.style.borderLeftColor="transparent"; }}>
              <span style={{ fontFamily:"monospace", fontSize:"11px", color:"rgba(255,255,255,0.2)" }}>{(page-1)*LIMIT + idx + 1}</span>
              <span style={{ fontSize:"12px", fontWeight:600, color:actionColor(log.action), letterSpacing:"0.05em" }}>{log.action}</span>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{log.entity_type}</span>
              <span style={{ fontSize:"12px", fontFamily:"monospace", color:"rgba(255,255,255,0.25)" }}>#{log.entity_id ?? "—"}</span>
              <div>
                {log.details && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)" }}>{log.details}</div>}
                <div style={{ fontSize:"11px", color:"rgba(255,40,120,0.5)", marginTop:"2px" }}>by {log.gamer_tag ?? "system"}</div>
              </div>
              <span style={{ fontSize:"11px", fontFamily:"monospace", color:"rgba(255,255,255,0.2)" }}>{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginTop:"28px" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding:"8px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", color:"rgba(255,255,255,0.5)", fontSize:"12px", cursor:page===1?"not-allowed":"pointer", opacity:page===1?0.3:1, fontFamily:"inherit", letterSpacing:"0.1em" }}>← PREV</button>
          <span style={{ fontFamily:"monospace", fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding:"8px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", color:"rgba(255,255,255,0.5)", fontSize:"12px", cursor:page===totalPages?"not-allowed":"pointer", opacity:page===totalPages?0.3:1, fontFamily:"inherit", letterSpacing:"0.1em" }}>NEXT →</button>
        </div>
      </div>
    </div>
  );
}