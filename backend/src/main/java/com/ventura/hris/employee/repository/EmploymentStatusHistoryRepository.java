package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.EmploymentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmploymentStatusHistoryRepository extends JpaRepository<EmploymentStatusHistory, UUID> {

    List<EmploymentStatusHistory> findByEmployee_IdAndDeletedFalseOrderByEffectiveDateDescCreatedAtDesc(UUID employeeId);
}
