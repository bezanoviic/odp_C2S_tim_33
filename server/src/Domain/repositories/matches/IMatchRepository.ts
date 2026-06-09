import { Match } from "../../models/Match";
import { UpdateMatchResultDto } from "../../DTOs/matches/UpdateMatchResultDto";
import { UpsertMatchPlayerDto } from "../../DTOs/matches/UpsertMatchPlayerDto";
import { MatchPlayerDto } from "../../DTOs/matches/MatchPlayerDto";

export interface CreateMatchData {
  tournament_id: number;
  round_number: number;
  match_number: number;
  team1_id: number | null;
  team2_id: number | null;
  scheduled_at?: Date | null;
}

export interface IMatchRepository {
  findById(id: number): Promise<Match | null>;
  findByTournamentId(tournamentId: number): Promise<Match[]>;
  findApprovedTeamIdsByTournamentId(tournamentId: number): Promise<number[]>;

  create(data: CreateMatchData): Promise<Match>;
  createMany(matches: CreateMatchData[]): Promise<Match[]>;

  updateResult(matchId: number, dto: UpdateMatchResultDto): Promise<Match | null>;
  updateNextMatchTeam(matchId: number, teamId: number, slot: "team1_id" | "team2_id"): Promise<boolean>;

  addPlayer(matchId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  updatePlayer(matchId: number, userId: number, dto: UpsertMatchPlayerDto): Promise<MatchPlayerDto | null>;
  removePlayer(matchId: number, userId: number): Promise<boolean>;
  findPlayersByMatchId(matchId: number): Promise<MatchPlayerDto[]>;

  isUserTeamCaptain(userId: number, teamId: number): Promise<boolean>;
  isUserTeamMember(userId: number, teamId: number): Promise<boolean>;
}