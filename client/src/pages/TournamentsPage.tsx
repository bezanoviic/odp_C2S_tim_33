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

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const filters: { status?: string; format?: string } = {};
    if (status) filters.status = status;
    if (format) filters.format = format;
    TournamentsAPIService.getAll(filters)
      .then((data) => mounted && setTournaments(data))
      .catch(() => mounted && setTournaments([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [status, format]);

  return (
    <div className="space-y-7 text-white">
      <section className="rounded-[32px] border border-violet-200/12 bg-gradient-to-br from-violet-300/[0.10] via-white/[0.035] to-cyan-300/[0.10] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-violet-100/60">arena / tournaments</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Tournament Board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Filter events, view prizes, and open tournament details from one clean board.</p>
          </div>
          {user?.role === "admin" && (
            <Link to="/admin/tournaments/new" className="pg-button px-5 py-3 text-xs font-black uppercase tracking-[0.2em] no-underline">+ Create Tournament</Link>
          )}
        </div>
      </section>

      <section className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.025] p-4 sm:grid-cols-2 lg:w-fit">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="pg-input min-w-[220px]">
          <option value="">ALL STATUSES</option>
          <option value="upcoming">UPCOMING</option>
          <option value="ongoing">ONGOING</option>
          <option value="completed">COMPLETED</option>
          <option value="cancelled">CANCELLED</option>
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="pg-input min-w-[240px]">
          <option value="">ALL FORMATS</option>
          <option value="single_elimination">SINGLE ELIMINATION</option>
          <option value="double_elimination">DOUBLE ELIMINATION</option>
          <option value="round_robin">ROUND ROBIN</option>
        </select>
      </section>

      {loading ? (
        <p className="text-white/45">Loading...</p>
      ) : tournaments.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-violet-200/18 p-10 text-center text-white/40">No tournaments found.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/tournaments/${t.id}`} className="group rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5 text-white no-underline transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.045]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-violet-200/14 bg-violet-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100/75">{t.format.replace(/_/g, " ")}</span>
                <StatusBadge status={t.status} />
              </div>
              <h2 className="m-0 text-2xl font-black tracking-tight group-hover:text-cyan-50">{t.name}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-[#061423]/60 p-3"><p className="m-0 text-lg font-black">{t.max_teams}</p><p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">max teams</p></div>
                <div className="rounded-2xl border border-white/8 bg-[#061423]/60 p-3"><p className="m-0 text-lg font-black text-cyan-100">${t.prize_pool ?? 0}</p><p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">prize pool</p></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
