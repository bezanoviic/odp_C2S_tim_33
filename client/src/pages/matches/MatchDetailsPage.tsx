import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MatchesAPIService,
  type Match,
  type MatchPlayer,
} from "../../api_services/matches/MatchesAPIService";
import { TeamsAPIService } from "../../api_services/teams/TeamsAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { StatusBadge } from "../../components/ui/UI";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

const panelStyle: React.CSSProperties = {
  position: "relative",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "24px 28px",
};

const actionStyle: React.CSSProperties = {
  padding: "12px 18px",
  background: "rgba(255,40,120,0.1)",
  border: "1px solid rgba(255,40,120,0.45)",
  color: ACCENT,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textDecoration: "none",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "76px",
  background: "#07050f",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "10px 12px",
  color: "#fff",
  fontSize: "15px",
  outline: "none",
  fontFamily: "inherit",
};

type TeamInfo = { id: number; name: string; tag: string };
type MemberOption = { user_id: number; gamer_tag: string; team_id: number };

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const matchId = parseInt(id ?? "0", 10);
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [team1, setTeam1] = useState<TeamInfo | null>(null);
  const [team2, setTeam2] = useState<TeamInfo | null>(null);
  const [team1Members, setTeam1Members] = useState<MemberOption[]>([]);
  const [team2Members, setTeam2Members] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [team1Score, setTeam1Score] = useState<string>("");
  const [team2Score, setTeam2Score] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    let m: Match;
    try {
      m = await MatchesAPIService.getById(matchId);
    } catch (err) {
      console.error("getById failed", err);
      setError("Match not found");
      setLoading(false);
      return;
    }

    setMatch(m);
    setTeam1Score(m.team1_score?.toString() ?? "");
    setTeam2Score(m.team2_score?.toString() ?? "");

    try {
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch (err) {
      console.error("getPlayers failed", err);
      setPlayers([]);
    }

    if (m.team1_id) {
      try {
        const r = await TeamsAPIService.getTeam(m.team1_id);
        if (r.success && r.data) setTeam1({ id: r.data.id, name: r.data.name, tag: r.data.tag });
      } catch (err) { console.error("getTeam1 failed", err); }
      try {
        const members = await TeamsAPIService.getMembers(m.team1_id);
        if (members.success && members.data) {
          setTeam1Members(
            members.data.map((mm) => ({
              user_id: mm.user_id,
              gamer_tag: mm.gamer_tag ?? `User #${mm.user_id}`,
              team_id: m.team1_id!,
            })),
          );
        }
      } catch (err) { console.error("getMembers1 failed", err); }
    }
    if (m.team2_id) {
      try {
        const r = await TeamsAPIService.getTeam(m.team2_id);
        if (r.success && r.data) setTeam2({ id: r.data.id, name: r.data.name, tag: r.data.tag });
      } catch (err) { console.error("getTeam2 failed", err); }
      try {
        const members = await TeamsAPIService.getMembers(m.team2_id);
        if (members.success && members.data) {
          setTeam2Members(
            members.data.map((mm) => ({
              user_id: mm.user_id,
              gamer_tag: mm.gamer_tag ?? `User #${mm.user_id}`,
              team_id: m.team2_id!,
            })),
          );
        }
      } catch (err) { console.error("getMembers2 failed", err); }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (matchId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const handleSubmitResult = async () => {
    if (!match || match.team1_id == null || match.team2_id == null) return;
    const s1 = parseInt(team1Score, 10);
    const s2 = parseInt(team2Score, 10);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert("Enter valid non-negative integers.");
      return;
    }
    if (s1 === s2) {
      alert("Result must have a clear winner. Scores cannot be equal.");
      return;
    }
    const winner_team_id = s1 > s2 ? match.team1_id : match.team2_id;
    setSubmitting(true);
    try {
      await MatchesAPIService.updateResult(match.id, {
        team1_score: s1,
        team2_score: s2,
        winner_team_id,
      });
      await load();
    } catch {
      alert("Failed to update result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPlayer = async (userId: number, teamId: number) => {
    try {
      await MatchesAPIService.addPlayers(matchId, [{ user_id: userId, team_id: teamId }]);
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch {
      alert("Failed to add player. Only the team captain can lineup players.");
    }
  };

  const handleRemovePlayer = async (userId: number) => {
    try {
      await MatchesAPIService.removePlayer(matchId, userId);
      const pls = await MatchesAPIService.getPlayers(matchId);
      setPlayers(pls);
    } catch {
      alert("Failed to remove player. Only the team captain can edit lineup.");
    }
  };

  const teamLabel = (info: TeamInfo | null, fallbackId: number | null) =>
    info ? `${info.name} (${info.tag})` : fallbackId == null ? "TBD" : `Team #${fallbackId}`;

  const renderRoster = (
    teamInfo: TeamInfo | null,
    teamId: number | null,
    members: MemberOption[],
  ) => {
    const active = players.filter((p) => p.team_id === teamId);
    const activeIds = new Set(active.map((p) => p.user_id));
    const benched = members.filter((m) => !activeIds.has(m.user_id));

    return (
      <article style={panelStyle}>
        <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>TEAM</div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 20px" }}>{teamLabel(teamInfo, teamId)}<span style={{ color: ACCENT }}>.</span></h2>

        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
            ACTIVE IN MATCH
          </p>
          {active.length === 0 ? (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", margin: 0 }}>No players assigned yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {active.map((p) => {
                const member = members.find((m) => m.user_id === p.user_id);
                return (
                  <li key={p.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                    <span>{member?.gamer_tag ?? `User #${p.user_id}`}</span>
                    {user && (
                      <button onClick={() => handleRemovePlayer(p.user_id)} style={{ background: "transparent", border: "none", color: "rgba(255,130,130,0.9)", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}>
                        REMOVE
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {user && teamId != null && benched.length > 0 && (
          <div style={{ marginTop: "22px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
              ADD PLAYER
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {benched.map((m) => (
                <li key={m.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                  <span>{m.gamer_tag}</span>
                  <button onClick={() => handleAddPlayer(m.user_id, teamId)} style={{ background: "transparent", border: "none", color: ACCENT, cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}>
                    ADD
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    );
  };

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading match details...</div>;
  if (error || !match) {
    return (
      <div style={{ padding: "32px", color: "#fff" }}>
        <h1>Match not found</h1>
        <p>No data for match #{matchId}.</p>
        <Link style={{ color: ACCENT }} to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1180px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
              ARENA / MATCH
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 10px" }}>
              {teamLabel(team1, match.team1_id)} vs {teamLabel(team2, match.team2_id)}<span style={{ color: ACCENT }}>.</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
              <span>Match #{match.id} / Round {match.round_number} / Match {match.match_number}</span>
              <StatusBadge status={match.status} />
            </div>
          </div>
          <Link to={`/tournaments/${match.tournament_id}/bracket`} style={{ ...actionStyle, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}>
            Bracket
          </Link>
        </div>

        <section style={{ ...panelStyle, marginBottom: "30px" }}>
          <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>SCORE</div>
          <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
            {teamLabel(team1, match.team1_id)} <span style={{ color: ACCENT }}>{match.team1_score ?? "-"}</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}> : </span>
            <span style={{ color: ACCENT }}>{match.team2_score ?? "-"}</span> {teamLabel(team2, match.team2_id)}
          </div>
          {match.winner_team_id && (
            <p style={{ color: "rgba(255,255,255,0.45)", margin: "0 0 18px", fontSize: "13px" }}>
              Winner: {match.winner_team_id === match.team1_id
                ? teamLabel(team1, match.team1_id)
                : teamLabel(team2, match.team2_id)}
            </p>
          )}

          {user?.role === "admin" && match.team1_id != null && match.team2_id != null && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <input type="number" min={0} value={team1Score} onChange={(e) => setTeam1Score(e.target.value)} style={inputStyle} placeholder="0" />
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 800 }}>:</span>
              <input type="number" min={0} value={team2Score} onChange={(e) => setTeam2Score(e.target.value)} style={inputStyle} placeholder="0" />
              <button onClick={handleSubmitResult} disabled={submitting} style={{ ...actionStyle, opacity: submitting ? 0.45 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Saving..." : "Save result"}
              </button>
            </div>
          )}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {renderRoster(team1, match.team1_id, team1Members)}
          {renderRoster(team2, match.team2_id, team2Members)}
        </section>
      </div>
    </div>
  );
}
