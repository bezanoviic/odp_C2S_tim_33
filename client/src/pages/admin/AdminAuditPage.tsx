import { useEffect, useState } from "react";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { AuditLogDto } from "../../api_services/audit/AuditAPIService";

const LIMIT = 20;

export default function AdminAuditPage() {
  const [logs, setLogs]       = useState<AuditLogDto[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    auditApi.getLogs(page, LIMIT).then((res) => {
      if (!active) return;
      if (res.success && res.data) setLogs(res.data);
      if (res.total !== undefined) setTotal(res.total);
      setLoading(false);
    });
    return () => { active = false; };
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Audit Logs</h1>

      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && logs.length === 0 && <p className="text-gray-400">No logs yet.</p>}

      {!loading && logs.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-6">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#111] border border-gray-800 rounded-lg p-3 flex justify-between items-start">
                <div>
                  <span className="text-white text-sm font-medium">{log.action}</span>
                  <span className="ml-2 text-xs text-gray-500">{log.entity_type} #{log.entity_id}</span>
                  {log.details && <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>}
                  <p className="text-xs text-gray-700 mt-0.5">by {log.gamer_tag ?? "system"}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-white/6 text-white/60 rounded disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-white/40 text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm bg-white/6 text-white/60 rounded disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}