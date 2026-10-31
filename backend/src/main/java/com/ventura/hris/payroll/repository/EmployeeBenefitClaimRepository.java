package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeBenefitClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeBenefitClaimRepository extends JpaRepository<EmployeeBenefitClaim, UUID> {
    List<EmployeeBenefitClaim> findByEmployeeIdOrderByClaimDateDesc(UUID employeeId);
    List<EmployeeBenefitClaim> findByBenefitPlanId(UUID benefitPlanId);
    Optional<EmployeeBenefitClaim> findByClaimNumber(String claimNumber);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM EmployeeBenefitClaim c " +
           "WHERE c.employee.id = :employeeId " +
           "AND c.benefitPlan.id = :benefitPlanId " +
           "AND c.status IN ('SUBMITTED', 'APPROVED', 'PAID') " +
           "AND c.claimDate BETWEEN :startDate AND :endDate")
    BigDecimal sumClaimedAmountInPeriod(
        @Param("employeeId") UUID employeeId,
        @Param("benefitPlanId") UUID benefitPlanId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
