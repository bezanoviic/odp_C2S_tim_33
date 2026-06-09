import { Request, Response, Router } from "express";
import { IGameService } from "../../Domain/services/games/IGameService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class GameController {
  private readonly router = Router();

  public constructor(
    private readonly gameService: IGameService,
    private readonly auditService: IAuditService,
  ) {
    this.router.get("/games",        this.getAll.bind(this));
    this.router.get("/games/:id",    this.getById.bind(this));
    this.router.post("/games",       authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
    this.router.put("/games/:id",    authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    this.router.delete("/games/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
  }

  private async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getAll();
      res.status(200).json({ success: true, data: games });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to load games" });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    try {
      const game = await this.gameService.getById(id);
      if (!game) { res.status(404).json({ success: false, message: "Game not found" }); return; }
      res.status(200).json({ success: true, data: game });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to load game" });
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    const { name, logo, genre, max_players_per_team } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
      res.status(400).json({ success: false, message: "Name is required (1-100 characters)" }); return;
    }
    if (!genre || typeof genre !== "string" || genre.trim().length < 1) {
      res.status(400).json({ success: false, message: "Genre is required" }); return;
    }
    if (!max_players_per_team || typeof max_players_per_team !== "number" || max_players_per_team < 1) {
      res.status(400).json({ success: false, message: "max_players_per_team must be a positive number" }); return;
    }
    try {
      const game = await this.gameService.create({ name: name.trim(), logo: logo ?? null, genre: genre.trim(), max_players_per_team });
      if (!game) { res.status(500).json({ success: false, message: "Failed to create game" }); return; }
      await this.auditService.log(req.user!.id, "CREATE_GAME", "game", game.id, `Created game: ${game.name}`);
      res.status(201).json({ success: true, data: game });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to create game" });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const { name, logo, genre, max_players_per_team } = req.body;
    try {
      const ok = await this.gameService.update(id, { name, logo, genre, max_players_per_team });
      if (!ok) { res.status(404).json({ success: false, message: "Game not found" }); return; }
      await this.auditService.log(req.user!.id, "UPDATE_GAME", "game", id, `Updated game id: ${id}`);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to update game" });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    try {
      const ok = await this.gameService.delete(id);
      if (!ok) { res.status(400).json({ success: false, message: "Cannot delete game with existing tournaments" }); return; }
      await this.auditService.log(req.user!.id, "DELETE_GAME", "game", id, `Deleted game id: ${id}`);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to delete game" });
    }
  }

  public getRouter(): Router { return this.router; }
}