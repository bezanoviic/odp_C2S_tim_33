export interface Tournament {
  id: number;
  name: string;
  game_id: number;
  format: "single_elimination" | "double_elimination" | "round_robin";
  max_teams: number;
  prize_pool: number | null;
  registration_deadline: Date;
  start_date: Date;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_by: number | null;
  created_at: Date;
}