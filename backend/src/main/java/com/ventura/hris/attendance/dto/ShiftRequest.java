package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record ShiftRequest(
        @NotBlank
        @Size(max = 50)
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Code must be uppercase alphanumeric and underscores only")
        String code,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        @NotNull
        LocalTime startTime,

        @NotNull
        LocalTime endTime,

        Integer breakMinutes,

        Integer gracePeriodMinutes,

        Boolean isOvernight,

        Boolean isActive
) {}
