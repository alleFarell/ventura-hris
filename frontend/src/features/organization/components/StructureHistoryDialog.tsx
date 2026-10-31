"use client";

import { useEffect, useState } from "react";
import { StructureHistoryResponse } from "../types";
import { getUnitHistory } from "../api";
import { History, Loader2, X, ArrowRight } from "lucide-react";

type StructureHistoryDialogProps = {
  unitId: string;
  unitName: string;
  onClose: () => void;
};

export function StructureHistoryDialog({ unitId, unitName, onClose }: StructureHistoryDialogProps) {
  const [history, setHistory] = useState<StructureHistoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getUnitHistory(unitId)
      .then((data) => {
        if (mounted) setHistory(data);
      })
      .catch((err: any) => {
        if (mounted) setError(err.response?.data?.error?.message || err.message || "Failed to load history");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [unitId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Structure Change History</h3>
              <p className="text-xs text-slate-500">Audit logs for {unitName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs">Loading change logs...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No structural change records recorded for this unit.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs transition hover:bg-slate-100/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Effective: {record.effectiveDate}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Recorded: {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-slate-600">
                    <span className="rounded bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
                      {record.oldParentUnitName || "(Root)"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                      {record.newParentUnitName || "(Root)"}
                    </span>
                  </div>

                  {record.reason && (
                    <p className="mt-2 text-slate-500 italic">"{record.reason}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
