import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Package, Tags, Truck, AlertTriangle, CalendarClock, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import * as dashboardApi from '../api/dashboard.api';

function SummaryCard({ icon: Icon, label, value, tone = 'slate' }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    brand: 'bg-brand-50 text-brand-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`inline-flex rounded-lg p-2 ${toneClasses[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dashboardApi.getDashboardSummary();
        setSummary(data.data);
      } catch (err) {
        toast.error('Failed to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = summary
    ? [
        { name: 'Last 30 days', Purchases: summary.purchasesLast30Days, Sales: summary.salesLast30Days },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Welcome, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Role: {user?.role} · {user?.email}
      </p>

      {loading ? (
        <div className="mt-8 text-sm text-slate-400">Loading summary...</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard icon={Package} label="Products" value={summary.totalProducts} tone="brand" />
            <SummaryCard icon={Tags} label="Categories" value={summary.totalCategories} tone="slate" />
            <SummaryCard icon={Truck} label="Suppliers" value={summary.totalSuppliers} tone="slate" />
            <SummaryCard
              icon={AlertTriangle}
              label="Low stock items"
              value={summary.lowStockCount}
              tone="amber"
            />
            <SummaryCard
              icon={CalendarClock}
              label="Expiring in 7 days"
              value={summary.expiringCount}
              tone="red"
            />
            <SummaryCard
              icon={IndianRupee}
              label="Inventory value"
              value={`₹${summary.inventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              tone="slate"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Purchases vs Sales (last 30 days)
            </h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="Purchases" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {summary.expiredCount > 0 && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {summary.expiredCount} product(s) have already expired. Check the Products page.
            </div>
          )}
        </>
      )}
    </div>
  );
}
