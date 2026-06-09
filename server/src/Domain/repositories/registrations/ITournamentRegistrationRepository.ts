export interface ITournamentRegistrationRepository {
  register(tournamentId: number, teamId: number): Promise<boolean>;
  unregister(tournamentId: number, teamId: number): Promise<boolean>;
  findByTournamentId(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: Date }[]>;
  exists(tournamentId: number, teamId: number): Promise<boolean>;
  getTeamMemberRequirement(tournamentId: number, teamId: number): Promise<{ memberCount: number; requiredMembers: number } | null>;
  countByTournamentId(tournamentId: number): Promise<number>;
  updateStatus(tournamentId: number, teamId: number, status: string): Promise<boolean>;
  findAllDetailed(): Promise<{ tournament_id: number; tournament_name: string; team_id: number; team_name: string; team_tag: string; status: string; registered_at: Date }[]>;
  findApprovedTeamIdsByTournamentId(tournamentId: number): Promise<number[]>;
}
