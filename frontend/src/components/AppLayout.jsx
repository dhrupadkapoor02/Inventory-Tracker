import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: Receipt },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-2 w-2 rounded-full bg-brand-600" />
          <span className="font-display text-base font-semibold tracking-tight text-slate-900">
            Inventory Tracker
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <p className="truncate px-2 text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="truncate px-2 text-xs text-slate-500">{user?.role}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
