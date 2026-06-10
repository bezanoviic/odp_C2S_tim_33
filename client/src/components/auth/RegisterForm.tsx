import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

function AuthShell({ children }: { children: React.ReactNode }) {
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
              <p className="m-0 text-[10px] uppercase tracking-[0.24em] text-cyan-100/50">player onboarding</p>
            </div>
          </div>

          <div className="mt-16">
            <p className="mb-4 inline-flex rounded-full border border-lime-200/20 bg-lime-200/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-lime-100/80">
              registration open
            </p>
            <h1 className="max-w-md text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">Create your arena identity</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/52">Build a player profile and unlock teams, watchlists, and tournament registration.</p>
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
              <span>quick rules</span><span>valid</span>
            </div>
            <p className="m-0 text-sm leading-7 text-white/52">Gamer tag: 3–30 characters. Password: 8+ characters with uppercase and number.</p>
          </div>
        </section>

        <section className="pg-panel max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[36px] p-6 sm:p-8 lg:p-10">
          {children}
        </section>
      </div>
    </div>
  );
}

type FormState = {
  gamer_tag: string;
  full_name: string;
  email: string;
  password: string;
};

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>({ gamer_tag: "", full_name: "", email: "", password: "" });
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setProfileImage(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await authApi.register(form.gamer_tag, form.full_name, form.email, form.password, profileImage);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Registration failed"); return; }
    login(res.data);
  };

  const fields: Array<{ key: keyof FormState; label: string; type: string; placeholder: string; autoComplete: string }> = [
    { key: "gamer_tag", label: "Gamer tag", type: "text", placeholder: "Input Gamer Tag", autoComplete: "username" },
    { key: "full_name", label: "Full name", type: "text", placeholder: "Input Full Name", autoComplete: "name" },
    { key: "email", label: "Email", type: "email", placeholder: "Input Email", autoComplete: "email" },
    { key: "password", label: "Password", type: "password", placeholder: "Password", autoComplete: "new-password" },
  ];

  return (
    <AuthShell>
      <div className="mb-8">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">new player</p>
        <h2 className="text-3xl font-black tracking-tight">Create account</h2>
        <p className="mt-2 text-sm text-white/45">Start with a gamer tag, profile info, and optional avatar.</p>
      </div>

      {error && <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}

      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-2xl border border-cyan-200/14 bg-[#061423]/70 p-4">
          <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Profile image optional</span>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-cyan-200/18 bg-cyan-300/8">
              {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl text-cyan-100/35">◇</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-2xl border border-cyan-200/18 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-100/80 transition hover:border-cyan-200/40 hover:text-white">
                Choose image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <button type="button" onClick={() => { setProfileImage(undefined); setImagePreview(null); }} className="rounded-2xl border border-red-300/14 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-100/70 transition hover:border-red-300/30 hover:text-red-100">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {fields.map(({ key, label, type, placeholder, autoComplete }) => (
          <label key={key} className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-white/38">{label}</span>
            <input className="pg-input" type={type} value={form[key]} onChange={set(key)} required placeholder={placeholder} autoComplete={autoComplete} />
          </label>
        ))}

        <button type="submit" disabled={loading} className="pg-button w-full px-5 py-4 text-xs font-black uppercase tracking-[0.22em]">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/28">or</span><span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a className="rounded-2xl border border-cyan-200/14 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-cyan-100/75 no-underline transition hover:border-cyan-200/35 hover:text-white" href="/login">Sign in</a>
        <a className="rounded-2xl border border-white/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white/50 no-underline transition hover:border-white/20 hover:text-white" href="/tournaments">Browse as guest</a>
      </div>
    </AuthShell>
  );
}
