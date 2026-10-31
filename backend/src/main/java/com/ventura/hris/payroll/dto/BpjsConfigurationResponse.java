package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BpjsConfigurationResponse(
    UUID id,
    String programType,
    BigDecimal employerRate,
    BigDecimal employeeRate,
    BigDecimal wageCeiling,
    BigDecimal wageFloor,
    String description,
    Boolean isActive,
    Instant updatedAt
) {}
