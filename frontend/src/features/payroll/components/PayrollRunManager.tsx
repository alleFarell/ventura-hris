"use client";

import { useEffect, useState, useRef } from "react";
import { payrollApi } from "../api";
import { PayrollRun, PayrollRunItem, PayrollPeriod } from "../types";
import { Play, Lock, Eye, RefreshCw, X, FileText, CheckCircle } from "lucide-react";

export function PayrollRunManager() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Execution Modal
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split("T")[0]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Item Breakdown Drawer
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [items, setItems] = useState<PayrollRunItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const activeRunIdRef = useRef<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [runsData, periodsData] = await Promise.all([
        payrollApi.getPayrollRuns(),
        payrollApi.getPayrollPeriods(),
      ]);
      setRuns(runsData);
      setPeriods(periodsData);
      if (periodsData.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(periodsData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load payroll runs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId) return;
    setIsExecuting(true);
    try {
      await payrollApi.executePayrollRun({
        periodId: selectedPeriodId,
        executionDate,
      });
      setIsExecuteOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to execute payroll run");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleViewItems = async (run: PayrollRun) => {
    setSelectedRun(run);
    activeRunIdRef.current = run.id;
    setIsLoadingItems(true);
    setItems([]);
    try {
      const data = await payrollApi.getPayrollRunItems(run.id);
      if (activeRunIdRef.current === run.id) {
        setItems(data);
      }
    } catch (err: any) {
      if (activeRunIdRef.current === run.id) {
        alert(err?.message || "Failed to load run items");
      }
    } finally {
      if (activeRunIdRef.current === run.id) {
        setIsLoadingItems(false);
      }
    }
  };

  const handleFreeze = async (runId: string) => {
    if (!confirm("Are you sure you want to freeze this payroll run? No further modifications will be allowed.")) return;
    try {
      await payrollApi.freezePayrollRun(runId);
      await loadData();
      if (selectedRun?.id === runId) {
        setSelectedRun((prev) => (prev ? { ...prev, status: "FROZEN" } : null));
      }
    } catch (err: any) {
      alert(err?.message || "Failed to freeze payroll run");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const totalGrossDisbursed = runs.reduce((acc, r) => acc + Number(r.totalGrossAmount || 0), 0);
  const totalNetDisbursed = runs.reduce((acc, r) => acc + Number(r.totalNetAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Batch Payroll Runs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Execute, review, and freeze atomic monthly payroll processing runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExecuteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Play className="w-4 h-4 fill-white" />
            Execute New Payroll Run
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Batches</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{runs.length}</div>
          <div className="text-xs text-gray-500 mt-1">Processed runs recorded</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Total Gross Calculated</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{formatCurrency(totalGrossDisbursed)}</div>
          <div className="text-xs text-gray-500 mt-1">Gross earnings before tax/deductions</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Net Payable</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalNetDisbursed)}</div>
          <div className="text-xs text-gray-500 mt-1">Net disbursal amount</div>
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Execution History</h2>
          <span className="text-xs text-gray-500">{runs.length} runs</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading payroll runs...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-500">{error}</div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900">No payroll runs executed yet</div>
            <div className="text-xs text-gray-500 mt-1">
              Select an active payroll period and execute a new batch run.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Run Number</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Employees</th>
                  <th className="px-6 py-3">Gross Total</th>
                  <th className="px-6 py-3">Net Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{run.runNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{run.periodName || run.periodCode}</td>
                    <td className="px-6 py-4">{run.executionDate}</td>
                    <td className="px-6 py-4">{run.totalEmployees}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(run.totalGrossAmount)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(run.totalNetAmount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          run.status === "FROZEN"
                            ? "bg-slate-100 text-slate-700"
                            : run.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewItems(run)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded hover:bg-indigo-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Items
                      </button>
                      {run.status !== "FROZEN" && (
                        <button
                          onClick={() => handleFreeze(run.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200 transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Freeze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Execute Modal */}
      {isExecuteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Execute Payroll Run</h3>
              <button onClick={() => setIsExecuteOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecute} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Payroll Period</label>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Period --</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) - {p.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Execution / Disbursement Date</label>
                <input
                  type="date"
                  value={executionDate}
                  onChange={(e) => setExecutionDate(e.target.value)}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExecuteOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isExecuting ? "Processing..." : "Run Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Breakdown Drawer / Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Run Items: {selectedRun.runNumber}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Period: {selectedRun.periodName || selectedRun.periodCode} | Status: {selectedRun.status}
                </p>
              </div>
              <button onClick={() => setSelectedRun(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingItems ? (
                <div className="text-center py-12 text-sm text-gray-500">Loading calculation items...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">No items found for this run.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase">
                      <tr>
                        <th className="px-3 py-2.5">Employee</th>
                        <th className="px-3 py-2.5">Basic</th>
                        <th className="px-3 py-2.5">Allowances</th>
                        <th className="px-3 py-2.5">Overtime</th>
                        <th className="px-3 py-2.5">Reimbursements</th>
                        <th className="px-3 py-2.5">Attendance Cuts</th>
                        <th className="px-3 py-2.5">Loans</th>
                        <th className="px-3 py-2.5">Tax (PPh21)</th>
                        <th className="px-3 py-2.5 font-bold text-gray-900">Net Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((it) => (
                        <tr key={it.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {it.employeeName}
                            <span className="block text-[10px] text-gray-400">{it.employeeNumber}</span>
                          </td>
                          <td className="px-3 py-3">{formatCurrency(it.basicSalary)}</td>
                          <td className="px-3 py-3 text-emerald-600">+{formatCurrency(it.allowancesAmount)}</td>
                          <td className="px-3 py-3 text-emerald-600">+{formatCurrency(it.overtimeAmount)}</td>
                          <td className="px-3 py-3 text-emerald-600">+{formatCurrency(it.reimbursementAmount)}</td>
                          <td className="px-3 py-3 text-rose-600">-{formatCurrency(it.attendanceDeductionAmount)}</td>
                          <td className="px-3 py-3 text-rose-600">-{formatCurrency(it.loanDeductionAmount)}</td>
                          <td className="px-3 py-3 text-rose-600">-{formatCurrency(it.taxAmount)}</td>
                          <td className="px-3 py-3 font-bold text-gray-900 bg-gray-50/50">
                            {formatCurrency(it.netSalary)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
