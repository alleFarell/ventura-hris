package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CompetencyModelRequest(
    @NotNull UUID companyId,
    @NotBlank String code,
    @NotBlank String name,
    String category,
    String description,
    Integer weight
) {}
