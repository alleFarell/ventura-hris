package com.ventura.hris.offboarding.dto;

import java.time.Instant;
import java.util.UUID;

public record OffboardingChecklistResponse(
    UUID id,
    UUID caseId,
    String departmentName,
    String itemName,
    Boolean isCleared,
    String clearedBy,
    Instant clearedAt,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}
