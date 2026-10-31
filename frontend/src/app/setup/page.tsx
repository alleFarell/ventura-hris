"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, GitBranch, Settings2, Plus, ArrowRight, Globe, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { getCompanies, getBranches, CompanyResponse, BranchResponse } from "@/features/setup/api";
import { StatCard } from "@/components/ui/StatCard";
import { CompanyTable } from "@/features/setup/components/CompanyTable";

export default function SetupPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCompanies(), getBranches()])
      .then(([compData, branchData]) => {
        setCompanies(compData);
        setBranches(branchData);
      })
      .catch((err) => console.error("Setup load failed", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="setup" hideHeader />

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
              Module 01
            </span>
            <span className="text-xs text-slate-400">Foundation Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System & Foundation Setup
          </h1>
          <p className="max-w-3xl text-xs text-slate-500">
            Establish legal enterprise entities, operating branch infrastructure, and Indonesian localized defaults.
          </p>
        </div>

        {/* Setup KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Corporate Entities"
            value={companies.length}
            subtext="Parent and subsidiary legal records"
            icon={Building2}
            badge={{ text: "Configured", variant: "positive" }}
            actions={
              <Link
                href="/setup/company"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Manage Companies <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <StatCard
            label="Branch Locations"
            value={branches.length}
            subtext="Workplaces and regional offices"
            icon={GitBranch}
            badge={{ text: "Operational", variant: "positive" }}
            actions={
              <Link
                href="/setup/branches"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Manage Branches <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <StatCard
            label="Regional Defaults"
            value="IDR / WIB"
            subtext="Asia/Jakarta locale and Indonesian Rupiah"
            icon={Globe}
            badge={{ text: "Active", variant: "neutral" }}
            actions={
              <Link
                href="/setup/company"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                View Defaults <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
        </div>

        {/* Company Master Table Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Companies</h2>
              <p className="text-xs text-slate-500">
                Primary corporate organizations used across payroll and employment contracts.
              </p>
            </div>
            <Link
              href="/setup/company"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-2xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Company
            </Link>
          </div>

          <CompanyTable
            companies={companies}
            loading={loading}
          />
        </div>
      </section>
    </AppShell>
  );
}
