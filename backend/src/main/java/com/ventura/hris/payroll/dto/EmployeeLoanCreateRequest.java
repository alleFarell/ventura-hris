package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeLoanCreateRequest(
    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1.00", message = "Loan amount must be at least 1.00")
    BigDecimal loanAmount,

    @NotNull(message = "Installment count is required")
    @Min(value = 1, message = "Installment count must be at least 1")
    Integer installmentCount,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    String reason
) {}
