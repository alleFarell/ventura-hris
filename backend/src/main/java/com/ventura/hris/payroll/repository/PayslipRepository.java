package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {
    Optional<Payslip> findByPayslipNumber(String payslipNumber);
    List<Payslip> findByEmployeeIdOrderByIssueDateDesc(UUID employeeId);
    Optional<Payslip> findByRunItemId(UUID runItemId);
    List<Payslip> findByRunItemPayrollRunId(UUID payrollRunId);
}
