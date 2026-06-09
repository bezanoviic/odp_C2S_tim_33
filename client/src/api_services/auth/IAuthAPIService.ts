import type { AuthResponse } from "../../types/auth/AuthResponse";

export interface IAuthAPIService {
  login(gamer_tag: string, password: string): Promise<AuthResponse>;
  register(gamer_tag: string, full_name: string, email: string, password: string): Promise<AuthResponse>;
}
