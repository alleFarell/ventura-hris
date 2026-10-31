package com.ventura.hris.recruitment.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.recruitment.dto.JobPostingRequest;
import com.ventura.hris.recruitment.dto.JobPostingResponse;
import com.ventura.hris.recruitment.entity.JobPosting;
import com.ventura.hris.recruitment.entity.JobRequisition;
import com.ventura.hris.recruitment.repository.JobPostingRepository;
import com.ventura.hris.recruitment.repository.JobRequisitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobPostingService {

    private final JobPostingRepository postingRepository;
    private final JobRequisitionRepository requisitionRepository;

    public JobPostingService(JobPostingRepository postingRepository,
                             JobRequisitionRepository requisitionRepository) {
        this.postingRepository = postingRepository;
        this.requisitionRepository = requisitionRepository;
    }

    public JobPostingResponse createPosting(JobPostingRequest request) {
        JobRequisition requisition = requisitionRepository.findById(request.requisitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Job requisition not found: " + request.requisitionId()));

        if (!"APPROVED".equals(requisition.getStatus())) {
            throw new DomainException("REQUISITION_NOT_APPROVED", "Cannot publish job posting for unapproved requisition. Current status: " + requisition.getStatus());
        }

        JobPosting posting = new JobPosting();
        posting.setRequisition(requisition);
        posting.setPostingTitle(request.postingTitle());
        posting.setDescription(request.description());
        posting.setRequirements(request.requirements());
        posting.setLocation(request.location());
        posting.setIsPublished(request.isPublished() != null ? request.isPublished() : false);
        posting.setClosingDate(request.closingDate());

        JobPosting saved = postingRepository.save(posting);
        return mapToResponse(saved);
    }

    public JobPostingResponse publishPosting(UUID id, boolean publish) {
        JobPosting posting = postingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found: " + id));

        posting.setIsPublished(publish);
        return mapToResponse(postingRepository.save(posting));
    }

    public List<JobPostingResponse> getPostings(Boolean publishedOnly) {
        List<JobPosting> list = Boolean.TRUE.equals(publishedOnly)
                ? postingRepository.findByIsPublishedTrue()
                : postingRepository.findAll();
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public JobPostingResponse getPosting(UUID id) {
        JobPosting posting = postingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found: " + id));
        return mapToResponse(posting);
    }

    private JobPostingResponse mapToResponse(JobPosting p) {
        return new JobPostingResponse(
                p.getId(),
                p.getRequisition() != null ? p.getRequisition().getId() : null,
                p.getRequisition() != null ? p.getRequisition().getRequisitionNumber() : null,
                p.getPostingTitle(),
                p.getDescription(),
                p.getRequirements(),
                p.getLocation(),
                p.getIsPublished(),
                p.getClosingDate(),
                p.getCreatedAt()
        );
    }
}
