package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeLoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeLoanInstallmentRepository extends JpaRepository<EmployeeLoanInstallment, UUID> {
    List<EmployeeLoanInstallment> findByLoanIdOrderByInstallmentNumberAsc(UUID loanId);
    List<EmployeeLoanInstallment> findByPayrollRunId(UUID payrollRunId);
    List<EmployeeLoanInstallment> findByLoanIdAndStatus(UUID loanId, String status);
}
