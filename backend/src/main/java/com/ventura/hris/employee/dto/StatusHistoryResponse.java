package com.ventura.hris.employee.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StatusHistoryResponse(
        UUID id,
        UUID employeeId,
        String oldStatus,
        String newStatus,
        LocalDate effectiveDate,
        String reason,
        Instant createdAt
) {
}
