"use client";

import { useEffect, useState } from "react";
import { recruitmentApi } from "../api";
import { JobRequisition } from "../types";
import { getDepartments, getPositions } from "@/features/organization/api";
import { DepartmentResponse, PositionResponse } from "@/features/organization/types";
import { Briefcase, Plus, RefreshCw, CheckCircle, Send, X } from "lucide-react";

export function JobRequisitionManager() {
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [deptId, setDeptId] = useState("");
  const [posId, setPosId] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [empType, setEmpType] = useState("PERMANENT");
  const [minSalary, setMinSalary] = useState<number>(10000000);
  const [maxSalary, setMaxSalary] = useState<number>(18000000);
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reqs, depts, pos] = await Promise.all([
        recruitmentApi.getRequisitions(statusFilter !== "ALL" ? statusFilter : undefined),
        getDepartments(),
        getPositions(),
      ]);
      setRequisitions(reqs);
      setDepartments(depts);
      setPositions(pos);
      if (depts.length > 0 && !deptId) setDeptId(depts[0].id);
      if (pos.length > 0 && !posId) setPosId(pos[0].id);
    } catch (err: any) {
      setError(err?.message || "Failed to load job requisitions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recruitmentApi.createRequisition({
        title,
        departmentId: deptId || undefined,
        positionId: posId || undefined,
        headcount: Number(headcount),
        employmentType: empType,
        minSalary: Number(minSalary),
        maxSalary: Number(maxSalary),
        justification,
      });
      setShowModal(false);
      setTitle("");
      setJustification("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitApproval = async (id: string) => {
    try {
      await recruitmentApi.submitRequisition(id);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit requisition");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await recruitmentApi.approveRequisition(id);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to approve requisition");
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Job Requisitions
          </h1>
          <p className="text-sm text-gray-500">
            Create, track, and approve headcount requisition requests across organization units
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Requisition
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Filter Status:</span>
        {["ALL", "DRAFT", "PENDING_APPROVAL", "APPROVED", "CLOSED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusFilter === st ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
            <tr>
              <th className="py-3.5 px-4">Req Number</th>
              <th className="py-3.5 px-4">Job Title</th>
              <th className="py-3.5 px-4">Department / Role</th>
              <th className="py-3.5 px-4">Headcount</th>
              <th className="py-3.5 px-4">Salary Range</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requisitions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No job requisitions found.
                </td>
              </tr>
            ) : (
              requisitions.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-mono font-medium text-gray-900">{r.requisitionNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{r.title}</td>
                  <td className="py-3.5 px-4">
                    <div className="text-gray-900 font-medium">{r.departmentName || "General"}</div>
                    <div className="text-xs text-gray-500">{r.positionTitle}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                      {r.headcount} {r.employmentType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-gray-700">
                    {formatCurrency(r.minSalary)} - {formatCurrency(r.maxSalary)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : r.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "DRAFT"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.status === "DRAFT" && (
                        <button
                          onClick={() => handleSubmitApproval(r.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Submit
                        </button>
                      )}
                      {(r.status === "PENDING_APPROVAL" || r.status === "DRAFT") && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Requisition Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create Headcount Requisition</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Requisition Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Position</label>
                  <select
                    value={posId}
                    onChange={(e) => setPosId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Headcount</label>
                  <input
                    type="number"
                    min={1}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={empType}
                    onChange={(e) => setEmpType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="PERMANENT">Permanent</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Salary (IDR)</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Salary (IDR)</label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Justification</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  placeholder="Explain why this position is needed..."
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  {isSubmitting ? "Creating..." : "Create Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
