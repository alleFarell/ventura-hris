package com.ventura.hris.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateDocumentRequest(
        @NotBlank @Size(max = 80) String documentType,
        @NotBlank @Size(max = 255) String fileName,
        @Size(max = 500) String storageReference,
        String accessClassification,
        String retentionCategory,
        LocalDate expiresAt,
        String status
) {
}
