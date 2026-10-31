package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeBenefitClaimResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    UUID benefitPlanId,
    String benefitPlanCode,
    String benefitPlanName,
    String benefitPlanCategory,
    String claimNumber,
    LocalDate claimDate,
    BigDecimal amount,
    String description,
    String receiptUrl,
    String status,
    String reviewedBy,
    Instant reviewedAt,
    String rejectionReason,
    Instant createdAt
) {}
