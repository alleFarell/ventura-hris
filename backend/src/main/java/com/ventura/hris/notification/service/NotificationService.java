package com.ventura.hris.notification.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.notification.dto.NotificationResponse;
import com.ventura.hris.notification.dto.TemplateResponse;
import com.ventura.hris.notification.dto.UpdateTemplateRequest;
import com.ventura.hris.notification.entity.Notification;
import com.ventura.hris.notification.entity.NotificationTemplate;
import com.ventura.hris.notification.repository.NotificationRepository;
import com.ventura.hris.notification.repository.NotificationTemplateRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;

    public NotificationService(NotificationRepository notificationRepository, NotificationTemplateRepository templateRepository) {
        this.notificationRepository = notificationRepository;
        this.templateRepository = templateRepository;
    }

    @Transactional
    public Notification createNotification(UUID userId, String title, String message, String category) {
        Notification notification = new Notification(userId, title, message, category);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getUserId().equals(userId) && !notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId, Instant.now());
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> getAllTemplates() {
        return templateRepository.findAllByOrderByTemplateCodeAsc()
                .stream()
                .map(TemplateResponse::fromEntity)
                .toList();
    }

    @Transactional
    public TemplateResponse updateTemplate(UUID id, UpdateTemplateRequest request) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setName(request.name().trim());
        template.setChannel(request.channel().trim());
        template.setSubjectTemplate(request.subjectTemplate().trim());
        template.setBodyTemplate(request.bodyTemplate().trim());
        template.setUpdatedAt(Instant.now());

        return TemplateResponse.fromEntity(templateRepository.save(template));
    }
}
