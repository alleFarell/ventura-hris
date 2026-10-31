package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record KeyResultProgressUpdateRequest(
    @NotNull BigDecimal currentValue,
    String notes
) {}
