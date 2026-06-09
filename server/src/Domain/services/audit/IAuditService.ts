import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";

export interface IAuditService {
  getLogs(page: number, limit: number): Promise<{ logs: AuditLogDto[]; total: number }>;
  log(
    user_id: number | null,
    action: string,
    entity_type: string,
    entity_id: number | null,
    details: string | null,
  ): Promise<void>;
}