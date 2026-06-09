import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";
import { useAuth } from "../hooks/auth/useAuthHook";

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [status, setStatus] = useState<string>("");
  const [format, setFormat] = useState<string>("");
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

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Tournaments</h1>

      {user?.role === "admin" && (
        <Link
          to="/admin/tournaments/new"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
        >
          + Create Tournament
        </Link>
      )}

      <div className="flex gap-4 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="registration_open">Registration open</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="">All formats</option>
          <option value="single_elimination">Single elimination</option>
          <option value="double_elimination">Double elimination</option>
          <option value="round_robin">Round robin</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-zinc-400">No tournaments found.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              to={`/tournaments/${t.id}`}
              key={t.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-600 transition"
            >
              <h2 className="text-xl font-semibold mb-2">{t.name}</h2>
              <p className="text-sm text-zinc-400 mb-1">Format: {t.format}</p>
              <p className="text-sm text-zinc-400 mb-1">Max teams: {t.max_teams}</p>
              <p className="text-sm text-zinc-400 mb-1">Prize: ${t.prize_pool ?? 0}</p>
              <p className="text-sm">
                Status: <span className="text-blue-400">{t.status}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}