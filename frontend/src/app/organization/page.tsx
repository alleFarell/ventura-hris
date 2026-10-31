"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/store";
import { getCompanies, CompanyResponse } from "@/features/setup/api";
import {
  DepartmentResponse,
  GradeResponse,
  JobLevelResponse,
  OrganizationTreeNodeResponse,
  OrganizationUnitResponse,
  PositionResponse,
} from "@/features/organization/types";
import {
  getDepartments,
  getGrades,
  getJobLevels,
  getOrganizationTree,
  getOrganizationUnits,
  getPositions,
} from "@/features/organization/api";
import { DepartmentTable } from "@/features/organization/components/DepartmentTable";
import { PositionTable } from "@/features/organization/components/PositionTable";
import { GradeLevelSettings } from "@/features/organization/components/GradeLevelSettings";
import { OrganizationTreeView } from "@/features/organization/components/OrganizationTreeView";
import {
  Building2,
  GitFork,
  Layers,
  Loader2,
  RefreshCw,
  Briefcase,
  FolderTree,
} from "lucide-react";
import Link from "next/link";

export default function OrganizationPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"tree" | "departments" | "positions" | "grades">("tree");

  // Domain data
  const [treeData, setTreeData] = useState<OrganizationTreeNodeResponse[]>([]);
  const [allUnits, setAllUnits] = useState<OrganizationUnitResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevelResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Load organization data for selected company
  const loadOrganizationData = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);

    try {
      const [treeRes, unitsRes, deptsRes, posRes, gradesRes, levelsRes] = await Promise.all([
        getOrganizationTree(selectedCompanyId),
        getOrganizationUnits(selectedCompanyId),
        getDepartments(selectedCompanyId),
        getPositions(selectedCompanyId),
        getGrades(selectedCompanyId),
        getJobLevels(selectedCompanyId),
      ]);

      setTreeData(treeRes);
      setAllUnits(unitsRes);
      setDepartments(deptsRes);
      setPositions(posRes);
      setGrades(gradesRes);
      setJobLevels(levelsRes);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompanyId) {
      loadOrganizationData();
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
            <GitFork className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Authentication Required</h2>
          <p className="mt-1 text-xs text-slate-500">
            Please log in to manage organization structures, departments, and positions.
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                SPRINT 02
              </span>
              <span className="text-xs text-slate-500">Core HR Architecture</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Organization Management</h1>
            <p className="text-xs text-slate-500">
              Configure departments, divisions, positions, salary grades, and hierarchical reporting units.
            </p>
          </div>

          {/* Company Selector & Refresh */}
          <div className="flex items-center gap-2">
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
              onClick={loadOrganizationData}
              disabled={loading || !selectedCompanyId}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "tree"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderTree className="h-3.5 w-3.5" />
            Hierarchy Tree
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "departments"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Departments & Divisions ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "positions"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Positions ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-4 transition ${
              activeTab === "grades"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Grades & Job Levels ({grades.length + jobLevels.length})
          </button>
        </div>

        {/* Content Area */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && !selectedCompanyId && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Please select or configure a company first in the{" "}
            <Link href="/setup" className="font-semibold text-blue-600 underline">
              Setup module
            </Link>
            .
          </div>
        )}

        {!loading && selectedCompanyId && (
          <div>
            {activeTab === "tree" && (
              <OrganizationTreeView
                treeData={treeData}
                allUnits={allUnits}
                onRefresh={loadOrganizationData}
              />
            )}

            {activeTab === "departments" && (
              <DepartmentTable
                companyId={selectedCompanyId}
                departments={departments}
                allUnits={allUnits}
                onRefresh={loadOrganizationData}
              />
            )}

            {activeTab === "positions" && (
              <PositionTable
                companyId={selectedCompanyId}
                positions={positions}
                departments={departments}
                grades={grades}
                jobLevels={jobLevels}
                allUnits={allUnits}
                onRefresh={loadOrganizationData}
              />
            )}

            {activeTab === "grades" && (
              <GradeLevelSettings
                companyId={selectedCompanyId}
                grades={grades}
                jobLevels={jobLevels}
                onRefresh={loadOrganizationData}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
