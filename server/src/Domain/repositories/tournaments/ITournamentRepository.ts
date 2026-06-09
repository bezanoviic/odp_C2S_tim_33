import { Tournament } from "../../models/Tournament";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";

export interface ITournamentRepository {
  findAll(filters: { gameId?: number; status?: string; format?: string }): Promise<Tournament[]>;
  findById(id: number): Promise<Tournament | null>;
  create(dto: CreateTournamentDto): Promise<Tournament>;
  update(id: number, dto: Partial<CreateTournamentDto>): Promise<Tournament | null>;
  delete(id: number): Promise<boolean>;
}