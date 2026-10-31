package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.EmploymentContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, UUID> {

    Optional<EmploymentContract> findByIdAndDeletedFalse(UUID id);

    List<EmploymentContract> findByEmployee_IdAndDeletedFalseOrderByStartDateDesc(UUID employeeId);

    @Query("""
            select c from EmploymentContract c
            where c.employee.id = :employeeId
              and c.deleted = false
              and c.status = 'ACTIVE'
              and (:contractId is null or c.id <> :contractId)
              and (
                  (:endDate is null and (c.endDate is null or c.endDate >= :startDate))
                  or
                  (:endDate is not null and c.startDate <= :endDate and (c.endDate is null or c.endDate >= :startDate))
              )
            """)
    List<EmploymentContract> findOverlappingContracts(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("contractId") UUID contractId
    );
}
