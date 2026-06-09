import axios from "axios";
import type { GameDto, CreateGameDto } from "../../models/game/GameTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = "/api/v1/games";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const gamesApi = {
  async getAll(): Promise<ApiResponse<GameDto[]>> {
    return axios.get<ApiResponse<GameDto[]>>(BASE)
      .then(r => r.data)
      .catch(() => ({ success: false, message: "Failed to load games" }));
  },

  async getById(id: number): Promise<ApiResponse<GameDto>> {
    return axios.get<ApiResponse<GameDto>>(`${BASE}/${id}`)
      .then(r => r.data)
      .catch(() => ({ success: false, message: "Failed to load game" }));
  },

  async create(payload: CreateGameDto): Promise<ApiResponse<GameDto>> {
    return axios.post<ApiResponse<GameDto>>(BASE, payload, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed to create" : "Failed to create",
      }));
  },

  async update(id: number, payload: Partial<CreateGameDto>): Promise<ApiResponse<void>> {
    return axios.put<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed to update" : "Failed to update",
      }));
  },

  async remove(id: number): Promise<ApiResponse<void>> {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed to delete" : "Failed to delete",
      }));
  },
};