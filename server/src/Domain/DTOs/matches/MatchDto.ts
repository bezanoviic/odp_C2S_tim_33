export class MatchDto {
  constructor(
    public id: number,
    public tournament_id: number,
    public round_number: number,
    public match_number: number,
    public team1_id: number | null,
    public team2_id: number | null,
    public team1_score: number | null,
    public team2_score: number | null,
    public winner_team_id: number | null,
    public status: string,
    public scheduled_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
  ) {}
}