export interface ITournamentRegistrationRepository {
  register(tournamentId: number, teamId: number): Promise<boolean>;
  unregister(tournamentId: number, teamId: number): Promise<boolean>;
  findByTournamentId(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: Date }[]>;
  exists(tournamentId: number, teamId: number): Promise<boolean>;
  getTeamMemberRequirement(tournamentId: number, teamId: number): Promise<{ memberCount: number; requiredMembers: number } | null>;
  updateStatus(tournamentId: number, teamId: number, status: string): Promise<boolean>;
}
