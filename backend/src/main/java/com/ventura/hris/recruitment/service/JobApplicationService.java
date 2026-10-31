package com.ventura.hris.recruitment.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.recruitment.dto.*;
import com.ventura.hris.recruitment.entity.JobApplication;
import com.ventura.hris.recruitment.entity.JobCandidate;
import com.ventura.hris.recruitment.entity.JobPosting;
import com.ventura.hris.recruitment.repository.JobApplicationRepository;
import com.ventura.hris.recruitment.repository.JobCandidateRepository;
import com.ventura.hris.recruitment.repository.JobPostingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobCandidateRepository candidateRepository;
    private final JobPostingRepository postingRepository;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 JobCandidateRepository candidateRepository,
                                 JobPostingRepository postingRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.postingRepository = postingRepository;
    }

    public JobCandidateResponse registerCandidate(JobCandidateRequest request) {
        JobCandidate candidate = candidateRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseGet(() -> {
                    JobCandidate c = new JobCandidate();
                    String candNum = "CAN-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                            String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));
                    c.setCandidateNumber(candNum);
                    c.setEmail(request.email().toLowerCase().trim());
                    return c;
                });

        candidate.setFullName(request.fullName());
        candidate.setPhone(request.phone());
        candidate.setResumeUrl(request.resumeUrl());
        candidate.setLinkedinUrl(request.linkedinUrl());
        candidate.setPortfolioUrl(request.portfolioUrl());

        JobCandidate saved = candidateRepository.save(candidate);
        return mapCandidateToResponse(saved);
    }

    public List<JobCandidateResponse> getCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::mapCandidateToResponse)
                .collect(Collectors.toList());
    }

    public JobCandidateResponse getCandidate(UUID id) {
        JobCandidate c = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + id));
        return mapCandidateToResponse(c);
    }

    public JobApplicationResponse applyJob(JobApplicationRequest request) {
        JobPosting posting = postingRepository.findById(request.jobPostingId())
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found: " + request.jobPostingId()));

        JobCandidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + request.candidateId()));

        if (applicationRepository.findByJobPostingIdAndCandidateId(posting.getId(), candidate.getId()).isPresent()) {
            throw new DomainException("ALREADY_APPLIED", "Candidate has already applied for this job posting");
        }

        LocalDate appDate = request.applicationDate() != null ? request.applicationDate() : LocalDate.now();
        String appNum = "APP-" + appDate.format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        JobApplication app = new JobApplication();
        app.setJobPosting(posting);
        app.setCandidate(candidate);
        app.setApplicationNumber(appNum);
        app.setApplicationDate(appDate);
        app.setCurrentStage("APPLIED");
        app.setNotes(request.notes());

        JobApplication saved = applicationRepository.save(app);
        return mapApplicationToResponse(saved);
    }

    public JobApplicationResponse updateStage(UUID id, JobApplicationStageUpdateRequest request) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));

        app.setCurrentStage(request.stage());
        if (request.rating() != null) {
            app.setRating(request.rating());
        }
        if (request.notes() != null) {
            app.setNotes(request.notes());
        }

        JobApplication saved = applicationRepository.save(app);
        return mapApplicationToResponse(saved);
    }

    public List<JobApplicationResponse> getApplications(UUID postingId, String stage) {
        List<JobApplication> list;
        if (postingId != null) {
            list = applicationRepository.findByJobPostingId(postingId);
        } else if (stage != null && !stage.isBlank() && !"ALL".equalsIgnoreCase(stage)) {
            list = applicationRepository.findByCurrentStage(stage);
        } else {
            list = applicationRepository.findAll();
        }
        return list.stream().map(this::mapApplicationToResponse).collect(Collectors.toList());
    }

    public JobApplicationResponse getApplication(UUID id) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        return mapApplicationToResponse(app);
    }

    private JobCandidateResponse mapCandidateToResponse(JobCandidate c) {
        return new JobCandidateResponse(
                c.getId(),
                c.getCandidateNumber(),
                c.getFullName(),
                c.getEmail(),
                c.getPhone(),
                c.getResumeUrl(),
                c.getLinkedinUrl(),
                c.getPortfolioUrl(),
                c.getCreatedAt()
        );
    }

    private JobApplicationResponse mapApplicationToResponse(JobApplication a) {
        return new JobApplicationResponse(
                a.getId(),
                a.getJobPosting() != null ? a.getJobPosting().getId() : null,
                a.getJobPosting() != null ? a.getJobPosting().getPostingTitle() : null,
                a.getCandidate() != null ? a.getCandidate().getId() : null,
                a.getCandidate() != null ? a.getCandidate().getFullName() : null,
                a.getCandidate() != null ? a.getCandidate().getEmail() : null,
                a.getCandidate() != null ? a.getCandidate().getPhone() : null,
                a.getCandidate() != null ? a.getCandidate().getResumeUrl() : null,
                a.getApplicationNumber(),
                a.getApplicationDate(),
                a.getCurrentStage(),
                a.getRating(),
                a.getNotes(),
                a.getCreatedAt()
        );
    }
}
