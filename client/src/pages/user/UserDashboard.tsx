import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const tiles = [
  { label: "Tournaments", sub: "Browse events, brackets and prizes", path: "/tournaments", stat: "Live board" },
  { label: "Teams", sub: "Create squads and manage invites", path: "/teams", stat: "Roster hub" },
  { label: "Watchlist", sub: "Follow tournaments and latest results", path: "/watchlist", stat: "Tracked" },
  { label: "Games", sub: "Explore supported game titles", path: "/games", stat: "Library" }
];

export default function UserDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-7 text-white">
      <section className="rounded-[32px] border border-cyan-200/12 bg-gradient-to-br from-cyan-300/[0.10] via-white/[0.035] to-violet-300/[0.10] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">player / overview</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Welcome, {user?.gamer_tag}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Your control center for tournaments, team management, game discovery and followed events.</p>
          </div>
          <div className="rounded-3xl border border-cyan-200/14 bg-[#061423]/70 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(78,231,255,0.75)]" />
              <div><p className="m-0 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">session</p><p className="m-0 text-sm font-black text-cyan-50">Online</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="pg-card p-5"><p className="m-0 text-3xl font-black text-cyan-100">01</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">browse</p></div>
        <div className="pg-card p-5"><p className="m-0 text-3xl font-black text-violet-100">02</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">manage</p></div>
        <div className="pg-card p-5"><p className="m-0 text-3xl font-black text-cyan-100">03</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">compete</p></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.path} className="group rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5 text-white no-underline transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.045]">
            <div className="mb-5 flex items-center justify-between"><span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">{tile.stat}</span><span className="text-xl text-cyan-100/50 transition group-hover:translate-x-1">→</span></div>
            <h2 className="m-0 text-2xl font-black tracking-tight group-hover:text-cyan-50">{tile.label}</h2><p className="mt-3 text-sm leading-6 text-white/45">{tile.sub}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
