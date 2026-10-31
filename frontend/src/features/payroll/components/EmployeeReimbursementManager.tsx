"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { EmployeeReimbursement, EmployeeReimbursementCreateRequest } from "../types";
import { Plus, RefreshCw, X, Receipt, Check, Ban } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function EmployeeReimbursementManager() {
  const [claims, setClaims] = useState<EmployeeReimbursement[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<EmployeeReimbursementCreateRequest>({
    employeeId: "",
    title: "",
    claimType: "MEAL",
    amount: 250000,
    receiptUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [claimsData, emps] = await Promise.all([
        payrollApi.getEmployeeReimbursements(),
        getEmployees(),
      ]);
      setClaims(claimsData);
      setEmployees(emps || []);
      if (emps && emps.length > 0 && !form.employeeId) {
        setForm((prev) => ({ ...prev, employeeId: emps[0].id }));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load reimbursement claims");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.title) return;
    setIsSubmitting(true);
    try {
      await payrollApi.submitEmployeeReimbursement(form);
      setIsModalOpen(false);
      setForm((prev) => ({ ...prev, title: "", amount: 250000 }));
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit reimbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await payrollApi.approveEmployeeReimbursement(id);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to approve claim");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await payrollApi.rejectEmployeeReimbursement(id);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to reject claim");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Reimbursements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review business expense claims and automatically disburse them into the upcoming payroll run.
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
            Submit Claim
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Expense Claims List</h2>
          <span className="text-xs text-gray-500">{claims.length} claims</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading expense claims...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-500">{error}</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900">No expense claims submitted</div>
            <div className="text-xs text-gray-500 mt-1">
              Click &quot;Submit Claim&quot; to file a business reimbursement.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Claim #</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Title / Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{c.claimNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.employeeName}
                      <span className="block text-xs text-gray-400">{c.employeeNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 block">{c.title}</span>
                      <span className="text-xs text-gray-400 uppercase">{c.claimType}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(c.amount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "DISBURSED"
                            ? "bg-blue-100 text-blue-800"
                            : c.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {c.status === "SUBMITTED" && (
                        <>
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-medium rounded hover:bg-emerald-100 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(c.id)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-rose-50 text-rose-700 font-medium rounded hover:bg-rose-100 transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
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
              <h3 className="font-semibold text-gray-900">Submit Expense Claim</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Client Dinner or Taxi to Airport"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.claimType}
                    onChange={(e) => setForm({ ...form, claimType: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="TRAVEL">Travel</option>
                    <option value="MEAL">Meal</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount (IDR)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    required
                    min={1000}
                    step={1000}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Receipt URL (Optional)</label>
                <input
                  type="url"
                  value={form.receiptUrl || ""}
                  onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                  placeholder="https://..."
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
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
