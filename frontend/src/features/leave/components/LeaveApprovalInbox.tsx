"use client";

import { useState } from "react";
import { LeaveApproval } from "../types";
import { approveLeave, rejectLeave } from "../api";
import { CheckCircle2, Clock, MessageSquare, ThumbsDown, ThumbsUp, User } from "lucide-react";

type Props = {
  approvals: LeaveApproval[];
  onRefresh: () => void;
  isLoading?: boolean;
};

export function LeaveApprovalInbox({ approvals, onRefresh, isLoading }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [comments, setComments] = useState("");

  const filtered = approvals.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  const handleAction = async () => {
    if (!commentModal) return;
    const { id, action } = commentModal;
    setActioningId(id);

    try {
      if (action === "approve") {
        await approveLeave(id, comments.trim() || undefined);
      } else {
        await rejectLeave(id, comments.trim() || undefined);
      }
      setCommentModal(null);
      setComments("");
      onRefresh();
    } catch {
      alert(`Failed to ${action} leave request.`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Manager Approval Inbox</h3>
          <p className="text-xs text-slate-500">Review and action time-off requests assigned to you</p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 text-xs">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
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

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading inbox items...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No requests pending review.</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-slate-50/50">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Request #{item.leaveRequestId.substring(0, 8)}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      Step {item.stepOrder} • {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Approver: <span className="font-semibold">{item.approverName}</span> ({item.approverNumber})
                  </p>
                  {item.comments && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 italic">
                      <MessageSquare className="h-3 w-3" /> &quot;{item.comments}&quot;
                    </p>
                  )}
                  {item.actionedAt && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Actioned at: {new Date(item.actionedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              {item.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCommentModal({ id: item.id, action: "approve" })}
                    disabled={actioningId === item.id}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setCommentModal({ id: item.id, action: "reject" })}
                    disabled={actioningId === item.id}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 capitalize">
              {commentModal.action} Leave Request
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Add optional comments or decision notes for the employee
            </p>

            <div className="mt-3">
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Approved, please hand over shift tasks beforehand..."
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setCommentModal(null);
                  setComments("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actioningId !== null}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs ${
                  commentModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                } disabled:opacity-50`}
              >
                Confirm {commentModal.action === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
