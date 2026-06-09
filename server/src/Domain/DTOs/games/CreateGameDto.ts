export class CreateGameDto {
  constructor(
    public name: string,
    public logo: string | null,
    public genre: string,
    public max_players_per_team: number,
  ) {}
}