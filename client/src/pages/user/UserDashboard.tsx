import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Overview" title={`Welcome, ${user?.gamer_tag}`} />

      <p className="text-white/70 text-sm mb-4">
        Latest matches from your watchlist.
      </p>

      <ul className="text-sm space-y-2">
        <li>
          <Link
            to="/matches/1"
            className="text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white/70 transition-colors"
          >
            Match #1
          </Link>
        </li>
        <li>
          <Link
            to="/matches/2"
            className="text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white/70 transition-colors"
          >
            Match #2
          </Link>
        </li>
      </ul>

      <div className="mt-4">
        <Link
          to={`/users/${user?.id}`}
          className="text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white/70 transition-colors text-sm"
        >
          Go to profile
        </Link>
      </div>
    </div>
  );
}
