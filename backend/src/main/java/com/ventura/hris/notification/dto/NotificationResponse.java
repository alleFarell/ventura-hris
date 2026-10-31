package com.ventura.hris.notification.dto;

import com.ventura.hris.notification.entity.Notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        String category,
        boolean isRead,
        Instant readAt,
        Instant createdAt
) {
    public static NotificationResponse fromEntity(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getMessage(),
                n.getCategory(),
                n.isRead(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
