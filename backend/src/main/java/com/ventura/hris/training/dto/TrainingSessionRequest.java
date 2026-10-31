package com.ventura.hris.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record TrainingSessionRequest(
    @NotNull(message = "Course ID is required")
    UUID courseId,

    @NotBlank(message = "Session name is required")
    String sessionName,

    @NotNull(message = "Start time is required")
    Instant startTime,

    @NotNull(message = "End time is required")
    Instant endTime,

    String location,

    Integer capacity,

    String status,

    String instructorName
) {}
