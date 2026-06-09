import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";

type FormState = { gamer_tag: string; full_name: string; email: string; password: string };

const GRID_LINES = [1,2,3,4,5,6,7];
const DOTS: [number,number][] = [[25,25],[50,25],[75,25],[12.5,50],[37.5,50],[62.5,50],[87.5,50],[25,75],[50,75],[75,75]];
const DOT_OPACITIES = DOTS.map(() => +(Math.random() * 0.3 + 0.2).toFixed(2));

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm]               = useState<FormState>({ gamer_tag: "", full_name: "", email: "", password: "" });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be smaller than 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!/^[a-zA-Z0-9\-.]{3,30}$/.test(form.gamer_tag))
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
    const res = await authApi.register(form.gamer_tag, form.full_name, form.email, form.password, profileImage ?? undefined);
    setLoading(false);
    if (!res.success || !res.data) { setError(res.message ?? "Registration failed"); return; }
    login(res.data);
  };

  const fields: { key: keyof FormState; label: string; type: string; placeholder: string }[] = [
    { key: "gamer_tag", label: "GAMER TAG",  type: "text",     placeholder: "your.tag (3-30 chars)" },
    { key: "full_name", label: "FULL NAME",  type: "text",     placeholder: "John Doe" },
    { key: "email",     label: "EMAIL",      type: "email",    placeholder: "you@email.com" },
    { key: "password",  label: "PASSWORD",   type: "password", placeholder: "Min 8 chars, 1 uppercase, 1 digit" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    padding: "10px 0 10px 2px", color: "#fff", fontSize: "14px",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{ display:"flex", width:"100%", height:"100vh", background:"#06040f", fontFamily:"Inter,Arial,sans-serif", overflow:"hidden" }}>

      {/* LEFT PANEL */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", borderRight:"1px solid rgba(255,40,120,0.15)" }}>
        {GRID_LINES.map(i => <div key={`h${i}`} style={{ position:"absolute", left:0, right:0, top:`${i*100/8}%`, height:"1px", background:"rgba(255,255,255,0.05)" }} />)}
        {GRID_LINES.map(i => <div key={`v${i}`} style={{ position:"absolute", top:0, bottom:0, left:`${i*100/8}%`, width:"1px", background:"rgba(255,255,255,0.05)" }} />)}
        {DOTS.map(([x,y], i) => <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", width:"4px", height:"4px", borderRadius:"50%", background:`rgba(255,40,120,${DOT_OPACITIES[i]})` }} />)}

        <span style={{ position:"absolute", top:"20px", left:"20px", fontSize:"11px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.5)", fontWeight:500 }}>SYS.REG // C2S</span>
        <span style={{ position:"absolute", top:"20px", right:"20px", fontSize:"11px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.5)", fontWeight:500 }}>BUILD 2.4.1</span>
        <span style={{ position:"absolute", bottom:"44px", left:"20px", fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,40,120,0.65)", fontFamily:"monospace" }}>0xFF2878</span>
        <span style={{ position:"absolute", top:"44px", right:"20px", fontSize:"10px", letterSpacing:"0.12em", color:"rgba(255,40,120,0.65)", fontFamily:"monospace" }}>0x07050F</span>

        {([
          { top:"36px",    left:"36px",  borderWidth:"1px 0 0 1px" },
          { top:"36px",    right:"36px", borderWidth:"1px 1px 0 0" },
          { bottom:"32px", left:"36px",  borderWidth:"0 0 1px 1px" },
          { bottom:"32px", right:"36px", borderWidth:"0 1px 1px 0" },
        ] as React.CSSProperties[]).map((pos, i) => (
          <div key={i} style={{ position:"absolute", width:"14px", height:"14px", borderColor:"rgba(255,40,120,0.7)", borderStyle:"solid", ...pos }} />
        ))}

        <div style={{ position:"absolute", left:"36px", right:"36px", top:"42%", height:"1px", background:"rgba(255,40,120,0.2)" }} />
        <span style={{ position:"absolute", bottom:"16px", right:"-8px", fontSize:"120px", fontWeight:800, color:"rgba(255,255,255,0.025)", letterSpacing:"-8px", lineHeight:1, userSelect:"none" }}>07</span>

        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", width:"220px" }}>
          <span style={{ display:"block", fontSize:"10px", letterSpacing:"0.28em", color:"rgba(255,40,120,0.65)", marginBottom:"16px" }}>ARENA PLATFORM</span>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin:"0 auto 16px", display:"block" }}>
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="rgba(255,40,120,0.55)" strokeWidth="1.2"/>
            <polygon points="40,12 68,27 68,53 40,68 12,53 12,27" fill="none" stroke="rgba(255,40,120,0.2)" strokeWidth="0.6"/>
            <text x="40" y="37" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="14" fontWeight="800" fill="rgba(255,255,255,0.95)" letterSpacing="1.5">LM</text>
            <text x="40" y="53" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="14" fontWeight="800" fill="rgba(255,40,120,0.95)" letterSpacing="1.5">VG</text>
          </svg>
          <div style={{ fontSize:"26px", fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:"10px", letterSpacing:"-0.5px" }}>
            Join the<br/><span style={{ color:"rgba(255,40,120,0.9)" }}>Arena.</span>
          </div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", lineHeight:1.7 }}>
            Create your profile<br/>and start competing
          </div>
        </div>

        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#ff2878", animation:"blink 1.8s infinite" }} />
          <span style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.4)" }}>REGISTRATION OPEN</span>
          <span style={{ fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,40,120,0.55)", marginLeft:"auto" }}>▮▮▮▯ SIGNAL</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:"45%", padding:"32px 48px", display:"flex", flexDirection:"column", justifyContent:"center", background:"#07050f", borderLeft:"1px solid rgba(255,40,120,0.08)", overflowY:"auto" }}>

        <div style={{ fontSize:"10px", letterSpacing:"0.22em", color:"rgba(255,40,120,0.7)", marginBottom:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ display:"inline-block", width:"20px", height:"1px", background:"rgba(255,40,120,0.6)" }} />
          NEW PLAYER
        </div>

        <div style={{ fontSize:"26px", fontWeight:800, color:"#fff", lineHeight:1.1, letterSpacing:"-0.5px", marginBottom:"6px" }}>Create<br/>account.</div>
        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.28)", marginBottom:"22px", lineHeight:1.6 }}>Register to start competing on the platform.</div>

        {error && (
          <div style={{ marginBottom:"14px", padding:"10px 14px", border:"1px solid rgba(255,80,80,0.25)", background:"rgba(255,80,80,0.06)", color:"rgba(255,130,130,0.9)", fontSize:"12px", letterSpacing:"0.05em" }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column" }}>
          {/* Profile image upload */}
          <div style={{ marginBottom:"18px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:"8px" }}>PROFILE IMAGE (optional)</div>
            <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
              <div style={{ width:"56px", height:"56px", border:"1px solid rgba(255,40,120,0.35)", background:"rgba(255,40,120,0.08)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {imagePreview
                  ? <img src={imagePreview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <span style={{ fontSize:"20px", color:"rgba(255,40,120,0.4)" }}>◈</span>
                }
              </div>
              <label style={{ cursor:"pointer", fontSize:"11px", letterSpacing:"0.12em", color:"rgba(255,40,120,0.8)", border:"1px solid rgba(255,40,120,0.3)", padding:"7px 14px", background:"rgba(255,40,120,0.06)" }}>
                CHOOSE IMAGE
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display:"none" }} />
              </label>
              {imagePreview && (
                <button type="button" onClick={() => { setProfileImage(null); setImagePreview(null); }}
                  style={{ fontSize:"11px", color:"rgba(255,100,100,0.7)", background:"none", border:"none", cursor:"pointer", letterSpacing:"0.1em" }}>
                  REMOVE
                </button>
              )}
            </div>
          </div>

          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom:"18px" }}>
              <div style={{ fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:"8px" }}>{label}</div>
              <input
                type={type} value={form[key]} onChange={set(key)} required
                placeholder={placeholder}
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = "rgba(255,40,120,0.8)"}
                onBlur={e => e.target.style.borderBottomColor = "rgba(255,255,255,0.12)"}
              />
            </div>
          ))}

          <div style={{ position:"relative", marginTop:"10px" }}>
            {([
              { top:0,    left:0,  borderWidth:"1px 0 0 1px" },
              { top:0,    right:0, borderWidth:"1px 1px 0 0" },
              { bottom:0, left:0,  borderWidth:"0 0 1px 1px" },
              { bottom:0, right:0, borderWidth:"0 1px 1px 0" },
            ] as React.CSSProperties[]).map((pos, i) => (
              <span key={i} style={{ position:"absolute", width:"8px", height:"8px", borderColor:"rgba(255,40,120,0.65)", borderStyle:"solid", ...pos }} />
            ))}
            <button
              type="submit" disabled={loading}
              style={{ width:"100%", padding:"16px", background:"rgba(255,40,120,0.08)", border:"1px solid rgba(255,40,120,0.4)", color:"#ff2878", fontSize:"12px", fontWeight:700, letterSpacing:"0.24em", cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", opacity:loading?0.4:1, transition:"background 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { if(!loading){ const b=e.currentTarget; b.style.background="rgba(255,40,120,0.18)"; b.style.borderColor="rgba(255,40,120,0.8)"; }}}
              onMouseLeave={e => { const b=e.currentTarget; b.style.background="rgba(255,40,120,0.08)"; b.style.borderColor="rgba(255,40,120,0.4)"; }}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </div>
        </form>

        <p style={{ marginTop:"16px", fontSize:"12px", color:"rgba(255,255,255,0.22)", textAlign:"center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color:"rgba(255,40,120,0.75)", textDecoration:"none" }}>Sign in</a>
        </p>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #07050f inset !important;
          -webkit-text-fill-color: #fff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}