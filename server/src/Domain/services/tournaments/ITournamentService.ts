import { Tournament } from "../../models/Tournament";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";


export interface ITournamentService {
  getAll(filters: { gameId?: number; status?: string; format?: string }): Promise<TournamentDto[]>;
  getById(id: number): Promise<TournamentDto | null>;
  create(dto: CreateTournamentDto): Promise<TournamentDto | null>;
  update(id: number, dto: Partial<CreateTournamentDto>): Promise<TournamentDto | null>;
  delete(id: number): Promise<boolean>;
  watch(userId: number, tournamentId: number): Promise<boolean>;
  unwatch(userId: number, tournamentId: number): Promise<boolean>;
  getWatchlist(userId: number): Promise<TournamentDto[]>;
  register(tournamentId: number, teamId: number): Promise<boolean>;
  unregister(tournamentId: number, teamId: number): Promise<boolean>;
  getRegistrations(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: Date }[]>;
  updateRegistrationStatus(tournamentId: number, teamId: number, status: string): Promise<boolean>;
}