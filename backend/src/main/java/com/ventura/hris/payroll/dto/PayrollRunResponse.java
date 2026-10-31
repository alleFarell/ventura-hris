package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PayrollRunResponse(
    UUID id,
    UUID periodId,
    String periodCode,
    String periodName,
    String runNumber,
    LocalDate executionDate,
    BigDecimal totalGrossAmount,
    BigDecimal totalDeductionAmount,
    BigDecimal totalNetAmount,
    Integer totalEmployees,
    String status,
    String approvedBy,
    Instant approvedAt,
    Instant createdAt
) {}
