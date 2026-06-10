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
    if (name.trim().length < 2) return alert("Team name must contain at least 2 characters");
    if (!/^[A-Z0-9]{2,6}$/.test(tag.trim())) return alert("Tag must contain 2-6 uppercase letters or numbers");
    setCreating(true);
    const result = await TeamsAPIService.createTeam({ name: name.trim(), tag: tag.trim(), description: description.trim() || null });
    if (result.success) {
      const teamsResult = await TeamsAPIService.getMyTeams();
      if (teamsResult.success && teamsResult.data) setTeams(teamsResult.data);
      setName(""); setTag(""); setDescription("");
    } else alert(result.message);
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
    } else alert(result.message);
  }

  return (
    <div className="space-y-7 text-white">
      <section className="rounded-[32px] border border-cyan-200/12 bg-gradient-to-br from-cyan-300/[0.10] via-white/[0.035] to-violet-300/[0.10] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/55">player / teams</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Squad Control</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Create a roster, review invites and open team details from a cleaner team workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-3xl border border-cyan-200/14 bg-[#061423]/70 px-5 py-4 text-right"><p className="m-0 text-3xl font-black">{teams.length}</p><p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">teams</p></div>
            <div className="rounded-3xl border border-violet-200/14 bg-[#061423]/70 px-5 py-4 text-right"><p className="m-0 text-3xl font-black text-cyan-100">{invitations.length}</p><p className="m-0 text-[10px] uppercase tracking-[0.2em] text-white/35">invites</p></div>
          </div>
        </div>
      </section>

      {invitations.length > 0 && (
        <section className="rounded-[28px] border border-cyan-200/14 bg-white/[0.035] p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="m-0 text-2xl font-black">Pending Invitations</h2><StatusBadge status="pending" /></div>
          <div className="grid gap-4 lg:grid-cols-2">
            {invitations.map(inv => (
              <article key={inv.id} className="rounded-[24px] border border-cyan-200/12 bg-[#061423]/60 p-4">
                <div className="mb-3 flex items-center justify-between"><span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">{inv.team_tag}</span><span className="text-xs text-white/35">{inv.created_at.slice(0, 10)}</span></div>
                <h3 className="m-0 text-xl font-black">{inv.team_name}</h3>
                <p className="mt-2 text-sm text-white/45">Invited by <span className="text-cyan-100">@{inv.invited_by}</span></p>
                <div className="mt-4 flex gap-3"><button onClick={() => void handleRespondInvite(inv.team_id, inv.id, "accepted")} className="pg-button flex-1 px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Accept</button><button onClick={() => void handleRespondInvite(inv.team_id, inv.id, "rejected")} className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/65 hover:border-cyan-200/25 hover:text-white">Reject</button></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="rounded-[28px] border border-cyan-200/12 bg-white/[0.035] p-5" onSubmit={(e) => { e.preventDefault(); void handleCreateTeam(); }}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/55">create team</p>
          <h2 className="m-0 text-2xl font-black">New squad</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Team name<input className="pg-input mt-2" type="text" placeholder="Alpha Squad" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Tag<input className="pg-input mt-2" type="text" placeholder="ALPHA" value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={6} /></label>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Description<textarea className="pg-input mt-2 min-h-28 resize-y" placeholder="Describe your team..." value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          </div>
          <button className="pg-button mt-5 w-full px-5 py-4 text-xs font-black uppercase tracking-[0.18em]" disabled={creating}>{creating ? "Creating..." : "Create Team"}</button>
        </form>

        <section className="rounded-[28px] border border-cyan-200/12 bg-white/[0.025] p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">your roster hub</p><h2 className="m-0 text-2xl font-black">Team List</h2></div><p className="m-0 text-sm text-white/40">{teams.length} active</p></div>
          {teams.length === 0 ? <div className="rounded-[24px] border border-dashed border-cyan-200/18 p-10 text-center"><h3 className="m-0 text-2xl font-black">No teams yet</h3><p className="mt-2 text-white/40">Create your first team using the form.</p></div> : (
            <div className="grid gap-4 md:grid-cols-2">
              {teams.map((team) => (
                <article key={team.id} className="rounded-[24px] border border-cyan-200/12 bg-[#061423]/60 p-5 transition hover:border-cyan-200/32 hover:bg-cyan-300/[0.045]">
                  <div className="mb-4 flex items-center justify-between"><span className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">{team.tag}</span><span className="text-xs font-bold text-white/35">#{team.id}</span></div>
                  <h3 className="m-0 text-2xl font-black tracking-tight">{team.name}</h3>
                  <p className="min-h-12 text-sm leading-6 text-white/45">{team.description || "No description provided."}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3"><p className="m-0 text-sm font-black">{team.captain_id}</p><p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">captain</p></div><div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3"><p className="m-0 text-sm font-black">{team.created_at.slice(0, 10)}</p><p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/30">created</p></div></div>
                  <button onClick={() => navigate(`/teams/${team.id}`)} className="pg-button mt-5 w-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Open Team</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
