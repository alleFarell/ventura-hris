"use client";

import { useEffect, useState } from "react";
import { performanceApi } from "../api";
import { CompetencyModel } from "../types";
import { BookOpen, Plus, RefreshCw, X, Award, Shield, Cpu } from "lucide-react";
import { getCompanies, CompanyResponse } from "@/features/setup/api";

export function CompetencyManager() {
  const [competencies, setCompetencies] = useState<CompetencyModel[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CORE");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [compList, companyList] = await Promise.all([
        performanceApi.getCompetencies(undefined, filterCategory === "ALL" ? undefined : filterCategory),
        getCompanies(),
      ]);
      setCompetencies(compList);
      setCompanies(companyList);
      if (companyList.length > 0 && !companyId) {
        setCompanyId(companyList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load competencies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !code || !name) return;
    setIsSubmitting(true);
    try {
      await performanceApi.createCompetency({
        companyId,
        code,
        name,
        category,
        description: description || undefined,
        weight: Number(weight),
      });
      setShowModal(false);
      setCode("");
      setName("");
      setDescription("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create competency");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Competency Framework & Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">
            Standardized behavioral, functional, and leadership competencies for objective appraisals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Competency
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "CORE", "FUNCTIONAL", "LEADERSHIP"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === cat ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading competency framework...</div>
      ) : competencies.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No competencies defined</h3>
          <p className="text-sm text-gray-500 mt-1">Add organizational competencies for appraisals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competencies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      comp.category === "LEADERSHIP"
                        ? "bg-amber-100 text-amber-800"
                        : comp.category === "FUNCTIONAL"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {comp.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">Weight: {comp.weight}%</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">{comp.name}</h3>
                  <p className="text-xs font-mono text-indigo-600 mt-0.5">{comp.code}</p>
                </div>

                {comp.description && (
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {comp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Competency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Competency Standard</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Operating Company *
                </label>
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legalName} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Competency Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. COMP-LEAD-01"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="CORE">Core Cultural</option>
                    <option value="FUNCTIONAL">Functional / Technical</option>
                    <option value="LEADERSHIP">Leadership & Strategy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Competency Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Strategic Thinking & Execution"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Weight (% in appraisal)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Behavioral Indicators / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe proficiency levels and expected behavioral attributes..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Competency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
