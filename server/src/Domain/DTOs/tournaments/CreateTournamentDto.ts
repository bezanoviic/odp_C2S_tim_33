export interface CreateTournamentDto {
  name: string;
  game_id: number;
  format: "single_elimination" | "double_elimination" | "round_robin";
  max_teams: number;
  prize_pool?: number;
  registration_deadline: Date;
  start_date: Date;
}