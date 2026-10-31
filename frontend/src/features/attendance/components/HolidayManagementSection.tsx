"use client";

import React, { useEffect, useState } from "react";
import { getHolidays, createHoliday, deleteHoliday } from "../api";
import { CompanyHoliday, CreateHolidayPayload } from "../types";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Calendar, Plus, Trash2, AlertCircle } from "lucide-react";

export function HolidayManagementSection() {
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<CompanyHoliday | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateHolidayPayload>({
    holidayDate: new Date().toISOString().slice(0, 10),
    name: "",
    description: "",
    isMandatory: true,
  });

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (err) {
      console.error("Failed to load holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleOpenCreate = () => {
    setFormError(null);
    setFormData({
      holidayDate: new Date().toISOString().slice(0, 10),
      name: "",
      description: "",
      isMandatory: true,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createHoliday(formData);
      setDialogOpen(false);
      loadHolidays();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || "Failed to create holiday");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (h: CompanyHoliday) => {
    setHolidayToDelete(h);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteHoliday(holidayToDelete.id);
      setDeleteModalOpen(false);
      setHolidayToDelete(null);
      loadHolidays();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error?.message || err.message || "Failed to delete holiday");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
              Calendar Days
            </span>
            <span className="text-xs text-slate-400">Non-working Observances</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Company & National Holidays</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company-wide and national non-working calendar days and leave adjustments.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Holiday
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading holiday calendar...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Holiday Name</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Observance Type</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                    {h.holidayDate}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-900">{h.name}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{h.description || "-"}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {h.isMandatory ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                        Mandatory
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleOpenDelete(h)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 ml-auto transition"
                      title="Delete Holiday"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400 italic">
                    No holidays registered yet. Click "Add Holiday" to register your first calendar entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Standard Holiday Modal */}
      <Modal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Holiday"
        subtitle="Register a statutory or company-designated non-working day"
        icon={<Calendar className="h-5 w-5 text-rose-600" />}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Holiday Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.holidayDate}
              onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Holiday Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eid al-Fitr, Independence Day"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Context or notes..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="rounded text-blue-600 focus:ring-0"
              />
              Mandatory National / Statutory Observance
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-2xs hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : "Save Holiday"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Holiday"
        itemName={holidayToDelete?.name}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
