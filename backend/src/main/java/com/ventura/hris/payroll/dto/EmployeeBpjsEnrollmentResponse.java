package com.ventura.hris.payroll.dto;

import java.time.Instant;
import java.util.UUID;

public record EmployeeBpjsEnrollmentResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String bpjsKesNumber,
    String bpjsTkNumber,
    Integer jkkRiskGrade,
    Boolean isKesActive,
    Boolean isTkActive,
    Instant updatedAt
) {}
