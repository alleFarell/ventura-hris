package com.ventura.hris.employee.dto;

import com.ventura.hris.employee.entity.ContractType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContractResponse(
        UUID id,
        UUID employeeId,
        ContractType contractType,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        UUID documentId,
        Instant createdAt,
        Long version
) {
}
