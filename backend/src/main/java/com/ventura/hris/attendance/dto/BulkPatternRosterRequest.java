package com.ventura.hris.attendance.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BulkPatternRosterRequest(
        @NotEmpty
        List<UUID> employeeIds,

        @NotNull
        UUID patternId,

        @NotNull
        LocalDate startDate,

        @NotNull
        LocalDate endDate
) {}
