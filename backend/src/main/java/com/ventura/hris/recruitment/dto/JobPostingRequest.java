package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record JobPostingRequest(
    @NotNull UUID requisitionId,
    @NotBlank String postingTitle,
    @NotBlank String description,
    String requirements,
    String location,
    Boolean isPublished,
    LocalDate closingDate
) {}
