package com.ventura.hris.recruitment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record JobRequisitionResponse(
    UUID id,
    String requisitionNumber,
    String title,
    UUID departmentId,
    String departmentName,
    UUID positionId,
    String positionTitle,
    Integer headcount,
    String employmentType,
    BigDecimal minSalary,
    BigDecimal maxSalary,
    String justification,
    String status,
    UUID requestedById,
    String requestedByName,
    UUID approvedById,
    String approvedByName,
    Instant approvedAt,
    Instant createdAt
) {}
