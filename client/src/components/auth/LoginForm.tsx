import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

function AuthShell({ mode, children }: { mode: "login" | "register"; children: React.ReactNode }) {
  const title = mode === "login" ? "Return to the circuit" : "Create your arena identity";
  const copy = mode === "login"
    ? "Sign in to manage teams, follow tournaments, and continue your match flow."
    : "Build a player profile and unlock teams, watchlists, and tournament registration.";
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute left-[-10rem] top-[-10rem] h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-violet-300/20 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="pg-panel rounded-[36px] p-7 sm:p-9 lg:min-h-[640px]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-cyan-200/30 bg-cyan-200/10">
              <div className="m-3 h-6 w-6 rounded-xl border border-violet-200/35 bg-violet-200/10" />
            </div>
            <div>
              <p className="m-0 text-sm font-black tracking-[0.28em]">PULSEGRID</p>
              <p className="m-0 text-[10px] uppercase tracking-[0.24em] text-cyan-100/50">tournament control</p>
            </div>
          </div>

          <div className="mt-16">
            <p className="mb-4 inline-flex rounded-full border border-lime-200/20 bg-lime-200/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-lime-100/80">
              live season
            </p>
            <h1 className="max-w-md text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/52">{copy}</p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3">
            {[["128", "players"], ["32", "teams"], ["5", "games"]].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-cyan-200/12 bg-white/[0.035] p-4">
                <p className="m-0 text-2xl font-black text-white">{value}</p>
                <p className="m-0 mt-1 text-[10px] uppercase tracking-[0.2em] text-white/32">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[28px] border border-cyan-200/12 bg-[#04101d]/50 p-5">
            <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/48">
              <span>node route</span><span>secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="h-2 w-2 rounded-full bg-lime-200 shadow-[0_0_18px_rgba(185,255,102,0.7)]" />
              Client → API → Master/Slave grid
            </div>
          </div>
        </section>

        <section className="pg-panel rounded-[36px] p-6 sm:p-8 lg:p-10">
          {children}
        </section>
      </div>
    </div>
  );
}

export function LoginForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [gamer_tag, setGamerTag] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await authApi.login(gamer_tag, password);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Invalid credentials"); return; }
    login(res.data);
  };

  return (
    <AuthShell mode="login">
      <div className="mb-8">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">player access</p>
        <h2 className="text-3xl font-black tracking-tight">Sign in</h2>
        <p className="mt-2 text-sm text-white/45">Use your gamer tag and password.</p>
      </div>

      {error && <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Gamer tag</span>
          <input className="pg-input" value={gamer_tag} onChange={(e) => setGamerTag(e.target.value)} required autoComplete="username" placeholder="Input Gamer Tag" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Password</span>
          <input className="pg-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Password" />
        </label>
        <button type="submit" disabled={loading} className="pg-button w-full px-5 py-4 text-xs font-black uppercase tracking-[0.22em]">
          {loading ? "Signing in..." : "Enter control room"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/28">or</span><span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a className="rounded-2xl border border-cyan-200/14 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-cyan-100/75 no-underline transition hover:border-cyan-200/35 hover:text-white" href="/register">Create account</a>
        <a className="rounded-2xl border border-white/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white/50 no-underline transition hover:border-white/20 hover:text-white" href="/tournaments">Browse as guest</a>
      </div>
    </AuthShell>
  );
}
