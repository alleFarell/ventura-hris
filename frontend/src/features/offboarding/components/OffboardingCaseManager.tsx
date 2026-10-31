"use client";

import { useEffect, useState } from "react";
import { offboardingApi } from "../api";
import { OffboardingCase } from "../types";
import { UserMinus, Plus, RefreshCw, X, Calendar, User, FileText, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function OffboardingCaseManager() {
  const [cases, setCases] = useState<OffboardingCase[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [separationType, setSeparationType] = useState("RESIGNATION");
  const [noticeDate, setNoticeDate] = useState("");
  const [lastWorkingDate, setLastWorkingDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [caseList, empList] = await Promise.all([
        offboardingApi.getCases(undefined, filterStatus === "ALL" ? undefined : filterStatus),
        getEmployees(),
      ]);
      setCases(caseList);
      setEmployees(empList);
      if (empList.length > 0 && !employeeId) {
        setEmployeeId(empList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load offboarding cases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const resetForm = () => {
    setReason("");
    setNoticeDate("");
    setLastWorkingDate("");
    setSeparationType("RESIGNATION");
    if (employees.length > 0) {
      setEmployeeId(employees[0].id);
    }
  };

  const handleOpenModal = () => {
    setNoticeDate(new Date().toISOString().split("T")[0]);
    const lwd = new Date();
    lwd.setDate(lwd.getDate() + 30);
    setLastWorkingDate(lwd.toISOString().split("T")[0]);
    setReason("");
    setSeparationType("RESIGNATION");
    if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !noticeDate || !lastWorkingDate) return;
    setIsSubmitting(true);
    try {
      await offboardingApi.createCase({
        employeeId,
        separationType,
        noticeDate,
        lastWorkingDate,
        reason: reason || undefined,
      });
      handleCloseModal();
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create offboarding case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCase = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this offboarding case?")) return;
    try {
      await offboardingApi.cancelCase(id);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel case");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Offboarding & Clearances</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage resignations, separations, department clearances, and employment termination workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Initiate Separation
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {["ALL", "IN_CLEARANCE", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === st
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading cases...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : cases.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <UserMinus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No offboarding cases found</p>
          <p className="text-gray-400 text-sm mt-1">Initiate a separation request to launch clearance workflows.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Type & Reason</th>
                  <th className="px-6 py-3.5">Notice & Last Working Date</th>
                  <th className="px-6 py-3.5">Clearance Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((c) => {
                  const percent = c.totalItemsCount > 0 ? Math.round((c.clearedItemsCount / c.totalItemsCount) * 100) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="font-bold text-sm">{c.employeeName}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{c.employeeNumber}</div>
                        <div className="text-gray-500 text-[11px]">{c.departmentName} &bull; {c.positionName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-semibold">
                          {c.separationType}
                        </span>
                        <div className="text-gray-500 text-xs mt-1 max-w-xs truncate">{c.reason || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>Notice: <span className="font-medium text-gray-900">{c.noticeDate}</span></div>
                        <div>Last Day: <span className="font-bold text-indigo-700">{c.lastWorkingDate}</span></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{c.clearedItemsCount} / {c.totalItemsCount}</span>
                          <span className="text-gray-500">{percent}%</span>
                        </div>
                        <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              percent === 100 ? "bg-green-500" : percent > 50 ? "bg-blue-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : c.status === "IN_CLEARANCE"
                              ? "bg-blue-100 text-blue-800"
                              : c.status === "CANCELLED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {c.status === "IN_CLEARANCE" && (
                          <button
                            onClick={() => handleCancelCase(c.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                            title="Cancel Case"
                          >
                            <Ban className="w-4 h-4 ml-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Initiate Employee Offboarding</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Employee *</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeNumber}] {emp.firstName} {emp.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Separation Type *</label>
                <select
                  value={separationType}
                  onChange={(e) => setSeparationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="RESIGNATION">RESIGNATION (Voluntary)</option>
                  <option value="TERMINATION">TERMINATION (Involuntary)</option>
                  <option value="RETIREMENT">RETIREMENT</option>
                  <option value="CONTRACT_END">CONTRACT_END</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Date *</label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Last Working Day *</label>
                  <input
                    type="date"
                    value={lastWorkingDate}
                    onChange={(e) => setLastWorkingDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason / Statement</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Primary reasons or separation documentation..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Initiating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
