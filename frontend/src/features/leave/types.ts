export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultQuota: number;
  isPaid: boolean;
  requiresAttachment: boolean;
  maxConsecutiveDays: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  year: number;
  totalQuota: number;
  carriedOver: number;
  used: number;
  pending: number;
  remainingQuota: number;
}

export interface LeaveApproval {
  id: string;
  leaveRequestId: string;
  approverId: string;
  approverNumber: string;
  approverName: string;
  stepOrder: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  comments?: string;
  actionedAt?: string;
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  isPaid: boolean;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvals: LeaveApproval[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestCreateInput {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
  approverId?: string;
}

export interface LeaveBalanceAdjustInput {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalQuota: number;
  carriedOver?: number;
}

export interface LeaveTypeCreateInput {
  code: string;
  name: string;
  description?: string;
  defaultQuota: number;
  isPaid?: boolean;
  requiresAttachment?: boolean;
  maxConsecutiveDays?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  isActive?: boolean;
}
