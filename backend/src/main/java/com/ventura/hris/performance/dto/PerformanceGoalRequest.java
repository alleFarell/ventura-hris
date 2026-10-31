package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record PerformanceGoalRequest(
    @NotNull UUID cycleId,
    @NotNull UUID employeeId,
    @NotBlank String title,
    String description,
    String category,
    Integer weight,
    List<PerformanceGoalKeyResultDto> keyResults
) {}
