package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.payroll.dto.EmployeeLoanCreateRequest;
import com.ventura.hris.payroll.dto.EmployeeLoanResponse;
import com.ventura.hris.payroll.entity.EmployeeLoan;
import com.ventura.hris.payroll.entity.EmployeeLoanInstallment;
import com.ventura.hris.payroll.repository.EmployeeLoanInstallmentRepository;
import com.ventura.hris.payroll.repository.EmployeeLoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class EmployeeLoanService {

    private final EmployeeLoanRepository loanRepository;
    private final EmployeeLoanInstallmentRepository installmentRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeLoanService(EmployeeLoanRepository loanRepository,
                               EmployeeLoanInstallmentRepository installmentRepository,
                               EmployeeRepository employeeRepository) {
        this.loanRepository = loanRepository;
        this.installmentRepository = installmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeLoanResponse createLoan(EmployeeLoanCreateRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));

        String loanNumber = "LN-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        BigDecimal monthlyInstallment = request.loanAmount()
                .divide(BigDecimal.valueOf(request.installmentCount()), 2, RoundingMode.HALF_UP);

        EmployeeLoan loan = new EmployeeLoan();
        loan.setEmployee(employee);
        loan.setLoanNumber(loanNumber);
        loan.setLoanAmount(request.loanAmount());
        loan.setInstallmentCount(request.installmentCount());
        loan.setMonthlyInstallment(monthlyInstallment);
        loan.setRemainingBalance(request.loanAmount());
        loan.setStartDate(request.startDate());
        loan.setStatus("ACTIVE");
        loan.setReason(request.reason());

        EmployeeLoan savedLoan = loanRepository.save(loan);

        // Pre-create scheduled installments
        for (int i = 1; i <= request.installmentCount(); i++) {
            EmployeeLoanInstallment installment = new EmployeeLoanInstallment(
                    savedLoan, i, monthlyInstallment, "SCHEDULED");
            installment.setPaymentDate(request.startDate().plusMonths(i - 1));
            installmentRepository.save(installment);
        }

        return mapToResponse(savedLoan);
    }

    @Transactional(readOnly = true)
    public List<EmployeeLoanResponse> getAllLoans(UUID employeeId) {
        List<EmployeeLoan> loans = (employeeId != null)
                ? loanRepository.findByEmployeeId(employeeId)
                : loanRepository.findAll();
        return loans.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeLoanResponse getLoanById(UUID id) {
        EmployeeLoan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + id));
        return mapToResponse(loan);
    }

    private EmployeeLoanResponse mapToResponse(EmployeeLoan loan) {
        return new EmployeeLoanResponse(
                loan.getId(),
                loan.getEmployee().getId(),
                loan.getEmployee().getFirstName() + " " + (loan.getEmployee().getLastName() != null ? loan.getEmployee().getLastName() : ""),
                loan.getEmployee().getEmployeeNumber(),
                loan.getLoanNumber(),
                loan.getLoanAmount(),
                loan.getInstallmentCount(),
                loan.getMonthlyInstallment(),
                loan.getRemainingBalance(),
                loan.getStartDate(),
                loan.getStatus(),
                loan.getReason(),
                loan.getCreatedAt()
        );
    }
}
