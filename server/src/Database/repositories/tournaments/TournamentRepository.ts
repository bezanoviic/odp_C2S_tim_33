import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITournamentRepository } from "../../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from "../../../Domain/models/Tournament";
import { CreateTournamentDto } from "../../../Domain/DTOs/tournaments/CreateTournamentDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TournamentRepository implements ITournamentRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Tournament {
    return {
      id: r.id,
      name: r.name,
      game_id: r.game_id,
      format: r.format,
      max_teams: r.max_teams,
      prize_pool: r.prize_pool,
      registration_deadline: r.registration_deadline,
      start_date: r.start_date,
      status: r.status,
      created_by: r.created_by,
      created_at: r.created_at,
    };
  }

  private formatDate(value: string | Date): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date");

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  async findAll(filters: { gameId?: number; status?: string; format?: string }): Promise<Tournament[]> {
    const res = await this.db.getMasterConnection();
    if (!res) return [];
    try {
      let query = `SELECT * FROM tournaments WHERE 1=1`;
      const params: (number | string)[] = [];

      if (filters.gameId) { query += ` AND game_id = ?`; params.push(filters.gameId); }
      if (filters.status) { query += ` AND status = ?`; params.push(filters.status); }
      if (filters.format) { query += ` AND format = ?`; params.push(filters.format); }

      query += ` ORDER BY created_at DESC`;
      const [rows] = await res.conn.execute<RowDataPacket[]>(query, params);
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findById(id: number): Promise<Tournament | null> {
    const res = await this.db.getMasterConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM tournaments WHERE id = ?`, [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("TournamentRepository", "findById failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async create(dto: CreateTournamentDto): Promise<Tournament> {
    const res = await this.db.getWriteConnection();
    if (!res) throw new Error("No DB connection");
    try {
      const registrationDeadline = this.formatDate(dto.registration_deadline);
      const startDate = this.formatDate(dto.start_date);

      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournaments (name, game_id, format, max_teams, prize_pool, registration_deadline, start_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dto.name, dto.game_id, dto.format, dto.max_teams, dto.prize_pool ?? 0,
         registrationDeadline, startDate]
      );

      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM tournaments WHERE id = ?`,
        [result.insertId],
      );
      if (rows.length === 0) throw new Error("Failed to fetch created tournament");
      return this.map(rows[0]);
    } catch (err) {
      this.logger.error("TournamentRepository", "create failed", err);
      throw err;
    } finally { res.conn.release(); }
  }

  async update(id: number, dto: Partial<CreateTournamentDto>): Promise<Tournament | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const fields: string[] = [];
      const params: (string | number | Date)[] = [];

      if (dto.name)                  { fields.push("name = ?");                  params.push(dto.name); }
      if (dto.format)                { fields.push("format = ?");                params.push(dto.format); }
      if (dto.status)               { fields.push("status = ?");                params.push(dto.status); }
      if (dto.max_teams)             { fields.push("max_teams = ?");             params.push(dto.max_teams); }
      if (dto.prize_pool !== undefined) { fields.push("prize_pool = ?");         params.push(dto.prize_pool); }
      if (dto.registration_deadline) {
        fields.push("registration_deadline = ?");
        params.push(this.formatDate(dto.registration_deadline));
      }
      if (dto.start_date) {
        fields.push("start_date = ?");
        params.push(this.formatDate(dto.start_date));
      }

      if (fields.length === 0) return this.findById(id);

      params.push(id);
      await res.conn.execute<ResultSetHeader>(
        `UPDATE tournaments SET ${fields.join(", ")} WHERE id = ?`, params
      );
      return this.findById(id);
    } catch (err) {
      this.logger.error("TournamentRepository", "update failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM tournaments WHERE id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}
