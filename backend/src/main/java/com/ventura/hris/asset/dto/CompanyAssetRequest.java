package com.ventura.hris.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CompanyAssetRequest(
    @NotNull(message = "Company ID is required")
    UUID companyId,

    @NotNull(message = "Category ID is required")
    UUID categoryId,

    @NotBlank(message = "Asset tag is required")
    String assetTag,

    @NotBlank(message = "Asset name is required")
    String name,

    String model,

    String serialNumber,

    @NotNull(message = "Purchase date is required")
    LocalDate purchaseDate,

    BigDecimal purchaseCost,

    String status,

    String conditionGrade,

    String notes
) {}
