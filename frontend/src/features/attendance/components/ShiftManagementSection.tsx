"use client";

import React, { useEffect, useState } from "react";
import { getShifts, createShift, updateShift, deleteShift, getShiftPatterns } from "../api";
import { Shift, ShiftPattern, CreateShiftPayload } from "../types";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Clock, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

export function ShiftManagementSection() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateShiftPayload>({
    code: "",
    name: "",
    description: "",
    startTime: "08:00:00",
    endTime: "17:00:00",
    breakMinutes: 60,
    gracePeriodMinutes: 15,
    isOvernight: false,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftList, patternList] = await Promise.all([getShifts(), getShiftPatterns()]);
      setShifts(shiftList);
      setPatterns(patternList);
    } catch (err) {
      console.error("Failed to load shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setEditingShift(null);
    setFormError(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      startTime: "08:00:00",
      endTime: "17:00:00",
      breakMinutes: 60,
      gracePeriodMinutes: 15,
      isOvernight: false,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (s: Shift) => {
    setEditingShift(s);
    setFormError(null);
    setFormData({
      code: s.code,
      name: s.name,
      description: s.description ?? "",
      startTime: s.startTime,
      endTime: s.endTime,
      breakMinutes: s.breakMinutes,
      gracePeriodMinutes: s.gracePeriodMinutes,
      isOvernight: s.isOvernight,
      isActive: s.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingShift) {
        await updateShift(editingShift.id, formData);
      } else {
        await createShift(formData);
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || "Failed to save shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (s: Shift) => {
    setShiftToDelete(s);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteShift(shiftToDelete.id);
      setDeleteModalOpen(false);
      setShiftToDelete(null);
      loadData();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error?.message || err.message || "Failed to delete shift");
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
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
              Work Schedules
            </span>
            <span className="text-xs text-slate-400">Time & Attendance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Shift Configuration & Patterns</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage working hours, grace periods, overnight shifts, and cyclical patterns.
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Shift
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading shift schedule definitions...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Shift Code</th>
                <th className="px-5 py-3">Name & Description</th>
                <th className="px-5 py-3">Work Hours</th>
                <th className="px-5 py-3">Break</th>
                <th className="px-5 py-3">Grace Period</th>
                <th className="px-5 py-3">Flags</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-blue-600">{s.code}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    {s.description && <div className="text-[11px] text-slate-400 font-normal">{s.description}</div>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">{s.breakMinutes} mins</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">{s.gracePeriodMinutes} mins</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {s.isOvernight && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                          Overnight
                        </span>
                      )}
                      {s.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditDialog(s)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit Shift"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(s)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Shift"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400 italic">
                    No shifts defined yet. Click "Add Shift" to create your first schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cyclical Patterns Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configured Shift Patterns</h3>
        <p className="text-xs text-slate-500">Reusable cyclic schedules applied to roster assignments</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((p) => (
            <div key={p.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{p.code} ({p.cycleDays} days cycle)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">Pattern</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 font-mono bg-white p-2 rounded border border-slate-200">{p.patternSequence}</p>
            </div>
          ))}
          {patterns.length === 0 && (
            <p className="text-xs text-slate-400 italic col-span-2">No shift patterns configured.</p>
          )}
        </div>
      </div>

      {/* Standard Shift Modal Dialog */}
      <Modal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingShift ? "Edit Shift" : "Create New Shift"}
        subtitle="Configure daily work schedule, break periods, and grace allowances"
        icon={<Clock className="h-5 w-5 text-blue-600" />}
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
            <label className="block font-semibold text-slate-700 mb-1">Shift Code <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              disabled={Boolean(editingShift)}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SH_REG_0817"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shift Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Standard Office Shift"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time <span className="text-rose-500">*</span></label>
              <input
                type="time"
                step="1"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value.length === 5 ? e.target.value + ":00" : e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time <span className="text-rose-500">*</span></label>
              <input
                type="time"
                step="1"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value.length === 5 ? e.target.value + ":00" : e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Break (Minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.breakMinutes}
                onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOvernight}
                onChange={(e) => setFormData({ ...formData, isOvernight: e.target.checked })}
                className="rounded text-blue-600 focus:ring-0"
              />
              Overnight Shift
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600 focus:ring-0"
              />
              Active
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
              {submitting ? "Saving..." : editingShift ? "Save Changes" : "Create Shift"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Work Shift"
        itemName={shiftToDelete?.name}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
