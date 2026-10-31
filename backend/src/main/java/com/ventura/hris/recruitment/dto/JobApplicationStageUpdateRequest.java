package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.NotBlank;

public record JobApplicationStageUpdateRequest(
    @NotBlank String stage,
    Integer rating,
    String notes
) {}
