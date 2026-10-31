import { apiClient } from "@/lib/api/client";
import {
  SalaryComponent,
  SalaryComponentCreateRequest,
  SalaryComponentUpdateRequest,
  SalaryStructure,
  SalaryStructureCreateRequest,
  EmployeeSalaryProfile,
  EmployeeSalaryProfileRequest,
  TaxConfiguration,
  TaxConfigurationRequest,
  PtkpConfiguration,
  TaxCalculationRequest,
  TaxCalculationResponse,
  PayrollPeriod,
  PayrollPeriodCreateRequest,
  PayrollAttendanceCutoff,
  PayrollSimulation,
  PayrollRun,
  PayrollRunItem,
  EmployeeLoan,
  EmployeeLoanCreateRequest,
  EmployeeReimbursement,
  EmployeeReimbursementCreateRequest,
  Payslip,
  BankDisbursalBatch,
  BankDisbursalItem,
  BankDisbursalGenerateRequest,
  BpjsConfiguration,
  BpjsConfigurationUpdateRequest,
  EmployeeBpjsEnrollment,
  EmployeeBpjsEnrollmentRequest,
  BpjsCalculationResult,
  BenefitPlan,
  BenefitPlanRequest,
  EmployeeBenefitClaim,
  EmployeeBenefitClaimRequest,
  BenefitClaimStatusUpdateRequest,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const payrollApi = {
  // Salary Components
  async getSalaryComponents(activeOnly = false): Promise<SalaryComponent[]> {
    const res = await apiClient.get<ApiResponse<SalaryComponent[]>>("/payroll/components", {
      params: { activeOnly },
    });
    return res.data.data;
  },

  async createSalaryComponent(req: SalaryComponentCreateRequest): Promise<SalaryComponent> {
    const res = await apiClient.post<ApiResponse<SalaryComponent>>("/payroll/components", req);
    return res.data.data;
  },

  async updateSalaryComponent(id: string, req: SalaryComponentUpdateRequest): Promise<SalaryComponent> {
    const res = await apiClient.put<ApiResponse<SalaryComponent>>(`/payroll/components/${id}`, req);
    return res.data.data;
  },

  // Salary Structures
  async getSalaryStructures(): Promise<SalaryStructure[]> {
    const res = await apiClient.get<ApiResponse<SalaryStructure[]>>("/payroll/structures");
    return res.data.data;
  },

  async getSalaryStructureByGrade(gradeId: string): Promise<SalaryStructure> {
    const res = await apiClient.get<ApiResponse<SalaryStructure>>(`/payroll/structures/grade/${gradeId}`);
    return res.data.data;
  },

  async createOrUpdateSalaryStructure(req: SalaryStructureCreateRequest): Promise<SalaryStructure> {
    const res = await apiClient.post<ApiResponse<SalaryStructure>>("/payroll/structures", req);
    return res.data.data;
  },

  // Employee Compensation
  async getEmployeeCompensation(employeeId: string): Promise<EmployeeSalaryProfile> {
    const res = await apiClient.get<ApiResponse<EmployeeSalaryProfile>>(`/payroll/compensation/${employeeId}`);
    return res.data.data;
  },

  async updateEmployeeCompensation(employeeId: string, req: EmployeeSalaryProfileRequest): Promise<EmployeeSalaryProfile> {
    const res = await apiClient.put<ApiResponse<EmployeeSalaryProfile>>(`/payroll/compensation/${employeeId}`, req);
    return res.data.data;
  },

  // Tax Configuration
  async getTaxBrackets(year?: number): Promise<TaxConfiguration[]> {
    const res = await apiClient.get<ApiResponse<TaxConfiguration[]>>("/payroll/tax-config/brackets", {
      params: year ? { year } : undefined,
    });
    return res.data.data;
  },

  async saveTaxBracket(req: TaxConfigurationRequest): Promise<TaxConfiguration> {
    const res = await apiClient.post<ApiResponse<TaxConfiguration>>("/payroll/tax-config/brackets", req);
    return res.data.data;
  },

  async getPtkpList(): Promise<PtkpConfiguration[]> {
    const res = await apiClient.get<ApiResponse<PtkpConfiguration[]>>("/payroll/tax-config/ptkp");
    return res.data.data;
  },

  async calculateTax(req: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    const res = await apiClient.post<ApiResponse<TaxCalculationResponse>>("/payroll/tax-config/calculate", req);
    return res.data.data;
  },

  // Payroll Periods
  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    const res = await apiClient.get<ApiResponse<PayrollPeriod[]>>("/payroll/periods");
    return res.data.data;
  },

  async getPayrollPeriod(id: string): Promise<PayrollPeriod> {
    const res = await apiClient.get<ApiResponse<PayrollPeriod>>(`/payroll/periods/${id}`);
    return res.data.data;
  },

  async createPayrollPeriod(req: PayrollPeriodCreateRequest): Promise<PayrollPeriod> {
    const res = await apiClient.post<ApiResponse<PayrollPeriod>>("/payroll/periods", req);
    return res.data.data;
  },

  async updatePayrollPeriodStatus(id: string, status: string): Promise<PayrollPeriod> {
    const res = await apiClient.put<ApiResponse<PayrollPeriod>>(`/payroll/periods/${id}/status`, { status });
    return res.data.data;
  },

  // Attendance Integration
  async getAttendanceCutoffs(periodId: string): Promise<PayrollAttendanceCutoff[]> {
    const res = await apiClient.get<ApiResponse<PayrollAttendanceCutoff[]>>(`/payroll/periods/${periodId}/attendance`);
    return res.data.data;
  },

  async ingestAttendance(periodId: string): Promise<PayrollAttendanceCutoff[]> {
    const res = await apiClient.post<ApiResponse<PayrollAttendanceCutoff[]>>(`/payroll/periods/${periodId}/attendance/ingest`);
    return res.data.data;
  },

  // Pre-Payroll Simulation
  async getSimulations(periodId: string): Promise<PayrollSimulation[]> {
    const res = await apiClient.get<ApiResponse<PayrollSimulation[]>>(`/payroll/periods/${periodId}/simulation`);
    return res.data.data;
  },

  async simulatePayroll(periodId: string): Promise<PayrollSimulation[]> {
    const res = await apiClient.post<ApiResponse<PayrollSimulation[]>>(`/payroll/periods/${periodId}/simulation/simulate`);
    return res.data.data;
  },

  // Payroll Runs (Batch Processing)
  async executePayrollRun(req: { periodId: string; executionDate: string }): Promise<PayrollRun> {
    const res = await apiClient.post<ApiResponse<PayrollRun>>("/payroll/runs/execute", req);
    return res.data.data;
  },

  async getPayrollRuns(): Promise<PayrollRun[]> {
    const res = await apiClient.get<ApiResponse<PayrollRun[]>>("/payroll/runs");
    return res.data.data;
  },

  async getPayrollRun(id: string): Promise<PayrollRun> {
    const res = await apiClient.get<ApiResponse<PayrollRun>>(`/payroll/runs/${id}`);
    return res.data.data;
  },

  async getPayrollRunItems(id: string): Promise<PayrollRunItem[]> {
    const res = await apiClient.get<ApiResponse<PayrollRunItem[]>>(`/payroll/runs/${id}/items`);
    return res.data.data;
  },

  async freezePayrollRun(id: string): Promise<PayrollRun> {
    const res = await apiClient.post<ApiResponse<PayrollRun>>(`/payroll/runs/${id}/freeze`);
    return res.data.data;
  },

  // Employee Loans
  async getEmployeeLoans(employeeId?: string): Promise<EmployeeLoan[]> {
    const url = employeeId ? `/payroll/loans?employeeId=${employeeId}` : "/payroll/loans";
    const res = await apiClient.get<ApiResponse<EmployeeLoan[]>>(url);
    return res.data.data;
  },

  async createEmployeeLoan(req: EmployeeLoanCreateRequest): Promise<EmployeeLoan> {
    const res = await apiClient.post<ApiResponse<EmployeeLoan>>("/payroll/loans", req);
    return res.data.data;
  },

  // Employee Reimbursements
  async getEmployeeReimbursements(employeeId?: string, status?: string): Promise<EmployeeReimbursement[]> {
    let url = "/payroll/reimbursements";
    const params = new URLSearchParams();
    if (employeeId) params.append("employeeId", employeeId);
    if (status) params.append("status", status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await apiClient.get<ApiResponse<EmployeeReimbursement[]>>(url);
    return res.data.data;
  },

  async submitEmployeeReimbursement(req: EmployeeReimbursementCreateRequest): Promise<EmployeeReimbursement> {
    const res = await apiClient.post<ApiResponse<EmployeeReimbursement>>("/payroll/reimbursements", req);
    return res.data.data;
  },

  async approveEmployeeReimbursement(id: string): Promise<EmployeeReimbursement> {
    const res = await apiClient.put<ApiResponse<EmployeeReimbursement>>(`/payroll/reimbursements/${id}/approve`);
    return res.data.data;
  },

  async rejectEmployeeReimbursement(id: string): Promise<EmployeeReimbursement> {
    const res = await apiClient.put<ApiResponse<EmployeeReimbursement>>(`/payroll/reimbursements/${id}/reject`);
    return res.data.data;
  },

  // Payslips
  async generatePayslips(payrollRunId: string): Promise<Payslip[]> {
    const res = await apiClient.post<ApiResponse<Payslip[]>>(`/payroll/payslips/generate/${payrollRunId}`);
    return res.data.data;
  },

  async getPayslips(employeeId?: string): Promise<Payslip[]> {
    const url = employeeId ? `/payroll/payslips?employeeId=${employeeId}` : "/payroll/payslips";
    const res = await apiClient.get<ApiResponse<Payslip[]>>(url);
    return res.data.data;
  },

  async getPayslip(id: string): Promise<Payslip> {
    const res = await apiClient.get<ApiResponse<Payslip>>(`/payroll/payslips/${id}`);
    return res.data.data;
  },

  async publishPayslips(payrollRunId: string): Promise<Payslip[]> {
    const res = await apiClient.post<ApiResponse<Payslip[]>>(`/payroll/payslips/publish/${payrollRunId}`);
    return res.data.data;
  },

  // Bank Disbursals
  async generateDisbursalBatch(req: BankDisbursalGenerateRequest): Promise<BankDisbursalBatch> {
    const res = await apiClient.post<ApiResponse<BankDisbursalBatch>>("/payroll/disbursals/generate", req);
    return res.data.data;
  },

  async getDisbursalBatches(): Promise<BankDisbursalBatch[]> {
    const res = await apiClient.get<ApiResponse<BankDisbursalBatch[]>>("/payroll/disbursals");
    return res.data.data;
  },

  async getDisbursalBatch(id: string): Promise<BankDisbursalBatch> {
    const res = await apiClient.get<ApiResponse<BankDisbursalBatch>>(`/payroll/disbursals/${id}`);
    return res.data.data;
  },

  async getDisbursalBatchItems(id: string): Promise<BankDisbursalItem[]> {
    const res = await apiClient.get<ApiResponse<BankDisbursalItem[]>>(`/payroll/disbursals/${id}/items`);
    return res.data.data;
  },

  async updateDisbursalStatus(id: string, status: string): Promise<BankDisbursalBatch> {
    const res = await apiClient.put<ApiResponse<BankDisbursalBatch>>(`/payroll/disbursals/${id}/status`, { status });
    return res.data.data;
  },

  // BPJS Configurations & Calculations
  async getBpjsConfigurations(): Promise<BpjsConfiguration[]> {
    const res = await apiClient.get<ApiResponse<BpjsConfiguration[]>>("/payroll/bpjs");
    return res.data.data;
  },

  async updateBpjsConfiguration(id: string, req: BpjsConfigurationUpdateRequest): Promise<BpjsConfiguration> {
    const res = await apiClient.put<ApiResponse<BpjsConfiguration>>(`/payroll/bpjs/${id}`, req);
    return res.data.data;
  },

  async enrollEmployeeBpjs(req: EmployeeBpjsEnrollmentRequest): Promise<EmployeeBpjsEnrollment> {
    const res = await apiClient.post<ApiResponse<EmployeeBpjsEnrollment>>("/payroll/bpjs/enrollments", req);
    return res.data.data;
  },

  async getEmployeeBpjsEnrollment(employeeId: string): Promise<EmployeeBpjsEnrollment> {
    const res = await apiClient.get<ApiResponse<EmployeeBpjsEnrollment>>(`/payroll/bpjs/enrollments/${employeeId}`);
    return res.data.data;
  },

  async calculateBpjs(baseWage: number, jkkRiskGrade = 1): Promise<BpjsCalculationResult[]> {
    const res = await apiClient.get<ApiResponse<BpjsCalculationResult[]>>("/payroll/bpjs/calculate", {
      params: { baseWage, jkkRiskGrade },
    });
    return res.data.data;
  },

  // Benefit Plans & Claims
  async getBenefitPlans(activeOnly = false): Promise<BenefitPlan[]> {
    const res = await apiClient.get<ApiResponse<BenefitPlan[]>>("/payroll/benefits/plans", {
      params: { activeOnly },
    });
    return res.data.data;
  },

  async createBenefitPlan(req: BenefitPlanRequest): Promise<BenefitPlan> {
    const res = await apiClient.post<ApiResponse<BenefitPlan>>("/payroll/benefits/plans", req);
    return res.data.data;
  },

  async updateBenefitPlan(id: string, req: BenefitPlanRequest): Promise<BenefitPlan> {
    const res = await apiClient.put<ApiResponse<BenefitPlan>>(`/payroll/benefits/plans/${id}`, req);
    return res.data.data;
  },

  async getBenefitClaims(employeeId?: string): Promise<EmployeeBenefitClaim[]> {
    const url = employeeId ? `/payroll/benefits/claims?employeeId=${employeeId}` : "/payroll/benefits/claims";
    const res = await apiClient.get<ApiResponse<EmployeeBenefitClaim[]>>(url);
    return res.data.data;
  },

  async submitBenefitClaim(req: EmployeeBenefitClaimRequest): Promise<EmployeeBenefitClaim> {
    const res = await apiClient.post<ApiResponse<EmployeeBenefitClaim>>("/payroll/benefits/claims", req);
    return res.data.data;
  },

  async updateBenefitClaimStatus(id: string, req: BenefitClaimStatusUpdateRequest): Promise<EmployeeBenefitClaim> {
    const res = await apiClient.put<ApiResponse<EmployeeBenefitClaim>>(`/payroll/benefits/claims/${id}/status`, req);
    return res.data.data;
  },
};



