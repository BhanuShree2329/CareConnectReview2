import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, LogOut, Menu, X, Heart,
  Baby, Building2, UserCheck, ChevronRight
} from "lucide-react";

const navMap: Record<string, { label: string; href: string; icon: ReactNode }[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "User Management", href: "/admin/users", icon: <Users size={18} /> },
    { label: "Orphan Requests", href: "/admin/orphans", icon: <Baby size={18} /> },
  ],
  orphan: [
    { label: "My Dashboard", href: "/orphan", icon: <LayoutDashboard size={18} /> },
    { label: "Submit Request", href: "/orphan/request", icon: <Heart size={18} /> },
  ],
  ngo: [
    { label: "Dashboard", href: "/ngo", icon: <Building2 size={18} /> },
  ],
  elder: [
    { label: "Dashboard", href: "/elder", icon: <LayoutDashboard size={18} /> },
  ],
  caretaker: [
    { label: "Dashboard", href: "/caretaker", icon: <UserCheck size={18} /> },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = (user && navMap[user.role]) || [];

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    orphan: "bg-blue-100 text-blue-700",
    ngo: "bg-green-100 text-green-700",
    elder: "bg-orange-100 text-orange-700",
    caretaker: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Heart size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">CareConnect</span>
          <button onClick={() => setOpen(false)} className="ml-auto md:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm mb-2">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p className="font-medium text-gray-800 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate mb-1">{user.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColor[user.role] || "bg-gray-100 text-gray-600"}`}>
              {user.role}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <span className={active ? "text-purple-600" : "text-gray-400"}>{item.icon}</span>
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-purple-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 md:px-6">
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-500">
            <Menu size={22} />
          </button>
          <h1 className="text-gray-800 font-semibold text-base capitalize">
            {user?.role} Portal
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
