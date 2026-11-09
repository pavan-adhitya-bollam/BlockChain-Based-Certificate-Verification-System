import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ShieldAlert } from "lucide-react";

export const STATUS_CONFIG = {
  VALID: {
    label: "GENUINE & VALID",
    description: "Certificate fingerprint verified on blockchain and authentic.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bannerClass: "bg-emerald-600 text-white",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  REVOKED: {
    label: "OFFICIALLY REVOKED",
    description: "Certificate was formally revoked and annulled by issuing institution.",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    bannerClass: "bg-rose-600 text-white",
    icon: XCircle,
    iconColor: "text-rose-500",
  },
  HASH_MISMATCH: {
    label: "HASH MISMATCH / TAMPERED",
    description: "Uploaded document content differs from original blockchain fingerprint.",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    bannerClass: "bg-amber-600 text-white",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  NOT_FOUND: {
    label: "NOT FOUND ON CHAIN",
    description: "Certificate identifier does not exist in the blockchain registry.",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    bannerClass: "bg-slate-700 text-white",
    icon: HelpCircle,
    iconColor: "text-slate-500",
  },
  VERIFICATION_UNAVAILABLE: {
    label: "VERIFICATION UNAVAILABLE",
    description: "Local blockchain node is unreachable. Authenticity could not be confirmed.",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-200",
    bannerClass: "bg-orange-600 text-white",
    icon: ShieldAlert,
    iconColor: "text-orange-500",
  },
};

export const VerificationStatusBadge = ({ status, size = "md" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_FOUND;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-sm gap-2",
    lg: "px-4 py-1.5 text-base gap-2.5",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.badgeClass} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} flex-shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};

export default VerificationStatusBadge;
