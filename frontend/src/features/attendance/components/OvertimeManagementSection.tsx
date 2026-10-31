"use client";

import { useState, useEffect, useCallback } from "react";
import { OvertimeRequest } from "../types";
import { approveOvertime, createOvertimeRequest, getOvertimeRequests, rejectOvertime } from "../api";
import { getEmployees } from "@/features/employee/api";
import { AlertCircle, CheckCircle, Clock, DollarSign, Plus, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";

type EmployeeOption = {
  id: string;
  name: string;
  employeeNumber: string;
};

type Props = {
  requests?: OvertimeRequest[];
  currentEmployeeId?: string;
  employees?: EmployeeOption[];
  onRefresh?: () => void;
  isLoading?: boolean;
};

export function OvertimeManagementSection({
  requests,
  currentEmployeeId,
  employees,
  onRefresh,
  isLoading,
}: Props) {
  const [internalRequests, setInternalRequests] = useState<OvertimeRequest[]>([]);
  const [internalEmployees, setInternalEmployees] = useState<EmployeeOption[]>([]);
  const [internalEmpId, setInternalEmpId] = useState<string>("");
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = requests !== undefined;

  const loadData = useCallback(async () => {
    if (isControlled) return;
    setInternalLoading(true);
    try {
      const [reqData, empData] = await Promise.all([
        getOvertimeRequests(),
        getEmployees().catch(() => []),
      ]);
      setInternalRequests(reqData);
      const mapped = (empData ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName || ""}`.trim(),
        employeeNumber: e.employeeNumber,
      }));
      setInternalEmployees(mapped);
      if (mapped.length > 0 && !internalEmpId) {
        setInternalEmpId(mapped[0].id);
      }
    } catch {
      console.error("Failed to load overtime data");
    } finally {
      setInternalLoading(false);
    }
  }, [isControlled, internalEmpId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeRequests = requests ?? internalRequests;
  const activeEmployees = employees ?? internalEmployees;
  const activeEmpId = currentEmployeeId || internalEmpId;
  const activeLoading = isLoading ?? internalLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overtimeDate, setOvertimeDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("21:00");
  const [reason, setReason] = useState("");
  const [compensationType, setCompensationType] = useState<"PAID" | "TIME_OFF_IN_LIEU">("PAID");
  const [approverId, setApproverId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<string | null>(null);

  // Live Multiplier Preview Calculation
  const calculateEstimate = () => {
    if (!startTime || !endTime) return { raw: 0, multiplier: 0 };
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;
    if (endMins <= startMins) return { raw: 0, multiplier: 0 };

    const raw = Math.round(((endMins - startMins) / 60) * 100) / 100;
    let multiplier = 0;

    let isWeekend = false;
    if (overtimeDate) {
      const d = new Date(overtimeDate).getDay();
      isWeekend = d === 0 || d === 6; // Sunday or Saturday
    }

    if (isWeekend) {
      multiplier = raw <= 7 ? raw * 2.0 : 7 * 2.0 + (raw - 7) * 3.0;
    } else {
      multiplier = raw <= 1.0 ? raw * 1.5 : 1.0 * 1.5 + (raw - 1.0) * 2.0;
    }

    return { raw, multiplier: Math.round(multiplier * 100) / 100 };
  };

  const estimate = calculateEstimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overtimeDate || !reason.trim()) {
      setError("Please fill out all required fields.");
      return;
    }
    if (estimate.raw <= 0) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createOvertimeRequest({
        employeeId: activeEmpId,
        overtimeDate,
        startTime,
        endTime,
        reason: reason.trim(),
        compensationType,
        approverId: approverId || undefined,
      });

      setIsModalOpen(false);
      setReason("");
      if (onRefresh) onRefresh();
      else loadData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        "Failed to submit overtime request.";
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
        await approveOvertime(id, comment);
      } else {
        await rejectOvertime(id, comment);
      }
      if (onRefresh) onRefresh();
      else loadData();
    } catch {
      alert(`Failed to ${action} overtime request.`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">Overtime (OT) Management</h2>
          <p className="text-xs text-slate-500">File overtime hours with statutory tiered rate multipliers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" /> File Overtime
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Multiplier Hours</th>
                <th className="px-4 py-3 font-semibold">Compensation</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading overtime requests...</td>
                </tr>
              ) : activeRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No overtime requests filed.</td>
                </tr>
              ) : (
                activeRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900">
                      {r.overtimeDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{r.employeeName}</span>
                      <span className="ml-1 text-[11px] text-slate-400">({r.employeeNumber})</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {r.startTime} - {r.endTime} ({r.rawHours} hrs)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-extrabold text-blue-700">{r.multiplierHours} hrs</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {r.compensationType === "PAID" ? "Cash Paid" : "Time Off in Lieu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={r.reason}>
                      {r.reason}
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
                          <Clock className="h-3 w-3" /> Submitted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status === "SUBMITTED" && (
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
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">File Overtime Request</h3>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Overtime Date</label>
                <input
                  type="date"
                  value={overtimeDate}
                  onChange={(e) => setOvertimeDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Multiplier live preview card */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Calculated Raw Hours:</span>
                  <span className="font-bold text-slate-800">{estimate.raw} hrs</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-blue-900 font-semibold">Statutory Multiplier Rate:</span>
                  <span className="font-extrabold text-blue-700 text-sm">{estimate.multiplier} hrs</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 italic">
                  *Statutory formula: 1.5x for 1st hour, 2.0x for subsequent hours (2.0x-3.0x on rest days/holidays)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compensation Type</label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value as "PAID" | "TIME_OFF_IN_LIEU")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="PAID">Paid Cash (Included in Payroll)</option>
                  <option value="TIME_OFF_IN_LIEU">Time Off in Lieu (Compensatory Leave)</option>
                </select>
              </div>

              {activeEmployees.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approving Supervisor</label>
                  <select
                    value={approverId}
                    onChange={(e) => setApproverId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="">Default Supervisor</option>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task / Purpose</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Critical release testing, production support..."
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
                  {isSubmitting ? "Submitting..." : "Submit Overtime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
