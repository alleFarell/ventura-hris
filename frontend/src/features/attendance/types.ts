export interface Shift {
  id: string;
  companyId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  startTime: string; // "08:00:00"
  endTime: string;   // "17:00:00"
  breakMinutes: number;
  gracePeriodMinutes: number;
  isOvernight: boolean;
  isActive: boolean;
}

export interface ShiftPattern {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  patternSequence: string;
  cycleDays: number;
  isActive: boolean;
}

export interface RosterAssignment {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  shiftId?: string | null;
  shiftCode?: string | null;
  shiftName?: string | null;
  shiftDate: string; // "YYYY-MM-DD"
  startTime?: string | null;
  endTime?: string | null;
  isDayOff: boolean;
  overrideReason?: string | null;
}

export interface CompanyHoliday {
  id: string;
  holidayDate: string; // "YYYY-MM-DD"
  name: string;
  description?: string | null;
  companyId?: string | null;
  branchId?: string | null;
  isMandatory: boolean;
}

export interface CreateShiftPayload {
  code: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  gracePeriodMinutes?: number;
  isOvernight?: boolean;
  isActive?: boolean;
}

export interface CreatePatternPayload {
  code: string;
  name: string;
  description?: string;
  patternSequence: string;
  cycleDays?: number;
  isActive?: boolean;
}

export interface AssignRosterPayload {
  employeeId: string;
  shiftId?: string;
  shiftDate: string;
  isDayOff?: boolean;
  overrideReason?: string;
}

export interface BulkPatternRosterPayload {
  employeeIds: string[];
  patternId: string;
  startDate: string;
  endDate: string;
}

export interface CreateHolidayPayload {
  holidayDate: string;
  name: string;
  description?: string;
  companyId?: string;
  branchId?: string;
  isMandatory?: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  recordDate: string;
  shiftId?: string | null;
  shiftCode?: string | null;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  workingHours: number;
  status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "ON_LEAVE" | "HOLIDAY";
  notes?: string | null;
}

export interface ClockInPayload {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

export interface ClockOutPayload {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

export interface BiometricPunchImportPayload {
  deviceCode: string;
  punches: {
    employeeNumber: string;
    punchTime: string;
    punchType: "CLOCK_IN" | "CLOCK_OUT";
  }[];
}

// ==================== WFH TYPES ====================

export interface WfhRequest {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  requestDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approverId?: string | null;
  approverName?: string | null;
  managerComment?: string | null;
  actionedAt?: string | null;
  createdAt: string;
}

export interface WfhRequestCreatePayload {
  employeeId: string;
  requestDate: string;
  reason: string;
  approverId?: string;
}

// ==================== OVERTIME TYPES ====================

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  rawHours: number;
  multiplierHours: number;
  reason: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
  compensationType: "PAID" | "TIME_OFF_IN_LIEU";
  approverId?: string | null;
  approverName?: string | null;
  managerComment?: string | null;
  actionedAt?: string | null;
  createdAt: string;
}

export interface OvertimeRequestCreatePayload {
  employeeId: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  compensationType?: "PAID" | "TIME_OFF_IN_LIEU";
  approverId?: string;
}

// ==================== MONTHLY RECAP TYPES ====================

export interface MonthlyAttendanceRecap {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  periodYear: number;
  periodMonth: number;
  totalWorkingDays: number;
  totalDaysPresent: number;
  totalDaysAbsent: number;
  totalLateMinutes: number;
  totalEarlyDepartureMinutes: number;
  totalOvertimeHours: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  status: "DRAFT" | "VERIFIED" | "LOCKED_FOR_PAYROLL";
  lockedAt?: string | null;
  lockedBy?: string | null;
  createdAt: string;
}


