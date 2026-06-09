import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITeamMemberRepository } from "../../../Domain/repositories/teams/ITeamMemberRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamMemberRepository implements ITeamMemberRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async getTeamMembers(teamId: number): Promise<RowDataPacket[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT tm.team_id, tm.user_id, tm.role, tm.joined_at,
                u.gamer_tag, u.full_name, u.profile_image
         FROM team_members tm
         JOIN users u ON u.id = tm.user_id
         WHERE tm.team_id = ?`,
        [teamId],
      );
      return rows;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "getTeamMembers failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async isCaptain(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND role = 'captain'`,
        [teamId, userId],
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "isCaptain failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async isMember(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?`,
        [teamId, userId],
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "isMember failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async addMember(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'member')`,
        [teamId, userId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "addMember failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async removeMember(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`,
        [teamId, userId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "removeMember failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      await res.conn.beginTransaction();
      await res.conn.execute<ResultSetHeader>(
        `UPDATE team_members SET role = 'member' WHERE team_id = ? AND user_id = ?`,
        [teamId, oldCaptainId],
      );
      await res.conn.execute<ResultSetHeader>(
        `UPDATE team_members SET role = 'captain' WHERE team_id = ? AND user_id = ?`,
        [teamId, newCaptainId],
      );
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE teams SET captain_id = ? WHERE id = ?`,
        [newCaptainId, teamId],
      );
      await res.conn.commit();
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "transferCaptain failed", err as Error);
      await res.conn.rollback();
      return false;
    } finally {
      res.conn.release();
    }
  }
}
