"use client";

import React, { useEffect, useState } from "react";
import { getAttendanceRecords, importBiometricPunches } from "../api";
import { AttendanceRecord } from "../types";

export function DailyAttendanceRecordsSection() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Filters
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate, setEndDate] = useState(today);

  // Biometric import form
  const [deviceCode, setDeviceCode] = useState("DEV_HQ_01");
  const [rawPunchesText, setRawPunchesText] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceRecords(startDate, endDate);
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [startDate, endDate]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse format: employeeNumber,punchTime(ISO),punchType
      const lines = rawPunchesText.trim().split("\n");
      const punches = lines.map((line) => {
        const [empNum, timeStr, pType] = line.split(",").map((s) => s.trim());
        return {
          employeeNumber: empNum,
          punchTime: timeStr || new Date().toISOString(),
          punchType: (pType || "CLOCK_IN") as "CLOCK_IN" | "CLOCK_OUT",
        };
      });

      const res = await importBiometricPunches({ deviceCode, punches });
      alert(`Successfully imported ${res.data?.importedCount ?? 0} biometric punch logs!`);
      setImportDialogOpen(false);
      setRawPunchesText("");
      loadRecords();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to import punches");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Present</span>;
      case "LATE":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Late Arrival</span>;
      case "EARLY_LEAVE":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Early Leave</span>;
      case "ABSENT":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Absent</span>;
      case "ON_LEAVE":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">On Leave</span>;
      case "HOLIDAY":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Holiday</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Attendance Records</h2>
          <p className="text-sm text-gray-500">Monitor employee punch logs, working hours, and lateness records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportDialogOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium shadow-sm transition"
          >
            Import Biometric Logs
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-600">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2.5 py-1.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-600">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2.5 py-1.5"
          />
        </div>
        <button
          onClick={loadRecords}
          className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading daily attendance records...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Clock In</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Clock Out</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Work Hours</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900">{r.recordDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <div>{r.employeeName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{r.employeeNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-600">{r.shiftCode || "DEFAULT"}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">
                    {r.clockInTime ? new Date(r.clockInTime).toLocaleTimeString("en-US", { hour12: false }) : "-"}
                    {r.lateMinutes > 0 && (
                      <span className="text-red-500 block text-[10px]">+{r.lateMinutes}m late</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">
                    {r.clockOutTime ? new Date(r.clockOutTime).toLocaleTimeString("en-US", { hour12: false }) : "-"}
                    {r.earlyDepartureMinutes > 0 && (
                      <span className="text-orange-500 block text-[10px]">-{r.earlyDepartureMinutes}m early</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 font-mono">
                    {r.workingHours} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{r.notes || "-"}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No attendance records found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Biometric Log Import Modal */}
      {importDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Import Biometric Machine Punches</h3>
            <p className="text-xs text-gray-500">
              Paste raw punch lines in format: <code className="bg-gray-100 p-1 rounded font-mono">EMPLOYEE_NUM, ISO_TIME, PUNCH_TYPE</code>
            </p>
            <form onSubmit={handleImport} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Terminal Code</label>
                <input
                  type="text"
                  required
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Punch Data</label>
                <textarea
                  required
                  rows={5}
                  value={rawPunchesText}
                  onChange={(e) => setRawPunchesText(e.target.value)}
                  placeholder="EMP001, 2026-11-25T08:05:00Z, CLOCK_IN&#10;EMP001, 2026-11-25T17:15:00Z, CLOCK_OUT"
                  className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setImportDialogOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                >
                  Process Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
