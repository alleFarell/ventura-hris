import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export type CompanyPayload = {
  code: string;
  name: string;
  legalName: string;
  taxIdentifier?: string;
  defaultLocale: string;
  defaultTimezone: string;
  defaultCurrency: string;
  defaultDateFormat: string;
  status: string;
};

export type CompanyResponse = CompanyPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type BranchPayload = {
  companyId: string;
  code: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  countryCode?: string;
  status: string;
};

export type BranchResponse = BranchPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function createCompany(payload: CompanyPayload): Promise<ApiResponse<CompanyResponse>> {
  const response = await apiClient.post<ApiResponse<CompanyResponse>>("/companies", payload);
  return response.data;
}

export async function updateCompany(
  id: string,
  payload: Partial<CompanyPayload>
): Promise<ApiResponse<CompanyResponse>> {
  const response = await apiClient.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, payload);
  return response.data;
}

export async function deleteCompany(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/companies/${id}`);
  return response.data;
}

export async function getCompanies(search?: string, status?: string): Promise<CompanyResponse[]> {
  const response = await apiClient.get<ApiResponse<CompanyResponse[]>>("/companies", {
    params: { search, status },
  });
  return response.data.data ?? [];
}

export async function createBranch(payload: BranchPayload): Promise<ApiResponse<BranchResponse>> {
  const response = await apiClient.post<ApiResponse<BranchResponse>>("/branches", payload);
  return response.data;
}

export async function updateBranch(
  id: string,
  payload: Partial<BranchPayload>
): Promise<ApiResponse<BranchResponse>> {
  const response = await apiClient.put<ApiResponse<BranchResponse>>(`/branches/${id}`, payload);
  return response.data;
}

export async function deleteBranch(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/branches/${id}`);
  return response.data;
}

export async function getBranches(companyId?: string): Promise<BranchResponse[]> {
  const response = await apiClient.get<ApiResponse<BranchResponse[]>>("/branches", {
    params: { companyId },
  });
  return response.data.data ?? [];
}
