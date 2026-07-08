import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <h1 className="font-display text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="text-sm text-slate-500">You don&apos;t have permission to view this page.</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
