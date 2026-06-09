import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../api_services/games/GamesAPIService";
import type { GameDto } from "../models/game/GameTypes";

const ACCENT = "#ff2878";
const GRID_LINES = [1,2,3,4,5,6,7];

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

export default function GamesPage() {
  const [games, setGames]     = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  useEffect(() => {
    gamesApi.getAll().then((res) => {
      if (res.success && res.data) setGames(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = games.filter(g =>
    !search.trim() ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position:"fixed", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position:"fixed", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position:"fixed", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.35)", borderStyle:"solid", ...pos, pointerEvents:"none" }} />)}

      <div style={{ position:"relative", zIndex:1, maxWidth:"960px", margin:"0 auto", padding:"56px 32px 60px" }}>

        <div style={{ marginBottom:"40px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.7)", marginBottom:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
            ARENA / GAMES
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <h1 style={{ fontSize:"30px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px", margin:0 }}>
              Game<br/><span style={{ color:ACCENT }}>Library.</span>
            </h1>
            <div style={{ fontFamily:"monospace", fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>{games.length} titles</div>
          </div>
        </div>

        <div style={{ height:"1px", background:"rgba(255,40,120,0.15)", marginBottom:"28px" }} />

        <div style={{ marginBottom:"28px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.25)", marginBottom:"8px" }}>SEARCH</div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="game name or genre..."
            style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:0, padding:"12px 16px", color:"#fff", fontSize:"13px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="rgba(255,40,120,0.4)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.08)"} />
        </div>

        {loading && <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>Loading...</p>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"13px" }}>No games found.</div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"2px" }}>
          {filtered.map((game, idx) => (
            <div key={game.id}
              onClick={() => setExpandedGameId((current) => current === game.id ? null : game.id)}
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", padding:"20px 22px", position:"relative", transition:"border-color 0.2s, background 0.2s", cursor:"pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,40,120,0.3)"; e.currentTarget.style.background="rgba(255,40,120,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
            >
              <span style={{ position:"absolute", top:0, right:0, width:"8px", height:"8px", borderTop:"1px solid rgba(255,40,120,0.4)", borderRight:"1px solid rgba(255,40,120,0.4)" }} />

              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
                <span style={{ fontFamily:"monospace", fontSize:"11px", color:"rgba(255,40,120,0.4)", minWidth:"24px" }}>{String(idx+1).padStart(2,"0")}</span>
                {game.logo
                  ? <img src={game.logo} alt="" style={{ width:"36px", height:"36px", objectFit:"contain", opacity:0.85 }} onError={e => { e.currentTarget.style.display="none"; }} />
                  : <div style={{ width:"36px", height:"36px", background:"rgba(255,40,120,0.08)", border:"1px solid rgba(255,40,120,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:"14px", color:"rgba(255,40,120,0.5)" }}>◈</span>
                    </div>
                }
                <div>
                  <div style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>{game.name}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2px", letterSpacing:"0.05em" }}>{game.genre}</div>
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"12px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>
                  {game.max_players_per_team}v{game.max_players_per_team}
                </span>
                <span style={{ fontSize:"11px", color: game.active_tournaments_count > 0 ? ACCENT : "rgba(255,255,255,0.2)" }}>
                  {game.active_tournaments_count > 0
                    ? `● ${game.active_tournaments_count} available tournaments`
                    : "no available tournaments"}
                </span>
              </div>

              {expandedGameId === game.id && (
                <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.28)", marginBottom:"8px" }}>
                    TOURNAMENTS
                  </div>
                  {game.tournaments.length === 0 ? (
                    <div style={{ color:"rgba(255,255,255,0.28)", fontSize:"12px" }}>No tournaments for this game.</div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                      {game.tournaments.map((tournament) => (
                        <Link
                          key={tournament.id}
                          to={`/tournaments/${tournament.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color:"#fff", textDecoration:"none", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}
                        >
                          <span style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <span style={{ width:"5px", height:"5px", borderRadius:"50%", background: tournament.status === "upcoming" ? ACCENT : "rgba(255,255,255,0.25)", flexShrink:0 }} />
                            {tournament.name}
                          </span>
                          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"10px" }}>{tournament.status.replace(/_/g, " ")}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
