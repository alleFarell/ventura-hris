package com.ventura.hris.employee.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        UUID employeeId,
        String documentType,
        String fileName,
        String storageReference,
        String accessClassification,
        String retentionCategory,
        LocalDate expiresAt,
        String status,
        Instant createdAt
) {
}
