"use client";

import { useEffect, useState } from "react";
import { offboardingApi } from "../api";
import { OffboardingCase, ExitInterview } from "../types";
import { MessageSquare, Star, Plus, RefreshCw, X, User, ThumbsUp, HeartHandshake, CheckCircle2 } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function ExitInterviewManager() {
  const [cases, setCases] = useState<OffboardingCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [interview, setInterview] = useState<ExitInterview | null>(null);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [interviewerId, setInterviewerId] = useState("");
  const [primaryReason, setPrimaryReason] = useState("BETTER_OPPORTUNITY");
  const [cultureRating, setCultureRating] = useState(5);
  const [managementRating, setManagementRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [caseList, empList] = await Promise.all([
        offboardingApi.getCases(),
        getEmployees(),
      ]);
      setCases(caseList);
      setEmployees(empList);
      if (empList.length > 0 && !interviewerId) {
        setInterviewerId(empList[0].id);
      }
      if (caseList.length > 0 && !selectedCaseId) {
        setSelectedCaseId(caseList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load exit interviews");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInterview = async (caseId: string) => {
    if (!caseId) {
      setInterview(null);
      return;
    }
    try {
      const res = await offboardingApi.getExitInterview(caseId);
      setInterview(res);
    } catch {
      setInterview(null);
    }
  };

  const loadData = async () => {
    await loadInitialData();
    if (selectedCaseId) {
      await loadInterview(selectedCaseId);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadInterview(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleSubmitInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !primaryReason) return;
    setIsSubmitting(true);
    try {
      await offboardingApi.submitExitInterview({
        caseId: selectedCaseId,
        interviewerId: interviewerId || undefined,
        primaryReason,
        cultureRating: Number(cultureRating),
        managementRating: Number(managementRating),
        feedbackText: feedbackText || undefined,
      });
      setShowModal(false);
      setFeedbackText("");
      if (selectedCaseId) {
        await loadInterview(selectedCaseId);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit exit interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exit Interviews & Employee Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">
            Capture candid departures feedback, analyze turnover drivers, and benchmark company culture.
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
          {selectedCase && !interview && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Conduct Interview
            </button>
          )}
        </div>
      </div>

      {/* Case Selector */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="max-w-md">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Offboarding Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.employeeNumber}] {c.employeeName} &bull; {c.separationType} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interview Display or Prompt */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading interview details...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : interview ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                COMPLETED INTERVIEW
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Exit Interview &bull; {interview.employeeName}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Conducted by: <strong>{interview.interviewerName || "HR Department"}</strong> on{" "}
                {interview.submittedAt ? new Date(interview.submittedAt).toLocaleDateString() : ""}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-mono">{interview.employeeNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-gray-500 uppercase font-semibold">Primary Reason</div>
              <div className="text-base font-bold text-indigo-700 mt-1">{interview.primaryReason.replace("_", " ")}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-gray-500 uppercase font-semibold">Culture Rating</div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= interview.cultureRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-gray-700 ml-1.5">{interview.cultureRating} / 5</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-gray-500 uppercase font-semibold">Leadership & Management</div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= interview.managementRating ? "text-indigo-500 fill-indigo-500" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-gray-700 ml-1.5">{interview.managementRating} / 5</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Departing Employee Feedback & Suggestions</h3>
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
              &ldquo;{interview.feedbackText || "No additional commentary provided."}&rdquo;
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No exit interview recorded for this case</p>
          <p className="text-gray-400 text-sm mt-1">Schedule and conduct an interview to document organizational feedback.</p>
          {selectedCase && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Conduct Exit Interview
            </button>
          )}
        </div>
      )}

      {/* Conduct Interview Modal */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Conduct Exit Interview</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterview} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div>Departing: <strong>{selectedCase.employeeName} ({selectedCase.employeeNumber})</strong></div>
                <div className="mt-0.5">Separation: <strong>{selectedCase.separationType}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interviewer (HR Rep)</label>
                <select
                  value={interviewerId}
                  onChange={(e) => setInterviewerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">HR Department</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeNumber}] {emp.firstName} {emp.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Reason for Leaving *</label>
                <select
                  value={primaryReason}
                  onChange={(e) => setPrimaryReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BETTER_OPPORTUNITY">BETTER_OPPORTUNITY (Career Growth)</option>
                  <option value="COMPENSATION">COMPENSATION (Salary & Benefits)</option>
                  <option value="WORK_LIFE_BALANCE">WORK_LIFE_BALANCE</option>
                  <option value="RELOCATION">RELOCATION (Moving Abroad/City)</option>
                  <option value="MANAGEMENT_ISSUES">MANAGEMENT_ISSUES</option>
                  <option value="FURTHER_EDUCATION">FURTHER_EDUCATION</option>
                  <option value="PERSONAL_FAMILY">PERSONAL_FAMILY</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Culture Rating (1 - 5) *</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={cultureRating}
                    onChange={(e) => setCultureRating(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Management Rating (1 - 5) *</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={managementRating}
                    onChange={(e) => setManagementRating(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Feedback & Constructive Input</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What did you enjoy most? What areas could the organization improve?..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Save Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
