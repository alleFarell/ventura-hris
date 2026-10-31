package com.ventura.hris.training.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TrainingCourseResponse(
    UUID id,
    UUID companyId,
    String companyName,
    String code,
    String title,
    String category,
    String providerName,
    BigDecimal durationHours,
    BigDecimal cost,
    Boolean isActive,
    String description,
    Instant createdAt,
    Instant updatedAt
) {}
