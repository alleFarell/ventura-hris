package com.ventura.hris.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record BenefitClaimStatusUpdateRequest(
    @NotBlank String status,
    UUID reviewerId,
    String rejectionReason
) {}
