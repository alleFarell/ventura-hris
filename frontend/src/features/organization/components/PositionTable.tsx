"use client";

import { useState } from "react";
import {
  DepartmentResponse,
  GradeResponse,
  JobLevelResponse,
  OrganizationUnitResponse,
  PositionResponse,
} from "../types";
import { deletePosition } from "../api";
import { PositionModal } from "./PositionModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";

type PositionTableProps = {
  companyId: string;
  positions: PositionResponse[];
  departments: DepartmentResponse[];
  grades: GradeResponse[];
  jobLevels: JobLevelResponse[];
  allUnits: OrganizationUnitResponse[];
  onRefresh: () => void;
};

export function PositionTable({
  companyId,
  positions,
  departments,
  grades,
  jobLevels,
  allUnits,
  onRefresh,
}: PositionTableProps) {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionResponse | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<PositionResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedPosition(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (pos: PositionResponse) => {
    setSelectedPosition(pos);
    setModalOpen(true);
  };

  const handleOpenDelete = (pos: PositionResponse) => {
    setPositionToDelete(pos);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!positionToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePosition(positionToDelete.id);
      setDeleteModalOpen(false);
      setPositionToDelete(null);
      onRefresh();
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete position role."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Positions & Roles</h3>
          <p className="text-xs text-slate-500">Manage job roles, department mappings, and salary grades</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Position
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Briefcase className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs text-slate-500">No positions configured yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4">CODE</th>
                <th className="py-2.5 px-4">POSITION TITLE</th>
                <th className="py-2.5 px-4">DEPARTMENT / DIVISION</th>
                <th className="py-2.5 px-4">GRADE / LEVEL</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{pos.code}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{pos.name}</td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div>{pos.departmentName || "-"}</div>
                    {pos.divisionName && (
                      <div className="text-[11px] text-slate-400">↳ {pos.divisionName}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {pos.gradeName && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          {pos.gradeName}
                        </span>
                      )}
                      {pos.jobLevelName && (
                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                          {pos.jobLevelName}
                        </span>
                      )}
                      {!pos.gradeName && !pos.jobLevelName && "-"}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        pos.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {pos.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(pos)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Edit Position"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(pos)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Standard Position Modal (Create / Edit) */}
      <PositionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onRefresh}
        companyId={companyId}
        position={selectedPosition}
        departments={departments}
        grades={grades}
        jobLevels={jobLevels}
        allUnits={allUnits}
      />

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Position Role"
        itemName={positionToDelete ? `${positionToDelete.name} (${positionToDelete.code})` : undefined}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
