import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Award, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const StudentSidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/certificates", label: "My Certificates", icon: Award },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Student header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm text-white truncate">{user?.name || "Student"}</h3>
            <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider block">
              Verified Student
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
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

export default StudentSidebar;
