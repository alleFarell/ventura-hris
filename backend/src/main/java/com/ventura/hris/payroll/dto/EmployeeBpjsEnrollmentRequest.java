package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EmployeeBpjsEnrollmentRequest(
    @NotNull UUID employeeId,
    String bpjsKesNumber,
    String bpjsTkNumber,
    Integer jkkRiskGrade,
    Boolean isKesActive,
    Boolean isTkActive
) {}
