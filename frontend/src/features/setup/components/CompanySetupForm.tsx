"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { createCompany } from "@/features/setup/api";

const initialState = {
  code: "",
  name: "",
  legalName: "",
  taxIdentifier: "",
  defaultLocale: "id-ID",
  defaultTimezone: "Asia/Jakarta",
  defaultCurrency: "IDR",
  defaultDateFormat: "yyyy-MM-dd",
  status: "draft",
};

interface CompanySetupFormProps {
  onSuccess?: () => void;
}

export function CompanySetupForm({ onSuccess }: CompanySetupFormProps = {}) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await createCompany(form);
      setMessage("Company saved successfully");
      setForm(initialState);
      if (onSuccess) {
        onSuccess();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Company could not be saved");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Code
          <input className="rounded border border-slate-300 px-3 py-2" value={form.code} onChange={(event) => update("code", event.target.value)} required maxLength={30} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input className="rounded border border-slate-300 px-3 py-2" value={form.name} onChange={(event) => update("name", event.target.value)} required maxLength={150} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Legal Name
          <input className="rounded border border-slate-300 px-3 py-2" value={form.legalName} onChange={(event) => update("legalName", event.target.value)} required maxLength={200} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Tax Identifier
          <input className="rounded border border-slate-300 px-3 py-2" value={form.taxIdentifier} onChange={(event) => update("taxIdentifier", event.target.value)} maxLength={80} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Locale
          <select className="rounded border border-slate-300 px-3 py-2" value={form.defaultLocale} onChange={(event) => update("defaultLocale", event.target.value)}>
            <option value="id-ID">id-ID</option>
            <option value="en-US">en-US</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Timezone
          <select className="rounded border border-slate-300 px-3 py-2" value={form.defaultTimezone} onChange={(event) => update("defaultTimezone", event.target.value)}>
            <option value="Asia/Jakarta">Asia/Jakarta</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Currency
          <input className="rounded border border-slate-300 px-3 py-2 uppercase" value={form.defaultCurrency} onChange={(event) => update("defaultCurrency", event.target.value)} required maxLength={3} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="rounded border border-slate-300 px-3 py-2" value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm">
          {message ? <span className="text-teal-700">{message}</span> : null}
          {error ? <span className="text-red-700">{error}</span> : null}
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={saving}>
          <Save size={16} aria-hidden="true" />
          {saving ? "Saving" : "Save"}
        </button>
      </div>
    </form>
  );
}
