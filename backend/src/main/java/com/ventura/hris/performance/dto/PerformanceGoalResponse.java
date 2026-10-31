package com.ventura.hris.performance.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PerformanceGoalResponse(
    UUID id,
    UUID cycleId,
    String cycleName,
    UUID employeeId,
    String employeeNumber,
    String employeeName,
    String title,
    String description,
    String category,
    Integer weight,
    String status,
    BigDecimal progressPercent,
    List<PerformanceGoalKeyResultDto> keyResults,
    Instant createdAt
) {}
