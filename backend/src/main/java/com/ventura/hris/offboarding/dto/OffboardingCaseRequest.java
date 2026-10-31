package com.ventura.hris.offboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record OffboardingCaseRequest(
    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    @NotBlank(message = "Separation type is required")
    String separationType,

    @NotNull(message = "Notice date is required")
    LocalDate noticeDate,

    @NotNull(message = "Last working date is required")
    LocalDate lastWorkingDate,

    String reason
) {}
