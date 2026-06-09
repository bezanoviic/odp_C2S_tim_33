import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TeamsAPIService } from "../api_services/teams/TeamsAPIService";
import type { TeamDto } from "../models/team/TeamTypes";
import { StatusBadge } from "../components/ui/UI";

type Invitation = {
  id: number;
  team_id: number;
  team_name: string;
  team_tag: string;
  invited_by: string;
  created_at: string;
};

export default function TeamsPage() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    async function loadTeams() {
      const result = await TeamsAPIService.getMyTeams();
      if (result.success && result.data) setTeams(result.data);

      const invResult = await TeamsAPIService.getMyInvitations();
      if (invResult.success && invResult.data) setInvitations(invResult.data);
    }
    void loadTeams();
  }, []);

  async function handleCreateTeam() {
    if (name.trim().length < 2) {
      alert("Team name must contain at least 2 characters");
      return;
    }
    if (!/^[A-Z0-9]{2,6}$/.test(tag.trim())) {
      alert("Tag must contain 2-6 uppercase letters or numbers");
      return;
    }
    setCreating(true);
    const result = await TeamsAPIService.createTeam({
      name: name.trim(),
      tag: tag.trim(),
      description: description.trim() || null
    });
    if (result.success) {
      const teamsResult = await TeamsAPIService.getMyTeams();
      if (teamsResult.success && teamsResult.data) setTeams(teamsResult.data);
      setName("");
      setTag("");
      setDescription("");
    } else {
      alert(result.message);
    }
    setCreating(false);
  }

  async function handleRespondInvite(teamId: number, invitationId: number, status: "accepted" | "rejected") {
    const result = await TeamsAPIService.respondToInvite(teamId, invitationId, status);
    if (result.success) {
      setInvitations(inv => inv.filter(i => i.id !== invitationId));
      if (status === "accepted") {
        const teamsResult = await TeamsAPIService.getMyTeams();
        if (teamsResult.success && teamsResult.data) setTeams(teamsResult.data);
      }
    } else {
      alert(result.message);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Pulse Teams</p>
            <h1 style={styles.title}>Build your squad</h1>
            <p style={styles.subtitle}>
              Create teams, organize players and manage your roster from one place.
            </p>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{teams.length}</span>
            <span style={styles.statLabel}>active teams</span>
          </div>
        </section>

        {invitations.length > 0 && (
          <section style={{ ...styles.card, borderColor: "rgba(255,40,120,0.25)", marginBottom: "28px" }}>
            <h2 style={{ ...styles.cardTitle, color: "#ff2878" }}>
              Pending Invitations ({invitations.length})
            </h2>
            <div style={styles.grid}>
              {invitations.map(inv => (
                <article key={inv.id} style={{ ...styles.teamCard, border: "1px solid rgba(255,40,120,0.2)" }}>
                  <div style={styles.teamHeader}>
                    <span style={{ ...styles.badge, background: "linear-gradient(135deg, rgba(255,40,120,0.4), rgba(255,40,120,0.2))", color: "#ffb3cc" }}>
                      {inv.team_tag}
                    </span>
                    <StatusBadge status="pending" />
                  </div>
                  <h3 style={styles.teamName}>{inv.team_name}</h3>
                  <p style={styles.teamDescription}>
                    Invited by: <span style={{ color: "#a5b4fc" }}>@{inv.invited_by}</span>
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "12px", margin: "8px 0 0" }}>
                    {inv.created_at.slice(0, 10)}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button
                      onClick={() => void handleRespondInvite(inv.team_id, inv.id, "accepted")}
                      style={{ ...styles.openButton, background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => void handleRespondInvite(inv.team_id, inv.id, "rejected")}
                      style={{ ...styles.openButton, background: "linear-gradient(135deg, #ef4444, #be123c)" }}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Create Team</h2>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Team name
              <input
                type="text"
                placeholder="Alpha Squad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Tag
              <input
                type="text"
                placeholder="ALPHA"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                style={styles.input}
                maxLength={6}
              />
            </label>
          </div>
          <label style={styles.label}>
            Description
            <textarea
              placeholder="Describe your team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </label>
          <button
            onClick={() => void handleCreateTeam()}
            disabled={creating}
            style={{ ...styles.button, opacity: creating ? 0.7 : 1, cursor: creating ? "not-allowed" : "pointer" }}
          >
            {creating ? "Creating..." : "Create Team"}
          </button>
        </section>

        <section style={styles.teamsSection}>
          <h2 style={styles.sectionTitle}>Team List</h2>
          {teams.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No teams yet</h3>
              <p style={styles.emptyText}>Create your first team using the form above.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {teams.map((team) => (
                <article key={team.id} style={styles.teamCard}>
                  <div style={styles.teamHeader}>
                    <span style={styles.badge}>{team.tag}</span>
                    <span style={styles.teamId}>#{team.id}</span>
                  </div>
                  <h3 style={styles.teamName}>{team.name}</h3>
                  <p style={styles.teamDescription}>
                    {team.description || "No description provided."}
                  </p>
                  <div style={styles.teamFooter}>
                    <span>Captain ID: {team.captain_id}</span>
                    <span>{team.created_at.slice(0, 10)}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/teams/${team.id}`)}
                    style={styles.openButton}
                  >
                    Open Team
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "40px 22px",
    color: "#f8fafc",
    fontFamily: "Inter, Arial, sans-serif",
    background: "transparent"
  },
  shell: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto"
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "28px",
    marginBottom: "30px"
  },
  eyebrow: {
    color: "#ff2878",
    textTransform: "uppercase" as const,
    letterSpacing: "0.18em",
    fontWeight: 900,
    marginBottom: "12px"
  },
  title: {
    fontSize: "66px",
    fontWeight: 950,
    lineHeight: 0.95,
    margin: 0,
    background: "linear-gradient(135deg, #ffffff, #ff2878, #ff6ba8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    maxWidth: "620px",
    color: "#cbd5e1",
    fontSize: "18px",
    marginTop: "18px",
    lineHeight: 1.6
  },
  statCard: {
    minWidth: "180px",
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255,40,120,0.1)",
    border: "1px solid rgba(255,40,120,0.18)",
    textAlign: "center" as const
  },
  statNumber: {
    display: "block",
    fontSize: "52px",
    fontWeight: 950
  },
  statLabel: {
    color: "#cbd5e1",
    fontWeight: 700
  },
  card: {
    width: "100%",
    padding: "34px",
    borderRadius: "30px",
    background: "rgba(15, 23, 42, 0.78)",
    border: "1px solid rgba(255,40,120,0.14)",
    marginBottom: "38px"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "22px",
    fontSize: "28px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    gap: "18px"
  },
  label: {
    display: "block",
    color: "#e2e8f0",
    fontWeight: 800,
    marginBottom: "16px"
  },
  input: {
    display: "block",
    width: "100%",
    marginTop: "9px",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,40,120,0.18)",
    background: "rgba(255,255,255,0.09)",
    color: "#f8fafc",
    outline: "none",
    boxSizing: "border-box" as const
  },
  textarea: {
    display: "block",
    width: "100%",
    minHeight: "105px",
    marginTop: "9px",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,40,120,0.18)",
    background: "rgba(255,255,255,0.09)",
    color: "#f8fafc",
    outline: "none",
    resize: "vertical" as const,
    boxSizing: "border-box" as const
  },
  button: {
    border: 0,
    borderRadius: "999px",
    padding: "15px 30px",
    background: "linear-gradient(135deg, #ff2878, #ff6ba8)",
    color: "white",
    fontWeight: 900,
    fontSize: "15px"
  },
  teamsSection: {
    width: "100%"
  },
  sectionTitle: {
    marginBottom: "18px",
    fontSize: "28px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px"
  },
  teamCard: {
    padding: "26px",
    borderRadius: "28px",
    background: "linear-gradient(145deg, rgba(30,41,59,0.96), rgba(15,23,42,0.96))",
    border: "1px solid rgba(255,40,120,0.1)"
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  badge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(255,40,120,0.45), rgba(255,107,168,0.35))",
    color: "#ffb3cc",
    fontWeight: 900
  },
  teamId: {
    color: "#94a3b8",
    fontWeight: 700
  },
  teamName: {
    fontSize: "26px",
    margin: "0 0 10px"
  },
  teamDescription: {
    color: "#cbd5e1",
    minHeight: "44px",
    lineHeight: 1.5
  },
  teamFooter: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "22px"
  },
  openButton: {
    width: "100%",
    marginTop: "18px",
    border: 0,
    borderRadius: "999px",
    padding: "12px 18px",
    background: "linear-gradient(135deg, #ff2878, #ff6ba8)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  emptyState: {
    padding: "34px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.08)",
    border: "1px dashed rgba(255,40,120,0.22)",
    color: "#cbd5e1",
    textAlign: "center" as const
  },
  emptyTitle: {
    color: "#f8fafc",
    marginBottom: "8px"
  },
  emptyText: {
    margin: 0
  }
};
