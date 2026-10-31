package com.ventura.hris.recruitment.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.recruitment.dto.JobOfferRequest;
import com.ventura.hris.recruitment.dto.JobOfferResponse;
import com.ventura.hris.recruitment.dto.JobOfferStatusUpdateRequest;
import com.ventura.hris.recruitment.entity.JobApplication;
import com.ventura.hris.recruitment.entity.JobOffer;
import com.ventura.hris.recruitment.repository.JobApplicationRepository;
import com.ventura.hris.recruitment.repository.JobOfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final JobApplicationRepository applicationRepository;

    public JobOfferService(JobOfferRepository jobOfferRepository,
                           JobApplicationRepository applicationRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.applicationRepository = applicationRepository;
    }

    public JobOfferResponse createOffer(JobOfferRequest request) {
        JobApplication application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + request.applicationId()));

        JobOffer offer = new JobOffer();
        offer.setApplication(application);
        offer.setOfferNumber("OFF-" + (100000 + new SecureRandom().nextInt(900000)));
        offer.setOfferedSalary(request.offeredSalary());
        offer.setAllowanceAmount(request.allowanceAmount() != null ? request.allowanceAmount() : BigDecimal.ZERO);
        offer.setJoinDate(request.joinDate());
        offer.setExpirationDate(request.expirationDate());
        offer.setStatus("DRAFT");
        offer.setLetterUrl(request.letterUrl());
        offer.setNotes(request.notes());

        // Update application stage to OFFER
        application.setCurrentStage("OFFER");
        applicationRepository.save(application);

        JobOffer saved = jobOfferRepository.save(offer);
        return mapToResponse(saved);
    }

    public List<JobOfferResponse> getOffers(UUID applicationId, String status) {
        List<JobOffer> list;
        if (applicationId != null) {
            list = jobOfferRepository.findByApplicationId(applicationId);
        } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = jobOfferRepository.findByStatus(status);
        } else {
            list = jobOfferRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public JobOfferResponse getOffer(UUID id) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found: " + id));
        return mapToResponse(offer);
    }

    public JobOfferResponse updateOfferStatus(UUID id, JobOfferStatusUpdateRequest request) {
        JobOffer offer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found: " + id));

        offer.setStatus(request.status());
        if (request.notes() != null && !request.notes().isBlank()) {
            offer.setNotes(request.notes());
        }

        // If ACCEPTED, promote application to HIRED
        if ("ACCEPTED".equalsIgnoreCase(request.status())) {
            JobApplication app = offer.getApplication();
            if (app != null) {
                app.setCurrentStage("HIRED");
                applicationRepository.save(app);
            }
        }

        JobOffer saved = jobOfferRepository.save(offer);
        return mapToResponse(saved);
    }

    private JobOfferResponse mapToResponse(JobOffer offer) {
        String candName = offer.getApplication() != null && offer.getApplication().getCandidate() != null
                ? offer.getApplication().getCandidate().getFullName() : "";
        String candEmail = offer.getApplication() != null && offer.getApplication().getCandidate() != null
                ? offer.getApplication().getCandidate().getEmail() : "";
        String jobTitle = offer.getApplication() != null && offer.getApplication().getJobPosting() != null
                ? offer.getApplication().getJobPosting().getPostingTitle() : "";
        String appNum = offer.getApplication() != null ? offer.getApplication().getApplicationNumber() : "";

        return new JobOfferResponse(
                offer.getId(),
                offer.getApplication() != null ? offer.getApplication().getId() : null,
                appNum,
                candName,
                candEmail,
                jobTitle,
                offer.getOfferNumber(),
                offer.getOfferedSalary(),
                offer.getAllowanceAmount(),
                offer.getJoinDate(),
                offer.getExpirationDate(),
                offer.getStatus(),
                offer.getLetterUrl(),
                offer.getNotes(),
                offer.getCreatedAt()
        );
    }
}
