"use client";

import { useEffect, useState } from "react";
import { EmployeePayload, EmploymentStatus } from "../types";
import { createEmployee } from "../api";
import { CompanyResponse, BranchResponse, getBranches } from "@/features/setup/api";
import { DepartmentResponse, GradeResponse, JobLevelResponse, PositionResponse } from "@/features/organization/types";
import { getDepartments, getGrades, getJobLevels, getPositions } from "@/features/organization/api";
import { AlertCircle, Loader2, UserPlus, X } from "lucide-react";

type EmployeeCreateDialogProps = {
  companies: CompanyResponse[];
  defaultCompanyId?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function EmployeeCreateDialog({
  companies,
  defaultCompanyId,
  onClose,
  onSuccess,
}: EmployeeCreateDialogProps) {
  const [companyId, setCompanyId] = useState(defaultCompanyId || (companies[0]?.id ?? ""));
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [branchId, setBranchId] = useState("");

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [departmentId, setDepartmentId] = useState("");

  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [positionId, setPositionId] = useState("");

  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [gradeId, setGradeId] = useState("");

  const [jobLevels, setJobLevels] = useState<JobLevelResponse[]>([]);
  const [jobLevelId, setJobLevelId] = useState("");

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [status, setStatus] = useState<EmploymentStatus>("CANDIDATE");
  const [hireDate, setHireDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    setLoadingLookups(true);
    Promise.all([
      getBranches(companyId),
      getDepartments(companyId),
      getPositions(companyId),
      getGrades(companyId),
      getJobLevels(companyId),
    ])
      .then(([bList, dList, pList, gList, lList]) => {
        setBranches(bList);
        if (bList.length > 0) setBranchId(bList[0].id);
        setDepartments(dList);
        setPositions(pList);
        setGrades(gList);
        setJobLevels(lList);
      })
      .catch((err) => {
        console.error("Failed to load organization lookups", err);
      })
      .finally(() => setLoadingLookups(false));
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: EmployeePayload = {
        companyId,
        branchId,
        departmentId: departmentId || undefined,
        positionId: positionId || undefined,
        gradeId: gradeId || undefined,
        jobLevelId: jobLevelId || undefined,
        employeeNumber: employeeNumber.trim().toUpperCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        workEmail: workEmail.trim() || undefined,
        employmentStatus: status,
        hireDate: hireDate || undefined,
      };

      await createEmployee(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
              <p className="text-xs text-slate-500">Create employee master record and assignments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Company & Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company *</label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch *</label>
              <select
                required
                disabled={loadingLookups || branches.length === 0}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
              >
                {branches.length === 0 ? (
                  <option value="">No branches configured</option>
                ) : (
                  branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Identity & Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. EMP-001"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Work Email & Hire Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                placeholder="john.doe@company.com"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hire Date</label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Organization Assignments */}
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Organizational Placement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">(Unassigned)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Position</label>
                <select
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">(Unassigned)</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Salary Grade</label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">(Unassigned)</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Grade {g.sortOrder})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Level</label>
                <select
                  value={jobLevelId}
                  onChange={(e) => setJobLevelId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">(Unassigned)</option>
                  {jobLevels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Level {l.sortOrder})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none font-semibold"
                >
                  <option value="CANDIDATE">CANDIDATE</option>
                  <option value="PROBATION">PROBATION</option>
                  <option value="ACTIVE">ACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
