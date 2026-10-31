package com.ventura.hris.employee.repository;

import com.ventura.hris.employee.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {

    Optional<EmployeeDocument> findByIdAndDeletedFalse(UUID id);

    List<EmployeeDocument> findByEmployee_IdAndDeletedFalseOrderByCreatedAtDesc(UUID employeeId);
}
