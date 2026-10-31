"use client";

import { Suspense, useEffect, useState } from "react";
import { payrollApi } from "../api";
import { PayrollPeriod, PayrollSimulation } from "../types";
import { Calculator, AlertCircle, CheckCircle, RefreshCw, DollarSign, Wallet, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PayrollSimulationContent() {
  const searchParams = useSearchParams();
  const urlPeriodId = searchParams.get("periodId");

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(urlPeriodId || "");
  const [simulations, setSimulations] = useState<PayrollSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [filterDiscrepanciesOnly, setFilterDiscrepanciesOnly] = useState(false);

  useEffect(() => {
    async function loadInit() {
      try {
        const data = await payrollApi.getPayrollPeriods();
        setPeriods(data);
        if (!selectedPeriodId && data.length > 0) {
          setSelectedPeriodId(data[0].id);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load payroll periods");
      }
    }
    loadInit();
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) return;
    loadSimulations(selectedPeriodId);
  }, [selectedPeriodId]);

  const loadSimulations = async (periodId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await payrollApi.getSimulations(periodId);
      setSimulations(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load simulations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedPeriodId) return;
    setIsSimulating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await payrollApi.simulatePayroll(selectedPeriodId);
      setSimulations(data);
      setSuccessMsg("Pre-payroll calculation simulation completed successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  const displayedSims = filterDiscrepanciesOnly
    ? simulations.filter((s) => s.hasDiscrepancies)
    : simulations;

  const totalGross = simulations.reduce((sum, s) => sum + Number(s.grossSalary || 0), 0);
  const totalNet = simulations.reduce((sum, s) => sum + Number(s.netSalary || 0), 0);
  const totalTax = simulations.reduce((sum, s) => sum + Number(s.taxDeduction || 0), 0);
  const totalDiscrepancies = simulations.filter((s) => s.hasDiscrepancies).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pre-Payroll Calculation Simulator</h2>
          <p className="text-xs text-slate-500">
            Preview gross earnings, mid-period prorations, attendance penalties, and progressive tax withholdings before final pay run.
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
            onClick={handleRunSimulation}
            disabled={isSimulating || !selectedPeriodId}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50"
          >
            <Calculator className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Simulating..." : "Run Pre-Payroll Simulation"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs">{successMsg}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Gross Payroll</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            IDR {totalGross.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-blue-600 block">Estimated Net Payout</span>
          <span className="text-lg font-black text-blue-600 font-mono">
            IDR {totalNet.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Estimated Tax Withholding</span>
          <span className="text-lg font-black text-amber-800 font-mono">
            IDR {totalTax.toLocaleString("id-ID")}
          </span>
        </div>
        <div
          onClick={() => setFilterDiscrepanciesOnly(!filterDiscrepanciesOnly)}
          className={`border rounded-xl p-4 shadow-sm cursor-pointer transition ${
            totalDiscrepancies > 0
              ? filterDiscrepanciesOnly
                ? "bg-rose-100 border-rose-300"
                : "bg-rose-50 border-rose-200 hover:bg-rose-100"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Flagged Discrepancies</span>
            {totalDiscrepancies > 0 && <AlertCircle className="h-4 w-4 text-rose-600" />}
          </div>
          <span className="text-lg font-black text-rose-700">
            {totalDiscrepancies} Issue{totalDiscrepancies === 1 ? "" : "s"}
          </span>
          <p className="text-[10px] text-slate-500 mt-1">
            {filterDiscrepanciesOnly ? "Showing flagged only (click to show all)" : "Click to filter"}
          </p>
        </div>
      </div>

      {/* Simulation Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3 text-right">Base / Prorated</th>
                <th className="px-4 py-3 text-right">Allowances</th>
                <th className="px-4 py-3 text-right">Overtime</th>
                <th className="px-4 py-3 text-right">Att. Deductions</th>
                <th className="px-4 py-3 text-right">PPh 21 Tax</th>
                <th className="px-4 py-3 text-right">Estimated Net</th>
                <th className="px-4 py-3 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading calculation simulations...
                  </td>
                </tr>
              ) : displayedSims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No simulations found. Click "Run Pre-Payroll Simulation" to generate.
                  </td>
                </tr>
              ) : (
                displayedSims.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{s.employeeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{s.employeeNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <div className="font-medium text-slate-900">
                        IDR {Number(s.proratedBasicSalary || 0).toLocaleString("id-ID")}
                      </div>
                      {s.prorationFactor < 1.0 && (
                        <span className="text-[10px] text-amber-700 font-semibold">
                          ({(Number(s.prorationFactor) * 100).toFixed(1)}% prorated)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700">
                      + IDR {Number(s.fixedAllowances || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-teal-700">
                      + IDR {Number(s.overtimeEarnings || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-700">
                      - IDR {Number(s.attendanceDeductions || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-800">
                      - IDR {Number(s.taxDeduction || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                      IDR {Number(s.netSalary || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.hasDiscrepancies ? (
                        <span
                          title={s.discrepancyNote}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          <AlertCircle className="h-3 w-3" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Clean
                        </span>
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

export function PayrollSimulationDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <PayrollSimulationContent />
    </Suspense>
  );
}
