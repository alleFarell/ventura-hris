package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.BankDisbursalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BankDisbursalItemRepository extends JpaRepository<BankDisbursalItem, UUID> {
    List<BankDisbursalItem> findByBatchId(UUID batchId);
    List<BankDisbursalItem> findByEmployeeId(UUID employeeId);
}
