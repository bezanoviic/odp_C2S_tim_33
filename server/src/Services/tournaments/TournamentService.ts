import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from "../../Domain/models/Tournament";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";

export class TournamentService implements ITournamentService {
  public constructor(private readonly tournamentRepo: ITournamentRepository) {}

  private toDto(t: Tournament): TournamentDto {
    return new TournamentDto(
      t.id, t.name, t.game_id, t.format, t.max_teams,
      t.prize_pool, t.registration_deadline, t.start_date,
      t.status, t.created_by ?? null, t.created_at,
    );
  }

  async getAll(filters: { gameId?: number; status?: string; format?: string }): Promise<TournamentDto[]> {
    const tournaments = await this.tournamentRepo.findAll(filters);
    return tournaments.map((t) => this.toDto(t));
  }

  async getById(id: number): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.findById(id);
    return t ? this.toDto(t) : null;
  }

  async create(dto: CreateTournamentDto): Promise<TournamentDto | null> {
    try {
      const t = await this.tournamentRepo.create(dto);
      return this.toDto(t);
    } catch {
      return null;
    }
  }

  async update(id: number, dto: Partial<CreateTournamentDto>): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.update(id, dto);
    return t ? this.toDto(t) : null;
  }

  async delete(id: number): Promise<boolean> {
    return this.tournamentRepo.delete(id);
  }
}