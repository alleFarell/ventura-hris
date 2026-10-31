"use client";

import { useEffect, useState } from "react";
import { offboardingApi } from "../api";
import { OffboardingCase, OffboardingChecklist } from "../types";
import { CheckCircle2, Clock, ShieldCheck, RefreshCw, X, Check, Laptop, DollarSign, Building, AlertCircle } from "lucide-react";

export function ClearanceChecklistManager() {
  const [cases, setCases] = useState<OffboardingCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [checklists, setChecklists] = useState<OffboardingChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear Item Modal
  const [itemToClear, setItemToClear] = useState<OffboardingChecklist | null>(null);
  const [clearedBy, setClearedBy] = useState("");
  const [clearNotes, setClearNotes] = useState("");
  const [isSubmittingClear, setIsSubmittingClear] = useState(false);

  const loadCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const caseList = await offboardingApi.getCases();
      setCases(caseList);
      if (caseList.length > 0 && !selectedCaseId) {
        setSelectedCaseId(caseList[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load offboarding cases");
    } finally {
      setIsLoading(false);
    }
  };

  const loadChecklists = async (caseId: string) => {
    if (!caseId) {
      setChecklists([]);
      return;
    }
    try {
      const list = await offboardingApi.getChecklists(caseId);
      setChecklists(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load checklists");
    }
  };

  const loadData = async () => {
    await loadCases();
    if (selectedCaseId) {
      await loadChecklists(selectedCaseId);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadChecklists(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleClearItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToClear || !clearedBy) return;
    setIsSubmittingClear(true);
    try {
      await offboardingApi.clearItem(itemToClear.id, {
        clearedBy,
        notes: clearNotes || undefined,
      });
      setItemToClear(null);
      setClearNotes("");
      if (selectedCaseId) {
        await loadChecklists(selectedCaseId);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to clear item");
    } finally {
      setIsSubmittingClear(false);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const totalItems = checklists.length;
  const clearedCount = checklists.filter((i) => i.isCleared).length;
  const percentComplete = totalItems > 0 ? Math.round((clearedCount / totalItems) * 100) : 0;

  // Group by department
  const departments = ["IT", "ASSETS", "FINANCE", "HR"];

  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case "IT": return <Laptop className="w-4 h-4 text-blue-500" />;
      case "ASSETS": return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case "FINANCE": return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case "HR": return <Building className="w-4 h-4 text-amber-500" />;
      default: return <ShieldCheck className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cross-Departmental Clearance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Department sign-offs for IT revocation, asset recovery, loan settlement, and HR release.
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
        </div>
      </div>

      {/* Case Selector & Progress Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex-1 max-w-md">
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

          {selectedCase && (
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <div className="text-xs text-gray-500">Overall Progress</div>
                <div className="text-xl font-bold text-gray-900">{clearedCount} / {totalItems} Items</div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${percentComplete === 100 ? "bg-green-500" : "bg-indigo-600"}`}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                selectedCase.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}>
                {selectedCase.status}
              </span>
            </div>
          )}
        </div>

        {selectedCase?.status === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="text-xs">
              <strong>Clearance Completed:</strong> All departmental tasks have been signed off.
              Employee record has been automatically set to <strong>TERMINATED</strong> status.
            </div>
          </div>
        )}
      </div>

      {/* Grouped Checklist */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading checklist items...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => {
            const items = checklists.filter((i) => i.departmentName === dept);
            const deptCleared = items.filter((i) => i.isCleared).length;
            return (
              <div key={dept} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    {getDeptIcon(dept)}
                    <h3 className="font-bold text-gray-900 text-sm tracking-wide">{dept} Clearance</h3>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {deptCleared} / {items.length} Cleared
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-colors ${
                        item.isCleared
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.isCleared ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span className={`text-xs font-medium ${item.isCleared ? "text-emerald-900 line-through" : "text-gray-900"}`}>
                            {item.itemName}
                          </span>
                        </div>
                        {item.isCleared && (
                          <div className="text-[11px] text-gray-500 ml-6">
                            Cleared by: <strong>{item.clearedBy}</strong>
                            {item.notes && <span> &bull; &ldquo;{item.notes}&rdquo;</span>}
                          </div>
                        )}
                      </div>

                      {!item.isCleared && (
                        <button
                          onClick={() => {
                            setItemToClear(item);
                            setClearedBy("hr.officer@ventura.com");
                          }}
                          className="shrink-0 flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold shadow-xs"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          Clear
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Item Modal */}
      {itemToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Sign Off Clearance Item</h2>
              <button
                onClick={() => setItemToClear(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClearItem} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div className="text-gray-500 uppercase font-semibold text-[10px]">{itemToClear.departmentName} Clearance</div>
                <div className="font-bold text-gray-900 mt-1">{itemToClear.itemName}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clearing Officer / Signatory *</label>
                <input
                  type="text"
                  value={clearedBy}
                  onChange={(e) => setClearedBy(e.target.value)}
                  placeholder="e.g. it.support@ventura.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Clearance Notes / Voucher Ref</label>
                <textarea
                  rows={2}
                  value={clearNotes}
                  onChange={(e) => setClearNotes(e.target.value)}
                  placeholder="Verification details, ticket numbers, settlement notes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setItemToClear(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClear}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSubmittingClear ? "Signing Off..." : "Confirm Sign-Off"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
