package com.ventura.hris.training.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeCertificationResponse(
    UUID id,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String certificationName,
    String issuingOrganization,
    String credentialId,
    LocalDate issueDate,
    LocalDate expirationDate,
    String verificationUrl,
    Boolean isExpired,
    Instant createdAt,
    Instant updatedAt
) {}
