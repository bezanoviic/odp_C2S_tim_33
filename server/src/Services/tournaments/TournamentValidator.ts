import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentFormat } from "../../Domain/enums/TournamentFormat";
import { TournamentStatus } from "../../Domain/enums/TournamentStatus";
import { ValidationResult } from "../../Domain/types/ValidationResult";

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 120;
const MIN_TEAMS = 4;
const MAX_TEAMS = 256;

const VALID_FORMATS = Object.values(TournamentFormat) as string[];
const VALID_STATUSES = Object.values(TournamentStatus) as string[];

const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

export class TournamentValidator {
  validateCreate(dto: CreateTournamentDto): ValidationResult {
    const nameError = this.checkName(dto.name);
    if (nameError) return nameError;

    const formatError = this.checkFormat(dto.format);
    if (formatError) return formatError;

    const teamsError = this.checkMaxTeams(dto.max_teams);
    if (teamsError) return teamsError;

    const datesError = this.checkDates(dto.registration_deadline, dto.start_date);
    if (datesError) return datesError;

    return { valid: true };
  }

  validateUpdate(dto: Partial<CreateTournamentDto> & { status?: string }): ValidationResult {
    if (dto.name !== undefined) {
      const nameError = this.checkName(dto.name);
      if (nameError) return nameError;
    }

    if (dto.format !== undefined) {
      const formatError = this.checkFormat(dto.format);
      if (formatError) return formatError;
    }

    if (dto.max_teams !== undefined) {
      const teamsError = this.checkMaxTeams(dto.max_teams);
      if (teamsError) return teamsError;
    }

    if (dto.status !== undefined && !VALID_STATUSES.includes(dto.status)) {
      return { valid: false, message: `Invalid status. Must be: ${VALID_STATUSES.join(", ")}` };
    }

    if (dto.registration_deadline !== undefined && dto.start_date !== undefined) {
      const datesError = this.checkDates(dto.registration_deadline, dto.start_date);
      if (datesError) return datesError;
    }

    return { valid: true };
  }

  private checkName(name: string): ValidationResult | null {
    const trimmed = (name ?? "").trim();
    if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
      return { valid: false, message: `Tournament name must be ${NAME_MIN_LENGTH}–${NAME_MAX_LENGTH} characters` };
    }
    return null;
  }

  private checkFormat(format: string): ValidationResult | null {
    if (!VALID_FORMATS.includes(format)) {
      return { valid: false, message: `Invalid format. Must be: ${VALID_FORMATS.join(", ")}` };
    }
    return null;
  }

  private checkMaxTeams(max_teams: number): ValidationResult | null {
    if (!Number.isInteger(max_teams) || max_teams < MIN_TEAMS || max_teams > MAX_TEAMS) {
      return { valid: false, message: `max_teams must be an integer between ${MIN_TEAMS} and ${MAX_TEAMS}` };
    }
    if (!isPowerOfTwo(max_teams)) {
      return { valid: false, message: "max_teams must be a power of 2 (4, 8, 16, 32, ...)" };
    }
    return null;
  }

  private checkDates(registration_deadline: string | Date, start_date: string | Date): ValidationResult | null {
    const deadline = new Date(registration_deadline);
    const start = new Date(start_date);

    if (isNaN(deadline.getTime())) return { valid: false, message: "Invalid registration deadline" };
    if (isNaN(start.getTime())) return { valid: false, message: "Invalid start date" };

    if (deadline.getTime() <= Date.now()) {
      return { valid: false, message: "Registration deadline must be in the future" };
    }
    if (deadline > start) {
      return { valid: false, message: "Registration deadline must be before the tournament start date" };
    }
    return null;
  }
}
