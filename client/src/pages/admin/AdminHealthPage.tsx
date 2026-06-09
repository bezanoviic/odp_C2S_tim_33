import { useEffect, useState, useCallback } from "react";
import { healthApi } from "../../api_services/health/HealthAPIService";
import type { DbNodeStatus, ApiNodeStatus } from "../../api_services/health/HealthAPIService";

const statusColor = (status: string) => {
  if (status === "healthy") return "text-green-400";
  if (status === "degraded") return "text-yellow-400";
  return "text-red-400";
};

export default function AdminHealthPage() {
  const [dbNodes, setDbNodes]   = useState<DbNodeStatus[]>([]);
  const [apiNodes, setApiNodes] = useState<ApiNodeStatus[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [db, api] = await Promise.all([
      healthApi.getDbHealth(),
      healthApi.getApiHealth(),
    ]);
    if (db.success && db.data)   setDbNodes(db.data);
    if (api.success && api.data) setApiNodes(api.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Health Dashboard</h1>
        <button onClick={() => void load()} className="px-4 py-2 bg-white/8 hover:bg-white/12 text-white/70 text-sm rounded transition">
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && (
        <>
          <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">Database Nodes</h2>
          <div className="flex flex-col gap-3 mb-8">
            {dbNodes.map((node) => (
              <div key={node.name} className="bg-[#111] border border-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="text-white font-semibold capitalize">{node.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{node.host}:{node.port}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${statusColor(node.status)}`}>{node.status}</span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Last check: {new Date(node.lastCheck).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-white/60 text-xs uppercase tracking-widest mb-3">API Nodes</h2>
          <div className="flex flex-col gap-3">
            {apiNodes.map((node) => (
              <div key={node.name} className="bg-[#111] border border-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="text-white font-semibold">{node.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{node.url}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${statusColor(node.status)}`}>{node.status}</span>
                  {node.latency !== null && (
                    <p className="text-xs text-gray-600 mt-0.5">{node.latency}ms</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}