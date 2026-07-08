import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Role: {user?.role} · {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
          Inventory dashboard content is built in a later phase.
        </div>
      </div>
    </div>
  );
}
