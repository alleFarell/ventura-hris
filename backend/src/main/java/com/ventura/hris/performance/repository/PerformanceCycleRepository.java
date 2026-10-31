package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.PerformanceCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceCycleRepository extends JpaRepository<PerformanceCycle, UUID> {
    List<PerformanceCycle> findByCompanyId(UUID companyId);
    List<PerformanceCycle> findByStatus(String status);
}
