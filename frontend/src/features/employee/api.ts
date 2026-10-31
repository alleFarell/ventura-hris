import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  ChangeStatusPayload,
  ContractPayload,
  ContractResponse,
  DocumentPayload,
  DocumentResponse,
  EmergencyContactPayload,
  EmergencyContactResponse,
  EmployeePayload,
  EmployeeSummaryResponse,
  EmployeeUpdatePayload,
  PersonalInformationPayload,
  PersonalInformationResponse,
  StatusHistoryResponse,
} from "./types";

// ==================== EMPLOYEES ====================

export async function getEmployees(params?: {
  search?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  positionId?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<EmployeeSummaryResponse[]> {
  const response = await apiClient.get<ApiResponse<EmployeeSummaryResponse[]>>("/employees", {
    params: { size: 50, ...params },
  });
  return response.data.data ?? [];
}

export async function getEmployee(id: string): Promise<EmployeeSummaryResponse> {
  const response = await apiClient.get<ApiResponse<EmployeeSummaryResponse>>(`/employees/${id}`);
  return response.data.data!;
}

export async function createEmployee(payload: EmployeePayload): Promise<ApiResponse<EmployeeSummaryResponse>> {
  const response = await apiClient.post<ApiResponse<EmployeeSummaryResponse>>("/employees", payload);
  return response.data;
}

export async function updateEmployee(
  id: string,
  payload: EmployeeUpdatePayload
): Promise<ApiResponse<EmployeeSummaryResponse>> {
  const response = await apiClient.put<ApiResponse<EmployeeSummaryResponse>>(`/employees/${id}`, payload);
  return response.data;
}

export async function deleteEmployee(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/employees/${id}`);
  return response.data;
}

// ==================== PERSONAL INFORMATION ====================

export async function getPersonalInformation(employeeId: string): Promise<PersonalInformationResponse> {
  const response = await apiClient.get<ApiResponse<PersonalInformationResponse>>(
    `/employees/${employeeId}/personal-information`
  );
  return response.data.data!;
}

export async function updatePersonalInformation(
  employeeId: string,
  payload: PersonalInformationPayload
): Promise<ApiResponse<PersonalInformationResponse>> {
  const response = await apiClient.put<ApiResponse<PersonalInformationResponse>>(
    `/employees/${employeeId}/personal-information`,
    payload
  );
  return response.data;
}

// ==================== EMERGENCY CONTACTS ====================

export async function getEmergencyContacts(employeeId: string): Promise<EmergencyContactResponse[]> {
  const response = await apiClient.get<ApiResponse<EmergencyContactResponse[]>>(
    `/employees/${employeeId}/emergency-contacts`
  );
  return response.data.data ?? [];
}

export async function createEmergencyContact(
  employeeId: string,
  payload: EmergencyContactPayload
): Promise<ApiResponse<EmergencyContactResponse>> {
  const response = await apiClient.post<ApiResponse<EmergencyContactResponse>>(
    `/employees/${employeeId}/emergency-contacts`,
    payload
  );
  return response.data;
}

export async function deleteEmergencyContact(
  employeeId: string,
  contactId: string
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/employees/${employeeId}/emergency-contacts/${contactId}`
  );
  return response.data;
}

// ==================== CONTRACTS ====================

export async function getContracts(employeeId: string): Promise<ContractResponse[]> {
  const response = await apiClient.get<ApiResponse<ContractResponse[]>>(`/employees/${employeeId}/contracts`);
  return response.data.data ?? [];
}

export async function createContract(
  employeeId: string,
  payload: ContractPayload
): Promise<ApiResponse<ContractResponse>> {
  const response = await apiClient.post<ApiResponse<ContractResponse>>(
    `/employees/${employeeId}/contracts`,
    payload
  );
  return response.data;
}

// ==================== STATUS LIFECYCLE ====================

export async function changeEmployeeStatus(
  employeeId: string,
  payload: ChangeStatusPayload
): Promise<ApiResponse<StatusHistoryResponse>> {
  const response = await apiClient.post<ApiResponse<StatusHistoryResponse>>(
    `/employees/${employeeId}/status-changes`,
    payload
  );
  return response.data;
}

export async function getStatusHistory(employeeId: string): Promise<StatusHistoryResponse[]> {
  const response = await apiClient.get<ApiResponse<StatusHistoryResponse[]>>(
    `/employees/${employeeId}/status-history`
  );
  return response.data.data ?? [];
}

// ==================== DOCUMENTS ====================

export async function getDocuments(employeeId: string): Promise<DocumentResponse[]> {
  const response = await apiClient.get<ApiResponse<DocumentResponse[]>>(`/employees/${employeeId}/documents`);
  return response.data.data ?? [];
}

export async function createDocument(
  employeeId: string,
  payload: DocumentPayload
): Promise<ApiResponse<DocumentResponse>> {
  const response = await apiClient.post<ApiResponse<DocumentResponse>>(
    `/employees/${employeeId}/documents`,
    payload
  );
  return response.data;
}
