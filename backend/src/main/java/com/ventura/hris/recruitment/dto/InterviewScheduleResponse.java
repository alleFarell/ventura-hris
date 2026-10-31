package com.ventura.hris.recruitment.dto;

import java.time.Instant;
import java.util.UUID;

public record InterviewScheduleResponse(
    UUID id,
    UUID applicationId,
    String applicationNumber,
    String candidateName,
    String jobTitle,
    String roundName,
    Instant scheduledTime,
    Integer durationMinutes,
    UUID interviewerId,
    String interviewerName,
    String locationUrl,
    String status,
    String notes,
    Instant createdAt
) {}
