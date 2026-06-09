import { useEffect, useState } from "react";
import { gamesApi } from "../../api_services/games/GamesAPIService";
import type { GameDto, CreateGameDto } from "../../models/game/GameTypes";

const emptyForm: CreateGameDto = { name: "", logo: null, genre: "", max_players_per_team: 2 };

export default function AdminGamesPage() {
  const [games, setGames]       = useState<GameDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<CreateGameDto>(emptyForm);
  const [error, setError]       = useState("");

  const load = () => {
    gamesApi.getAll().then((res) => {
      if (res.success && res.data) setGames(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.genre.trim()) { setError("Genre is required"); return; }
    if (form.max_players_per_team < 1) { setError("Max players must be at least 1"); return; }

    const res = editId
      ? await gamesApi.update(editId, form)
      : await gamesApi.create(form);

    if (!res.success) { setError(res.message ?? "Failed"); return; }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (game: GameDto) => {
    setForm({ name: game.name, logo: game.logo, genre: game.genre, max_players_per_team: game.max_players_per_team });
    setEditId(game.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this game?")) return;
    const res = await gamesApi.remove(id);
    if (res.success) setGames((prev) => prev.filter((g) => g.id !== id));
    else alert(res.message);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <button
          onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm); setError(""); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          {showForm ? "Cancel" : "+ Add Game"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-[#111] border border-gray-800 rounded-lg p-4 flex flex-col gap-3 max-w-md">
          <h2 className="text-white font-semibold">{editId ? "Edit Game" : "Add Game"}</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <input
            type="text" placeholder="Game name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <input
            type="text" placeholder="Genre (e.g. FPS, MOBA)" value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <input
            type="number" placeholder="Max players per team" value={form.max_players_per_team}
            min={1}
            onChange={(e) => setForm({ ...form, max_players_per_team: parseInt(e.target.value, 10) })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <input
            type="text" placeholder="Logo URL (optional)" value={form.logo ?? ""}
            onChange={(e) => setForm({ ...form, logo: e.target.value || null })}
            className="px-3 py-2 rounded bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition">
            {editId ? "Save Changes" : "Create"}
          </button>
        </form>
      )}

      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && games.length === 0 && <p className="text-gray-400">No games yet.</p>}

      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <div key={game.id} className="bg-[#111] border border-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="text-white font-semibold">{game.name}</span>
              <span className="ml-2 text-xs text-gray-500">{game.genre}</span>
              <span className="ml-2 text-xs text-gray-600">· {game.max_players_per_team}v{game.max_players_per_team}</span>
              <span className="ml-2 text-xs text-blue-400">{game.active_tournaments_count} active</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(game)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
              <button onClick={() => handleDelete(game.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}