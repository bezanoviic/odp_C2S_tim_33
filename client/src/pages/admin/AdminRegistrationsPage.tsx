import { useEffect, useState } from "react";
import { TournamentsAPIService, type TournamentRegistration } from "../../api_services/tournaments/TournamentsAPIService";

const ACCENT = "#4ee7ff";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRegistrations() {
    setLoading(true);
    setError("");
    try {
      const data = await TournamentsAPIService.getAllRegistrations();
      setRegistrations(data);
    } catch {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRegistrations();
  }, []);

  async function updateStatus(registration: TournamentRegistration, status: "pending" | "confirmed" | "disqualified") {
    try {
      await TournamentsAPIService.updateRegistrationStatus(registration.tournament_id, registration.team_id, status);
      setRegistrations((current) =>
        current.map((item) =>
          item.tournament_id === registration.tournament_id && item.team_id === registration.team_id
            ? { ...item, status }
            : item
        )
      );
    } catch {
      setError("Failed to update registration");
    }
  }

  return (
    <div style={{ minHeight: "100vh", padding: "56px 32px", color: "#fff" }}>
      <div style={{ marginBottom: "34px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", color: "rgba(78,231,255,0.7)", marginBottom: "10px" }}>
          ADMIN / REGISTRATIONS
        </div>
        <h1 style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>
          Tournament<br /><span style={{ color: ACCENT }}>Registrations.</span>
        </h1>
      </div>

      {error && <div style={{ padding: "12px 14px", border: "1px solid rgba(78,231,255,0.35)", color: "#8eefff", marginBottom: "18px" }}>{error}</div>}
      {loading && <p style={{ color: "rgba(255,255,255,0.45)" }}>Loading...</p>}

      {!loading && registrations.length === 0 && (
        <div style={{ padding: "34px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.45)" }}>
          No registrations yet.
        </div>
      )}

      <div style={{ display: "grid", gap: "10px" }}>
        {registrations.map((registration) => (
          <div
            key={`${registration.tournament_id}-${registration.team_id}`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 120px 280px", gap: "16px", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em" }}>TOURNAMENT</div>
              <div style={{ fontWeight: 800 }}>{registration.tournament_name ?? `#${registration.tournament_id}`}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em" }}>TEAM</div>
              <div style={{ fontWeight: 800 }}>{registration.team_name ?? `#${registration.team_id}`} {registration.team_tag ? `(${registration.team_tag})` : ""}</div>
            </div>
            <div style={{ color: registration.status === "confirmed" ? "#6ee7a8" : registration.status === "disqualified" ? "#7dd3fc" : ACCENT, fontWeight: 800 }}>
              {registration.status}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              {(["pending", "confirmed", "disqualified"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => void updateStatus(registration, status)}
                  disabled={registration.status === status}
                  style={{ padding: "9px 11px", border: "1px solid rgba(78,231,255,0.35)", background: registration.status === status ? "rgba(78,231,255,0.18)" : "rgba(255,255,255,0.03)", color: "#fff", opacity: registration.status === status ? 0.45 : 1, cursor: registration.status === status ? "default" : "pointer" }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
