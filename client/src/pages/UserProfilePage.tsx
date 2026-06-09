import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ACCENT = "#ff2878";
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7];

interface UserProfile {
  id: number;
  gamer_tag: string;
  full_name: string;
  email: string;
  role: string;
  profile_image: string | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  padding: "10px 0 10px 2px", color: "#fff", fontSize: "14px",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk]       = useState(false);

  const [form, setForm] = useState({ full_name: "", gamer_tag: "", email: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null | undefined>(undefined);

  const token   = localStorage.getItem("authToken");
  const meRaw   = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const myId    = meRaw?.id ?? null;
  const isOwner = myId === parseInt(id ?? "0", 10);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(`/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data.data as UserProfile;
        setProfile(u);
        setForm({ full_name: u.full_name, gamer_tag: u.gamer_tag, email: u.email });
        setImagePreview(u.profile_image);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError("Image must be smaller than 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setProfileImage(b64);
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaveError(""); setSaveOk(false); setSaving(true);
    try {
      const body: Record<string, unknown> = {
        full_name:  form.full_name,
        gamer_tag:  form.gamer_tag,
        email:      form.email,
      };
      if (profileImage !== undefined) body.profile_image = profileImage;
      await axios.put(`/api/v1/users/${profile.id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(p => p ? { ...p, ...form, profile_image: profileImage !== undefined ? profileImage ?? null : p.profile_image } : p);
      setSaveOk(true);
      setEditing(false);
    } catch (e) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
      setSaveError(msg ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "32px", color: "#fff" }}>Loading...</div>;
  if (error || !profile) return <div style={{ padding: "32px", color: "#fff" }}>{error}</div>;

  const displayImage = imagePreview ?? profile.profile_image;

  return (
    <div style={{ minHeight: "100vh", background: "#06040f", fontFamily: "Inter,Arial,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {GRID_LINES.map(i => <div key={`h${i}`} style={{ position: "fixed", left: 0, right: 0, top: `${i * 100 / 8}%`, height: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}
      {GRID_LINES.map(i => <div key={`v${i}`} style={{ position: "fixed", top: 0, bottom: 0, left: `${i * 100 / 8}%`, width: "1px", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />)}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", margin: "0 auto", padding: "56px 32px 60px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,40,120,0.7)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "20px", height: "1px", background: "rgba(255,40,120,0.6)" }} />
          ARENA / USER PROFILE
        </div>

        <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "32px" }}>
          <span style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderTop: "1px solid rgba(255,40,120,0.55)", borderRight: "1px solid rgba(255,40,120,0.55)" }} />
          <span style={{ position: "absolute", bottom: 0, left: 0, width: "10px", height: "10px", borderBottom: "1px solid rgba(255,40,120,0.55)", borderLeft: "1px solid rgba(255,40,120,0.55)" }} />

          {/* HEADER */}
          <div style={{ display: "flex", alignItems: "center", gap: "26px", marginBottom: "34px" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: "104px", height: "104px", border: "1px solid rgba(255,40,120,0.35)", background: "rgba(255,40,120,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {displayImage
                  ? <img src={displayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "36px", fontWeight: 800, color: ACCENT }}>{profile.gamer_tag[0]?.toUpperCase()}</span>
                }
              </div>
              {editing && (
                <label style={{ position: "absolute", bottom: 0, right: 0, background: ACCENT, padding: "4px 8px", fontSize: "10px", letterSpacing: "0.1em", cursor: "pointer", fontWeight: 700 }}>
                  IMG
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {editing ? (
                <input value={form.gamer_tag} onChange={e => setForm(f => ({ ...f, gamer_tag: e.target.value }))}
                  style={{ ...inputStyle, fontSize: "28px", fontWeight: 800, marginBottom: "8px" }} placeholder="Gamer tag" />
              ) : (
                <h1 style={{ fontSize: "34px", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                  {profile.gamer_tag}<span style={{ color: ACCENT }}>.</span>
                </h1>
              )}
              {editing ? (
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  style={{ ...inputStyle, fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "12px" }} placeholder="Full name" />
              ) : (
                <div style={{ color: "rgba(255,255,255,0.42)", fontSize: "14px", marginBottom: "12px" }}>{profile.full_name}</div>
              )}
              <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 10px", border: "1px solid rgba(255,40,120,0.35)", background: "rgba(255,40,120,0.08)", color: ACCENT, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT }} />
                {profile.role}
              </span>
            </div>

            {isOwner && (
              <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start" }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving}
                      style={{ padding: "8px 18px", background: "rgba(255,40,120,0.15)", border: "1px solid rgba(255,40,120,0.6)", color: ACCENT, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer", fontFamily: "inherit" }}>
                      {saving ? "SAVING..." : "SAVE"}
                    </button>
                    <button onClick={() => { setEditing(false); setSaveError(""); setForm({ full_name: profile.full_name, gamer_tag: profile.gamer_tag, email: profile.email }); setImagePreview(profile.profile_image); setProfileImage(undefined); }}
                      style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer", fontFamily: "inherit" }}>
                      CANCEL
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(true); setSaveOk(false); }}
                    style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,40,120,0.35)", color: ACCENT, fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer", fontFamily: "inherit" }}>
                    EDIT PROFILE
                  </button>
                )}
              </div>
            )}
          </div>

          {saveError && <div style={{ marginBottom: "16px", padding: "10px 14px", border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", color: "rgba(255,130,130,0.9)", fontSize: "12px" }}>{saveError}</div>}
          {saveOk    && <div style={{ marginBottom: "16px", padding: "10px 14px", border: "1px solid rgba(40,255,120,0.25)", background: "rgba(40,255,120,0.06)", color: "rgba(100,255,150,0.9)", fontSize: "12px" }}>Profile updated successfully!</div>}

          <div style={{ height: "1px", background: "rgba(255,40,120,0.15)", marginBottom: "24px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: "22px 36px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>EMAIL</div>
              {editing
                ? <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@example.com" />
                : <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.email}</div>
              }
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>USER ID</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>#{profile.id}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>GAMER TAG</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.gamer_tag}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>ROLE</div>
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{profile.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}