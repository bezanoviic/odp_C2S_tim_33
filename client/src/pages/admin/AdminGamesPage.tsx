import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto, CreateGameDto } from "../../models/game/GameTypes";

const ACCENT = "#ff2878";
const emptyForm: CreateGameDto = { name: "", logo: null, genre: "", max_players_per_team: 2 };

const corners: React.CSSProperties[] = [
  { top:"36px", left:"36px",  borderWidth:"1px 0 0 1px" },
  { top:"36px", right:"36px", borderWidth:"1px 1px 0 0" },
  { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
  { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:"20px" }}>
      <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:"100%", background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.12)",
  padding:"10px 0 10px 2px", color:"#fff", fontSize:"14px", outline:"none", fontFamily:"Inter,Arial,sans-serif", boxSizing:"border-box",
};

export default function AdminGamesPage() {
  const [games, setGames]       = useState<GameDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<CreateGameDto>(emptyForm);
  const [error, setError]       = useState("");
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  const load = () => {
    gamesApi.getAll().then((res) => {
      if (res.success && res.data) setGames(res.data);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.genre.trim()) { setError("Genre is required"); return; }
    if (form.max_players_per_team < 1) { setError("Max players must be at least 1"); return; }
    const res = editId ? await gamesApi.update(editId, form) : await gamesApi.create(form);
    if (!res.success) { setError(res.message ?? "Failed"); return; }
    setShowForm(false); setEditId(null); setForm(emptyForm); load();
  };

  const handleEdit = (game: GameDto) => {
    setForm({ name: game.name, logo: game.logo, genre: game.genre, max_players_per_team: game.max_players_per_team });
    setEditId(game.id); setShowForm(true); setError("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this game?")) return;
    const res = await gamesApi.remove(id);
    if (res.success) setGames((prev) => prev.filter((g) => g.id !== id));
    else alert(res.message);
  };

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
              ADMIN / GAMES
            </div>
            <h1 style={{ fontSize:"30px", fontWeight:800, color:"#fff", letterSpacing:"-0.5px", margin:0 }}>
              Game<br/><span style={{ color:ACCENT }}>Management.</span>
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setEditId(null); setForm(emptyForm); setError(""); }}
            style={{ padding:"12px 22px", background: showForm ? "rgba(255,255,255,0.04)" : "rgba(255,40,120,0.08)", border:`1px solid ${showForm ? "rgba(255,255,255,0.1)" : "rgba(255,40,120,0.4)"}`, color: showForm ? "rgba(255,255,255,0.5)" : ACCENT, fontSize:"11px", fontWeight:700, letterSpacing:"0.18em", cursor:"pointer", fontFamily:"inherit" }}
          >
            {showForm ? "CANCEL" : "+ ADD GAME"}
          </button>
        </div>

        <div style={{ height:"1px", background:"rgba(255,40,120,0.15)", marginBottom:"32px" }} />

        {showForm && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,40,120,0.2)", padding:"28px 28px 20px", marginBottom:"32px", position:"relative" }}>
            <span style={{ position:"absolute", top:0, right:0, width:"8px", height:"8px", borderTop:"1px solid rgba(255,40,120,0.5)", borderRight:"1px solid rgba(255,40,120,0.5)" }} />
            <span style={{ position:"absolute", bottom:0, left:0, width:"8px", height:"8px", borderBottom:"1px solid rgba(255,40,120,0.5)", borderLeft:"1px solid rgba(255,40,120,0.5)" }} />
            <div style={{ fontSize:"11px", letterSpacing:"0.2em", color:ACCENT, marginBottom:"24px" }}>{editId ? "EDIT GAME" : "NEW GAME"}</div>
            {error && <div style={{ marginBottom:"16px", padding:"10px 14px", border:"1px solid rgba(255,80,80,0.25)", background:"rgba(255,80,80,0.06)", color:"rgba(255,130,130,0.9)", fontSize:"12px" }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                <Field label="GAME NAME">
                  <input style={inputStyle} type="text" placeholder="e.g. Valorant" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
                    onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"} />
                </Field>
                <Field label="GENRE">
                  <input style={inputStyle} type="text" placeholder="e.g. FPS, MOBA" value={form.genre}
                    onChange={e => setForm({ ...form, genre: e.target.value })}
                    onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
                    onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"} />
                </Field>
                <Field label="MAX PLAYERS PER TEAM">
                  <input style={inputStyle} type="number" min={1} value={form.max_players_per_team}
                    onChange={e => setForm({ ...form, max_players_per_team: parseInt(e.target.value, 10) })}
                    onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
                    onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"} />
                </Field>
                <Field label="LOGO URL (OPTIONAL)">
                  <input style={inputStyle} type="text" placeholder="https://..." value={form.logo ?? ""}
                    onChange={e => setForm({ ...form, logo: e.target.value || null })}
                    onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
                    onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"} />
                </Field>
              </div>
              <button type="submit"
                style={{ width:"100%", padding:"14px", background:"rgba(255,40,120,0.08)", border:"1px solid rgba(255,40,120,0.4)", color:ACCENT, fontSize:"11px", fontWeight:700, letterSpacing:"0.22em", cursor:"pointer", fontFamily:"inherit", marginTop:"8px" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,40,120,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,40,120,0.08)"; }}>
                {editId ? "SAVE CHANGES" : "CREATE GAME"}
              </button>
            </form>
          </div>
        )}

        {loading && <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>Loading...</p>}
        {!loading && games.length === 0 && <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.2)", fontSize:"13px" }}>No games yet.</div>}

        <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
          {games.map((game, idx) => (
            <div key={game.id}>
            <div
              onClick={() => setExpandedGameId((current) => current === game.id ? null : game.id)}
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"border-color 0.2s", cursor:"pointer" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,40,120,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                <span style={{ fontFamily:"monospace", fontSize:"11px", color:"rgba(255,40,120,0.4)", minWidth:"28px" }}>{String(idx + 1).padStart(2, "0")}</span>
                {game.logo && <img src={game.logo} alt="" style={{ width:"28px", height:"28px", objectFit:"contain", opacity:0.8 }} onError={e => { e.currentTarget.style.display = "none"; }} />}
                <div>
                  <div style={{ fontSize:"14px", fontWeight:600, color:"#fff" }}>{game.name}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>
                    {game.genre} · {game.max_players_per_team}v{game.max_players_per_team}
                    {game.active_tournaments_count > 0 && <span style={{ marginLeft:"10px", color:ACCENT }}>● {game.active_tournaments_count} active</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:"16px" }}>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(game); }} style={{ fontSize:"11px", letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}
                  onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.4)"}>EDIT</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }} style={{ fontSize:"11px", letterSpacing:"0.1em", color:"rgba(255,40,120,0.5)", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}
                  onMouseEnter={e => e.currentTarget.style.color=ACCENT} onMouseLeave={e => e.currentTarget.style.color="rgba(255,40,120,0.5)"}>DELETE</button>
              </div>
            </div>
            {expandedGameId === game.id && (
              <div style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.06)", borderTop:"none", padding:"14px 20px 16px 64px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.28)", marginBottom:"10px" }}>TOURNAMENTS</div>
                {game.tournaments.length === 0 ? (
                  <div style={{ color:"rgba(255,255,255,0.28)", fontSize:"12px" }}>No tournaments for this game.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {game.tournaments.map((tournament) => (
                      <Link
                        key={tournament.id}
                        to={`/tournaments/${tournament.id}`}
                        style={{ color:"#fff", textDecoration:"none", fontSize:"12px", display:"flex", justifyContent:"space-between", gap:"12px" }}
                      >
                        <span>{tournament.name}</span>
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
