package com.ventura.hris.security.dto;

import com.ventura.hris.security.entity.Permission;

import java.time.Instant;
import java.util.UUID;

public record PermissionResponse(
        UUID id,
        String code,
        String name,
        String category,
        String description,
        Instant createdAt
) {
    public static PermissionResponse fromEntity(Permission p) {
        return new PermissionResponse(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getCategory(),
                p.getDescription(),
                p.getCreatedAt()
        );
    }
}
