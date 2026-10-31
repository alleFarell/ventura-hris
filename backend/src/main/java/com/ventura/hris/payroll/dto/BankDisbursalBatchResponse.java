package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BankDisbursalBatchResponse(
    UUID id,
    UUID payrollRunId,
    String runNumber,
    String batchNumber,
    String bankCode,
    BigDecimal totalAmount,
    Integer totalRecords,
    String status,
    String fileContent,
    Instant generatedAt,
    Instant createdAt
) {}
