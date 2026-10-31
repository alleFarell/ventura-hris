"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { EmployeeLoan, EmployeeLoanCreateRequest } from "../types";
import { Plus, RefreshCw, X, CreditCard, DollarSign } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function EmployeeLoanManager() {
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<EmployeeLoanCreateRequest>({
    employeeId: "",
    loanAmount: 5000000,
    installmentCount: 5,
    startDate: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loansData, emps] = await Promise.all([
        payrollApi.getEmployeeLoans(),
        getEmployees(),
      ]);
      setLoans(loansData);
      setEmployees(emps || []);
      if (emps && emps.length > 0 && !form.employeeId) {
        setForm((prev) => ({ ...prev, employeeId: emps[0].id }));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load employee loans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return;
    setIsSubmitting(true);
    try {
      await payrollApi.createEmployeeLoan(form);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Loans & Cash Advances</h1>
          <p className="text-sm text-gray-500 mt-1">
            Issue company cash loans with automated monthly payroll installment deductions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Issue New Loan
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Active Loan Registry</h2>
          <span className="text-xs text-gray-500">{loans.length} loans</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading loan records...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-500">{error}</div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900">No employee loans registered</div>
            <div className="text-xs text-gray-500 mt-1">
              Click &quot;Issue New Loan&quot; to set up an installment plan.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Loan Number</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Installments</th>
                  <th className="px-6 py-3">Monthly Cut</th>
                  <th className="px-6 py-3">Remaining Balance</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{l.loanNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {l.employeeName}
                      <span className="block text-xs text-gray-400">{l.employeeNumber}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(l.loanAmount)}</td>
                    <td className="px-6 py-4">{l.installmentCount} months</td>
                    <td className="px-6 py-4 text-rose-600 font-medium">{formatCurrency(l.monthlyInstallment)}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(l.remainingBalance)}</td>
                    <td className="px-6 py-4">{l.startDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : l.status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Issue Employee Loan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  required
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Loan Amount (IDR)</label>
                <input
                  type="number"
                  value={form.loanAmount}
                  onChange={(e) => setForm({ ...form, loanAmount: Number(e.target.value) })}
                  required
                  min={100000}
                  step={50000}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Installments (Months)</label>
                  <input
                    type="number"
                    value={form.installmentCount}
                    onChange={(e) => setForm({ ...form, installmentCount: Number(e.target.value) })}
                    required
                    min={1}
                    max={36}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={form.reason || ""}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Laptop advance or emergency fund"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Issue Loan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
