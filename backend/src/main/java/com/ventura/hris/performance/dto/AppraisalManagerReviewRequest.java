package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AppraisalManagerReviewRequest(
    @NotNull @DecimalMin("1.00") @DecimalMax("5.00") BigDecimal managerScore,
    String managerComments
) {}
