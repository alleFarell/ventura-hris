"use client";

import { LeaveRequest } from "../types";
import { Calendar, User, Umbrella } from "lucide-react";

type Props = {
  leaves: LeaveRequest[];
  isLoading?: boolean;
};

export function LeaveCalendarSection({ leaves, isLoading }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Leave Calendar</h3>
            <p className="text-xs text-slate-500">Upcoming approved team leaves and scheduled time-off</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {leaves.length} Scheduled
        </span>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading schedule...</div>
        ) : leaves.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No scheduled team leaves in the current window.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/20"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Umbrella className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-bold text-slate-900">{leave.employeeName}</p>
                    <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                      {leave.leaveTypeCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {leave.startDate} → {leave.endDate} ({leave.totalDays}d)
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-600 italic">&quot;{leave.reason}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
