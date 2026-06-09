import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";
import { MatchesAPIService, type Match } from "../api_services/matches/MatchesAPIService";
import { StatusBadge } from "../components/ui/UI";

export default function WatchlistPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [resultsByTournament, setResultsByTournament] = useState<Record<number, Match[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("/api/v1/tournaments/watchlist/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const watched = res.data.data ?? [];
        setTournaments(watched);

        const resultEntries = await Promise.all(
          watched.map(async (tournament: Tournament) => {
            try {
              const matches = await MatchesAPIService.getByTournament(tournament.id);
              const latestResults = matches
                .filter((match) => match.status === "completed")
                .sort((a, b) => {
                  const aTime = new Date(a.updated_at ?? a.created_at).getTime();
                  const bTime = new Date(b.updated_at ?? b.created_at).getTime();
                  return bTime - aTime;
                })
                .slice(0, 3);
              return [tournament.id, latestResults] as const;
            } catch {
              return [tournament.id, []] as const;
            }
          }),
        );
        setResultsByTournament(Object.fromEntries(resultEntries));
      } catch {
        setTournaments([]);
        setResultsByTournament({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUnwatch = async (tournamentId: number) => {
    setRemovingId(tournamentId);
    setMessage("");
    try {
      await TournamentsAPIService.unwatch(tournamentId);
      setTournaments((current) => current.filter((tournament) => tournament.id !== tournamentId));
      setResultsByTournament((current) => {
        const next = { ...current };
        delete next[tournamentId];
        return next;
      });
      setMessage("Successfully removed from watchlist");
    } catch {
      setMessage("Failed to remove from watchlist");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100%", padding: "32px", fontFamily: "Inter,Arial,sans-serif", color: "#fff" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
        ARENA / WATCHLIST
      </div>

      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>
        My Watchlist<span style={{ color: "rgba(255,40,120,0.9)" }}>.</span>
      </h1>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "32px" }}>
        Tournaments you're tracking.
      </p>

      {message && (
        <p style={{ color: message.includes("Successfully") ? "rgba(80,255,160,0.9)" : "rgba(255,100,100,0.9)", marginBottom: "18px" }}>
          {message}
        </p>
      )}

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : tournaments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)" }}>You aren't watching any tournaments yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tournaments.map((t) => (
            <div
              key={t.id}
              style={{
                position: "relative",
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                textDecoration: "none",
                color: "#fff",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,40,120,0.4)";
                e.currentTarget.style.background = "rgba(255,40,120,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255,40,120,0.65)", borderLeft: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "8px", borderTop: "1px solid rgba(255,40,120,0.65)", borderRight: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255,40,120,0.65)", borderLeft: "1px solid rgba(255,40,120,0.65)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "8px", height: "8px", borderBottom: "1px solid rgba(255,40,120,0.65)", borderRight: "1px solid rgba(255,40,120,0.65)" }} />

              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,40,120,0.7)", marginBottom: "8px" }}>
                {t.format.toUpperCase().replace(/_/g, " ")}
              </div>
              <Link to={`/tournaments/${t.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.3px" }}>{t.name}</h2>
              </Link>
              <div style={{ marginTop: "12px" }}>
                <StatusBadge status={t.status} />
              </div>

              <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
                  LATEST RESULTS
                </div>
                {(resultsByTournament[t.id] ?? []).length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "12px" }}>No completed results yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {resultsByTournament[t.id].map((match) => (
                      <Link
                        key={match.id}
                        to={`/matches/${match.id}`}
                        style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "center", color: "#fff", textDecoration: "none", fontSize: "12px" }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.72)" }}>Match #{match.match_number}</span>
                        <span style={{ color: "rgba(255,40,120,0.9)", fontWeight: 700 }}>
                          {match.team1_score ?? "-"} : {match.team2_score ?? "-"}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleUnwatch(t.id)}
                disabled={removingId === t.id}
                style={{
                  marginTop: "18px",
                  padding: "9px 14px",
                  background: "rgba(255,40,120,0.12)",
                  border: "1px solid rgba(255,40,120,0.45)",
                  color: "#fff",
                  cursor: removingId === t.id ? "not-allowed" : "pointer",
                  opacity: removingId === t.id ? 0.6 : 1,
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                }}
              >
                {removingId === t.id ? "Removing..." : "Unwatch"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
