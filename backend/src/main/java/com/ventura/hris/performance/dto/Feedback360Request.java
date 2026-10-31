package com.ventura.hris.performance.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record Feedback360Request(
    @NotNull UUID appraisalId,
    @NotNull UUID reviewerId,
    String relationship,
    Boolean isAnonymous
) {}
