package com.ventura.hris.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeCertificationRequest(
    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    @NotBlank(message = "Certification name is required")
    String certificationName,

    @NotBlank(message = "Issuing organization is required")
    String issuingOrganization,

    String credentialId,

    @NotNull(message = "Issue date is required")
    LocalDate issueDate,

    LocalDate expirationDate,

    String verificationUrl
) {}
