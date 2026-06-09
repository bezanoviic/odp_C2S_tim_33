export class MatchPlayerDto {
  constructor(
    public match_id: number,
    public team_id: number,
    public user_id: number,
    public created_at: Date,
    public performance_notes: string | null = null,
  ) {}
}