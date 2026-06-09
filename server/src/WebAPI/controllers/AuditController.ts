import { Request, Response, Router } from "express";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class AuditController {
  private readonly router = Router();

  public constructor(private readonly auditService: IAuditService) {
    this.router.get("/audits/logs", this.getLogs.bind(this));
  }

  private async getLogs(req: Request, res: Response): Promise<void> {
    console.log("AuditController.getLogs called");
    const page  = parseInt(req.query.page  as string ?? "1",  10);
    const limit = parseInt(req.query.limit as string ?? "20", 10);
    try {
      const result = await this.auditService.getLogs(
        isNaN(page)  ? 1  : page,
        isNaN(limit) ? 20 : limit,
      );
      res.status(200).json({ success: true, data: result.logs, total: result.total, page, limit });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to load audit logs" });
    }
  }

  public getRouter(): Router { return this.router; }
}