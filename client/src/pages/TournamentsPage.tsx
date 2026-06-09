import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";
import { useAuth } from "../hooks/auth/useAuthHook";
import { StatusBadge } from "../components/ui/UI";

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const filters: { status?: string; format?: string } = {};
      if (status) filters.status = status;
      if (format) filters.format = format;
      const data = await TournamentsAPIService.getAll(filters);
      setTournaments(data);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, format]);

  const inputStyle: React.CSSProperties = {
    background: "#07050f",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "12px",
    outline: "none",
    fontFamily: "inherit",
    letterSpacing: "0.1em",
    colorScheme: "dark",
  };

  return (
    <div style={{ minHeight: "100%", padding: "32px", fontFamily: "Inter,Arial,sans-serif", color: "#fff" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
        ARENA / TOURNAMENTS
      </div>

      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>
        Tournaments<span style={{ color: "rgba(255,40,120,0.9)" }}>.</span>
      </h1>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "32px" }}>
        Compete. Watch. Climb the ranks.
      </p>

      {user?.role === "admin" && (
        <Link
          to="/admin/tournaments/new"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "rgba(255,40,120,0.08)",
            border: "1px solid rgba(255,40,120,0.4)",
            color: "#ff2878",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          + CREATE TOURNAMENT
        </Link>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", marginTop: "16px" }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(255,40,120,0.8)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        >
          <option value="">ALL STATUSES</option>
          <option value="upcoming">UPCOMING</option>
          <option value="ongoing">ONGOING</option>
          <option value="completed">COMPLETED</option>
          <option value="cancelled">CANCELLED</option>
        </select>

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(255,40,120,0.8)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        >
          <option value="">ALL FORMATS</option>
          <option value="single_elimination">SINGLE ELIMINATION</option>
          <option value="double_elimination">DOUBLE ELIMINATION</option>
          <option value="round_robin">ROUND ROBIN</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : tournaments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)" }}>No tournaments found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
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
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.3px" }}>{t.name}</h2>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
                <span>MAX {t.max_teams} TEAMS</span>
                <span style={{ color: "#ff2878" }}>${t.prize_pool ?? 0}</span>
              </div>

              <div style={{ marginTop: "12px" }}>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
