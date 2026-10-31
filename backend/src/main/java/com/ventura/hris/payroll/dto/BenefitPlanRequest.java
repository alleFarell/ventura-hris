package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BenefitPlanRequest(
    @NotBlank String code,
    @NotBlank String name,
    @NotBlank String category,
    @NotNull BigDecimal annualLimit,
    String description,
    Boolean isActive
) {}
