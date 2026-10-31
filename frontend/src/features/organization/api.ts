import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  DepartmentPayload,
  DepartmentResponse,
  DivisionPayload,
  DivisionResponse,
  GradePayload,
  GradeResponse,
  JobLevelPayload,
  JobLevelResponse,
  MoveOrganizationUnitPayload,
  OrganizationTreeNodeResponse,
  OrganizationUnitResponse,
  PositionPayload,
  PositionResponse,
  StructureHistoryResponse,
} from "./types";

// ==================== DEPARTMENTS ====================

export async function getDepartments(companyId?: string, search?: string, status?: string): Promise<DepartmentResponse[]> {
  const response = await apiClient.get<ApiResponse<DepartmentResponse[]>>("/departments", {
    params: { companyId, search, status, size: 100 },
  });
  return response.data.data ?? [];
}

export async function createDepartment(payload: DepartmentPayload): Promise<ApiResponse<DepartmentResponse>> {
  const response = await apiClient.post<ApiResponse<DepartmentResponse>>("/departments", payload);
  return response.data;
}

export async function updateDepartment(
  id: string,
  payload: { name: string; description?: string; status?: string }
): Promise<ApiResponse<DepartmentResponse>> {
  const response = await apiClient.put<ApiResponse<DepartmentResponse>>(`/departments/${id}`, payload);
  return response.data;
}

export async function deleteDepartment(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/departments/${id}`);
  return response.data;
}

// ==================== DIVISIONS ====================

export async function getDivisions(
  companyId?: string,
  departmentId?: string,
  search?: string,
  status?: string
): Promise<DivisionResponse[]> {
  const response = await apiClient.get<ApiResponse<DivisionResponse[]>>("/divisions", {
    params: { companyId, departmentId, search, status, size: 100 },
  });
  return response.data.data ?? [];
}

export async function createDivision(payload: DivisionPayload): Promise<ApiResponse<DivisionResponse>> {
  const response = await apiClient.post<ApiResponse<DivisionResponse>>("/divisions", payload);
  return response.data;
}

export async function updateDivision(
  id: string,
  payload: { name: string; status?: string }
): Promise<ApiResponse<DivisionResponse>> {
  const response = await apiClient.put<ApiResponse<DivisionResponse>>(`/divisions/${id}`, payload);
  return response.data;
}

export async function deleteDivision(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/divisions/${id}`);
  return response.data;
}

// ==================== GRADES ====================

export async function getGrades(companyId: string): Promise<GradeResponse[]> {
  const response = await apiClient.get<ApiResponse<GradeResponse[]>>("/grades", {
    params: { companyId },
  });
  return response.data.data ?? [];
}

export async function createGrade(payload: GradePayload): Promise<ApiResponse<GradeResponse>> {
  const response = await apiClient.post<ApiResponse<GradeResponse>>("/grades", payload);
  return response.data;
}

export async function updateGrade(
  id: string,
  payload: { name: string; sortOrder: number; status?: string }
): Promise<ApiResponse<GradeResponse>> {
  const response = await apiClient.put<ApiResponse<GradeResponse>>(`/grades/${id}`, payload);
  return response.data;
}

export async function deleteGrade(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/grades/${id}`);
  return response.data;
}

// ==================== JOB LEVELS ====================

export async function getJobLevels(companyId: string): Promise<JobLevelResponse[]> {
  const response = await apiClient.get<ApiResponse<JobLevelResponse[]>>("/job-levels", {
    params: { companyId },
  });
  return response.data.data ?? [];
}

export async function createJobLevel(payload: JobLevelPayload): Promise<ApiResponse<JobLevelResponse>> {
  const response = await apiClient.post<ApiResponse<JobLevelResponse>>("/job-levels", payload);
  return response.data;
}

export async function updateJobLevel(
  id: string,
  payload: { name: string; sortOrder: number; status?: string }
): Promise<ApiResponse<JobLevelResponse>> {
  const response = await apiClient.put<ApiResponse<JobLevelResponse>>(`/job-levels/${id}`, payload);
  return response.data;
}

export async function deleteJobLevel(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/job-levels/${id}`);
  return response.data;
}

// ==================== POSITIONS ====================

export async function getPositions(
  companyId?: string,
  departmentId?: string,
  divisionId?: string,
  gradeId?: string,
  jobLevelId?: string,
  search?: string,
  status?: string
): Promise<PositionResponse[]> {
  const response = await apiClient.get<ApiResponse<PositionResponse[]>>("/positions", {
    params: { companyId, departmentId, divisionId, gradeId, jobLevelId, search, status, size: 100 },
  });
  return response.data.data ?? [];
}

export async function createPosition(payload: PositionPayload): Promise<ApiResponse<PositionResponse>> {
  const response = await apiClient.post<ApiResponse<PositionResponse>>("/positions", payload);
  return response.data;
}

export async function updatePosition(
  id: string,
  payload: { departmentId?: string; divisionId?: string; gradeId?: string; jobLevelId?: string; name: string; status?: string }
): Promise<ApiResponse<PositionResponse>> {
  const response = await apiClient.put<ApiResponse<PositionResponse>>(`/positions/${id}`, payload);
  return response.data;
}

export async function deletePosition(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/positions/${id}`);
  return response.data;
}

// ==================== HIERARCHY TREE & UNITS ====================

export async function getOrganizationTree(companyId: string): Promise<OrganizationTreeNodeResponse[]> {
  const response = await apiClient.get<ApiResponse<OrganizationTreeNodeResponse[]>>("/organization-units/tree", {
    params: { companyId },
  });
  return response.data.data ?? [];
}

export async function getOrganizationUnits(companyId: string): Promise<OrganizationUnitResponse[]> {
  const response = await apiClient.get<ApiResponse<OrganizationUnitResponse[]>>("/organization-units", {
    params: { companyId },
  });
  return response.data.data ?? [];
}

export async function moveUnitParent(
  id: string,
  payload: MoveOrganizationUnitPayload
): Promise<ApiResponse<OrganizationUnitResponse>> {
  const response = await apiClient.put<ApiResponse<OrganizationUnitResponse>>(`/organization-units/${id}/parent`, payload);
  return response.data;
}

export async function getUnitHistory(id: string): Promise<StructureHistoryResponse[]> {
  const response = await apiClient.get<ApiResponse<StructureHistoryResponse[]>>(`/organization-units/${id}/history`);
  return response.data.data ?? [];
}
