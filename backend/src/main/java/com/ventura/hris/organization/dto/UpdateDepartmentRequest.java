package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 500) String description,
        String status
) {
}
