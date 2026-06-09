import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from "../../Domain/models/Tournament";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { IWatchlistRepository } from "../../Domain/repositories/watchlist/IWatchlistRepository";
import { ITournamentRegistrationRepository } from "../../Domain/repositories/registrations/ITournamentRegistrationRepository";

export class TournamentService implements ITournamentService {
  public constructor(
  private readonly tournamentRepo: ITournamentRepository,
  private readonly watchlistRepo: IWatchlistRepository,
  private readonly registrationRepo: ITournamentRegistrationRepository,
) {}

  private toDto(t: Tournament): TournamentDto {
    return new TournamentDto(
      t.id, t.name, t.game_id, t.format, t.max_teams,
      t.prize_pool, t.registration_deadline, t.start_date,
      t.status, t.created_by ?? null, t.created_at,
    );
  }

  async getAll(filters: { gameId?: number; status?: string; format?: string }): Promise<TournamentDto[]> {
    const tournaments = await this.tournamentRepo.findAll(filters);
    return tournaments.map((t) => this.toDto(t));
  }

  async getById(id: number): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.findById(id);
    return t ? this.toDto(t) : null;
  }

  async create(dto: CreateTournamentDto): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.create(dto);
    return this.toDto(t);
  }

  async update(id: number, dto: Partial<CreateTournamentDto>): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.update(id, dto);
    return t ? this.toDto(t) : null;
  }

  async delete(id: number): Promise<boolean> {
    return this.tournamentRepo.delete(id);
  }

  async watch(userId: number, tournamentId: number): Promise<boolean> {
  return this.watchlistRepo.add(userId, tournamentId);
}

async unwatch(userId: number, tournamentId: number): Promise<boolean> {
  return this.watchlistRepo.remove(userId, tournamentId);
}

async getWatchlist(userId: number): Promise<TournamentDto[]> {
  const tournamentIds = await this.watchlistRepo.findByUserId(userId);
  const tournaments = await Promise.all(
    tournamentIds.map((id) => this.tournamentRepo.findById(id))
  );
  return tournaments
    .filter((t): t is Tournament => t !== null)
    .map((t) => this.toDto(t));
}

async register(tournamentId: number, teamId: number): Promise<{ ok: boolean; statusCode: number; message: string }> {
  const tournament = await this.tournamentRepo.findById(tournamentId);
  if (!tournament) return { ok: false, statusCode: 404, message: "Tournament not found" };

  if (tournament.status !== "upcoming")
    return { ok: false, statusCode: 400, message: "Registration is only available for upcoming tournaments" };

  const teamSize = await this.registrationRepo.getTeamMemberRequirement(tournamentId, teamId);
  if (!teamSize) return { ok: false, statusCode: 404, message: "Tournament or team not found" };

  if (teamSize.memberCount < teamSize.requiredMembers) {
    return {
      ok: false,
      statusCode: 400,
      message: `Team must have at least ${teamSize.requiredMembers} members to register for this tournament`,
    };
  }

  const alreadyRegistered = await this.registrationRepo.exists(tournamentId, teamId);
  if (alreadyRegistered) return { ok: false, statusCode: 409, message: "Team is already registered for this tournament" };

  const ok = await this.registrationRepo.register(tournamentId, teamId);
  return ok
    ? { ok: true, statusCode: 200, message: "Registration successful" }
    : { ok: false, statusCode: 500, message: "Registration failed" };
}

async unregister(tournamentId: number, teamId: number): Promise<boolean> {
  return this.registrationRepo.unregister(tournamentId, teamId);
}

async getRegistrations(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: Date }[]> {
  return this.registrationRepo.findByTournamentId(tournamentId);
}

async updateRegistrationStatus(tournamentId: number, teamId: number, status: string): Promise<boolean> {
  return this.registrationRepo.updateStatus(tournamentId, teamId, status);
}
}
