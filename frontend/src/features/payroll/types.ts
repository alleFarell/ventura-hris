export type SalaryComponentType =
  | "EARNING_FIXED"
  | "EARNING_VARIABLE"
  | "DEDUCTION_FIXED"
  | "DEDUCTION_VARIABLE"
  | "BENEFIT_IN_KIND";

export interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: SalaryComponentType;
  isTaxable: boolean;
  isBpjsApplicable: boolean;
  defaultAmount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryComponentCreateRequest {
  code: string;
  name: string;
  description?: string;
  type: SalaryComponentType;
  isTaxable: boolean;
  isBpjsApplicable: boolean;
  defaultAmount: number;
}

export interface SalaryComponentUpdateRequest {
  name?: string;
  description?: string;
  type?: SalaryComponentType;
  isTaxable?: boolean;
  isBpjsApplicable?: boolean;
  defaultAmount?: number;
  isActive?: boolean;
}

export interface SalaryStructure {
  id: string;
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  minSalary: number;
  midpointSalary: number;
  maxSalary: number;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryStructureCreateRequest {
  gradeId: string;
  minSalary: number;
  midpointSalary: number;
  maxSalary: number;
  currency?: string;
}

export interface EmployeeSalaryComponentItem {
  componentId: string;
  componentCode?: string;
  componentName?: string;
  type?: string;
  amount: number;
}

export interface EmployeeSalaryProfile {
  id?: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  gradeId?: string;
  gradeName?: string;
  basicSalary: number;
  currency: string;
  effectiveDate: string;
  paymentMethod: "BANK_TRANSFER" | "CASH" | "CHEQUE";
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  taxStatus: string;
  gradeMinSalary?: number;
  gradeMaxSalary?: number;
  isWithinGradeRange?: boolean;
  components: EmployeeSalaryComponentItem[];
  totalFixedAllowances?: number;
  totalFixedDeductions?: number;
  totalTakeHomePay?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSalaryProfileRequest {
  basicSalary: number;
  currency?: string;
  effectiveDate: string;
  paymentMethod: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  taxStatus: string;
  components: EmployeeSalaryComponentItem[];
}

export interface TaxConfiguration {
  id: string;
  taxYear: number;
  bracketOrder: number;
  minTaxableIncome: number;
  maxTaxableIncome?: number;
  taxRatePercent: number;
}

export interface TaxConfigurationRequest {
  taxYear: number;
  bracketOrder: number;
  minTaxableIncome: number;
  maxTaxableIncome?: number;
  taxRatePercent: number;
}

export interface PtkpConfiguration {
  id: string;
  taxStatus: string;
  annualNonTaxableAmount: number;
  description?: string;
}

export interface TaxBracketCalculationItem {
  bracketOrder: number;
  minTaxableIncome: number;
  maxTaxableIncome?: number;
  taxRatePercent: number;
  taxableAmountInBracket: number;
  taxAmountInBracket: number;
}

export interface TaxCalculationResponse {
  annualGrossIncome: number;
  ptkpAmount: number;
  annualTaxableIncome: number;
  annualTaxAmount: number;
  monthlyTaxAmount: number;
  effectiveTaxRatePercent: number;
  breakdown: TaxBracketCalculationItem[];
}

export interface TaxCalculationRequest {
  annualGrossIncome: number;
  taxStatus: string;
  taxYear?: number;
}

export interface PayrollPeriod {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  attendanceCutoffDate: string;
  payoutDate: string;
  status: "PLANNED" | "ACTIVE" | "PROCESSING" | "COMPLETED" | "CLOSED";
  totalStandardWorkdays: number;
  totalEmployeesIngested?: number;
  totalSimulatedGross?: number;
  totalSimulatedNet?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollPeriodCreateRequest {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  attendanceCutoffDate: string;
  payoutDate: string;
  totalStandardWorkdays?: number;
}

export interface PayrollAttendanceCutoff {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  totalWorkdays: number;
  presentDays: number;
  absentDays: number;
  unpaidLeaveDays: number;
  lateMinutes: number;
  overtimeHours: number;
  overtimePayAmount: number;
  unpaidLeaveDeductionAmount: number;
  lateFineAmount: number;
  totalAttendanceDeductions?: number;
  isSynced: boolean;
}

export interface PayrollSimulation {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  basicSalary: number;
  prorationFactor: number;
  proratedBasicSalary: number;
  fixedAllowances: number;
  overtimeEarnings: number;
  attendanceDeductions: number;
  fixedDeductions: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
  hasDiscrepancies: boolean;
  discrepancyNote?: string;
  status: string;
}

export interface PayrollRun {
  id: string;
  periodId: string;
  periodCode?: string;
  periodName?: string;
  runNumber: string;
  executionDate: string;
  totalGrossAmount: number;
  totalDeductionAmount: number;
  totalNetAmount: number;
  totalEmployees: number;
  status: "DRAFT" | "PROCESSING" | "CONFIRMED" | "FROZEN";
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
}

export interface PayrollRunItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  basicSalary: number;
  proratedAmount: number;
  allowancesAmount: number;
  overtimeAmount: number;
  reimbursementAmount: number;
  attendanceDeductionAmount: number;
  loanDeductionAmount: number;
  taxAmount: number;
  netSalary: number;
  lineItemsJson?: string;
  createdAt?: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  loanNumber: string;
  loanAmount: number;
  installmentCount: number;
  monthlyInstallment: number;
  remainingBalance: number;
  startDate: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING" | "WRITTEN_OFF";
  reason?: string;
  createdAt?: string;
}

export interface EmployeeLoanCreateRequest {
  employeeId: string;
  loanAmount: number;
  installmentCount: number;
  startDate: string;
  reason?: string;
}

export interface EmployeeReimbursement {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  payrollRunId?: string;
  claimNumber: string;
  title: string;
  claimType: "TRAVEL" | "MEDICAL" | "OFFICE" | "MEAL" | "OTHER";
  amount: number;
  receiptUrl?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "DISBURSED";
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
}

export interface EmployeeReimbursementCreateRequest {
  employeeId: string;
  title: string;
  claimType: string;
  amount: number;
  receiptUrl?: string;
}

export interface Payslip {
  id: string;
  payrollRunItemId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  payslipNumber: string;
  periodName: string;
  issueDate: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  payslipDataJson?: string;
  isPublished: boolean;
  createdAt?: string;
}

export interface BankDisbursalBatch {
  id: string;
  payrollRunId: string;
  runNumber?: string;
  batchNumber: string;
  bankCode: string;
  totalAmount: number;
  totalRecords: number;
  status: "PENDING" | "GENERATED" | "DISBURSED";
  fileContent?: string;
  generatedAt: string;
  createdAt?: string;
}

export interface BankDisbursalItem {
  id: string;
  batchId: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  status: "PENDING" | "PROCESSED" | "FAILED";
  createdAt?: string;
}

export interface BankDisbursalGenerateRequest {
  payrollRunId: string;
  bankCode: string;
}

// Sprint 13: BPJS & Benefits
export interface BpjsConfiguration {
  id: string;
  programType: string;
  employerRate: number;
  employeeRate: number;
  wageCeiling?: number;
  wageFloor?: number;
  description?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface BpjsConfigurationUpdateRequest {
  employerRate: number;
  employeeRate: number;
  wageCeiling?: number;
  wageFloor?: number;
  description?: string;
  isActive?: boolean;
}

export interface EmployeeBpjsEnrollment {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  bpjsKesNumber?: string;
  bpjsTkNumber?: string;
  jkkRiskGrade: number;
  isKesActive: boolean;
  isTkActive: boolean;
  updatedAt?: string;
}

export interface EmployeeBpjsEnrollmentRequest {
  employeeId: string;
  bpjsKesNumber?: string;
  bpjsTkNumber?: string;
  jkkRiskGrade?: number;
  isKesActive?: boolean;
  isTkActive?: boolean;
}

export interface BpjsCalculationResult {
  programType: string;
  basisWage: number;
  employerRate: number;
  employeeRate: number;
  employerAmount: number;
  employeeAmount: number;
  totalAmount: number;
}

export interface BenefitPlan {
  id: string;
  code: string;
  name: string;
  category: string;
  annualLimit: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface BenefitPlanRequest {
  code: string;
  name: string;
  category: string;
  annualLimit: number;
  description?: string;
  isActive?: boolean;
}

export interface EmployeeBenefitClaim {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  benefitPlanId: string;
  benefitPlanCode?: string;
  benefitPlanName?: string;
  benefitPlanCategory?: string;
  claimNumber: string;
  claimDate: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface EmployeeBenefitClaimRequest {
  employeeId: string;
  benefitPlanId: string;
  claimDate: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}

export interface BenefitClaimStatusUpdateRequest {
  status: string;
  reviewerId?: string;
  rejectionReason?: string;
}



