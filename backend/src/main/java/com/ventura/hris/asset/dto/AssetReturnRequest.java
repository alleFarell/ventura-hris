package com.ventura.hris.asset.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AssetReturnRequest(
    @NotNull(message = "Return date is required")
    LocalDate returnDate,

    String returnNotes,

    String conditionGrade
) {}
