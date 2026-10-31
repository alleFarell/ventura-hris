package com.ventura.hris.offboarding.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ExitInterviewRequest(
    @NotNull(message = "Case ID is required")
    UUID caseId,

    UUID interviewerId,

    @NotBlank(message = "Primary reason for leaving is required")
    String primaryReason,

    @NotNull(message = "Culture rating is required")
    @Min(1) @Max(5)
    Integer cultureRating,

    @NotNull(message = "Management rating is required")
    @Min(1) @Max(5)
    Integer managementRating,

    String feedbackText
) {}
