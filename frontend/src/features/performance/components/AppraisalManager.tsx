"use client";

import { useEffect, useState } from "react";
import { performanceApi } from "../api";
import { EmployeeAppraisal, PerformanceCycle } from "../types";
import { Award, CheckCircle, Clock, Plus, RefreshCw, X, Star, FileText } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function AppraisalManager() {
  const [appraisals, setAppraisals] = useState<EmployeeAppraisal[]>([]);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initiate Modal
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [cycleId, setCycleId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self Review Modal
  const [selfReviewAppraisal, setSelfReviewAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [selfScore, setSelfScore] = useState(4.5);
  const [selfComments, setSelfComments] = useState("");

  // Manager Review Modal
  const [managerReviewAppraisal, setManagerReviewAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [managerScore, setManagerScore] = useState(4.5);
  const [managerComments, setManagerComments] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cycleList, empList] = await Promise.all([
        performanceApi.getCycles(),
        getEmployees(),
      ]);
      setCycles(cycleList);
      setEmployees(empList);

      const activeCycle = cycleList.find((c) => c.status === "ACTIVE") || cycleList[0];
      const cycleToUse = selectedCycleId || (activeCycle ? activeCycle.id : "");
      if (cycleToUse) {
        setSelectedCycleId(cycleToUse);
        setCycleId(cycleToUse);
        const appList = await performanceApi.getAppraisals(cycleToUse, undefined, filterStatus === "ALL" ? undefined : filterStatus);
        setAppraisals(appList);
      }
      if (empList.length > 0 && !employeeId) {
        setEmployeeId(empList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load appraisals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCycleId, filterStatus]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleId || !employeeId) return;
    setIsSubmitting(true);
    try {
      await performanceApi.initiateAppraisal({
        cycleId,
        employeeId,
        managerId: managerId || undefined,
      });
      setShowInitiateModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to initiate appraisal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSelfReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfReviewAppraisal) return;
    setIsSubmitting(true);
    try {
      await performanceApi.submitSelfReview(selfReviewAppraisal.id, {
        selfScore: Number(selfScore),
        selfComments: selfComments || undefined,
      });
      setSelfReviewAppraisal(null);
      setSelfComments("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit self review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitManagerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerReviewAppraisal) return;
    setIsSubmitting(true);
    try {
      await performanceApi.submitManagerReview(managerReviewAppraisal.id, {
        managerScore: Number(managerScore),
        managerComments: managerComments || undefined,
      });
      setManagerReviewAppraisal(null);
      setManagerComments("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit manager review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = appraisals.filter((a) => a.status === "COMPLETED").length;
  const selfCount = appraisals.filter((a) => a.status === "SELF_REVIEW").length;
  const managerCount = appraisals.filter((a) => a.status === "MANAGER_REVIEW").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appraisals & Performance Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Execute 2-tier reviews with employee self-evaluation, manager calibration, and automatic grade scoring.
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
            onClick={() => setShowInitiateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Initiate Appraisal
          </button>
        </div>
      </div>

      {/* Cycle Selector & Metrics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase text-gray-500">Review Cycle:</span>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-xs text-gray-500 block">Total In Cycle</span>
            <strong className="text-gray-900 text-base">{appraisals.length}</strong>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Self-Review Stage</span>
            <strong className="text-amber-600 text-base">{selfCount}</strong>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Manager Stage</span>
            <strong className="text-indigo-600 text-base">{managerCount}</strong>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Completed</span>
            <strong className="text-emerald-600 text-base">{completedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "SELF_REVIEW", "MANAGER_REVIEW", "COMPLETED"].map((st) => (
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

      {/* Appraisals Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading appraisal submissions...</div>
        ) : appraisals.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No appraisals found</h3>
            <p className="text-sm text-gray-500 mt-1">Initiate appraisal submissions for this review period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Assigned Manager</th>
                  <th className="p-4">Self Score</th>
                  <th className="p-4">Manager Score</th>
                  <th className="p-4">Final Score & Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {appraisals.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{app.employeeName}</div>
                      <div className="text-xs text-gray-400">{app.employeeNumber}</div>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-700">
                      {app.managerName || "Unassigned"}
                    </td>
                    <td className="p-4">
                      {app.selfScore ? (
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          {Number(app.selfScore).toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {app.managerScore ? (
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          {Number(app.managerScore).toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {app.finalScore ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-base">
                            {Number(app.finalScore).toFixed(2)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-black ${
                              app.performanceGrade === "A"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.performanceGrade === "B"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Grade {app.performanceGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "MANAGER_REVIEW"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {app.status === "SELF_REVIEW" && (
                        <button
                          onClick={() => {
                            setSelfReviewAppraisal(app);
                            setSelfScore(4.5);
                            setSelfComments(app.selfComments || "");
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                        >
                          Submit Self-Review
                        </button>
                      )}
                      {app.status === "MANAGER_REVIEW" && (
                        <button
                          onClick={() => {
                            setManagerReviewAppraisal(app);
                            setManagerScore(4.5);
                            setManagerComments(app.managerComments || "");
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                        >
                          Manager Appraisal
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Initiate Appraisal Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Initiate Employee Appraisal</h3>
              <button
                onClick={() => setShowInitiateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Appraisal Cycle *
                </label>
                <select
                  required
                  value={cycleId}
                  onChange={(e) => setCycleId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Target Employee *
                </label>
                <select
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Reviewing Manager
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Manager --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Initiating..." : "Initiate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Self-Review Modal */}
      {selfReviewAppraisal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Self-Evaluation</h3>
                <p className="text-xs text-gray-500">Employee: {selfReviewAppraisal.employeeName}</p>
              </div>
              <button
                onClick={() => setSelfReviewAppraisal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSelfReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Self-Evaluation Score (1.00 to 5.00) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  value={selfScore}
                  onChange={(e) => setSelfScore(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Self-Reflection & Achievements
                </label>
                <textarea
                  rows={4}
                  value={selfComments}
                  onChange={(e) => setSelfComments(e.target.value)}
                  placeholder="Detail your key contributions, obstacles overcome, and personal growth milestones..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelfReviewAppraisal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit to Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager Review Modal */}
      {managerReviewAppraisal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manager Appraisal & Rating</h3>
                <p className="text-xs text-gray-500">Employee: {managerReviewAppraisal.employeeName}</p>
              </div>
              <button
                onClick={() => setManagerReviewAppraisal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitManagerReview} className="space-y-4">
              {managerReviewAppraisal.selfScore && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <span>Employee Self-Score: </span>
                  <strong>{Number(managerReviewAppraisal.selfScore).toFixed(2)}/5.00</strong>
                  {managerReviewAppraisal.selfComments && (
                    <p className="mt-1 italic">&ldquo;{managerReviewAppraisal.selfComments}&rdquo;</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Manager Appraisal Score (1.00 to 5.00) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  value={managerScore}
                  onChange={(e) => setManagerScore(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Manager Feedback & Justification *
                </label>
                <textarea
                  required
                  rows={4}
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  placeholder="Provide structured feedback regarding delivery, behavioral competencies, and areas for improvement..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setManagerReviewAppraisal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Finalizing..." : "Finalize Appraisal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
