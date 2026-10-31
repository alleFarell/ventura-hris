package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record EmployeeReimbursementResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    UUID payrollRunId,
    String claimNumber,
    String title,
    String claimType,
    BigDecimal amount,
    String receiptUrl,
    String status,
    String approvedBy,
    Instant approvedAt,
    Instant createdAt
) {}
