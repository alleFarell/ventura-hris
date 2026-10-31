"use client";

import { useState } from "react";
import {
  DepartmentResponse,
  DivisionResponse,
  OrganizationUnitResponse,
} from "../types";
import {
  deleteDepartment,
  deleteDivision,
  getDivisions,
} from "../api";
import { DepartmentModal } from "./DepartmentModal";
import { DivisionModal } from "./DivisionModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  GitFork,
} from "lucide-react";

type DepartmentTableProps = {
  companyId: string;
  departments: DepartmentResponse[];
  allUnits: OrganizationUnitResponse[];
  onRefresh: () => void;
};

export function DepartmentTable({
  companyId,
  departments,
  allUnits,
  onRefresh,
}: DepartmentTableProps) {
  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentResponse | null>(null);

  // Division Modal State
  const [divModalOpen, setDivModalOpen] = useState(false);
  const [targetDeptForDiv, setTargetDeptForDiv] = useState<DepartmentResponse | null>(null);
  const [selectedDiv, setSelectedDiv] = useState<DivisionResponse | null>(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "department" | "division";
    deptId?: string;
    divId?: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Expanded departments & divisions cache
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [divisionsByDept, setDivisionsByDept] = useState<Record<string, DivisionResponse[]>>({});
  const [loadingDivisions, setLoadingDivisions] = useState<Record<string, boolean>>({});

  const toggleExpand = async (deptId: string) => {
    if (expandedDeptId === deptId) {
      setExpandedDeptId(null);
      return;
    }

    setExpandedDeptId(deptId);
    if (!divisionsByDept[deptId]) {
      setLoadingDivisions((prev) => ({ ...prev, [deptId]: true }));
      try {
        const divs = await getDivisions(companyId, deptId);
        setDivisionsByDept((prev) => ({ ...prev, [deptId]: divs }));
      } catch (err: any) {
        console.error("Failed to load divisions", err);
      } finally {
        setLoadingDivisions((prev) => ({ ...prev, [deptId]: false }));
      }
    }
  };

  const refreshDivisions = async (deptId: string) => {
    try {
      const divs = await getDivisions(companyId, deptId);
      setDivisionsByDept((prev) => ({ ...prev, [deptId]: divs }));
    } catch (err) {
      console.error("Failed to refresh divisions", err);
    }
  };

  // Open Handlers
  const handleOpenCreateDept = () => {
    setSelectedDept(null);
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: DepartmentResponse) => {
    setSelectedDept(dept);
    setDeptModalOpen(true);
  };

  const handleOpenDeleteDept = (dept: DepartmentResponse) => {
    setDeleteTarget({
      type: "department",
      deptId: dept.id,
      name: `${dept.name} (${dept.code})`,
    });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleOpenCreateDiv = (dept: DepartmentResponse) => {
    setTargetDeptForDiv(dept);
    setSelectedDiv(null);
    setDivModalOpen(true);
  };

  const handleOpenEditDiv = (dept: DepartmentResponse, div: DivisionResponse) => {
    setTargetDeptForDiv(dept);
    setSelectedDiv(div);
    setDivModalOpen(true);
  };

  const handleOpenDeleteDiv = (dept: DepartmentResponse, div: DivisionResponse) => {
    setDeleteTarget({
      type: "division",
      deptId: dept.id,
      divId: div.id,
      name: `${div.name} (${div.code})`,
    });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      if (deleteTarget.type === "department" && deleteTarget.deptId) {
        await deleteDepartment(deleteTarget.deptId);
        onRefresh();
      } else if (deleteTarget.type === "division" && deleteTarget.divId && deleteTarget.deptId) {
        await deleteDivision(deleteTarget.divId);
        await refreshDivisions(deleteTarget.deptId);
        onRefresh();
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to delete ${deleteTarget.type}.`
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Departments & Divisions</h3>
          <p className="text-xs text-slate-500">Manage company business units and operational divisions</p>
        </div>
        <button
          onClick={handleOpenCreateDept}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Building2 className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs text-slate-500">No departments added yet for this company.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4 w-8"></th>
                <th className="py-2.5 px-4">CODE</th>
                <th className="py-2.5 px-4">NAME</th>
                <th className="py-2.5 px-4">DESCRIPTION</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => {
                const isExpanded = expandedDeptId === dept.id;
                const divs = divisionsByDept[dept.id] || [];
                const isDivLoading = loadingDivisions[dept.id];

                return (
                  <tr key={dept.id} className="group hover:bg-slate-50/60">
                    <td colSpan={6} className="p-0">
                      <div className="flex items-center py-2.5 px-4">
                        <button
                          onClick={() => toggleExpand(dept.id)}
                          className="mr-3 flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title={isExpanded ? "Collapse divisions" : "Expand divisions"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <div className="w-24 font-mono font-bold text-slate-900">{dept.code}</div>
                        <div className="w-56 font-semibold text-slate-800">{dept.name}</div>
                        <div className="flex-1 text-slate-500 truncate pr-4">
                          {dept.description || "-"}
                        </div>
                        <div className="w-24">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              dept.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {dept.status}
                          </span>
                        </div>
                        <div className="w-44 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCreateDiv(dept)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                            title="Add sub-division"
                          >
                            <Plus className="h-3 w-3" />
                            Division
                          </button>
                          <button
                            onClick={() => handleOpenEditDept(dept)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                            title="Edit department"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDept(dept)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete department"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Division sub-list */}
                      {isExpanded && (
                        <div className="bg-slate-50/70 border-t border-slate-100 px-12 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
                              <GitFork className="h-3.5 w-3.5 text-indigo-500" />
                              Divisions under {dept.name}
                            </span>
                            <button
                              onClick={() => handleOpenCreateDiv(dept)}
                              className="text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              + Add Division
                            </button>
                          </div>

                          {isDivLoading ? (
                            <div className="py-2 text-[11px] text-slate-400">Loading divisions...</div>
                          ) : divs.length === 0 ? (
                            <div className="py-2 text-[11px] text-slate-400 italic">
                              No divisions configured in this department.
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {divs.map((div) => (
                                <div
                                  key={div.id}
                                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-indigo-600">{div.code}</span>
                                    <span className="font-medium text-slate-800">{div.name}</span>
                                    <span
                                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                        div.status === "ACTIVE"
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {div.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditDiv(dept, div)}
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                      title="Edit Division"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenDeleteDiv(dept, div)}
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                      title="Delete Division"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Standard Department Modal (Create / Edit) */}
      <DepartmentModal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onSuccess={onRefresh}
        companyId={companyId}
        department={selectedDept}
        allUnits={allUnits}
      />

      {/* Standard Division Modal (Create / Edit) */}
      {targetDeptForDiv && (
        <DivisionModal
          isOpen={divModalOpen}
          onClose={() => setDivModalOpen(false)}
          onSuccess={async () => {
            if (targetDeptForDiv) {
              await refreshDivisions(targetDeptForDiv.id);
            }
            onRefresh();
          }}
          companyId={companyId}
          departmentId={targetDeptForDiv.id}
          departmentName={targetDeptForDiv.name}
          division={selectedDiv}
        />
      )}

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === "department" ? "Delete Department" : "Delete Division"}
        itemName={deleteTarget?.name}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
