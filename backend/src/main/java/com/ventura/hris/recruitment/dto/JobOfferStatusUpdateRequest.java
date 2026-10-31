package com.ventura.hris.recruitment.dto;

import jakarta.validation.constraints.NotBlank;

public record JobOfferStatusUpdateRequest(
    @NotBlank String status,
    String notes
) {}
