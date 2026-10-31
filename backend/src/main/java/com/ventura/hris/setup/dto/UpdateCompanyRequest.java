package com.ventura.hris.setup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCompanyRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 200) String legalName,
        @Size(max = 80) String taxIdentifier,
        @NotBlank @Size(max = 20) String defaultLocale,
        @NotBlank @Size(max = 80) String defaultTimezone,
        @NotBlank @Pattern(regexp = "^[A-Za-z]{3}$") String defaultCurrency,
        @NotBlank @Size(max = 30) String defaultDateFormat,
        String status
) {
}
