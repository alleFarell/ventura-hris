package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.EmployeeAppraisal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeAppraisalRepository extends JpaRepository<EmployeeAppraisal, UUID> {
    List<EmployeeAppraisal> findByCycleId(UUID cycleId);
    List<EmployeeAppraisal> findByEmployeeId(UUID employeeId);
    Optional<EmployeeAppraisal> findByCycleIdAndEmployeeId(UUID cycleId, UUID employeeId);
}
