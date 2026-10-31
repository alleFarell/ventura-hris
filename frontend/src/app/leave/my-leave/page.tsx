"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { MyLeaveBalancesCard } from "@/features/leave/components/MyLeaveBalancesCard";
import { LeaveApplicationModal } from "@/features/leave/components/LeaveApplicationModal";
import { LeaveRequestHistoryTable } from "@/features/leave/components/LeaveRequestHistoryTable";
import { getEmployeeLeaveBalances, getLeaveRequests, getLeaveTypes } from "@/features/leave/api";
import { LeaveBalance, LeaveRequest, LeaveType } from "@/features/leave/types";
import { getEmployees } from "@/features/employee/api";
import { Calendar, CheckSquare, Umbrella } from "lucide-react";

export default function MyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; employeeNumber: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [typesRes, empRes] = await Promise.all([
        getLeaveTypes(),
        getEmployees().catch(() => []),
      ]);

      setLeaveTypes(typesRes);
      const empList = (empRes ?? []).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName || ""}`.trim(),
        employeeNumber: e.employeeNumber,
      }));
      setEmployees(empList);

      const targetEmpId = empList[0]?.id || "";
      setSelectedEmployeeId(targetEmpId);

      if (targetEmpId) {
        const [balRes, reqRes] = await Promise.all([
          getEmployeeLeaveBalances(targetEmpId),
          getLeaveRequests(targetEmpId),
        ]);
        setBalances(balRes);
        setRequests(reqRes);
      }
    } catch {
      console.error("Failed to load leave dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEmployeeData = useCallback(async (empId: string) => {
    if (!empId) return;
    try {
      const [balRes, reqRes] = await Promise.all([
        getEmployeeLeaveBalances(empId),
        getLeaveRequests(empId),
      ]);
      setBalances(balRes);
      setRequests(reqRes);
    } catch {
      console.error("Failed to refresh leave data");
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    refreshEmployeeData(empId);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ModuleNav
          module="leave"
          actions={
            employees.length > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Employee:</span>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
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

        {/* Quota Balances Card */}
        <MyLeaveBalancesCard
          balances={balances}
          onRequestLeave={() => setIsModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Leave Requests Table */}
        <LeaveRequestHistoryTable
          requests={requests}
          onRefresh={() => refreshEmployeeData(selectedEmployeeId)}
          isLoading={isLoading}
        />

        {/* Request Modal */}
        <LeaveApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refreshEmployeeData(selectedEmployeeId)}
          leaveTypes={leaveTypes}
          currentEmployeeId={selectedEmployeeId}
          employees={employees}
        />
      </div>
    </AppShell>
  );
}
