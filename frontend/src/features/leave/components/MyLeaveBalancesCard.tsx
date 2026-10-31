"use client";

import { LeaveBalance } from "../types";
import { Calendar, CheckCircle2, Clock, Umbrella } from "lucide-react";

type Props = {
  balances: LeaveBalance[];
  onRequestLeave: () => void;
  isLoading?: boolean;
};

export function MyLeaveBalancesCard({ balances, onRequestLeave, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Leave Entitlements & Balances</h2>
          <p className="text-xs text-slate-500">Current year allocated quotas, consumed days, and available balances</p>
        </div>
        <button
          onClick={onRequestLeave}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          <Umbrella className="h-4 w-4" />
          Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((balance) => {
          const total = balance.totalQuota + balance.carriedOver;
          const pctUsed = total > 0 ? Math.min(100, Math.round(((balance.used + balance.pending) / total) * 100)) : 0;

          return (
            <div
              key={balance.id}
              className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {balance.leaveTypeCode}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-slate-800">{balance.leaveTypeName}</h3>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{balance.remainingQuota}</span>
                  <span className="text-xs text-slate-400">/ {total} days remaining</span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pctUsed > 80 ? "bg-amber-500" : pctUsed > 50 ? "bg-blue-600" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pctUsed}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Used: {balance.used}d
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" /> Pending: {balance.pending}d
                </span>
                {balance.carriedOver > 0 && (
                  <span className="text-slate-400">Carry: +{balance.carriedOver}d</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
