import { IMatchRepository } from "../../Domain/repositories/matches/IMatchRepository";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { Match } from "../../Domain/models/Match";
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { MatchPlayerDto } from "../../Domain/DTOs/matches/MatchPlayerDto";
import { UpdateMatchResultDto } from "../../Domain/DTOs/matches/UpdateMatchResultDto";
import { UpsertMatchPlayerDto } from "../../Domain/DTOs/matches/UpsertMatchPlayerDto";

export class MatchService implements IMatchService {
  public constructor(private readonly matchRepo: IMatchRepository) {}

  async getById(id: number): Promise<MatchDto | null> {
    const match = await this.matchRepo.findById(id);
    return match ? this.toDto(match) : null;
  }

  async getByTournamentId(tournamentId: number): Promise<MatchDto[]> {
    const matches = await this.matchRepo.findByTournamentId(tournamentId);
    return matches.map((match) => this.toDto(match));
  }

  async generateBracket(tournamentId: number): Promise<MatchDto[]> {
    const teamIds = await this.matchRepo.findApprovedTeamIdsByTournamentId(tournamentId);
    console.log("[DEBUG] generateBracket tournamentId=", tournamentId, "teamIds=", teamIds);

    if (teamIds.length < 2) {
      return [];
    }

    const bracketSize = this.getNextPowerOfTwo(teamIds.length);
    const totalRounds = Math.log2(bracketSize);
    const paddedTeamIds: Array<number | null> = [...teamIds];

    while (paddedTeamIds.length < bracketSize) {
      paddedTeamIds.push(null);
    }

    const matches = [];

    for (let index = 0; index < paddedTeamIds.length; index += 2) {
      const team1Id = paddedTeamIds[index];
      const team2Id = paddedTeamIds[index + 1];

      matches.push({
        tournament_id: tournamentId,
        round_number: 1,
        match_number: index / 2 + 1,
        team1_id: team1Id,
        team2_id: team2Id,
        scheduled_at: null,
      });
    }

    for (let round = 2; round <= totalRounds; round += 1) {
      const matchesInRound = bracketSize / Math.pow(2, round);

      for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber += 1) {
        matches.push({
          tournament_id: tournamentId,
          round_number: round,
          match_number: matchNumber,
          team1_id: null,
          team2_id: null,
          scheduled_at: null,
        });
      }
    }

    const createdMatches = await this.matchRepo.createMany(matches);

    for (const match of createdMatches) {
      if (match.round_number !== 1) {
        continue;
      }

      if (match.team1_id && !match.team2_id) {
        await this.advanceByeWinner(match, match.team1_id);
      }

      if (!match.team1_id && match.team2_id) {
        await this.advanceByeWinner(match, match.team2_id);
      }
    }

    const tournamentMatches = await this.matchRepo.findByTournamentId(tournamentId);
    return tournamentMatches.map((match) => this.toDto(match));
  }

  async updateResult(
    matchId: number,
    dto: UpdateMatchResultDto,
  ): Promise<MatchDto | null> {
    const match = await this.matchRepo.findById(matchId);

    if (!match) {
      return null;
    }

    if (!this.isTeamInMatch(match, dto.winner_team_id)) {
      return null;
    }

    const updatedMatch = await this.matchRepo.updateResult(matchId, dto);

    if (!updatedMatch) {
      return null;
    }

    await this.advanceWinner(updatedMatch, dto.winner_team_id);

    return this.toDto(updatedMatch);
  }

  async addPlayer(
    matchId: number,
    currentUserId: number,
    dto: UpsertMatchPlayerDto,
  ): Promise<MatchPlayerDto | null> {
    const match = await this.matchRepo.findById(matchId);

    if (!match) {
      return null;
    }

    const allowed = await this.canManageTeamPlayer(
      match,
      currentUserId,
      dto.user_id,
      dto.team_id,
    );

    if (!allowed) {
      return null;
    }

    return this.matchRepo.addPlayer(matchId, dto);
  }

  async updatePlayer(
    matchId: number,
    currentUserId: number,
    userId: number,
    dto: UpsertMatchPlayerDto,
  ): Promise<MatchPlayerDto | null> {
    const match = await this.matchRepo.findById(matchId);

    if (!match) {
      return null;
    }

    const allowed = await this.canManageTeamPlayer(
      match,
      currentUserId,
      userId,
      dto.team_id,
    );

    if (!allowed) {
      return null;
    }

    return this.matchRepo.updatePlayer(matchId, userId, dto);
  }

  async removePlayer(
    matchId: number,
    currentUserId: number,
    userId: number,
  ): Promise<boolean> {
    const match = await this.matchRepo.findById(matchId);

    if (!match) {
      return false;
    }

    const players = await this.matchRepo.findPlayersByMatchId(matchId);
    const player = players.find((item: MatchPlayerDto) => item.user_id === userId);

    if (!player) {
      return false;
    }

    if (!this.isTeamInMatch(match, player.team_id)) {
      return false;
    }

    const isCaptain = await this.matchRepo.isUserTeamCaptain(
      currentUserId,
      player.team_id,
    );

    if (!isCaptain) {
      return false;
    }

    return this.matchRepo.removePlayer(matchId, userId);
  }

  async getPlayers(matchId: number): Promise<MatchPlayerDto[]> {
    return this.matchRepo.findPlayersByMatchId(matchId);
  }

  private toDto(match: Match): MatchDto {
    return {
      id: match.id,
      tournament_id: match.tournament_id,
      round_number: match.round_number,
      match_number: match.match_number,
      team1_id: match.team1_id,
      team2_id: match.team2_id,
      winner_team_id: match.winner_team_id,
      team1_score: match.team1_score,
      team2_score: match.team2_score,
      status: match.status,
      scheduled_at: match.scheduled_at,
      created_at: match.created_at,
      updated_at: match.updated_at,
    };
  }

  private getNextPowerOfTwo(value: number): number {
    let size = 1;

    while (size < value) {
      size *= 2;
    }

    return size;
  }

  private isTeamInMatch(match: Match, teamId: number): boolean {
    return match.team1_id === teamId || match.team2_id === teamId;
  }

  private async canManageTeamPlayer(
    match: Match,
    captainId: number,
    userId: number,
    teamId: number,
  ): Promise<boolean> {
    if (!this.isTeamInMatch(match, teamId)) {
      return false;
    }

    const isCaptain = await this.matchRepo.isUserTeamCaptain(captainId, teamId);

    if (!isCaptain) {
      return false;
    }

    return this.matchRepo.isUserTeamMember(userId, teamId);
  }

  private async advanceByeWinner(match: Match, winnerTeamId: number): Promise<void> {
    await this.advanceWinner(match, winnerTeamId);
  }

  private async advanceWinner(match: Match, winnerTeamId: number): Promise<void> {
    const nextRound = match.round_number + 1;
    const nextMatchNumber = Math.ceil(match.match_number / 2);
    const slot = match.match_number % 2 === 1 ? "team1_id" : "team2_id";

    const tournamentMatches = await this.matchRepo.findByTournamentId(match.tournament_id);
    const nextMatch = tournamentMatches.find(
      (item) =>
        item.round_number === nextRound &&
        item.match_number === nextMatchNumber,
    );

    if (!nextMatch) {
      return;
    }

    await this.matchRepo.updateNextMatchTeam(nextMatch.id, winnerTeamId, slot);
  }
}