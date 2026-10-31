"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/store";
import { RoleManagementSection } from "@/features/settings/components/RoleManagementSection";
import { UserManagementSection } from "@/features/settings/components/UserManagementSection";
import { AuditTrailSection } from "@/features/settings/components/AuditTrailSection";
import { NotificationTemplatesSection } from "@/features/settings/components/NotificationTemplatesSection";
import {
  Shield,
  Users,
  FileText,
  Bell,
  Settings,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "roles" | "users" | "audit" | "templates"
  >("roles");

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
            <Settings className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Authentication Required</h2>
          <p className="mt-1 text-xs text-slate-500">
            Please log in with administrative privileges to manage governance settings.
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
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              SPRINT 04
            </span>
            <span className="text-xs text-slate-500">Security & Governance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Settings & Administration</h1>
          <p className="text-xs text-slate-500">
            Configure role-based access control (RBAC), user accounts, compliance audit trail, and communication templates.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "roles"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Roles & Permissions
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            User Accounts
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            System Audit Trail
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "templates"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Notification Templates
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "roles" && <RoleManagementSection />}
          {activeTab === "users" && <UserManagementSection />}
          {activeTab === "audit" && <AuditTrailSection />}
          {activeTab === "templates" && <NotificationTemplatesSection />}
        </div>
      </div>
    </AppShell>
  );
}
