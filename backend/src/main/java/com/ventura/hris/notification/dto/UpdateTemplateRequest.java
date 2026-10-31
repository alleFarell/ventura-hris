package com.ventura.hris.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTemplateRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must not exceed 150 characters")
        String name,

        @NotBlank(message = "Channel is required")
        @Size(max = 20, message = "Channel must not exceed 20 characters")
        String channel,

        @NotBlank(message = "Subject template is required")
        @Size(max = 255, message = "Subject template must not exceed 255 characters")
        String subjectTemplate,

        @NotBlank(message = "Body template is required")
        String bodyTemplate
) {
}
