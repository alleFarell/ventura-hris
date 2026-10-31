package com.ventura.hris.recruitment.repository;

import com.ventura.hris.recruitment.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, UUID> {
    List<InterviewEvaluation> findByInterviewId(UUID interviewId);
    List<InterviewEvaluation> findByInterviewerId(UUID interviewerId);
}
