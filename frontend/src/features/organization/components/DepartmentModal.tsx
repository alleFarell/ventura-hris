"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DepartmentPayload, DepartmentResponse, OrganizationUnitResponse } from "../types";
import { createDepartment, updateDepartment } from "../api";
import { Building2, AlertCircle } from "lucide-react";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  department?: DepartmentResponse | null;
  allUnits?: OrganizationUnitResponse[];
}

export function DepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  department,
  allUnits = [],
}: DepartmentModalProps) {
  const isEditing = Boolean(department);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentUnitId, setParentUnitId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setCode(department.code);
      setName(department.name);
      setDescription(department.description || "");
      setParentUnitId("");
      setStatus(department.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    } else {
      setCode("");
      setName("");
      setDescription("");
      setParentUnitId("");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && department) {
        await updateDepartment(department.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
      } else {
        const payload: DepartmentPayload = {
          companyId,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          parentUnitId: parentUnitId || undefined,
        };
        await createDepartment(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} department.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Department" : "Create Department"}
      subtitle={
        isEditing
          ? `Modify configuration for department ${department?.code}`
          : "Register a functional department in the organization unit structure"
      }
      icon={<Building2 className="h-5 w-5 text-blue-600" />}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Department Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ENG, FIN, HR"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
            {isEditing && (
              <p className="mt-1 text-[11px] text-slate-400">Department code cannot be altered after creation.</p>
            )}
          </div>

          {/* Department Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering & Platform"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Parent Unit & Status (if editing) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isEditing ? (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Unit (Optional)
              </label>
              <select
                value={parentUnitId}
                onChange={(e) => setParentUnitId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              >
                <option value="">None (Top Level Unit)</option>
                {allUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    [{unit.unitType}] {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief mandate or functional scope of this department..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

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
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Department"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
