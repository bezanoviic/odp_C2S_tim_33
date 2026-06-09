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
    const res = await this.db.getReadConnection();
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
    const res = await this.db.getReadConnection();
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