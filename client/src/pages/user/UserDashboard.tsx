import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const ACCENT = "#ff2878";
const GRID_LINES = [1,2,3,4,5,6,7];

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

const SECTIONS = [
  { label:"TOURNAMENTS", sub:"Browse and register your team", path:"/tournaments", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2878" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="12" r="3"/>
      <path d="M6 15v1a6 6 0 0 0 6 6h0M6 9V8a6 6 0 0 1 6-6h6"/>
    </svg>
  )},
  { label:"MY TEAMS", sub:"Manage rosters and invites", path:"/teams", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2878" strokeWidth="1.5">
      <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>
  )},
  { label:"WATCHLIST", sub:"Tournaments you are following", path:"/watchlist", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2878" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )},
  { label:"GAMES", sub:"Browse available titles", path:"/games", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2878" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/>
      <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  )},
];

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position:"fixed", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position:"fixed", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position:"fixed", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.35)", borderStyle:"solid", ...pos, pointerEvents:"none" }} />)}

      <div style={{ position:"relative", zIndex:1, maxWidth:"900px", margin:"0 auto", padding:"56px 32px 60px" }}>

        <div style={{ marginBottom:"48px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.7)", marginBottom:"12px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
            PLAYER PORTAL
          </div>
          <h1 style={{ fontSize:"36px", fontWeight:800, color:"#fff", letterSpacing:"-1px", lineHeight:1.1, margin:0 }}>
            Welcome,<br/><span style={{ color:ACCENT }}>{user?.gamer_tag}.</span>
          </h1>
          <p style={{ marginTop:"12px", fontSize:"13px", color:"rgba(255,255,255,0.28)", lineHeight:1.7 }}>
            Your arena awaits — tournaments, teams, watchlist.
          </p>
        </div>

        <div style={{ height:"1px", background:"rgba(255,40,120,0.15)", marginBottom:"40px" }} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"16px" }}>
          {SECTIONS.map((sec) => (
            <Link key={sec.label} to={sec.path} style={{ textDecoration:"none" }}>
              <div
                style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:0, padding:"24px 22px", cursor:"pointer", transition:"border-color 0.2s, background 0.2s", position:"relative" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,40,120,0.05)"; e.currentTarget.style.borderColor="rgba(255,40,120,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}
              >
                <span style={{ position:"absolute", top:0, right:0, width:"8px", height:"8px", borderTop:"1px solid rgba(255,40,120,0.5)", borderRight:"1px solid rgba(255,40,120,0.5)" }} />
                <span style={{ position:"absolute", bottom:0, left:0, width:"8px", height:"8px", borderBottom:"1px solid rgba(255,40,120,0.5)", borderLeft:"1px solid rgba(255,40,120,0.5)" }} />
                <div style={{ marginBottom:"16px" }}>{sec.icon}</div>
                <div style={{ fontSize:"11px", letterSpacing:"0.2em", color:ACCENT, marginBottom:"6px" }}>{sec.label}</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{sec.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop:"48px", padding:"14px 20px", border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.01)", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:ACCENT, animation:"blink 1.8s infinite" }} />
          <span style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)" }}>SESSION ACTIVE</span>
          <span style={{ fontSize:"10px", letterSpacing:"0.1em", color:"rgba(255,40,120,0.45)", marginLeft:"auto", fontFamily:"monospace" }}>ARENA PLATFORM // C2S</span>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}`}</style>
    </div>
  );
}