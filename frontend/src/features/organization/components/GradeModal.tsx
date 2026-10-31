"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { GradePayload, GradeResponse } from "../types";
import { createGrade, updateGrade } from "../api";
import { Layers, AlertCircle } from "lucide-react";

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  grade?: GradeResponse | null;
  defaultSortOrder?: number;
}

export function GradeModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  grade,
  defaultSortOrder = 1,
}: GradeModalProps) {
  const isEditing = Boolean(grade);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(defaultSortOrder);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grade) {
      setCode(grade.code);
      setName(grade.name);
      setSortOrder(grade.sortOrder);
      setStatus(grade.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    } else {
      setCode("");
      setName("");
      setSortOrder(defaultSortOrder);
      setStatus("ACTIVE");
    }
    setError(null);
  }, [grade, isOpen, defaultSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && grade) {
        await updateGrade(grade.id, {
          name: name.trim(),
          sortOrder: Number(sortOrder),
          status,
        });
      } else {
        const payload: GradePayload = {
          companyId,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          sortOrder: Number(sortOrder),
        };
        await createGrade(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} grade.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Salary Grade" : "Create Salary Grade"}
      subtitle={
        isEditing
          ? `Modify configuration for grade ${grade?.code}`
          : "Define compensation grade hierarchy and seniority band"
      }
      icon={<Layers className="h-5 w-5 text-indigo-600" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Grade Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grade Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GR-01, G1"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sort Order <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Grade Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Grade Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Entry Level, Senior Professional"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Status (when editing) */}
        {isEditing && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Grade"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
