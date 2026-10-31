package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record JobOfferRequest(
    @NotNull UUID applicationId,
    @NotNull @DecimalMin("0.01") BigDecimal offeredSalary,
    BigDecimal allowanceAmount,
    @NotNull LocalDate joinDate,
    @NotNull LocalDate expirationDate,
    String letterUrl,
    String notes
) {}
