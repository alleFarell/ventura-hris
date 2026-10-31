package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeLoanRepository extends JpaRepository<EmployeeLoan, UUID> {
    Optional<EmployeeLoan> findByLoanNumber(String loanNumber);
    List<EmployeeLoan> findByEmployeeId(UUID employeeId);
    List<EmployeeLoan> findByEmployeeIdAndStatus(UUID employeeId, String status);
    List<EmployeeLoan> findByStatus(String status);
}
