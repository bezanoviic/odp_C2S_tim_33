import axios from "axios";

const BASE = "/api/v1";

export interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  team1_id: number | null;
  team2_id: number | null;
  team1_score: number | null;
  team2_score: number | null;
  winner_team_id: number | null;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchPlayer {
  match_id: number;
  team_id: number;
  user_id: number;
  created_at: string;
}

export interface UpdateResultDto {
  team1_score: number;
  team2_score: number;
  winner_team_id: number;
}

export interface UpsertPlayerDto {
  user_id: number;
  team_id: number;
}

function authHeader() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const MatchesAPIService = {
  async getById(id: number): Promise<Match> {
    const res = await axios.get(`${BASE}/matches/${id}`, { headers: authHeader() });
    return res.data.data;
  },

  async getPlayers(id: number): Promise<MatchPlayer[]> {
    const res = await axios.get(`${BASE}/matches/${id}/players`, { headers: authHeader() });
    return res.data.data;
  },

  async getByTournament(tournamentId: number): Promise<Match[]> {
    const res = await axios.get(`${BASE}/tournaments/${tournamentId}/matches`, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  async generateBracket(tournamentId: number): Promise<Match[]> {
    const res = await axios.post(
      `${BASE}/tournaments/${tournamentId}/generate-bracket`,
      {},
      { headers: authHeader() },
    );
    return res.data.data;
  },

  async updateResult(matchId: number, dto: UpdateResultDto): Promise<Match> {
    const res = await axios.patch(`${BASE}/matches/${matchId}/result`, dto, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  async addPlayers(matchId: number, players: UpsertPlayerDto[]): Promise<MatchPlayer[]> {
    const res = await axios.post(
      `${BASE}/matches/${matchId}/players`,
      { players },
      { headers: authHeader() },
    );
    return res.data.data;
  },

  async updatePlayer(matchId: number, userId: number, dto: { team_id: number }): Promise<MatchPlayer> {
    const res = await axios.put(`${BASE}/matches/${matchId}/players/${userId}`, dto, {
      headers: authHeader(),
    });
    return res.data.data;
  },

  async removePlayer(matchId: number, userId: number): Promise<void> {
    await axios.delete(`${BASE}/matches/${matchId}/players/${userId}`, {
      headers: authHeader(),
    });
  },
};
