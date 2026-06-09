import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";
import { gamesApi } from "../api_services/games/GamesAPIService";
import { useAuth } from "../hooks/auth/useAuthHook";
import { StatusBadge } from "../components/ui/UI";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

const corners: React.CSSProperties[] = [
  { top: "36px", left: "36px", borderWidth: "1px 0 0 1px" },
  { top: "36px", right: "36px", borderWidth: "1px 1px 0 0" },
  { bottom: "32px", left: "36px", borderWidth: "0 0 1px 1px" },
  { bottom: "32px", right: "36px", borderWidth: "0 1px 1px 0" },
];

const panelStyle: React.CSSProperties = {
  position: "relative",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "28px 32px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.18em",
  color: "rgba(255,255,255,0.35)",
};

const valueStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#07050f",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "12px 14px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
};

const actionButton: React.CSSProperties = {
  padding: "12px 18px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  fontFamily: "inherit",
  cursor: "pointer",
  textDecoration: "none",
  textTransform: "uppercase",
};

interface MyTeam {
  id: number;
  name: string;
  tag: string;
  members_count?: number;
}

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<{ team_id: number; status: string; registered_at: string }[]>([]);
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [watching, setWatching] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [requiredMembers, setRequiredMembers] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const tournamentId = parseInt(id, 10);

    const load = async () => {
      setLoading(true);
      try {
        const t = await TournamentsAPIService.getById(tournamentId);
        setTournament(t);
        try {
          const gameRes = await gamesApi.getById(t.game_id);
          setRequiredMembers(gameRes.data?.max_players_per_team ?? null);
        } catch {
          setRequiredMembers(null);
        }
        const regs = await TournamentsAPIService.getRegistrations(tournamentId);
        setRegistrations(regs);

        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const res = await axios.get("/api/v1/teams", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const teams = Array.isArray(res.data) ? res.data : res.data.data ?? [];
            setMyTeams(teams);
          } catch {
            /* ignore */
          }

          try {
            const watchlist = await TournamentsAPIService.getMyWatchlist();
            setWatching(watchlist.some((watchedTournament) => watchedTournament.id === tournamentId));
          } catch {
            setWatching(false);
          }
        } else {
          setWatching(false);
        }
      } catch {
        setError("Tournament not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWatch = async () => {
    if (!tournament) return;
    try {
      if (watching) {
        await TournamentsAPIService.unwatch(tournament.id);
        setWatching(false);
        alert("Successfully removed from watchlist");
      } else {
        await TournamentsAPIService.watch(tournament.id);
        setWatching(true);
        alert("Successfully added to watchlist");
      }
    } catch {
      alert("Action failed");
    }
  };

  const handleRegister = async () => {
    if (!tournament || !selectedTeam) {
      alert("Select a team");
      return;
    }
    setRegistering(true);
    try {
      await TournamentsAPIService.register(tournament.id, selectedTeam);
      const regs = await TournamentsAPIService.getRegistrations(tournament.id);
      setRegistrations(regs);
      alert("Team registered!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdateStatus = async (teamId: number, status: string) => {
    if (!tournament) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `/api/v1/tournaments/${tournament.id}/registrations/${teamId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const regs = await TournamentsAPIService.getRegistrations(tournament.id);
      setRegistrations(regs);
    } catch {
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!tournament) return;
    if (!confirm(`Are you sure you want to delete "${tournament.name}"? This cannot be undone.`)) return;
    try {
      await TournamentsAPIService.delete(tournament.id);
      window.location.href = "/tournaments";
    } catch {
      alert("Failed to delete tournament");
    }
  };

  const handleLockRegistrations = async () => {
    if (!tournament) return;
    if (!confirm("Lock registrations for this tournament?")) return;
    try {
      const updated = await TournamentsAPIService.update(tournament.id, { status: "ongoing" });
      setTournament(updated);
      alert("Registrations locked");
    } catch {
      alert("Failed to lock registrations");
    }
  };

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading...</div>;
  if (error || !tournament) return <div style={{ padding: "32px", color: "#fff" }}>{error}</div>;

  const availableTeams = myTeams.filter(
    (t) => !registrations.some((r) => r.team_id === t.id),
  );
  const eligibleTeams = requiredMembers
    ? availableTeams.filter((team) => (Number(team.members_count) || 0) >= requiredMembers)
    : availableTeams;
  const registrationOpen = tournament.status === "upcoming";
  const registrationClosedReason =
    tournament.status !== "upcoming"
      ? "Registration is only available for upcoming tournaments."
      : "";

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", position: "relative", overflow: "hidden", color: "#fff" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {corners.map((pos, i) => <div key={i} style={{ position: "fixed", width: "14px", height: "14px", borderColor: "rgba(255,40,120,0.35)", borderStyle: "solid", ...pos, pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1040px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <Link to="/tournaments" style={{ display: "inline-flex", color: "rgba(255,40,120,0.78)", textDecoration: "none", fontSize: "12px", letterSpacing: "0.14em", marginBottom: "28px", textTransform: "uppercase" }}>
          Back to tournaments
        </Link>

        <div style={{ ...panelStyle, marginBottom: "30px" }}>
          <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
          <span style={{ position: "absolute", bottom: 0, left: 0, width: "10px", height: "10px", borderBottom: "1px solid rgba(255,40,120,0.55)", borderLeft: "1px solid rgba(255,40,120,0.55)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap", marginBottom: "42px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
                ARENA / TOURNAMENT
              </div>
              <h1 style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
                {tournament.name}<span style={{ color: ACCENT }}>.</span>
              </h1>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link to={`/tournaments/${tournament.id}/bracket`} style={{ ...actionButton, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}>
                  View bracket
                </Link>
                <button onClick={handleWatch} style={{ ...actionButton, background: "rgba(255,40,120,0.1)", border: "1px solid rgba(255,40,120,0.45)", color: ACCENT }}>
                  {watching ? "Unwatch" : "Watch"}
                </button>
              </div>

              {user?.role === "admin" && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {tournament.status === "upcoming" && (
                    <button onClick={handleLockRegistrations} style={{ ...actionButton, padding: "10px 16px", background: "rgba(255,40,120,0.1)", border: "1px solid rgba(255,40,120,0.45)", color: ACCENT }}>
                      Lock registrations
                    </button>
                  )}
                  <Link to={`/admin/tournaments/${tournament.id}/edit`} style={{ ...actionButton, padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
                    Edit
                  </Link>
                  <button onClick={handleDelete} style={{ ...actionButton, padding: "10px 16px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)", color: "rgba(255,130,130,0.9)" }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(220px, 1fr))", gap: "26px 54px" }}>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>FORMAT</div><div style={valueStyle}>{tournament.format.replace(/_/g, " ")}</div></div>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>STATUS</div><StatusBadge status={tournament.status} /></div>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>MAX TEAMS</div><div style={valueStyle}>{tournament.max_teams}</div></div>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>PRIZE POOL</div><div style={valueStyle}>${tournament.prize_pool ?? 0}</div></div>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>REGISTRATION DEADLINE</div><div style={valueStyle}>{new Date(tournament.registration_deadline).toLocaleString()}</div></div>
            <div><div style={{ ...labelStyle, marginBottom: "8px" }}>START DATE</div><div style={valueStyle}>{new Date(tournament.start_date).toLocaleString()}</div></div>
          </div>
        </div>

        {registrationOpen && availableTeams.length > 0 && (
          <div style={{ ...panelStyle, marginBottom: "30px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>REGISTRATION</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 22px" }}>Register a Team<span style={{ color: ACCENT }}>.</span></h2>
            {eligibleTeams.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>
                Your teams do not have enough members. This tournament requires at least {requiredMembers} members.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>
                <select value={selectedTeam} onChange={(e) => setSelectedTeam(parseInt(e.target.value, 10))} style={{ ...inputStyle, flex: 1 }}>
                  <option value={0}>Select team...</option>
                  {eligibleTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.tag}){requiredMembers ? ` - ${Number(t.members_count) || 0}/${requiredMembers} members` : ""}
                    </option>
                  ))}
                </select>
                <button onClick={handleRegister} disabled={registering || !selectedTeam} style={{ ...actionButton, background: "rgba(255,40,120,0.1)", border: "1px solid rgba(255,40,120,0.45)", color: ACCENT, opacity: registering || !selectedTeam ? 0.45 : 1, cursor: registering || !selectedTeam ? "not-allowed" : "pointer" }}>
                  {registering ? "Registering..." : "Register"}
                </button>
              </div>
            )}
          </div>
        )}

        {!registrationOpen && (
          <div style={{ ...panelStyle, marginBottom: "30px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>REGISTRATION</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 12px" }}>Registration closed<span style={{ color: ACCENT }}>.</span></h2>
            <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>{registrationClosedReason}</p>
          </div>
        )}

        <div style={panelStyle}>
          <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>TEAMS</div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 22px" }}>Registered Teams ({registrations.length})<span style={{ color: ACCENT }}>.</span></h2>
          {registrations.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.35)", margin: 0 }}>No teams registered yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead style={{ textAlign: "left" }}>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ ...labelStyle, padding: "12px 0" }}>TEAM ID</th>
                  <th style={{ ...labelStyle, padding: "12px 0" }}>STATUS</th>
                  <th style={{ ...labelStyle, padding: "12px 0" }}>REGISTERED AT</th>
                  {user?.role === "admin" && <th style={{ ...labelStyle, padding: "12px 0" }}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.team_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "12px 0", fontWeight: 700 }}>{r.team_id}</td>
                    <td style={{ padding: "12px 0" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "12px 0", color: "#fff", fontWeight: 600 }}>{new Date(r.registered_at).toLocaleString()}</td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "12px 0", display: "flex", gap: "8px" }}>
                        {r.status !== "confirmed" && (
                          <button onClick={() => handleUpdateStatus(r.team_id, "confirmed")} style={{ padding: "8px 12px", background: "rgba(255,40,120,0.1)", border: "1px solid rgba(255,40,120,0.35)", color: ACCENT, cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}>
                            Confirm
                          </button>
                        )}
                        {r.status !== "disqualified" && (
                          <button onClick={() => handleUpdateStatus(r.team_id, "disqualified")} style={{ padding: "8px 12px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.35)", color: "rgba(255,130,130,0.95)", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}>
                            Disqualify
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
