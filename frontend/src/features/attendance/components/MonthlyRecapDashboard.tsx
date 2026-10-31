"use client";

import { useState, useEffect, useCallback } from "react";
import { MonthlyAttendanceRecap } from "../types";
import { generateMonthlyRecap, getMonthlyRecaps, lockAllPeriodRecaps, lockMonthlyRecap } from "../api";
import { CheckCircle2, FileCheck, Lock, RefreshCw, ShieldAlert } from "lucide-react";

type Props = {
  recaps?: MonthlyAttendanceRecap[];
  selectedYear?: number;
  selectedMonth?: number;
  onPeriodChange?: (year: number, month: number) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
};

export function MonthlyRecapDashboard({
  recaps,
  selectedYear,
  selectedMonth,
  onPeriodChange,
  onRefresh,
  isLoading,
}: Props) {
  const now = new Date();
  const [internalYear, setInternalYear] = useState(selectedYear ?? now.getFullYear());
  const [internalMonth, setInternalMonth] = useState(selectedMonth ?? now.getMonth() + 1);
  const [internalRecaps, setInternalRecaps] = useState<MonthlyAttendanceRecap[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = recaps !== undefined;
  const activeYear = selectedYear ?? internalYear;
  const activeMonth = selectedMonth ?? internalMonth;
  const activeRecaps = recaps ?? internalRecaps;
  const activeLoading = isLoading ?? internalLoading;

  const loadData = useCallback(async () => {
    if (isControlled) return;
    setInternalLoading(true);
    try {
      const data = await getMonthlyRecaps(activeYear, activeMonth);
      setInternalRecaps(data);
    } catch {
      console.error("Failed to load monthly recaps");
    } finally {
      setInternalLoading(false);
    }
  }, [isControlled, activeYear, activeMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePeriodSelect = (year: number, month: number) => {
    if (onPeriodChange) {
      onPeriodChange(year, month);
    } else {
      setInternalYear(year);
      setInternalMonth(month);
    }
  };

  const handleRecalculate = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyRecap(activeYear, activeMonth);
      if (onRefresh) onRefresh();
      else loadData();
    } catch {
      alert("Failed to generate/recalculate monthly attendance recaps.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLockSingle = async (id: string) => {
    if (!confirm("Lock this employee's attendance recap for payroll handoff? It cannot be altered once locked.")) {
      return;
    }
    try {
      await lockMonthlyRecap(id);
      if (onRefresh) onRefresh();
      else loadData();
    } catch {
      alert("Failed to lock recap.");
    }
  };

  const handleLockAll = async () => {
    if (!confirm(`Are you sure you want to LOCK all attendance recaps for ${months[activeMonth - 1]} ${activeYear}? This will freeze attendance data for payroll calculation.`)) {
      return;
    }
    setIsLocking(true);
    try {
      await lockAllPeriodRecaps(activeYear, activeMonth);
      if (onRefresh) onRefresh();
      else loadData();
    } catch {
      alert("Failed to lock period recaps.");
    } finally {
      setIsLocking(false);
    }
  };

  const allLocked = activeRecaps.length > 0 && activeRecaps.every((r) => r.status === "LOCKED_FOR_PAYROLL");

  return (
    <div className="space-y-4">
      {/* Filters and Actions Bar */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Period Year</label>
            <select
              value={activeYear}
              onChange={(e) => handlePeriodSelect(Number(e.target.value), activeMonth)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Month</label>
            <select
              value={activeMonth}
              onChange={(e) => handlePeriodSelect(activeYear, Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
            >
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isGenerating || allLocked}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            Recalculate Metrics
          </button>
          <button
            onClick={handleLockAll}
            disabled={isLocking || allLocked || activeRecaps.length === 0}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition ${
              allLocked
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            {allLocked ? "All Recaps Locked" : isLocking ? "Locking..." : "Lock All for Payroll"}
          </button>
        </div>
      </div>

      {/* Recap Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold text-center">Workdays</th>
                <th className="px-4 py-3 font-semibold text-center">Present</th>
                <th className="px-4 py-3 font-semibold text-center">Absent</th>
                <th className="px-4 py-3 font-semibold text-center">Late (mins)</th>
                <th className="px-4 py-3 font-semibold text-center">Early Dep</th>
                <th className="px-4 py-3 font-semibold text-center">Overtime (hrs)</th>
                <th className="px-4 py-3 font-semibold text-center">Paid Leave</th>
                <th className="px-4 py-3 font-semibold text-center">Unpaid Leave</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeLoading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">Loading monthly recaps...</td>
                </tr>
              ) : activeRecaps.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No recaps available for this period. Click &quot;Recalculate Metrics&quot; to aggregate.
                  </td>
                </tr>
              ) : (
                activeRecaps.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      <span className="font-semibold">{r.employeeName}</span>
                      <span className="ml-1 text-[11px] text-slate-400">({r.employeeNumber})</span>
                    </td>
                    <td className="px-4 py-3 text-center">{r.totalWorkingDays}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{r.totalDaysPresent}</td>
                    <td className="px-4 py-3 text-center font-bold text-red-600">{r.totalDaysAbsent}</td>
                    <td className="px-4 py-3 text-center text-amber-700 font-semibold">{r.totalLateMinutes}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{r.totalEarlyDepartureMinutes}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-blue-700">{r.totalOvertimeHours}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{r.totalPaidLeaveDays}</td>
                    <td className="px-4 py-3 text-center font-bold text-red-500">{r.totalUnpaidLeaveDays}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.status === "LOCKED_FOR_PAYROLL" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                          <FileCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status !== "LOCKED_FOR_PAYROLL" ? (
                        <button
                          onClick={() => handleLockSingle(r.id)}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          Lock
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const MonthlyRecapSection = MonthlyRecapDashboard;
