"use client";

import { useEffect, useState } from "react";
import { recruitmentApi } from "../api";
import { JobApplication, JobPosting, JobCandidate } from "../types";
import { Users, Plus, RefreshCw, Star, ArrowRight, FileText, Mail, Phone, ExternalLink, X } from "lucide-react";

const STAGES = [
  { id: "APPLIED", label: "Applied", color: "border-blue-500 bg-blue-50/40 text-blue-700" },
  { id: "SCREENING", label: "Screening", color: "border-purple-500 bg-purple-50/40 text-purple-700" },
  { id: "INTERVIEW", label: "Interview", color: "border-amber-500 bg-amber-50/40 text-amber-700" },
  { id: "OFFERED", label: "Offered", color: "border-emerald-500 bg-emerald-50/40 text-emerald-700" },
  { id: "HIRED", label: "Hired", color: "border-green-600 bg-green-50/40 text-green-800" },
  { id: "REJECTED", label: "Rejected", color: "border-rose-500 bg-rose-50/40 text-rose-700" },
];

export function AtsCandidatePipeline() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [selectedPostingId, setSelectedPostingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candResume, setCandResume] = useState("");
  const [candLinkedin, setCandLinkedin] = useState("");
  const [candNotes, setCandNotes] = useState("");
  const [targetPostingId, setTargetPostingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stage update
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apps, posts] = await Promise.all([
        recruitmentApi.getApplications(selectedPostingId || undefined),
        recruitmentApi.getPostings(),
      ]);
      setApplications(apps);
      setPostings(posts);
      if (posts.length > 0 && !targetPostingId) {
        setTargetPostingId(posts[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load candidate pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPostingId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPostingId) return;
    setIsSubmitting(true);
    try {
      // 1. Register candidate
      const cand = await recruitmentApi.registerCandidate({
        fullName: candName,
        email: candEmail,
        phone: candPhone || undefined,
        resumeUrl: candResume || undefined,
        linkedinUrl: candLinkedin || undefined,
      });

      // 2. Apply to posting
      await recruitmentApi.applyJob({
        jobPostingId: targetPostingId,
        candidateId: cand.id,
        notes: candNotes || undefined,
      });

      setShowApplyModal(false);
      setCandName("");
      setCandEmail("");
      setCandPhone("");
      setCandResume("");
      setCandLinkedin("");
      setCandNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to register application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (appId: string, nextStage: string) => {
    setUpdatingAppId(appId);
    try {
      await recruitmentApi.updateStage(appId, { stage: nextStage });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update stage");
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            Applicant Tracking Pipeline (ATS)
          </h1>
          <p className="text-sm text-gray-500">
            Monitor applicant progression from initial application to final offer and hiring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            disabled={postings.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Applicant
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Posting filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Opening:</label>
        <select
          value={selectedPostingId}
          onChange={(e) => setSelectedPostingId(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm max-w-md w-full"
        >
          <option value="">All Job Openings ({postings.length})</option>
          {postings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.postingTitle} ({p.location || "Remote"})
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500 ml-auto">
          Showing {applications.length} active candidates
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.currentStage === stage.id);
          return (
            <div key={stage.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col min-w-[220px]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageApps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">No applicants</div>
                ) : (
                  stageApps.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs space-y-2.5 hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 leading-tight">{a.candidateName}</h4>
                        <p className="text-xs text-purple-700 font-medium truncate mt-0.5">{a.postingTitle}</p>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate">{a.candidateEmail}</span>
                        </div>
                        {a.candidatePhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                            <span>{a.candidatePhone}</span>
                          </div>
                        )}
                      </div>

                      {a.resumeUrl && (
                        <a
                          href={a.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FileText className="h-3 w-3" />
                          Resume CV
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}

                      {/* Stage transition buttons */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                        <select
                          value={a.currentStage}
                          onChange={(e) => handleMoveStage(a.id, e.target.value)}
                          disabled={updatingAppId === a.id}
                          className="text-xs border rounded px-1.5 py-1 text-gray-700 bg-white w-full"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Applicant Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Applicant to ATS</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Opening</label>
                <select
                  value={targetPostingId}
                  onChange={(e) => setTargetPostingId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  {postings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.postingTitle} ({p.location || "Remote"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="e.g. Maria Angelina"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Resume / CV Document URL</label>
                  <input
                    type="url"
                    value={candResume}
                    onChange={(e) => setCandResume(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={candLinkedin}
                    onChange={(e) => setCandLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Application Notes / Screening</label>
                <textarea
                  value={candNotes}
                  onChange={(e) => setCandNotes(e.target.value)}
                  rows={2}
                  placeholder="Sourcing source, initial impressions, referral info..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  {isSubmitting ? "Registering..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
