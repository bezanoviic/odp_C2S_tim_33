export interface GameDto {
  id: number;
  name: string;
  logo: string | null;
  genre: string;
  max_players_per_team: number;
  created_at: string;
  active_tournaments_count: number;
}

export interface CreateGameDto {
  name: string;
  logo: string | null;
  genre: string;
  max_players_per_team: number;
}