import type { AuthResponse } from "../../types/auth/AuthResponse";

/**
 * Interfejs za Auth API servis.
 */
export interface IAuthAPIService {
  prijava(korisnickoIme: string, lozinka: string): Promise<AuthResponse>;
  registracija(korisnickoIme: string, lozinka: string, uloga: string): Promise<AuthResponse>;
}