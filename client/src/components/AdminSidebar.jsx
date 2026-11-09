import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FilePlus,
  FileText,
  ShieldCheck,
  Cpu,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AdminSidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/certificates/issue", label: "Issue Certificate", icon: FilePlus },
    { to: "/admin/certificates", label: "Certificates Registry", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Institution header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm text-white truncate">{user?.name || "Administrator"}</h3>
            <span className="text-[11px] text-blue-400 font-medium uppercase tracking-wider block">
              Institution Authority
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin/certificates"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Node status info */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Hardhat Blockchain</span>
        </div>
        <p className="text-[11px] text-slate-400">Authority Wallet Connected</p>
        <span className="mt-1.5 inline-block text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-blue-300 border border-slate-700 truncate w-full">
          ChainID: 31337
        </span>
      </div>

      {/* Footer logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
