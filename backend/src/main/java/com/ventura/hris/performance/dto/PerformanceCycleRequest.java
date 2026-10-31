package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record PerformanceCycleRequest(
    @NotNull UUID companyId,
    @NotBlank String name,
    @NotBlank String cycleType,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    @NotNull LocalDate selfReviewDeadline,
    @NotNull LocalDate managerReviewDeadline
) {}
