"use client";

import React, { useEffect, useState } from "react";
import { getRoster, assignRoster, bulkPatternAssign, getShifts, getShiftPatterns } from "../api";
import { RosterAssignment, Shift, ShiftPattern } from "../types";

export function RosterScheduleGrid() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [roster, setRoster] = useState<RosterAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to current week (Monday to Sunday)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const [startDate, setStartDate] = useState(() => {
    const monday = getMonday(new Date());
    return monday.toISOString().slice(0, 10);
  });

  const [endDate, setEndDate] = useState(() => {
    const monday = getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday.toISOString().slice(0, 10);
  });

  // Dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [patternDialogOpen, setPatternDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ employeeId: string; date: string; currentShiftId?: string | null } | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [isDayOff, setIsDayOff] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  // Bulk pattern form
  const [bulkPatternId, setBulkPatternId] = useState("");
  const [bulkStart, setBulkStart] = useState(startDate);
  const [bulkEnd, setBulkEnd] = useState(endDate);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftList, patternList, rosterList] = await Promise.all([
        getShifts(),
        getShiftPatterns(),
        getRoster(startDate, endDate),
      ]);
      setShifts(shiftList);
      setPatterns(patternList);
      setRoster(rosterList);
      if (patternList.length > 0 && !bulkPatternId) {
        setBulkPatternId(patternList[0].id);
      }
    } catch (err) {
      console.error("Failed to load roster data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  // Generate date list between startDate and endDate
  const getDateRange = () => {
    const dates: string[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end && dates.length < 31) {
      dates.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const dates = getDateRange();

  // Distinct employees from roster
  const employeeMap = new Map<string, { id: string; number: string; name: string }>();
  roster.forEach((r) => {
    if (!employeeMap.has(r.employeeId)) {
      employeeMap.set(r.employeeId, {
        id: r.employeeId,
        number: r.employeeNumber,
        name: r.employeeName,
      });
    }
  });
  const employees = Array.from(employeeMap.values());

  const handleOpenAssign = (employeeId: string, date: string) => {
    const existing = roster.find((r) => r.employeeId === employeeId && r.shiftDate === date);
    setSelectedCell({ employeeId, date, currentShiftId: existing?.shiftId });
    setSelectedShiftId(existing?.shiftId || (shifts[0]?.id ?? ""));
    setIsDayOff(existing?.isDayOff || false);
    setOverrideReason(existing?.overrideReason || "");
    setAssignDialogOpen(true);
  };

  const handleSaveAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;
    try {
      await assignRoster({
        employeeId: selectedCell.employeeId,
        shiftId: isDayOff ? undefined : selectedShiftId,
        shiftDate: selectedCell.date,
        isDayOff,
        overrideReason: overrideReason || undefined,
      });
      setAssignDialogOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to assign shift");
    }
  };

  const handleBulkPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employees.length === 0) {
      alert("No employees found in current scope to assign pattern.");
      return;
    }
    try {
      await bulkPatternAssign({
        employeeIds: employees.map((e) => e.id),
        patternId: bulkPatternId,
        startDate: bulkStart,
        endDate: bulkEnd,
      });
      setPatternDialogOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to assign bulk pattern");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shift Roster Schedule Grid</h2>
          <p className="text-sm text-gray-500">View and assign employee work shifts across days</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border rounded px-2 py-1"
            />
          </div>
          <button
            onClick={() => setPatternDialogOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition"
          >
            Apply Pattern
          </button>
        </div>
      </div>

      {/* Shifts Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-gray-600 mr-2">Legend:</span>
        {shifts.map((s) => (
          <span key={s.id} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            {s.name} ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
          </span>
        ))}
        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-300 font-medium">
          Day Off
        </span>
      </div>

      {/* Main Roster Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading schedule matrix...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                  Employee
                </th>
                {dates.map((d) => {
                  const dayName = new Date(d).toLocaleDateString("en-US", { weekday: "short" });
                  const isWeekend = dayName === "Sat" || dayName === "Sun";
                  return (
                    <th
                      key={d}
                      className={`px-3 py-2 text-center font-semibold tracking-wider min-w-[110px] ${
                        isWeekend ? "bg-amber-50 text-amber-900" : "text-gray-600"
                      }`}
                    >
                      <div>{dayName}</div>
                      <div className="text-[11px] font-mono text-gray-500">{d.slice(5)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                    <div>{emp.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{emp.number}</div>
                  </td>
                  {dates.map((d) => {
                    const cell = roster.find((r) => r.employeeId === emp.id && r.shiftDate === d);
                    return (
                      <td
                        key={d}
                        onClick={() => handleOpenAssign(emp.id, d)}
                        className="px-2 py-2 text-center border-r cursor-pointer hover:bg-blue-50/50 transition-colors"
                      >
                        {cell ? (
                          cell.isDayOff ? (
                            <span className="inline-block px-2 py-1 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              OFF
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {cell.shiftCode || "Shift"}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-300 text-[11px]">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={dates.length + 1} className="px-6 py-12 text-center text-sm text-gray-500">
                    No roster assignments found for this period. Click "Apply Pattern" to generate schedules.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Shift Modal */}
      {assignDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Assign Shift for {selectedCell?.date}
            </h3>
            <form onSubmit={handleSaveAssign} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dayOffCheck"
                  checked={isDayOff}
                  onChange={(e) => setIsDayOff(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="dayOffCheck" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Mark as Day Off
                </label>
              </div>

              {!isDayOff && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Select Shift</label>
                  <select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}: {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700">Reason / Note</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Schedule swap, Project shift"
                  className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAssignDialogOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Pattern Modal */}
      {patternDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Apply Cyclical Shift Pattern</h3>
            <p className="text-xs text-gray-500">
              Apply a recurring schedule pattern to all currently visible employees across the target date range.
            </p>
            <form onSubmit={handleBulkPattern} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Pattern</label>
                <select
                  value={bulkPatternId}
                  onChange={(e) => setBulkPatternId(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code} - {p.cycleDays} days)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={bulkStart}
                    onChange={(e) => setBulkStart(e.target.value)}
                    className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={bulkEnd}
                    onChange={(e) => setBulkEnd(e.target.value)}
                    className="mt-1 block w-full rounded border px-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setPatternDialogOpen(false)}
                  className="px-3 py-1.5 border rounded text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
                >
                  Apply to {employees.length} Employee(s)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
