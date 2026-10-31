package com.ventura.hris.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDivisionRequest(
        @NotBlank @Size(max = 150) String name,
        String status
) {
}
