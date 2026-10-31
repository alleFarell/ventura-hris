package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.PayrollRunItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRunItemRepository extends JpaRepository<PayrollRunItem, UUID> {
    List<PayrollRunItem> findByPayrollRunId(UUID payrollRunId);
    Optional<PayrollRunItem> findByPayrollRunIdAndEmployeeId(UUID payrollRunId, UUID employeeId);
    List<PayrollRunItem> findByEmployeeId(UUID employeeId);
}
