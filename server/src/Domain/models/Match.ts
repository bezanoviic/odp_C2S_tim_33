export interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  team1_id: number | null;
  team2_id: number | null;
  team1_score: number | null;
  team2_score: number | null;
  winner_team_id: number | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}