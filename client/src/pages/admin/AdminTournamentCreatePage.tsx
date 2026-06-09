import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TournamentsAPIService } from "../../api_services/tournaments/TournamentsAPIService";

export default function AdminTournamentCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<number>(1);
  const [format, setFormat] = useState("single_elimination");
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [prizePool, setPrizePool] = useState<number>(0);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await TournamentsAPIService.create({
        name,
        game_id: gameId,
        format,
        max_teams: maxTeams,
        prize_pool: prizePool,
        registration_deadline: registrationDeadline,
        start_date: startDate,
      });
      navigate("/tournaments");
    } catch {
      setError("Failed to create tournament");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Tournament</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Game ID</label>
          <input
            type="number"
            value={gameId}
            onChange={(e) => setGameId(parseInt(e.target.value, 10))}
            required
            min={1}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          >
            <option value="single_elimination">Single elimination</option>
            <option value="double_elimination">Double elimination</option>
            <option value="round_robin">Round robin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Max teams</label>
          <input
            type="number"
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value, 10))}
            required
            min={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Prize pool ($)</label>
          <input
            type="number"
            value={prizePool}
            onChange={(e) => setPrizePool(parseFloat(e.target.value))}
            min={0}
            step={0.01}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Registration deadline</label>
          <input
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Start date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded font-semibold"
        >
          {submitting ? "Creating..." : "Create tournament"}
        </button>
      </form>
    </div>
  );
}