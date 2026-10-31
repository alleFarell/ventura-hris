package com.ventura.hris.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record TrainingCourseRequest(
    @NotNull(message = "Company ID is required")
    UUID companyId,

    @NotBlank(message = "Course code is required")
    String code,

    @NotBlank(message = "Course title is required")
    String title,

    String category,

    String providerName,

    BigDecimal durationHours,

    BigDecimal cost,

    Boolean isActive,

    String description
) {}
