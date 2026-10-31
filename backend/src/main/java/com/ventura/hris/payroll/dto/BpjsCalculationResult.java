package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;

public record BpjsCalculationResult(
    String programType,
    BigDecimal basisWage,
    BigDecimal employerRate,
    BigDecimal employeeRate,
    BigDecimal employerAmount,
    BigDecimal employeeAmount,
    BigDecimal totalAmount
) {}
