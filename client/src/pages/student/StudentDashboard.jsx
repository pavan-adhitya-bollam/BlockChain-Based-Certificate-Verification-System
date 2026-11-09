import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Share2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import VerificationStatusBadge from "../../components/VerificationStatusBadge";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [statsRes, certsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/certificates?limit=5"),
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (certsRes.success) setCertificates(certsRes.certificates);
      } catch (err) {
        console.error("Student dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Student Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Student Academic Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Access your tamper-proof digital academic credentials verified by the institution and permanently anchored on the blockchain.
          </p>
        </div>

        <Link
          to="/student/certificates"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>View My Credentials</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Issued Credentials
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {stats?.totalIssued ?? 0}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active / Valid On-Chain
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {stats?.totalActive ?? 0}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Revoked Credentials
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {stats?.totalRevoked ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* My Credentials Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">
            Recent Issued Academic Credentials
          </h3>
          <Link
            to="/student/certificates"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {certificates.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No academic certificates have been issued to your student account yet.
            </div>
          ) : (
            certificates.map((cert) => {
              const isRevoked = cert.issueStatus === "revoked";
              return (
                <div
                  key={cert._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-600">
                        {cert.certificateId}
                      </span>
                      <VerificationStatusBadge
                        status={isRevoked ? "REVOKED" : "VALID"}
                        size="sm"
                      />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{cert.course}</h4>
                    <p className="text-xs text-slate-500">
                      Conferred by: <span className="font-medium text-slate-700">{cert.institution}</span> •{" "}
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/certificates/${cert.certificateId}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>

                    <Link
                      to={`/verify/${cert.certificateId}`}
                      target="_blank"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Public Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
