package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.EmployeeBpjsEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeBpjsEnrollmentRepository extends JpaRepository<EmployeeBpjsEnrollment, UUID> {
    Optional<EmployeeBpjsEnrollment> findByEmployeeId(UUID employeeId);
}
