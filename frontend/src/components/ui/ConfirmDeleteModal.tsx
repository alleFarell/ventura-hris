"use client";

import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemName?: string;
  message?: string;
  error?: string | null;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName,
  message,
  error,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title={title}
      maxWidth="md"
      icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}
        <p className="text-sm text-slate-600 leading-relaxed">
          {message || (
            <>
              Are you sure you want to permanently delete{" "}
              {itemName ? (
                <span className="font-semibold text-slate-900">{itemName}</span>
              ) : (
                "this item"
              )}
              ? This action cannot be reversed.
            </>
          )}
        </p>

        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs text-rose-700">
          <span className="font-bold">Warning:</span> Associated assignments, historical records, or linked references may be affected.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-500 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
