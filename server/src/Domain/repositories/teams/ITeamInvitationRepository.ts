import { RowDataPacket } from "mysql2";

type InvitationStatus = "accepted" | "rejected";

export interface ITeamInvitationRepository {
  createInvitation(teamId: number, invitedUserId: number, invitedByUserId: number): Promise<number | null>;
  getPendingInvitation(teamId: number, invitedUserId: number): Promise<RowDataPacket | null>;
  respondToInvitation(invitationId: number, status: InvitationStatus): Promise<boolean>;
  getInvitationById(invitationId: number): Promise<RowDataPacket | null>;
  getMyInvitations(userId: number): Promise<RowDataPacket[]>;
}
