package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EmployeeAppraisalRequest(
    @NotNull UUID cycleId,
    @NotNull UUID employeeId,
    UUID managerId
) {}
