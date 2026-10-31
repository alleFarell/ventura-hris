package com.ventura.hris.performance.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PerformanceCycleResponse(
    UUID id,
    UUID companyId,
    String companyName,
    String name,
    String cycleType,
    LocalDate startDate,
    LocalDate endDate,
    LocalDate selfReviewDeadline,
    LocalDate managerReviewDeadline,
    String status,
    Instant createdAt
) {}
