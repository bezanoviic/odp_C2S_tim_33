import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { Game } from "../../../Domain/models/Game";
import { GameDto } from "../../../Domain/DTOs/games/GameDto";
import { CreateGameDto } from "../../../Domain/DTOs/games/CreateGameDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class GameRepository implements IGameRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): GameDto {
    return new GameDto(
      r.id,
      r.name,
      r.logo,
      r.genre,
      r.max_players_per_team,
      new Date(r.created_at),
      r.active_tournaments_count ?? 0,
    );
  }

  async findAll(): Promise<GameDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT g.*, COUNT(t.id) as active_tournaments_count
         FROM games g
         LEFT JOIN tournaments t ON t.game_id = g.id AND t.status NOT IN ('completed','cancelled')
         GROUP BY g.id
         ORDER BY g.name ASC`,
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("GameRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findById(id: number): Promise<GameDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT g.*, COUNT(t.id) as active_tournaments_count
         FROM games g
         LEFT JOIN tournaments t ON t.game_id = g.id AND t.status NOT IN ('completed','cancelled')
         WHERE g.id = ?
         GROUP BY g.id`,
        [id],
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("GameRepository", "findById failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async create(dto: CreateGameDto): Promise<Game> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Game();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO games (name, logo, genre, max_players_per_team) VALUES (?, ?, ?, ?)`,
        [dto.name, dto.logo, dto.genre, dto.max_players_per_team],
      );
      if (result.insertId === 0) return new Game();
      return new Game(result.insertId, dto.name, dto.logo, dto.genre, dto.max_players_per_team);
    } catch (err) {
      this.logger.error("GameRepository", "create failed", err);
      return new Game();
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<CreateGameDto>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE games SET ${setClause} WHERE id = ?`,
        [...values, id],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("GameRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM games WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("GameRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async hasTournaments(id: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM tournaments WHERE game_id = ?`,
        [id],
      );
      return rows[0].cnt > 0;
    } catch (err) {
      this.logger.error("GameRepository", "hasTournaments failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}