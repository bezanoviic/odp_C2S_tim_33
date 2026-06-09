import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";

const BASE = import.meta.env.VITE_API_URL + "auth";
const err = (e: unknown, fallback: string): AuthResponse => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const authApi: IAuthAPIService = {
  async login(gamer_tag, password) {
    return axios.post<AuthResponse>(`${BASE}/login`, { gamer_tag, password })
      .then(r => r.data).catch(e => err(e, "Login failed"));
  },
  async register(gamer_tag, full_name, email, password) {
    return axios.post<AuthResponse>(`${BASE}/register`, { gamer_tag, full_name, email, password })
      .then(r => r.data).catch(e => err(e, "Registration failed"));
  },
};
