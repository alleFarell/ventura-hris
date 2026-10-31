package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.payroll.dto.PayslipResponse;
import com.ventura.hris.payroll.entity.PayrollRun;
import com.ventura.hris.payroll.entity.PayrollRunItem;
import com.ventura.hris.payroll.entity.Payslip;
import com.ventura.hris.payroll.repository.PayrollRunItemRepository;
import com.ventura.hris.payroll.repository.PayrollRunRepository;
import com.ventura.hris.payroll.repository.PayslipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PayslipService {

    private final PayslipRepository payslipRepository;
    private final PayrollRunRepository runRepository;
    private final PayrollRunItemRepository runItemRepository;

    public PayslipService(PayslipRepository payslipRepository,
                          PayrollRunRepository runRepository,
                          PayrollRunItemRepository runItemRepository) {
        this.payslipRepository = payslipRepository;
        this.runRepository = runRepository;
        this.runItemRepository = runItemRepository;
    }

    public List<PayslipResponse> generatePayslipsForRun(UUID payrollRunId) {
        PayrollRun run = runRepository.findById(payrollRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + payrollRunId));

        List<PayrollRunItem> items = runItemRepository.findByPayrollRunId(payrollRunId);
        List<Payslip> generated = new ArrayList<>();

        for (PayrollRunItem item : items) {
            Optional<Payslip> existing = payslipRepository.findByRunItemId(item.getId());
            if (existing.isPresent()) {
                generated.add(existing.get());
                continue;
            }

            String payslipNumber = "PS-" + run.getPeriod().getCode() + "-" + item.getEmployee().getEmployeeNumber();

            BigDecimal gross = item.getBasicSalary()
                    .add(item.getAllowancesAmount())
                    .add(item.getOvertimeAmount())
                    .add(item.getReimbursementAmount());

            BigDecimal deductions = item.getAttendanceDeductionAmount()
                    .add(item.getLoanDeductionAmount())
                    .add(item.getTaxAmount());

            Payslip payslip = new Payslip();
            payslip.setRunItem(item);
            payslip.setEmployee(item.getEmployee());
            payslip.setPayslipNumber(payslipNumber);
            payslip.setPeriodName(run.getPeriod().getName());
            payslip.setIssueDate(run.getExecutionDate() != null ? run.getExecutionDate() : LocalDate.now());
            payslip.setGrossSalary(gross);
            payslip.setTotalDeductions(deductions);
            payslip.setNetSalary(item.getNetSalary());
            payslip.setPayslipDataJson(item.getLineItemsJson());
            payslip.setIsPublished(true);

            generated.add(payslipRepository.save(payslip));
        }

        return generated.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PayslipResponse> getPayslips(UUID employeeId) {
        List<Payslip> list = (employeeId != null)
                ? payslipRepository.findByEmployeeIdOrderByIssueDateDesc(employeeId)
                : payslipRepository.findAll();
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PayslipResponse getPayslipById(UUID id) {
        Payslip payslip = payslipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found with id: " + id));
        return mapToResponse(payslip);
    }

    public List<PayslipResponse> publishPayslipsForRun(UUID payrollRunId) {
        List<Payslip> payslips = payslipRepository.findByRunItemPayrollRunId(payrollRunId);
        for (Payslip p : payslips) {
            p.setIsPublished(true);
            payslipRepository.save(p);
        }
        return payslips.stream().map(this::mapToResponse).toList();
    }

    private PayslipResponse mapToResponse(Payslip p) {
        return new PayslipResponse(
                p.getId(),
                p.getRunItem().getId(),
                p.getEmployee().getId(),
                p.getEmployee().getFirstName() + " " + (p.getEmployee().getLastName() != null ? p.getEmployee().getLastName() : ""),
                p.getEmployee().getEmployeeNumber(),
                p.getPayslipNumber(),
                p.getPeriodName(),
                p.getIssueDate(),
                p.getGrossSalary(),
                p.getTotalDeductions(),
                p.getNetSalary(),
                p.getPayslipDataJson(),
                p.getIsPublished(),
                p.getCreatedAt()
        );
    }
}
