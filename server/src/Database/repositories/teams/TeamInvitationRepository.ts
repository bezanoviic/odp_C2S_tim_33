import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITeamInvitationRepository } from "../../../Domain/repositories/teams/ITeamInvitationRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

type InvitationStatus = "accepted" | "rejected";

export class TeamInvitationRepository implements ITeamInvitationRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async createInvitation(teamId: number, invitedUserId: number, invitedByUserId: number): Promise<number | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_invitations (team_id, invited_user_id, invited_by_user_id) VALUES (?, ?, ?)`,
        [teamId, invitedUserId, invitedByUserId],
      );
      return result.insertId;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "createInvitation failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async getPendingInvitation(teamId: number, invitedUserId: number): Promise<RowDataPacket | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_invitations WHERE team_id = ? AND invited_user_id = ? AND status = 'pending'`,
        [teamId, invitedUserId],
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "getPendingInvitation failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async respondToInvitation(invitationId: number, status: InvitationStatus): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE team_invitations SET status = ?, responded_at = NOW() WHERE id = ? AND status = 'pending'`,
        [status, invitationId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "respondToInvitation failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async getInvitationById(invitationId: number): Promise<RowDataPacket | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_invitations WHERE id = ?`,
        [invitationId],
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "getInvitationById failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async getMyInvitations(userId: number): Promise<RowDataPacket[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT ti.id, ti.team_id, ti.created_at,
                t.name AS team_name, t.tag AS team_tag,
                u.gamer_tag AS invited_by
         FROM team_invitations ti
         JOIN teams t ON t.id = ti.team_id
         JOIN users u ON u.id = ti.invited_by_user_id
         WHERE ti.invited_user_id = ? AND ti.status = 'pending'`,
        [userId],
      );
      return rows;
    } catch (err) {
      this.logger.error("TeamInvitationRepository", "getMyInvitations failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }
}
