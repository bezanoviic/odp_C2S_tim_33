import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository } from "./Database/repositories/users/UserRepository";
// import { GameRepository } from "./Database/repositories/games/GameRepository";   // TODO: Član 1
// import { TeamRepository } from "./Database/repositories/teams/TeamRepository";   // TODO: Član 2

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
// import { GameService }   from "./Services/games/GameService";   // TODO: Član 1
// import { TeamService }   from "./Services/teams/TeamService";   // TODO: Član 2

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
// import { GameController }   from "./WebAPI/controllers/GameController";   // TODO: Član 1
// import { TeamController }   from "./WebAPI/controllers/TeamController";   // TODO: Član 2
import { HealthController } from "./WebAPI/controllers/HealthController";

import { TournamentRepository } from "./Database/repositories/tournaments/TournamentRepository";
import { TournamentService }    from "./Services/tournaments/TournamentService";
import { TournamentController } from "./WebAPI/controllers/TournamentController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo = new UserRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
//const gameRepo = new GameRepository(db, logger);
//const teamRepo = new TeamRepository(db, logger);

// Services
const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
const tournamentService = new TournamentService(tournamentRepo);
//const gameService = new GameService(gameRepo);
//const teamService = new TeamService(teamRepo);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json());

app.use("/api/v1", new HealthController(db).getRouter());
app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
//app.use("/api/v1", new GameController(gameService).getRouter());
//app.use("/api/v1", new TeamController(teamService).getRouter());

export default app;
