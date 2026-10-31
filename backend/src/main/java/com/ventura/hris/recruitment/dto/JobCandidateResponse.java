package com.ventura.hris.recruitment.dto;

import java.time.Instant;
import java.util.UUID;

public record JobCandidateResponse(
    UUID id,
    String candidateNumber,
    String fullName,
    String email,
    String phone,
    String resumeUrl,
    String linkedinUrl,
    String portfolioUrl,
    Instant createdAt
) {}
