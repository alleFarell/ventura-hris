package com.ventura.hris.performance.dto;

import java.time.Instant;
import java.util.UUID;

public record CompetencyModelResponse(
    UUID id,
    UUID companyId,
    String code,
    String name,
    String category,
    String description,
    Integer weight,
    Instant createdAt
) {}
