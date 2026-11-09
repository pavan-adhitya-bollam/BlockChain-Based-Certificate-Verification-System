import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Cpu,
  History,
  Download,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Building,
  GraduationCap,
  Calendar,
  Hash,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import VerificationStatusBadge from "../../components/VerificationStatusBadge";

export const CertificateDetail = () => {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [onChain, setOnChain] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchCertAndAudit = async () => {
      try {
        const [certRes, auditRes] = await Promise.all([
          api.get(`/certificates/${id}`),
          api.get(`/certificates/${id}/audit`),
        ]);
        if (certRes.success) {
          setCert(certRes.certificate);
          setOnChain(certRes.onChainData);
        }
        if (auditRes.success) {
          setAuditLogs(auditRes.logs);
        }
      } catch (err) {
        console.error("Failed to load certificate detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCertAndAudit();
  }, [id]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Certificate Not Found</h2>
        <Link to="/admin/certificates" className="text-sm text-blue-600 hover:underline">
          Return to Registry
        </Link>
      </div>
    );
  }

  const isRevoked = cert.issueStatus === "revoked" || onChain?.isRevoked;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/certificates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificate Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/api/certificates/${cert.certificateId}/download`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>

          <Link
            to={`/verify/${cert.certificateId}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold shadow-sm transition-all"
          >
            <span>Public Verify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Status header */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Certificate Record Explorer
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {cert.certificateId}
            </h1>
          </div>
          <VerificationStatusBadge status={isRevoked ? "REVOKED" : "VALID"} size="lg" />
        </div>

        {/* Student & Academic info */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Student Recipient</span>
            <p className="font-bold text-base text-slate-900">{cert.studentName}</p>
            <span className="text-xs text-slate-500 font-mono">{cert.studentIdentifier}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Department / Class</span>
            <p className="font-semibold text-sm text-slate-800">{cert.department}</p>
            <span className="text-xs text-slate-500">
              Graduation: {cert.student?.graduationYear || "2024"}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Conferred Degree</span>
            <p className="font-semibold text-sm text-blue-900">{cert.course}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Issuing Institution</span>
            <p className="font-semibold text-sm text-slate-800">{cert.institution}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Issuance Date</span>
            <p className="font-semibold text-sm text-slate-800">
              {new Date(cert.issueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Off-Chain Database Status</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase font-mono">
              {cert.issueStatus}
            </span>
          </div>
        </div>

        {/* Revocation banner if revoked */}
        {isRevoked && (
          <div className="p-6 bg-rose-50 border-b border-rose-200 text-rose-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-800">
                  Revocation Order on Blockchain
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Reason: &ldquo;{cert.revocationDetails?.reason || onChain?.revokeReason}&rdquo;
                </p>
                <span className="text-[11px] font-mono text-rose-600 mt-1 block">
                  Revoked:{" "}
                  {cert.revocationDetails?.revokedAt
                    ? new Date(cert.revocationDetails.revokedAt).toLocaleString()
                    : "Recorded on-chain"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Cryptographic Verification */}
        <div className="p-6 sm:p-8 bg-slate-50/40 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Smart Contract & Mining Details</span>
          </h2>

          <div className="grid grid-cols-1 gap-3 font-mono text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-slate-400 uppercase font-bold text-[10px]">
                  Cryptographic SHA-256 Hash
                </span>
                <button
                  onClick={() => copyToClipboard(cert.fileHash, "hash")}
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  {copiedField === "hash" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "hash" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="font-bold text-slate-800 break-all select-all">{cert.fileHash}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-slate-400 uppercase font-bold text-[10px]">
                  Blockchain Transaction Hash
                </span>
                <button
                  onClick={() => copyToClipboard(cert.blockchainTxHash, "tx")}
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  {copiedField === "tx" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "tx" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-slate-700 break-all select-all">{cert.blockchainTxHash}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">
                  Registry Contract
                </span>
                <p className="text-slate-700 truncate">{cert.contractAddress}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">
                  Authority Wallet
                </span>
                <p className="text-slate-700 truncate">{cert.issuingWallet}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
          <History className="w-4 h-4 text-slate-500" />
          <span>Certificate Audit History Trail</span>
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400">No audit events recorded for this certificate.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {auditLogs.map((log) => (
              <div key={log._id} className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Actor: <span className="font-semibold text-slate-800">{log.actor?.name || "System"}</span> ({log.actor?.role || "actor"})
                  </p>
                  {log.transactionHash && (
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Tx: {log.transactionHash}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateDetail;
