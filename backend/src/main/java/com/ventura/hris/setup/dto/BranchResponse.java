package com.ventura.hris.setup.dto;

import com.ventura.hris.setup.entity.RecordStatus;

import java.time.Instant;
import java.util.UUID;

public record BranchResponse(
        UUID id,
        UUID companyId,
        String companyCode,
        String code,
        String name,
        String addressLine1,
        String addressLine2,
        String city,
        String province,
        String postalCode,
        String countryCode,
        RecordStatus status,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
