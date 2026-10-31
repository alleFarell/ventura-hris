package com.ventura.hris.employee.dto;

import com.ventura.hris.employee.entity.EmploymentStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeSummaryResponse(
        UUID id,
        UUID companyId,
        String companyName,
        UUID branchId,
        String branchName,
        UUID departmentId,
        String departmentName,
        UUID divisionId,
        String divisionName,
        UUID positionId,
        String positionName,
        UUID gradeId,
        String gradeName,
        UUID jobLevelId,
        String jobLevelName,
        String employeeNumber,
        String firstName,
        String lastName,
        String fullName,
        String workEmail,
        EmploymentStatus employmentStatus,
        LocalDate hireDate,
        LocalDate terminationDate,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {
}
