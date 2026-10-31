export type EmploymentStatus = "CANDIDATE" | "PROBATION" | "ACTIVE" | "SUSPENDED" | "TERMINATED";

export type ContractType = "PERMANENT" | "FIXED_TERM" | "INTERNSHIP" | "CONSULTANT";

export type EmployeePayload = {
  companyId: string;
  branchId: string;
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  gradeId?: string;
  jobLevelId?: string;
  employeeNumber: string;
  firstName: string;
  lastName?: string;
  workEmail?: string;
  employmentStatus?: EmploymentStatus;
  hireDate?: string;
};

export type EmployeeUpdatePayload = {
  branchId: string;
  departmentId?: string;
  divisionId?: string;
  positionId?: string;
  gradeId?: string;
  jobLevelId?: string;
  firstName: string;
  lastName?: string;
  workEmail?: string;
  hireDate?: string;
};

export type EmployeeSummaryResponse = {
  id: string;
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  departmentId?: string;
  departmentName?: string;
  divisionId?: string;
  divisionName?: string;
  positionId?: string;
  positionName?: string;
  gradeId?: string;
  gradeName?: string;
  jobLevelId?: string;
  jobLevelName?: string;
  employeeNumber: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  workEmail?: string;
  employmentStatus: EmploymentStatus;
  hireDate?: string;
  terminationDate?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PersonalInformationPayload = {
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  identityNumber?: string;
  taxNumber?: string;
  personalEmail?: string;
  personalPhone?: string;
  address?: string;
};

export type PersonalInformationResponse = PersonalInformationPayload & {
  id: string;
  employeeId: string;
  updatedAt?: string;
};

export type EmergencyContactPayload = {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  primaryContact: boolean;
};

export type EmergencyContactResponse = EmergencyContactPayload & {
  id: string;
  employeeId: string;
  createdAt: string;
};

export type ContractPayload = {
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  status?: string;
  documentId?: string;
};

export type ContractResponse = {
  id: string;
  employeeId: string;
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  status: string;
  documentId?: string;
  createdAt: string;
  version: number;
};

export type ChangeStatusPayload = {
  newStatus: EmploymentStatus;
  effectiveDate: string;
  reason?: string;
};

export type StatusHistoryResponse = {
  id: string;
  employeeId: string;
  oldStatus?: string;
  newStatus: string;
  effectiveDate: string;
  reason?: string;
  createdAt: string;
};

export type DocumentPayload = {
  documentType: string;
  fileName: string;
  storageReference?: string;
  accessClassification?: string;
  retentionCategory?: string;
  expiresAt?: string;
  status?: string;
};

export type DocumentResponse = DocumentPayload & {
  id: string;
  employeeId: string;
  createdAt: string;
};
