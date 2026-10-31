package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record PerformanceGoalKeyResultDto(
    UUID id,
    @NotBlank String description,
    String metricType,
    @NotNull BigDecimal targetValue,
    BigDecimal currentValue,
    BigDecimal progressPercent,
    String notes
) {}
