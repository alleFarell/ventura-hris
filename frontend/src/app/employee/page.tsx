"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/store";
import { getCompanies, CompanyResponse } from "@/features/setup/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { getEmployees, deleteEmployee } from "@/features/employee/api";
import { EmployeeTable } from "@/features/employee/components/EmployeeTable";
import { EmployeeCreateDialog } from "@/features/employee/components/EmployeeCreateDialog";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import {
  Building2,
  Users,
  UserPlus,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function EmployeePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeSummaryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load companies
  useEffect(() => {
    if (!isAuthenticated) return;
    getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load companies", err);
      });
  }, [isAuthenticated, selectedCompanyId]);

  // Load employees for selected company
  const loadEmployees = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getEmployees({ companyId: selectedCompanyId });
      setEmployees(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
    }
  }, [selectedCompanyId]);

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-blue-50 p-4 text-blue-600">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Authentication Required</h2>
          <p className="mt-1 text-xs text-slate-500">
            Please log in to access the employee registry and master records.
          </p>
          <Link
            href="/login"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Go to Login
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleOpenDelete = (emp: EmployeeSummaryResponse) => {
    setEmployeeToDelete(emp);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteEmployee(employeeToDelete.id);
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete employee record."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                SPRINT 03
              </span>
              <span className="text-xs text-slate-500">Employee Master & Profiles</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Employee Directory</h1>
            <p className="text-xs text-slate-500">
              Company-wide employee records, organizational assignments, contracts, and lifecycle statuses.
            </p>
          </div>

          {/* Action & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Company Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {companies.length === 0 ? (
                  <option value="">No companies found</option>
                ) : (
                  companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={loadEmployees}
              disabled={loading || !selectedCompanyId}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Add Employee Button */}
            <button
              onClick={() => setShowCreateDialog(true)}
              disabled={companies.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Directory Content */}
        {!selectedCompanyId ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Please configure a company first in the{" "}
            <Link href="/setup" className="font-semibold text-blue-600 underline">
              Setup module
            </Link>
            .
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            loading={loading}
            onDelete={handleOpenDelete}
          />
        )}

        {/* Create Employee Dialog */}
        {showCreateDialog && (
          <EmployeeCreateDialog
            companies={companies}
            defaultCompanyId={selectedCompanyId}
            onClose={() => setShowCreateDialog(false)}
            onSuccess={() => {
              loadEmployees();
            }}
          />
        )}

        {/* Standardized Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Employee Record"
          itemName={employeeToDelete?.fullName}
          error={deleteError}
          loading={deleting}
        />
      </div>
    </AppShell>
  );
}
