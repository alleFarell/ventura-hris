package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record JobRequisitionRequest(
    @NotBlank String title,
    UUID departmentId,
    UUID positionId,
    @NotNull @Min(1) Integer headcount,
    String employmentType,
    BigDecimal minSalary,
    BigDecimal maxSalary,
    String justification,
    UUID requestedBy
) {}
