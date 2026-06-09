import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/teams/ITeamRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TeamRepository implements ITeamRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async createTeam(
    name: string,
    tag: string,
    description: string | null,
    logo: string | null,
    userId: number,
  ): Promise<number | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      await res.conn.beginTransaction();
      const [teamResult] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO teams (name, tag, description, logo, created_by, captain_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, tag, description, logo, userId, userId],
      );
      const teamId = teamResult.insertId;
      await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'captain')`,
        [teamId, userId],
      );
      await res.conn.commit();
      return teamId;
    } catch (err) {
      this.logger.error("TeamRepository", "createTeam failed", err as Error);
      await res.conn.rollback();
      return null;
    } finally {
      res.conn.release();
    }
  }

  async getUserTeams(userId: number): Promise<RowDataPacket[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.*,
                (SELECT COUNT(*) FROM team_members tm_all WHERE tm_all.team_id = t.id) AS members_count
         FROM teams t
         JOIN team_members tm ON t.id = tm.team_id
         WHERE tm.user_id = ?`,
        [userId],
      );
      return rows;
    } catch (err) {
      this.logger.error("TeamRepository", "getUserTeams failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async getTeamById(teamId: number): Promise<RowDataPacket | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM teams WHERE id = ?`,
        [teamId],
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      this.logger.error("TeamRepository", "getTeamById failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async getTeamByTag(tag: string): Promise<RowDataPacket | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM teams WHERE tag = ?`,
        [tag],
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      this.logger.error("TeamRepository", "getTeamByTag failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async deleteTeam(teamId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM teams WHERE id = ?`,
        [teamId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "deleteTeam failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async updateTeam(
    teamId: number,
    name: string,
    tag: string,
    description: string | null,
    logo: string | null,
  ): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE teams SET name = ?, tag = ?, description = ?, logo = ? WHERE id = ?`,
        [name, tag, description, logo, teamId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "updateTeam failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }
}
