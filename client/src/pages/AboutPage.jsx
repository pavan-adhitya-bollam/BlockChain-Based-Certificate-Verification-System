import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Database,
  Lock,
  ArrowRight,
  Code2,
} from "lucide-react";

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Final-Year B.Tech CSE Project</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About the Project: Student Certificate Validation Using Blockchain
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            A comprehensive, tamper-proof academic verification architecture resolving credential fraud through distributed ledger technology.
          </p>
        </div>

        {/* Abstract & Problem Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <XCircle className="w-5 h-5" />
              </span>
              <span>The Problem Statement</span>
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Academic credential fraud has emerged as a severe global concern. Conventional paper certificates and basic digital PDFs are vulnerable to unauthorized forgery, photo-editing alterations, and illicit diploma mills.
              </p>
              <p>
                Manual verification via university registrar back-channels is time-consuming, expensive, and bureaucratic, often taking weeks for employers or foreign universities to validate candidate claims.
              </p>
              <p>
                Centralized databases are also susceptible to single points of failure, administrative corruption, and unauthorized data modifications.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <span>The Blockchain Solution</span>
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                This project implements a decentralized verification architecture. Rather than trusting centralized databases or paper seals, the authoritative proof of every certificate is anchored as a cryptographic SHA-256 fingerprint on an Ethereum smart contract.
              </p>
              <p>
                Once mined into a block, the certificate fingerprint cannot be modified, deleted, or backdated by anyone—not even system administrators.
              </p>
              <p>
                Public verifiers can verify certificates instantaneously using either a Certificate ID or by uploading an original PDF to check its bit-for-bit cryptographic integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Existing vs Proposed System Comparison */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            System Comparison: Existing vs. Proposed
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Feature / Metric</th>
                  <th className="py-3 px-4 text-rose-700 bg-rose-50/50">Traditional System</th>
                  <th className="py-3 px-4 text-emerald-700 bg-emerald-50/50">CertiChain (Blockchain)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-medium">Tamper Resistance</td>
                  <td className="py-3 px-4 text-rose-600">Low (Editable PDFs, forged physical seals)</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">100% Cryptographic Immutability</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Verification Latency</td>
                  <td className="py-3 px-4">1 to 4 weeks (manual email/postal inquiry)</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">&lt; 1 Second Instant On-Chain Query</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Single Point of Failure</td>
                  <td className="py-3 px-4">Yes (Centralized database or server outage)</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Decentralized Hardhat / Ethereum Ledger</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Revocation Management</td>
                  <td className="py-3 px-4">Unreliable; physical paper cannot be recalled</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Permanent on-chain revocation event</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Public Access</td>
                  <td className="py-3 px-4">Requires paid accounts or formal requests</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">Free, instant, anonymous verification</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technology Stack Details */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <span>Complete Technology Stack</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Frontend</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• React 18 + Vite</li>
                <li>• Tailwind CSS</li>
                <li>• Lucide React Icons</li>
                <li>• React Router v6</li>
                <li>• Axios API Client</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Backend</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Node.js & Express</li>
                <li>• JWT & Bcrypt Auth</li>
                <li>• Multer (Secure Uploads)</li>
                <li>• PDFKit & QRCode</li>
                <li>• Helmet & Express Rate Limit</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Blockchain</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Solidity Smart Contracts</li>
                <li>• Hardhat Local Network</li>
                <li>• Ethers.js v6 Integration</li>
                <li>• SHA-256 Byte Hashes</li>
                <li>• Custom Gas Errors</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Database</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• MongoDB Local Engine</li>
                <li>• Mongoose ODM</li>
                <li>• Indexed Collections</li>
                <li>• Audit Trail Records</li>
                <li>• Reconciliation Handler</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>Test the Verification Engine</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
