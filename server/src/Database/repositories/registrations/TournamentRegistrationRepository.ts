import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITournamentRegistrationRepository } from "../../../Domain/repositories/registrations/ITournamentRegistrationRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TournamentRegistrationRepository implements ITournamentRegistrationRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async register(tournamentId: number, teamId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      await res.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO tournament_registrations (tournament_id, team_id, status) VALUES (?, ?, 'pending')`,
        [tournamentId, teamId]
      );
      return true;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "register failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async unregister(tournamentId: number, teamId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM tournament_registrations WHERE tournament_id = ? AND team_id = ?`,
        [tournamentId, teamId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "unregister failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async findByTournamentId(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: Date }[]> {
    const res = await this.db.getMasterConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT team_id, status, registered_at FROM tournament_registrations WHERE tournament_id = ?`,
        [tournamentId]
      );
      return rows.map((r) => ({ team_id: r.team_id, status: r.status, registered_at: r.registered_at }));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournamentId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async exists(tournamentId: number, teamId: number): Promise<boolean> {
    const res = await this.db.getMasterConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM tournament_registrations WHERE tournament_id = ? AND team_id = ?`,
        [tournamentId, teamId]
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "exists failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async getTeamMemberRequirement(tournamentId: number, teamId: number): Promise<{ memberCount: number; requiredMembers: number } | null> {
    const res = await this.db.getMasterConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(tm.user_id) AS member_count,
                g.max_players_per_team AS required_members
         FROM tournaments t
         JOIN games g ON g.id = t.game_id
         JOIN teams selected_team ON selected_team.id = ?
         LEFT JOIN team_members tm ON tm.team_id = selected_team.id
         WHERE t.id = ?
         GROUP BY g.max_players_per_team`,
        [teamId, tournamentId]
      );
      if (rows.length === 0) return null;
      return {
        memberCount: Number(rows[0].member_count),
        requiredMembers: Number(rows[0].required_members),
      };
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "getTeamMemberRequirement failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async updateStatus(tournamentId: number, teamId: number, status: string): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE tournament_registrations SET status = ? WHERE tournament_id = ? AND team_id = ?`,
        [status, tournamentId, teamId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "updateStatus failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}
