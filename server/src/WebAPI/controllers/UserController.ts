import { Request, Response, Router } from "express";
import { IUserService }  from "../../Domain/services/users/IUserService";
import { authenticate }  from "../../Middlewares/authentification/AuthMiddleware";
import { authorize }     from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole }      from "../../Domain/enums/UserRole";

export class UserController {
  private readonly router = Router();

  public constructor(private readonly userService: IUserService) {
    this.router.get("/users/all",       authenticate, authorize(UserRole.ADMIN), this.getAll.bind(this));
    this.router.get("/users/search",    authenticate, this.search.bind(this));
    this.router.get("/users/:id",       authenticate, this.getById.bind(this));
    this.router.put("/users/:id/role",  authenticate, authorize(UserRole.ADMIN), this.changeRole.bind(this));
    this.router.put("/users/:id",       authenticate, this.updateProfile.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAll();
      res.status(200).json({ success: true, data: users });
    } catch {
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
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = String(req.query.q ?? "").trim();
      if (!q || q.length < 2) { res.status(400).json({ success: false, message: "Query must be at least 2 characters" }); return; }
      const users = await this.userService.searchByGamerTag(q);
      res.status(200).json({ success: true, data: users });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      if (req.user!.id !== id) { res.status(403).json({ success: false, message: "You can only update your own profile" }); return; }

      const { full_name, profile_image, gamer_tag, email } = req.body as {
        full_name?: string; profile_image?: string | null; gamer_tag?: string; email?: string;
      };

      if (full_name !== undefined && (full_name.trim().length < 2 || full_name.trim().length > 100)) {
        res.status(400).json({ success: false, message: "Full name must be 2-100 characters" }); return;
      }
      if (gamer_tag !== undefined) {
        if (!/^[a-zA-Z0-9\-.]{3,30}$/.test(gamer_tag)) {
          res.status(400).json({ success: false, message: "Gamer tag: 3-30 chars, letters/numbers/hyphen/dot" }); return;
        }
        const existing = await this.userService.findByGamerTag(gamer_tag);
        if (existing && existing.id !== id) {
          res.status(409).json({ success: false, message: "Gamer tag already taken" }); return;
        }
      }
      if (email !== undefined) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          res.status(400).json({ success: false, message: "Invalid email address" }); return;
        }
        const existing = await this.userService.findByEmail(email);
        if (existing && existing.id !== id) {
          res.status(409).json({ success: false, message: "Email already taken" }); return;
        }
      }

      const ok = await this.userService.updateProfile(id, { full_name, profile_image, gamer_tag, email });
      res.status(ok ? 200 : 404).json({ success: ok, message: ok ? "Profile updated" : "User not found" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async changeRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const { role } = req.body as { role?: string };
      if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
      if (!role || !["player", "admin"].includes(role)) {
        res.status(400).json({ success: false, message: "Role must be 'player' or 'admin'" }); return;
      }
      const ok = await this.userService.changeRole(id, role);
      res.status(ok ? 200 : 404).json({ success: ok, message: ok ? "Role updated" : "User not found" });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router { return this.router; }
}