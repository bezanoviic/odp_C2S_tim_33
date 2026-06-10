import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { gamesApi } from "../api_services/games/GamesAPIService";
import type { GameDto } from "../models/game/GameTypes";

export default function GamesPage() {
  const [games, setGames] = useState<GameDto[]>([]);
  const [genre, setGenre] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamesApi.getAll()
      .then((res) => {
        if (res.success && res.data) setGames(res.data);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => Array.from(new Set(games.map((g) => g.genre).filter(Boolean))), [games]);
  const teamSizes = useMemo(() => Array.from(new Set(games.map((g) => g.max_players_per_team))).sort((a, b) => a - b), [games]);

  const filteredGames = games.filter((game) => {
    const matchesGenre = !genre || game.genre === genre;
    const matchesTeamSize = !teamSize || String(game.max_players_per_team) === teamSize;
    return matchesGenre && matchesTeamSize;
  });

  return (
    <div className="space-y-7 text-white">
      <section className="rounded-[32px] border border-violet-200/12 bg-gradient-to-br from-violet-300/[0.10] via-white/[0.035] to-cyan-300/[0.10] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-violet-100/60">arena / games</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Games Board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Browse supported games, team sizes, and active tournaments in the same board layout as tournaments.</p>
          </div>
          <div className="rounded-[24px] border border-cyan-200/12 bg-[#061423]/70 px-5 py-4 text-right">
            <p className="m-0 text-3xl font-black text-cyan-100">{games.reduce((sum, game) => sum + (game.active_tournaments_count ?? 0), 0)}</p>
            <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">active tournaments</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.025] p-4 sm:grid-cols-2 lg:w-fit">
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="pg-input min-w-[220px]">
          <option value="">ALL GENRES</option>
          {genres.map((g) => <option key={g} value={g}>{g.toUpperCase()}</option>)}
        </select>
        <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="pg-input min-w-[240px]">
          <option value="">ALL TEAM SIZES</option>
          {teamSizes.map((size) => <option key={size} value={size}>{size} PLAYERS PER TEAM</option>)}
        </select>
      </section>

      {loading ? (
        <p className="text-white/45">Loading...</p>
      ) : filteredGames.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-violet-200/18 p-10 text-center text-white/40">No games found.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredGames.map((game) => (
            <article key={game.id} className="group rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5 text-white transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.045]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-violet-200/14 bg-violet-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100/75">{game.genre}</span>
                <span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">{game.max_players_per_team}v{game.max_players_per_team}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-cyan-200/14 bg-[#061423]/70">
                  {game.logo ? <img src={game.logo} alt="" className="h-full w-full object-contain p-3" /> : <span className="text-2xl text-cyan-100/45">◇</span>}
                </div>
                <div className="min-w-0">
                  <h2 className="m-0 text-2xl font-black tracking-tight group-hover:text-cyan-50">{game.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">{game.active_tournaments_count ?? 0} active tournament{(game.active_tournaments_count ?? 0) === 1 ? "" : "s"}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-[#061423]/60 p-3">
                  <p className="m-0 text-lg font-black">{game.max_players_per_team}</p>
                  <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">team size</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-[#061423]/60 p-3">
                  <p className="m-0 text-lg font-black text-cyan-100">{game.tournaments.length}</p>
                  <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">listed events</p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Tournaments</p>
                {game.tournaments.length === 0 ? (
                  <p className="m-0 rounded-2xl border border-white/8 bg-[#061423]/50 px-3 py-3 text-sm text-white/35">No tournaments for this game.</p>
                ) : (
                  <div className="space-y-2">
                    {game.tournaments.slice(0, 3).map((t) => (
                      <Link key={t.id} to={`/tournaments/${t.id}`} className="flex items-center justify-between rounded-2xl border border-cyan-200/10 px-3 py-2 text-sm text-white/75 no-underline hover:border-cyan-200/28 hover:text-white">
                        <span className="truncate pr-3">{t.name}</span>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-cyan-100/45">{t.status.replace(/_/g, " ")}</span>
                      </Link>
                    ))}
                    {game.tournaments.length > 3 && <p className="m-0 text-xs text-white/35">+{game.tournaments.length - 3} more tournaments</p>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
