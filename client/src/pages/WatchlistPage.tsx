import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { type Tournament } from "../api_services/tournaments/TournamentsAPIService";

export default function WatchlistPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("/api/v1/tournaments/watchlist/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTournaments(res.data.data);
      } catch {
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>

      {loading ? (
        <p>Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-zinc-400">You aren't watching any tournaments yet.</p>
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
              <p className="text-sm text-zinc-400 mb-1">Status: <span className="text-blue-400">{t.status}</span></p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}