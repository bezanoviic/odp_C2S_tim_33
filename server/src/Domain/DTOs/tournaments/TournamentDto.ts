export class TournamentDto {
  constructor(
    public id: number,
    public name: string,
    public game_id: number,
    public format: string,
    public max_teams: number,
   public prize_pool: number | null,
    public registration_deadline: Date,
    public start_date: Date,
    public status: string,
    public created_by: number | null,
    public created_at: Date,
  ) {}
}