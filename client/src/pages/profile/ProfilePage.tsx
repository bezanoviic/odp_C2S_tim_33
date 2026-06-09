import { useAuth } from "../../hooks/auth/useAuthHook";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-sm text-white/70">Manage your player info.</p>
      </div>

      <section className="rounded-lg border border-white/10 p-4 bg-white/5 max-w-xl">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-white/60">Gamer tag</dt>
            <dd className="text-white">{user?.gamer_tag ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-white/60">User ID</dt>
            <dd className="text-white">{user?.id ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-white/60">Role</dt>
            <dd className="text-white">{user?.role ?? "-"}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="mt-4 rounded bg-white/10 px-4 py-2 text-sm text-white/60 cursor-not-allowed"
          disabled
          title="Saving will be enabled when profile API is connected."
        >
          Save (coming soon)
        </button>
      </section>
    </div>
  );
}