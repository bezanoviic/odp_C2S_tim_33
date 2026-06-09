import { Request, Response, Router } from "express";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class MatchController {
  private readonly router = Router();

  public constructor(
    private readonly matchService: IMatchService,
    private readonly auditService: IAuditService,
  ) {
    this.router.get("/matches/:id/players", this.getPlayers.bind(this));
    this.router.get("/matches/tournament/:id", this.getByTournamentId.bind(this));
    this.router.get("/matches/:id", this.getById.bind(this));
    this.router.get("/tournaments/:id/matches", this.getByTournamentId.bind(this));

    this.router.post(
      "/tournaments/:id/generate-bracket",
      authenticate,
      authorize(UserRole.ADMIN),
      this.generateBracket.bind(this),
    );

    this.router.patch(
      "/matches/:id/result",
      authenticate,
      authorize(UserRole.ADMIN),
      this.updateResult.bind(this),
    );

    this.router.post(
      "/matches/:id/players",
      authenticate,
      this.addPlayers.bind(this),
    );

    this.router.put(
      "/matches/:id/players/:userId",
      authenticate,
      this.updatePlayer.bind(this),
    );

    this.router.delete(
      "/matches/:id/players/:userId",
      authenticate,
      this.removePlayer.bind(this),
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);

    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match id" });
      return;
    }

    const data = await this.matchService.getById(matchId);

    if (!data) {
      res.status(404).json({ success: false, message: "Match not found" });
      return;
    }

    res.status(200).json({ success: true, data });
  }

  private async getPlayers(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);

    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match id" });
      return;
    }

    const data = await this.matchService.getPlayers(matchId);
    res.status(200).json({ success: true, data });
  }

  private async getByTournamentId(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);
    const round = req.query.round ? parseInt(req.query.round as string, 10) : undefined;
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;
    const filters = {
      round: round !== undefined && !isNaN(round) ? round : undefined,
      status: req.query.status as string | undefined,
      teamId: teamId !== undefined && !isNaN(teamId) ? teamId : undefined,
    };

    if (isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament id" });
      return;
    }

    const data = await this.matchService.getByTournamentId(tournamentId, filters);
    res.status(200).json({ success: true, data });
  }

  private async generateBracket(req: Request, res: Response): Promise<void> {
    const tournamentId = parseInt(req.params.id as string, 10);

    if (isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament id" });
      return;
    }

    const data = await this.matchService.generateBracket(tournamentId);

    if (data.length === 0) {
      res.status(400).json({
        success: false,
        message: "Not enough confirmed teams to generate bracket",
      });
      return;
    }

    await this.auditService.log(req.user!.id, "GENERATE_BRACKET", "tournament", tournamentId, `Generated bracket for tournament ${tournamentId} (${data.length} matches)`);
    res.status(201).json({ success: true, data });
  }

  private async updateResult(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);

    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match id" });
      return;
    }

    let { team1_score, team2_score, winner_team_id } = req.body;

    if (typeof req.body.score === "string") {
      const match = /^(\d+):(\d+)$/.exec(req.body.score.trim());
      if (!match) {
        res.status(400).json({ success: false, message: "score must use X:Y format" });
        return;
      }
      team1_score = Number(match[1]);
      team2_score = Number(match[2]);
    }

    if (
      typeof team1_score !== "number" ||
      typeof team2_score !== "number" ||
      typeof winner_team_id !== "number"
    ) {
      res.status(400).json({
        success: false,
        message: "team1_score, team2_score and winner_team_id are required",
      });
      return;
    }

    const data = await this.matchService.updateResult(matchId, {
      team1_score,
      team2_score,
      winner_team_id,
    });

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Match not found or winner team is not in match",
      });
      return;
    }

    await this.auditService.log(req.user!.id, "UPDATE_MATCH_RESULT", "match", matchId, `Match ${matchId} result: ${team1_score}:${team2_score}, winner team ${winner_team_id}`);
    res.status(200).json({ success: true, data });
  }

  private async addPlayers(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);

    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match id" });
      return;
    }

    const players = Array.isArray(req.body.players) ? req.body.players : null;

    if (!players || players.length === 0) {
      res.status(400).json({
        success: false,
        message: "players array is required",
      });
      return;
    }

    const createdPlayers = [];

    for (const player of players) {
      const createdPlayer = await this.matchService.addPlayer(
        matchId,
        req.user!.id,
        player,
      );

      if (!createdPlayer) {
        res.status(403).json({
          success: false,
          message: "Unable to add players for this match",
        });
        return;
      }

      createdPlayers.push(createdPlayer);
    }

    res.status(201).json({ success: true, data: createdPlayers });
  }

  private async updatePlayer(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    const userId = parseInt(req.params.userId as string, 10);

    if (isNaN(matchId) || isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }

    const { team_id, performance_notes } = req.body;

    if (typeof team_id !== "number") {
      res.status(400).json({
        success: false,
        message: "team_id is required",
      });
      return;
    }

    const data = await this.matchService.updatePlayer(
      matchId,
      req.user!.id,
      userId,
      {
        user_id: userId,
        team_id,
        performance_notes: performance_notes ?? null,
      },
    );

    if (!data) {
      res.status(403).json({
        success: false,
        message: "Unable to update player for this match",
      });
      return;
    }

    res.status(200).json({ success: true, data });
  }

  private async removePlayer(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);
    const userId = parseInt(req.params.userId as string, 10);

    if (isNaN(matchId) || isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid id" });
      return;
    }

    const ok = await this.matchService.removePlayer(matchId, req.user!.id, userId);

    res.status(ok ? 200 : 403).json({ success: ok });
  }
}
