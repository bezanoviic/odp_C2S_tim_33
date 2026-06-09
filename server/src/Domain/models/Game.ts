export class Game {
  constructor(
    public id: number = 0,
    public name: string = "",
    public logo: string | null = null,
    public genre: string = "",
    public max_players_per_team: number = 0,
    public created_at: Date = new Date(),
    public updated_at: Date = new Date(),
  ) {}
}