export interface UpsertMatchPlayerDto {
  team_id: number;
  user_id: number;
  performance_notes?: string | null;
}