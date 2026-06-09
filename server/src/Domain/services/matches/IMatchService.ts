import { MatchDto } from "../../DTOs/matches/MatchDto";
import { MatchPlayerDto } from "../../DTOs/matches/MatchPlayerDto";
import { UpdateMatchResultDto } from "../../DTOs/matches/UpdateMatchResultDto";
import { UpsertMatchPlayerDto } from "../../DTOs/matches/UpsertMatchPlayerDto";

export interface IMatchService {
  getById(id: number): Promise<MatchDto | null>;
  getByTournamentId(tournamentId: number): Promise<MatchDto[]>;

  generateBracket(tournamentId: number): Promise<MatchDto[]>;
  updateResult(matchId: number, dto: UpdateMatchResultDto): Promise<MatchDto | null>;

  addPlayer(matchId: number, currentUserId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  updatePlayer(matchId: number, currentUserId: number, userId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  removePlayer(matchId: number, currentUserId: number, userId: number): Promise<boolean>;
  getPlayers(matchId: number): Promise<MatchPlayerDto[]>;
}
