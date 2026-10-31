package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record Feedback360SubmitRequest(
    @NotNull @DecimalMin("1.00") @DecimalMax("5.00") BigDecimal rating,
    String feedbackText
) {}
