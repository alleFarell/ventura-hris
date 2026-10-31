package com.ventura.hris.offboarding.dto;

import jakarta.validation.constraints.NotBlank;

public record ChecklistClearRequest(
    @NotBlank(message = "Cleared by officer name/email is required")
    String clearedBy,

    String notes
) {}
