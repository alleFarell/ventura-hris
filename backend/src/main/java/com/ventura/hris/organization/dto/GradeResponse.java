package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record GradeResponse(
        UUID id,
        UUID companyId,
        String code,
        String name,
        Integer sortOrder,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
