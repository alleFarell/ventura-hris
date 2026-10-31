package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record DivisionResponse(
        UUID id,
        UUID companyId,
        UUID departmentId,
        String departmentName,
        String code,
        String name,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
