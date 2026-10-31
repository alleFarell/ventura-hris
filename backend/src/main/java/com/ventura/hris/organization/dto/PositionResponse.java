package com.ventura.hris.organization.dto;

import java.time.Instant;
import java.util.UUID;

public record PositionResponse(
        UUID id,
        UUID companyId,
        UUID departmentId,
        String departmentName,
        UUID divisionId,
        String divisionName,
        UUID gradeId,
        String gradeName,
        UUID jobLevelId,
        String jobLevelName,
        String code,
        String name,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
