import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogIn, LogOut, LayoutDashboard, Search, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Certi<span className="text-blue-400">Chain</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Blockchain Verification
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/verify"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4 text-blue-400" />
              Verify Certificate
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              About Project
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-slate-800 text-blue-300 border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-blue-500/20 text-blue-300">
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/verify"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Public Verify
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
