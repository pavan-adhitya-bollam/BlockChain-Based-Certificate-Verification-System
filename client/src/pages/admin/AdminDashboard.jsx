import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  FilePlus,
  ArrowRight,
  Cpu,
  History,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, actRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/recent-activity"),
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (actRes.success) setActivity(actRes.activity);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Issued Certificates",
      value: stats?.totalIssued ?? 0,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Active / Verified On-Chain",
      value: stats?.totalActive ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Revoked Certificates",
      value: stats?.totalRevoked ?? 0,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "Registered Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Administration Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative Certificate Registry & Hardhat Blockchain Node Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/certificates/issue"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <FilePlus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-white rounded-2xl border ${card.border} shadow-sm hover:shadow transition-shadow flex items-center gap-4`}
            >
              <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {card.label}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/certificates/issue"
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-white/10 text-blue-300">
              <FilePlus className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-lg mb-1">Issue Academic Certificate</h3>
          <p className="text-xs text-blue-200">
            Hash original document and anchor proof onto the Ethereum smart contract.
          </p>
        </Link>

        <Link
          to="/admin/students"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Student Records</h3>
          <p className="text-xs text-slate-500">
            Enroll students, configure academic identifiers, and manage login access.
          </p>
        </Link>

        <Link
          to="/admin/certificates"
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Certificate Registry</h3>
          <p className="text-xs text-slate-500">
            Search, download, or revoke certificates with mandatory audit justifications.
          </p>
        </Link>
      </div>

      {/* Recent Blockchain Audit Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-800">
              Recent System & Blockchain Audit Events
            </h3>
          </div>
          <span className="text-xs text-slate-400">Real-time log stream</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activity.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No audit activity recorded yet.
            </div>
          ) : (
            activity.map((log) => (
              <div key={log._id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {log.action}
                    </span>
                    {log.certificateId && (
                      <span className="text-xs font-mono text-blue-600 font-semibold">
                        {log.certificateId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Actor: <span className="font-medium text-slate-700">{log.actor?.name || "Public"}</span> ({log.actor?.role || "user"})
                    {log.transactionHash && (
                      <span className="ml-2 font-mono text-slate-400">
                        Tx: {log.transactionHash.slice(0, 10)}...
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
