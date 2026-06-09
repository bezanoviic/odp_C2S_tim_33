import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TournamentsAPIService } from "../../api_services/tournaments/TournamentsAPIService";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto } from "../../models/game/GameTypes";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#07050f",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "12px 14px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  colorScheme: "dark",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>{label}</div>
      {children}
    </div>
  );
}

export default function AdminTournamentCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<number>(1);
  const [games, setGames] = useState<GameDto[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [format, setFormat] = useState("single_elimination");
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [prizePool, setPrizePool] = useState<string>("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  useEffect(() => {
    setGamesLoading(true);
    gamesApi.getAll()
      .then((res) => {
        if (res.success && res.data?.length) {
          setGames(res.data);
          setGameId(res.data[0].id);
        } else if (!res.success) {
          setError(res.message ?? "Failed to load games");
        }
      })
      .finally(() => setGamesLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Tournament name must be at least 3 characters.");
      return;
    }

    if (!Number.isInteger(maxTeams) || maxTeams < 2 || maxTeams > 256 || !isPowerOfTwo(maxTeams)) {
      setError("Max teams must be a power of 2 (2, 4, 8, 16, 32...) and between 2 and 256.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedPrizePool = prizePool.trim() === "" ? undefined : parseFloat(prizePool);

      await TournamentsAPIService.create({
        name,
        game_id: gameId,
        format,
        max_teams: maxTeams,
        prize_pool: Number.isNaN(parsedPrizePool) ? undefined : parsedPrizePool,
        registration_deadline: registrationDeadline,
        start_date: startDate,
      });
      navigate("/tournaments");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Failed to create tournament"
          : "Failed to create tournament",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
          ARENA / TOURNAMENTS / CREATE
        </div>
        <h1 style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 30px" }}>
          Create Tournament<span style={{ color: ACCENT }}>.</span>
        </h1>

        <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px" }}>
          <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
          <span style={{ position: "absolute", bottom: 0, left: 0, width: "10px", height: "10px", borderBottom: "1px solid rgba(255,40,120,0.55)", borderLeft: "1px solid rgba(255,40,120,0.55)" }} />

          {error && (
            <div style={{ marginBottom: "18px", padding: "12px 14px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", color: "rgba(255,130,130,0.9)", fontSize: "12px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <Field label="NAME">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </Field>

            <Field label="GAME">
              {gamesLoading ? (
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Loading games...</div>
              ) : games.length === 0 ? (
                <div style={{ color: "rgba(255,130,130,0.9)", fontSize: "13px" }}>No games found. Create a game first.</div>
              ) : (
                <select value={gameId} onChange={(e) => setGameId(parseInt(e.target.value, 10))} required style={inputStyle}>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name} (id: {game.id})
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="FORMAT">
              <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputStyle}>
                <option value="single_elimination">Single elimination</option>
                <option value="double_elimination">Double elimination</option>
                <option value="round_robin">Round robin</option>
              </select>
            </Field>

            <Field label="MAX TEAMS">
              <input type="number" value={maxTeams} onChange={(e) => setMaxTeams(parseInt(e.target.value, 10))} required min={2} style={inputStyle} />
              <p style={{ margin: "7px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Must be a power of two: 2, 4, 8, 16, 32...</p>
            </Field>

            <Field label="PRIZE POOL ($)">
              <input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} placeholder="Optional" min={0} step={0.01} style={inputStyle} />
            </Field>

            <Field label="REGISTRATION DEADLINE">
              <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} required style={inputStyle} />
            </Field>

            <Field label="START DATE">
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={inputStyle} />
            </Field>

            <button
              type="submit"
              disabled={submitting || gamesLoading || games.length === 0}
              style={{
                marginTop: "10px",
                padding: "15px",
                background: "rgba(255,40,120,0.1)",
                border: "1px solid rgba(255,40,120,0.45)",
                color: ACCENT,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.24em",
                fontFamily: "inherit",
                cursor: submitting || gamesLoading || games.length === 0 ? "not-allowed" : "pointer",
                opacity: submitting || gamesLoading || games.length === 0 ? 0.45 : 1,
                textTransform: "uppercase",
              }}
            >
              {submitting ? "Creating..." : "Create tournament"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
