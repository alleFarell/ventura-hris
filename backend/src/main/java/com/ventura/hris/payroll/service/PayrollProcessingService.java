package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.payroll.dto.PayrollRunExecutionRequest;
import com.ventura.hris.payroll.dto.PayrollRunItemResponse;
import com.ventura.hris.payroll.dto.PayrollRunResponse;
import com.ventura.hris.payroll.dto.TaxCalculationRequest;
import com.ventura.hris.payroll.dto.TaxCalculationResponse;
import com.ventura.hris.payroll.entity.*;
import com.ventura.hris.payroll.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class PayrollProcessingService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollRunRepository runRepository;
    private final PayrollRunItemRepository runItemRepository;
    private final PayrollAttendanceCutoffRepository cutoffRepository;
    private final EmployeeSalaryProfileRepository profileRepository;
    private final EmployeeSalaryComponentRepository empCompRepository;
    private final EmployeeLoanRepository loanRepository;
    private final EmployeeLoanInstallmentRepository installmentRepository;
    private final EmployeeReimbursementRepository reimbursementRepository;
    private final PayrollAttendanceIntegrationService attendanceIntegrationService;
    private final TaxConfigurationService taxService;

    public PayrollProcessingService(
            PayrollPeriodRepository periodRepository,
            PayrollRunRepository runRepository,
            PayrollRunItemRepository runItemRepository,
            PayrollAttendanceCutoffRepository cutoffRepository,
            EmployeeSalaryProfileRepository profileRepository,
            EmployeeSalaryComponentRepository empCompRepository,
            EmployeeLoanRepository loanRepository,
            EmployeeLoanInstallmentRepository installmentRepository,
            EmployeeReimbursementRepository reimbursementRepository,
            PayrollAttendanceIntegrationService attendanceIntegrationService,
            TaxConfigurationService taxService
    ) {
        this.periodRepository = periodRepository;
        this.runRepository = runRepository;
        this.runItemRepository = runItemRepository;
        this.cutoffRepository = cutoffRepository;
        this.profileRepository = profileRepository;
        this.empCompRepository = empCompRepository;
        this.loanRepository = loanRepository;
        this.installmentRepository = installmentRepository;
        this.reimbursementRepository = reimbursementRepository;
        this.attendanceIntegrationService = attendanceIntegrationService;
        this.taxService = taxService;
    }

    public PayrollRunResponse executePayrollRun(PayrollRunExecutionRequest request, String executedBy) {
        PayrollPeriod period = periodRepository.findById(request.periodId())
                .orElseThrow(() -> new ResourceNotFoundException("Payroll period not found with id: " + request.periodId()));

        if ("FROZEN".equalsIgnoreCase(period.getStatus()) || "CLOSED".equalsIgnoreCase(period.getStatus())) {
            throw new DomainException("INVALID_PERIOD_STATUS", "Cannot execute payroll run for a frozen or closed period");
        }

        // Ensure attendance cutoffs are available
        List<PayrollAttendanceCutoff> cutoffs = cutoffRepository.findByPeriodId(period.getId());
        if (cutoffs.isEmpty()) {
            attendanceIntegrationService.ingestAttendanceForPeriod(period.getId());
            cutoffs = cutoffRepository.findByPeriodId(period.getId());
        }

        String runNumber = "RUN-" + period.getCode() + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        PayrollRun run = new PayrollRun();
        run.setPeriod(period);
        run.setRunNumber(runNumber);
        run.setExecutionDate(request.executionDate());
        run.setStatus("PROCESSING");
        run.setApprovedBy(executedBy != null ? executedBy : "HR Admin");
        run.setApprovedAt(Instant.now());

        PayrollRun savedRun = runRepository.save(run);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        int employeeCount = 0;

        for (PayrollAttendanceCutoff cutoff : cutoffs) {
            Employee emp = cutoff.getEmployee();
            Optional<EmployeeSalaryProfile> profileOpt = profileRepository.findByEmployeeId(emp.getId());

            BigDecimal basicSalary = profileOpt.map(EmployeeSalaryProfile::getBasicSalary).orElse(BigDecimal.ZERO);
            BigDecimal allowances = BigDecimal.ZERO;

            if (profileOpt.isPresent()) {
                List<EmployeeSalaryComponent> components = empCompRepository.findByProfileId(profileOpt.get().getId());
                for (EmployeeSalaryComponent c : components) {
                    if (c.getComponent() != null && c.getComponent().getType() != null && c.getComponent().getType().startsWith("EARNING")) {
                        allowances = allowances.add(c.getAmount() != null ? c.getAmount() : c.getComponent().getDefaultAmount());
                    }
                }
            }

            BigDecimal overtime = cutoff.getOvertimePayAmount() != null ? cutoff.getOvertimePayAmount() : BigDecimal.ZERO;
            BigDecimal attendanceDeduction = (cutoff.getUnpaidLeaveDeductionAmount() != null ? cutoff.getUnpaidLeaveDeductionAmount() : BigDecimal.ZERO)
                    .add(cutoff.getLateFineAmount() != null ? cutoff.getLateFineAmount() : BigDecimal.ZERO);

            // Active loan deduction
            BigDecimal loanDeduction = BigDecimal.ZERO;
            List<EmployeeLoan> activeLoans = loanRepository.findByEmployeeIdAndStatus(emp.getId(), "ACTIVE");
            for (EmployeeLoan loan : activeLoans) {
                List<EmployeeLoanInstallment> installments = installmentRepository.findByLoanIdAndStatus(loan.getId(), "SCHEDULED");
                if (!installments.isEmpty()) {
                    EmployeeLoanInstallment installment = installments.get(0);
                    BigDecimal instAmount = installment.getAmount();
                    loanDeduction = loanDeduction.add(instAmount);

                    installment.setPayrollRun(savedRun);
                    installment.setStatus("PAID");
                    installment.setPaymentDate(request.executionDate());
                    installmentRepository.save(installment);

                    BigDecimal newBalance = loan.getRemainingBalance().subtract(instAmount);
                    if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
                        loan.setRemainingBalance(BigDecimal.ZERO);
                        loan.setStatus("COMPLETED");
                    } else {
                        loan.setRemainingBalance(newBalance);
                    }
                    loanRepository.save(loan);
                }
            }

            // Approved reimbursements
            BigDecimal reimbursementTotal = BigDecimal.ZERO;
            List<EmployeeReimbursement> approvedClaims = reimbursementRepository.findByEmployeeIdAndStatus(emp.getId(), "APPROVED");
            for (EmployeeReimbursement claim : approvedClaims) {
                reimbursementTotal = reimbursementTotal.add(claim.getAmount());
                claim.setPayrollRun(savedRun);
                claim.setStatus("DISBURSED");
                reimbursementRepository.save(claim);
            }

            // Progressive Tax calculation
            String taxStatus = profileOpt.map(EmployeeSalaryProfile::getTaxStatus).orElse("TK/0");
            BigDecimal annualGross = basicSalary.add(allowances).multiply(BigDecimal.valueOf(12));
            TaxCalculationResponse taxRes = taxService.calculateProgressiveTax(new TaxCalculationRequest(annualGross, taxStatus, 2027));
            BigDecimal taxAmount = taxRes.getMonthlyTaxAmount() != null ? taxRes.getMonthlyTaxAmount() : BigDecimal.ZERO;

            BigDecimal employeeGross = basicSalary.add(allowances).add(overtime).add(reimbursementTotal);
            BigDecimal employeeDeductions = attendanceDeduction.add(loanDeduction).add(taxAmount);
            BigDecimal employeeNet = employeeGross.subtract(employeeDeductions);

            PayrollRunItem item = new PayrollRunItem();
            item.setPayrollRun(savedRun);
            item.setEmployee(emp);
            item.setBasicSalary(basicSalary);
            item.setProratedAmount(basicSalary);
            item.setAllowancesAmount(allowances);
            item.setOvertimeAmount(overtime);
            item.setReimbursementAmount(reimbursementTotal);
            item.setAttendanceDeductionAmount(attendanceDeduction);
            item.setLoanDeductionAmount(loanDeduction);
            item.setTaxAmount(taxAmount);
            item.setNetSalary(employeeNet);
            item.setLineItemsJson("{\"gross\":" + employeeGross + ",\"deductions\":" + employeeDeductions + ",\"net\":" + employeeNet + "}");

            runItemRepository.save(item);

            totalGross = totalGross.add(employeeGross);
            totalDeductions = totalDeductions.add(employeeDeductions);
            totalNet = totalNet.add(employeeNet);
            employeeCount++;
        }

        savedRun.setTotalGrossAmount(totalGross);
        savedRun.setTotalDeductionAmount(totalDeductions);
        savedRun.setTotalNetAmount(totalNet);
        savedRun.setTotalEmployees(employeeCount);
        savedRun.setStatus("CONFIRMED");

        runRepository.save(savedRun);

        // Update period status
        period.setStatus("COMPLETED");
        periodRepository.save(period);

        return mapToResponse(savedRun);
    }

    @Transactional(readOnly = true)
    public List<PayrollRunResponse> getAllPayrollRuns() {
        return runRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PayrollRunResponse getPayrollRunById(UUID id) {
        PayrollRun run = runRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + id));
        return mapToResponse(run);
    }

    @Transactional(readOnly = true)
    public List<PayrollRunItemResponse> getPayrollRunItems(UUID runId) {
        return runItemRepository.findByPayrollRunId(runId).stream().map(this::mapItemToResponse).toList();
    }

    public PayrollRunResponse freezePayrollRun(UUID id, String username) {
        PayrollRun run = runRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + id));

        run.setStatus("FROZEN");
        return mapToResponse(runRepository.save(run));
    }

    private PayrollRunResponse mapToResponse(PayrollRun run) {
        return new PayrollRunResponse(
                run.getId(),
                run.getPeriod().getId(),
                run.getPeriod().getCode(),
                run.getPeriod().getName(),
                run.getRunNumber(),
                run.getExecutionDate(),
                run.getTotalGrossAmount(),
                run.getTotalDeductionAmount(),
                run.getTotalNetAmount(),
                run.getTotalEmployees(),
                run.getStatus(),
                run.getApprovedBy(),
                run.getApprovedAt(),
                run.getCreatedAt()
        );
    }

    private PayrollRunItemResponse mapItemToResponse(PayrollRunItem item) {
        return new PayrollRunItemResponse(
                item.getId(),
                item.getPayrollRun().getId(),
                item.getEmployee().getId(),
                item.getEmployee().getFirstName() + " " + (item.getEmployee().getLastName() != null ? item.getEmployee().getLastName() : ""),
                item.getEmployee().getEmployeeNumber(),
                item.getBasicSalary(),
                item.getProratedAmount(),
                item.getAllowancesAmount(),
                item.getOvertimeAmount(),
                item.getReimbursementAmount(),
                item.getAttendanceDeductionAmount(),
                item.getLoanDeductionAmount(),
                item.getTaxAmount(),
                item.getNetSalary(),
                item.getLineItemsJson(),
                item.getCreatedAt()
        );
    }
}
