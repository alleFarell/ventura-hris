package com.ventura.hris.training.dto;

import java.time.Instant;
import java.util.UUID;

public record TrainingSessionResponse(
    UUID id,
    UUID courseId,
    String courseCode,
    String courseTitle,
    String sessionName,
    Instant startTime,
    Instant endTime,
    String location,
    Integer capacity,
    Long enrolledCount,
    String status,
    String instructorName,
    Instant createdAt,
    Instant updatedAt
) {}
