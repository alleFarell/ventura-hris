"use client";

import { useEffect, useState } from "react";
import { recruitmentApi } from "../api";
import { InterviewSchedule, JobApplication } from "../types";
import { Calendar, Clock, Video, UserCheck, Star, Plus, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function InterviewScheduler() {
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appId, setAppId] = useState("");
  const [roundName, setRoundName] = useState("Technical System Design Round");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [interviewerId, setInterviewerId] = useState("");
  const [locationUrl, setLocationUrl] = useState("https://meet.google.com/interview-room");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluation Modal
  const [evaluatingInterview, setEvaluatingInterview] = useState<InterviewSchedule | null>(null);
  const [evalScore, setEvalScore] = useState(5);
  const [evalVerdict, setEvalVerdict] = useState("RECOMMENDED");
  const [evalNotes, setEvalNotes] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [intList, appList, empList] = await Promise.all([
        recruitmentApi.getInterviews(undefined, filterStatus === "ALL" ? undefined : filterStatus),
        recruitmentApi.getApplications(),
        getEmployees(),
      ]);
      setInterviews(intList);
      setApplications(appList);
      setEmployees(empList);
      if (appList.length > 0 && !appId) {
        setAppId(appList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load interviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !scheduledTime) return;
    setIsSubmitting(true);
    try {
      await recruitmentApi.scheduleInterview({
        applicationId: appId,
        roundName,
        scheduledTime: new Date(scheduledTime).toISOString(),
        durationMinutes,
        interviewerId: interviewerId || undefined,
        locationUrl: locationUrl || undefined,
        notes: notes || undefined,
      });
      setShowScheduleModal(false);
      setRoundName("Technical System Design Round");
      setScheduledTime("");
      setNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to schedule interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInterview) return;
    setIsSubmitting(true);
    try {
      await recruitmentApi.submitEvaluation(evaluatingInterview.id, {
        score: evalScore,
        verdict: evalVerdict,
        feedbackNotes: evalNotes,
        interviewerId: evaluatingInterview.interviewerId,
      });
      setEvaluatingInterview(null);
      setEvalNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduledCount = interviews.filter((i) => i.status === "SCHEDULED").length;
  const completedCount = interviews.filter((i) => i.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interview Scheduling & Evaluations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordinate multi-stage interview rounds, assign panels, and record candidate scorecards.
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
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Interviews</p>
              <h3 className="text-2xl font-bold text-gray-900">{interviews.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming / Scheduled</p>
              <h3 className="text-2xl font-bold text-amber-600">{scheduledCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Completed & Evaluated</p>
              <h3 className="text-2xl font-bold text-emerald-600">{completedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((st) => (
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

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Interview List */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading interview sessions...</div>
      ) : interviews.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No interviews found</h3>
          <p className="text-sm text-gray-500 mt-1">Schedule an interview round for candidates in the pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "SCHEDULED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{item.roundName}</h3>
                  <p className="text-xs text-gray-500">
                    Candidate: <strong className="text-gray-700">{item.candidateName || "Unknown"}</strong> • {item.jobTitle || "General Application"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {new Date(item.scheduledTime).toLocaleString()} ({item.durationMinutes} mins)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Interviewer: {item.interviewerName || "Unassigned Panel"}</span>
                </div>
                {item.locationUrl && (
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Video className="w-3.5 h-3.5" />
                    <a
                      href={item.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline truncate max-w-xs"
                    >
                      {item.locationUrl}
                    </a>
                  </div>
                )}
                {item.notes && <p className="italic text-gray-500 pt-1 border-t border-gray-200">Notes: {item.notes}</p>}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">Ref: {item.applicationNumber || item.id.substring(0, 8)}</span>
                {item.status === "SCHEDULED" && (
                  <button
                    onClick={() => {
                      setEvaluatingInterview(item);
                      setEvalScore(5);
                      setEvalVerdict("RECOMMENDED");
                      setEvalNotes("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-indigo-600" />
                    Submit Scorecard
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Schedule Interview Round</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Candidate Application *
                </label>
                <select
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Candidate Application --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidateName} - {app.postingTitle} ({app.currentStage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Interview Round *
                </label>
                <input
                  type="text"
                  required
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  placeholder="e.g. Technical System Design Round"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Assigned Interviewer
                </label>
                <select
                  value={interviewerId}
                  onChange={(e) => setInterviewerId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Optional: Assign Interviewer --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Location / Video Link
                </label>
                <input
                  type="text"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Briefing notes for the interviewer"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Evaluation Modal */}
      {evaluatingInterview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Candidate Scorecard & Verdict</h3>
                <p className="text-xs text-gray-500">
                  {evaluatingInterview.candidateName} • {evaluatingInterview.roundName}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingInterview(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Overall Score (1 - 5)
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEvalScore(s)}
                      className={`p-2 rounded-lg flex items-center gap-1 text-sm font-bold border transition-colors ${
                        evalScore >= s
                          ? "bg-amber-50 border-amber-400 text-amber-600"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Hiring Recommendation / Verdict *
                </label>
                <select
                  value={evalVerdict}
                  onChange={(e) => setEvalVerdict(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="STRONG_HIRE">Strong Hire</option>
                  <option value="RECOMMENDED">Recommended for Hire</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="NOT_RECOMMENDED">Not Recommended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Detailed Feedback & Evaluation Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Summarize candidate technical proficiency, domain knowledge, and communication..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEvaluatingInterview(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Scorecard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
