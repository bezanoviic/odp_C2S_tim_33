import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";
import { Result } from "../../types/Result";

export interface TournamentRegistrationListItem {
  team_id: number;
  status: string;
  registered_at: Date;
}

export interface TournamentRegistrationDetailedItem extends TournamentRegistrationListItem {
  tournament_id: number;
  tournament_name: string;
  team_name: string;
  team_tag: string;
}

export interface TournamentFilters {
  gameId?: number;
  status?: string;
  format?: string;
}

export interface ITournamentService {
  getAll(filters: TournamentFilters): Promise<TournamentDto[]>;
  getById(id: number): Promise<TournamentDto | null>;
  create(dto: CreateTournamentDto): Promise<Result<TournamentDto>>;
  update(id: number, dto: Partial<CreateTournamentDto> & { status?: string }): Promise<Result<TournamentDto>>;
  delete(id: number): Promise<boolean>;
  watch(userId: number, tournamentId: number): Promise<boolean>;
  unwatch(userId: number, tournamentId: number): Promise<boolean>;
  getWatchlist(userId: number): Promise<TournamentDto[]>;
  register(tournamentId: number, teamId: number, userId: number): Promise<Result<void>>;
  unregister(tournamentId: number, teamId: number): Promise<boolean>;
  getRegistrations(tournamentId: number): Promise<TournamentRegistrationListItem[]>;
  getAllRegistrations(): Promise<TournamentRegistrationDetailedItem[]>;
  updateRegistrationStatus(tournamentId: number, teamId: number, status: string): Promise<Result<void>>;
}
