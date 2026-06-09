export class GameDto {
  constructor(
    public id: number,
    public name: string,
    public logo: string | null,
    public genre: string,
    public max_players_per_team: number,
    public created_at: Date,
    public active_tournaments_count: number = 0,
    public available_tournaments: { id: number; name: string }[] = [],
    public tournaments: { id: number; name: string; status: string }[] = [],
  ) {}
}
