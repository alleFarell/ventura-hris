package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdatePositionRequest(
        UUID departmentId,
        UUID divisionId,
        UUID gradeId,
        UUID jobLevelId,
        @NotBlank @Size(max = 150) String name,
        String status
) {
}
