"use client";

import { useState, useEffect, useCallback } from "react";
import { WfhRequest } from "../types";
import { approveWfh, createWfhRequest, getWfhRequests, rejectWfh } from "../api";
import { getEmployees } from "@/features/employee/api";
import { AlertCircle, CheckCircle, Clock, Home, Plus, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";

type EmployeeOption = {
  id: string;
  name: string;
  employeeNumber: string;
};

type Props = {
  requests?: WfhRequest[];
  currentEmployeeId?: string;
  employees?: EmployeeOption[];
  onRefresh?: () => void;
  isLoading?: boolean;
};

export function WfhManagementSection({
  requests,
  currentEmployeeId,
  employees,
  onRefresh,
  isLoading,
}: Props) {
  const [internalRequests, setInternalRequests] = useState<WfhRequest[]>([]);
  const [internalEmployees, setInternalEmployees] = useState<EmployeeOption[]>([]);
  const [internalEmpId, setInternalEmpId] = useState<string>("");
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = requests !== undefined;

  const loadData = useCallback(async () => {
    if (isControlled) return;
    setInternalLoading(true);
    try {
      const empData = await getEmployees().catch(() => []);
      const mapped = (empData ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName || ""}`.trim(),
        employeeNumber: e.employeeNumber,
      }));
      setInternalEmployees(mapped);
      const targetEmpId = currentEmployeeId || internalEmpId || mapped[0]?.id || "";
      if (mapped.length > 0 && !internalEmpId) {
        setInternalEmpId(mapped[0].id);
      }
      if (targetEmpId) {
        const reqData = await getWfhRequests(targetEmpId).catch(() => []);
        setInternalRequests(reqData);
      }
    } catch {
      console.error("Failed to load WFH data");
    } finally {
      setInternalLoading(false);
    }
  }, [isControlled, currentEmployeeId, internalEmpId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeRequests = requests ?? internalRequests;
  const activeEmployees = employees ?? internalEmployees;
  const activeEmpId = currentEmployeeId || internalEmpId;
  const activeLoading = isLoading ?? internalLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [reason, setReason] = useState("");
  const [approverId, setApproverId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDate || !reason.trim()) {
      setError("Please provide both date and reason.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createWfhRequest({
        employeeId: activeEmpId,
        requestDate,
        reason: reason.trim(),
        approverId: approverId || undefined,
      });

      setIsModalOpen(false);
      setRequestDate("");
      setReason("");
      if (onRefresh) onRefresh();
      else loadData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        "Failed to submit WFH request.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const comment = prompt(`Add optional comment to ${action}:`) ?? undefined;
    setActioningId(id);
    try {
      if (action === "approve") {
        await approveWfh(id, comment);
      } else {
        await rejectWfh(id, comment);
      }
      if (onRefresh) onRefresh();
      else loadData();
    } catch {
      alert(`Failed to ${action} WFH request.`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">Work-From-Home (WFH) Requests</h2>
          <p className="text-xs text-slate-500">Submit and verify remote work authorization to bypass geofence checks</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" /> Request WFH
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Approver / Comment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading WFH requests...</td>
                </tr>
              ) : activeRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No WFH requests recorded.</td>
                </tr>
              ) : (
                activeRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900">
                      {r.requestDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{r.employeeName}</span>
                      <span className="ml-1 text-[11px] text-slate-400">({r.employeeNumber})</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {r.approverName ? (
                        <div>
                          <p className="font-medium text-slate-800">{r.approverName}</p>
                          {r.managerComment && (
                            <p className="text-[10px] italic text-slate-400">&quot;{r.managerComment}&quot;</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      ) : r.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(r.id, "approve")}
                            disabled={actioningId === r.id}
                            className="rounded p-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            title="Approve"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(r.id, "reject")}
                            disabled={actioningId === r.id}
                            className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Reject"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Home className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Request Work-From-Home</h3>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WFH Date</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {activeEmployees.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approving Supervisor</label>
                  <select
                    value={approverId}
                    onChange={(e) => setApproverId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="">Default Manager</option>
                    {activeEmployees
                      .filter((e) => e.id !== activeEmpId)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.employeeNumber})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Remote sprint focus, inclement weather, home repairs..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
