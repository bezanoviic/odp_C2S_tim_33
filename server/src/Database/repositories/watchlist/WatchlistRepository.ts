import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IWatchlistRepository } from "../../../Domain/repositories/watchlist/IWatchlistRepository";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class WatchlistRepository implements IWatchlistRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async add(userId: number, tournamentId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      await res.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO user_watchlist (user_id, tournament_id) VALUES (?, ?)`,
        [userId, tournamentId]
      );
      return true;
    } catch (err) {
      this.logger.error("WatchlistRepository", "add failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async remove(userId: number, tournamentId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`,
        [userId, tournamentId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("WatchlistRepository", "remove failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async findByUserId(userId: number): Promise<number[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT tournament_id FROM user_watchlist WHERE user_id = ?`,
        [userId]
      );
      return rows.map((r) => r.tournament_id);
    } catch (err) {
      this.logger.error("WatchlistRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async exists(userId: number, tournamentId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1 FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`,
        [userId, tournamentId]
      );
      return rows.length > 0;
    } catch (err) {
      this.logger.error("WatchlistRepository", "exists failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}