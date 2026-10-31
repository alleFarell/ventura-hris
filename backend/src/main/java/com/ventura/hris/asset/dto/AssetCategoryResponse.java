package com.ventura.hris.asset.dto;

import java.time.Instant;
import java.util.UUID;

public record AssetCategoryResponse(
    UUID id,
    UUID companyId,
    String code,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt
) {}
