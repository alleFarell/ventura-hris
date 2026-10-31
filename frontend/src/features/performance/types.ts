export interface PerformanceCycle {
  id: string;
  companyId: string;
  companyName?: string;
  name: string;
  cycleType: "ANNUAL" | "SEMI_ANNUAL" | "QUARTERLY";
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  status: "PLANNED" | "ACTIVE" | "EVALUATION" | "CLOSED";
  createdAt?: string;
}

export interface PerformanceCycleRequest {
  companyId: string;
  name: string;
  cycleType: string;
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
}

export interface PerformanceCycleStatusUpdateRequest {
  status: string;
}

export interface PerformanceGoalKeyResult {
  id?: string;
  description: string;
  metricType: "PERCENTAGE" | "NUMBER" | "CURRENCY" | "BOOLEAN";
  targetValue: number;
  currentValue?: number;
  progressPercent?: number;
  notes?: string;
}

export interface PerformanceGoal {
  id: string;
  cycleId: string;
  cycleName?: string;
  employeeId: string;
  employeeNumber?: string;
  employeeName?: string;
  title: string;
  description?: string;
  category: "INDIVIDUAL" | "DEPARTMENT" | "COMPANY";
  weight: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  progressPercent: number;
  keyResults: PerformanceGoalKeyResult[];
  createdAt?: string;
}

export interface PerformanceGoalRequest {
  cycleId: string;
  employeeId: string;
  title: string;
  description?: string;
  category?: string;
  weight?: number;
  keyResults?: PerformanceGoalKeyResult[];
}

export interface KeyResultProgressUpdateRequest {
  currentValue: number;
  notes?: string;
}

export interface CompetencyModel {
  id: string;
  companyId: string;
  code: string;
  name: string;
  category: "CORE" | "LEADERSHIP" | "FUNCTIONAL";
  description?: string;
  weight: number;
  createdAt?: string;
}

export interface CompetencyModelRequest {
  companyId: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  weight?: number;
}

export interface EmployeeAppraisal {
  id: string;
  cycleId: string;
  cycleName?: string;
  employeeId: string;
  employeeNumber?: string;
  employeeName?: string;
  managerId?: string;
  managerName?: string;
  selfScore?: number;
  managerScore?: number;
  finalScore?: number;
  performanceGrade?: string;
  status: "SELF_REVIEW" | "MANAGER_REVIEW" | "CALIBRATION" | "COMPLETED";
  selfComments?: string;
  managerComments?: string;
  createdAt?: string;
}

export interface EmployeeAppraisalRequest {
  cycleId: string;
  employeeId: string;
  managerId?: string;
}

export interface AppraisalSelfReviewRequest {
  selfScore: number;
  selfComments?: string;
}

export interface AppraisalManagerReviewRequest {
  managerScore: number;
  managerComments?: string;
}

export interface Feedback360 {
  id: string;
  appraisalId: string;
  reviewerId?: string;
  reviewerName?: string;
  relationship: "PEER" | "SUBORDINATE" | "CROSS_FUNCTIONAL";
  rating?: number;
  feedbackText?: string;
  isAnonymous: boolean;
  status: "REQUESTED" | "SUBMITTED";
  createdAt?: string;
}

export interface Feedback360Request {
  appraisalId: string;
  reviewerId: string;
  relationship?: string;
  isAnonymous?: boolean;
}

export interface Feedback360SubmitRequest {
  rating: number;
  feedbackText?: string;
}
