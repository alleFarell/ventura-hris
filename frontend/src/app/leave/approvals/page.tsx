"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { LeaveApprovalInbox } from "@/features/leave/components/LeaveApprovalInbox";
import { getApprovalInbox } from "@/features/leave/api";
import { LeaveApproval } from "@/features/leave/types";
import { getEmployees } from "@/features/employee/api";
import { Calendar, CheckSquare, Umbrella } from "lucide-react";

export default function LeaveApprovalsPage() {
  const [approvals, setApprovals] = useState<LeaveApproval[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; employeeNumber: string }[]>([]);
  const [selectedApproverId, setSelectedApproverId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadApprovers = useCallback(async () => {
    setIsLoading(true);
    try {
      const empRes = await getEmployees().catch(() => []);
      const list = (empRes ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName || ""}`.trim(),
        employeeNumber: e.employeeNumber,
      }));
      setEmployees(list);

      const defaultApprover = list[0]?.id || "";
      setSelectedApproverId(defaultApprover);

      if (defaultApprover) {
        const inbox = await getApprovalInbox(defaultApprover);
        setApprovals(inbox);
      }
    } catch {
      console.error("Failed to load approver inbox");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInbox = useCallback(async (approverId: string) => {
    if (!approverId) return;
    try {
      const inbox = await getApprovalInbox(approverId);
      setApprovals(inbox);
    } catch {
      console.error("Failed to refresh approval inbox");
    }
  }, []);

  useEffect(() => {
    loadApprovers();
  }, [loadApprovers]);

  const handleApproverChange = (id: string) => {
    setSelectedApproverId(id);
    refreshInbox(id);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ModuleNav
          module="leave"
          actions={
            employees.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Reviewing As:</span>
                <select
                  value={selectedApproverId}
                  onChange={(e) => handleApproverChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>
            ) : undefined
          }
        />

        <LeaveApprovalInbox
          approvals={approvals}
          onRefresh={() => refreshInbox(selectedApproverId)}
          isLoading={isLoading}
        />
      </div>
    </AppShell>
  );
}
