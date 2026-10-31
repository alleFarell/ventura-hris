"use client";

import { Suspense, useEffect, useState } from "react";
import { payrollApi } from "../api";
import { PayrollAttendanceCutoff, PayrollPeriod } from "../types";
import { Clock, RefreshCw, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PayrollAttendanceCutoffsContent() {
  const searchParams = useSearchParams();
  const urlPeriodId = searchParams.get("periodId");

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(urlPeriodId || "");
  const [cutoffs, setCutoffs] = useState<PayrollAttendanceCutoff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPeriods() {
      try {
        const data = await payrollApi.getPayrollPeriods();
        setPeriods(data);
        if (!selectedPeriodId && data.length > 0) {
          setSelectedPeriodId(data[0].id);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load periods");
      }
    }
    loadPeriods();
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) return;
    loadCutoffs(selectedPeriodId);
  }, [selectedPeriodId]);

  const loadCutoffs = async (periodId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await payrollApi.getAttendanceCutoffs(periodId);
      setCutoffs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load attendance cutoff records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!selectedPeriodId) return;
    setIsIngesting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await payrollApi.ingestAttendance(selectedPeriodId);
      setCutoffs(data);
      setSuccessMsg("Attendance records and statutory overtime successfully ingested for this pay cycle!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to ingest attendance");
    } finally {
      setIsIngesting(false);
    }
  };

  const totalOT = cutoffs.reduce((sum, c) => sum + Number(c.overtimePayAmount || 0), 0);
  const totalDeductions = cutoffs.reduce((sum, c) => sum + Number(c.totalAttendanceDeductions || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance & Deduction Ingestion</h2>
          <p className="text-xs text-slate-500">
            Reconcile locked monthly attendance recaps, absent days, and approved overtime earnings for the cycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-sm"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <button
            onClick={handleIngest}
            disabled={isIngesting || !selectedPeriodId}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isIngesting ? "animate-spin" : ""}`} />
            {isIngesting ? "Ingesting..." : "Ingest Locked Attendance"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs">{successMsg}</div>}

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Employees Ingested</span>
          <span className="text-lg font-black text-slate-900">{cutoffs.length} Active Records</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Overtime Disbursal</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-lg font-black text-emerald-700 font-mono">
            + IDR {totalOT.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Total Attendance Cuts</span>
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          </div>
          <span className="text-lg font-black text-rose-700 font-mono">
            - IDR {totalDeductions.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3 text-center">Workdays</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent / Unpaid</th>
                <th className="px-4 py-3 text-center">Late (Min)</th>
                <th className="px-4 py-3 text-right">Overtime Pay</th>
                <th className="px-4 py-3 text-right">Attendance Cuts</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading attendance cutoff items...
                  </td>
                </tr>
              ) : cutoffs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No attendance records ingested yet. Click "Ingest Locked Attendance" to aggregate recaps.
                  </td>
                </tr>
              ) : (
                cutoffs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.employeeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{c.employeeNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{c.totalWorkdays}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{c.presentDays}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-rose-600">{c.absentDays}</span> /{" "}
                      <span className="font-semibold text-amber-600">{c.unpaidLeaveDays}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {c.lateMinutes > 0 ? (
                        <span className="text-amber-700 font-semibold">{c.lateMinutes}m</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">
                      IDR {Number(c.overtimePayAmount || 0).toLocaleString("id-ID")}
                      <div className="text-[10px] text-slate-400">({c.overtimeHours} hrs)</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-rose-700">
                      IDR {Number(c.totalAttendanceDeductions || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> SYNCED
                      </span>
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

export function PayrollAttendanceCutoffsSection() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <PayrollAttendanceCutoffsContent />
    </Suspense>
  );
}
