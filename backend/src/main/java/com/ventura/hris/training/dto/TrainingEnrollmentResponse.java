package com.ventura.hris.training.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TrainingEnrollmentResponse(
    UUID id,
    UUID sessionId,
    String sessionName,
    String courseTitle,
    UUID employeeId,
    String employeeName,
    String employeeNumber,
    String status,
    BigDecimal score,
    String certificateUrl,
    Instant createdAt,
    Instant updatedAt
) {}
