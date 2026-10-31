package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.EmployeeEmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeEmergencyContactRepository extends JpaRepository<EmployeeEmergencyContact, UUID> {

    Optional<EmployeeEmergencyContact> findByIdAndDeletedFalse(UUID id);

    List<EmployeeEmergencyContact> findByEmployee_IdAndDeletedFalseOrderByPrimaryContactDescCreatedAtAsc(UUID employeeId);
}
