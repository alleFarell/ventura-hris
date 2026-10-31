package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.BenefitPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BenefitPlanRepository extends JpaRepository<BenefitPlan, UUID> {
    Optional<BenefitPlan> findByCode(String code);
    List<BenefitPlan> findByIsActiveTrue();
    List<BenefitPlan> findByCategory(String category);
}
