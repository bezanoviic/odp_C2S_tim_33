import {
  ITournamentService,
  TournamentFilters,
  TournamentRegistrationDetailedItem,
  TournamentRegistrationListItem,
} from "../../Domain/services/tournaments/ITournamentService";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IWatchlistRepository } from "../../Domain/repositories/watchlist/IWatchlistRepository";
import { ITournamentRegistrationRepository } from "../../Domain/repositories/registrations/ITournamentRegistrationRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/teams/ITeamMemberRepository";
import { Tournament } from "../../Domain/models/Tournament";
import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TournamentDto";
import { TournamentStatus } from "../../Domain/enums/TournamentStatus";
import { RegistrationStatus } from "../../Domain/enums/RegistrationStatus";
import { Result, ResultKind, fail, ok } from "../../Domain/types/Result";
import { TournamentValidator } from "./TournamentValidator";

const VALID_REGISTRATION_STATUSES = Object.values(RegistrationStatus) as string[];

export class TournamentService implements ITournamentService {
  private readonly validator = new TournamentValidator();

  public constructor(
    private readonly tournamentRepo: ITournamentRepository,
    private readonly watchlistRepo: IWatchlistRepository,
    private readonly registrationRepo: ITournamentRegistrationRepository,
    private readonly teamMemberRepo: ITeamMemberRepository,
  ) {}

  async getAll(filters: TournamentFilters): Promise<TournamentDto[]> {
    const tournaments = await this.tournamentRepo.findAll(filters);
    return tournaments.map((t) => this.toDto(t));
  }

  async getById(id: number): Promise<TournamentDto | null> {
    const t = await this.tournamentRepo.findById(id);
    return t ? this.toDto(t) : null;
  }

  async create(dto: CreateTournamentDto): Promise<Result<TournamentDto>> {
    const validation = this.validator.validateCreate(dto);
    if (!validation.valid) return fail(ResultKind.INVALID, validation.message ?? "Invalid input");

    const created = await this.tournamentRepo.create(dto);
    if (!created) return fail(ResultKind.INTERNAL_ERROR, "Failed to create tournament");

    return ok(this.toDto(created));
  }

  async update(id: number, dto: Partial<CreateTournamentDto> & { status?: string }): Promise<Result<TournamentDto>> {
    const validation = this.validator.validateUpdate(dto);
    if (!validation.valid) return fail(ResultKind.INVALID, validation.message ?? "Invalid input");

    const updated = await this.tournamentRepo.update(id, dto);
    if (!updated) return fail(ResultKind.NOT_FOUND, "Tournament not found");

    return ok(this.toDto(updated));
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
    const tournaments = await Promise.all(tournamentIds.map((id) => this.tournamentRepo.findById(id)));
    return tournaments
      .filter((t): t is Tournament => t !== null)
      .map((t) => this.toDto(t));
  }

  async register(tournamentId: number, teamId: number, userId: number): Promise<Result<void>> {
    const tournament = await this.tournamentRepo.findById(tournamentId);
    if (!tournament) return fail(ResultKind.NOT_FOUND, "Tournament not found");

    if (tournament.status !== TournamentStatus.UPCOMING) {
      return fail(ResultKind.INVALID, "Registration is only available for upcoming tournaments");
    }

    if (new Date(tournament.registration_deadline).getTime() < Date.now()) {
      return fail(ResultKind.INVALID, "Registration deadline has passed");
    }

    const isCaptain = await this.teamMemberRepo.isCaptain(teamId, userId);
    if (!isCaptain) return fail(ResultKind.FORBIDDEN, "Only team captain can register a team");

    const registrationCount = await this.registrationRepo.countByTournamentId(tournamentId);
    if (registrationCount >= tournament.max_teams) {
      return fail(ResultKind.CONFLICT, "Tournament registration limit reached");
    }

    const teamSize = await this.registrationRepo.getTeamMemberRequirement(tournamentId, teamId);
    if (!teamSize) return fail(ResultKind.NOT_FOUND, "Tournament or team not found");

    if (teamSize.memberCount < teamSize.requiredMembers) {
      return fail(
        ResultKind.INVALID,
        `Team must have at least ${teamSize.requiredMembers} members to register for this tournament`,
      );
    }

    const alreadyRegistered = await this.registrationRepo.exists(tournamentId, teamId);
    if (alreadyRegistered) return fail(ResultKind.CONFLICT, "Team is already registered for this tournament");

    const success = await this.registrationRepo.register(tournamentId, teamId);
    return success
      ? ok(undefined)
      : fail(ResultKind.INTERNAL_ERROR, "Registration failed");
  }

  async unregister(tournamentId: number, teamId: number): Promise<boolean> {
    return this.registrationRepo.unregister(tournamentId, teamId);
  }

  async getRegistrations(tournamentId: number): Promise<TournamentRegistrationListItem[]> {
    return this.registrationRepo.findByTournamentId(tournamentId);
  }

  async getAllRegistrations(): Promise<TournamentRegistrationDetailedItem[]> {
    return this.registrationRepo.findAllDetailed();
  }

  async updateRegistrationStatus(tournamentId: number, teamId: number, status: string): Promise<Result<void>> {
    if (!VALID_REGISTRATION_STATUSES.includes(status)) {
      return fail(ResultKind.INVALID, `Invalid registration status. Must be: ${VALID_REGISTRATION_STATUSES.join(", ")}`);
    }
    const success = await this.registrationRepo.updateStatus(tournamentId, teamId, status);
    return success
      ? ok(undefined)
      : fail(ResultKind.NOT_FOUND, "Registration not found");
  }

  private toDto(t: Tournament): TournamentDto {
    return new TournamentDto(
      t.id,
      t.name,
      t.game_id,
      t.format,
      t.max_teams,
      t.prize_pool,
      t.registration_deadline,
      t.start_date,
      t.status,
      t.created_by ?? null,
      t.created_at,
    );
  }
}
