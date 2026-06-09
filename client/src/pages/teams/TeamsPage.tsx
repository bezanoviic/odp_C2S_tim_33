import { useEffect, useState } from "react";
import { teamsApi } from "../../api_services/teams/TeamsAPIService";
import type { TeamDto, CreateTeamDto } from "../../models/team/TeamTypes";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function TeamsPage() {
  const { token, user }        = useAuth();
  const [teams, setTeams]      = useState<TeamDto[]>([]);
  const [loading, setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]      = useState("");
  const [form, setForm]        = useState<CreateTeamDto>({ name: "", tag: "", description: "" });

  useEffect(() => {
    if (!token) return;
    teamsApi.getMyTeams(token).then((data) => {
      setTeams(data);
      setLoading(false);
    });
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || form.name.trim().length < 2 || form.name.trim().length > 80) {
      setError("Team name must be 2-80 characters"); return;
    }
    if (!/^[A-Z0-9]{2,6}$/.test(form.tag.toUpperCase())) {
      setError("Tag must be 2-6 uppercase letters/numbers"); return;
    }
    const result = await teamsApi.create({ ...form, tag: form.tag.toUpperCase() }, token ?? "");
    if (!result.success) { setError(result.message ?? "Failed to create team"); return; }
    if (result.data) setTeams((prev) => [...prev, result.data!]);
    setShowForm(false);
    setForm({ name: "", tag: "", description: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team?")) return;
    const result = await teamsApi.remove(id, token ?? "");
    if (result.success) setTeams((prev) => prev.filter((t) => t.id !== id));
    else alert(result.message);
  };

  const handleLeave = async (teamId: number) => {
    if (!user || !token) return;
    if (!confirm("Leave this team?")) return;
    const result = await teamsApi.removeMember(teamId, user.id, token);
    if (result.success) setTeams((prev) => prev.filter((t) => t.id !== teamId));
    else alert(result.message);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Teams</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          {showForm ? "Cancel" : "+ New Team"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-[#111] border border-gray-800 rounded-lg p-4 flex flex-col gap-3 max-w-md">
          <h2 className="text-white font-semibold">Create Team</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <input
            type="text" placeholder="Team name (2-80 chars)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <input
            type="text" placeholder="Tag (2-6 chars, e.g. TST)" value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)" value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none resize-none"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
            Create
          </button>
        </form>
      )}

      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && teams.length === 0 && <p className="text-gray-400">You are not in any team yet.</p>}

      <div className="flex flex-col gap-4">
        {teams.map((team) => {
          const isCaptain = team.members?.some((m) => m.user_id === user?.id && m.role === "captain");
          return (
            <div key={team.id} className="bg-[#111] border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-white font-semibold text-lg">{team.name}</span>
                  <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{team.tag}</span>
                  {isCaptain && <span className="ml-2 text-xs text-yellow-400">Captain</span>}
                </div>
                <div className="flex gap-2">
                  {isCaptain ? (
                    <button onClick={() => handleDelete(team.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  ) : (
                    <button onClick={() => handleLeave(team.id)} className="text-xs text-gray-400 hover:text-gray-300">Leave</button>
                  )}
                </div>
              </div>
              {team.description && <p className="text-gray-400 text-sm mt-1">{team.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
