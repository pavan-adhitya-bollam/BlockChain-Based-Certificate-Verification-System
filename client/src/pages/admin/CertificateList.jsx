import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Eye,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import VerificationStatusBadge from "../../components/VerificationStatusBadge";
import Modal from "../../components/Modal";

export const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState("");
  const [notification, setNotification] = useState("");

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/certificates", { params });
      if (res.success) {
        setCertificates(res.certificates);
      }
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, statusFilter]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleOpenRevoke = (cert) => {
    setSelectedCert(cert);
    setRevokeReason("");
    setRevokeError("");
    setRevokeModalOpen(true);
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setRevokeError("A mandatory revocation justification reason is required.");
      return;
    }

    setIsRevoking(true);
    setRevokeError("");

    try {
      const res = await api.post(`/certificates/${selectedCert.certificateId}/revoke`, {
        reason: revokeReason.trim(),
      });

      if (res.success) {
        setRevokeModalOpen(false);
        showNotification(
          `Certificate ${selectedCert.certificateId} permanently revoked on blockchain.`
        );
        fetchCertificates();
      }
    } catch (err) {
      setRevokeError(err.message || "Blockchain revocation transaction failed.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <span>{notification}</span>
          <button onClick={() => setNotification("")} className="text-emerald-600 hover:text-emerald-800 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Blockchain Certificate Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, download, or revoke academic certificates anchored on the Ethereum ledger.
          </p>
        </div>

        <Link
          to="/admin/certificates/issue"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <span>Issue New Certificate</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or certificate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="issued">Valid / Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course & Dept</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Block / Tx</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Querying blockchain records...</span>
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No certificates found in the registry.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => {
                  const isRevoked = cert.issueStatus === "revoked";
                  return (
                    <tr key={cert._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                        <Link
                          to={`/admin/certificates/${cert.certificateId}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{cert.certificateId}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {cert.studentName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {cert.studentIdentifier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 text-xs block">
                          {cert.course}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cert.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <VerificationStatusBadge
                          status={isRevoked ? "REVOKED" : "VALID"}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        <span>Block #{cert.blockNumber || "1"}</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[100px]">
                          {cert.blockchainTxHash}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details */}
                          <Link
                            to={`/admin/certificates/${cert.certificateId}`}
                            title="Audit & Blockchain Details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Download */}
                          <a
                            href={`/api/certificates/${cert.certificateId}/download`}
                            target="_blank"
                            rel="noreferrer"
                            title="Download PDF"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Public Verify */}
                          <Link
                            to={`/verify/${cert.certificateId}`}
                            target="_blank"
                            title="Public Verification Result"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Revoke Action */}
                          {!isRevoked && (
                            <button
                              onClick={() => handleOpenRevoke(cert)}
                              title="Revoke Certificate On-Chain"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal */}
      <Modal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        title="Revoke Certificate on Blockchain"
      >
        {selectedCert && (
          <form onSubmit={handleRevokeSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Permanent On-Chain Revocation Warning</span>
              </p>
              <p>
                Revoking this certificate is permanent and irreversible on the Ethereum smart contract. Public verifiers will immediately receive an official <strong>REVOKED</strong> status.
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Certificate ID</span>
              <span className="font-mono font-bold text-sm text-slate-800">
                {selectedCert.certificateId}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Student</span>
              <span className="font-semibold text-sm text-slate-800">
                {selectedCert.studentName} ({selectedCert.studentIdentifier})
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Mandatory Revocation Justification Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Administrative disciplinary committee decision dated 2026-10-29; plagiarism discovery."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This reason is broadcasted and recorded immutably on the blockchain.
              </p>
            </div>

            {revokeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {revokeError}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRevoking}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-semibold text-sm shadow transition-all flex items-center gap-1.5"
              >
                {isRevoking && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm Revocation On-Chain</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CertificateList;
