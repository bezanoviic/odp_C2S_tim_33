import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";

export interface IAuditLogRepository {
  findAll(page: number, limit: number): Promise<AuditLogDto[]>;
  countAll(): Promise<number>;
  create(
    user_id: number | null,
    action: string,
    entity_type: string,
    entity_id: number | null,
    details: string | null,
  ): Promise<boolean>;
}