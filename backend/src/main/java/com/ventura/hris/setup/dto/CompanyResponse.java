package com.ventura.hris.setup.dto;

import com.ventura.hris.setup.entity.RecordStatus;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String code,
        String name,
        String legalName,
        String taxIdentifier,
        String defaultLocale,
        String defaultTimezone,
        String defaultCurrency,
        String defaultDateFormat,
        RecordStatus status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
