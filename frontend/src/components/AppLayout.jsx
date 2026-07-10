import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  Receipt,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/purchases", label: "Purchases", icon: ShoppingCart },
  { to: "/sales", label: "Sales", icon: Receipt },
];

function SidebarContent({ user, logout, onNavigate }) {
  return (
    <>
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
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 pt-4">
        <p className="truncate px-2 text-sm font-medium text-slate-900">
          {user?.name}
        </p>
        <p className="truncate px-2 text-xs text-slate-500">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeLabel =
    navItems.find((item) => item.to === location.pathname)?.label || "";

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Mobile top bar - hidden on desktop */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-display text-sm font-semibold text-slate-900">
          {activeLabel}
        </span>
        <div className="h-2 w-2 rounded-full bg-brand-600" />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent
          user={user}
          logout={logout}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar - always visible, no drawer behavior */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <SidebarContent user={user} logout={logout} />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
