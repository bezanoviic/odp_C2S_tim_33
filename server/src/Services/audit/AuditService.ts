import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IAuditLogRepository } from "../../Domain/repositories/audit/IAuditLogRepository";
import { AuditLogDto } from "../../Domain/DTOs/audit/AuditLogDto";

export class AuditService implements IAuditService {
  public constructor(private readonly auditRepo: IAuditLogRepository) {}

  async getLogs(
    page: number,
    limit: number,
  ): Promise<{ logs: AuditLogDto[]; total: number }> {
    console.log("AuditService.getLogs called", page, limit);
    const [logs, total] = await Promise.all([
      this.auditRepo.findAll(page, limit),
      this.auditRepo.countAll(),
    ]);
    console.log("AuditService.getLogs result", logs.length, total);
    return { logs, total };
  }

  async log(
    user_id: number | null,
    action: string,
    entity_type: string,
    entity_id: number | null,
    details: string | null,
  ): Promise<void> {
    await this.auditRepo.create(user_id, action, entity_type, entity_id, details);
  }
}