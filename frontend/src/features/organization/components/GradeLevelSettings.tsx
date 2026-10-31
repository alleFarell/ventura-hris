"use client";

import { useState } from "react";
import { GradeResponse, JobLevelResponse } from "../types";
import { deleteGrade, deleteJobLevel } from "../api";
import { GradeModal } from "./GradeModal";
import { JobLevelModal } from "./JobLevelModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Layers, Pencil, Plus, Sliders, Trash2 } from "lucide-react";

type GradeLevelSettingsProps = {
  companyId: string;
  grades: GradeResponse[];
  jobLevels: JobLevelResponse[];
  onRefresh: () => void;
};

export function GradeLevelSettings({
  companyId,
  grades,
  jobLevels,
  onRefresh,
}: GradeLevelSettingsProps) {
  // Grade Modal State
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeResponse | null>(null);

  // Job Level Modal State
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JobLevelResponse | null>(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "grade" | "jobLevel";
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Grade Handlers
  const handleOpenCreateGrade = () => {
    setSelectedGrade(null);
    setGradeModalOpen(true);
  };

  const handleOpenEditGrade = (grade: GradeResponse) => {
    setSelectedGrade(grade);
    setGradeModalOpen(true);
  };

  const handleOpenDeleteGrade = (grade: GradeResponse) => {
    setDeleteTarget({
      type: "grade",
      id: grade.id,
      name: `${grade.name} (${grade.code})`,
    });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // Job Level Handlers
  const handleOpenCreateLevel = () => {
    setSelectedLevel(null);
    setLevelModalOpen(true);
  };

  const handleOpenEditLevel = (level: JobLevelResponse) => {
    setSelectedLevel(level);
    setLevelModalOpen(true);
  };

  const handleOpenDeleteLevel = (level: JobLevelResponse) => {
    setDeleteTarget({
      type: "jobLevel",
      id: level.id,
      name: `${level.name} (${level.code})`,
    });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      if (deleteTarget.type === "grade") {
        await deleteGrade(deleteTarget.id);
      } else {
        await deleteJobLevel(deleteTarget.id);
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error?.message ||
          err.message ||
          `Failed to delete ${deleteTarget.type === "grade" ? "salary grade" : "job level"}.`
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= SALARY GRADES ================= */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Salary Grades</h4>
                <p className="text-[11px] text-slate-500">Pay bands with unique numeric sort ordering</p>
              </div>
            </div>
            <button
              onClick={handleOpenCreateGrade}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-600 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Grade
            </button>
          </div>

          {grades.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No grades configured.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {grades.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-2.5 text-xs hover:bg-slate-50/50 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-[11px] font-bold text-amber-700">
                      {g.sortOrder}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-slate-900">{g.code}</span>
                      <span className="ml-2 font-medium text-slate-700">{g.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditGrade(g)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition"
                      title="Edit Grade"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteGrade(g)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Grade"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= JOB LEVELS ================= */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Job Levels</h4>
                <p className="text-[11px] text-slate-500">Organizational hierarchy seniority tiers</p>
              </div>
            </div>
            <button
              onClick={handleOpenCreateLevel}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-purple-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Level
            </button>
          </div>

          {jobLevels.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No job levels configured.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobLevels.map((lvl) => (
                <div key={lvl.id} className="flex items-center justify-between py-2.5 text-xs hover:bg-slate-50/50 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-[11px] font-bold text-purple-700">
                      {lvl.sortOrder}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-slate-900">{lvl.code}</span>
                      <span className="ml-2 font-medium text-slate-700">{lvl.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditLevel(lvl)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-purple-50 hover:text-purple-700 transition"
                      title="Edit Job Level"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteLevel(lvl)}
                      className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Job Level"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Standard Grade Modal (Create / Edit) */}
      <GradeModal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        onSuccess={onRefresh}
        companyId={companyId}
        grade={selectedGrade}
        defaultSortOrder={grades.length + 1}
      />

      {/* Standard Job Level Modal (Create / Edit) */}
      <JobLevelModal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        onSuccess={onRefresh}
        companyId={companyId}
        jobLevel={selectedLevel}
        defaultSortOrder={jobLevels.length + 1}
      />

      {/* Standard Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === "grade" ? "Delete Salary Grade" : "Delete Job Level"}
        itemName={deleteTarget?.name}
        error={deleteError}
        loading={deleting}
      />
    </div>
  );
}
