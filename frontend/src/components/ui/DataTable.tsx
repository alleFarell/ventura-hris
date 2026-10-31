"use client";

import React, { useState, useMemo, ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox, ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  actions?: ReactNode;
  filters?: ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  loading = false,
  searchPlaceholder = "Search records...",
  searchFilter,
  actions,
  filters,
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your current filter criteria.",
  emptyAction,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    return data.filter((row) => searchFilter(row, searchQuery.toLowerCase().trim()));
  }, [data, searchQuery, searchFilter]);

  // Sort data if sortKey is set
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredData, sortKey, sortAsc]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortKey(null);
        setSortAsc(true);
      }
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const startEntry = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, sortedData.length);

  return (
    <div className="space-y-4">
      {/* Table Header and Controls Toolbar */}
      {(title || searchFilter || filters || actions) && (
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          {title && (
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
            {searchFilter && (
              <div className="relative min-w-[220px] max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            )}

            {filters}
            {actions}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3 px-4 ${col.className || ""} ${
                      col.sortable ? "cursor-pointer select-none hover:text-slate-900" : ""
                    }`}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown
                          className={`h-3 w-3 ${
                            sortKey === col.key ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{emptyTitle}</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                        {emptyDescription}
                      </p>
                      {emptyAction && <div className="mt-4">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                // Rows
                paginatedData.map((row, idx) => {
                  const key = rowKey ? rowKey(row) : idx;
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`group transition hover:bg-slate-50/70 ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-3 px-4 text-slate-700 ${col.className || ""}`}
                        >
                          {col.render ? col.render(row, idx) : (row as any)[col.key] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination Bar */}
        {!loading && sortedData.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-[11px] text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{startEntry}</span> to{" "}
              <span className="font-semibold text-slate-700">{endEntry}</span> of{" "}
              <span className="font-semibold text-slate-700">{sortedData.length}</span> entries
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-medium text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
