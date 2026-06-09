import { GameDto } from "../../DTOs/games/GameDto";
import { CreateGameDto } from "../../DTOs/games/CreateGameDto";

export interface IGameService {
  getAll(): Promise<GameDto[]>;
  getById(id: number): Promise<GameDto | null>;
  create(dto: CreateGameDto): Promise<GameDto | null>;
  update(id: number, fields: Partial<CreateGameDto>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}