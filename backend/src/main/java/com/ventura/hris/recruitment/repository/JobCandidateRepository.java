package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.JobCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobCandidateRepository extends JpaRepository<JobCandidate, UUID> {
    Optional<JobCandidate> findByEmail(String email);
    Optional<JobCandidate> findByCandidateNumber(String candidateNumber);
}
