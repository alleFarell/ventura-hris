package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByJobPostingId(UUID jobPostingId);
    List<JobApplication> findByCandidateId(UUID candidateId);
    List<JobApplication> findByCurrentStage(String currentStage);
    Optional<JobApplication> findByJobPostingIdAndCandidateId(UUID jobPostingId, UUID candidateId);
    Optional<JobApplication> findByApplicationNumber(String applicationNumber);
}
