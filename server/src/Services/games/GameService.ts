import { IGameService } from "../../Domain/services/games/IGameService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { GameDto } from "../../Domain/DTOs/games/GameDto";
import { CreateGameDto } from "../../Domain/DTOs/games/CreateGameDto";

export class GameService implements IGameService {
  public constructor(private readonly gameRepo: IGameRepository) {}

  async getAll(): Promise<GameDto[]> {
    return this.gameRepo.findAll();
  }

  async getById(id: number): Promise<GameDto | null> {
    return this.gameRepo.findById(id);
  }

  async create(dto: CreateGameDto): Promise<GameDto | null> {
    const created = await this.gameRepo.create(dto);
    if (created.id === 0) return null;
    return new GameDto(
      created.id,
      created.name,
      created.logo,
      created.genre,
      created.max_players_per_team,
      created.created_at,
      0,
    );
  }

  async update(id: number, fields: Partial<CreateGameDto>): Promise<boolean> {
    return this.gameRepo.update(id, fields);
  }

  async delete(id: number): Promise<boolean> {
    const hasTournaments = await this.gameRepo.hasTournaments(id);
    if (hasTournaments) return false;
    return this.gameRepo.delete(id);
  }
}