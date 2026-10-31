import { apiClient } from "@/lib/api/client";
import {
  PerformanceCycle,
  PerformanceCycleRequest,
  PerformanceCycleStatusUpdateRequest,
  PerformanceGoal,
  PerformanceGoalRequest,
  KeyResultProgressUpdateRequest,
  CompetencyModel,
  CompetencyModelRequest,
  EmployeeAppraisal,
  EmployeeAppraisalRequest,
  AppraisalSelfReviewRequest,
  AppraisalManagerReviewRequest,
  Feedback360,
  Feedback360Request,
  Feedback360SubmitRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const performanceApi = {
  // Cycles
  async getCycles(companyId?: string, status?: string): Promise<PerformanceCycle[]> {
    const res = await apiClient.get<ApiResponse<PerformanceCycle[]>>("/performance/cycles", {
      params: { companyId, status },
    });
    return res.data.data;
  },

  async getCycle(id: string): Promise<PerformanceCycle> {
    const res = await apiClient.get<ApiResponse<PerformanceCycle>>(`/performance/cycles/${id}`);
    return res.data.data;
  },

  async createCycle(req: PerformanceCycleRequest): Promise<PerformanceCycle> {
    const res = await apiClient.post<ApiResponse<PerformanceCycle>>("/performance/cycles", req);
    return res.data.data;
  },

  async updateCycleStatus(id: string, req: PerformanceCycleStatusUpdateRequest): Promise<PerformanceCycle> {
    const res = await apiClient.patch<ApiResponse<PerformanceCycle>>(`/performance/cycles/${id}/status`, req);
    return res.data.data;
  },

  // Goals
  async getGoals(cycleId?: string, employeeId?: string): Promise<PerformanceGoal[]> {
    const res = await apiClient.get<ApiResponse<PerformanceGoal[]>>("/performance/goals", {
      params: { cycleId, employeeId },
    });
    return res.data.data;
  },

  async getGoal(id: string): Promise<PerformanceGoal> {
    const res = await apiClient.get<ApiResponse<PerformanceGoal>>(`/performance/goals/${id}`);
    return res.data.data;
  },

  async createGoal(req: PerformanceGoalRequest): Promise<PerformanceGoal> {
    const res = await apiClient.post<ApiResponse<PerformanceGoal>>("/performance/goals", req);
    return res.data.data;
  },

  async updateKeyResultProgress(
    goalId: string,
    krId: string,
    req: KeyResultProgressUpdateRequest
  ): Promise<PerformanceGoal> {
    const res = await apiClient.put<ApiResponse<PerformanceGoal>>(
      `/performance/goals/${goalId}/key-results/${krId}/progress`,
      req
    );
    return res.data.data;
  },

  // Competencies
  async getCompetencies(companyId?: string, category?: string): Promise<CompetencyModel[]> {
    const res = await apiClient.get<ApiResponse<CompetencyModel[]>>("/performance/competencies", {
      params: { companyId, category },
    });
    return res.data.data;
  },

  async createCompetency(req: CompetencyModelRequest): Promise<CompetencyModel> {
    const res = await apiClient.post<ApiResponse<CompetencyModel>>("/performance/competencies", req);
    return res.data.data;
  },

  // Appraisals
  async getAppraisals(cycleId?: string, employeeId?: string, status?: string): Promise<EmployeeAppraisal[]> {
    const res = await apiClient.get<ApiResponse<EmployeeAppraisal[]>>("/performance/appraisals", {
      params: { cycleId, employeeId, status },
    });
    return res.data.data;
  },

  async getAppraisal(id: string): Promise<EmployeeAppraisal> {
    const res = await apiClient.get<ApiResponse<EmployeeAppraisal>>(`/performance/appraisals/${id}`);
    return res.data.data;
  },

  async initiateAppraisal(req: EmployeeAppraisalRequest): Promise<EmployeeAppraisal> {
    const res = await apiClient.post<ApiResponse<EmployeeAppraisal>>("/performance/appraisals", req);
    return res.data.data;
  },

  async submitSelfReview(id: string, req: AppraisalSelfReviewRequest): Promise<EmployeeAppraisal> {
    const res = await apiClient.put<ApiResponse<EmployeeAppraisal>>(`/performance/appraisals/${id}/submit-self`, req);
    return res.data.data;
  },

  async submitManagerReview(id: string, req: AppraisalManagerReviewRequest): Promise<EmployeeAppraisal> {
    const res = await apiClient.put<ApiResponse<EmployeeAppraisal>>(`/performance/appraisals/${id}/submit-manager`, req);
    return res.data.data;
  },

  // 360 Feedback
  async getFeedbacks(appraisalId?: string, reviewerId?: string): Promise<Feedback360[]> {
    const res = await apiClient.get<ApiResponse<Feedback360[]>>("/performance/feedback", {
      params: { appraisalId, reviewerId },
    });
    return res.data.data;
  },

  async requestFeedback(req: Feedback360Request): Promise<Feedback360> {
    const res = await apiClient.post<ApiResponse<Feedback360>>("/performance/feedback/request", req);
    return res.data.data;
  },

  async submitFeedback(id: string, req: Feedback360SubmitRequest): Promise<Feedback360> {
    const res = await apiClient.post<ApiResponse<Feedback360>>(`/performance/feedback/${id}/respond`, req);
    return res.data.data;
  },
};
