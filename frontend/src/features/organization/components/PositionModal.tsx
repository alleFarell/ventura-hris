"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  DepartmentResponse,
  DivisionResponse,
  GradeResponse,
  JobLevelResponse,
  OrganizationUnitResponse,
  PositionPayload,
  PositionResponse,
} from "../types";
import { createPosition, updatePosition, getDivisions } from "../api";
import { Briefcase, AlertCircle } from "lucide-react";

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  position?: PositionResponse | null;
  departments: DepartmentResponse[];
  grades: GradeResponse[];
  jobLevels: JobLevelResponse[];
  allUnits: OrganizationUnitResponse[];
}

export function PositionModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  position,
  departments,
  grades,
  jobLevels,
  allUnits,
}: PositionModalProps) {
  const isEditing = Boolean(position);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [jobLevelId, setJobLevelId] = useState("");
  const [parentUnitId, setParentUnitId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [divisions, setDivisions] = useState<DivisionResponse[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load divisions when department changes
  const loadDivisions = async (deptId: string) => {
    if (!deptId) {
      setDivisions([]);
      return;
    }
    setLoadingDivisions(true);
    try {
      const divs = await getDivisions(companyId, deptId);
      setDivisions(divs);
    } catch (err) {
      console.error("Failed to load divisions", err);
    } finally {
      setLoadingDivisions(false);
    }
  };

  useEffect(() => {
    if (position) {
      setCode(position.code);
      setName(position.name);
      setDepartmentId(position.departmentId || "");
      setDivisionId(position.divisionId || "");
      setGradeId(position.gradeId || "");
      setJobLevelId(position.jobLevelId || "");
      setParentUnitId("");
      setStatus(position.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");

      if (position.departmentId) {
        loadDivisions(position.departmentId);
      } else {
        setDivisions([]);
      }
    } else {
      setCode("");
      setName("");
      setDepartmentId("");
      setDivisionId("");
      setGradeId("");
      setJobLevelId("");
      setParentUnitId("");
      setStatus("ACTIVE");
      setDivisions([]);
    }
    setError(null);
  }, [position, isOpen]);

  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setDivisionId("");
    loadDivisions(newDeptId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && position) {
        await updatePosition(position.id, {
          name: name.trim(),
          departmentId: departmentId || undefined,
          divisionId: divisionId || undefined,
          gradeId: gradeId || undefined,
          jobLevelId: jobLevelId || undefined,
          status,
        });
      } else {
        const payload: PositionPayload = {
          companyId,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          departmentId: departmentId || undefined,
          divisionId: divisionId || undefined,
          gradeId: gradeId || undefined,
          jobLevelId: jobLevelId || undefined,
          parentUnitId: parentUnitId || undefined,
        };
        await createPosition(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} position.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Position Role" : "Create Position Role"}
      subtitle={
        isEditing
          ? `Modify organizational mapping for ${position?.code}`
          : "Define job position, compensation grade, job level, and reporting line"
      }
      icon={<Briefcase className="h-5 w-5 text-blue-600" />}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Position Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Position Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. POS-ENG-001"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
            {isEditing && (
              <p className="mt-1 text-[11px] text-slate-400">Position code cannot be changed once established.</p>
            )}
          </div>

          {/* Position Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Position Title / Role <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Department & Division */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Assignment
            </label>
            <select
              value={departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="">None (Cross-departmental)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Division (Optional)
            </label>
            <select
              value={divisionId}
              disabled={!departmentId || loadingDivisions}
              onChange={(e) => setDivisionId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 transition"
            >
              <option value="">
                {loadingDivisions
                  ? "Loading divisions..."
                  : !departmentId
                  ? "Select department first"
                  : "None (Direct Department Role)"}
              </option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name} ({div.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade & Job Level */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Salary Grade
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="">None (Standard)</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  Grade {grade.code} - {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Level / Hierarchy
            </label>
            <select
              value={jobLevelId}
              onChange={(e) => setJobLevelId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="">None (Staff)</option>
              {jobLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status (when editing) */}
        {isEditing && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive / Archived</option>
            </select>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Position"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
