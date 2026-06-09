import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";

const BASE = "/api/v1/auth";
const err = (e: Error, fallback: string): AuthResponse => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const authApi: IAuthAPIService = {
  async login(gamer_tag, password) {
    return axios.post<AuthResponse>(`${BASE}/login`, { gamer_tag, password })
      .then((r) => {
        const response = r.data;
        if (response.success && response.data) {
          localStorage.setItem("token", response.data);
          localStorage.setItem("authToken", response.data);
        }
        return response;
      })
      .catch((e) => err(e, "Login failed"));
  },
  async register(gamer_tag, full_name, email, password, profile_image) {
    return axios.post<AuthResponse>(`${BASE}/register`, { gamer_tag, full_name, email, password, profile_image })
      .then(r => r.data).catch(e => err(e, "Registration failed"));
  },
};