import { ValidationResult } from "../../../Domain/types/ValidationResult";

const VALID_FORMATS = ["single_elimination", "double_elimination", "round_robin"] as const;
const ELIMINATION_FORMATS = ["single_elimination", "double_elimination"];

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export const validateTournament = (
  name: string,
  format: string,
  max_teams: number,
  registration_deadline: string | Date,
  start_date: string | Date,
): ValidationResult => {
  if (!name || name.trim().length < 3 || name.trim().length > 120)
    return { valid: false, message: "Tournament name must be 3–120 characters" };

  if (!VALID_FORMATS.includes(format as typeof VALID_FORMATS[number]))
    return { valid: false, message: "Invalid format. Must be: single_elimination, double_elimination or round_robin" };

  if (!Number.isInteger(max_teams) || max_teams < 2 || max_teams > 256)
    return { valid: false, message: "max_teams must be an integer between 2 and 256" };

  if (!isPowerOfTwo(max_teams))
    return { valid: false, message: "max_teams must be a power of 2 (2, 4, 8, 16, 32...)" };

  const deadline = new Date(registration_deadline);
  const start = new Date(start_date);
  const now = new Date();

  if (isNaN(deadline.getTime()))
    return { valid: false, message: "Invalid registration deadline" };

  if (isNaN(start.getTime()))
    return { valid: false, message: "Invalid start date" };

  if (deadline <= now)
    return { valid: false, message: "Registration deadline must be in the future" };

  if (deadline > start)
    return { valid: false, message: "Registration deadline must be before the tournament start date" };

  return { valid: true };
};
