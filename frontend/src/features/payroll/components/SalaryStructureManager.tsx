"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { SalaryStructure, SalaryStructureCreateRequest } from "../types";
import { getGrades } from "@/features/organization/api";
import { GradeResponse } from "@/features/organization/types";
import { getCompanies } from "@/features/setup/api";
import { Layers, Plus, RefreshCw, X, TrendingUp } from "lucide-react";

export function SalaryStructureManager() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SalaryStructureCreateRequest>({
    gradeId: "",
    minSalary: 0,
    midpointSalary: 0,
    maxSalary: 0,
    currency: "IDR",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const companies = await getCompanies();
      const companyId = companies[0]?.id;
      const [structData, gradeData] = await Promise.all([
        payrollApi.getSalaryStructures(),
        companyId ? getGrades(companyId) : Promise.resolve([]),
      ]);
      setStructures(structData);
      setGrades(gradeData);
    } catch (err: any) {
      setError(err?.message || "Failed to load salary structures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (existing?: SalaryStructure) => {
    if (existing) {
      setForm({
        gradeId: existing.gradeId,
        minSalary: existing.minSalary,
        midpointSalary: existing.midpointSalary,
        maxSalary: existing.maxSalary,
        currency: existing.currency,
      });
    } else {
      setForm({
        gradeId: grades[0]?.id || "",
        minSalary: 0,
        midpointSalary: 0,
        maxSalary: 0,
        currency: "IDR",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.minSalary) > Number(form.midpointSalary)) {
      alert("Minimum salary cannot be greater than midpoint salary");
      return;
    }
    if (Number(form.midpointSalary) > Number(form.maxSalary)) {
      alert("Midpoint salary cannot be greater than maximum salary");
      return;
    }

    setIsSubmitting(true);
    try {
      await payrollApi.createOrUpdateSalaryStructure(form);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to save salary structure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Salary Structures & Grade Pay Scales</h2>
          <p className="text-xs text-slate-500">
            Define minimum, midpoint, and maximum salary bands per job grade for compensation benchmarking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Set Grade Pay Scale
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">Loading grade pay scales...</div>
        ) : structures.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No salary structures configured yet. Click "Set Grade Pay Scale" to create your first grade band.
          </div>
        ) : (
          structures.map((s) => {
            const spread = s.maxSalary - s.minSalary;
            const midPercent = spread > 0 ? ((s.midpointSalary - s.minSalary) / spread) * 100 : 50;

            return (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-blue-200 transition">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.gradeName}</h4>
                      <span className="font-mono text-[10px] text-slate-400">{s.gradeCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(s)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>

                {/* Range Bar Graphic */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Min: {Number(s.minSalary).toLocaleString("id-ID")}</span>
                    <span>Max: {Number(s.maxSalary).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-blue-500 rounded-full opacity-80"
                      style={{ left: "0%", width: "100%" }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow"
                      style={{ left: `${midPercent}%` }}
                      title={`Midpoint: ${s.midpointSalary}`}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    Midpoint Target: <strong className="text-slate-800">IDR {Number(s.midpointSalary).toLocaleString("id-ID")}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Currency: <strong className="text-slate-700">{s.currency}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    ACTIVE
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Configure Grade Pay Band</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Grade *</label>
                <select
                  required
                  value={form.gradeId}
                  onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="">Select Grade</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum Base Salary (IDR) *</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  required
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Midpoint Target Salary (IDR) *</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  required
                  value={form.midpointSalary}
                  onChange={(e) => setForm({ ...form, midpointSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maximum Base Salary (IDR) *</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  required
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
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
                  {isSubmitting ? "Saving..." : "Save Pay Band"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
