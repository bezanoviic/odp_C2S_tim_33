import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IMatchPlayerRepository } from "../../../Domain/repositories/matches/IMatchPlayerRepository";
import { MatchPlayerDto } from "../../../Domain/DTOs/matches/MatchPlayerDto";
import { UpsertMatchPlayerDto } from "../../../Domain/DTOs/matches/UpsertMatchPlayerDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class MatchPlayerRepository implements IMatchPlayerRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private mapPlayer(row: RowDataPacket): MatchPlayerDto {
    return new MatchPlayerDto(
      row.match_id,
      row.team_id,
      row.user_id,
      row.created_at,
      row.performance_notes ?? null,
    );
  }

  async addPlayer(matchId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      await res.conn.execute<ResultSetHeader>(
        `INSERT INTO match_players (match_id, team_id, user_id, performance_notes)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE team_id = VALUES(team_id), performance_notes = VALUES(performance_notes)`,
        [matchId, dto.team_id, dto.user_id, dto.performance_notes ?? null],
      );
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT match_id, team_id, user_id, performance_notes, created_at
         FROM match_players WHERE match_id = ? AND user_id = ?`,
        [matchId, dto.user_id],
      );
      return rows.length > 0 ? this.mapPlayer(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "addPlayer failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async updatePlayer(matchId: number, userId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE match_players SET team_id = ?, performance_notes = ? WHERE match_id = ? AND user_id = ?`,
        [dto.team_id, dto.performance_notes ?? null, matchId, userId],
      );
      if (result.affectedRows === 0) return null;
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT match_id, team_id, user_id, performance_notes, created_at
         FROM match_players WHERE match_id = ? AND user_id = ?`,
        [matchId, userId],
      );
      return rows.length > 0 ? this.mapPlayer(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "updatePlayer failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async removePlayer(matchId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM match_players WHERE match_id = ? AND user_id = ?`,
        [matchId, userId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "removePlayer failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async findPlayersByMatchId(matchId: number): Promise<MatchPlayerDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT match_id, team_id, user_id, performance_notes, created_at
         FROM match_players WHERE match_id = ? ORDER BY team_id ASC, user_id ASC`,
        [matchId],
      );
      return rows.map((row) => this.mapPlayer(row));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findPlayersByMatchId failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }
}
