"use client";

import React, { useState } from "react";
import { CompanyResponse } from "../api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Building2, Plus, Globe2, Clock, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface CompanyTableProps {
  companies?: CompanyResponse[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddClick?: () => void;
  onEdit?: (company: CompanyResponse) => void;
  onDelete?: (company: CompanyResponse) => void;
}

export function CompanyTable({
  companies = [],
  loading = false,
  onRefresh,
  onAddClick,
  onEdit,
  onDelete,
}: CompanyTableProps) {
  const columns: Column<CompanyResponse>[] = [
    {
      key: "name",
      header: "Company Entity",
      sortable: true,
      render: (comp) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs shadow-2xs">
            {comp.code.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{comp.name}</span>
            <span className="text-[11px] text-slate-500">{comp.legalName || comp.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (comp) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {comp.code}
        </span>
      ),
    },
    {
      key: "taxIdentifier",
      header: "Tax ID (NPWP)",
      render: (comp) => (
        <span className="text-slate-600">{comp.taxIdentifier || "Not Registered"}</span>
      ),
    },
    {
      key: "defaultCurrency",
      header: "Locale & Currency",
      render: (comp) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Globe2 className="h-3 w-3 text-slate-400" />
            <span>{comp.defaultCurrency} ({comp.defaultLocale})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{comp.defaultTimezone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (comp) => <StatusBadge status={comp.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (comp) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href="/setup/branches"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            Branches
          </Link>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(comp)}
              className="rounded-md p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
              title={`Edit ${comp.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(comp)}
              className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title={`Delete ${comp.name}`}
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
      title="Registered Corporate Entities"
      description="Parent holding companies and operational subsidiaries registered in Ventura HRIS."
      columns={columns}
      data={companies}
      loading={loading}
      searchPlaceholder="Filter by name, code, or tax ID..."
      searchFilter={(c, q) =>
        Boolean(
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.legalName && c.legalName.toLowerCase().includes(q)) ||
          (c.taxIdentifier && c.taxIdentifier.toLowerCase().includes(q))
        )
      }
      emptyTitle="No companies registered"
      emptyDescription="Create your first corporate entity to configure branches, organizational units, and staff."
      actions={
        onAddClick && (
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Company
          </button>
        )
      }
    />
  );
}
