package com.ventura.hris.performance.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.performance.dto.Feedback360Request;
import com.ventura.hris.performance.dto.Feedback360Response;
import com.ventura.hris.performance.dto.Feedback360SubmitRequest;
import com.ventura.hris.performance.entity.Appraisal360Feedback;
import com.ventura.hris.performance.entity.EmployeeAppraisal;
import com.ventura.hris.performance.repository.Appraisal360FeedbackRepository;
import com.ventura.hris.performance.repository.EmployeeAppraisalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class Appraisal360FeedbackService {

    private final Appraisal360FeedbackRepository feedbackRepository;
    private final EmployeeAppraisalRepository appraisalRepository;
    private final EmployeeRepository employeeRepository;

    public Appraisal360FeedbackService(Appraisal360FeedbackRepository feedbackRepository,
                                       EmployeeAppraisalRepository appraisalRepository,
                                       EmployeeRepository employeeRepository) {
        this.feedbackRepository = feedbackRepository;
        this.appraisalRepository = appraisalRepository;
        this.employeeRepository = employeeRepository;
    }

    public Feedback360Response requestFeedback(Feedback360Request request) {
        EmployeeAppraisal appraisal = appraisalRepository.findById(request.appraisalId())
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal not found: " + request.appraisalId()));

        Employee reviewer = employeeRepository.findById(request.reviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found: " + request.reviewerId()));

        Appraisal360Feedback feedback = new Appraisal360Feedback();
        feedback.setAppraisal(appraisal);
        feedback.setReviewer(reviewer);
        feedback.setRelationship(request.relationship() != null ? request.relationship() : "PEER");
        feedback.setIsAnonymous(request.isAnonymous() != null ? request.isAnonymous() : true);
        feedback.setStatus("REQUESTED");

        Appraisal360Feedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    public List<Feedback360Response> getFeedbacks(UUID appraisalId, UUID reviewerId) {
        List<Appraisal360Feedback> list;
        if (appraisalId != null) {
            list = feedbackRepository.findByAppraisalId(appraisalId);
        } else if (reviewerId != null) {
            list = feedbackRepository.findByReviewerId(reviewerId);
        } else {
            list = feedbackRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Feedback360Response getFeedback(UUID id) {
        Appraisal360Feedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback record not found: " + id));
        return mapToResponse(fb);
    }

    public Feedback360Response submitFeedback(UUID id, Feedback360SubmitRequest request) {
        Appraisal360Feedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback record not found: " + id));

        fb.setRating(request.rating());
        fb.setFeedbackText(request.feedbackText());
        fb.setStatus("SUBMITTED");

        Appraisal360Feedback saved = feedbackRepository.save(fb);
        return mapToResponse(saved);
    }

    private Feedback360Response mapToResponse(Appraisal360Feedback f) {
        String reviewerName = null;
        UUID reviewerId = null;
        if (Boolean.FALSE.equals(f.getIsAnonymous()) && f.getReviewer() != null) {
            reviewerId = f.getReviewer().getId();
            reviewerName = (f.getReviewer().getFirstName() + " " + (f.getReviewer().getLastName() != null ? f.getReviewer().getLastName() : "")).trim();
        } else if (f.getReviewer() != null) {
            reviewerName = "Anonymous " + f.getRelationship();
        }

        return new Feedback360Response(
                f.getId(),
                f.getAppraisal() != null ? f.getAppraisal().getId() : null,
                reviewerId,
                reviewerName,
                f.getRelationship(),
                f.getRating(),
                f.getFeedbackText(),
                f.getIsAnonymous(),
                f.getStatus(),
                f.getCreatedAt()
        );
    }
}
