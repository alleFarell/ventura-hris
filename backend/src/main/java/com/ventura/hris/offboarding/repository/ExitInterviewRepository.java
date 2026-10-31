package com.ventura.hris.offboarding.repository;

import com.ventura.hris.offboarding.entity.ExitInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExitInterviewRepository extends JpaRepository<ExitInterview, UUID> {
    Optional<ExitInterview> findByOffboardingCaseId(UUID caseId);
}
