package com.ventura.hris.offboarding.repository;

import com.ventura.hris.offboarding.entity.OffboardingCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OffboardingCaseRepository extends JpaRepository<OffboardingCase, UUID> {
    List<OffboardingCase> findByEmployeeId(UUID employeeId);
    List<OffboardingCase> findByStatus(String status);
}
