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
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
      const safePage = Math.max(Math.trunc(page), 1);
      const safeOffset = (safePage - 1) * safeLimit;
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT a.*, u.gamer_tag
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("AuditLogRepository", "findAll failed", err as Error);
      return [];
    } finally { res.conn.release(); }
  }

  async countAll(): Promise<number> {
    const res = await this.db.getReadConnection();
    if (!res) return 0;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM audit_logs`,
      );
      return rows[0].cnt;
    } catch (err) {
      this.logger.error("AuditLogRepository", "countAll failed", err as Error);
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
      this.logger.error("AuditLogRepository", "create failed", err as Error);
      throw err;
    } finally { res.conn.release(); }
  }
}
