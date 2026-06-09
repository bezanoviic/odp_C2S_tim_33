import axios from "axios";
import { readItem } from "../../helpers/local_storage";

const BASE = "/api/v1/health";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface DbNodeStatus {
  name: string;
  host: string;
  port: number;
  status: "healthy" | "degraded" | "offline";
  lastCheck: string;
}

export interface ApiNodeStatus {
  name: string;
  url: string;
  status: "healthy" | "degraded" | "unreachable";
  latency: number | null;
}

export const healthApi = {
  async getDbHealth(): Promise<{ success: boolean; data?: DbNodeStatus[]; message?: string }> {
    return axios.get(`${BASE}/db`, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed" : "Failed",
      }));
  },

  async getApiHealth(): Promise<{ success: boolean; data?: ApiNodeStatus[]; message?: string }> {
    return axios.get(`${BASE}/api`, { headers: authHeader() })
      .then(r => r.data)
      .catch(e => ({
        success: false,
        message: axios.isAxiosError(e) ? e.response?.data?.message ?? "Failed" : "Failed",
      }));
  },
};