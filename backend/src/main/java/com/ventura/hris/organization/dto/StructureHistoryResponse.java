package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StructureHistoryResponse(
        UUID id,
        UUID organizationUnitId,
        String organizationUnitName,
        UUID oldParentUnitId,
        String oldParentUnitName,
        UUID newParentUnitId,
        String newParentUnitName,
        LocalDate effectiveDate,
        String reason,
        Instant createdAt
) {
}
