import { MatchPlayerDto } from "../../DTOs/matches/MatchPlayerDto";
import { UpsertMatchPlayerDto } from "../../DTOs/matches/UpsertMatchPlayerDto";

export interface IMatchPlayerRepository {
  addPlayer(matchId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  updatePlayer(matchId: number, userId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  removePlayer(matchId: number, userId: number): Promise<boolean>;
  findPlayersByMatchId(matchId: number): Promise<MatchPlayerDto[]>;
}
