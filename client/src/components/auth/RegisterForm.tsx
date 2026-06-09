import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

type FormState = { gamer_tag: string; full_name: string; email: string; password: string };

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm]       = useState<FormState>({ gamer_tag: "", full_name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = (): string | null => {
    if (!/^[a-zA-Z0-9\-\.]{3,30}$/.test(form.gamer_tag))
      return "Gamer tag: 3-30 chars, letters/numbers/hyphen/dot";
    if (form.full_name.trim().length < 2)
      return "Full name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Invalid email address";
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      return "Password: 8+ chars, 1 uppercase, 1 digit";
    return null;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(""); setLoading(true);
    const res = await authApi.register(form.gamer_tag, form.full_name, form.email, form.password);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Registration failed"); return; }
    login(res.data);
  };

  const fields: { key: keyof FormState; label: string; type: string; placeholder: string }[] = [
    { key: "gamer_tag",  label: "Gamer Tag",  type: "text",     placeholder: "your.tag (3-30 chars)" },
    { key: "full_name",  label: "Full Name",  type: "text",     placeholder: "John Doe" },
    { key: "email",      label: "Email",      type: "email",    placeholder: "you@email.com" },
    { key: "password",   label: "Password",   type: "password", placeholder: "Min 8 chars, 1 uppercase, 1 digit" },
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-4">
          <span className="text-white/60 text-lg">◈</span>
        </div>
        <h1 className="text-xl font-semibold text-white">Create account</h1>
        <p className="text-sm text-white/35 mt-1">Register to get started</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-white/40 mb-2 font-medium">{label}</label>
            <input
              type={type} value={form[key]} onChange={set(key)} required
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
              placeholder={placeholder} />
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="mt-2 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-white/30 text-sm mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-white/60 hover:text-white transition-colors">Sign in</a>
      </p>
    </div>
  );
}
