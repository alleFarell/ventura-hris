package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ClockInRequest(
        @NotNull
        UUID employeeId,

        BigDecimal latitude,

        BigDecimal longitude,

        String ipAddress,

        String deviceInfo,

        String notes
) {}
