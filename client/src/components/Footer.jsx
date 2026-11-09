import React from "react";
import { ShieldCheck, Cpu, Database, Award } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white">
                Certi<span className="text-blue-400">Chain</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Student Certificate Validation Using Blockchain — A decentralized, tamper-proof academic credential verification platform anchored on Ethereum / Hardhat smart contracts.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Hardhat Local Chain
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Off-Chain
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> SHA-256 Hashes
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/verify" className="hover:text-blue-400 transition-colors">
                  Public Verification
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-400 transition-colors">
                  Project Architecture
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-blue-400 transition-colors">
                  Institution Login
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-blue-400 transition-colors">
                  Student Portal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Academic Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Final-Year B.Tech CSE Capstone Project. Designed for transparent and instantaneous credential verification by global employers, universities, and institutions.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              Local Network Node: <code className="text-blue-300">127.0.0.1:8545</code>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Student Certificate Validation Using Blockchain. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with React, Express, Hardhat, Solidity, and MongoDB.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
