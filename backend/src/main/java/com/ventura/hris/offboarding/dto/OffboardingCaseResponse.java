package com.ventura.hris.offboarding.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record OffboardingCaseResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String departmentName,
    String positionName,
    String separationType,
    LocalDate noticeDate,
    LocalDate lastWorkingDate,
    String reason,
    String status,
    Long clearedItemsCount,
    Long totalItemsCount,
    Instant createdAt,
    Instant updatedAt
) {}
