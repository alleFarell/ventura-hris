package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.EmployeePersonalInformation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployeePersonalInformationRepository extends JpaRepository<EmployeePersonalInformation, UUID> {

    Optional<EmployeePersonalInformation> findByEmployee_IdAndDeletedFalse(UUID employeeId);
}
