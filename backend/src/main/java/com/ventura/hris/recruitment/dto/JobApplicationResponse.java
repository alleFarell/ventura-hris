package com.ventura.hris.recruitment.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobApplicationResponse(
    UUID id,
    UUID jobPostingId,
    String postingTitle,
    UUID candidateId,
    String candidateName,
    String candidateEmail,
    String candidatePhone,
    String resumeUrl,
    String applicationNumber,
    LocalDate applicationDate,
    String currentStage,
    Integer rating,
    String notes,
    Instant createdAt
) {}
