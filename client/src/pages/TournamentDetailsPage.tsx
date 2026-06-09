import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { TournamentsAPIService, type Tournament } from "../api_services/tournaments/TournamentsAPIService";
import { useAuth } from "../hooks/auth/useAuthHook";

interface MyTeam {
  id: number;
  name: string;
  tag: string;
}

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<{ team_id: number; status: string; registered_at: string }[]>([]);
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [watching, setWatching] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    const tournamentId = parseInt(id, 10);

    const load = async () => {
      setLoading(true);
      try {
        const t = await TournamentsAPIService.getById(tournamentId);
        setTournament(t);
        const regs = await TournamentsAPIService.getRegistrations(tournamentId);
        setRegistrations(regs);

        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const res = await axios.get("/api/v1/teams", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const teams = Array.isArray(res.data) ? res.data : res.data.data ?? [];
            setMyTeams(teams);
          } catch { /* ignore */ }
        }
      } catch {
        setError("Tournament not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWatch = async () => {
    if (!tournament) return;
    try {
      if (watching) {
        await TournamentsAPIService.unwatch(tournament.id);
        setWatching(false);
      } else {
        await TournamentsAPIService.watch(tournament.id);
        setWatching(true);
      }
    } catch {
      alert("Action failed");
    }
  };

  const handleRegister = async () => {
    if (!tournament || !selectedTeam) {
      alert("Select a team");
      return;
    }
    setRegistering(true);
    try {
      await TournamentsAPIService.register(tournament.id, selectedTeam);
      const regs = await TournamentsAPIService.getRegistrations(tournament.id);
      setRegistrations(regs);
      alert("Team registered!");
    } catch {
      alert("Registration failed");
    } finally {
      setRegistering(false);
    }

    
  };

  const handleUpdateStatus = async (teamId: number, status: string) => {
  if (!tournament) return;
  try {
    const token = localStorage.getItem("authToken");
    await axios.patch(
      `/api/v1/tournaments/${tournament.id}/registrations/${teamId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const regs = await TournamentsAPIService.getRegistrations(tournament.id);
    setRegistrations(regs);
  } catch {
    alert("Update failed");
  }
};

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !tournament) return <div className="p-8 text-white">{error}</div>;

  const availableTeams = myTeams.filter(
    (t) => !registrations.some((r) => r.team_id === t.id)
  );

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <Link to="/tournaments" className="text-blue-400 hover:underline mb-4 inline-block">
        ← Back to tournaments
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <button
            onClick={handleWatch}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            {watching ? "Unwatch" : "Watch"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-zinc-400">Format:</span> {tournament.format}</div>
          <div><span className="text-zinc-400">Status:</span> <span className="text-blue-400">{tournament.status}</span></div>
          <div><span className="text-zinc-400">Max teams:</span> {tournament.max_teams}</div>
          <div><span className="text-zinc-400">Prize pool:</span> ${tournament.prize_pool ?? 0}</div>
          <div><span className="text-zinc-400">Registration deadline:</span> {new Date(tournament.registration_deadline).toLocaleString()}</div>
          <div><span className="text-zinc-400">Start date:</span> {new Date(tournament.start_date).toLocaleString()}</div>
        </div>
      </div>

      {availableTeams.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Register a Team</h2>
          <div className="flex gap-3">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(parseInt(e.target.value, 10))}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            >
              <option value={0}>Select team...</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.tag})
                </option>
              ))}
            </select>
            <button
              onClick={handleRegister}
              disabled={registering || !selectedTeam}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded"
            >
              {registering ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Registered Teams ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="text-zinc-400">No teams registered yet.</p>
        ) : (
                   <table className="w-full text-sm">
            <thead className="text-zinc-400 text-left">
              <tr>
                <th className="py-2">Team ID</th>
                <th className="py-2">Status</th>
                <th className="py-2">Registered at</th>
                {user?.role === "admin" && <th className="py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.team_id} className="border-t border-zinc-800">
                  <td className="py-2">{r.team_id}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.status === "confirmed" ? "bg-green-700" :
                      r.status === "disqualified" ? "bg-red-700" : "bg-yellow-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-2">{new Date(r.registered_at).toLocaleString()}</td>
                  {user?.role === "admin" && (
                    <td className="py-2 flex gap-2">
                      {r.status !== "confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(r.team_id, "confirmed")}
                          className="bg-green-700 hover:bg-green-600 px-2 py-1 rounded text-xs"
                        >
                          Confirm
                        </button>
                      )}
                      {r.status !== "disqualified" && (
                        <button
                          onClick={() => handleUpdateStatus(r.team_id, "disqualified")}
                          className="bg-red-700 hover:bg-red-600 px-2 py-1 rounded text-xs"
                        >
                          Disqualify
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}