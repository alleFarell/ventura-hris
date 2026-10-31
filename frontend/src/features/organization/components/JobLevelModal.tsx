"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { JobLevelPayload, JobLevelResponse } from "../types";
import { createJobLevel, updateJobLevel } from "../api";
import { Sliders, AlertCircle } from "lucide-react";

interface JobLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  jobLevel?: JobLevelResponse | null;
  defaultSortOrder?: number;
}

export function JobLevelModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  jobLevel,
  defaultSortOrder = 1,
}: JobLevelModalProps) {
  const isEditing = Boolean(jobLevel);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(defaultSortOrder);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobLevel) {
      setCode(jobLevel.code);
      setName(jobLevel.name);
      setSortOrder(jobLevel.sortOrder);
      setStatus(jobLevel.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    } else {
      setCode("");
      setName("");
      setSortOrder(defaultSortOrder);
      setStatus("ACTIVE");
    }
    setError(null);
  }, [jobLevel, isOpen, defaultSortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && jobLevel) {
        await updateJobLevel(jobLevel.id, {
          name: name.trim(),
          sortOrder: Number(sortOrder),
          status,
        });
      } else {
        const payload: JobLevelPayload = {
          companyId,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          sortOrder: Number(sortOrder),
        };
        await createJobLevel(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} job level.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Job Level" : "Create Job Level"}
      subtitle={
        isEditing
          ? `Modify rank and hierarchy for level ${jobLevel?.code}`
          : "Define operational hierarchy position (e.g. C-Level, Director, Staff)"
      }
      icon={<Sliders className="h-5 w-5 text-indigo-600" />}
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
          {/* Job Level Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Level Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LVL-01, EXEC"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hierarchy Order <span className="text-rose-500">*</span>
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

        {/* Level Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Level Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Director, Team Lead, Associate"
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
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Job Level"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
