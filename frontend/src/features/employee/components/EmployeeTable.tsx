"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EmployeeSummaryResponse } from "../types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Building2,
  Briefcase,
  ChevronRight,
  Mail,
  Calendar,
  Filter,
  Trash2,
} from "lucide-react";

type EmployeeTableProps = {
  employees: EmployeeSummaryResponse[];
  loading?: boolean;
  onDelete?: (employee: EmployeeSummaryResponse) => void;
};

export function EmployeeTable({ employees, loading, onDelete }: EmployeeTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Pre-filter by status & department dropdowns, search is handled by DataTable
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchStatus =
        statusFilter === "ALL" || emp.employmentStatus === statusFilter;
      const matchDept =
        departmentFilter === "ALL" || emp.departmentName === departmentFilter;
      return matchStatus && matchDept;
    });
  }, [employees, statusFilter, departmentFilter]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const columns: Column<EmployeeSummaryResponse>[] = [
    {
      key: "fullName",
      header: "Employee",
      sortable: true,
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs shadow-2xs">
            {getInitials(emp.fullName)}
          </div>
          <div>
            <Link
              href={`/employee/${emp.id}`}
              className="font-bold text-slate-900 hover:text-blue-600 hover:underline block"
            >
              {emp.fullName}
            </Link>
            <span className="font-mono text-[11px] text-slate-500">
              {emp.employeeNumber}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "positionName",
      header: "Role & Department",
      sortable: true,
      render: (emp) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{emp.positionName || "Unassigned Position"}</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
            <span>
              {emp.departmentName ? `${emp.departmentName} - ` : ""}
              {emp.branchName || "Main Office"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "workEmail",
      header: "Work Email",
      render: (emp) => (
        emp.workEmail ? (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{emp.workEmail}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Not set</span>
        )
      ),
    },
    {
      key: "hireDate",
      header: "Hire Date",
      sortable: true,
      render: (emp) => (
        emp.hireDate ? (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{emp.hireDate}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Pending</span>
        )
      ),
    },
    {
      key: "employmentStatus",
      header: "Status",
      sortable: true,
      render: (emp) => <StatusBadge status={emp.employmentStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (emp) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/employee/${emp.id}`}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            Profile
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(emp)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Delete employee"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredEmployees}
      loading={loading}
      searchPlaceholder="Search by name, employee ID, role, or email..."
      searchFilter={(emp, q) =>
        Boolean(
          emp.fullName.toLowerCase().includes(q) ||
          emp.employeeNumber.toLowerCase().includes(q) ||
          (emp.workEmail && emp.workEmail.toLowerCase().includes(q)) ||
          (emp.positionName && emp.positionName.toLowerCase().includes(q))
        )
      }
      filters={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}
        </div>
      }
      emptyTitle="No employees found"
      emptyDescription="Try adjusting your search query or filters to find personnel records."
    />
  );
}
