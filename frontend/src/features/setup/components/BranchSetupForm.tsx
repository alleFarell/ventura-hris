"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { createBranch, getCompanies, CompanyResponse } from "@/features/setup/api";

const initialState = {
  companyId: "",
  code: "",
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  countryCode: "ID",
  status: "active",
};

interface BranchSetupFormProps {
  onSuccess?: () => void;
}

export function BranchSetupForm({ onSuccess }: BranchSetupFormProps = {}) {
  const [form, setForm] = useState(initialState);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          setForm((prev) => (prev.companyId ? prev : { ...prev, companyId: data[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await createBranch(form);
      setMessage("Branch saved successfully");
      setForm((prev) => ({
        ...initialState,
        companyId: prev.companyId,
      }));
      if (onSuccess) {
        onSuccess();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Branch could not be saved");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Company
          {companies.length > 0 ? (
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.companyId}
              onChange={(event) => update("companyId", event.target.value)}
              required
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </option>
              ))}
            </select>
          ) : (
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.companyId}
              onChange={(event) => update("companyId", event.target.value)}
              placeholder="Enter Company UUID or create company first"
              required
            />
          )}
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Branch Code
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.code}
            onChange={(event) => update("code", event.target.value)}
            placeholder="e.g. HQ-JKT"
            required
            maxLength={30}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Branch Name
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Jakarta Headquarters"
            required
            maxLength={150}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Status
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Address Line 1
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.addressLine1}
            onChange={(event) => update("addressLine1", event.target.value)}
            placeholder="Street address"
            maxLength={200}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Address Line 2
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.addressLine2}
            onChange={(event) => update("addressLine2", event.target.value)}
            placeholder="Building, Suite, Unit"
            maxLength={200}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          City
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            maxLength={100}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Province / State
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.province}
            onChange={(event) => update("province", event.target.value)}
            maxLength={100}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Postal Code
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
            maxLength={30}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Country Code
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={form.countryCode}
            onChange={(event) => update("countryCode", event.target.value)}
            minLength={2}
            maxLength={2}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="text-sm">
          {message && <span className="font-medium text-emerald-600">{message}</span>}
          {error && <span className="font-medium text-rose-600">{error}</span>}
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          disabled={saving}
        >
          <Save size={16} aria-hidden="true" />
          {saving ? "Saving..." : "Save Branch"}
        </button>
      </div>
    </form>
  );
}
