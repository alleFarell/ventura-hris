package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record PayrollRunExecutionRequest(
    @NotNull(message = "Payroll period ID is required")
    UUID periodId,

    @NotNull(message = "Execution date is required")
    LocalDate executionDate
) {}
