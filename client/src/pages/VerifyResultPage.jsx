import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Download,
  Calendar,
  Building,
  GraduationCap,
  FileText,
  Cpu,
  Hash,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import { STATUS_CONFIG, VerificationStatusBadge } from "../components/VerificationStatusBadge";

export const VerifyResultPage = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/certificates/${certificateId.toUpperCase()}/verify`);
        setData(res);
      } catch (err) {
        if (err.data) {
          setData(err.data);
        } else {
          setError(err.message || "Failed to fetch verification status from blockchain network.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (certificateId) {
      fetchVerification();
    }
  }, [certificateId]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Querying Blockchain Ledger...</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Verifying on-chain state for {certificateId}
        </p>
      </div>
    );
  }

  const status = data?.status || (error ? "VERIFICATION_UNAVAILABLE" : "NOT_FOUND");
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_FOUND;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Verification Search</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">
            ID: {certificateId}
          </span>
        </div>

        {/* Big Status Hero Banner */}
        <div className={`p-8 rounded-3xl shadow-lg ${config.bannerClass} flex flex-col sm:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-5">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <StatusIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/80 block">
                Blockchain Verification Result
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {config.label}
              </h1>
              <p className="text-sm text-white/90 font-medium mt-1">
                {config.description}
              </p>
            </div>
          </div>

          {status === "VALID" && (
            <a
              href={`/api/certificates/${certificateId}/download`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow hover:bg-emerald-50 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </a>
          )}
        </div>

        {/* Revocation Warning Box if Revoked */}
        {status === "REVOKED" && data?.revocationDetails && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
            <h3 className="font-bold text-sm flex items-center gap-2 text-rose-800 mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Official Institution Revocation Order</span>
            </h3>
            <p className="text-sm text-rose-800 font-semibold mb-3">
              Reason: &ldquo;{data.revocationDetails.reason}&rdquo;
            </p>
            <span className="text-xs font-mono text-rose-600">
              Revocation Recorded:{" "}
              {data.revocationDetails.revokedAt
                ? new Date(data.revocationDetails.revokedAt).toLocaleString()
                : "Timestamp recorded on blockchain"}
            </span>
          </div>
        )}

        {/* Details Card if Found */}
        {data?.onChain && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Academic Credential Credentials</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">Student Name</span>
                  <p className="text-base font-bold text-slate-900">
                    {data.metadata?.studentName || "Registered Student"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">Student Identifier</span>
                  <p className="text-base font-mono font-semibold text-slate-800">
                    {data.onChain.studentIdentifier}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">Issuing Authority</span>
                  <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{data.onChain.institution}</span>
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Conferred Degree / Course</span>
                  <p className="text-base font-bold text-blue-900">
                    {data.onChain.course}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1">Issue Timestamp</span>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>
                      {new Date(data.onChain.issueTimestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Proof Section */}
            <div className="p-8 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <span>On-Chain Cryptographic Evidence</span>
              </h2>

              <div className="space-y-4">
                {/* SHA-256 File Hash */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-blue-500" />
                      Cryptographic SHA-256 Fingerprint
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.onChain.certificateHash, "hash")}
                      className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      {copiedField === "hash" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === "hash" ? "Copied" : "Copy Hash"}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-800 break-all select-all font-semibold">
                    {data.onChain.certificateHash}
                  </p>
                </div>

                {/* Contract Address */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Smart Contract Address
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.onChain.contractAddress, "contract")}
                      className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      {copiedField === "contract" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === "contract" ? "Copied" : "Copy Address"}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-800 break-all select-all">
                    {data.onChain.contractAddress}
                  </p>
                </div>

                {/* Blockchain Transaction Hash */}
                {data.metadata?.blockchainTxHash && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mining Transaction Hash
                      </span>
                      <button
                        onClick={() => copyToClipboard(data.metadata.blockchainTxHash, "tx")}
                        className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        {copiedField === "tx" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === "tx" ? "Copied" : "Copy Tx"}</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-800 break-all select-all">
                      {data.metadata.blockchainTxHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for NOT_FOUND or UNAVAILABLE */}
        {(!data || status === "NOT_FOUND" || status === "VERIFICATION_UNAVAILABLE") && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {status === "NOT_FOUND" ? "Certificate Record Not Found" : "Blockchain Node Unavailable"}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {status === "NOT_FOUND"
                ? `No on-chain registration exists for ID: ${certificateId}. Please ensure the certificate identifier is entered correctly.`
                : "The local Hardhat blockchain network is offline. Please start the node using 'npm run chain' and try again."}
            </p>
            <div className="pt-2">
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                <span>Try Another Certificate</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyResultPage;
