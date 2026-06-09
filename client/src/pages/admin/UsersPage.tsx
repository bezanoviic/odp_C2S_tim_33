import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";

const ACCENT = "#ff2878";

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", border: isAdmin ? "1px solid rgba(255,40,120,0.4)" : "1px solid rgba(255,255,255,0.1)", background: isAdmin ? "rgba(255,40,120,0.08)" : "rgba(255,255,255,0.03)", color: isAdmin ? ACCENT : "rgba(255,255,255,0.4)", fontSize:"10px", letterSpacing:"0.14em", fontWeight:600 }}>
      {role.toUpperCase()}
    </span>
  );
}

function StatusDot({ active }: { active: number | boolean }) {
  const on = Boolean(active);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"6px" }}>
      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: on ? "#4ade80" : "rgba(255,255,255,0.15)", display:"inline-block" }} />
      <span style={{ fontSize:"11px", color: on ? "rgba(100,220,150,0.7)" : "rgba(255,255,255,0.2)", letterSpacing:"0.08em" }}>{on ? "ACTIVE" : "INACTIVE"}</span>
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers]     = useState<UserDto[]>([]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    usersApi.getAll()
      .then(res => { if (res.success) setUsers(res.data ?? []); else setError(res.message); })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search.trim() ||
    u.gamer_tag.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      {[1,2,3,4,5,6,7].map(i => <div key={`h${i}`} style={{ position:"fixed", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {[1,2,3,4,5,6,7].map(i => <div key={`v${i}`} style={{ position:"fixed", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position:"fixed", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.35)", borderStyle:"solid", ...pos, pointerEvents:"none" }} />)}

      <div style={{ position:"relative", zIndex:1, maxWidth:"960px", margin:"0 auto", padding:"56px 32px 60px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"40px" }}>
          <div>
            <div style={{ fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.7)", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
              ADMIN / USERS
            </div>
            <h1 style={{ fontSize:"30px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px", margin:0 }}>
              User<br/><span style={{ color:ACCENT }}>Registry.</span>
            </h1>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"monospace", fontSize:"13px", color:"rgba(255,40,120,0.6)", marginBottom:"4px" }}>{users.length}</div>
            <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,255,255,0.2)" }}>TOTAL USERS</div>
          </div>
        </div>

        <div style={{ height:"1px", background:"rgba(255,40,120,0.15)", marginBottom:"28px" }} />

        <div style={{ marginBottom:"24px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.25)", marginBottom:"8px" }}>SEARCH</div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="username, email or role..."
            style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:0, padding:"12px 16px", color:"#fff", fontSize:"13px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="rgba(255,40,120,0.4)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.08)"} />
        </div>

        {error && <div style={{ padding:"12px 16px", border:"1px solid rgba(255,80,80,0.25)", background:"rgba(255,80,80,0.06)", color:"rgba(255,130,130,0.9)", fontSize:"12px", marginBottom:"20px" }}>{error}</div>}
        {loading && <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>Loading...</p>}

        {!loading && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 1fr 100px 90px", gap:"0 16px", padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", marginBottom:"2px" }}>
              {["ID","USERNAME","EMAIL","ROLE","STATUS"].map(col => (
                <span key={col} style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>{col}</span>
              ))}
            </div>
            {filtered.length === 0 && <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"13px" }}>{search ? "No users match your search." : "No users found."}</div>}
            <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
              {filtered.map((u) => (
                <div key={u.id}
                  style={{ display:"grid", gridTemplateColumns:"40px 1fr 1fr 100px 90px", gap:"0 16px", padding:"14px 16px", background:"rgba(255,255,255,0.015)", borderLeft:"2px solid transparent", transition:"border-color 0.15s, background 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,40,120,0.035)"; e.currentTarget.style.borderLeftColor="rgba(255,40,120,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.015)"; e.currentTarget.style.borderLeftColor="transparent"; }}>
                  <span style={{ fontFamily:"monospace", fontSize:"11px", color:"rgba(255,255,255,0.2)" }}>{u.id}</span>
                  <span style={{ fontSize:"13px", color:"#fff", fontWeight:500 }}>{u.gamer_tag}</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{u.email}</span>
                  <RoleBadge role={u.role} />
                  <StatusDot active={u.isActive ?? 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}