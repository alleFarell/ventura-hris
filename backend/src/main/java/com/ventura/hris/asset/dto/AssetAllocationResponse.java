package com.ventura.hris.asset.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssetAllocationResponse(
    UUID id,
    UUID assetId,
    String assetTag,
    String assetName,
    String assetModel,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    LocalDate allocatedDate,
    LocalDate returnDate,
    String handoverNotes,
    String returnNotes,
    String status,
    Instant createdAt,
    Instant updatedAt
) {}
