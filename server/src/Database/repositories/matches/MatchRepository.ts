import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  CreateMatchData,
  IMatchRepository,
} from "../../../Domain/repositories/matches/IMatchRepository";
import { Match } from "../../../Domain/models/Match";
import { MatchPlayerDto } from "../../../Domain/DTOs/matches/MatchPlayerDto";
import { UpdateMatchResultDto } from "../../../Domain/DTOs/matches/UpdateMatchResultDto";
import { UpsertMatchPlayerDto } from "../../../Domain/DTOs/matches/UpsertMatchPlayerDto";
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

  private mapPlayer(row: RowDataPacket): MatchPlayerDto {
    return new MatchPlayerDto(
      row.match_id,
      row.team_id,
      row.user_id,
      row.created_at,
    );
  }

  async findById(id: number): Promise<Match | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT *
         FROM matches
         WHERE id = ?`,
        [id],
      );

      return rows.length > 0 ? this.mapMatch(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchRepository", "findById failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async findByTournamentId(tournamentId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT *
         FROM matches
         WHERE tournament_id = ?
         ORDER BY round_number ASC, match_number ASC`,
        [tournamentId],
      );

      return rows.map((row) => this.mapMatch(row));
    } catch (err) {
      this.logger.error("MatchRepository", "findByTournamentId failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async findApprovedTeamIdsByTournamentId(tournamentId: number): Promise<number[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT team_id
         FROM tournament_registrations
         WHERE tournament_id = ? AND status = 'approved'
         ORDER BY registered_at ASC`,
        [tournamentId],
      );

      return rows.map((row) => row.team_id);
    } catch (err) {
      this.logger.error("MatchRepository", "findApprovedTeamIdsByTournamentId failed", err);
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
        `INSERT INTO matches
         (tournament_id, round_number, match_number, team1_id, team2_id, scheduled_at)
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

      const created = await this.findById(result.insertId);
      if (!created) throw new Error("Failed to fetch created match");

      return created;
    } catch (err) {
      this.logger.error("MatchRepository", "create failed", err);
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

  async updateResult(
    matchId: number,
    dto: UpdateMatchResultDto,
  ): Promise<Match | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches
         SET team1_score = ?,
             team2_score = ?,
             winner_team_id = ?,
             status = 'completed'
         WHERE id = ?`,
        [dto.team1_score, dto.team2_score, dto.winner_team_id, matchId],
      );

      if (result.affectedRows === 0) return null;

      return this.findById(matchId);
    } catch (err) {
      this.logger.error("MatchRepository", "updateResult failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async updateNextMatchTeam(
    matchId: number,
    teamId: number,
    slot: "team1_id" | "team2_id",
  ): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches
         SET ${slot} = ?
         WHERE id = ?`,
        [teamId, matchId],
      );

      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "updateNextMatchTeam failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async addPlayer(
    matchId: number,
    dto: UpsertMatchPlayerDto,
  ): Promise<MatchPlayerDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;

    try {
      await res.conn.execute<ResultSetHeader>(
        `INSERT INTO match_players (match_id, team_id, user_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE team_id = VALUES(team_id)`,
        [matchId, dto.team_id, dto.user_id],
      );

      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT match_id, team_id, user_id, created_at
         FROM match_players
         WHERE match_id = ? AND user_id = ?`,
        [matchId, dto.user_id],
      );

      return rows.length > 0 ? this.mapPlayer(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchRepository", "addPlayer failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  async updatePlayer(
    matchId: number,
    userId: number,
    dto: UpsertMatchPlayerDto,
  ): Promise<MatchPlayerDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;

    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE match_players
         SET team_id = ?
         WHERE match_id = ? AND user_id = ?`,
        [dto.team_id, matchId, userId],
      );

      if (result.affectedRows === 0) return null;

      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT match_id, team_id, user_id, created_at
         FROM match_players
         WHERE match_id = ? AND user_id = ?`,
        [matchId, userId],
      );

      return rows.length > 0 ? this.mapPlayer(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchRepository", "updatePlayer failed", err);
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
        `DELETE FROM match_players
         WHERE match_id = ? AND user_id = ?`,
        [matchId, userId],
      );

      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "removePlayer failed", err);
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
        `SELECT match_id, team_id, user_id, created_at
         FROM match_players
         WHERE match_id = ?
         ORDER BY team_id ASC, user_id ASC`,
        [matchId],
      );

      return rows.map((row) => this.mapPlayer(row));
    } catch (err) {
      this.logger.error("MatchRepository", "findPlayersByMatchId failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async isUserTeamCaptain(userId: number, teamId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1
         FROM teams
         WHERE id = ? AND captain_id = ?`,
        [teamId, userId],
      );

      return rows.length > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "isUserTeamCaptain failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async isUserTeamMember(userId: number, teamId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;

    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT 1
         FROM team_members
         WHERE team_id = ? AND user_id = ?`,
        [teamId, userId],
      );

      return rows.length > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "isUserTeamMember failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }
}