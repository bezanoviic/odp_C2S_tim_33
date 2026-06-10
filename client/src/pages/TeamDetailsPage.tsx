import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamsAPIService } from "../api_services/teams/TeamsAPIService";
import type { TeamDto, TeamMemberDto } from "../models/team/TeamTypes";
import { StatusBadge } from "../components/ui/UI";

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

      if (membersResult.success && membersResult.data) setMembers(membersResult.data);
      setLoading(false);
    }

    void loadTeamData();
  }, [teamId]);

  async function refreshMembers() {
    const result = await TeamsAPIService.getMembers(teamId);
    if (result.success && result.data) setMembers(result.data);
  }

  async function handleUpdateTeam() {
    if (editName.trim().length < 2) return alert("Team name must contain at least 2 characters");
    if (!/^[A-Z0-9]{2,6}$/.test(editTag.trim())) return alert("Tag must contain 2-6 uppercase letters or numbers");

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
    } else alert(result.message);
  }

  async function handleInviteUser() {
    const userId = Number(invitedUserId);
    if (!Number.isInteger(userId) || userId <= 0) return alert("Enter valid user ID");

    const result = await TeamsAPIService.inviteUser(teamId, userId);
    if (result.success) {
      alert("Invitation sent");
      setInvitedUserId("");
    } else alert(result.message);
  }

  async function handleRespondToInvite(status: "accepted" | "rejected") {
    const inviteId = Number(invitationId);
    if (!Number.isInteger(inviteId) || inviteId <= 0) return alert("Enter valid invitation ID");

    const result = await TeamsAPIService.respondToInvite(teamId, inviteId, status);
    if (result.success) {
      alert(`Invitation ${status}`);
      setInvitationId("");
      await refreshMembers();
    } else alert(result.message);
  }

  async function handleKickMember(userId: number) {
    const result = await TeamsAPIService.kickMember(teamId, userId);
    if (result.success) await refreshMembers();
    else alert(result.message);
  }

  async function handleTransferCaptain() {
    const userId = Number(newCaptainId);
    if (!Number.isInteger(userId) || userId <= 0) return alert("Enter valid new captain ID");

    const result = await TeamsAPIService.transferCaptain(teamId, userId);
    if (result.success) {
      alert("Captain transferred");
      setNewCaptainId("");
      navigate("/teams");
    } else alert(result.message);
  }

  async function handleLeaveTeam() {
    const result = await TeamsAPIService.leaveTeam(teamId);
    if (result.success) navigate("/teams");
    else alert(result.message);
  }

  async function handleDeleteTeam() {
    const result = await TeamsAPIService.deleteTeam(teamId);
    if (result.success) navigate("/teams");
    else alert(result.message);
  }

  if (loading) {
    return <div className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-10 text-center text-xl font-black text-white/60">Loading team...</div>;
  }

  if (!team) {
    return <div className="rounded-[28px] border border-dashed border-cyan-200/18 p-10 text-center text-white/45">Team not found.</div>;
  }

  return (
    <div className="space-y-7 text-white">
      <button onClick={() => navigate("/teams")} className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/65 hover:border-cyan-200/25 hover:text-white">
        ← Back to teams
      </button>

      <section className="overflow-hidden rounded-[32px] border border-cyan-200/12 bg-gradient-to-br from-cyan-300/[0.10] via-white/[0.035] to-violet-300/[0.10] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">team command / roster</p>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/80">{team.tag}</span>
              <StatusBadge status="active" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{team.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{team.description || "No description provided."}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
            <div className="rounded-3xl border border-cyan-200/14 bg-[#061423]/70 px-5 py-4 text-right">
              <p className="m-0 text-3xl font-black text-cyan-100">{members.length}</p>
              <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">members</p>
            </div>
            <div className="rounded-3xl border border-violet-200/14 bg-[#061423]/70 px-5 py-4 text-right">
              <p className="m-0 text-3xl font-black">#{team.id}</p>
              <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">team id</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-cyan-200/12 bg-white/[0.025] p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">active roster</p>
              <h2 className="m-0 text-2xl font-black">Members</h2>
            </div>
            <p className="m-0 text-sm text-white/40">{members.length} listed</p>
          </div>

          {members.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-cyan-200/18 p-10 text-center text-white/40">No members found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {members.map((member) => (
                <article key={member.user_id} className="rounded-[24px] border border-cyan-200/12 bg-[#061423]/60 p-5 transition hover:border-cyan-200/32 hover:bg-cyan-300/[0.045]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-xl font-black tracking-tight">{member.full_name}</h3>
                      <p className="mt-1 text-sm text-cyan-100/55">@{member.gamer_tag}</p>
                    </div>
                    <span className="rounded-full border border-violet-200/14 bg-violet-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100/75">{member.role}</span>
                  </div>
                  <button onClick={() => void handleKickMember(member.user_id)} className="w-full rounded-[18px] border border-red-300/20 bg-red-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-100/75 hover:border-red-300/35 hover:text-red-50">
                    Kick member
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5">
          <form className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5" onSubmit={(e) => { e.preventDefault(); void handleUpdateTeam(); }}>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/55">team settings</p>
            <h2 className="m-0 text-2xl font-black">Edit team</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Team name<input className="pg-input mt-2" type="text" placeholder="Team name" value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Tag<input className="pg-input mt-2" type="text" placeholder="TAG" value={editTag} onChange={(e) => setEditTag(e.target.value.toUpperCase())} maxLength={6} /></label>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Description<textarea className="pg-input mt-2 min-h-24 resize-y" placeholder="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></label>
            </div>
            <button className="pg-button mt-5 w-full px-5 py-4 text-xs font-black uppercase tracking-[0.18em]">Save Changes</button>
          </form>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">invite</p>
              <h2 className="m-0 text-xl font-black">Invite player</h2>
              <input className="pg-input mt-5" type="number" placeholder="Invited user ID" value={invitedUserId} onChange={(e) => setInvitedUserId(e.target.value)} />
              <button onClick={() => void handleInviteUser()} className="pg-button mt-4 w-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Send Invitation</button>
            </div>

            <div className="rounded-[28px] border border-violet-200/12 bg-white/[0.035] p-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">invitations</p>
              <h2 className="m-0 text-xl font-black">Respond to invite</h2>
              <input className="pg-input mt-5" type="number" placeholder="Invitation ID" value={invitationId} onChange={(e) => setInvitationId(e.target.value)} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => void handleRespondToInvite("accepted")} className="pg-button px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Accept</button>
                <button onClick={() => void handleRespondToInvite("rejected")} className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/65 hover:border-cyan-200/25 hover:text-white">Reject</button>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">captain</p>
              <h2 className="m-0 text-xl font-black">Transfer captain</h2>
              <input className="pg-input mt-5" type="number" placeholder="New captain user ID" value={newCaptainId} onChange={(e) => setNewCaptainId(e.target.value)} />
              <button onClick={() => void handleTransferCaptain()} className="pg-button mt-4 w-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Transfer Captain</button>
            </div>

            <div className="rounded-[28px] border border-red-300/18 bg-red-400/[0.045] p-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-red-100/50">danger zone</p>
              <h2 className="m-0 text-xl font-black">Team access</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <button onClick={() => void handleLeaveTeam()} className="rounded-[18px] border border-orange-300/20 bg-orange-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-orange-100/75 hover:border-orange-300/35 hover:text-orange-50">Leave Team</button>
                <button onClick={() => void handleDeleteTeam()} className="rounded-[18px] border border-red-300/20 bg-red-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-100/75 hover:border-red-300/35 hover:text-red-50">Delete Team</button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
