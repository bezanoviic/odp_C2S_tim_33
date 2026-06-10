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
        const res = await axios.get("/api/v1/tournaments/watchlist/me", { headers: { Authorization: `Bearer ${token}` } });
        const watched = res.data.data ?? [];
        setTournaments(watched);
        const resultEntries = await Promise.all(watched.map(async (tournament: Tournament) => {
          try {
            const matches = await MatchesAPIService.getByTournament(tournament.id);
            return [tournament.id, matches.filter((m) => m.status === "completed").sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()).slice(0, 3)] as const;
          } catch { return [tournament.id, []] as const; }
        }));
        setResultsByTournament(Object.fromEntries(resultEntries));
      } catch {
        setTournaments([]);
        setResultsByTournament({});
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUnwatch = async (tournamentId: number) => {
    setRemovingId(tournamentId);
    setMessage("");
    try {
      await TournamentsAPIService.unwatch(tournamentId);
      setTournaments((current) => current.filter((tournament) => tournament.id !== tournamentId));
      setResultsByTournament((current) => { const next = { ...current }; delete next[tournamentId]; return next; });
      setMessage("Successfully removed from watchlist");
    } catch { setMessage("Failed to remove from watchlist"); }
    finally { setRemovingId(null); }
  };

  return (
    <div className="space-y-7 text-white">
      <section className="rounded-[32px] border border-cyan-200/12 bg-gradient-to-br from-cyan-300/[0.10] via-white/[0.035] to-emerald-300/[0.08] p-6 sm:p-8">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">player / watchlist</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Tracked Tournaments</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Keep your followed tournaments and latest match results in one place.</p>
          </div>
          <div className="rounded-3xl border border-cyan-200/14 bg-[#061423]/70 px-6 py-4 text-right"><p className="m-0 text-3xl font-black">{tournaments.length}</p><p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">watching</p></div>
        </div>
      </section>

      {message && <div className={`rounded-2xl border px-4 py-3 text-sm ${message.includes("Successfully") ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border-red-300/20 bg-red-400/10 text-red-100"}`}>{message}</div>}

      {loading ? (
        <p className="text-white/45">Loading...</p>
      ) : tournaments.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-cyan-200/18 p-10 text-center"><h2 className="m-0 text-2xl font-black">No watched tournaments yet</h2><p className="mt-2 text-white/40">Open a tournament and press watch to add it here.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tournaments.map((t) => (
            <article key={t.id} className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5 transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.045]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">{t.format.replace(/_/g, " ")}</span>
                <StatusBadge status={t.status} />
              </div>
              <Link to={`/tournaments/${t.id}`} className="text-white no-underline"><h2 className="m-0 text-2xl font-black tracking-tight hover:text-cyan-50">{t.name}</h2></Link>
              <div className="mt-5 rounded-2xl border border-white/8 bg-[#061423]/60 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Latest results</p>
                {(resultsByTournament[t.id] ?? []).length === 0 ? <p className="m-0 text-sm text-white/35">No completed results yet.</p> : (
                  <div className="space-y-2">
                    {resultsByTournament[t.id].map((match) => (
                      <Link key={match.id} to={`/matches/${match.id}`} className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2 text-sm text-white/70 no-underline hover:border-cyan-200/20 hover:text-white"><span>Match #{match.match_number}</span><strong className="text-cyan-100">{match.team1_score ?? "-"} : {match.team2_score ?? "-"}</strong></Link>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => handleUnwatch(t.id)} disabled={removingId === t.id} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/60 transition hover:border-cyan-200/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{removingId === t.id ? "Removing..." : "Unwatch"}</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
