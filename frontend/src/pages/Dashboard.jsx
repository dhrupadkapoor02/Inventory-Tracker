import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Welcome, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Role: {user?.role} · {user?.email}
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
        Summary cards, low stock alerts, and expiring products are built in a later phase.
      </div>
    </div>
  );
}
