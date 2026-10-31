package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record OrganizationUnitResponse(
        UUID id,
        UUID companyId,
        UUID parentUnitId,
        String parentUnitName,
        UUID departmentId,
        UUID divisionId,
        UUID positionId,
        String code,
        String name,
        String unitType,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
