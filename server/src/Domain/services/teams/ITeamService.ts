import { RowDataPacket } from "mysql2";

type InvitationStatus = "accepted" | "rejected";

export interface ITeamService {
  createTeam(name: string, tag: string, description: string | null, logo: string | null, userId: number): Promise<number | null>;
  getMyTeams(userId: number): Promise<RowDataPacket[]>;
  getTeam(teamId: number): Promise<RowDataPacket | null>;
  getTeamByTag(tag: string): Promise<RowDataPacket | null>;
  deleteTeam(teamId: number, userId: number): Promise<boolean>;
  inviteUser(teamId: number, invitedUserId: number, invitedByUserId: number): Promise<number | null>;
  respondToInvite(invitationId: number, userId: number, status: InvitationStatus): Promise<boolean>;
  updateTeam(teamId: number, name: string, tag: string, description: string | null, logo: string | null, userId: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<RowDataPacket[]>;
  leaveTeam(teamId: number, userId: number): Promise<boolean>;
  kickMember(teamId: number, targetUserId: number, captainId: number): Promise<boolean>;
  transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number): Promise<boolean>;
  getMyInvitations(userId: number): Promise<RowDataPacket[]>;
}
