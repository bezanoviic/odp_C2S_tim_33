import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditLogRepository } from "../../../Domain/repositories/audit/IAuditLogRepository";
import { AuditLogDto } from "../../../Domain/DTOs/audit/AuditLogDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class AuditLogRepository implements IAuditLogRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): AuditLogDto {
    return new AuditLogDto(
      r.id,
      r.user_id,
      r.gamer_tag ?? null,
      r.action,
      r.entity_type,
      r.entity_id,
      r.details,
      new Date(r.created_at),
    );
  }

  async findAll(page: number, limit: number): Promise<AuditLogDto[]> {
    const res = await this.db.getMasterConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const sql = `SELECT a.*, u.gamer_tag FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const [rows] = await res.conn.execute<RowDataPacket[]>(sql);
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("AuditLogRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async countAll(): Promise<number> {
    const res = await this.db.getMasterConnection();
    if (!res) return 0;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM audit_logs`,
      );
      return rows[0].cnt;
    } catch (err) {
      this.logger.error("AuditLogRepository", "countAll failed", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async create(
    user_id: number | null,
    action: string,
    entity_type: string,
    entity_id: number | null,
    details: string | null,
  ): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) throw new Error("No write connection available for audit log");
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
        [user_id, action, entity_type, entity_id, details],
      );
      if (result.affectedRows === 0) {
        throw new Error("Audit log insert wrote 0 rows");
      }
      return true;
    } catch (err) {
      this.logger.error("AuditLogRepository", "create failed", err);
      throw err;
    } finally { res.conn.release(); }
  }
}