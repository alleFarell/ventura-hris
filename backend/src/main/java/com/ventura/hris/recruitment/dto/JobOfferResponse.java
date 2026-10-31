package com.ventura.hris.recruitment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobOfferResponse(
    UUID id,
    UUID applicationId,
    String applicationNumber,
    String candidateName,
    String candidateEmail,
    String jobTitle,
    String offerNumber,
    BigDecimal offeredSalary,
    BigDecimal allowanceAmount,
    LocalDate joinDate,
    LocalDate expirationDate,
    String status,
    String letterUrl,
    String notes,
    Instant createdAt
) {}
