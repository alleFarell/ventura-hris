package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record MoveOrganizationUnitRequest(
        UUID newParentUnitId,
        @NotNull LocalDate effectiveDate,
        @Size(max = 500) String reason
) {
}
