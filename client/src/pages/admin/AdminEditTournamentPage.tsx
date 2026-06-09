import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TournamentsAPIService } from "../../api_services/tournaments/TournamentsAPIService";

const POWERS_OF_TWO = [2, 4, 8, 16, 32, 64, 128, 256];

export default function AdminTournamentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<number>(1);
  const [format, setFormat] = useState("single_elimination");
  const [status, setStatus] = useState("upcoming");
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [prizePool, setPrizePool] = useState<number>(0);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const t = await TournamentsAPIService.getById(parseInt(id, 10));
        setName(t.name);
        setGameId(t.game_id);
        setFormat(t.format);
        setStatus(t.status);
        setMaxTeams(t.max_teams);
        setPrizePool(t.prize_pool ?? 0);
        setRegistrationDeadline(t.registration_deadline.slice(0, 16));
        setStartDate(t.start_date.slice(0, 16));
      } catch {
        setError("Tournament not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const validate = (): string | null => {
    if (!name || name.length < 3 || name.length > 120) return "Name must be 3–120 characters";
    if (!["single_elimination", "double_elimination", "round_robin"].includes(format)) return "Invalid format";
    if (!["upcoming", "ongoing", "completed", "cancelled"].includes(status)) return "Invalid status";
    if (maxTeams < 2 || maxTeams > 256) return "Max teams must be between 2 and 256";
    if (!POWERS_OF_TWO.includes(maxTeams)) return "Max teams must be a power of 2 (2, 4, 8, 16, 32...)";
    if (prizePool < 0) return "Prize pool cannot be negative";
    if (!registrationDeadline || !startDate) return "Dates required";
    if (new Date(startDate) <= new Date(registrationDeadline)) return "Start date must be after registration deadline";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      await TournamentsAPIService.update(parseInt(id!, 10), {
        name, game_id: gameId, format, max_teams: maxTeams,
        status,
        prize_pool: prizePool,
        registration_deadline: registrationDeadline,
        start_date: startDate,
      });
      navigate(`/tournaments/${id}`);
    } catch {
      setError("Failed to update tournament");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading...</div>;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#07050f",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    colorScheme: "dark",
  };

  return (
    <div style={{ padding: "32px", fontFamily: "Inter,Arial,sans-serif", color: "#fff", maxWidth: "720px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,40,120,0.7)", marginBottom: "12px" }}>
        ARENA / TOURNAMENTS / EDIT
      </div>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "24px" }}>
        Edit Tournament<span style={{ color: "rgba(255,40,120,0.9)" }}>.</span>
      </h1>

      {error && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", color: "rgba(255,130,130,0.9)", fontSize: "12px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>NAME</div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>GAME ID</div>
          <input type="number" value={gameId} onChange={(e) => setGameId(parseInt(e.target.value, 10))} min={1} required style={inputStyle} />
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>FORMAT</div>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputStyle}>
            <option value="single_elimination">Single elimination</option>
            <option value="double_elimination">Double elimination</option>
            <option value="round_robin">Round robin</option>
          </select>
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>STATUS</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>MAX TEAMS</div>
          <input type="number" value={maxTeams} onChange={(e) => setMaxTeams(parseInt(e.target.value, 10))} min={2} max={256} required style={inputStyle} />
          <div style={{ marginTop: "6px", fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>Must be a power of two: 2, 4, 8, 16, 32...</div>
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>PRIZE POOL ($)</div>
          <input type="number" value={prizePool} onChange={(e) => setPrizePool(parseFloat(e.target.value))} min={0} step={0.01} style={inputStyle} />
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>REGISTRATION DEADLINE</div>
          <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>START DATE</div>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "12px",
            padding: "14px",
            background: "rgba(255,40,120,0.08)",
            border: "1px solid rgba(255,40,120,0.4)",
            color: "#ff2878",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.4 : 1,
          }}
        >
          {submitting ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </form>
    </div>
  );
}
