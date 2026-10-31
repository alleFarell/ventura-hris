package com.ventura.hris.security.dto;

import com.ventura.hris.security.entity.Role;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record RoleResponse(
        UUID id,
        String code,
        String name,
        String description,
        Instant createdAt,
        Instant updatedAt,
        Set<PermissionResponse> permissions
) {
    public static RoleResponse fromEntity(Role role) {
        Set<PermissionResponse> perms = role.getPermissions() != null
                ? role.getPermissions().stream().map(PermissionResponse::fromEntity).collect(Collectors.toSet())
                : Set.of();

        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                role.getCreatedAt(),
                role.getUpdatedAt(),
                perms
        );
    }
}
