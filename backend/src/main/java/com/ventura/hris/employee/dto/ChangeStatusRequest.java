package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ChangeStatusRequest(
        @NotBlank String newStatus,
        @NotNull LocalDate effectiveDate,
        @Size(max = 500) String reason
) {
}
