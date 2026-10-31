"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { SalaryComponent, SalaryComponentCreateRequest, SalaryComponentType } from "../types";
import { Plus, Check, X, SlidersHorizontal, RefreshCw } from "lucide-react";

export function SalaryComponentCatalog() {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SalaryComponentCreateRequest>({
    code: "",
    name: "",
    description: "",
    type: "EARNING_FIXED",
    isTaxable: true,
    isBpjsApplicable: true,
    defaultAmount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payrollApi.getSalaryComponents();
      setComponents(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load salary components");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await payrollApi.createSalaryComponent(form);
      setIsModalOpen(false);
      setForm({
        code: "",
        name: "",
        description: "",
        type: "EARNING_FIXED",
        isTaxable: true,
        isBpjsApplicable: true,
        defaultAmount: 0,
      });
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create component");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadgeClass = (type: SalaryComponentType) => {
    switch (type) {
      case "EARNING_FIXED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "EARNING_VARIABLE":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "DEDUCTION_FIXED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DEDUCTION_VARIABLE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Salary Component Catalog</h2>
          <p className="text-xs text-slate-500">Configure modular earnings, allowances, and statutory deductions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Component
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Component Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default Amount</th>
                <th className="px-4 py-3 text-center">Taxable</th>
                <th className="px-4 py-3 text-center">BPJS Subj.</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading salary components...
                  </td>
                </tr>
              ) : components.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No salary components found. Add your first component.
                  </td>
                </tr>
              ) : (
                components.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{comp.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{comp.name}</div>
                      {comp.description && <div className="text-[11px] text-slate-400">{comp.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getTypeBadgeClass(comp.type)}`}>
                        {comp.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      IDR {Number(comp.defaultAmount || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {comp.isTaxable ? (
                        <Check className="h-4 w-4 text-emerald-600 inline" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {comp.isBpjsApplicable ? (
                        <Check className="h-4 w-4 text-emerald-600 inline" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          comp.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {comp.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">New Salary Component</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Component Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POSITION_ALLOWANCE"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Position Allowance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as SalaryComponentType })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="EARNING_FIXED">EARNING FIXED (Allowance)</option>
                  <option value="EARNING_VARIABLE">EARNING VARIABLE (Performance / OT)</option>
                  <option value="DEDUCTION_FIXED">DEDUCTION FIXED (Club / Loan)</option>
                  <option value="DEDUCTION_VARIABLE">DEDUCTION VARIABLE (Tardiness / Tax)</option>
                  <option value="BENEFIT_IN_KIND">BENEFIT IN KIND (Company Car / Housing)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Monthly Amount (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.defaultAmount}
                  onChange={(e) => setForm({ ...form, defaultAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional brief description"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isTaxable}
                    onChange={(e) => setForm({ ...form, isTaxable: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Taxable (PPh 21)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBpjsApplicable}
                    onChange={(e) => setForm({ ...form, isBpjsApplicable: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">BPJS Base</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Component"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
