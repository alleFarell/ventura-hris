package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PersonalInformationRequest(
        LocalDate birthDate,
        @Size(max = 100) String birthPlace,
        @Size(max = 30) String gender,
        @Size(max = 30) String maritalStatus,
        @Size(max = 80) String nationality,
        @Size(max = 100) String identityNumber,
        @Size(max = 100) String taxNumber,
        @Size(max = 150) String personalEmail,
        @Size(max = 50) String personalPhone,
        String address
) {
}
