package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotBlank;

public record PerformanceCycleStatusUpdateRequest(
    @NotBlank String status
) {}
