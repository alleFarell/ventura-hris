"use client";

import { useEffect, useState } from "react";
import { recruitmentApi } from "../api";
import { JobOffer, JobApplication } from "../types";
import { Award, CheckCircle, Send, XCircle, Plus, RefreshCw, X, ExternalLink, DollarSign, Calendar } from "lucide-react";

export function JobOfferManager() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [offeredSalary, setOfferedSalary] = useState(25000000);
  const [allowanceAmount, setAllowanceAmount] = useState(2000000);
  const [joinDate, setJoinDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [letterUrl, setLetterUrl] = useState("https://storage.ventura.com/letters/offer-doc.pdf");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [offerList, appList] = await Promise.all([
        recruitmentApi.getOffers(undefined, filterStatus === "ALL" ? undefined : filterStatus),
        recruitmentApi.getApplications(),
      ]);
      setOffers(offerList);
      setApplications(appList);
      if (appList.length > 0 && !applicationId) {
        setApplicationId(appList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load job offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !joinDate || !expirationDate) return;
    setIsSubmitting(true);
    try {
      await recruitmentApi.createOffer({
        applicationId,
        offeredSalary: Number(offeredSalary),
        allowanceAmount: Number(allowanceAmount),
        joinDate,
        expirationDate,
        letterUrl: letterUrl || undefined,
        notes: notes || undefined,
      });
      setShowCreateModal(false);
      setNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create job offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (offerId: string, nextStatus: string, reason?: string) => {
    try {
      await recruitmentApi.updateOfferStatus(offerId, {
        status: nextStatus,
        notes: reason,
      });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update offer status");
    }
  };

  const acceptedCount = offers.filter((o) => o.status === "ACCEPTED").length;
  const sentCount = offers.filter((o) => o.status === "SENT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Job Offers & Formal Hiring</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate formal employment proposals, manage compensation terms, and track candidate acceptances.
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
            Generate Job Offer
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Offers Issued</p>
              <h3 className="text-2xl font-bold text-gray-900">{offers.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Candidate Review</p>
              <h3 className="text-2xl font-bold text-amber-600">{sentCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Accepted & Hired</p>
              <h3 className="text-2xl font-bold text-emerald-600">{acceptedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"].map((st) => (
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

      {/* Table List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading job offers...</div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No offers found</h3>
            <p className="text-sm text-gray-500 mt-1">Generate an offer letter for candidates who passed interviews.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">Offer Ref</th>
                  <th className="p-4">Candidate & Role</th>
                  <th className="p-4">Offered Package</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">
                      <div>{offer.offerNumber}</div>
                      <div className="text-xs text-gray-400 font-normal">App: {offer.applicationNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{offer.candidateName}</div>
                      <div className="text-xs text-gray-500">{offer.jobTitle}</div>
                      <div className="text-xs text-gray-400">{offer.candidateEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        Rp {Number(offer.offeredSalary).toLocaleString("id-ID")}/mo
                      </div>
                      {offer.allowanceAmount && Number(offer.allowanceAmount) > 0 ? (
                        <div className="text-xs text-gray-500">
                          + Allowance: Rp {Number(offer.allowanceAmount).toLocaleString("id-ID")}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-xs space-y-1 text-gray-600">
                      <div>Join: <strong>{offer.joinDate}</strong></div>
                      <div className="text-rose-600">Expires: {offer.expirationDate}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          offer.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : offer.status === "SENT"
                            ? "bg-blue-100 text-blue-800"
                            : offer.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {offer.letterUrl && (
                        <a
                          href={offer.letterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50"
                          title="View Offer Letter"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      )}

                      {offer.status === "DRAFT" && (
                        <button
                          onClick={() => handleStatusChange(offer.id, "SENT", "Offer officially sent to candidate.")}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg"
                        >
                          Send Offer
                        </button>
                      )}

                      {offer.status === "SENT" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(offer.id, "ACCEPTED", "Candidate signed and accepted the offer.")
                            }
                            className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                          >
                            Mark Accepted
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(offer.id, "DECLINED", "Candidate formally declined the offer.")
                            }
                            className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Generate Candidate Job Offer</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Candidate Application *
                </label>
                <select
                  required
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Offered Base Salary (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100000"
                    value={offeredSalary}
                    onChange={(e) => setOfferedSalary(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Allowance Amount (IDR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={allowanceAmount}
                    onChange={(e) => setAllowanceAmount(Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Expected Join Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Offer Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Offer Letter Document URL
                </label>
                <input
                  type="text"
                  value={letterUrl}
                  onChange={(e) => setLetterUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Offer Notes & Special Clauses
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Include details regarding probation period, signing bonus, or equipment allocation..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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
                  {isSubmitting ? "Generating..." : "Generate Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
