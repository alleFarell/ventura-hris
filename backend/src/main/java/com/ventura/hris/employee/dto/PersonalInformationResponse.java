package com.ventura.hris.employee.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PersonalInformationResponse(
        UUID id,
        UUID employeeId,
        LocalDate birthDate,
        String birthPlace,
        String gender,
        String maritalStatus,
        String nationality,
        String identityNumber,
        String taxNumber,
        String personalEmail,
        String personalPhone,
        String address,
        Instant updatedAt
) {
}
