export interface OffboardingCase {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  departmentName?: string;
  positionName?: string;
  separationType: "RESIGNATION" | "TERMINATION" | "RETIREMENT" | "CONTRACT_END" | string;
  noticeDate: string;
  lastWorkingDate: string;
  reason?: string;
  status: "SUBMITTED" | "IN_CLEARANCE" | "COMPLETED" | "CANCELLED" | string;
  clearedItemsCount: number;
  totalItemsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OffboardingCaseRequest {
  employeeId: string;
  separationType: string;
  noticeDate: string;
  lastWorkingDate: string;
  reason?: string;
}

export interface OffboardingChecklist {
  id: string;
  caseId: string;
  departmentName: "IT" | "FINANCE" | "ASSETS" | "HR" | string;
  itemName: string;
  isCleared: boolean;
  clearedBy?: string;
  clearedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistClearRequest {
  clearedBy: string;
  notes?: string;
}

export interface ExitInterview {
  id: string;
  caseId: string;
  employeeName?: string;
  employeeNumber?: string;
  interviewerId?: string;
  interviewerName?: string;
  primaryReason: string;
  cultureRating: number;
  managementRating: number;
  feedbackText?: string;
  submittedAt?: string;
}

export interface ExitInterviewRequest {
  caseId: string;
  interviewerId?: string;
  primaryReason: string;
  cultureRating: number;
  managementRating: number;
  feedbackText?: string;
}
