"use client";

import { useEffect, useState } from "react";
import { performanceApi } from "../api";
import { Feedback360, EmployeeAppraisal } from "../types";
import { Users, Plus, RefreshCw, X, Star, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function Feedback360Manager() {
  const [feedbacks, setFeedbacks] = useState<Feedback360[]>([]);
  const [appraisals, setAppraisals] = useState<EmployeeAppraisal[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [appraisalId, setAppraisalId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [relationship, setRelationship] = useState("PEER");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Response Modal
  const [respondFeedback, setRespondFeedback] = useState<Feedback360 | null>(null);
  const [rating, setRating] = useState(4.5);
  const [feedbackText, setFeedbackText] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fbList, appList, empList] = await Promise.all([
        performanceApi.getFeedbacks(),
        performanceApi.getAppraisals(),
        getEmployees(),
      ]);
      setFeedbacks(fbList);
      setAppraisals(appList);
      setEmployees(empList);
      if (appList.length > 0 && !appraisalId) {
        setAppraisalId(appList[0].id);
      }
      if (empList.length > 0 && !reviewerId) {
        setReviewerId(empList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load 360 feedback");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appraisalId || !reviewerId) return;
    setIsSubmitting(true);
    try {
      await performanceApi.requestFeedback({
        appraisalId,
        reviewerId,
        relationship,
        isAnonymous,
      });
      setShowRequestModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to request feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondFeedback) return;
    setIsSubmitting(true);
    try {
      await performanceApi.submitFeedback(respondFeedback.id, {
        rating: Number(rating),
        feedbackText,
      });
      setRespondFeedback(null);
      setFeedbackText("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submittedCount = feedbacks.filter((f) => f.status === "SUBMITTED").length;
  const requestedCount = feedbacks.filter((f) => f.status === "REQUESTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">360-Degree Peer Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">
            Collect confidential cross-functional assessments from peers, collaborators, and direct reports.
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
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Peer Review
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Feedback Invocations</p>
              <h3 className="text-2xl font-bold text-gray-900">{feedbacks.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Submissions</p>
              <h3 className="text-2xl font-bold text-amber-600">{requestedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Received & Aggregated</p>
              <h3 className="text-2xl font-bold text-emerald-600">{submittedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading 360 peer feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Users className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No peer reviews requested</h3>
          <p className="text-sm text-gray-500 mt-1">Request multi-perspective reviews for employees under evaluation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.relationship === "PEER"
                        ? "bg-blue-100 text-blue-800"
                        : item.relationship === "SUBORDINATE"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.relationship}
                  </span>
                  {item.isAnonymous && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-gray-400" />
                      Anonymous
                    </span>
                  )}
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === "SUBMITTED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">{item.reviewerName}</h3>
                <p className="text-xs text-gray-400">Appraisal ID: {item.appraisalId.substring(0, 8)}</p>
              </div>

              {item.status === "SUBMITTED" && item.rating && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>{Number(item.rating).toFixed(2)} / 5.00</span>
                  </div>
                  {item.feedbackText && (
                    <p className="text-xs text-gray-600 italic">&ldquo;{item.feedbackText}&rdquo;</p>
                  )}
                </div>
              )}

              {item.status === "REQUESTED" && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      setRespondFeedback(item);
                      setRating(4.5);
                      setFeedbackText("");
                    }}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Request 360-Degree Feedback</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Target Appraisal Review *
                </label>
                <select
                  required
                  value={appraisalId}
                  onChange={(e) => setAppraisalId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Appraisal --</option>
                  {appraisals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.employeeName} ({a.employeeNumber}) - {a.cycleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Peer Reviewer *
                </label>
                <select
                  required
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Reviewer Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Working Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PEER">Peer / Team Colleague</option>
                  <option value="SUBORDINATE">Direct Report / Subordinate</option>
                  <option value="CROSS_FUNCTIONAL">Cross-Functional Stakeholder</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="anonCheck" className="text-xs text-gray-700 select-none">
                  Keep reviewer name anonymous to the appraised employee
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {respondFeedback && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Provide Peer Evaluation</h3>
                <p className="text-xs text-gray-500">Perspective: {respondFeedback.relationship}</p>
              </div>
              <button
                onClick={() => setRespondFeedback(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Overall Rating (1.00 to 5.00) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Collaborative Feedback & Examples *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share constructive feedback highlighting strengths, cross-team impact, and areas to develop..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setRespondFeedback(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
