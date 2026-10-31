import { apiClient } from "@/lib/api/client";
import {
  OffboardingCase,
  OffboardingCaseRequest,
  OffboardingChecklist,
  ChecklistClearRequest,
  ExitInterview,
  ExitInterviewRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const offboardingApi = {
  // Cases
  async getCases(employeeId?: string, status?: string): Promise<OffboardingCase[]> {
    const res = await apiClient.get<ApiResponse<OffboardingCase[]>>("/offboarding/cases", {
      params: { employeeId, status },
    });
    return res.data.data;
  },

  async getCase(id: string): Promise<OffboardingCase> {
    const res = await apiClient.get<ApiResponse<OffboardingCase>>(`/offboarding/cases/${id}`);
    return res.data.data;
  },

  async createCase(req: OffboardingCaseRequest): Promise<OffboardingCase> {
    const res = await apiClient.post<ApiResponse<OffboardingCase>>("/offboarding/cases", req);
    return res.data.data;
  },

  async cancelCase(id: string): Promise<OffboardingCase> {
    const res = await apiClient.patch<ApiResponse<OffboardingCase>>(`/offboarding/cases/${id}/cancel`);
    return res.data.data;
  },

  // Checklists
  async getChecklists(caseId: string): Promise<OffboardingChecklist[]> {
    const res = await apiClient.get<ApiResponse<OffboardingChecklist[]>>(`/offboarding/checklists/${caseId}`);
    return res.data.data;
  },

  async clearItem(itemId: string, req: ChecklistClearRequest): Promise<OffboardingChecklist> {
    const res = await apiClient.put<ApiResponse<OffboardingChecklist>>(`/offboarding/checklists/${itemId}/clear`, req);
    return res.data.data;
  },

  // Exit Interviews
  async getExitInterview(caseId: string): Promise<ExitInterview> {
    const res = await apiClient.get<ApiResponse<ExitInterview>>(`/offboarding/exit-interviews/${caseId}`);
    return res.data.data;
  },

  async submitExitInterview(req: ExitInterviewRequest): Promise<ExitInterview> {
    const res = await apiClient.post<ApiResponse<ExitInterview>>("/offboarding/exit-interviews", req);
    return res.data.data;
  },
};
