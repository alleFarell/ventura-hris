package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeBenefitClaimRequest(
    @NotNull UUID employeeId,
    @NotNull UUID benefitPlanId,
    @NotNull LocalDate claimDate,
    @NotNull @DecimalMin(value = "0.01", message = "Claim amount must be greater than zero") BigDecimal amount,
    @NotBlank String description,
    String receiptUrl
) {}
