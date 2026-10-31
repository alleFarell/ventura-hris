export type DepartmentPayload = {
  companyId: string;
  code: string;
  name: string;
  description?: string;
  status?: string;
  parentUnitId?: string;
};

export type DepartmentResponse = {
  id: string;
  companyId: string;
  companyCode: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type DivisionPayload = {
  companyId: string;
  departmentId: string;
  code: string;
  name: string;
  status?: string;
  parentUnitId?: string;
};

export type DivisionResponse = {
  id: string;
  companyId: string;
  departmentId: string;
  departmentName: string;
  code: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type GradePayload = {
  companyId: string;
  code: string;
  name: string;
  sortOrder: number;
  status?: string;
};

export type GradeResponse = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type JobLevelPayload = {
  companyId: string;
  code: string;
  name: string;
  sortOrder: number;
  status?: string;
};

export type JobLevelResponse = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PositionPayload = {
  companyId: string;
  departmentId?: string;
  divisionId?: string;
  gradeId?: string;
  jobLevelId?: string;
  code: string;
  name: string;
  status?: string;
  parentUnitId?: string;
};

export type PositionResponse = {
  id: string;
  companyId: string;
  departmentId?: string;
  departmentName?: string;
  divisionId?: string;
  divisionName?: string;
  gradeId?: string;
  gradeName?: string;
  jobLevelId?: string;
  jobLevelName?: string;
  code: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type OrganizationUnitResponse = {
  id: string;
  companyId: string;
  parentUnitId?: string;
  parentUnitName?: string;
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  code: string;
  name: string;
  unitType: "DEPARTMENT" | "DIVISION" | "POSITION";
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type OrganizationTreeNodeResponse = {
  id: string;
  companyId: string;
  parentUnitId?: string;
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  code: string;
  name: string;
  unitType: string;
  status: string;
  children: OrganizationTreeNodeResponse[];
};

export type MoveOrganizationUnitPayload = {
  newParentUnitId?: string;
  effectiveDate: string;
  reason?: string;
};

export type StructureHistoryResponse = {
  id: string;
  organizationUnitId: string;
  organizationUnitName: string;
  oldParentUnitId?: string;
  oldParentUnitName?: string;
  newParentUnitId?: string;
  newParentUnitName?: string;
  effectiveDate: string;
  reason?: string;
  createdAt: string;
};
