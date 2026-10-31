package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CompanyHolidayRequest(
        @NotNull
        LocalDate holidayDate,

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 255)
        String description,

        UUID companyId,

        UUID branchId,

        Boolean isMandatory
) {}
