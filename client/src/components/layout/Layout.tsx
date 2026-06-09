import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const ACCENT = "#ff2878";

const userNav = [
  { to: "/dashboard",   label: "Dashboard",   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { to: "/games",       label: "Games",       icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
  )},
  { to: "/teams",       label: "Teams",       icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { to: "/tournaments", label: "Tournaments", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="12" r="3"/><path d="M6 15v1a6 6 0 0 0 6 6M6 9V8a6 6 0 0 1 6-6h6"/></svg>
  )},
  { to: "/watchlist",   label: "Watchlist",   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  )},
];

const adminNav = [
  { to: "/admin",              label: "Dashboard",   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { to: "/admin/users",        label: "Users",       icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { to: "/admin/games",        label: "Games",       icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 4 0v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
  )},
  { to: "/tournaments",        label: "Tournaments", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="12" r="3"/><path d="M6 15v1a6 6 0 0 0 6 6M6 9V8a6 6 0 0 1 6-6h6"/></svg>
  )},
  { to: "/admin/health",       label: "Health",      icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )},
  { to: "/admin/audit",        label: "Audit Log",   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { to: "/watchlist",          label: "Watchlist",   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  )},
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? adminNav : userNav;
  const isAdmin = user?.role === "admin";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:"220px", flexShrink:0, borderRight:"1px solid rgba(255,40,120,0.1)", display:"flex", flexDirection:"column", background:"#07050f", position:"relative" }}>

        {/* Corner accents */}
        <span style={{ position:"absolute", top:0, right:0, width:"8px", height:"8px", borderTop:`1px solid rgba(255,40,120,0.4)`, borderRight:`1px solid rgba(255,40,120,0.4)`, pointerEvents:"none" }} />
        <span style={{ position:"absolute", bottom:0, left:0, width:"8px", height:"8px", borderBottom:`1px solid rgba(255,40,120,0.4)`, borderLeft:`1px solid rgba(255,40,120,0.4)`, pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ padding:"20px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:"12px" }}>
          <svg width="36" height="36" viewBox="0 0 80 80">
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="rgba(255,40,120,0.55)" strokeWidth="1.2"/>
            <polygon points="40,12 68,27 68,53 40,68 12,53 12,27" fill="none" stroke="rgba(255,40,120,0.2)" strokeWidth="0.6"/>
            <text x="40" y="37" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.95)" letterSpacing="1">LM</text>
            <text x="40" y="52" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="11" fontWeight="800" fill="rgba(255,40,120,0.95)" letterSpacing="1">VG</text>
          </svg>
          <div>
            <p style={{ fontSize:"14px", fontWeight:800, color:"#fff", letterSpacing:"-0.3px", margin:0 }}>Pulse</p>
            <p style={{ fontSize:"9px", color: isAdmin ? ACCENT : "rgba(255,255,255,0.25)", letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>
              {user?.role}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:"2px" }}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end style={{ textDecoration:"none" }}>
              {({ isActive }) => (
                <div style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  padding:"9px 12px",
                  background: isActive ? "rgba(255,40,120,0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(255,40,120,0.25)" : "1px solid transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                  fontSize:"13px", cursor:"pointer", transition:"all 0.15s",
                  position:"relative",
                }}>
                  {isActive && <span style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:"2px", background:ACCENT }} />}
                  <span style={{ color: isActive ? ACCENT : "rgba(255,255,255,0.3)", flexShrink:0 }}>{item.icon}</span>
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height:"1px", background:"rgba(255,40,120,0.1)", margin:"0 10px" }} />

        {/* User */}
        <div style={{ padding:"14px 14px 16px" }}>
          <NavLink to={`/users/${user?.id}`} style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", marginBottom:"8px", border:"1px solid transparent", transition:"border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="transparent"}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"rgba(255,40,120,0.08)", border:"1px solid rgba(255,40,120,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:"12px", color:ACCENT, fontWeight:700 }}>
                  {user?.gamer_tag?.[0]?.toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:"12px", fontWeight:600, color:"rgba(255,255,255,0.7)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user?.gamer_tag}
                </p>
              </div>
            </div>
          </NavLink>

          <button onClick={() => { logout(); navigate("/login"); }}
            style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.2)", background:"none", border:"none", cursor:"pointer", padding:"4px 10px", fontFamily:"inherit", transition:"color 0.15s", width:"100%", textAlign:"left" }}
            onMouseEnter={e => e.currentTarget.style.color=ACCENT}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.2)"}>
            SIGN OUT →
          </button>
        </div>

        {/* Bottom status bar */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"8px 14px", display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:ACCENT, animation:"blink 1.8s infinite" }} />
          <span style={{ fontSize:"9px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.2)" }}>NODE LIVE</span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:"auto", background:"#06040f" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
          {children}
        </div>
      </main>

      <style>{`@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}`}</style>
    </div>
  );
}