package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record EmployeeReimbursementCreateRequest(
    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Claim type is required")
    String claimType,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount,

    String receiptUrl
) {}
