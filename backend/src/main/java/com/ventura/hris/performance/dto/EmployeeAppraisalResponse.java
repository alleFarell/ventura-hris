package com.ventura.hris.performance.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record EmployeeAppraisalResponse(
    UUID id,
    UUID cycleId,
    String cycleName,
    UUID employeeId,
    String employeeNumber,
    String employeeName,
    UUID managerId,
    String managerName,
    BigDecimal selfScore,
    BigDecimal managerScore,
    BigDecimal finalScore,
    String performanceGrade,
    String status,
    String selfComments,
    String managerComments,
    Instant createdAt
) {}
