import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileUp,
  ShieldCheck,
  AlertCircle,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import api from "../services/api";
import VerificationStatusBadge from "../components/VerificationStatusBadge";

export const VerifyPage = () => {
  const [activeTab, setActiveTab] = useState("id"); // "id" | "file"
  const [certificateId, setCertificateId] = useState("");
  const [fileCertId, setFileCertId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileResult, setFileResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setErrorMessage("Please enter a valid Certificate ID");
      return;
    }
    navigate(`/verify/${certificateId.trim().toUpperCase()}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMessage("Only PDF documents (.pdf) can be verified.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setFileResult(null);

      // Auto-populate certificate ID if filename contains CERT-
      const match = file.name.match(/CERT-[A-Z0-9-]+/i);
      if (match && !fileCertId) {
        setFileCertId(match[0].toUpperCase());
      }
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!fileCertId.trim()) {
      setErrorMessage("Please enter the Certificate ID to match against on-chain records.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Please select a PDF certificate to upload.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setFileResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await api.post(
        `/certificates/${fileCertId.trim().toUpperCase()}/verify-file`,
        formData
      );

      setFileResult(res);
    } catch (err) {
      if (err.data && err.data.status) {
        setFileResult(err.data);
      } else {
        setErrorMessage(err.message || "File verification request failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Independent Verification</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Verify any issued academic credential against the immutable blockchain registry in seconds.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => {
                setActiveTab("id");
                setErrorMessage("");
              }}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "id"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Verify by Certificate ID</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("file");
                setErrorMessage("");
              }}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "file"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>Verify by PDF Upload</span>
            </button>
          </div>

          <div className="p-8">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: By Certificate ID */}
            {activeTab === "id" && (
              <div>
                <form onSubmit={handleIdSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Certificate Identifier
                    </label>
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g., CERT-2024-DEMO01"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      The unique identifier printed on the bottom-left of the official certificate or encoded in the QR code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Check On-Chain Registry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Test Demo Fillers */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Quick Demo Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCertificateId("CERT-2024-DEMO01")}
                      className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      CERT-2024-DEMO01 (Valid)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCertificateId("CERT-2024-DEMO02")}
                      className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      CERT-2024-DEMO02 (Revoked)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCertificateId("CERT-UNKNOWN-404")}
                      className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      CERT-UNKNOWN-404 (Not Found)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: By File Upload */}
            {activeTab === "file" && (
              <div>
                <form onSubmit={handleFileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Matching Certificate ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CERT-2024-DEMO01"
                      value={fileCertId}
                      onChange={(e) => setFileCertId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Dropzone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Upload Original PDF Certificate
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      {selectedFile ? (
                        <div>
                          <p className="text-sm font-semibold text-blue-600 truncate max-w-xs mx-auto">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Drop certificate PDF here, or <span className="text-blue-600 font-semibold">browse</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Only genuine .pdf files up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedFile}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculating SHA-256 & Checking Blockchain...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Verify File Cryptographic Hash</span>
                      </>
                    )}
                  </button>
                </form>

                {/* File Verification Result Panel */}
                {fileResult && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Cryptographic Verdict:
                        </span>
                        <VerificationStatusBadge status={fileResult.status} size="lg" />
                      </div>

                      <p className="text-sm text-slate-700 font-medium">
                        {fileResult.message}
                      </p>

                      {/* Hash comparison details */}
                      <div className="space-y-2 text-xs font-mono bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Uploaded File SHA-256 Hash:</span>
                          <span className="text-slate-800 break-all select-all font-semibold">
                            {fileResult.uploadedFileHash || "N/A"}
                          </span>
                        </div>
                        {fileResult.onChainHash && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-slate-400 block mb-0.5">Authoritative Blockchain Hash:</span>
                            <span
                              className={`break-all select-all font-semibold ${
                                fileResult.hashMatch ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              {fileResult.onChainHash}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata if found */}
                      {fileResult.metadata && (
                        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block">Student:</span>
                            <span className="font-semibold text-slate-800">
                              {fileResult.metadata.studentName} ({fileResult.metadata.studentIdentifier})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Course:</span>
                            <span className="font-semibold text-slate-800">
                              {fileResult.metadata.course}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Link to Full Result Page */}
                      <div className="pt-2 text-right">
                        <button
                          onClick={() => navigate(`/verify/${fileCertId.trim().toUpperCase()}`)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <span>View Full Blockchain Receipt & Explorer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
