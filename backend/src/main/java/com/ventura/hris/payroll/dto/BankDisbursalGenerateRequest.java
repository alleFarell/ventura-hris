package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BankDisbursalGenerateRequest(
    @NotNull(message = "Payroll run ID is required")
    UUID payrollRunId,

    @NotBlank(message = "Bank code is required (e.g. BCA, MANDIRI, BRI, BNI, GENERIC)")
    String bankCode
) {}
