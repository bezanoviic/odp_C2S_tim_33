import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface UserProfile {
  id: number;
  gamer_tag: string;
  full_name: string;
  email: string;
  role: string;
  profile_image: string | null;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !profile) return <div className="p-8 text-white">{error}</div>;

  return (
    <div className="p-8 text-white max-w-2xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold">
            {profile.gamer_tag[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.gamer_tag}</h1>
            <p className="text-zinc-400">{profile.full_name}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-blue-700">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-zinc-400">Email: </span>
            <span>{profile.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}