package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeSalaryProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeSalaryProfileRepository extends JpaRepository<EmployeeSalaryProfile, UUID> {
    Optional<EmployeeSalaryProfile> findByEmployeeId(UUID employeeId);
    boolean existsByEmployeeId(UUID employeeId);
}
