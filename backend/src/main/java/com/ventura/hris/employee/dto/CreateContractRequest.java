package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateContractRequest(
        @NotBlank String contractType,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        String status,
        UUID documentId
) {
}
