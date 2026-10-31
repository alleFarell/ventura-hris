package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.BankDisbursalBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankDisbursalBatchRepository extends JpaRepository<BankDisbursalBatch, UUID> {
    Optional<BankDisbursalBatch> findByBatchNumber(String batchNumber);
    List<BankDisbursalBatch> findByPayrollRunId(UUID payrollRunId);
    List<BankDisbursalBatch> findByStatus(String status);
}
