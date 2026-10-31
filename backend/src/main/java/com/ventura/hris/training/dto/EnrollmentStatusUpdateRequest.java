package com.ventura.hris.training.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record EnrollmentStatusUpdateRequest(
    @NotBlank(message = "Status is required")
    String status,

    BigDecimal score,

    String certificateUrl
) {}
