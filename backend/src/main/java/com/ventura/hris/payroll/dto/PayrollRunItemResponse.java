package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PayrollRunItemResponse(
    UUID id,
    UUID payrollRunId,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    BigDecimal basicSalary,
    BigDecimal proratedAmount,
    BigDecimal allowancesAmount,
    BigDecimal overtimeAmount,
    BigDecimal reimbursementAmount,
    BigDecimal attendanceDeductionAmount,
    BigDecimal loanDeductionAmount,
    BigDecimal taxAmount,
    BigDecimal netSalary,
    String lineItemsJson,
    Instant createdAt
) {}
