"use client";

import { useEffect, useState } from "react";
import { assetApi } from "../api";
import { CompanyAsset, AssetAllocation } from "../types";
import { Laptop, Plus, RefreshCw, X, RotateCcw, CheckCircle2, User, Clock } from "lucide-react";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";

export function AssetAllocationManager() {
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [availableAssets, setAvailableAssets] = useState<CompanyAsset[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Allocate Modal
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [assetIdToAllocate, setAssetIdToAllocate] = useState("");
  const [employeeIdToAllocate, setEmployeeIdToAllocate] = useState("");
  const [allocatedDate, setAllocatedDate] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [isSubmittingAllocate, setIsSubmittingAllocate] = useState(false);

  // Return Modal
  const [returningAllocation, setReturningAllocation] = useState<AssetAllocation | null>(null);
  const [returnDate, setReturnDate] = useState("");
  const [conditionGrade, setConditionGrade] = useState("EXCELLENT");
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allocList, assetList, empList] = await Promise.all([
        assetApi.getAllocations(undefined, undefined, filterStatus === "ALL" ? undefined : filterStatus),
        assetApi.getAssets(undefined, undefined, "AVAILABLE"),
        getEmployees(),
      ]);
      setAllocations(allocList);
      setAvailableAssets(assetList);
      setEmployees(empList);

      if (assetList.length > 0 && !assetIdToAllocate) {
        setAssetIdToAllocate(assetList[0].id);
      }
      if (empList.length > 0 && !employeeIdToAllocate) {
        setEmployeeIdToAllocate(empList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load allocations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetIdToAllocate || !employeeIdToAllocate || !allocatedDate) return;
    setIsSubmittingAllocate(true);
    try {
      await assetApi.allocateAsset({
        assetId: assetIdToAllocate,
        employeeId: employeeIdToAllocate,
        allocatedDate,
        handoverNotes: handoverNotes || undefined,
      });
      setShowAllocateModal(false);
      setHandoverNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to allocate asset");
    } finally {
      setIsSubmittingAllocate(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningAllocation || !returnDate) return;
    setIsSubmittingReturn(true);
    try {
      await assetApi.returnAsset(returningAllocation.id, {
        returnDate,
        conditionGrade,
        returnNotes: returnNotes || undefined,
      });
      setReturningAllocation(null);
      setReturnNotes("");
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to process asset return");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Asset Allocations & Handover</h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign company devices to custodians, manage acknowledgments, and process hardware returns.
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
            onClick={() => {
              setAllocatedDate(new Date().toISOString().split("T")[0]);
              setShowAllocateModal(true);
            }}
            disabled={availableAssets.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Allocate Device
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {["ALL", "ACTIVE", "RETURNED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === st
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Allocations Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading allocations...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : allocations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <Laptop className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No asset allocations found</p>
          <p className="text-gray-400 text-sm mt-1">Assign available assets to team members.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Asset</th>
                  <th className="px-6 py-3.5">Custodian Employee</th>
                  <th className="px-6 py-3.5">Allocated Date</th>
                  <th className="px-6 py-3.5">Status & Return Date</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocations.map((al) => (
                  <tr key={al.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="font-mono text-indigo-600 font-bold text-xs">{al.assetTag}</div>
                      <div className="font-bold text-gray-900 text-sm mt-0.5">{al.assetName}</div>
                      <div className="text-gray-400 text-[11px]">{al.assetModel}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>{al.employeeName || "N/A"}</div>
                      <div className="text-gray-400 font-mono text-[10px]">{al.employeeNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {al.allocatedDate}
                    </td>
                    <td className="px-6 py-4">
                      {al.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Clock className="w-3.5 h-3.5" /> In Custody
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                          </span>
                          <div className="text-[11px] text-gray-500 mt-1">on {al.returnDate}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                      {al.returnNotes || al.handoverNotes || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {al.status === "ACTIVE" && (
                        <button
                          onClick={() => {
                            setReturningAllocation(al);
                            setReturnDate(new Date().toISOString().split("T")[0]);
                          }}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Process Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Allocate Device to Custodian</h2>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Available Asset *</label>
                <select
                  value={assetIdToAllocate}
                  onChange={(e) => setAssetIdToAllocate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {availableAssets.map((ast) => (
                    <option key={ast.id} value={ast.id}>
                      [{ast.assetTag}] {ast.name} ({ast.model || "Standard"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Custodian Employee *</label>
                <select
                  value={employeeIdToAllocate}
                  onChange={(e) => setEmployeeIdToAllocate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      [{emp.employeeNumber}] {emp.firstName} {emp.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Allocation / Handover Date *</label>
                <input
                  type="date"
                  value={allocatedDate}
                  onChange={(e) => setAllocatedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Handover Notes / Slip Reference</label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Included accessories, initial condition, handover receipt #..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAllocate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmittingAllocate ? "Allocating..." : "Confirm Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returningAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Process Asset Return</h2>
              <button
                onClick={() => setReturningAllocation(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturn} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div>Device: <strong>[{returningAllocation.assetTag}] {returningAllocation.assetName}</strong></div>
                <div className="mt-1">Returned by: <strong>{returningAllocation.employeeName}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Return Date *</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Updated Condition</label>
                <select
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EXCELLENT">EXCELLENT (Like New)</option>
                  <option value="GOOD">GOOD (Normal Wear & Tear)</option>
                  <option value="FAIR">FAIR (Noticeable Blemishes)</option>
                  <option value="DAMAGED">DAMAGED (Requires Repair)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Inspection & Return Notes</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Device wiped, charger returned, physical inspection results..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReturningAllocation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmittingReturn ? "Processing..." : "Complete Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
