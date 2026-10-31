package com.ventura.hris.asset.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CompanyAssetResponse(
    UUID id,
    UUID companyId,
    UUID categoryId,
    String categoryName,
    String assetTag,
    String name,
    String model,
    String serialNumber,
    LocalDate purchaseDate,
    BigDecimal purchaseCost,
    String status,
    String conditionGrade,
    String notes,
    UUID assignedToEmployeeId,
    String assignedToEmployeeName,
    String assignedToEmployeeNumber,
    Instant createdAt,
    Instant updatedAt
) {}
