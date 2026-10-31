package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PayslipResponse(
    UUID id,
    UUID payrollRunItemId,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String payslipNumber,
    String periodName,
    LocalDate issueDate,
    BigDecimal grossSalary,
    BigDecimal totalDeductions,
    BigDecimal netSalary,
    String payslipDataJson,
    Boolean isPublished,
    Instant createdAt
) {}
