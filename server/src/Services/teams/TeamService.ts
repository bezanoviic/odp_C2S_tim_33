import { RowDataPacket } from "mysql2/promise";
import { TeamRepository } from "../../Database/repositories/teams/TeamRepository";

type InvitationStatus = "accepted" | "rejected";

export class TeamService {
  public constructor(private readonly repo: TeamRepository) {}

  async createTeam(
    name: string,
    tag: string,
    description: string | null,
    userId: number
  ): Promise<number | null> {
    return this.repo.createTeam(name, tag, description, userId);
  }

  async getMyTeams(userId: number): Promise<RowDataPacket[]> {
    return this.repo.getUserTeams(userId);
  }

  async getTeam(teamId: number): Promise<RowDataPacket | null> {
    return this.repo.getTeamById(teamId);
  }

  async deleteTeam(teamId: number, userId: number): Promise<boolean> {
    const isCaptain = await this.repo.isCaptain(teamId, userId);

    if (!isCaptain) {
      return false;
    }

    return this.repo.deleteTeam(teamId);
  }

  async inviteUser(
    teamId: number,
    invitedUserId: number,
    invitedByUserId: number
  ): Promise<number | null> {
    const isCaptain = await this.repo.isCaptain(teamId, invitedByUserId);

    if (!isCaptain) {
      return null;
    }

    const isMember = await this.repo.isMember(teamId, invitedUserId);

    if (isMember) {
      return null;
    }

    const existingInvite = await this.repo.getPendingInvitation(teamId, invitedUserId);

    if (existingInvite) {
      return null;
    }

    return this.repo.createInvitation(teamId, invitedUserId, invitedByUserId);
  }

  async respondToInvite(
    invitationId: number,
    userId: number,
    status: InvitationStatus
  ): Promise<boolean> {
    const invitation = await this.repo.getInvitationById(invitationId);

    if (!invitation) {
      return false;
    }

    if (Number(invitation.invited_user_id) !== userId) {
      return false;
    }

    if (invitation.status !== "pending") {
      return false;
    }

    const updated = await this.repo.respondToInvitation(invitationId, status);

    if (!updated) {
      return false;
    }

    if (status === "accepted") {
      const isMember = await this.repo.isMember(Number(invitation.team_id), userId);

      if (!isMember) {
        return this.repo.addMember(Number(invitation.team_id), userId);
      }
    }

    return true;
  }

  async leaveTeam(teamId: number, userId: number): Promise<boolean> {
    const isCaptain = await this.repo.isCaptain(teamId, userId);

    if (isCaptain) {
      return false;
    }

    return this.repo.removeMember(teamId, userId);
  }

  async kickMember(
    teamId: number,
    targetUserId: number,
    captainId: number
  ): Promise<boolean> {
    const isCaptain = await this.repo.isCaptain(teamId, captainId);

    if (!isCaptain) {
      return false;
    }

    if (targetUserId === captainId) {
      return false;
    }

    return this.repo.removeMember(teamId, targetUserId);
  }

  async transferCaptain(
    teamId: number,
    oldCaptainId: number,
    newCaptainId: number
  ): Promise<boolean> {
    const isCaptain = await this.repo.isCaptain(teamId, oldCaptainId);

    if (!isCaptain) {
      return false;
    }

    const isMember = await this.repo.isMember(teamId, newCaptainId);

    if (!isMember) {
      return false;
    }

    return this.repo.transferCaptain(teamId, oldCaptainId, newCaptainId);
  }

  async updateTeam(
    teamId: number,
    name: string,
    tag: string,
    description: string | null,
    userId: number
  ): Promise<boolean> {
    const isCaptain = await this.repo.isCaptain(teamId, userId);

    if (!isCaptain) {
      return false;
    }

    return this.repo.updateTeam(teamId, name, tag, description);
  }

  async getTeamMembers(teamId: number): Promise<RowDataPacket[]> {
    return this.repo.getTeamMembers(teamId);
  }
}