package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateJobLevelRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull Integer sortOrder,
        String status
) {
}
