import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: "positive" | "neutral" | "warning";
  };
  actions?: ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  actions,
}: StatCardProps) {
  const badgeStyles =
    badge?.variant === "positive"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : badge?.variant === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeStyles}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
      </div>

      {actions && <div className="mt-3 border-t border-slate-100 pt-3">{actions}</div>}
    </div>
  );
}
