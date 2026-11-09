import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Eye,
  Check,
  Copy,
  Calendar,
  Building,
  Loader2,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import VerificationStatusBadge from "../../components/VerificationStatusBadge";
import Modal from "../../components/Modal";

export const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchMyCerts = async () => {
      try {
        const res = await api.get("/certificates");
        if (res.success) {
          setCertificates(res.certificates);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCerts();
  }, []);

  const handleOpenShare = (cert) => {
    setSelectedCert(cert);
    setCopiedLink(false);
    setShareModalOpen(true);
  };

  const getVerificationUrl = (certId) => {
    return `${window.location.origin}/verify/${certId}`;
  };

  const handleCopyLink = () => {
    if (selectedCert) {
      navigator.clipboard.writeText(getVerificationUrl(selectedCert.certificateId));
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Academic Credentials
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Official digital certificates issued by the institution and anchored on the blockchain.
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Certificates Issued Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your educational institution has not yet published an on-chain academic certificate for your account. Please check back after graduation or contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const isRevoked = cert.issueStatus === "revoked";
            return (
              <div
                key={cert._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {cert.certificateId}
                    </span>
                    <VerificationStatusBadge
                      status={isRevoked ? "REVOKED" : "VALID"}
                      size="sm"
                    />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                      {cert.course}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cert.institution}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Conferred: {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Block #{cert.blockNumber || "1"}
                    </span>
                  </div>

                  {/* Revocation notice if revoked */}
                  {isRevoked && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Officially Revoked</span>
                        <span>Reason: &ldquo;{cert.revocationDetails?.reason}&rdquo;</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/certificates/${cert.certificateId}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download PDF</span>
                    </a>

                    <button
                      onClick={() => handleOpenShare(cert)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Share / QR</span>
                    </button>
                  </div>

                  <Link
                    to={`/verify/${cert.certificateId}`}
                    target="_blank"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share & QR Code Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Shareable Credential & Verification Link"
      >
        {selectedCert && (
          <div className="space-y-6 text-center">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                {selectedCert.course}
              </h4>
              <p className="font-mono text-xs text-blue-600 font-semibold">
                {selectedCert.certificateId}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  getVerificationUrl(selectedCert.certificateId)
                )}`}
                alt="Verification QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
              <span className="block text-[11px] text-slate-500 mt-2">
                Scan with any mobile camera to verify on blockchain
              </span>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Public Verification URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getVerificationUrl(selectedCert.certificateId)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 leading-relaxed">
              Anyone with this link or QR code can instantly verify the authenticity of your academic credential on the blockchain without requiring an account.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCertificates;
