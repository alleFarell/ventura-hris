package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BenefitPlanResponse(
    UUID id,
    String code,
    String name,
    String category,
    BigDecimal annualLimit,
    String description,
    Boolean isActive,
    Instant createdAt
) {}
