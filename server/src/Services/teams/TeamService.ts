import { RowDataPacket } from "mysql2";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/teams/ITeamMemberRepository";
import { ITeamInvitationRepository } from "../../Domain/repositories/teams/ITeamInvitationRepository";
import { ITeamService } from "../../Domain/services/teams/ITeamService";

type InvitationStatus = "accepted" | "rejected";

export class TeamService implements ITeamService {
  public constructor(
    private readonly teamRepo: ITeamRepository,
    private readonly memberRepo: ITeamMemberRepository,
    private readonly invitationRepo: ITeamInvitationRepository,
  ) {}

  async createTeam(
    name: string,
    tag: string,
    description: string | null,
    logo: string | null,
    userId: number,
  ): Promise<number | null> {
    return this.teamRepo.createTeam(name, tag, description, logo, userId);
  }

  async getMyTeams(userId: number): Promise<RowDataPacket[]> {
    return this.teamRepo.getUserTeams(userId);
  }

  async getTeam(teamId: number): Promise<RowDataPacket | null> {
    return this.teamRepo.getTeamById(teamId);
  }

  async getTeamByTag(tag: string): Promise<RowDataPacket | null> {
    return this.teamRepo.getTeamByTag(tag);
  }

  async deleteTeam(teamId: number, userId: number): Promise<boolean> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, userId);
    if (!isCaptain) return false;
    return this.teamRepo.deleteTeam(teamId);
  }

  async inviteUser(
    teamId: number,
    invitedUserId: number,
    invitedByUserId: number,
  ): Promise<number | null> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, invitedByUserId);
    if (!isCaptain) return null;

    const isMember = await this.memberRepo.isMember(teamId, invitedUserId);
    if (isMember) return null;

    const existingInvite = await this.invitationRepo.getPendingInvitation(teamId, invitedUserId);
    if (existingInvite) return null;

    return this.invitationRepo.createInvitation(teamId, invitedUserId, invitedByUserId);
  }

  async respondToInvite(
    invitationId: number,
    userId: number,
    status: InvitationStatus,
  ): Promise<boolean> {
    const invitation = await this.invitationRepo.getInvitationById(invitationId);
    if (!invitation) return false;
    if (Number(invitation.invited_user_id) !== userId) return false;
    if (invitation.status !== "pending") return false;

    const updated = await this.invitationRepo.respondToInvitation(invitationId, status);
    if (!updated) return false;

    if (status === "accepted") {
      const isMember = await this.memberRepo.isMember(Number(invitation.team_id), userId);
      if (!isMember) {
        return this.memberRepo.addMember(Number(invitation.team_id), userId);
      }
    }

    return true;
  }

  async leaveTeam(teamId: number, userId: number): Promise<boolean> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, userId);
    if (isCaptain) return false;
    return this.memberRepo.removeMember(teamId, userId);
  }

  async kickMember(teamId: number, targetUserId: number, captainId: number): Promise<boolean> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, captainId);
    if (!isCaptain) return false;
    if (targetUserId === captainId) return false;
    return this.memberRepo.removeMember(teamId, targetUserId);
  }

  async transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number): Promise<boolean> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, oldCaptainId);
    if (!isCaptain) return false;

    const isMember = await this.memberRepo.isMember(teamId, newCaptainId);
    if (!isMember) return false;

    return this.memberRepo.transferCaptain(teamId, oldCaptainId, newCaptainId);
  }

  async updateTeam(
    teamId: number,
    name: string,
    tag: string,
    description: string | null,
    logo: string | null,
    userId: number,
  ): Promise<boolean> {
    const isCaptain = await this.memberRepo.isCaptain(teamId, userId);
    if (!isCaptain) return false;
    return this.teamRepo.updateTeam(teamId, name, tag, description, logo);
  }

  async getTeamMembers(teamId: number): Promise<RowDataPacket[]> {
    return this.memberRepo.getTeamMembers(teamId);
  }

  async getMyInvitations(userId: number): Promise<RowDataPacket[]> {
    return this.invitationRepo.getMyInvitations(userId);
  }
}
