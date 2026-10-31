package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record JobApplicationRequest(
    @NotNull UUID jobPostingId,
    @NotNull UUID candidateId,
    LocalDate applicationDate,
    String notes
) {}
