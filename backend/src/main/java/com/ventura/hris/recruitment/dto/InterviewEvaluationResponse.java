package com.ventura.hris.recruitment.dto;

import java.time.Instant;
import java.util.UUID;

public record InterviewEvaluationResponse(
    UUID id,
    UUID interviewId,
    UUID interviewerId,
    String interviewerName,
    Integer score,
    String verdict,
    String feedbackNotes,
    Instant submittedAt,
    Instant createdAt
) {}
