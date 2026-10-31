package com.ventura.hris.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssetCategoryRequest(
    @NotNull(message = "Company ID is required")
    UUID companyId,

    @NotBlank(message = "Category code is required")
    String code,

    @NotBlank(message = "Category name is required")
    String name,

    String description
) {}
