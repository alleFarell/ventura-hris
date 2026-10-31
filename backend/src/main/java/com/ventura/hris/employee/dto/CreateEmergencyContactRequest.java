package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEmergencyContactRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 80) String relationship,
        @NotBlank @Size(max = 50) String phone,
        @Size(max = 150) String email,
        boolean primaryContact
) {
}
