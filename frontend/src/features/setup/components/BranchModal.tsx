"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BranchPayload, BranchResponse, CompanyResponse, createBranch, updateBranch } from "../api";
import { GitBranch, Loader2, Save } from "lucide-react";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch?: BranchResponse | null;
  companies: CompanyResponse[];
}

const defaultForm: BranchPayload = {
  companyId: "",
  code: "",
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  countryCode: "ID",
  status: "ACTIVE",
};

export function BranchModal({
  isOpen,
  onClose,
  onSuccess,
  branch,
  companies,
}: BranchModalProps) {
  const [form, setForm] = useState<BranchPayload>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(branch);

  useEffect(() => {
    if (branch) {
      setForm({
        companyId: branch.companyId || (companies.length > 0 ? companies[0].id : ""),
        code: branch.code,
        name: branch.name,
        addressLine1: branch.addressLine1 || "",
        addressLine2: branch.addressLine2 || "",
        city: branch.city || "",
        province: branch.province || "",
        postalCode: branch.postalCode || "",
        countryCode: branch.countryCode || "ID",
        status: branch.status || "ACTIVE",
      });
    } else {
      setForm({
        ...defaultForm,
        companyId: companies.length > 0 ? companies[0].id : "",
      });
    }
    setError(null);
  }, [branch, companies, isOpen]);

  const update = (field: keyof BranchPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.companyId) {
      setError("Please select a parent company");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && branch) {
        await updateBranch(branch.id, form);
      } else {
        await createBranch(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to save branch office"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose()}
      title={isEdit ? "Edit Branch Office" : "Add Branch Office"}
      subtitle={
        isEdit
          ? `Modify location and workplace details for ${branch?.name}`
          : "Register a regional office, subsidiary location, or physical facility."
      }
      icon={<GitBranch className="h-5 w-5 text-emerald-600" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Company <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isEdit}
              value={form.companyId}
              onChange={(e) => update("companyId", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="" disabled>Select parent company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Branch Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={30}
              disabled={isEdit}
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="e.g. BR-JKT-01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Branch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Sudirman Head Office"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Address (Line 1) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={form.addressLine1 || ""}
              onChange={(e) => update("addressLine1", e.target.value)}
              placeholder="e.g. Jl. Jend. Sudirman Kav. 52-53"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.city || ""}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Jakarta Selatan"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Province / State
            </label>
            <input
              type="text"
              maxLength={100}
              value={form.province || ""}
              onChange={(e) => update("province", e.target.value)}
              placeholder="DKI Jakarta"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              maxLength={30}
              value={form.postalCode || ""}
              onChange={(e) => update("postalCode", e.target.value)}
              placeholder="12190"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Branch...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {isEdit ? "Update Branch" : "Add Branch"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
