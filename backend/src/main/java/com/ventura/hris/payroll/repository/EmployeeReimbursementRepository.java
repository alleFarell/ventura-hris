package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeReimbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeReimbursementRepository extends JpaRepository<EmployeeReimbursement, UUID> {
    Optional<EmployeeReimbursement> findByClaimNumber(String claimNumber);
    List<EmployeeReimbursement> findByEmployeeId(UUID employeeId);
    List<EmployeeReimbursement> findByStatus(String status);
    List<EmployeeReimbursement> findByEmployeeIdAndStatus(UUID employeeId, String status);
    List<EmployeeReimbursement> findByPayrollRunId(UUID payrollRunId);
}
