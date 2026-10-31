"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { PayrollPeriod, PayrollPeriodCreateRequest } from "../types";
import { Calendar, Plus, RefreshCw, X, Play, CheckCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export function PayrollPeriodManager() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<PayrollPeriodCreateRequest>({
    code: "",
    name: "",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    attendanceCutoffDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split("T")[0],
    payoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    totalStandardWorkdays: 20,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPeriods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payrollApi.getPayrollPeriods();
      setPeriods(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load payroll periods");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await payrollApi.createPayrollPeriod(form);
      setIsModalOpen(false);
      loadPeriods();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create payroll period");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await payrollApi.updatePayrollPeriodStatus(id, newStatus);
      loadPeriods();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-700 border-blue-200 font-bold";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-200 animate-pulse";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CLOSED":
        return "bg-slate-200 text-slate-600 border-slate-300";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payroll Periods & Cutoff Schedule</h2>
          <p className="text-xs text-slate-500">
            Define calendar payroll pay cycles, attendance cutoff dates, and execution workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPeriods}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> New Pay Cycle
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Loading payroll cycles...
          </div>
        ) : periods.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No payroll cycles planned yet. Click "New Pay Cycle" to create your first period.
          </div>
        ) : (
          periods.map((period) => (
            <div
              key={period.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-blue-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{period.name}</h3>
                    <span className="font-mono text-xs text-slate-400">{period.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusBadge(period.status)}`}>
                    {period.status}
                  </span>

                  {/* Quick Action Transitions */}
                  {period.status === "PLANNED" && (
                    <button
                      onClick={() => handleStatusChange(period.id, "ACTIVE")}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      <Play className="h-3 w-3" /> Set Active
                    </button>
                  )}
                  {period.status === "ACTIVE" && (
                    <button
                      onClick={() => handleStatusChange(period.id, "PROCESSING")}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                    >
                      <Clock className="h-3 w-3" /> Begin Processing
                    </button>
                  )}
                  {period.status === "PROCESSING" && (
                    <button
                      onClick={() => handleStatusChange(period.id, "COMPLETED")}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                    >
                      <CheckCircle className="h-3 w-3" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Cycle Timeline Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Interval</span>
                  <span className="font-semibold text-slate-800">
                    {period.startDate} → {period.endDate}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Cutoff</span>
                  <span className="font-semibold text-amber-700">{period.attendanceCutoffDate}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payout Target Date</span>
                  <span className="font-semibold text-emerald-700">{period.payoutDate}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Workdays</span>
                  <span className="font-semibold text-slate-800">{period.totalStandardWorkdays} Days</span>
                </div>
              </div>

              {/* Navigation to Ingest & Simulation */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  Simulated Employees: <strong>{period.totalEmployeesIngested || 0}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/payroll/attendance-integration?periodId=${period.id}`}
                    className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 text-xs"
                  >
                    Attendance Reconciliation <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/payroll/simulation?periodId=${period.id}`}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 text-xs"
                  >
                    Simulation & Payout <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Create New Payroll Pay Cycle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cycle Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAY-2026-02"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cycle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. February 2026 Monthly Payroll"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance Cutoff *</label>
                  <input
                    type="date"
                    required
                    value={form.attendanceCutoffDate}
                    onChange={(e) => setForm({ ...form, attendanceCutoffDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payout Date *</label>
                  <input
                    type="date"
                    required
                    value={form.payoutDate}
                    onChange={(e) => setForm({ ...form, payoutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Workdays in Period</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.totalStandardWorkdays}
                  onChange={(e) => setForm({ ...form, totalStandardWorkdays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Pay Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
