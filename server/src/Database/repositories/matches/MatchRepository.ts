import { ResultSetHeader, RowDataPacket } from "mysql2";
import { CreateMatchData, IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { Match } from "../../../Domain/models/Match";
import { UpdateMatchResultDto } from "../../../Domain/DTOs/matches/UpdateMatchResultDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class MatchRepository implements IMatchRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private mapMatch(row: RowDataPacket): Match {
    return {
      id: row.id,
      tournament_id: row.tournament_id,
      round_number: row.round_number,
      match_number: row.match_number,
      team1_id: row.team1_id,
      team2_id: row.team2_id,
      team1_score: row.team1_score,
      team2_score: row.team2_score,
      winner_team_id: row.winner_team_id,
      status: row.status,
      scheduled_at: row.scheduled_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findById(id: number): Promise<Match | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE id = ?`,
        [id],
      );
      return rows.length > 0 ? this.mapMatch(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchRepository", "findById failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async findByTournamentId(
    tournamentId: number,
    filters: { round?: number; status?: string; teamId?: number } = {},
  ): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      let query = `SELECT * FROM matches WHERE tournament_id = ?`;
      const params: (number | string)[] = [tournamentId];

      if (filters.round !== undefined) {
        query += ` AND round_number = ?`;
        params.push(filters.round);
      }
      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }
      if (filters.teamId !== undefined) {
        query += ` AND (team1_id = ? OR team2_id = ? OR winner_team_id = ?)`;
        params.push(filters.teamId, filters.teamId, filters.teamId);
      }

      query += ` ORDER BY round_number ASC, match_number ASC`;
      const [rows] = await res.conn.execute<RowDataPacket[]>(query, params);
      return rows.map((row) => this.mapMatch(row));
    } catch (err) {
      this.logger.error("MatchRepository", "findByTournamentId failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async create(data: CreateMatchData): Promise<Match> {
    const res = await this.db.getWriteConnection();
    if (!res) throw new Error("No DB connection");
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO matches (tournament_id, round_number, match_number, team1_id, team2_id, scheduled_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.tournament_id,
          data.round_number,
          data.match_number,
          data.team1_id,
          data.team2_id,
          data.scheduled_at ?? null,
        ],
      );
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE id = ?`,
        [result.insertId],
      );
      if (rows.length === 0) throw new Error("Failed to fetch created match");
      return this.mapMatch(rows[0]);
    } catch (err) {
      this.logger.error("MatchRepository", "create failed", err as Error);
      throw err;
    } finally {
      res.conn.release();
    }
  }

  async createMany(matches: CreateMatchData[]): Promise<Match[]> {
    const created: Match[] = [];
    for (const match of matches) {
      const createdMatch = await this.create(match);
      created.push(createdMatch);
    }
    return created;
  }

  async updateResult(matchId: number, dto: UpdateMatchResultDto): Promise<Match | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches
         SET team1_score = ?, team2_score = ?, winner_team_id = ?, status = 'completed'
         WHERE id = ?`,
        [dto.team1_score, dto.team2_score, dto.winner_team_id, matchId],
      );
      if (result.affectedRows === 0) return null;
      return this.findById(matchId);
    } catch (err) {
      this.logger.error("MatchRepository", "updateResult failed", err as Error);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async updateNextMatchTeam(matchId: number, teamId: number, slot: "team1_id" | "team2_id"): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches SET ${slot} = ? WHERE id = ?`,
        [teamId, matchId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "updateNextMatchTeam failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }
}
