import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamsAPIService } from "../api_services/teams/TeamsAPIService";
import type { TeamDto, TeamMemberDto } from "../models/team/TeamTypes";

export default function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const teamId = Number(id);

  const [team, setTeam] = useState<TeamDto | null>(null);
  const [members, setMembers] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [invitedUserId, setInvitedUserId] = useState("");
  const [invitationId, setInvitationId] = useState("");
  const [newCaptainId, setNewCaptainId] = useState("");

  const [editName, setEditName] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    async function loadTeamData() {
      if (!Number.isInteger(teamId) || teamId <= 0) {
        setLoading(false);
        return;
      }

      const teamResult = await TeamsAPIService.getTeam(teamId);
      const membersResult = await TeamsAPIService.getMembers(teamId);

      if (teamResult.success && teamResult.data) {
        setTeam(teamResult.data);
        setEditName(teamResult.data.name);
        setEditTag(teamResult.data.tag);
        setEditDescription(teamResult.data.description ?? "");
      }

      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data);
      }

      setLoading(false);
    }

    void loadTeamData();
  }, [teamId]);

  async function refreshMembers() {
    const result = await TeamsAPIService.getMembers(teamId);

    if (result.success && result.data) {
      setMembers(result.data);
    }
  }

  async function handleUpdateTeam() {
    if (editName.trim().length < 2) {
      alert("Team name must contain at least 2 characters");
      return;
    }

    if (!/^[A-Z0-9]{2,6}$/.test(editTag.trim())) {
      alert("Tag must contain 2-6 uppercase letters or numbers");
      return;
    }

    const result = await TeamsAPIService.updateTeam(teamId, {
      name: editName.trim(),
      tag: editTag.trim(),
      description: editDescription.trim() || null
    });

    if (result.success) {
      const teamResult = await TeamsAPIService.getTeam(teamId);

      if (teamResult.success && teamResult.data) {
        setTeam(teamResult.data);
        setEditName(teamResult.data.name);
        setEditTag(teamResult.data.tag);
        setEditDescription(teamResult.data.description ?? "");
      }

      alert("Team updated");
    } else {
      alert(result.message);
    }
  }

  async function handleInviteUser() {
    const userId = Number(invitedUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
      alert("Enter valid user ID");
      return;
    }

    const result = await TeamsAPIService.inviteUser(teamId, userId);

    if (result.success) {
      alert("Invitation sent");
      setInvitedUserId("");
    } else {
      alert(result.message);
    }
  }

  async function handleRespondToInvite(status: "accepted" | "rejected") {
    const inviteId = Number(invitationId);

    if (!Number.isInteger(inviteId) || inviteId <= 0) {
      alert("Enter valid invitation ID");
      return;
    }

    const result = await TeamsAPIService.respondToInvite(teamId, inviteId, status);

    if (result.success) {
      alert(`Invitation ${status}`);
      setInvitationId("");
      await refreshMembers();
    } else {
      alert(result.message);
    }
  }

  async function handleKickMember(userId: number) {
    const result = await TeamsAPIService.kickMember(teamId, userId);

    if (result.success) {
      await refreshMembers();
    } else {
      alert(result.message);
    }
  }

  async function handleTransferCaptain() {
    const userId = Number(newCaptainId);

    if (!Number.isInteger(userId) || userId <= 0) {
      alert("Enter valid new captain ID");
      return;
    }

    const result = await TeamsAPIService.transferCaptain(teamId, userId);

    if (result.success) {
      alert("Captain transferred");
      setNewCaptainId("");
      navigate("/teams");
    } else {
      alert(result.message);
    }
  }

  async function handleLeaveTeam() {
    const result = await TeamsAPIService.leaveTeam(teamId);

    if (result.success) {
      navigate("/teams");
    } else {
      alert(result.message);
    }
  }

  async function handleDeleteTeam() {
    const result = await TeamsAPIService.deleteTeam(teamId);

    if (result.success) {
      navigate("/teams");
    } else {
      alert(result.message);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loader}>Loading team...</div>
      </main>
    );
  }

  if (!team) {
    return (
      <main style={styles.page}>
        <div style={styles.loader}>Team not found.</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <button onClick={() => navigate("/teams")} style={styles.backButton}>
          ← Back to teams
        </button>

        <section style={styles.hero}>
          <div>
            <span style={styles.badge}>{team.tag}</span>
            <h1 style={styles.title}>{team.name}</h1>
            <p style={styles.subtitle}>
              {team.description || "No description provided."}
            </p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statNumber}>{members.length}</span>
            <span style={styles.statLabel}>members</span>
          </div>
        </section>

        <section style={styles.actionsGrid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Edit team</h2>

            <input
              type="text"
              placeholder="Team name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="TAG"
              value={editTag}
              onChange={(e) => setEditTag(e.target.value.toUpperCase())}
              style={styles.input}
              maxLength={6}
            />

            <input
              type="text"
              placeholder="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={styles.input}
            />

            <button onClick={() => void handleUpdateTeam()} style={styles.primaryButton}>
              Save Changes
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Invite player</h2>

            <input
              type="number"
              placeholder="Invited user ID"
              value={invitedUserId}
              onChange={(e) => setInvitedUserId(e.target.value)}
              style={styles.input}
            />

            <button onClick={() => void handleInviteUser()} style={styles.primaryButton}>
              Send Invitation
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Respond to invitation</h2>

            <input
              type="number"
              placeholder="Invitation ID"
              value={invitationId}
              onChange={(e) => setInvitationId(e.target.value)}
              style={styles.input}
            />

            <button
              onClick={() => void handleRespondToInvite("accepted")}
              style={styles.primaryButton}
            >
              Accept Invite
            </button>

            <button
              onClick={() => void handleRespondToInvite("rejected")}
              style={styles.rejectButton}
            >
              Reject Invite
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Transfer captain</h2>

            <input
              type="number"
              placeholder="New captain user ID"
              value={newCaptainId}
              onChange={(e) => setNewCaptainId(e.target.value)}
              style={styles.input}
            />

            <button onClick={() => void handleTransferCaptain()} style={styles.primaryButton}>
              Transfer Captain
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Danger zone</h2>

            <button onClick={() => void handleLeaveTeam()} style={styles.warningButton}>
              Leave Team
            </button>

            <button onClick={() => void handleDeleteTeam()} style={styles.dangerButton}>
              Delete Team
            </button>
          </div>
        </section>

        <section style={styles.membersCard}>
          <h2 style={styles.sectionTitle}>Roster</h2>

          {members.length === 0 ? (
            <p style={styles.emptyText}>No members found.</p>
          ) : (
            <div style={styles.memberGrid}>
              {members.map((member) => (
                <article key={member.user_id} style={styles.memberCard}>
                  <div>
                    <h3 style={styles.memberName}>{member.full_name}</h3>
                    <p style={styles.memberTag}>@{member.gamer_tag}</p>
                  </div>

                  <span style={styles.roleBadge}>{member.role.toUpperCase()}</span>

                  <button
                    onClick={() => void handleKickMember(member.user_id)}
                    style={styles.kickButton}
                  >
                    Kick
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
    padding: "54px 22px",
    background:
      "radial-gradient(circle at 15% 10%, rgba(168,85,247,0.38), transparent 28%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.32), transparent 28%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.22), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)",
    color: "#f8fafc",
    fontFamily: "Inter, Arial, sans-serif"
  },
  shell: {
    maxWidth: "1120px",
    margin: "0 auto"
  },
  loader: {
    margin: "120px auto",
    maxWidth: "420px",
    textAlign: "center" as const,
    padding: "28px",
    borderRadius: "24px",
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "22px",
    fontWeight: 900
  },
  backButton: {
    border: 0,
    borderRadius: "999px",
    padding: "12px 18px",
    marginBottom: "26px",
    background: "rgba(255,255,255,0.1)",
    color: "#e0e7ff",
    cursor: "pointer",
    fontWeight: 900
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "28px",
    marginBottom: "32px"
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    color: "white",
    fontWeight: 900,
    letterSpacing: "0.12em",
    marginBottom: "16px"
  },
  title: {
    fontSize: "64px",
    lineHeight: 0.95,
    margin: 0,
    background: "linear-gradient(135deg, #ffffff, #a5b4fc, #38bdf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    maxWidth: "660px",
    color: "#cbd5e1",
    fontSize: "18px",
    lineHeight: 1.6,
    marginTop: "18px"
  },
  statCard: {
    minWidth: "180px",
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    textAlign: "center" as const,
    boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(16px)"
  },
  statNumber: {
    display: "block",
    fontSize: "52px",
    fontWeight: 950
  },
  statLabel: {
    color: "#cbd5e1",
    fontWeight: 800
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },
  card: {
    padding: "26px",
    borderRadius: "28px",
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.32)",
    backdropFilter: "blur(18px)"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "24px"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "14px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.09)",
    color: "#f8fafc",
    outline: "none",
    boxSizing: "border-box" as const
  },
  primaryButton: {
    width: "100%",
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    background: "linear-gradient(135deg, #22d3ee, #6366f1)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  rejectButton: {
    width: "100%",
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    marginTop: "12px",
    background: "linear-gradient(135deg, #f97316, #ef4444)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  warningButton: {
    width: "100%",
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  dangerButton: {
    width: "100%",
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    background: "linear-gradient(135deg, #ef4444, #be123c)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer"
  },
  membersCard: {
    padding: "30px",
    borderRadius: "30px",
    background: "rgba(15,23,42,0.82)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 35px 100px rgba(0,0,0,0.42)",
    backdropFilter: "blur(20px)"
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "28px"
  },
  emptyText: {
    color: "#cbd5e1",
    margin: 0
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px"
  },
  memberCard: {
    padding: "22px",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, rgba(30,41,59,0.96), rgba(15,23,42,0.96))",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  memberName: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "21px"
  },
  memberTag: {
    color: "#cbd5e1",
    margin: "0 0 14px"
  },
  roleBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(99,102,241,0.35)",
    color: "#c7d2fe",
    fontWeight: 900,
    marginBottom: "16px"
  },
  kickButton: {
    width: "100%",
    border: 0,
    borderRadius: "999px",
    padding: "11px 16px",
    background: "rgba(239,68,68,0.2)",
    color: "#fecaca",
    fontWeight: 900,
    cursor: "pointer"
  }
};