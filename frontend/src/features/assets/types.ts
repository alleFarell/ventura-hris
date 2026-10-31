export interface AssetCategory {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetCategoryRequest {
  companyId: string;
  code: string;
  name: string;
  description?: string;
}

export interface CompanyAsset {
  id: string;
  companyId: string;
  categoryId: string;
  categoryName?: string;
  assetTag: string;
  name: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  status: "AVAILABLE" | "ALLOCATED" | "MAINTENANCE" | "DISPOSED" | string;
  conditionGrade: "EXCELLENT" | "GOOD" | "FAIR" | "DAMAGED" | string;
  notes?: string;
  assignedToEmployeeId?: string;
  assignedToEmployeeName?: string;
  assignedToEmployeeNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyAssetRequest {
  companyId: string;
  categoryId: string;
  assetTag: string;
  name: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost?: number;
  status?: string;
  conditionGrade?: string;
  notes?: string;
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  assetTag?: string;
  assetName?: string;
  assetModel?: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  allocatedDate: string;
  returnDate?: string;
  handoverNotes?: string;
  returnNotes?: string;
  status: "ACTIVE" | "RETURNED" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetAllocationRequest {
  assetId: string;
  employeeId: string;
  allocatedDate: string;
  handoverNotes?: string;
}

export interface AssetReturnRequest {
  returnDate: string;
  returnNotes?: string;
  conditionGrade?: string;
}
