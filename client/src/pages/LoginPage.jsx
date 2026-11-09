import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get("expired") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please check your login details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@institution.edu");
    setPassword("Admin@123");
    setErrorMessage("");
  };

  const fillDemoStudent = () => {
    setEmail("adarsh.challa@student.edu");
    setPassword("Student@123");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            Certi<span className="text-blue-400">Chain</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Portal Authentication
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Sign in as an Institution Administrator or Verified Student
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl border border-slate-700 shadow-2xl">
          {isExpired && (
            <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@institution.edu or student@edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Toolbar */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              One-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-left border border-slate-700 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mb-0.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin / Dean</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  admin@institution.edu
                </span>
              </button>

              <button
                type="button"
                onClick={fillDemoStudent}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-left border border-slate-700 hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Adarsh Challa</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  adarsh.challa@student.edu
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
