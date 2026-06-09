import { Request, Response, Router } from "express";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";
import { Result, ResultKind } from "../../Domain/types/Result";

const RESULT_HTTP_STATUS: Record<ResultKind, number> = {
  [ResultKind.SUCCESS]:        200,
  [ResultKind.NOT_FOUND]:      404,
  [ResultKind.FORBIDDEN]:      403,
  [ResultKind.CONFLICT]:       409,
  [ResultKind.INVALID]:        400,
  [ResultKind.INTERNAL_ERROR]: 500,
};

const parseId = (raw: string | string[] | undefined): number | null => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(value ?? "", 10);
  return isNaN(id) ? null : id;
};

export class TournamentController {
  private readonly router = Router();

  public constructor(
    private readonly tournamentService: ITournamentService,
    private readonly auditService: IAuditService,
  ) {
    this.router.get("/tournaments/watchlist/me", authenticate, this.getMyWatchlist.bind(this));
    this.router.get("/tournaments",              this.getAll.bind(this));
    this.router.get("/tournaments/:id",          this.getById.bind(this));
    this.router.post("/tournaments",             authenticate, authorize(UserRole.ADMIN), this.create.bind(this));
    this.router.put("/tournaments/:id",          authenticate, authorize(UserRole.ADMIN), this.update.bind(this));
    this.router.delete("/tournaments/:id",       authenticate, authorize(UserRole.ADMIN), this.delete.bind(this));

    this.router.post("/tournaments/:id/watch",   authenticate, this.watch.bind(this));
    this.router.delete("/tournaments/:id/watch", authenticate, this.unwatch.bind(this));
    this.router.get("/watchlist",                authenticate, this.getMyWatchlist.bind(this));
    this.router.post("/watchlist/:id",           authenticate, this.watch.bind(this));
    this.router.delete("/watchlist/:id",         authenticate, this.unwatch.bind(this));

    this.router.post("/tournaments/:id/register",                authenticate, this.register.bind(this));
    this.router.delete("/tournaments/:id/register/:teamId",      authenticate, this.unregister.bind(this));
    this.router.get("/registrations",                            authenticate, authorize(UserRole.ADMIN), this.getAllRegistrations.bind(this));
    this.router.get("/tournaments/:id/registrations",            this.getRegistrations.bind(this));
    this.router.patch("/tournaments/:id/registrations/:teamId",  authenticate, authorize(UserRole.ADMIN), this.updateStatus.bind(this));
  }

  public getRouter(): Router {
    return this.router;
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
    const id = parseId(req.params.id);
    if (id === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const data = await this.tournamentService.getById(id);
    if (!data) { res.status(404).json({ success: false, message: "Tournament not found" }); return; }

    res.status(200).json({ success: true, data });
  }

  private async create(req: Request, res: Response): Promise<void> {
    const result = await this.tournamentService.create({ ...req.body, created_by: req.user!.id });
    if (result.kind === ResultKind.SUCCESS) {
      await this.auditService.log(req.user!.id, "CREATE_TOURNAMENT", "tournament", result.data.id, `Created tournament: ${result.data.name}`);
      res.status(201).json({ success: true, data: result.data });
      return;
    }
    this.sendFailure(res, result);
  }

  private async update(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (id === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const result = await this.tournamentService.update(id, req.body);
    if (result.kind === ResultKind.SUCCESS) {
      await this.auditService.log(req.user!.id, "UPDATE_TOURNAMENT", "tournament", id, `Updated tournament id: ${id}`);
      res.status(200).json({ success: true, data: result.data });
      return;
    }
    this.sendFailure(res, result);
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (id === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const success = await this.tournamentService.delete(id);
    if (success) {
      await this.auditService.log(req.user!.id, "DELETE_TOURNAMENT", "tournament", id, `Deleted tournament id: ${id}`);
    }
    res.status(success ? 200 : 404).json({ success });
  }

  private async watch(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    if (tournamentId === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const success = await this.tournamentService.watch(req.user!.id, tournamentId);
    res.status(success ? 200 : 500).json({ success });
  }

  private async unwatch(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    if (tournamentId === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const success = await this.tournamentService.unwatch(req.user!.id, tournamentId);
    res.status(success ? 200 : 404).json({ success });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    const teamId = parseId(req.body.team_id);
    if (tournamentId === null || teamId === null) {
      res.status(400).json({ success: false, message: "Invalid id" }); return;
    }

    const result = await this.tournamentService.register(tournamentId, teamId, req.user!.id);
    if (result.kind === ResultKind.SUCCESS) {
      await this.auditService.log(req.user!.id, "REGISTER_TEAM", "tournament_registration", tournamentId, `Team ${teamId} registered for tournament ${tournamentId}`);
      res.status(200).json({ success: true, message: "Registration successful" });
      return;
    }
    this.sendFailure(res, result);
  }

  private async unregister(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    const teamId = parseId(req.params.teamId);
    if (tournamentId === null || teamId === null) {
      res.status(400).json({ success: false, message: "Invalid id" }); return;
    }

    const success = await this.tournamentService.unregister(tournamentId, teamId);
    if (success) {
      await this.auditService.log(req.user!.id, "UNREGISTER_TEAM", "tournament_registration", tournamentId, `Team ${teamId} withdrew from tournament ${tournamentId}`);
    }
    res.status(success ? 200 : 404).json({ success });
  }

  private async getRegistrations(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    if (tournamentId === null) { res.status(400).json({ success: false, message: "Invalid id" }); return; }

    const data = await this.tournamentService.getRegistrations(tournamentId);
    res.status(200).json({ success: true, data });
  }

  private async getAllRegistrations(_req: Request, res: Response): Promise<void> {
    const data = await this.tournamentService.getAllRegistrations();
    res.status(200).json({ success: true, data });
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    const tournamentId = parseId(req.params.id);
    const teamId = parseId(req.params.teamId);
    if (tournamentId === null || teamId === null) {
      res.status(400).json({ success: false, message: "Invalid id" }); return;
    }

    const { status } = req.body as { status?: string };
    if (!status) { res.status(400).json({ success: false, message: "Status required" }); return; }

    const result = await this.tournamentService.updateRegistrationStatus(tournamentId, teamId, status);
    if (result.kind === ResultKind.SUCCESS) {
      await this.auditService.log(req.user!.id, "REGISTRATION_STATUS_CHANGE", "tournament_registration", tournamentId, `Set team ${teamId} status to '${status}' in tournament ${tournamentId}`);
      res.status(200).json({ success: true });
      return;
    }
    this.sendFailure(res, result);
  }

  private async getMyWatchlist(req: Request, res: Response): Promise<void> {
    const data = await this.tournamentService.getWatchlist(req.user!.id);
    res.status(200).json({ success: true, data });
  }

  private sendFailure<T>(res: Response, result: Exclude<Result<T>, { kind: ResultKind.SUCCESS }>): void {
    res.status(RESULT_HTTP_STATUS[result.kind]).json({ success: false, message: result.message });
  }
}
