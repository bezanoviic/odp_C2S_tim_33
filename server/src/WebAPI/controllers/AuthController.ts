import { Request, Response, Router } from "express";
import { IAuthService }    from "../../Domain/services/auth/IAuthService";
import { IAuditService }   from "../../Domain/services/audit/IAuditService";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateLogin }    from "../validators/auth/validateLogin";
import { validateRegister } from "../validators/auth/validateRegister";
import { authenticate }     from "../../Middlewares/authentification/AuthMiddleware";
import { UserRole }         from "../../Domain/enums/UserRole";

export class AuthController {
  private readonly router = Router();

  public constructor(
    private readonly authService: IAuthService,
    private readonly auditService?: IAuditService,
  ) {
    this.router.post("/auth/login",    this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/logout",   authenticate, this.logout.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { gamer_tag, password } = req.body as { gamer_tag?: string; password?: string };

      const v: ValidationResult = validateLogin(gamer_tag ?? "", password ?? "");
      if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }

      const result = await this.authService.login(gamer_tag!, password!);
      if (result.id === 0) {
        res.status(401).json({ success: false, message: "Invalid gamer tag or password" });
        return;
      }

      const token = this.authService.issueToken(result);

      await this.logAudit(result.id, "LOGIN", "user", result.id, `User logged in: ${result.gamer_tag}`);
      res.status(200).json({ success: true, message: "Login successful", data: token });
    } catch (err) {
      console.error("[AuthController]", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { gamer_tag, full_name, email, password, profile_image } = req.body as {
        gamer_tag?: string; full_name?: string; email?: string; password?: string; profile_image?: string;
      };

      const v: ValidationResult = validateRegister(gamer_tag ?? "", full_name ?? "", email ?? "", password ?? "");
      if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }

      const result = await this.authService.register(
        gamer_tag!, full_name!, email!, UserRole.PLAYER, password!, profile_image ?? null,
      );
      if (result.id === 0) {
        res.status(409).json({ success: false, message: "Gamer tag or email already taken" });
        return;
      }

      const token = this.authService.issueToken(result);

      await this.logAudit(result.id, "REGISTER", "user", result.id, `User registered: ${result.gamer_tag}`);
      res.status(201).json({ success: true, message: "Registration successful", data: token });
    } catch (err) {
      console.error("[AuthController]", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async logout(req: Request, res: Response): Promise<void> {
    await this.logAudit(req.user!.id, "LOGOUT", "user", req.user!.id, `User logged out: ${req.user!.gamer_tag}`);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  }

  private async logAudit(userId: number, action: string, entityType: string, entityId: number, details: string): Promise<void> {
    try {
      await this.auditService?.log(userId, action, entityType, entityId, details);
    } catch {
      // Audit logging never blocks auth flows.
    }
  }

  public getRouter(): Router { return this.router; }
}
