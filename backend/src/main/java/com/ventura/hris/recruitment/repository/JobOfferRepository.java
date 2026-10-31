package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, UUID> {
    List<JobOffer> findByApplicationId(UUID applicationId);
    List<JobOffer> findByStatus(String status);
    Optional<JobOffer> findByOfferNumber(String offerNumber);
}
