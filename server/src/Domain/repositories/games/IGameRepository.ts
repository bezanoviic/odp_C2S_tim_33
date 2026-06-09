import { GameDto } from "../../DTOs/games/GameDto";
import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { Game } from "../../models/Game";

export interface IGameRepository {
  findAll(): Promise<GameDto[]>;
  findById(id: number): Promise<GameDto | null>;
  create(dto: CreateGameDto): Promise<Game>;
  update(id: number, fields: Partial<CreateGameDto>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  hasTournaments(id: number): Promise<boolean>;
}