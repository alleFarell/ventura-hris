"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CompanyPayload, CompanyResponse, createCompany, updateCompany } from "../api";
import { Building2, Loader2, Save } from "lucide-react";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: CompanyResponse | null;
}

const defaultForm: CompanyPayload = {
  code: "",
  name: "",
  legalName: "",
  taxIdentifier: "",
  defaultLocale: "id-ID",
  defaultTimezone: "Asia/Jakarta",
  defaultCurrency: "IDR",
  defaultDateFormat: "yyyy-MM-dd",
  status: "ACTIVE",
};

export function CompanyModal({
  isOpen,
  onClose,
  onSuccess,
  company,
}: CompanyModalProps) {
  const [form, setForm] = useState<CompanyPayload>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(company);

  useEffect(() => {
    if (company) {
      setForm({
        code: company.code,
        name: company.name,
        legalName: company.legalName,
        taxIdentifier: company.taxIdentifier || "",
        defaultLocale: company.defaultLocale || "id-ID",
        defaultTimezone: company.defaultTimezone || "Asia/Jakarta",
        defaultCurrency: company.defaultCurrency || "IDR",
        defaultDateFormat: company.defaultDateFormat || "yyyy-MM-dd",
        status: company.status || "ACTIVE",
      });
    } else {
      setForm(defaultForm);
    }
    setError(null);
  }, [company, isOpen]);

  const update = (field: keyof CompanyPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && company) {
        await updateCompany(company.id, form);
      } else {
        await createCompany(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to save company entity"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose()}
      title={isEdit ? "Edit Company Entity" : "Register New Company"}
      subtitle={
        isEdit
          ? `Update configuration and localization for ${company?.name}`
          : "Configure legal entity baseline, tax identifier, and operational locale."
      }
      icon={<Building2 className="h-5 w-5 text-blue-600" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={30}
              disabled={isEdit}
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="e.g. VENTURA-ID"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            />
            {isEdit && (
              <p className="mt-1 text-[10.5px] text-slate-400">
                Entity code cannot be changed once established.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Ventura Group"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Legal Corporate Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={form.legalName}
              onChange={(e) => update("legalName", e.target.value)}
              placeholder="e.g. PT Ventura Global Indonesia"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax ID (NPWP)
            </label>
            <input
              type="text"
              maxLength={80}
              value={form.taxIdentifier || ""}
              onChange={(e) => update("taxIdentifier", e.target.value)}
              placeholder="01.234.567.8-901.000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Currency <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={form.defaultCurrency}
              onChange={(e) => update("defaultCurrency", e.target.value.toUpperCase())}
              placeholder="IDR"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Timezone <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.defaultTimezone}
              onChange={(e) => update("defaultTimezone", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
              <option value="UTC">UTC</option>
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Entity...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                {isEdit ? "Update Company" : "Register Company"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
