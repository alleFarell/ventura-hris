package com.ventura.hris.recruitment.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobPostingResponse(
    UUID id,
    UUID requisitionId,
    String requisitionNumber,
    String postingTitle,
    String description,
    String requirements,
    String location,
    Boolean isPublished,
    LocalDate closingDate,
    Instant createdAt
) {}
