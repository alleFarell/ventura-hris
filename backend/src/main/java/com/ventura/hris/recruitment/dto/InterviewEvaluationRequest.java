package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record InterviewEvaluationRequest(
    UUID interviewerId,
    @NotNull @Min(1) @Max(5) Integer score,
    @NotBlank String verdict,
    @NotBlank String feedbackNotes
) {}
