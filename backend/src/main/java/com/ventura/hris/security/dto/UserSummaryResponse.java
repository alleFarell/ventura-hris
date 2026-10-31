package com.ventura.hris.security.dto;

import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserSummaryResponse(
        UUID id,
        String username,
        String email,
        String fullName,
        String status,
        Instant createdAt,
        Set<String> roles
) {
    public UserSummaryResponse(UUID id, String username, String email, String fullName, java.util.List<String> roles) {
        this(id, username, email, fullName, "ACTIVE", Instant.now(), roles != null ? new java.util.HashSet<>(roles) : Set.of());
    }

    public static UserSummaryResponse fromEntity(User user) {
        Set<String> roleCodes = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getCode).collect(Collectors.toSet())
                : Set.of();

        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getStatus(),
                user.getCreatedAt(),
                roleCodes
        );
    }
}
