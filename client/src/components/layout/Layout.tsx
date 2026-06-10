import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

const userNav = [
  { to: "/dashboard", label: "Overview" },
  { to: "/games", label: "Games" },
  { to: "/teams", label: "Teams" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/watchlist", label: "Watchlist" },
];

const adminNav = [
  { to: "/admin", label: "Command" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/games", label: "Games" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/admin/registrations", label: "Registrations" },
  { to: "/admin/health", label: "Health" },
  { to: "/admin/audit", label: "Audit" },
  { to: "/watchlist", label: "Watchlist" },
];

const guestNav = [
  { to: "/games", label: "Games" },
  { to: "/tournaments", label: "Tournaments" },
];

function OrbLogo() {
  return (
    <div className="relative h-11 w-11 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_28px_rgba(78,231,255,0.14)]">
      <div className="absolute inset-2 rounded-xl border border-violet-300/30" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200" />
      <div className="absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cyan-200/45" />
      <div className="absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-violet-200/45" />
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isGuest = !user;
  const nav = isGuest ? guestNav : user?.role === "admin" ? adminNav : userNav;
  const home = isGuest ? "/tournaments" : user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="pg-shell">
      <header className="sticky top-0 z-40 border-b border-cyan-200/10 bg-[#07111f]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => navigate(home)} className="group flex items-center gap-3 text-left" aria-label="PulseGrid home">
            <OrbLogo />
            <div className="hidden sm:block">
              <p className="m-0 text-sm font-black tracking-[0.28em] text-white">PULSEGRID</p>
              <p className="m-0 text-[10px] uppercase tracking-[0.24em] text-cyan-200/50">
                {isGuest ? "public arena" : user?.role === "admin" ? "admin control" : "player hub"}
              </p>
            </div>
          </button>

          <nav className="ml-0 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-2xl border border-white/6 bg-white/[0.025] p-1 sm:ml-4">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end className="shrink-0 no-underline">
                {({ isActive }) => (
                  <span className={`block rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? "bg-cyan-300/14 text-white shadow-[inset_0_0_0_1px_rgba(78,231,255,0.28)]"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                  }`}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200/80">
              <span className="h-2 w-2 rounded-full bg-lime-200 shadow-[0_0_18px_rgba(185,255,102,0.7)]" />
              online
            </span>
            {isGuest ? (
              <button onClick={() => navigate("/login")} className="pg-button px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] px-2 py-2">
                <NavLink to={`/users/${user?.id}`} className="flex items-center gap-2 no-underline">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100">
                    {user?.gamer_tag?.[0]?.toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate text-xs font-semibold text-white/75">{user?.gamer_tag}</span>
                </NavLink>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="rounded-xl border border-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/42 transition hover:border-red-300/25 hover:text-red-200"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <main className="min-w-0">
          <div className="pg-panel min-h-[calc(100vh-116px)] rounded-[34px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-30 lg:hidden">
        {isGuest ? (
          <button onClick={() => navigate("/login")} className="pg-button px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Sign in</button>
        ) : (
          <button onClick={() => { logout(); navigate("/login"); }} className="pg-button px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Exit</button>
        )}
      </div>
    </div>
  );
}
