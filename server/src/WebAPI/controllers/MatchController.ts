
import { Request, Response, Router } from "express";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../../Domain/enums/UserRole";

export class MatchController {
  private readonly router = Router();

  public constructor(private readonly matchService: IMatchService) {
    this.router.get("/matches/:id/players", authenticate, this.getPlayers.bind(this));
    this.router.get("/matches/:id", authenticate, this.getById.bind(this));
    this.router.get("/tournaments/:id/matches", authenticate, this.getByTournamentId.bind(this));

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

    if (isNaN(tournamentId)) {
      res.status(400).json({ success: false, message: "Invalid tournament id" });
      return;
    }

    const data = await this.matchService.getByTournamentId(tournamentId);
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

    res.status(201).json({ success: true, data });
  }

  private async updateResult(req: Request, res: Response): Promise<void> {
    const matchId = parseInt(req.params.id as string, 10);

    if (isNaN(matchId)) {
      res.status(400).json({ success: false, message: "Invalid match id" });
      return;
    }

    const { team1_score, team2_score, winner_team_id } = req.body;

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

    const { team_id } = req.body;

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
