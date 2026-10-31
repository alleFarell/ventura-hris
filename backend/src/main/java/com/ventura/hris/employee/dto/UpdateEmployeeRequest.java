package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateEmployeeRequest(
        @NotNull UUID branchId,
        UUID departmentId,
        UUID divisionId,
        UUID positionId,
        UUID gradeId,
        UUID jobLevelId,
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Size(max = 150) String workEmail,
        LocalDate hireDate
) {
}
