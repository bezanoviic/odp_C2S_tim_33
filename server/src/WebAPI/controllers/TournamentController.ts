import { Request, Response, Router } from "express";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class TournamentController {
  private readonly router = Router();

  public constructor(private readonly tournamentService: ITournamentService) {
    this.router.get("/tournaments",     this.getAll.bind(this));
    this.router.get("/tournaments/:id", this.getById.bind(this));
    this.router.post("/tournaments",    authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
    this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    const filters = {
      gameId: req.query.gameId ? parseInt(req.query.gameId as string, 10) : undefined,
      status: req.query.status as string | undefined,
      format: req.query.format as string | undefined,
    };
    const data = await this.tournamentService.getAll(filters);
    res.status(200).json({ success: true, data });
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const data = await this.tournamentService.getById(id);
    if (!data) { res.status(404).json({ success: false, message: "Tournament not found" }); return; }
    res.status(200).json({ success: true, data });
  }

  private async create(req: Request, res: Response): Promise<void> {
    const dto = req.body;
    const data = await this.tournamentService.create(dto);
    if (!data) { res.status(500).json({ success: false, message: "Failed to create tournament" }); return; }
    res.status(201).json({ success: true, data });
  }

  private async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const data = await this.tournamentService.update(id, req.body);
    if (!data) { res.status(404).json({ success: false, message: "Tournament not found" }); return; }
    res.status(200).json({ success: true, data });
  }

  private async delete(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tournamentService.delete(id);
    res.status(ok ? 200 : 404).json({ success: ok });
  }

  public getRouter(): Router { return this.router; }
}