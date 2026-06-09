import { Request, Response, Router } from "express";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { IAuditService }      from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { validateTournament } from "../validators/tournaments/validateTournament";

export class TournamentController {
  private readonly router = Router();

  public constructor(
    private readonly tournamentService: ITournamentService,
    private readonly auditService: IAuditService,
  ) {
    this.router.get("/tournaments/watchlist/me", authenticate, this.getMyWatchlist.bind(this));
    this.router.get("/tournaments",     this.getAll.bind(this));
    this.router.get("/tournaments/:id", this.getById.bind(this));
    this.router.post("/tournaments",    authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
    this.router.put("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    this.router.post("/tournaments/:id/watch",   authenticate, this.watch.bind(this));
    this.router.delete("/tournaments/:id/watch", authenticate, this.unwatch.bind(this));
    this.router.delete("/tournaments/:id", authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));
    this.router.get("/watchlist", authenticate, this.getMyWatchlist.bind(this));
    this.router.post("/watchlist/:id", authenticate, this.watch.bind(this));
    this.router.delete("/watchlist/:id", authenticate, this.unwatch.bind(this));
    this.router.post("/tournaments/:id/register",  authenticate, this.register.bind(this));
    this.router.delete("/tournaments/:id/register/:teamId", authenticate, this.unregister.bind(this));
    this.router.get("/tournaments/:id/registrations", this.getRegistrations.bind(this));
    this.router.patch("/tournaments/:id/registrations/:teamId",  authenticate, authorize(UserRole.ADMIN), this.updateStatus.bind(this));
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
    const { name, format, max_teams, registration_deadline, start_date } = req.body;
    const v = validateTournament(name, format, Number(max_teams), registration_deadline, start_date);
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }

    try {
      const data = await this.tournamentService.create(req.body);
      if (!data) { res.status(500).json({ success: false, message: "Failed to create tournament" }); return; }
      await this.auditService.log(req.user!.id, "CREATE_TOURNAMENT", "tournament", data.id, `Created tournament: ${data.name}`);
      res.status(201).json({ success: true, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tournament";
      res.status(500).json({ success: false, message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const { name, format, max_teams, status } = req.body;
    if (name !== undefined && (String(name).trim().length < 3 || String(name).trim().length > 120)) {
      res.status(400).json({ success: false, message: "Tournament name must be 3–120 characters" }); return;
    }
    if (format !== undefined && !["single_elimination", "double_elimination", "round_robin"].includes(format)) {
      res.status(400).json({ success: false, message: "Invalid format" }); return;
    }
    if (status !== undefined && !["upcoming", "ongoing", "completed", "cancelled"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" }); return;
    }
    if (max_teams !== undefined) {
      const mt = Number(max_teams);
      const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;
      if (!Number.isInteger(mt) || mt < 2 || mt > 256 || !isPowerOfTwo(mt)) {
        res.status(400).json({ success: false, message: "max_teams must be a power of 2 and between 2 and 256" }); return;
      }
    }
    const data = await this.tournamentService.update(id, req.body);
    if (!data) { res.status(404).json({ success: false, message: "Tournament not found" }); return; }
    await this.auditService.log(req.user!.id, "UPDATE_TOURNAMENT", "tournament", id, `Updated tournament id: ${id}`);
    res.status(200).json({ success: true, data });
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tournamentService.delete(id);
    if (ok) await this.auditService.log(req.user!.id, "DELETE_TOURNAMENT", "tournament", id, `Deleted tournament id: ${id}`);
    res.status(ok ? 200 : 404).json({ success: ok });
  }

  public getRouter(): Router { return this.router; }

  private async watch(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    if (isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tournamentService.watch(req.user!.id, tournamentId);
    res.status(ok ? 200 : 500).json({ success: ok });
  }

  private async unwatch(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    if (isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tournamentService.unwatch(req.user!.id, tournamentId);
    res.status(ok ? 200 : 404).json({ success: ok });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    const teamId = parseInt(req.body.team_id as string, 10);
    if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const result = await this.tournamentService.register(tournamentId, teamId);
    res.status(result.ok ? 200 : result.statusCode).json({ success: result.ok, message: result.message });
  }

  private async unregister(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    const teamId = parseInt(req.params.teamId as string, 10);
    if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const ok = await this.tournamentService.unregister(tournamentId, teamId);
    res.status(ok ? 200 : 404).json({ success: ok });
  }

  private async getRegistrations(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    if (isNaN(tournamentId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    const data = await this.tournamentService.getRegistrations(tournamentId);
    res.status(200).json({ success: true, data });
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    const teamId = parseInt(req.params.teamId as string, 10);
    const { status } = req.body;
    if (isNaN(tournamentId) || isNaN(teamId)) { res.status(400).json({ success: false, message: "Invalid id" }); return; }
    if (!status) { res.status(400).json({ success: false, message: "Status required" }); return; }
    if (!["pending", "confirmed", "disqualified"].includes(String(status))) {
      res.status(400).json({ success: false, message: "Invalid registration status" }); return;
    }
    const ok = await this.tournamentService.updateRegistrationStatus(tournamentId, teamId, status);
    res.status(ok ? 200 : 404).json({ success: ok });
  }

  private async getMyWatchlist(req: Request, res: Response): Promise<void> {
    const data = await this.tournamentService.getWatchlist(req.user!.id);
    res.status(200).json({ success: true, data });
  }
}