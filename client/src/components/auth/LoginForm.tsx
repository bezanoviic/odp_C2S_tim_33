import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

const GRID_LINES = [1,2,3,4,5,6,7];
const DOTS: [number,number][] = [[25,25],[50,25],[75,25],[12.5,50],[37.5,50],[62.5,50],[87.5,50],[25,75],[50,75],[75,75]];
const DOT_OPACITIES = DOTS.map(() => +(Math.random() * 0.3 + 0.2).toFixed(2));

export function LoginForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [gamer_tag, setGamerTag] = useState("");
  const [password, setPassword]  = useState("");
  const [error, setError]        = useState("");
  const [loading, setLoading]    = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await authApi.login(gamer_tag, password);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Invalid credentials"); return; }
    login(res.data);
  };

  return (
    <div style={{ display:"flex", width:"100%", height:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", overflow:"hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", borderRight:"1px solid rgba(255,40,120,0.15)" }}>

        {GRID_LINES.map(i => (
          <div key={`h${i}`} style={{ position:"absolute", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.05)" }} />
        ))}
        {GRID_LINES.map(i => (
          <div key={`v${i}`} style={{ position:"absolute", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.05)" }} />
        ))}

        {DOTS.map(([x,y], i) => (
          <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", width:"4px", height:"4px", borderRadius:"50%", background:`rgba(255,40,120,${DOT_OPACITIES[i]})` }} />
        ))}

        <span style={{ position:"absolute", top:"20px", left:"20px", fontSize:"11px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.5)", fontWeight:500 }}>SYS.AUTH // C2S</span>
        <span style={{ position:"absolute", top:"20px", right:"20px", fontSize:"11px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.5)", fontWeight:500 }}>BUILD 2.4.1</span>
        <span style={{ position:"absolute", bottom:"44px", left:"20px", fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,40,120,0.65)", fontFamily:"monospace" }}>0xFF2878</span>
        <span style={{ position:"absolute", top:"44px", right:"20px", fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,40,120,0.65)", fontFamily:"monospace" }}>0x07050F</span>

        {([
          { top:"36px",    left:"36px",  borderWidth:"1px 0 0 1px" },
          { top:"36px",    right:"36px", borderWidth:"1px 1px 0 0" },
          { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
          { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
        ] as React.CSSProperties[]).map((pos, i) => (
          <div key={i} style={{ position:"absolute", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.7)", borderStyle:"solid", ...pos }} />
        ))}

        <div style={{ position:"absolute", left:"36px", right:"36px", top:"42%", height:"1px", background:"rgba(255,40,120,0.2)" }} />

        <span style={{ position:"absolute", bottom:"16px", right:"-8px", fontSize:"120px", fontWeight:800, color:"rgba(255,255,255,0.025)", letterSpacing:"-8px", lineHeight:1, userSelect:"none" }}>07</span>

        {/* Center content */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", width:"220px" }}>
          <span style={{ display:"block", fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.65)", marginBottom:"16px" }}>ARENA PLATFORM</span>

          <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin:"0 auto 16px", display:"block" }}>
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="rgba(255,40,120,0.55)" strokeWidth="1.2"/>
            <polygon points="40,12 68,27 68,53 40,68 12,53 12,27" fill="none" stroke="rgba(255,40,120,0.2)" strokeWidth="0.6"/>
            <line x1="40" y1="4"  x2="40" y2="12" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <line x1="40" y1="68" x2="40" y2="76" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <line x1="4"  y1="22" x2="12" y2="27" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <line x1="68" y1="27" x2="76" y2="22" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <line x1="4"  y1="58" x2="12" y2="53" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <line x1="68" y1="53" x2="76" y2="58" stroke="rgba(255,40,120,0.5)" strokeWidth="0.8"/>
            <text x="40" y="37" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="14" fontWeight="800" fill="rgba(255,255,255,0.95)" letterSpacing="1.5">LM</text>
            <text x="40" y="53" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="14" fontWeight="800" fill="rgba(255,40,120,0.95)" letterSpacing="1.5">VG</text>
          </svg>

          <div style={{ fontSize:"26px", fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:"10px", letterSpacing:"-0.5px" }}>
            Ready<br/><span style={{ color:"rgba(255,40,120,0.9)" }}>Player.</span>
          </div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", lineHeight:1.7 }}>
            Competitive profile access<br/>secured and encrypted
          </div>
        </div>

        {/* Status bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#ff2878", animation:"blink 1.8s infinite" }} />
          <span style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.4)" }}>AUTH NODE LIVE</span>
          <span style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,40,120,0.55)", marginLeft:"auto" }}>▮▮▮▯ SIGNAL</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width:"45%", padding:"32px 48px", display:"flex", flexDirection:"column", justifyContent:"center", background:"#07050f", borderLeft:"1px solid rgba(255,40,120,0.08)" }}>

        <div style={{ fontSize:"10px", letterSpacing:"0.22em", color:"rgba(255,40,120,0.7)", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
          PLAYER LOGIN
        </div>

        <div style={{ display:"flex", gap:"14px", marginBottom:"22px" }}>
          {[["2.4k","ONLINE"],["S1","SEASON"]].map(([val,lbl]) => (
            <div key={lbl} style={{ flex:1, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"3px" }}>{val}</div>
              <div style={{ fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)" }}>
                <span style={{ display:"inline-block", width:"5px", height:"5px", borderRadius:"50%", background:"#ff2878", marginRight:"6px", verticalAlign:"2px" }} />
                {lbl}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:"28px", fontWeight:800, color:"#fff", lineHeight:1.1, letterSpacing:"-0.5px", marginBottom:"6px" }}>Welcome<br/>back.</div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.28)", marginBottom:"24px", lineHeight:1.6 }}>Your stats are waiting. Sign in to continue.</div>

        {error && (
          <div style={{ marginBottom:"16px", padding:"10px 14px", border:"1px solid rgba(255,80,80,0.25)", background:"rgba(255,80,80,0.06)", color:"rgba(255,130,130,0.9)", fontSize:"12px", letterSpacing:"0.05em" }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column" }}>

          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>GAMER TAG</div>
            <input
              type="text" value={gamer_tag} onChange={e => setGamerTag(e.target.value)} required
              placeholder="your.tag"
              style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.12)", padding:"10px 0 10px 2px", color:"#fff", fontSize:"14px", outline:"none", fontFamily:"inherit", transition:"border-color 0.2s" }}
              onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
              onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"}
            />
          </div>

          <div style={{ marginBottom:"8px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>PASSWORD</div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.12)", padding:"10px 0 10px 2px", color:"#fff", fontSize:"14px", outline:"none", fontFamily:"inherit", transition:"border-color 0.2s" }}
              onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
              onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"}
            />
          </div>

          <div style={{ position:"relative", marginTop:"28px" }}>
            {([
              { top:0,    left:0,  borderWidth:"1px 0 0 1px" },
              { top:0,    right:0, borderWidth:"1px 1px 0 0" },
              { bottom:0, left:0,  borderWidth:"0 0 1px 1px" },
              { bottom:0, right:0, borderWidth:"0 1px 1px 0" },
            ] as React.CSSProperties[]).map((pos, i) => (
              <span key={i} style={{ position:"absolute", width:"8px", height:"8px", borderColor:"rgba(255,40,120,0.65)", borderStyle:"solid", ...pos }} />
            ))}
            <button
              type="submit" disabled={loading}
              style={{ width:"100%", padding:"16px", background:"rgba(255,40,120,0.08)", border:"1px solid rgba(255,40,120,0.4)", color:"#ff2878", fontSize:"12px", fontWeight:700, letterSpacing:"0.24em", cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", opacity:loading?0.4:1, transition:"background 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { if(!loading){ const b=e.currentTarget; b.style.background="rgba(255,40,120,0.18)"; b.style.borderColor="rgba(255,40,120,0.8)"; }}}
              onMouseLeave={e => { const b=e.currentTarget; b.style.background="rgba(255,40,120,0.08)"; b.style.borderColor="rgba(255,40,120,0.4)"; }}
            >
              {loading ? "AUTHENTICATING..." : "ENTER ARENA"}
            </button>
          </div>
        </form>

        <p style={{ marginTop:"18px", fontSize:"12px", color:"rgba(255,255,255,0.22)", textAlign:"center" }}>
          No account?{" "}
          <a href="/register" style={{ color:"rgba(255,40,120,0.75)", textDecoration:"none" }}>Create one</a>
        </p>
      </div>

      <style>{`
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px #07050f inset !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`}</style>
    </div>
  );
}