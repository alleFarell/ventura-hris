package com.ventura.hris.offboarding.dto;

import java.time.Instant;
import java.util.UUID;

public record ExitInterviewResponse(
    UUID id,
    UUID caseId,
    String employeeName,
    String employeeNumber,
    UUID interviewerId,
    String interviewerName,
    String primaryReason,
    Integer cultureRating,
    Integer managementRating,
    String feedbackText,
    Instant submittedAt
) {}
