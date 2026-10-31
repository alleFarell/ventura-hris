package com.ventura.hris.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserStatusRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "ACTIVE|SUSPENDED", message = "Status must be either ACTIVE or SUSPENDED")
        String status
) {
}
