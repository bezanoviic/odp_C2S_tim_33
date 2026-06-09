import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateRegister = (
  gamer_tag: string,
  full_name: string,
  email:     string,
  password:  string,
): ValidationResult => {
  if (!gamer_tag || gamer_tag.trim().length < 3 || gamer_tag.length > 30 || !/^[a-zA-Z0-9\-\.]+$/.test(gamer_tag))
    return { valid: false, message: "Gamer tag must be 3-30 chars (letters, numbers, hyphen, dot)" };
  if (!full_name || full_name.trim().length < 2 || full_name.trim().length > 100)
    return { valid: false, message: "Full name must be 2-100 characters" };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { valid: false, message: "Invalid email address" };
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return { valid: false, message: "Password must be 8+ chars with at least one uppercase and one digit" };
  return { valid: true };
};