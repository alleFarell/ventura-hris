"use client";

import { useEffect, useState } from "react";
import { recruitmentApi } from "../api";
import { JobPosting, JobRequisition } from "../types";
import { Globe, Plus, RefreshCw, Eye, EyeOff, MapPin, Calendar, X } from "lucide-react";

export function JobPostingManager() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [approvedReqs, setApprovedReqs] = useState<JobRequisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [reqId, setReqId] = useState("");
  const [postingTitle, setPostingTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("Jakarta, Indonesia (Hybrid)");
  const [closingDate, setClosingDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [posts, reqs] = await Promise.all([
        recruitmentApi.getPostings(),
        recruitmentApi.getRequisitions("APPROVED"),
      ]);
      setPostings(posts);
      setApprovedReqs(reqs);
      if (reqs.length > 0 && !reqId) {
        setReqId(reqs[0].id);
        setPostingTitle(reqs[0].title);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load job postings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectReq = (id: string) => {
    setReqId(id);
    const selected = approvedReqs.find((r) => r.id === id);
    if (selected) {
      setPostingTitle(selected.title);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqId) return;
    setIsSubmitting(true);
    try {
      await recruitmentApi.createPosting({
        requisitionId: reqId,
        postingTitle,
        description,
        requirements,
        location,
        isPublished: true,
        closingDate: closingDate || undefined,
      });
      setShowModal(false);
      setDescription("");
      setRequirements("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await recruitmentApi.publishPosting(id, !current);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update publication status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" />
            Job Openings & Public Postings
          </h1>
          <p className="text-sm text-gray-500">
            Publish approved requisitions to careers portals, job boards, and recruitment channels
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
            onClick={() => setShowModal(true)}
            disabled={approvedReqs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Posting
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {approvedReqs.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-xs">
          Notice: You need at least one APPROVED job requisition before you can generate a public job posting.
        </div>
      )}

      {/* Grid of Postings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postings.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No job postings created yet.
          </div>
        ) : (
          postings.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold bg-gray-100 text-gray-700">
                    {p.requisitionNumber}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{p.postingTitle}</h3>
                <p className="text-xs text-gray-600 line-clamp-3">{p.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.location || "Remote"}
                  </span>
                  {p.closingDate && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5" />
                      Closes: {p.closingDate}
                    </span>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleTogglePublish(p.id, p.isPublished)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      p.isPublished
                        ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                        : "text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {p.isPublished ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Publish Opening
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Publish Job Opening</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Approved Requisition</label>
                <select
                  value={reqId}
                  onChange={(e) => handleSelectReq(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  {approvedReqs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.requisitionNumber} - {r.title} ({r.headcount} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Public Job Title</label>
                <input
                  type="text"
                  value={postingTitle}
                  onChange={(e) => setPostingTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Location / Mode</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Closing Date</label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Overview of responsibilities and scope..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requirements & Skills</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={3}
                  placeholder="Technical competencies, certifications, years of experience..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  {isSubmitting ? "Publishing..." : "Publish Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
