export interface TrainingCourse {
  id: string;
  companyId: string;
  companyName?: string;
  code: string;
  title: string;
  category: "TECHNICAL" | "LEADERSHIP" | "COMPLIANCE" | "SOFT_SKILLS" | string;
  providerName?: string;
  durationHours: number;
  cost: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingCourseRequest {
  companyId: string;
  code: string;
  title: string;
  category?: string;
  providerName?: string;
  durationHours?: number;
  cost?: number;
  isActive?: boolean;
  description?: string;
}

export interface TrainingSession {
  id: string;
  courseId: string;
  courseCode?: string;
  courseTitle?: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  location?: string;
  capacity: number;
  enrolledCount: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  instructorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingSessionRequest {
  courseId: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  location?: string;
  capacity?: number;
  status?: string;
  instructorName?: string;
}

export interface TrainingEnrollment {
  id: string;
  sessionId: string;
  sessionName?: string;
  courseTitle?: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  status: "REQUESTED" | "APPROVED" | "ATTENDED" | "COMPLETED" | "CANCELLED";
  score?: number;
  certificateUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingEnrollmentRequest {
  sessionId: string;
  employeeId: string;
  status?: string;
}

export interface EnrollmentStatusUpdateRequest {
  status: string;
  score?: number;
  certificateUrl?: string;
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  certificationName: string;
  issuingOrganization: string;
  credentialId?: string;
  issueDate: string;
  expirationDate?: string;
  verificationUrl?: string;
  isExpired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeCertificationRequest {
  employeeId: string;
  certificationName: string;
  issuingOrganization: string;
  credentialId?: string;
  issueDate: string;
  expirationDate?: string;
  verificationUrl?: string;
}
