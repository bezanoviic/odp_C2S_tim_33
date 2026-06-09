import { TeamRepository } from "../../Database/repositories/teams/TeamRepository";

export class TeamService {
  private repo = new TeamRepository();

  async createTeam(name: string, tag: string, description: string | null, userId: number) {
    return this.repo.createTeam(name, tag, description, userId);
  }

  async getMyTeams(userId: number) {
    return this.repo.getUserTeams(userId);
  }

  async getTeam(teamId: number) {
    return this.repo.getTeamById(teamId);
  }

  async deleteTeam(teamId: number) {
    return this.repo.deleteTeam(teamId);
  }

  async inviteUser(teamId: number, invitedUserId: number, invitedByUserId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, invitedByUserId);
    if (!isCaptain) {
      throw new Error("Only captain can invite players");
    }

    const isMember = await this.repo.isMember(teamId, invitedUserId);
    if (isMember) {
      throw new Error("User is already in team");
    }

    const existingInvite = await this.repo.getPendingInvitation(teamId, invitedUserId);
    if (existingInvite) {
      throw new Error("Invitation already exists");
    }

    return this.repo.createInvitation(teamId, invitedUserId, invitedByUserId);
  }

  async respondToInvite(invitationId: number, userId: number, status: "accepted" | "rejected") {
    // ovdje možeš kasnije provjeriti da li je user pozvan

    await this.repo.respondToInvitation(invitationId, status);

    if (status === "accepted") {
      // treba dodati usera u team — to ćemo povezati kasnije
    }
  }

  async leaveTeam(teamId: number, userId: number) {
    return this.repo.removeMember(teamId, userId);
  }

  async kickMember(teamId: number, targetUserId: number, captainId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, captainId);
    if (!isCaptain) {
      throw new Error("Only captain can remove members");
    }

    return this.repo.removeMember(teamId, targetUserId);
  }

  async transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, oldCaptainId);
    if (!isCaptain) {
      throw new Error("Only captain can transfer ownership");
    }

    return this.repo.transferCaptain(teamId, oldCaptainId, newCaptainId);
  }
}