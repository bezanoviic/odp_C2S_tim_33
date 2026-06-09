import { Request, Response, Router } from "express";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

const API_NODES = [
  { name: "api-1", url: `http://localhost:${process.env.PORT ?? 4000}/api/v1/health` },
];

export class HealthController {
  private readonly router = Router();

  public constructor(private readonly db: DbManager) {
    this.router.get("/health",      this.publicHealth.bind(this));
    this.router.get("/health/db",   authenticate, authorize(UserRole.ADMIN), this.dbHealth.bind(this));
    this.router.get("/health/api",  authenticate, authorize(UserRole.ADMIN), this.apiHealth.bind(this));
  }

  private publicHealth(_req: Request, res: Response): void {
    res.status(200).json({ success: true, message: "API is running" });
  }

  private dbHealth(_req: Request, res: Response): void {
    const nodes = this.db.getNodes();
    const result = nodes.map((n) => ({
      name:      n.name,
      host:      n.host,
      port:      n.port,
      status:    n.status,
      lastCheck: n.lastCheck,
    }));
    res.status(200).json({ success: true, data: result });
  }

  private async apiHealth(_req: Request, res: Response): Promise<void> {
    const results = await Promise.all(
      API_NODES.map(async (node) => {
        const start = Date.now();
        try {
          const r = await fetch(node.url, { signal: AbortSignal.timeout(3000) });
          const latency = Date.now() - start;
          return { name: node.name, url: node.url, status: r.ok ? "healthy" : "degraded", latency };
        } catch {
          return { name: node.name, url: node.url, status: "unreachable", latency: null };
        }
      }),
    );
    res.status(200).json({ success: true, data: results });
  }

  public getRouter(): Router { return this.router; }
}