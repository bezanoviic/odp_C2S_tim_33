import axios from "axios";

const API_URL = "/api/v1/tournaments";

export interface Tournament {
  id: number;
  name: string;
  game_id: number;
  format: string;
  max_teams: number;
  prize_pool: number | null;
  registration_deadline: string;
  start_date: string;
  status: string;
  created_by: number | null;
  created_at: string;
}

export interface CreateTournamentDto {
  name: string;
  game_id: number;
  format: string;
  max_teams: number;
  prize_pool?: number;
  registration_deadline: string;
  start_date: string;
}

function authHeader() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const TournamentsAPIService = {
  async getAll(filters?: { gameId?: number; status?: string; format?: string }): Promise<Tournament[]> {
    const res = await axios.get(API_URL, { params: filters });
    return res.data.data;
  },

  async getById(id: number): Promise<Tournament> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data.data;
  },

  async create(dto: CreateTournamentDto): Promise<Tournament> {
    const res = await axios.post(API_URL, dto, { headers: authHeader() });
    return res.data.data;
  },

  async update(id: number, dto: Partial<CreateTournamentDto>): Promise<Tournament> {
    const res = await axios.put(`${API_URL}/${id}`, dto, { headers: authHeader() });
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
  },

  async watch(id: number): Promise<void> {
    await axios.post(`${API_URL}/${id}/watch`, {}, { headers: authHeader() });
  },

  async unwatch(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}/watch`, { headers: authHeader() });
  },

  async register(tournamentId: number, teamId: number): Promise<void> {
    await axios.post(`${API_URL}/${tournamentId}/register`, { team_id: teamId }, { headers: authHeader() });
  },

  async unregister(tournamentId: number, teamId: number): Promise<void> {
    await axios.delete(`${API_URL}/${tournamentId}/register/${teamId}`, { headers: authHeader() });
  },

  async getRegistrations(tournamentId: number): Promise<{ team_id: number; status: string; registered_at: string }[]> {
    const res = await axios.get(`${API_URL}/${tournamentId}/registrations`);
    return res.data.data;
  },
};