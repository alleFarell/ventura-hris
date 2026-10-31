package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateDivisionRequest(
        @NotNull UUID companyId,
        @NotNull UUID departmentId,
        @NotBlank @Size(max = 30) String code,
        @NotBlank @Size(max = 150) String name,
        String status,
        UUID parentUnitId
) {
}
