package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record AssignRosterRequest(
        @NotNull
        UUID employeeId,

        UUID shiftId,

        @NotNull
        LocalDate shiftDate,

        Boolean isDayOff,

        String overrideReason
) {}
