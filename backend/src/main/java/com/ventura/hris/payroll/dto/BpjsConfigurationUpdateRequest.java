package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BpjsConfigurationUpdateRequest(
    @NotNull BigDecimal employerRate,
    @NotNull BigDecimal employeeRate,
    BigDecimal wageCeiling,
    BigDecimal wageFloor,
    String description,
    Boolean isActive
) {}
