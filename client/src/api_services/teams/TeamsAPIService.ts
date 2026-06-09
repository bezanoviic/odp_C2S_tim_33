import axios from "axios";
import type {
  ApiResult,
  CreateTeamDto,
  TeamDto,
  TeamMemberDto
} from "../../models/team/TeamTypes";

const API_URL = "/api/v1/teams";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

export class TeamsAPIService {

  static async getMyTeams(): Promise<ApiResult<TeamDto[]>> {
    try {
      const response = await axios.get<TeamDto[]>(API_URL, getAuthHeaders());
      return { success: true, data: response.data };
    } catch {
      return { success: false, message: "Failed to load teams" };
    }
  }

  static async getTeam(teamId: number): Promise<ApiResult<TeamDto>> {
    try {
      const response = await axios.get<TeamDto>(`${API_URL}/${teamId}`, getAuthHeaders());
      return { success: true, data: response.data };
    } catch {
      return { success: false, message: "Failed to load team" };
    }
  }

  static async createTeam(payload: CreateTeamDto): Promise<ApiResult<number>> {
    try {
      const response = await axios.post<{ teamId: number }>(API_URL, payload, getAuthHeaders());
      return { success: true, data: response.data.teamId };
    } catch {
      return { success: false, message: "Failed to create team" };
    }
  }

  static async updateTeam(teamId: number, payload: CreateTeamDto): Promise<ApiResult<boolean>> {
    try {
      await axios.put(`${API_URL}/${teamId}`, payload, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to update team" };
    }
  }

  static async getMembers(teamId: number): Promise<ApiResult<TeamMemberDto[]>> {
    try {
      const response = await axios.get<TeamMemberDto[]>(`${API_URL}/${teamId}/members`, getAuthHeaders());
      return { success: true, data: response.data };
    } catch {
      return { success: false, message: "Failed to load members" };
    }
  }

  static async inviteUser(teamId: number, invitedUserId: number): Promise<ApiResult<boolean>> {
    try {
      await axios.post(`${API_URL}/${teamId}/invite`, { invitedUserId }, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to send invitation" };
    }
  }

  static async leaveTeam(teamId: number): Promise<ApiResult<boolean>> {
    try {
      await axios.delete(`${API_URL}/${teamId}/leave`, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to leave team" };
    }
  }

  static async deleteTeam(teamId: number): Promise<ApiResult<boolean>> {
    try {
      await axios.delete(`${API_URL}/${teamId}`, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to delete team" };
    }
  }

  static async kickMember(teamId: number, userId: number): Promise<ApiResult<boolean>> {
    try {
      await axios.delete(`${API_URL}/${teamId}/members/${userId}`, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to remove member" };
    }
  }

  static async transferCaptain(teamId: number, newCaptainId: number): Promise<ApiResult<boolean>> {
    try {
      await axios.patch(`${API_URL}/${teamId}/transfer-captain`, { newCaptainId }, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to transfer captain" };
    }
  }

  static async respondToInvite(
    teamId: number,
    invitationId: number,
    status: "accepted" | "rejected"
  ): Promise<ApiResult<boolean>> {
    try {
      await axios.post(`${API_URL}/${teamId}/invite/respond`, { invitationId, status }, getAuthHeaders());
      return { success: true, data: true };
    } catch {
      return { success: false, message: "Failed to respond to invitation" };
    }
  }

  static async getMyInvitations(): Promise<ApiResult<{
    id: number;
    team_id: number;
    team_name: string;
    team_tag: string;
    invited_by: string;
    created_at: string;
  }[]>> {
    try {
      const response = await axios.get(`${API_URL}/invitations/my`, getAuthHeaders());
      return { success: true, data: response.data };
    } catch {
      return { success: false, message: "Failed to load invitations" };
    }
  }

}