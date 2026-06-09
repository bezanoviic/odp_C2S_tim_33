import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";
import { authenticate } from "./Middlewares/authentification/AuthMiddleware";

import { UserRepository } from "./Database/repositories/users/UserRepository";
import { GameRepository } from "./Database/repositories/games/GameRepository";
import { AuditLogRepository } from "./Database/repositories/audit/AuditLogRepository";
import { TournamentRepository } from "./Database/repositories/tournaments/TournamentRepository";
import { WatchlistRepository } from "./Database/repositories/watchlist/WatchlistRepository";
import { TournamentRegistrationRepository } from "./Database/repositories/registrations/TournamentRegistrationRepository";
import { MatchRepository } from "./Database/repositories/matches/MatchRepository";
import { MatchPlayerRepository } from "./Database/repositories/matches/MatchPlayerRepository";
import { TeamRepository } from "./Database/repositories/teams/TeamRepository";
import { TeamMemberRepository } from "./Database/repositories/teams/TeamMemberRepository";
import { TeamInvitationRepository } from "./Database/repositories/teams/TeamInvitationRepository";

import { AuthService } from "./Services/auth/AuthService";
import { UserService } from "./Services/users/UserService";
import { GameService } from "./Services/games/GameService";
import { AuditService } from "./Services/audit/AuditService";
import { TournamentService } from "./Services/tournaments/TournamentService";
import { MatchService } from "./Services/matches/MatchService";
import { TeamService } from "./Services/teams/TeamService";

import { AuthController } from "./WebAPI/controllers/AuthController";
import { UserController } from "./WebAPI/controllers/UserController";
import { GameController } from "./WebAPI/controllers/GameController";
import { AuditController } from "./WebAPI/controllers/AuditController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { TournamentController } from "./WebAPI/controllers/TournamentController";
import { MatchController } from "./WebAPI/controllers/MatchController";
import { TeamController } from "./WebAPI/controllers/TeamController";

export const logger = new ConsoleLoggerService();
export const db = new DbManager(logger);

// Repositories
const userRepo = new UserRepository(db, logger);
const gameRepo = new GameRepository(db, logger);
const auditRepo = new AuditLogRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
const watchlistRepo = new WatchlistRepository(db, logger);
const registrationRepo = new TournamentRegistrationRepository(db, logger);
const matchRepo = new MatchRepository(db, logger);
const matchPlayerRepo = new MatchPlayerRepository(db, logger);
const teamRepo = new TeamRepository(db, logger);
const teamMemberRepo = new TeamMemberRepository(db, logger);
const teamInvitationRepo = new TeamInvitationRepository(db, logger);

// Services
const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
const gameService = new GameService(gameRepo);
const auditService = new AuditService(auditRepo);
const tournamentService = new TournamentService(tournamentRepo, watchlistRepo, registrationRepo, teamMemberRepo);
const matchService = new MatchService(matchRepo, matchPlayerRepo, teamMemberRepo, registrationRepo);
const teamService = new TeamService(teamRepo, teamMemberRepo, teamInvitationRepo);

// Controllers
const teamController = new TeamController(teamService);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/v1", new HealthController(db).getRouter());
app.use("/api/v1", new AuthController(authService, auditService).getRouter());
app.use("/api/v1", new UserController(userService, auditService).getRouter());
app.use("/api/v1", new GameController(gameService, auditService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService, auditService).getRouter());
app.use("/api/v1", new MatchController(matchService, auditService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());

app.post("/api/v1/teams", authenticate, (req, res) => teamController.createTeam(req, res));
app.get("/api/v1/teams", authenticate, (req, res) => teamController.getMyTeams(req, res));
app.get("/api/v1/teams/invitations/my", authenticate, (req, res) => teamController.getMyInvitations(req, res));
app.get("/api/v1/teams/:id/members", (req, res) => teamController.getTeamMembers(req, res));
app.get("/api/v1/teams/:id", (req, res) => teamController.getTeam(req, res));
app.delete("/api/v1/teams/:id", authenticate, (req, res) => teamController.deleteTeam(req, res));
app.post("/api/v1/teams/:id/invite", authenticate, (req, res) => teamController.inviteUser(req, res));
app.post("/api/v1/teams/:id/invite/respond", authenticate, (req, res) => teamController.respondToInvite(req, res));
app.put("/api/v1/teams/:id", authenticate, (req, res) => teamController.updateTeam(req, res));
app.delete("/api/v1/teams/:id/leave", authenticate, (req, res) => teamController.leaveTeam(req, res));
app.delete("/api/v1/teams/:id/members/:userId", authenticate, (req, res) => teamController.kickMember(req, res));
app.patch("/api/v1/teams/:id/transfer-captain", authenticate, (req, res) => teamController.transferCaptain(req, res));

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error("HTTP", "Unhandled request error", err instanceof Error ? err : new Error(String(err)));
  res.status(500).json({ success: false, message: "Internal server error" });
};

app.use(errorHandler);

export default app;
