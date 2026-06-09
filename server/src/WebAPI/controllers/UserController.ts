import { Request, Response, Router } from "express";
import { IUserService }  from "../../Domain/services/users/IUserService";
import { authenticate }  from "../../Middlewares/authentification/AuthMiddleware";
import { authorize }     from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole }      from "../../Domain/enums/UserRole";

export class UserController {
  private readonly router = Router();

  public constructor(private readonly userService: IUserService) {
    this.router.get("/users/all",       authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    this.router.get("/users/:id",       authenticate, this.getById.bind(this));
    this.router.put("/users/:id/role",  authenticate, authorize(UserRole.ADMIN), this.changeRole.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAll();
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      const user = await this.userService.getById(id);
      if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async changeRole(req: Request, res: Response): Promise<void> {
    try {
      const id   = parseInt(String(req.params.id), 10);
      const { role } = req.body as { role?: string };
      if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      if (!role || !["player", "admin"].includes(role)) {
        res.status(400).json({ success: false, message: "Role must be 'player' or 'admin'" }); return;
      }
      const ok = await this.userService.changeRole(id, role);
      res.status(ok ? 200 : 404).json({ success: ok, message: ok ? "Role updated" : "User not found" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router { return this.router; }
}
