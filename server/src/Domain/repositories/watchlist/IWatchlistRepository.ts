export interface IWatchlistRepository {
  add(userId: number, tournamentId: number): Promise<boolean>;
  remove(userId: number, tournamentId: number): Promise<boolean>;
  findByUserId(userId: number): Promise<number[]>;
  exists(userId: number, tournamentId: number): Promise<boolean>;
}