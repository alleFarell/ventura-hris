export interface JobRequisition {
  id: string;
  requisitionNumber: string;
  title: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionTitle?: string;
  headcount: number;
  employmentType: string;
  minSalary?: number;
  maxSalary?: number;
  justification?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CLOSED";
  requestedById?: string;
  requestedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt?: string;
}

export interface JobRequisitionRequest {
  title: string;
  departmentId?: string;
  positionId?: string;
  headcount: number;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  justification?: string;
  requestedBy?: string;
}

export interface JobPosting {
  id: string;
  requisitionId: string;
  requisitionNumber?: string;
  postingTitle: string;
  description: string;
  requirements?: string;
  location?: string;
  isPublished: boolean;
  closingDate?: string;
  createdAt?: string;
}

export interface JobPostingRequest {
  requisitionId: string;
  postingTitle: string;
  description: string;
  requirements?: string;
  location?: string;
  isPublished?: boolean;
  closingDate?: string;
}

export interface JobCandidate {
  id: string;
  candidateNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt?: string;
}

export interface JobCandidateRequest {
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  postingTitle?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  resumeUrl?: string;
  applicationNumber: string;
  applicationDate: string;
  currentStage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED";
  rating?: number;
  notes?: string;
  createdAt?: string;
}

export interface JobApplicationRequest {
  jobPostingId: string;
  candidateId: string;
  applicationDate?: string;
  notes?: string;
}

export interface JobApplicationStageUpdateRequest {
  stage: string;
  rating?: number;
  notes?: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  applicationNumber?: string;
  candidateName?: string;
  jobTitle?: string;
  roundName: string;
  scheduledTime: string;
  durationMinutes: number;
  interviewerId?: string;
  interviewerName?: string;
  locationUrl?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  notes?: string;
  createdAt?: string;
}

export interface InterviewScheduleRequest {
  applicationId: string;
  roundName: string;
  scheduledTime: string;
  durationMinutes?: number;
  interviewerId?: string;
  locationUrl?: string;
  notes?: string;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  interviewerId?: string;
  interviewerName?: string;
  score: number;
  verdict: string;
  feedbackNotes?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface InterviewEvaluationRequest {
  interviewerId?: string;
  score: number;
  verdict: string;
  feedbackNotes?: string;
}

export interface JobOffer {
  id: string;
  applicationId: string;
  applicationNumber?: string;
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  offerNumber: string;
  offeredSalary: number;
  allowanceAmount?: number;
  joinDate: string;
  expirationDate: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  letterUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface JobOfferRequest {
  applicationId: string;
  offeredSalary: number;
  allowanceAmount?: number;
  joinDate: string;
  expirationDate: string;
  letterUrl?: string;
  notes?: string;
}

export interface JobOfferStatusUpdateRequest {
  status: string;
  notes?: string;
}

