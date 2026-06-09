import { Match } from "../../models/Match";
import { UpdateMatchResultDto } from "../../DTOs/matches/UpdateMatchResultDto";

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
  findByTournamentId(tournamentId: number, filters?: { round?: number; status?: string; teamId?: number }): Promise<Match[]>;

  create(data: CreateMatchData): Promise<Match>;
  createMany(matches: CreateMatchData[]): Promise<Match[]>;

  updateResult(matchId: number, dto: UpdateMatchResultDto): Promise<Match | null>;
  updateNextMatchTeam(matchId: number, teamId: number, slot: "team1_id" | "team2_id"): Promise<boolean>;
}
