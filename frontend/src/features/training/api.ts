import { apiClient } from "@/lib/api/client";
import {
  TrainingCourse,
  TrainingCourseRequest,
  TrainingSession,
  TrainingSessionRequest,
  TrainingEnrollment,
  TrainingEnrollmentRequest,
  EnrollmentStatusUpdateRequest,
  EmployeeCertification,
  EmployeeCertificationRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const trainingApi = {
  // Courses
  async getCourses(companyId?: string): Promise<TrainingCourse[]> {
    const res = await apiClient.get<ApiResponse<TrainingCourse[]>>("/training/courses", {
      params: { companyId },
    });
    return res.data.data;
  },

  async getCourse(id: string): Promise<TrainingCourse> {
    const res = await apiClient.get<ApiResponse<TrainingCourse>>(`/training/courses/${id}`);
    return res.data.data;
  },

  async createCourse(req: TrainingCourseRequest): Promise<TrainingCourse> {
    const res = await apiClient.post<ApiResponse<TrainingCourse>>("/training/courses", req);
    return res.data.data;
  },

  // Sessions
  async getSessions(courseId?: string, status?: string): Promise<TrainingSession[]> {
    const res = await apiClient.get<ApiResponse<TrainingSession[]>>("/training/sessions", {
      params: { courseId, status },
    });
    return res.data.data;
  },

  async getSession(id: string): Promise<TrainingSession> {
    const res = await apiClient.get<ApiResponse<TrainingSession>>(`/training/sessions/${id}`);
    return res.data.data;
  },

  async createSession(req: TrainingSessionRequest): Promise<TrainingSession> {
    const res = await apiClient.post<ApiResponse<TrainingSession>>("/training/sessions", req);
    return res.data.data;
  },

  async updateSessionStatus(id: string, status: string): Promise<TrainingSession> {
    const res = await apiClient.patch<ApiResponse<TrainingSession>>(`/training/sessions/${id}/status`, null, {
      params: { status },
    });
    return res.data.data;
  },

  // Enrollments
  async getEnrollments(sessionId?: string, employeeId?: string): Promise<TrainingEnrollment[]> {
    const res = await apiClient.get<ApiResponse<TrainingEnrollment[]>>("/training/enrollments", {
      params: { sessionId, employeeId },
    });
    return res.data.data;
  },

  async enrollEmployee(req: TrainingEnrollmentRequest): Promise<TrainingEnrollment> {
    const res = await apiClient.post<ApiResponse<TrainingEnrollment>>("/training/enrollments", req);
    return res.data.data;
  },

  async updateEnrollmentStatus(id: string, req: EnrollmentStatusUpdateRequest): Promise<TrainingEnrollment> {
    const res = await apiClient.put<ApiResponse<TrainingEnrollment>>(`/training/enrollments/${id}/status`, req);
    return res.data.data;
  },

  // Certifications
  async getCertifications(employeeId?: string): Promise<EmployeeCertification[]> {
    const res = await apiClient.get<ApiResponse<EmployeeCertification[]>>("/training/certifications", {
      params: { employeeId },
    });
    return res.data.data;
  },

  async createCertification(req: EmployeeCertificationRequest): Promise<EmployeeCertification> {
    const res = await apiClient.post<ApiResponse<EmployeeCertification>>("/training/certifications", req);
    return res.data.data;
  },

  async deleteCertification(id: string): Promise<void> {
    await apiClient.delete(`/training/certifications/${id}`);
  },
};
