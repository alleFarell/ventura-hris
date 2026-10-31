"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/store";
import { getCompanies, CompanyResponse } from "@/features/setup/api";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import {
  Users,
  Building2,
  Calendar,
  Banknote,
  UserCheck,
  Target,
  GraduationCap,
  Laptop,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  FileCheck2,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);

    getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          return getEmployees({ companyId: data[0].id });
        }
        return [];
      })
      .then((empData) => {
        if (empData) setEmployees(empData);
      })
      .catch((err) => {
        console.error("Dashboard initial load failed", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  const activeEmployees = employees.filter((e) => e.employmentStatus === "ACTIVE");

  const employeeColumns: Column<EmployeeSummaryResponse>[] = [
    {
      key: "fullName",
      header: "Employee",
      sortable: true,
      render: (emp) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {emp.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/employee/${emp.id}`}
              className="font-bold text-slate-900 hover:text-blue-600 transition"
            >
              {emp.fullName}
            </Link>
            <p className="text-[11px] text-slate-500">{emp.employeeNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: "positionName",
      header: "Role & Department",
      render: (emp) => (
        <div>
          <p className="font-semibold text-slate-800">{emp.positionName || "No Position"}</p>
          <p className="text-[11px] text-slate-500">
            {emp.departmentName ? `${emp.departmentName} - ` : ""}
            {emp.branchName || "Main Office"}
          </p>
        </div>
      ),
    },
    {
      key: "workEmail",
      header: "Work Email",
      render: (emp) => <span className="text-slate-600">{emp.workEmail || "-"}</span>,
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
        <Link
          href={`/employee/${emp.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Record
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                <Sparkles className="h-3 w-3" />
                Workforce Command Center
              </span>
              <span className="text-xs text-slate-400">Enterprise Edition</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.fullName || "HR Administrator"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live organizational metrics, workforce attendance, compensation cycles, and personnel operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/attendance/punch"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              Clock In / Out
            </Link>
            <Link
              href="/employee"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-2xs transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Employee
            </Link>
          </div>
        </div>

        {/* Live KPI Metric Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Personnel"
            value={employees.length}
            subtext={`${activeEmployees.length} active status`}
            icon={Users}
            badge={{ text: "+100% verified", variant: "positive" }}
          />
          <StatCard
            label="Registered Units"
            value={companies.length}
            subtext="Parent corporate entities"
            icon={Building2}
            badge={{ text: "Configured", variant: "neutral" }}
          />
          <StatCard
            label="Time & Attendance"
            value="Active"
            subtext="Automated shift integration"
            icon={Calendar}
            badge={{ text: "Live", variant: "positive" }}
          />
          <StatCard
            label="Payroll Engine"
            value="PPh 21 TER"
            subtext="Indonesian tax & BPJS ready"
            icon={Banknote}
            badge={{ text: "Ready", variant: "positive" }}
          />
        </div>

        {/* Quick Operations Strip */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Talent Acquisition ATS</h3>
                <p className="text-xs text-slate-500">Pipeline candidates and interviews</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-500">Job Requisitions</span>
              <Link
                href="/recruitment/requisitions"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Open ATS <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Goals & Performance</h3>
                <p className="text-xs text-slate-500">Cycles, OKRs, and 360 reviews</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-500">Review Cycles</span>
              <Link
                href="/performance/cycles"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Manage Goals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Asset & Offboarding</h3>
                <p className="text-xs text-slate-500">Equipment allocations & exit checks</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-500">Asset Register</span>
              <Link
                href="/assets"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                View Assets <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Employee Directory Table View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Employee Directory</h2>
              <p className="text-xs text-slate-500">
                Primary roster overview across branches and organizational departments.
              </p>
            </div>
            <Link
              href="/employee"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Full Directory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <DataTable
            columns={employeeColumns}
            data={employees}
            loading={loading}
            searchPlaceholder="Filter employees by name, role, or ID..."
            searchFilter={(emp, q) =>
              Boolean(
                emp.fullName.toLowerCase().includes(q) ||
                emp.employeeNumber.toLowerCase().includes(q) ||
                (emp.positionName && emp.positionName.toLowerCase().includes(q))
              )
            }
            emptyTitle="No employee records"
            emptyDescription="Add employees to begin tracking attendance, payroll, and performance."
            emptyAction={
              <Link
                href="/employee"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Employee
              </Link>
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
