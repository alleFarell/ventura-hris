"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DivisionPayload, DivisionResponse } from "../types";
import { createDivision, updateDivision } from "../api";
import { GitFork, AlertCircle } from "lucide-react";

interface DivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  departmentId: string;
  departmentName: string;
  division?: DivisionResponse | null;
}

export function DivisionModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  departmentId,
  departmentName,
  division,
}: DivisionModalProps) {
  const isEditing = Boolean(division);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (division) {
      setCode(division.code);
      setName(division.name);
      setStatus(division.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    } else {
      setCode("");
      setName("");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [division, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && division) {
        await updateDivision(division.id, {
          name: name.trim(),
          status,
        });
      } else {
        const payload: DivisionPayload = {
          companyId,
          departmentId,
          code: code.trim().toUpperCase(),
          name: name.trim(),
        };
        await createDivision(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} division.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Operational Division" : "Create Operational Division"}
      subtitle={`Department: ${departmentName}`}
      icon={<GitFork className="h-5 w-5 text-indigo-600" />}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Division Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Division Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isEditing}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. BE, FE, QA, DEVOPS"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
          />
          {isEditing && (
            <p className="mt-1 text-[11px] text-slate-400">Division code cannot be altered after creation.</p>
          )}
        </div>

        {/* Division Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Division Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Backend Services & Core APIs"
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
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Division"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
