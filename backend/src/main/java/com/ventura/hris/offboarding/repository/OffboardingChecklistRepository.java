package com.ventura.hris.offboarding.repository;

import com.ventura.hris.offboarding.entity.OffboardingChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OffboardingChecklistRepository extends JpaRepository<OffboardingChecklist, UUID> {
    List<OffboardingChecklist> findByOffboardingCaseId(UUID caseId);
    long countByOffboardingCaseIdAndIsClearedFalse(UUID caseId);
}
