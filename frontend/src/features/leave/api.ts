import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  LeaveBalance,
  LeaveBalanceAdjustInput,
  LeaveApproval,
  LeaveRequest,
  LeaveRequestCreateInput,
  LeaveType,
  LeaveTypeCreateInput,
} from "./types";

// ==================== LEAVE TYPES ====================

export async function getLeaveTypes(): Promise<LeaveType[]> {
  const res = await apiClient.get<ApiResponse<LeaveType[]>>("/leave/types");
  return res.data.data ?? [];
}

export async function createLeaveType(payload: LeaveTypeCreateInput): Promise<ApiResponse<LeaveType>> {
  const res = await apiClient.post<ApiResponse<LeaveType>>("/leave/types", payload);
  return res.data;
}

export async function updateLeaveType(id: string, payload: LeaveTypeCreateInput): Promise<ApiResponse<LeaveType>> {
  const res = await apiClient.put<ApiResponse<LeaveType>>(`/leave/types/${id}`, payload);
  return res.data;
}

// ==================== LEAVE BALANCES ====================

export async function getEmployeeLeaveBalances(employeeId: string, year?: number): Promise<LeaveBalance[]> {
  const params: Record<string, string | number> = {};
  if (year) params.year = year;
  const res = await apiClient.get<ApiResponse<LeaveBalance[]>>(`/leave/balances/employee/${employeeId}`, { params });
  return res.data.data ?? [];
}

export async function adjustLeaveBalance(payload: LeaveBalanceAdjustInput): Promise<ApiResponse<LeaveBalance>> {
  const res = await apiClient.post<ApiResponse<LeaveBalance>>("/leave/balances/adjust", payload);
  return res.data;
}

// ==================== LEAVE REQUESTS ====================

export async function getLeaveRequests(employeeId?: string, status?: string): Promise<LeaveRequest[]> {
  const params: Record<string, string> = {};
  if (employeeId) params.employeeId = employeeId;
  if (status) params.status = status;
  const res = await apiClient.get<ApiResponse<LeaveRequest[]>>("/leave/requests", { params });
  return res.data.data ?? [];
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequest> {
  const res = await apiClient.get<ApiResponse<LeaveRequest>>(`/leave/requests/${id}`);
  return res.data.data!;
}

export async function createLeaveRequest(payload: LeaveRequestCreateInput): Promise<ApiResponse<LeaveRequest>> {
  const res = await apiClient.post<ApiResponse<LeaveRequest>>("/leave/requests", payload);
  return res.data;
}

export async function cancelLeaveRequest(id: string): Promise<ApiResponse<LeaveRequest>> {
  const res = await apiClient.put<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/cancel`);
  return res.data;
}

export async function getLeaveCalendar(startDate?: string, endDate?: string): Promise<LeaveRequest[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await apiClient.get<ApiResponse<LeaveRequest[]>>("/leave/requests/calendar", { params });
  return res.data.data ?? [];
}

// ==================== LEAVE APPROVALS ====================

export async function getApprovalInbox(approverId: string, status?: string): Promise<LeaveApproval[]> {
  const params: Record<string, string> = { approverId };
  if (status) params.status = status;
  const res = await apiClient.get<ApiResponse<LeaveApproval[]>>("/leave/approvals/inbox", { params });
  return res.data.data ?? [];
}

export async function approveLeave(id: string, comments?: string): Promise<ApiResponse<LeaveRequest>> {
  const res = await apiClient.post<ApiResponse<LeaveRequest>>(`/leave/approvals/${id}/approve`, { comments });
  return res.data;
}

export async function rejectLeave(id: string, comments?: string): Promise<ApiResponse<LeaveRequest>> {
  const res = await apiClient.post<ApiResponse<LeaveRequest>>(`/leave/approvals/${id}/reject`, { comments });
  return res.data;
}
