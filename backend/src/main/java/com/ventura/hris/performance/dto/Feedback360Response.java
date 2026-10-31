package com.ventura.hris.performance.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record Feedback360Response(
    UUID id,
    UUID appraisalId,
    UUID reviewerId,
    String reviewerName,
    String relationship,
    BigDecimal rating,
    String feedbackText,
    Boolean isAnonymous,
    String status,
    Instant createdAt
) {}
