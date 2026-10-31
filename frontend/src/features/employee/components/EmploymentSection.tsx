"use client";

import { useEffect, useState } from "react";
import {
  ContractPayload,
  ContractResponse,
  ContractType,
  EmployeeSummaryResponse,
  StatusHistoryResponse,
} from "../types";
import {
  createContract,
  getContracts,
  getStatusHistory,
} from "../api";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  History,
  Layers,
  Award,
} from "lucide-react";

type EmploymentSectionProps = {
  employee: EmployeeSummaryResponse;
  onRefreshEmployee: () => void;
};

export function EmploymentSection({
  employee,
  onRefreshEmployee,
}: EmploymentSectionProps) {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // New contract modal
  const [showAddContract, setShowAddContract] = useState(false);
  const [contractType, setContractType] = useState<ContractType>("PERMANENT");
  const [startDate, setStartDate] = useState(
    employee.hireDate || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [contractStatus, setContractStatus] = useState("ACTIVE");
  const [savingContract, setSavingContract] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, hList] = await Promise.all([
        getContracts(employee.id),
        getStatusHistory(employee.id),
      ]);
      setContracts(cList);
      setStatusHistory(hList);
    } catch (err) {
      console.error("Failed to load employment details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employee.id]);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setContractError(null);
    setSavingContract(true);

    try {
      const payload: ContractPayload = {
        contractType,
        startDate,
        endDate: endDate || undefined,
        status: contractStatus,
      };

      await createContract(employee.id, payload);
      setShowAddContract(false);
      setEndDate("");
      await loadData();
    } catch (err: any) {
      setContractError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to create contract"
      );
    } finally {
      setSavingContract(false);
    }
  };

  const formatContractType = (type: ContractType) => {
    switch (type) {
      case "PERMANENT":
        return "Permanent (PKWTT)";
      case "FIXED_TERM":
        return "Fixed Term (PKWT)";
      case "INTERNSHIP":
        return "Internship / Trainee";
      case "CONSULTANT":
        return "Independent Consultant";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. Organizational Assignment Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Organizational Assignment</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Company</span>
            <span className="font-semibold text-slate-800">{employee.companyName}</span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Branch</span>
            <span className="font-semibold text-slate-800">{employee.branchName}</span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Department</span>
            <span className="font-semibold text-slate-800">
              {employee.departmentName || "Unassigned"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Division</span>
            <span className="font-semibold text-slate-800">
              {employee.divisionName || "Unassigned"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Position / Role</span>
            <span className="font-semibold text-slate-800">
              {employee.positionName || "Unassigned"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Salary Grade</span>
            <span className="font-semibold text-slate-800">
              {employee.gradeName || "Unassigned"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Job Level</span>
            <span className="font-semibold text-slate-800">
              {employee.jobLevelName || "Unassigned"}
            </span>
          </div>

          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <span className="block text-slate-400 font-medium text-[11px]">Hire Date</span>
            <span className="font-semibold text-slate-800">
              {employee.hireDate || "Unset"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Employment Contracts */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employment Contracts</h3>
              <p className="text-[11px] text-slate-500">
                Track contract history, validity periods, and PKWT/PKWTT status
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setContractError(null);
              setShowAddContract(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Contract
          </button>
        </div>

        {/* Add Contract Modal */}
        {showAddContract && (
          <div className="border-b border-slate-100 bg-blue-50/30 p-6">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Add Contract Period</h4>
            {contractError && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{contractError}</span>
              </div>
            )}
            <form onSubmit={handleCreateContract} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contract Type *
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="PERMANENT">Permanent (PKWTT)</option>
                    <option value="FIXED_TERM">Fixed Term (PKWT)</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONSULTANT">Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date (Optional for Permanent)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContract(false)}
                  className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-200/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContract}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {savingContract && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No employment contracts registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                  <th className="py-2.5 px-6">CONTRACT TYPE</th>
                  <th className="py-2.5 px-6">START DATE</th>
                  <th className="py-2.5 px-6">END DATE</th>
                  <th className="py-2.5 px-6">STATUS</th>
                  <th className="py-2.5 px-6">REGISTERED ON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-semibold text-slate-800">
                      {formatContractType(c.contractType)}
                    </td>
                    <td className="py-3 px-6 text-slate-600">{c.startDate}</td>
                    <td className="py-3 px-6 text-slate-600">
                      {c.endDate || <span className="text-slate-400 italic">Ongoing (Indefinite)</span>}
                    </td>
                    <td className="py-3 px-6">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-400">
                      {c.createdAt ? c.createdAt.split("T")[0] : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Status Change Audit History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
          <History className="h-4 w-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Employment Status History</h3>
            <p className="text-[11px] text-slate-500">
              Immutable audit trail of employment lifecycle transitions
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading history...</div>
        ) : statusHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No status change events recorded.
          </div>
        ) : (
          <div className="p-6">
            <div className="relative border-l border-slate-200 ml-4 space-y-6">
              {statusHistory.map((hist) => (
                <div key={hist.id} className="relative pl-6">
                  <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      {hist.oldStatus ? (
                        <>
                          <span className="font-semibold text-slate-500 line-through">
                            {hist.oldStatus}
                          </span>
                          <span className="text-slate-400">&rarr;</span>
                        </>
                      ) : (
                        <span className="text-slate-500 font-medium">Initial Status:</span>
                      )}
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-200">
                        {hist.newStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Effective: <strong>{hist.effectiveDate}</strong> • Recorded:{" "}
                      {hist.createdAt ? hist.createdAt.split("T")[0] : ""}
                    </span>
                  </div>
                  {hist.reason && (
                    <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                      {hist.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
