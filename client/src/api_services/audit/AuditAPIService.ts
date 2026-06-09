import axios from "axios";
import { readItem } from "../../helpers/local_storage";

const BASE = "/api/v1/audits/logs";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AuditLogDto {
  id: number;
  user_id: number | null;
  gamer_tag: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data?: AuditLogDto[];
  total?: number;
  message?: string;
}

export const auditApi = {
  async getLogs(page = 1, limit = 20): Promise<AuditLogsResponse> {
    return axios.get<AuditLogsResponse>(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed to load logs" : "Failed to load logs",
      }));
  },
};