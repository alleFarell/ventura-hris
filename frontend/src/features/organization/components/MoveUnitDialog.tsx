"use client";

import { useState } from "react";
import { MoveOrganizationUnitPayload, OrganizationUnitResponse } from "../types";
import { moveUnitParent } from "../api";
import { AlertCircle, ArrowRight, Loader2, X } from "lucide-react";

type MoveUnitDialogProps = {
  unit: OrganizationUnitResponse | { id: string; name: string; code: string; parentUnitId?: string; parentUnitName?: string };
  allUnits: OrganizationUnitResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

export function MoveUnitDialog({ unit, allUnits, onClose, onSuccess }: MoveUnitDialogProps) {
  const [newParentId, setNewParentId] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out the unit itself from target parents
  const availableParents = allUnits.filter((u) => u.id !== unit.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: MoveOrganizationUnitPayload = {
        newParentUnitId: newParentId ? newParentId : undefined,
        effectiveDate,
        reason: reason.trim() ? reason.trim() : undefined,
      };

      await moveUnitParent(unit.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "Failed to move unit";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Re-parent Organization Unit</h3>
            <p className="text-xs text-slate-500">Move unit within hierarchy with audit tracking</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs">
            <span className="text-slate-500">Target Unit:</span>{" "}
            <span className="font-semibold text-slate-800">
              {unit.name} ({unit.code})
            </span>
            {unit.parentUnitName && (
              <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                <span>Current Parent:</span>
                <span className="font-medium text-slate-700">{unit.parentUnitName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Parent Unit (Leave empty to make root node)
            </label>
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">(None - Make Root Node)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  [{parent.unitType}] {parent.name} ({parent.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Effective Date *
            </label>
            <input
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
            </input>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              placeholder="E.g., Department reorganization Q4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
