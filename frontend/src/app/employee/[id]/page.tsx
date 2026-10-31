"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/store";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { getEmployee } from "@/features/employee/api";
import { EmployeeProfileHeader } from "@/features/employee/components/EmployeeProfileHeader";
import { PersonalInformationSection } from "@/features/employee/components/PersonalInformationSection";
import { EmploymentSection } from "@/features/employee/components/EmploymentSection";
import { EmergencyContactsSection } from "@/features/employee/components/EmergencyContactsSection";
import { DocumentsSection } from "@/features/employee/components/DocumentsSection";
import {
  User,
  Briefcase,
  HeartHandshake,
  FileText,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [employee, setEmployee] = useState<EmployeeSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "personal" | "employment" | "emergency" | "documents"
  >("personal");

  const loadEmployee = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getEmployee(id);
      setEmployee(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load employee details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      loadEmployee();
    }
  }, [isAuthenticated, id]);

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
            Please log in to view employee profile and records.
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

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error || !employee ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
            <h3 className="font-bold text-red-900 text-sm">Employee Not Found</h3>
            <p className="text-xs text-red-700">{error || "Could not retrieve employee record."}</p>
            <Link
              href="/employee"
              className="inline-block rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
            >
              Return to Directory
            </Link>
          </div>
        ) : (
          <>
            {/* Header & Status Control */}
            <EmployeeProfileHeader
              employee={employee}
              onRefresh={loadEmployee}
            />

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
                  activeTab === "personal"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Personal Information
              </button>

              <button
                onClick={() => setActiveTab("employment")}
                className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
                  activeTab === "employment"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Employment & Contracts
              </button>

              <button
                onClick={() => setActiveTab("emergency")}
                className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
                  activeTab === "emergency"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                Emergency Contacts
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
                  activeTab === "documents"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Documents & Compliance
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === "personal" && (
                <PersonalInformationSection employeeId={employee.id} />
              )}

              {activeTab === "employment" && (
                <EmploymentSection
                  employee={employee}
                  onRefreshEmployee={loadEmployee}
                />
              )}

              {activeTab === "emergency" && (
                <EmergencyContactsSection employeeId={employee.id} />
              )}

              {activeTab === "documents" && (
                <DocumentsSection employeeId={employee.id} />
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
