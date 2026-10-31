package com.ventura.hris.security.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateUserRolesRequest(
        @NotEmpty(message = "At least one role code must be provided")
        Set<String> roleCodes
) {
}
