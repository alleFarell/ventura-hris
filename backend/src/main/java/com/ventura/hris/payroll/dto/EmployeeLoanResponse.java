package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeLoanResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String loanNumber,
    BigDecimal loanAmount,
    Integer installmentCount,
    BigDecimal monthlyInstallment,
    BigDecimal remainingBalance,
    LocalDate startDate,
    String status,
    String reason,
    Instant createdAt
) {}
