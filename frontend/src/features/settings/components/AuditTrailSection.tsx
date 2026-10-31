"use client";

import { useEffect, useState } from "react";
import { AuditLogResponse } from "../types";
import { getAuditLogs } from "../api";
import {
  FileSearch,
  RefreshCw,
  Filter,
  User,
  Activity,
  Loader2,
  AlertCircle,
  Calendar,
  Globe,
} from "lucide-react";

export function AuditTrailSection() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [actorUsername, setActorUsername] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({
        entityType: entityType || undefined,
        action: action || undefined,
        actorUsername: actorUsername.trim() || undefined,
      });
      setLogs(res.logs);
      setTotalElements(res.totalElements ?? res.logs.length);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityType, action]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const getActionBadge = (act: string) => {
    switch (act.toUpperCase()) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ASSIGN_ROLE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "STATUS_CHANGE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
          <p className="text-slate-500">
            Immutable, append-only security and data change records across all platform entities
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
      >
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        <div>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="COMPANY">Company</option>
            <option value="BRANCH">Branch</option>
            <option value="DEPARTMENT">Department</option>
            <option value="POSITION">Position</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ROLE">Role</option>
            <option value="USER">User</option>
          </select>
        </div>

        <div>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ASSIGN_ROLE">ASSIGN_ROLE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by actor username..."
            value={actorUsername}
            onChange={(e) => setActorUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3.5 py-1.5 font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading audit trail...
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileSearch className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No audit events match your filter</p>
          <p className="text-slate-400 mt-1">
            Try clearing search filters or logging system actions.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                <th className="py-2.5 px-4">TIMESTAMP</th>
                <th className="py-2.5 px-4">ACTOR</th>
                <th className="py-2.5 px-4">ACTION</th>
                <th className="py-2.5 px-4">TARGET ENTITY</th>
                <th className="py-2.5 px-4">DETAILS</th>
                <th className="py-2.5 px-4 text-right">IP ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {log.createdAt ? log.createdAt.replace("T", " ").substring(0, 19) : "-"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400 shrink-0" />
                      {log.actorUsername}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-semibold text-slate-800">{log.entityType}</span>
                      {log.entityId && (
                        <span className="block font-mono text-[10px] text-slate-400 truncate max-w-xs">
                          {log.entityId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    <p className="line-clamp-2">{log.details || "-"}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                    {log.ipAddress || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-100 text-[11px] text-slate-500">
            Showing {logs.length} of {totalElements} recorded events
          </div>
        </div>
      )}
    </div>
  );
}
