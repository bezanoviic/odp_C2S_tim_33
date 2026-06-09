import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateLogin = (gamer_tag: string, password: string): ValidationResult => {
  if (!gamer_tag || gamer_tag.trim().length < 3)
    return { valid: false, message: "Gamer tag is required (min 3 chars)" };
  if (!password || password.length < 8)
    return { valid: false, message: "Password must be at least 8 characters" };
  return { valid: true };
};