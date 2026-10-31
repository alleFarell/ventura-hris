package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.PerformanceGoalKeyResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceGoalKeyResultRepository extends JpaRepository<PerformanceGoalKeyResult, UUID> {
    List<PerformanceGoalKeyResult> findByGoalId(UUID goalId);
}
