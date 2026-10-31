"use client";

import { useEffect, useState } from "react";
import { payrollApi } from "../api";
import { BenefitPlan, EmployeeBenefitClaim } from "../types";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { HeartHandshake, Plus, RefreshCw, CheckCircle, XCircle, FileText, X } from "lucide-react";

export function BenefitManager() {
  const [activeTab, setActiveTab] = useState<"claims" | "plans">("claims");
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [claims, setClaims] = useState<EmployeeBenefitClaim[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Plan creation modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planCode, setPlanCode] = useState("");
  const [planName, setPlanName] = useState("");
  const [planCategory, setPlanCategory] = useState("HEALTH_INSURANCE");
  const [planAnnualLimit, setPlanAnnualLimit] = useState<number>(5000000);
  const [planDescription, setPlanDescription] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Claim submission modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimEmpId, setClaimEmpId] = useState("");
  const [claimPlanId, setClaimPlanId] = useState("");
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split("T")[0]);
  const [claimAmount, setClaimAmount] = useState<number>(500000);
  const [claimDescription, setClaimDescription] = useState("");
  const [claimReceiptUrl, setClaimReceiptUrl] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Reject modal
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [plansData, claimsData, empsData] = await Promise.all([
        payrollApi.getBenefitPlans(),
        payrollApi.getBenefitClaims(),
        getEmployees(),
      ]);
      setPlans(plansData);
      setClaims(claimsData);
      setEmployees(empsData);
      if (empsData.length > 0 && !claimEmpId) setClaimEmpId(empsData[0].id);
      if (plansData.length > 0 && !claimPlanId) setClaimPlanId(plansData[0].id);
    } catch (err: any) {
      setError(err?.message || "Failed to load benefit data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    try {
      await payrollApi.createBenefitPlan({
        code: planCode,
        name: planName,
        category: planCategory,
        annualLimit: Number(planAnnualLimit),
        description: planDescription,
        isActive: true,
      });
      setShowPlanModal(false);
      setPlanCode("");
      setPlanName("");
      setPlanDescription("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create plan");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClaim(true);
    try {
      await payrollApi.submitBenefitClaim({
        employeeId: claimEmpId,
        benefitPlanId: claimPlanId,
        claimDate,
        amount: Number(claimAmount),
        description: claimDescription,
        receiptUrl: claimReceiptUrl || undefined,
      });
      setShowClaimModal(false);
      setClaimDescription("");
      setClaimReceiptUrl("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit claim");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleApproveClaim = async (id: string) => {
    try {
      await payrollApi.updateBenefitClaimStatus(id, { status: "APPROVED" });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to approve claim");
    }
  };

  const handleRejectClaim = async () => {
    if (!rejectingClaimId) return;
    try {
      await payrollApi.updateBenefitClaimStatus(rejectingClaimId, {
        status: "REJECTED",
        rejectionReason,
      });
      setRejectingClaimId(null);
      setRejectionReason("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to reject claim");
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const filteredClaims = claims.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-600" />
            Corporate Benefits & Healthcare Plans
          </h1>
          <p className="text-sm text-gray-500">
            Administer supplementary employee benefit programs, annual limits, and reimbursement claims
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
          {activeTab === "plans" ? (
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              New Benefit Plan
            </button>
          ) : (
            <button
              onClick={() => setShowClaimModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Submit Claim
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab("claims")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "claims"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Claims Administration ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "plans"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Benefit Plans ({plans.length})
        </button>
      </div>

      {/* TAB 1: Claims */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status Filter:</span>
            {["ALL", "SUBMITTED", "APPROVED", "REJECTED", "PAID"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusFilter === st ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                <tr>
                  <th className="py-3.5 px-4">Claim Number</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Benefit Plan</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No benefit claims found.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-mono font-medium text-gray-900">
                        {c.claimNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{c.employeeName}</div>
                        <div className="text-xs text-gray-500">{c.employeeNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                          {c.benefitPlanName} ({c.benefitPlanCategory})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{c.claimDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 font-mono">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : c.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : c.status === "PAID"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status === "SUBMITTED" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveClaim(c.id)}
                              className="text-xs text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingClaimId(c.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 mb-1">
                    {p.code}
                  </span>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {p.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{p.description || "No description provided."}</p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Annual Limit:</span>
                <span className="text-sm font-bold text-gray-900 font-mono">{formatCurrency(p.annualLimit)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Benefit Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Plan Code</label>
                <input
                  type="text"
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  placeholder="e.g. OPTICAL-01"
                  className="w-full px-3 py-2 border rounded-lg text-sm uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Annual Optical & Vision Support"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={planCategory}
                  onChange={(e) => setPlanCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="HEALTH_INSURANCE">Health Insurance</option>
                  <option value="DENTAL">Dental</option>
                  <option value="OPTICAL">Optical / Vision</option>
                  <option value="WELLNESS">Wellness & Fitness</option>
                  <option value="TRANSPORT">Transport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Annual Limit (IDR)</label>
                <input
                  type="number"
                  value={planAnnualLimit}
                  onChange={(e) => setPlanAnnualLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  {isSavingPlan ? "Saving..." : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Submit Benefit Claim</h3>
              <button onClick={() => setShowClaimModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={claimEmpId}
                  onChange={(e) => setClaimEmpId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeNumber} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Benefit Plan</label>
                <select
                  value={claimPlanId}
                  onChange={(e) => setClaimPlanId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.annualLimit)} max)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Claim Date</label>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Claim Amount (IDR)</label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description / Treatment Details</label>
                <textarea
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
                >
                  {isSubmittingClaim ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingClaimId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Reject Benefit Claim</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Specify rejection rationale..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingClaimId(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectClaim}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
