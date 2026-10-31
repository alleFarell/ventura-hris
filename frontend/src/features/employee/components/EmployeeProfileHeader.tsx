"use client";

import { useState } from "react";
import Link from "next/link";
import { EmployeeSummaryResponse, EmploymentStatus, ChangeStatusPayload } from "../types";
import { changeEmployeeStatus } from "../api";
import {
  Building2,
  Briefcase,
  Calendar,
  ChevronLeft,
  Mail,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

type EmployeeProfileHeaderProps = {
  employee: EmployeeSummaryResponse;
  onRefresh: () => void;
};

export function EmployeeProfileHeader({
  employee,
  onRefresh,
}: EmployeeProfileHeaderProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>("ACTIVE");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PROBATION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANDIDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SUSPENDED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "TERMINATED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleChangeStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: ChangeStatusPayload = {
        newStatus,
        effectiveDate,
        reason: reason.trim() || undefined,
      };

      await changeEmployeeStatus(employee.id, payload);
      setShowStatusModal(false);
      setReason("");
      onRefresh();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to change employment status"
      );
    } finally {
      setLoading(false);
    }
  };

  const isTerminated = employee.employmentStatus === "TERMINATED";

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <Link
          href="/employee"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Employee Directory
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white text-xl shadow-md shadow-blue-500/20">
              {getInitials(employee.fullName)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">
                  {employee.fullName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(
                    employee.employmentStatus
                  )}`}
                >
                  {employee.employmentStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="text-slate-700 font-semibold">
                  {employee.employeeNumber}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {employee.positionName || "Unassigned Position"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {employee.departmentName
                    ? `${employee.departmentName} (${employee.branchName})`
                    : employee.branchName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                {employee.workEmail && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {employee.workEmail}
                  </span>
                )}
                {employee.hireDate && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Hired on {employee.hireDate}
                  </span>
                )}
                {employee.terminationDate && (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    Terminated on {employee.terminationDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setError(null);
                setShowStatusModal(true);
              }}
              disabled={isTerminated}
              title={
                isTerminated
                  ? "Terminated employees cannot change status"
                  : "Change employment status"
              }
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition ${
                isTerminated
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Change Status
            </button>
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Change Employment Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Current status: <strong>{employee.employmentStatus}</strong>
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleChangeStatus} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Status *
                </label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as EmploymentStatus)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold focus:border-blue-500 focus:outline-none"
                >
                  <option value="CANDIDATE">CANDIDATE</option>
                  <option value="PROBATION">PROBATION</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
                {newStatus === "ACTIVE" && (
                  <p className="mt-1 text-[11px] text-amber-600">
                    Note: To activate, employee must have a valid Branch, Department, Position, and Hire Date.
                  </p>
                )}
                {newStatus === "TERMINATED" && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    Warning: Once terminated, status transitions are final and cannot be reverted.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Transition
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Completed probation period with satisfactory review"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Apply Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
