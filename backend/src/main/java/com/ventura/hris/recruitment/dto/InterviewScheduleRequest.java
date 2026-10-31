package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record InterviewScheduleRequest(
    @NotNull UUID applicationId,
    @NotBlank String roundName,
    @NotNull Instant scheduledTime,
    Integer durationMinutes,
    UUID interviewerId,
    String locationUrl,
    String notes
) {}
