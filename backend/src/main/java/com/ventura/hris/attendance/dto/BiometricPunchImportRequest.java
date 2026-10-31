package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public record BiometricPunchImportRequest(
        @NotBlank
        String deviceCode,

        @NotEmpty
        List<BiometricPunchItem> punches
) {
    public record BiometricPunchItem(
            @NotBlank
            String employeeNumber,

            @NotNull
            Instant punchTime,

            @NotBlank
            String punchType // CLOCK_IN, CLOCK_OUT
    ) {}
}
