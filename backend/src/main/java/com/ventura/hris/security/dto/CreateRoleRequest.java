package com.ventura.hris.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record CreateRoleRequest(
        @NotBlank(message = "Role code is required")
        @Size(max = 50, message = "Role code must not exceed 50 characters")
        String code,

        @NotBlank(message = "Role name is required")
        @Size(max = 100, message = "Role name must not exceed 100 characters")
        String name,

        String description,

        Set<UUID> permissionIds
) {
}
