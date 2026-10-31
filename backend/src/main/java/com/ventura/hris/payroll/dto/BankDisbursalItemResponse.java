package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BankDisbursalItemResponse(
    UUID id,
    UUID batchId,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String bankName,
    String accountNumber,
    String accountHolder,
    BigDecimal amount,
    String status,
    Instant createdAt
) {}
