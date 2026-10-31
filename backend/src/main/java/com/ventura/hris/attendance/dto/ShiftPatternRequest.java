package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ShiftPatternRequest(
        @NotBlank
        @Size(max = 50)
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Code must be uppercase alphanumeric and underscores only")
        String code,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        @NotBlank
        @Size(max = 500)
        String patternSequence,

        @Min(1)
        Integer cycleDays,

        Boolean isActive
) {}
