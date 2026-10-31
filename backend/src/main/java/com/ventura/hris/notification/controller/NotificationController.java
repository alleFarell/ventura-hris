package com.ventura.hris.notification.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.notification.dto.NotificationResponse;
import com.ventura.hris.notification.dto.TemplateResponse;
import com.ventura.hris.notification.dto.UnreadCountResponse;
import com.ventura.hris.notification.dto.UpdateTemplateRequest;
import com.ventura.hris.notification.service.NotificationService;
import com.ventura.hris.security.service.CustomUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

    private final NotificationService notificationService;
    private final com.ventura.hris.security.repository.UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            com.ventura.hris.security.repository.UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // ==================== IN-APP NOTIFICATIONS ====================

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        UUID userId = getCurrentUserId();
        List<NotificationResponse> list = notificationService.getUserNotifications(userId, page, Math.min(size, 50));
        return ResponseEntity.ok(ApiResponse.success(list, "Notifications retrieved successfully"));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount() {
        UUID userId = getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(new UnreadCountResponse(count), "Unread count retrieved"));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") UUID id) {
        UUID userId = getCurrentUserId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        UUID userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    // ==================== NOTIFICATION TEMPLATES ====================

    @GetMapping("/notification-templates")
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getTemplates() {
        List<TemplateResponse> templates = notificationService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success(templates, "Notification templates retrieved"));
    }

    @PutMapping("/notification-templates/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> updateTemplate(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateTemplateRequest request
    ) {
        TemplateResponse template = notificationService.updateTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success(template, "Notification template updated successfully"));
    }

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserPrincipal principal) {
            return principal.getId();
        }
        if (auth != null && auth.getName() != null) {
            return userRepository.findByUsernameIgnoreCase(auth.getName())
                    .map(com.ventura.hris.security.entity.User::getId)
                    .orElseThrow(() -> new DomainException("UNAUTHORIZED", "User not found", HttpStatus.UNAUTHORIZED));
        }
        throw new DomainException("UNAUTHORIZED", "User is not authenticated", HttpStatus.UNAUTHORIZED);
    }
}
