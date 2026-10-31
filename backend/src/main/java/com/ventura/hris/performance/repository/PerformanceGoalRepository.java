package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.PerformanceGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceGoalRepository extends JpaRepository<PerformanceGoal, UUID> {
    List<PerformanceGoal> findByCycleId(UUID cycleId);
    List<PerformanceGoal> findByEmployeeId(UUID employeeId);
    List<PerformanceGoal> findByCycleIdAndEmployeeId(UUID cycleId, UUID employeeId);
}
