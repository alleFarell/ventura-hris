import { apiClient } from "@/lib/api/client";
import {
  JobRequisition,
  JobRequisitionRequest,
  JobPosting,
  JobPostingRequest,
  JobCandidate,
  JobCandidateRequest,
  JobApplication,
  JobApplicationRequest,
  JobApplicationStageUpdateRequest,
  InterviewSchedule,
  InterviewScheduleRequest,
  InterviewEvaluation,
  InterviewEvaluationRequest,
  JobOffer,
  JobOfferRequest,
  JobOfferStatusUpdateRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const recruitmentApi = {
  // Job Requisitions
  async getRequisitions(status?: string, departmentId?: string): Promise<JobRequisition[]> {
    const res = await apiClient.get<ApiResponse<JobRequisition[]>>("/recruitment/requisitions", {
      params: { status, departmentId },
    });
    return res.data.data;
  },

  async getRequisition(id: string): Promise<JobRequisition> {
    const res = await apiClient.get<ApiResponse<JobRequisition>>(`/recruitment/requisitions/${id}`);
    return res.data.data;
  },

  async createRequisition(req: JobRequisitionRequest): Promise<JobRequisition> {
    const res = await apiClient.post<ApiResponse<JobRequisition>>("/recruitment/requisitions", req);
    return res.data.data;
  },

  async submitRequisition(id: string): Promise<JobRequisition> {
    const res = await apiClient.put<ApiResponse<JobRequisition>>(`/recruitment/requisitions/${id}/submit`);
    return res.data.data;
  },

  async approveRequisition(id: string, approverId?: string): Promise<JobRequisition> {
    const res = await apiClient.put<ApiResponse<JobRequisition>>(`/recruitment/requisitions/${id}/approve`, {
      approverId,
    });
    return res.data.data;
  },

  // Job Postings
  async getPostings(publishedOnly = false): Promise<JobPosting[]> {
    const res = await apiClient.get<ApiResponse<JobPosting[]>>("/recruitment/postings", {
      params: { publishedOnly },
    });
    return res.data.data;
  },

  async getPosting(id: string): Promise<JobPosting> {
    const res = await apiClient.get<ApiResponse<JobPosting>>(`/recruitment/postings/${id}`);
    return res.data.data;
  },

  async createPosting(req: JobPostingRequest): Promise<JobPosting> {
    const res = await apiClient.post<ApiResponse<JobPosting>>("/recruitment/postings", req);
    return res.data.data;
  },

  async publishPosting(id: string, publish = true): Promise<JobPosting> {
    const res = await apiClient.put<ApiResponse<JobPosting>>(`/recruitment/postings/${id}/publish`, {
      publish,
    });
    return res.data.data;
  },

  // Candidates
  async getCandidates(): Promise<JobCandidate[]> {
    const res = await apiClient.get<ApiResponse<JobCandidate[]>>("/recruitment/candidates");
    return res.data.data;
  },

  async getCandidate(id: string): Promise<JobCandidate> {
    const res = await apiClient.get<ApiResponse<JobCandidate>>(`/recruitment/candidates/${id}`);
    return res.data.data;
  },

  async registerCandidate(req: JobCandidateRequest): Promise<JobCandidate> {
    const res = await apiClient.post<ApiResponse<JobCandidate>>("/recruitment/candidates", req);
    return res.data.data;
  },

  // Applications
  async getApplications(postingId?: string, stage?: string): Promise<JobApplication[]> {
    const res = await apiClient.get<ApiResponse<JobApplication[]>>("/recruitment/applications", {
      params: { postingId, stage },
    });
    return res.data.data;
  },

  async getApplicationsByJobPosting(postingId: string): Promise<JobApplication[]> {
    const res = await apiClient.get<ApiResponse<JobApplication[]>>("/recruitment/applications", {
      params: { postingId },
    });
    return res.data.data;
  },

  async getApplication(id: string): Promise<JobApplication> {
    const res = await apiClient.get<ApiResponse<JobApplication>>(`/recruitment/applications/${id}`);
    return res.data.data;
  },

  async applyJob(req: JobApplicationRequest): Promise<JobApplication> {
    const res = await apiClient.post<ApiResponse<JobApplication>>("/recruitment/applications", req);
    return res.data.data;
  },

  async updateStage(id: string, req: JobApplicationStageUpdateRequest): Promise<JobApplication> {
    const res = await apiClient.put<ApiResponse<JobApplication>>(`/recruitment/applications/${id}/stage`, req);
    return res.data.data;
  },

  // Interviews
  async getInterviews(applicationId?: string, status?: string): Promise<InterviewSchedule[]> {
    const res = await apiClient.get<ApiResponse<InterviewSchedule[]>>("/recruitment/interviews", {
      params: { applicationId, status },
    });
    return res.data.data;
  },

  async getInterviewsByApplication(applicationId: string): Promise<InterviewSchedule[]> {
    const res = await apiClient.get<ApiResponse<InterviewSchedule[]>>("/recruitment/interviews", {
      params: { applicationId },
    });
    return res.data.data;
  },

  async getInterview(id: string): Promise<InterviewSchedule> {
    const res = await apiClient.get<ApiResponse<InterviewSchedule>>(`/recruitment/interviews/${id}`);
    return res.data.data;
  },

  async scheduleInterview(req: InterviewScheduleRequest): Promise<InterviewSchedule> {
    const res = await apiClient.post<ApiResponse<InterviewSchedule>>("/recruitment/interviews", req);
    return res.data.data;
  },

  async submitEvaluation(interviewId: string, req: InterviewEvaluationRequest): Promise<InterviewEvaluation> {
    const res = await apiClient.post<ApiResponse<InterviewEvaluation>>(`/recruitment/interviews/${interviewId}/evaluations`, req);
    return res.data.data;
  },

  async getEvaluations(interviewId: string): Promise<InterviewEvaluation[]> {
    const res = await apiClient.get<ApiResponse<InterviewEvaluation[]>>(`/recruitment/interviews/${interviewId}/evaluations`);
    return res.data.data;
  },

  // Job Offers
  async getOffers(applicationId?: string, status?: string): Promise<JobOffer[]> {
    const res = await apiClient.get<ApiResponse<JobOffer[]>>("/recruitment/offers", {
      params: { applicationId, status },
    });
    return res.data.data;
  },

  async getOffer(id: string): Promise<JobOffer> {
    const res = await apiClient.get<ApiResponse<JobOffer>>(`/recruitment/offers/${id}`);
    return res.data.data;
  },

  async createOffer(req: JobOfferRequest): Promise<JobOffer> {
    const res = await apiClient.post<ApiResponse<JobOffer>>("/recruitment/offers", req);
    return res.data.data;
  },

  async updateOfferStatus(id: string, req: JobOfferStatusUpdateRequest): Promise<JobOffer> {
    const res = await apiClient.patch<ApiResponse<JobOffer>>(`/recruitment/offers/${id}/status`, req);
    return res.data.data;
  },
};
