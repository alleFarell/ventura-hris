"use client";

import React from "react";
import { BranchResponse, CompanyResponse } from "../api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GitBranch, MapPin, Building2, Plus, Pencil, Trash2 } from "lucide-react";

interface BranchTableProps {
  branches?: BranchResponse[];
  companies?: CompanyResponse[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddClick?: () => void;
  onEdit?: (branch: BranchResponse) => void;
  onDelete?: (branch: BranchResponse) => void;
}

export function BranchTable({
  branches = [],
  companies = [],
  loading = false,
  onRefresh,
  onAddClick,
  onEdit,
  onDelete,
}: BranchTableProps) {
  // Map companyId to company name
  const companyMap = React.useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((c) => map.set(c.id, `${c.name} (${c.code})`));
    return map;
  }, [companies]);

  const columns: Column<BranchResponse>[] = [
    {
      key: "name",
      header: "Branch Name & Code",
      sortable: true,
      render: (branch) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs shadow-2xs">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{branch.name}</span>
            <span className="font-mono text-[11px] text-slate-500">{branch.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: "companyId",
      header: "Company Entity",
      render: (branch) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="font-medium">{companyMap.get(branch.companyId) || branch.companyId}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location & Address",
      render: (branch) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-slate-800 font-medium">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{branch.city || "Unassigned"}{branch.province ? `, ${branch.province}` : ""}</span>
          </div>
          {branch.addressLine1 && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{branch.addressLine1}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (branch) => <StatusBadge status={branch.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (branch) => (
        <div className="flex items-center justify-end gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(branch)}
              className="rounded-md p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
              title={`Edit ${branch.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(branch)}
              className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title={`Delete ${branch.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Branch Office Locations"
      description="Active operating locations, physical offices, and regional headquarters."
      columns={columns}
      data={branches}
      loading={loading}
      searchPlaceholder="Filter branches by name, code, or city..."
      searchFilter={(b, q) =>
        Boolean(
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          (b.city && b.city.toLowerCase().includes(q)) ||
          (b.province && b.province.toLowerCase().includes(q))
        )
      }
      emptyTitle="No branches configured"
      emptyDescription="Create a branch under an active company to enable roster scheduling and attendance tracking."
      actions={
        onAddClick && (
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Branch
          </button>
        )
      }
    />
  );
}
