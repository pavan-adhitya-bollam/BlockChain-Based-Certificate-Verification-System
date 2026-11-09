import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  FileCheck,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileUp,
  ExternalLink,
} from "lucide-react";

export const LandingPage = () => {
  const [certId, setCertId] = useState("");
  const navigate = useNavigate();

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (certId.trim()) {
      navigate(`/verify/${certId.trim().toUpperCase()}`);
    } else {
      navigate("/verify");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Cpu className="w-3.5 h-3.5" />
            <span>Decentralized Academic Trust Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Student Certificate Validation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              Powered by Blockchain
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            An end-to-end cryptographic credential ecosystem. Academic institutions anchor tamper-proof SHA-256 certificate fingerprints onto a local Ethereum blockchain, enabling instant, transparent, and independent verification.
          </p>

          {/* Quick Search Card */}
          <div className="max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl mb-8">
            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g., CERT-2024-DEMO01)"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <Link
              to="/verify"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <FileUp className="w-4 h-4 text-blue-400" />
              <span>Verify PDF Document</span>
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Institution Login</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all"
            >
              <span>Explore Architecture</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            The Trust Pipeline
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900">
            How Blockchain Certificate Validation Works
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto mt-3 text-sm">
            Eliminating credential fraud through authoritative on-chain cryptographic hashes and zero-knowledge verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Cryptographic Fingerprinting</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Upon student graduation, the institution generates the official PDF certificate and calculates a unique SHA-256 hash representing the exact binary content of the file.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-mono">
              SHA256(PDF) &rarr; 64-char Hex Digest
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">On-Chain Ledger Anchoring</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              The institution wallet invokes the <code className="text-indigo-600 font-mono font-semibold">issueCertificate</code> smart contract function on the Hardhat blockchain. The block is mined and sealed forever.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-mono">
              Block Mined &rarr; Immutable Tx Hash
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Public Instant Verification</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Employers or universities scan the QR code or upload the PDF document. The system calculates the hash on the fly and queries the smart contract to prove authenticity or detect alterations.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 font-mono">
              On-Chain Match &rarr; 100% Genuine
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h5 className="font-bold text-base mb-1">Zero Trust Architecture</h5>
              <p className="text-xs text-slate-400">Blockchain state is the single source of truth, not mutable databases.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h5 className="font-bold text-base mb-1">Permanent Revocation</h5>
              <p className="text-xs text-slate-400">Revoked certificates can never be restored or tampered with on-chain.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <Cpu className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <h5 className="font-bold text-base mb-1">No Third-Party APIs</h5>
              <p className="text-xs text-slate-400">Runs locally on Hardhat EVM without MetaMask or paid cloud lock-in.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <FileCheck className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h5 className="font-bold text-base mb-1">Dynamic QR Validation</h5>
              <p className="text-xs text-slate-400">Downloadable official PDF certificates with scannable verification links.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
