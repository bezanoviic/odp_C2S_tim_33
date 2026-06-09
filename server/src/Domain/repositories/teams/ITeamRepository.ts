import { RowDataPacket } from "mysql2";

export interface ITeamRepository {
  createTeam(name: string, tag: string, description: string | null, logo: string | null, userId: number): Promise<number | null>;
  getUserTeams(userId: number): Promise<RowDataPacket[]>;
  getTeamById(teamId: number): Promise<RowDataPacket | null>;
  getTeamByTag(tag: string): Promise<RowDataPacket | null>;
  deleteTeam(teamId: number): Promise<boolean>;
  updateTeam(teamId: number, name: string, tag: string, description: string | null, logo: string | null): Promise<boolean>;
}
