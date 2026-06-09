import { RowDataPacket } from "mysql2";

export interface ITeamMemberRepository {
  getTeamMembers(teamId: number): Promise<RowDataPacket[]>;
  isCaptain(teamId: number, userId: number): Promise<boolean>;
  isMember(teamId: number, userId: number): Promise<boolean>;
  addMember(teamId: number, userId: number): Promise<boolean>;
  removeMember(teamId: number, userId: number): Promise<boolean>;
  transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number): Promise<boolean>;
}
