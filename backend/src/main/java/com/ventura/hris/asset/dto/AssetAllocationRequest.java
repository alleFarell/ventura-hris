package com.ventura.hris.asset.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record AssetAllocationRequest(
    @NotNull(message = "Asset ID is required")
    UUID assetId,

    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    @NotNull(message = "Allocation date is required")
    LocalDate allocatedDate,

    String handoverNotes
) {}
