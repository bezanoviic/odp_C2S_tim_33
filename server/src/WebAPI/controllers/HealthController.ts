import { Request, Response, Router } from "express";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class HealthController {
  private readonly router = Router();

  public constructor(private readonly db: DbManager) {
    this.router.get("/health",     this.publicHealth.bind(this));
    this.router.get("/health/db",  authenticate, authorize(UserRole.ADMIN), this.dbHealth.bind(this));
  }

  private publicHealth(_req: Request, res: Response): void {
    res.status(200).json({ success: true, message: "API is running" });
  }

  private dbHealth(_req: Request, res: Response): void {
    const nodes = this.db.getNodes();
    const result = nodes.map((n) => ({
      name:        n.name,
      host:        n.host,
      port:        n.port,
      status:      n.status,
      lastCheck:   n.lastCheck,
    }));
    res.status(200).json({ success: true, data: result });
  }

  public getRouter(): Router { return this.router; }
}
