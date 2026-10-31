"use client";

import React, { useEffect, useState, useCallback } from "react";
import { clockIn, clockOut, getMyTodayAttendance } from "../api";
import { AttendanceRecord } from "../types";
import { useAuthStore } from "@/features/auth/store";
import { getEmployees } from "@/features/employee/api";
import { EmployeeSummaryResponse } from "@/features/employee/types";
import { UserCheck, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export function WebClockInOutCard() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<EmployeeSummaryResponse[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [location, setLocation] = useState<{ lat?: number; lng?: number; error?: string }>({});
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Geolocation detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          setLocation({ error: err.message });
        }
      );
    } else {
      setLocation({ error: "Geolocation not supported by this browser" });
    }
  }, []);

  // Load employee directory to resolve active employee profile
  useEffect(() => {
    async function initEmployee() {
      try {
        const empList = await getEmployees();
        setEmployees(empList);
        if (empList.length > 0) {
          const matched = empList.find(
            (e) =>
              (e.workEmail && user?.email && e.workEmail.toLowerCase() === user.email.toLowerCase()) ||
              e.id === user?.id
          );
          setSelectedEmployeeId(matched ? matched.id : empList[0].id);
        }
      } catch (err) {
        console.error("Failed to load employee directory for clock-in:", err);
      }
    }
    initEmployee();
  }, [user?.email, user?.id]);

  // Load today's attendance when selected employee changes
  const loadTodayRecord = useCallback(async (empId: string) => {
    if (!empId) return;
    try {
      const today = await getMyTodayAttendance(empId);
      setRecord(today);
    } catch (err) {
      console.error("Failed to load today's attendance:", err);
      setRecord(null);
    }
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadTodayRecord(selectedEmployeeId);
    }
  }, [selectedEmployeeId, loadTodayRecord]);

  const handleClockIn = async () => {
    if (!selectedEmployeeId) {
      setFeedback({ type: "error", message: "No employee profile selected for clock-in." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await clockIn({
        employeeId: selectedEmployeeId,
        latitude: location.lat,
        longitude: location.lng,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Web Portal",
        notes: notes || undefined,
      });
      setRecord(res.data ?? null);
      setNotes("");
      setFeedback({ type: "success", message: "Clock-in recorded successfully!" });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.error?.message || err.message || "Failed to clock in",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployeeId) {
      setFeedback({ type: "error", message: "No employee profile selected for clock-out." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await clockOut({
        employeeId: selectedEmployeeId,
        latitude: location.lat,
        longitude: location.lng,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Web Portal",
        notes: notes || undefined,
      });
      setRecord(res.data ?? null);
      setNotes("");
      setFeedback({ type: "success", message: "Clock-out recorded successfully!" });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.error?.message || err.message || "Failed to clock out",
      });
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = Boolean(record?.clockInTime);
  const isClockedOut = Boolean(record?.clockOutTime);
  const activeEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const isAdminOrHr = user?.roles?.some((r) => r.includes("ADMIN") || r.includes("HR"));

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
      {/* Live Digital Clock Header */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-500">{currentDate}</p>
        <div className="text-5xl font-mono font-bold tracking-tight text-slate-900">{currentTime || "--:--:--"}</div>
        <p className="text-xs text-blue-600 font-semibold pt-1">Timezone: Asia/Jakarta (WIB)</p>
      </div>

      {/* Employee Identity / Switcher */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-700">Punch Profile:</span>
          {isAdminOrHr && employees.length > 1 ? (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeNumber})
                </option>
              ))}
            </select>
          ) : (
            <span className="font-medium text-slate-900">
              {activeEmployee ? `${activeEmployee.fullName} (${activeEmployee.employeeNumber})` : (user?.fullName || "Employee")}
            </span>
          )}
        </div>
        {selectedEmployeeId && (
          <button
            type="button"
            onClick={() => loadTodayRecord(selectedEmployeeId)}
            className="text-slate-400 hover:text-slate-600 p-1 self-end sm:self-auto rounded"
            title="Refresh status"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Geolocation Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-gray-700">GPS Coordinates: </span>
          {location.lat && location.lng ? (
            <span className="font-mono text-gray-600">
              {location.lat}, {location.lng}
            </span>
          ) : (
            <span className="text-amber-600 font-medium">Detecting location...</span>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
          Geofence Verified
        </span>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Today's Status Overview */}
      <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50/50">
        <div>
          <span className="text-xs text-gray-500 block">Clock In</span>
          <span className="text-sm font-semibold font-mono text-gray-900">
            {record?.clockInTime ? new Date(record.clockInTime).toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
          </span>
          {record?.lateMinutes ? (
            <span className="text-[11px] text-red-600 block">({record.lateMinutes}m late)</span>
          ) : null}
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Clock Out</span>
          <span className="text-sm font-semibold font-mono text-gray-900">
            {record?.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
          </span>
          {record?.workingHours ? (
            <span className="text-[11px] text-green-600 block font-medium">
              {record.workingHours} hrs worked
            </span>
          ) : null}
        </div>
      </div>

      {/* Optional Note Field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Punch Note (Optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Working from client site, morning meeting"
          className="w-full text-xs rounded border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={handleClockIn}
          disabled={loading || isClockedIn || !selectedEmployeeId}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 ${
            isClockedIn || !selectedEmployeeId
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isClockedIn ? (
            "Clocked In"
          ) : (
            "Clock In"
          )}
        </button>
        <button
          type="button"
          onClick={handleClockOut}
          disabled={loading || !isClockedIn || isClockedOut || !selectedEmployeeId}
          className={`w-full py-3 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 ${
            !isClockedIn || isClockedOut || !selectedEmployeeId
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
              : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isClockedOut ? (
            "Clocked Out"
          ) : (
            "Clock Out"
          )}
        </button>
      </div>
    </div>
  );
}
