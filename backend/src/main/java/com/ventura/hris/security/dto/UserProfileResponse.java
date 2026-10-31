package com.ventura.hris.security.dto;

import java.util.List;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String username,
        String email,
        String fullName,
        String status,
        List<String> roles
) {
}
