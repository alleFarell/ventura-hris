package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        UUID companyId,
        String companyCode,
        String code,
        String name,
        String description,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
