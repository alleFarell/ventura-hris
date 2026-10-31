package com.ventura.hris.employee.dto;

import java.time.Instant;
import java.util.UUID;

public record EmergencyContactResponse(
        UUID id,
        UUID employeeId,
        String name,
        String relationship,
        String phone,
        String email,
        boolean primaryContact,
        Instant createdAt
) {
}
