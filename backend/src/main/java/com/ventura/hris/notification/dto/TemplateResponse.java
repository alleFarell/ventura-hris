package com.ventura.hris.notification.dto;

import com.ventura.hris.notification.entity.NotificationTemplate;

import java.time.Instant;
import java.util.UUID;

public record TemplateResponse(
        UUID id,
        String templateCode,
        String name,
        String channel,
        String subjectTemplate,
        String bodyTemplate,
        Instant createdAt,
        Instant updatedAt
) {
    public static TemplateResponse fromEntity(NotificationTemplate t) {
        return new TemplateResponse(
                t.getId(),
                t.getTemplateCode(),
                t.getName(),
                t.getChannel(),
                t.getSubjectTemplate(),
                t.getBodyTemplate(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
