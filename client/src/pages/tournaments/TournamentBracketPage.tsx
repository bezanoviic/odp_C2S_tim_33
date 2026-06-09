import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MatchesAPIService, type Match } from "../../api_services/matches/MatchesAPIService";
import { TeamsAPIService } from "../../api_services/teams/TeamsAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { StatusBadge } from "../../components/ui/UI";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

const controlStyle: React.CSSProperties = {
  background: "#07050f",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  padding: "12px 14px",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
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

export default function TournamentBracketPage() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseInt(id ?? "0", 10);
  const { user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teamNames, setTeamNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [roundFilter, setRoundFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await MatchesAPIService.getByTournament(tournamentId);
      setMatches(data);

      const ids = new Set<number>();
      data.forEach((m) => {
        if (m.team1_id) ids.add(m.team1_id);
        if (m.team2_id) ids.add(m.team2_id);
      });

      const names: Record<number, string> = {};
      await Promise.all(
        Array.from(ids).map(async (teamId) => {
          const r = await TeamsAPIService.getTeam(teamId);
          if (r.success && r.data) names[teamId] = `${r.data.name} (${r.data.tag})`;
        }),
      );
      setTeamNames(names);
    } catch {
      setError("Failed to load bracket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const handleGenerate = async () => {
    if (!confirm("Generate bracket? This will create all matches from confirmed teams.")) return;
    setGenerating(true);
    try {
      await MatchesAPIService.generateBracket(tournamentId);
      await load();
    } catch {
      alert("Bracket generation failed. Make sure there are at least 2 confirmed teams.");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (statusFilter && m.status !== statusFilter) return false;
      if (roundFilter && String(m.round_number) !== roundFilter) return false;
      if (teamFilter) {
        const t = parseInt(teamFilter, 10);
        if (m.team1_id !== t && m.team2_id !== t) return false;
      }
      return true;
    });
  }, [matches, statusFilter, roundFilter, teamFilter]);

  const rounds = useMemo(() => {
    const map = new Map<number, Match[]>();
    filtered.forEach((m) => {
      if (!map.has(m.round_number)) map.set(m.round_number, []);
      map.get(m.round_number)!.push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const teamLabel = (teamId: number | null) =>
    teamId == null ? "TBD" : teamNames[teamId] ?? `Team #${teamId}`;

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading bracket...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1180px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", marginBottom: "34px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
              ARENA / BRACKET
            </div>
            <h1 style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
              Tournament bracket<span style={{ color: ACCENT }}>.</span>
            </h1>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.38)", fontSize: "13px" }}>Tournament #{tournamentId}</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link to={`/tournaments/${tournamentId}`} style={{ ...actionStyle, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}>
              Tournament details
            </Link>
            {user?.role === "admin" && (
              <button onClick={handleGenerate} disabled={generating} style={{ ...actionStyle, opacity: generating ? 0.45 : 1, cursor: generating ? "not-allowed" : "pointer" }}>
                {generating ? "Generating..." : matches.length > 0 ? "Regenerate bracket" : "Generate bracket"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: "18px", padding: "12px 14px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", color: "rgba(255,130,130,0.9)", fontSize: "12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "30px" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={controlStyle}>
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)} style={controlStyle}>
            <option value="">All rounds</option>
            {Array.from(new Set(matches.map((m) => m.round_number)))
              .sort((a, b) => a - b)
              .map((r) => (
                <option key={r} value={r}>Round {r}</option>
              ))}
          </select>
          <input type="number" placeholder="Filter by team ID" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={{ ...controlStyle, width: "190px" }} />
          {(statusFilter || roundFilter || teamFilter) && (
            <button
              onClick={() => {
                setStatusFilter("");
                setRoundFilter("");
                setTeamFilter("");
              }}
              style={{ ...actionStyle, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
            >
              Clear
            </button>
          )}
        </div>

        {matches.length === 0 ? (
          <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px" }}>
            <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
            <p style={{ margin: 0, color: "rgba(255,255,255,0.58)", fontSize: "14px" }}>
              No matches yet. {user?.role === "admin"
                ? "Generate the bracket once confirmed teams are ready."
                : "Bracket has not been generated yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {rounds.map(([round, list]) => (
              <section key={round} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "18px 20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>ROUND {round}</div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {list.map((m) => (
                    <li key={m.id} style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(7,5,15,0.65)" }}>
                      <Link to={`/matches/${m.id}`} style={{ display: "block", padding: "14px", color: "#fff", textDecoration: "none" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <span>MATCH #{m.match_number}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                          <span style={{ color: m.winner_team_id === m.team1_id ? ACCENT : "#fff", fontWeight: m.winner_team_id === m.team1_id ? 800 : 600 }}>
                            {teamLabel(m.team1_id)}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                            {m.team1_score ?? "-"} : {m.team2_score ?? "-"}
                          </span>
                          <span style={{ textAlign: "right", color: m.winner_team_id === m.team2_id ? ACCENT : "#fff", fontWeight: m.winner_team_id === m.team2_id ? 800 : 600 }}>
                            {teamLabel(m.team2_id)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
