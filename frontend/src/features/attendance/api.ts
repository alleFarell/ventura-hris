import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  AssignRosterPayload,
  BulkPatternRosterPayload,
  CompanyHoliday,
  CreateHolidayPayload,
  CreatePatternPayload,
  CreateShiftPayload,
  RosterAssignment,
  Shift,
  ShiftPattern,
} from "./types";

// ==================== SHIFTS ====================

export async function getShifts(): Promise<Shift[]> {
  const response = await apiClient.get<ApiResponse<Shift[]>>("/shifts");
  return response.data.data ?? [];
}

export async function getShift(id: string): Promise<Shift> {
  const response = await apiClient.get<ApiResponse<Shift>>(`/shifts/${id}`);
  return response.data.data!;
}

export async function createShift(payload: CreateShiftPayload): Promise<ApiResponse<Shift>> {
  const response = await apiClient.post<ApiResponse<Shift>>("/shifts", payload);
  return response.data;
}

export async function updateShift(id: string, payload: CreateShiftPayload): Promise<ApiResponse<Shift>> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${id}`, payload);
  return response.data;
}

export async function deleteShift(id: string): Promise<void> {
  await apiClient.delete(`/shifts/${id}`);
}

export async function getShiftPatterns(): Promise<ShiftPattern[]> {
  const response = await apiClient.get<ApiResponse<ShiftPattern[]>>("/shifts/patterns");
  return response.data.data ?? [];
}

export async function createShiftPattern(payload: CreatePatternPayload): Promise<ApiResponse<ShiftPattern>> {
  const response = await apiClient.post<ApiResponse<ShiftPattern>>("/shifts/patterns", payload);
  return response.data;
}

// ==================== HOLIDAYS ====================

export async function getHolidays(startDate?: string, endDate?: string): Promise<CompanyHoliday[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<ApiResponse<CompanyHoliday[]>>("/holidays", { params });
  return response.data.data ?? [];
}

export async function createHoliday(payload: CreateHolidayPayload): Promise<ApiResponse<CompanyHoliday>> {
  const response = await apiClient.post<ApiResponse<CompanyHoliday>>("/holidays", payload);
  return response.data;
}

export async function updateHoliday(id: string, payload: CreateHolidayPayload): Promise<ApiResponse<CompanyHoliday>> {
  const response = await apiClient.put<ApiResponse<CompanyHoliday>>(`/holidays/${id}`, payload);
  return response.data;
}

export async function deleteHoliday(id: string): Promise<void> {
  await apiClient.delete(`/holidays/${id}`);
}

// ==================== ROSTER ====================

export async function getRoster(startDate: string, endDate: string, employeeId?: string): Promise<RosterAssignment[]> {
  const params: Record<string, string> = { startDate, endDate };
  if (employeeId) params.employeeId = employeeId;

  const response = await apiClient.get<ApiResponse<RosterAssignment[]>>("/roster", { params });
  return response.data.data ?? [];
}

export async function assignRoster(payload: AssignRosterPayload): Promise<ApiResponse<RosterAssignment>> {
  const response = await apiClient.post<ApiResponse<RosterAssignment>>("/roster/assign", payload);
  return response.data;
}

export async function bulkPatternAssign(payload: BulkPatternRosterPayload): Promise<ApiResponse<{ assignedCount: number }>> {
  const response = await apiClient.post<ApiResponse<{ assignedCount: number }>>("/roster/bulk-pattern", payload);
  return response.data;
}

export async function deleteRosterAssignment(id: string): Promise<void> {
  await apiClient.delete(`/roster/${id}`);
}

// ==================== DAILY ATTENDANCE ====================

export async function clockIn(payload: import("./types").ClockInPayload): Promise<ApiResponse<import("./types").AttendanceRecord>> {
  const response = await apiClient.post<ApiResponse<import("./types").AttendanceRecord>>("/attendance/clock-in", payload);
  return response.data;
}

export async function clockOut(payload: import("./types").ClockOutPayload): Promise<ApiResponse<import("./types").AttendanceRecord>> {
  const response = await apiClient.post<ApiResponse<import("./types").AttendanceRecord>>("/attendance/clock-out", payload);
  return response.data;
}

export async function getMyTodayAttendance(employeeId: string): Promise<import("./types").AttendanceRecord | null> {
  const response = await apiClient.get<ApiResponse<import("./types").AttendanceRecord>>(`/attendance/my-today?employeeId=${employeeId}`);
  return response.data.data ?? null;
}

export async function getAttendanceRecords(
  startDate?: string,
  endDate?: string,
  employeeId?: string,
  page = 0,
  size = 20
): Promise<{ data: import("./types").AttendanceRecord[]; meta?: any }> {
  const params: Record<string, any> = { page, size };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (employeeId) params.employeeId = employeeId;

  const response = await apiClient.get<ApiResponse<import("./types").AttendanceRecord[]>>("/attendance/records", { params });
  return {
    data: response.data.data ?? [],
    meta: response.data.meta,
  };
}

export async function importBiometricPunches(
  payload: import("./types").BiometricPunchImportPayload
): Promise<ApiResponse<{ importedCount: number }>> {
  const response = await apiClient.post<ApiResponse<{ importedCount: number }>>("/attendance/biometrics/import", payload);
  return response.data;
}

// ==================== WFH ====================

export async function getWfhRequests(employeeId: string): Promise<import("./types").WfhRequest[]> {
  const response = await apiClient.get<ApiResponse<import("./types").WfhRequest[]>>("/attendance/wfh", {
    params: { employeeId },
  });
  return response.data.data ?? [];
}

export async function createWfhRequest(
  payload: import("./types").WfhRequestCreatePayload
): Promise<ApiResponse<import("./types").WfhRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").WfhRequest>>("/attendance/wfh", payload);
  return response.data;
}

export async function getWfhInbox(
  approverId: string,
  status?: string
): Promise<import("./types").WfhRequest[]> {
  const params: Record<string, string> = { approverId };
  if (status) params.status = status;
  const response = await apiClient.get<ApiResponse<import("./types").WfhRequest[]>>("/attendance/wfh/inbox", { params });
  return response.data.data ?? [];
}

export async function approveWfh(id: string, comments?: string): Promise<ApiResponse<import("./types").WfhRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").WfhRequest>>(`/attendance/wfh/${id}/approve`, { comments });
  return response.data;
}

export async function rejectWfh(id: string, comments?: string): Promise<ApiResponse<import("./types").WfhRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").WfhRequest>>(`/attendance/wfh/${id}/reject`, { comments });
  return response.data;
}

// ==================== OVERTIME ====================

export async function getOvertimeRequests(
  employeeId?: string,
  status?: string
): Promise<import("./types").OvertimeRequest[]> {
  const params: Record<string, string> = {};
  if (employeeId) params.employeeId = employeeId;
  if (status) params.status = status;
  const response = await apiClient.get<ApiResponse<import("./types").OvertimeRequest[]>>("/attendance/overtime", { params });
  return response.data.data ?? [];
}

export async function createOvertimeRequest(
  payload: import("./types").OvertimeRequestCreatePayload
): Promise<ApiResponse<import("./types").OvertimeRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").OvertimeRequest>>("/attendance/overtime", payload);
  return response.data;
}

export async function getOvertimeInbox(
  approverId: string,
  status?: string
): Promise<import("./types").OvertimeRequest[]> {
  const params: Record<string, string> = { approverId };
  if (status) params.status = status;
  const response = await apiClient.get<ApiResponse<import("./types").OvertimeRequest[]>>("/attendance/overtime/inbox", { params });
  return response.data.data ?? [];
}

export async function approveOvertime(id: string, comments?: string): Promise<ApiResponse<import("./types").OvertimeRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").OvertimeRequest>>(`/attendance/overtime/${id}/approve`, { comments });
  return response.data;
}

export async function rejectOvertime(id: string, comments?: string): Promise<ApiResponse<import("./types").OvertimeRequest>> {
  const response = await apiClient.post<ApiResponse<import("./types").OvertimeRequest>>(`/attendance/overtime/${id}/reject`, { comments });
  return response.data;
}

// ==================== MONTHLY RECAP ====================

export async function getMonthlyRecaps(
  year: number,
  month: number
): Promise<import("./types").MonthlyAttendanceRecap[]> {
  const response = await apiClient.get<ApiResponse<import("./types").MonthlyAttendanceRecap[]>>("/attendance/recaps", {
    params: { year, month },
  });
  return response.data.data ?? [];
}

export async function generateMonthlyRecap(
  year: number,
  month: number
): Promise<import("./types").MonthlyAttendanceRecap[]> {
  const response = await apiClient.post<ApiResponse<import("./types").MonthlyAttendanceRecap[]>>("/attendance/recaps/generate", {
    periodYear: year,
    periodMonth: month,
  });
  return response.data.data ?? [];
}

export async function lockMonthlyRecap(
  id: string,
  lockedBy?: string
): Promise<ApiResponse<import("./types").MonthlyAttendanceRecap>> {
  const params: Record<string, string> = {};
  if (lockedBy) params.lockedBy = lockedBy;
  const response = await apiClient.put<ApiResponse<import("./types").MonthlyAttendanceRecap>>(`/attendance/recaps/${id}/lock`, null, { params });
  return response.data;
}

export async function lockAllPeriodRecaps(
  year: number,
  month: number,
  lockedBy?: string
): Promise<ApiResponse<import("./types").MonthlyAttendanceRecap[]>> {
  const params: Record<string, string | number> = { year, month };
  if (lockedBy) params.lockedBy = lockedBy;
  const response = await apiClient.post<ApiResponse<import("./types").MonthlyAttendanceRecap[]>>("/attendance/recaps/lock-period", null, { params });
  return response.data;
}


