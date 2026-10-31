"use client";

import { useEffect, useState } from "react";
import { performanceApi } from "../api";
import { PerformanceCycle } from "../types";
import { Calendar, CheckCircle2, Clock, PlayCircle, Plus, RefreshCw, X, AlertCircle } from "lucide-react";
import { getCompanies, CompanyResponse } from "@/features/setup/api";

export function PerformanceCycleManager() {
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [name, setName] = useState("Annual Performance & OKR Cycle 2027");
  const [cycleType, setCycleType] = useState("ANNUAL");
  const [startDate, setStartDate] = useState("2027-01-01");
  const [endDate, setEndDate] = useState("2027-12-31");
  const [selfReviewDeadline, setSelfReviewDeadline] = useState("2027-11-15");
  const [managerReviewDeadline, setManagerReviewDeadline] = useState("2027-12-01");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cycleList, compList] = await Promise.all([
        performanceApi.getCycles(undefined, filterStatus === "ALL" ? undefined : filterStatus),
        getCompanies(),
      ]);
      setCycles(cycleList);
      setCompanies(compList);
      if (compList.length > 0 && !companyId) {
        setCompanyId(compList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load performance cycles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !name || !startDate || !endDate) return;
    setIsSubmitting(true);
    try {
      await performanceApi.createCycle({
        companyId,
        name,
        cycleType,
        startDate,
        endDate,
        selfReviewDeadline,
        managerReviewDeadline,
      });
      setShowCreateModal(false);
      setName("Annual Performance & OKR Cycle 2027");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create cycle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, nextStatus: string) => {
    try {
      await performanceApi.updateCycleStatus(id, { status: nextStatus });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  };

  const activeCount = cycles.filter((c) => c.status === "ACTIVE").length;
  const evalCount = cycles.filter((c) => c.status === "EVALUATION").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance & Appraisal Cycles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize organization-wide appraisal review periods, self-evaluation deadlines, and manager milestones.
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Review Cycle
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Review Cycles</p>
              <h3 className="text-2xl font-bold text-gray-900">{cycles.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Goal Setting</p>
              <h3 className="text-2xl font-bold text-emerald-600">{activeCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">In Evaluation / Review</p>
              <h3 className="text-2xl font-bold text-purple-600">{evalCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "PLANNED", "ACTIVE", "EVALUATION", "CLOSED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === st ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading performance cycles...</div>
      ) : cycles.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No review cycles found</h3>
          <p className="text-sm text-gray-500 mt-1">Create an annual, semi-annual, or quarterly cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "EVALUATION"
                        ? "bg-purple-100 text-purple-800"
                        : item.status === "PLANNED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    Type: <strong className="text-gray-700">{item.cycleType}</strong> • Company: {item.companyName || "Default Entity"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600">
                <div>
                  <span className="text-gray-400 block">Cycle Period:</span>
                  <span className="font-medium text-gray-800">{item.startDate} to {item.endDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Self-Review Due:</span>
                  <span className="font-medium text-amber-700">{item.selfReviewDeadline}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-gray-200">
                  <span className="text-gray-400">Manager Review Due: </span>
                  <strong className="text-gray-800">{item.managerReviewDeadline}</strong>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">ID: {item.id.substring(0, 8)}</span>
                <div className="flex items-center gap-2">
                  {item.status === "PLANNED" && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, "ACTIVE")}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium rounded-lg"
                    >
                      Start Goal Setting
                    </button>
                  )}
                  {item.status === "ACTIVE" && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, "EVALUATION")}
                      className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-medium rounded-lg"
                    >
                      Open Appraisals
                    </button>
                  )}
                  {item.status === "EVALUATION" && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, "CLOSED")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium rounded-lg"
                    >
                      Close Cycle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create Performance Review Cycle</h3>
              <button
                onClick={() => setShowCreateModal(false)}
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Cycle Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Annual Review Cycle 2027"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Cycle Type *
                </label>
                <select
                  value={cycleType}
                  onChange={(e) => setCycleType(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ANNUAL">Annual Review (12 Months)</option>
                  <option value="SEMI_ANNUAL">Semi-Annual Review (6 Months)</option>
                  <option value="QUARTERLY">Quarterly OKRs (3 Months)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Self-Review Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={selfReviewDeadline}
                    onChange={(e) => setSelfReviewDeadline(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Manager Review Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={managerReviewDeadline}
                    onChange={(e) => setManagerReviewDeadline(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
