import { useEffect, useState } from "react";
import { gamesApi } from "../api_services/games/GamesAPIService";
import type { GameDto } from "../models/game/GameTypes";

export default function GamesPage() {
  const [games, setGames]     = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamesApi.getAll().then((res) => {
      if (res.success && res.data) setGames(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Games</h1>
      <p className="text-white/40 text-sm mb-8">Browse all available games and their active tournaments.</p>

      {loading && <p className="text-white/40">Loading...</p>}
      {!loading && games.length === 0 && <p className="text-white/40">No games available.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="bg-[#111] border border-white/8 rounded-xl p-5 flex flex-col gap-2">
            {game.logo && (
              <img src={game.logo} alt={game.name} className="w-12 h-12 rounded-lg object-cover mb-1" />
            )}
            <h2 className="text-white font-semibold text-lg">{game.name}</h2>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded w-fit">{game.genre}</span>
            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>Max players/team: {game.max_players_per_team}</span>
              <span>{game.active_tournaments_count} active tournament{game.active_tournaments_count !== 1 ? "s" : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}