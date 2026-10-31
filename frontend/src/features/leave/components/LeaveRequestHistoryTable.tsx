"use client";

import { useState } from "react";
import { LeaveRequest } from "../types";
import { cancelLeaveRequest } from "../api";
import { AlertCircle, Calendar, CheckCircle, Clock, ExternalLink, XCircle } from "lucide-react";

type Props = {
  requests: LeaveRequest[];
  onRefresh: () => void;
  isLoading?: boolean;
};

export function LeaveRequestHistoryTable({ requests, onRefresh, isLoading }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const filtered = requests.filter((r) => {
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave request? This will restore your allocated quota.")) {
      return;
    }
    setIsCancelling(id);
    try {
      await cancelLeaveRequest(id);
      onRefresh();
    } catch {
      alert("Failed to cancel leave request.");
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave Applications History</h3>
          <p className="text-xs text-slate-500">Review status and approval progression of your requests</p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 text-xs">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                filterStatus === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Leave Type</th>
              <th className="px-4 py-3 font-semibold">Period</th>
              <th className="px-4 py-3 font-semibold">Days</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Attachment</th>
              <th className="px-4 py-3 font-semibold">Approvals</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading requests...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No leave requests found for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <span className="font-semibold">{req.leaveTypeName}</span>
                    <span className="ml-1 text-[10px] text-slate-400">({req.leaveTypeCode})</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {req.startDate} → {req.endDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                    {req.totalDays} working {req.totalDays === 1 ? "day" : "days"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {req.attachmentUrl ? (
                      <a
                        href={req.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View Doc <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {req.approvals && req.approvals.length > 0 ? (
                      <div className="space-y-1">
                        {req.approvals.map((app) => (
                          <div key={app.id} className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-slate-600 font-medium">{app.approverName}:</span>
                            <span
                              className={`font-semibold ${
                                app.status === "APPROVED"
                                  ? "text-emerald-600"
                                  : app.status === "REJECTED"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {app.status}
                            </span>
                            {app.comments && (
                              <span className="text-slate-400 text-[10px] italic">({app.comments})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">No chain</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {(req.status === "PENDING" || req.status === "APPROVED") && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={isCancelling === req.id}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {isCancelling === req.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
