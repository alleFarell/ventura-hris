package com.ventura.hris.performance.repository;

import com.ventura.hris.performance.entity.Appraisal360Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface Appraisal360FeedbackRepository extends JpaRepository<Appraisal360Feedback, UUID> {
    List<Appraisal360Feedback> findByAppraisalId(UUID appraisalId);
    List<Appraisal360Feedback> findByReviewerId(UUID reviewerId);
}
