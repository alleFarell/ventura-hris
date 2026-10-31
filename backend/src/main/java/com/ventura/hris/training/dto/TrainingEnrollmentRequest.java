package com.ventura.hris.training.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TrainingEnrollmentRequest(
    @NotNull(message = "Session ID is required")
    UUID sessionId,

    @NotNull(message = "Employee ID is required")
    UUID employeeId,

    String status
) {}
