import { apiClient } from "@/lib/api/client";
import {
  AssetCategory,
  AssetCategoryRequest,
  CompanyAsset,
  CompanyAssetRequest,
  AssetAllocation,
  AssetAllocationRequest,
  AssetReturnRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const assetApi = {
  // Categories
  async getCategories(companyId?: string): Promise<AssetCategory[]> {
    const res = await apiClient.get<ApiResponse<AssetCategory[]>>("/assets/categories", {
      params: { companyId },
    });
    return res.data.data;
  },

  async createCategory(req: AssetCategoryRequest): Promise<AssetCategory> {
    const res = await apiClient.post<ApiResponse<AssetCategory>>("/assets/categories", req);
    return res.data.data;
  },

  // Assets
  async getAssets(companyId?: string, categoryId?: string, status?: string): Promise<CompanyAsset[]> {
    const res = await apiClient.get<ApiResponse<CompanyAsset[]>>("/assets", {
      params: { companyId, categoryId, status },
    });
    return res.data.data;
  },

  async getAsset(id: string): Promise<CompanyAsset> {
    const res = await apiClient.get<ApiResponse<CompanyAsset>>(`/assets/${id}`);
    return res.data.data;
  },

  async createAsset(req: CompanyAssetRequest): Promise<CompanyAsset> {
    const res = await apiClient.post<ApiResponse<CompanyAsset>>("/assets", req);
    return res.data.data;
  },

  async updateAsset(id: string, req: CompanyAssetRequest): Promise<CompanyAsset> {
    const res = await apiClient.put<ApiResponse<CompanyAsset>>(`/assets/${id}`, req);
    return res.data.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/assets/${id}`);
  },

  async updateAssetStatus(id: string, status: string, conditionGrade?: string): Promise<CompanyAsset> {
    const res = await apiClient.patch<ApiResponse<CompanyAsset>>(`/assets/${id}/status`, null, {
      params: { status, conditionGrade },
    });
    return res.data.data;
  },

  // Allocations
  async getAllocations(assetId?: string, employeeId?: string, status?: string): Promise<AssetAllocation[]> {
    const res = await apiClient.get<ApiResponse<AssetAllocation[]>>("/assets/allocations", {
      params: { assetId, employeeId, status },
    });
    return res.data.data;
  },

  async allocateAsset(req: AssetAllocationRequest): Promise<AssetAllocation> {
    const res = await apiClient.post<ApiResponse<AssetAllocation>>("/assets/allocations", req);
    return res.data.data;
  },

  async returnAsset(allocationId: string, req: AssetReturnRequest): Promise<AssetAllocation> {
    const res = await apiClient.put<ApiResponse<AssetAllocation>>(`/assets/allocations/${allocationId}/return`, req);
    return res.data.data;
  },
};
