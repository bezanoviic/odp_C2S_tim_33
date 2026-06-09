import { Tournament } from "../../models/Tournament";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TournamentDto";


export interface ITournamentService {
  getAll(filters: { gameId?: number; status?: string; format?: string }): Promise<TournamentDto[]>;
  getById(id: number): Promise<TournamentDto | null>;
  create(dto: CreateTournamentDto): Promise<TournamentDto | null>;
  update(id: number, dto: Partial<CreateTournamentDto>): Promise<TournamentDto | null>;
  delete(id: number): Promise<boolean>;
}